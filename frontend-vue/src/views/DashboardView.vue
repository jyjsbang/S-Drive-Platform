<template>
    <div class="dashboard-container">
        <section class="kpi-grid">
            <KpiCard
                v-for="kpi in kpiData"
                :key="kpi.id"
                :cardId="kpi.id"
                :value="kpi.value"
                :label="kpi.label"
                :changeText="kpi.changeText"
            />
        </section>

        <section class="main-grid">
            <MapInfo :pm-data="pmData" :pm-stats="pmStats" />
        </section>

        <section class="bottom-grid">
            <div class="chart-section-card">
                <h3 class="section-title">법규 준수율</h3>

                <div class="chart-grid">
                    <ChartCard
                        :title="chartData.helmet.title"
                        :chartData="chartData.helmet.data"
                        v-if="chartData.helmet.data"
                    />
                    <ChartCard
                        :title="chartData.road.title"
                        :chartData="chartData.road.data"
                        :chartOptions="chartData.road.options"
                        v-if="chartData.road.data"
                    />
                </div>
            </div>

            <UserAnalysis />
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/index.js';
import KpiCard from '@/components/KpiCard.vue';
import MapInfo from '@/components/MapInfo.vue';
import ChartCard from '@/components/ChartCard.vue';
import UserAnalysis from '@/components/UserAnalysis.vue';

// 1. KPI 데이터 (초기값)
const kpiData = ref([
    { id: 1, value: '...', label: '누적 이용자 수', changeText: '로딩 중...' },
    { id: 2, value: '...', label: '발생 위험 행동 수', changeText: '로딩 중...' },
    { id: 3, value: '...', label: '안전모 착용률', changeText: '로딩 중...' },
    { id: 4, value: '...', label: '운행거리 합계', changeText: '로딩 중...' },
]);

// 2. (★수정★) 차트 데이터 (초기값을 null로 변경)
const chartData = ref({
    helmet: { title: '월별 평균 안전 점수', data: null },
    road: {
        title: '시간대별 총 위험 행동',
        data: null,
        // (★수정★) 'undefined' 범례 오류를 막기 위해 범례(legend)를 숨깁니다.
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, // 범례 숨기기
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                },
                y: {
                    beginAtZero: true,
                },
            },
            elements: {
                line: {
                    tension: 0.4,
                    backgroundColor: 'rgba(107, 114, 128, 0.1)', // 회색조
                    borderColor: '#6b7280', // 회색
                    fill: true,
                },
                point: {
                    radius: 0,
                },
            },
        },
    },
});

// 3. 지도 데이터 (API 연동)
const pmData = ref([]);
const pmStats = ref({ total: 0, running: 0, error: 0, available: 0 });

// --- API 호출 함수 ---

// 1. KPI 데이터 로드
const fetchKpiData = async () => {
    try {
        const stats = await apiClient.get('/admin/stats/kpis');
        if (stats) {
            kpiData.value = [
                { id: 1, value: `${stats.totalUserCount || 0}명`, label: '누적 이용자 수', changeText: '전체 기간' },
                {
                    id: 2,
                    value: `${stats.totalRiskCount || 0}건`,
                    label: '발생 위험 행동 수',
                    changeText: '전체 기간',
                },
                { id: 3, value: `${stats.helmetRate || 0}%`, label: '안전모 착용률', changeText: '평균' },
                { id: 4, value: `${stats.totalDistance || 0}km`, label: '운행거리 합계', changeText: '전체 기간' },
            ];
        }
    } catch (error) {
        console.error('KPI 데이터 로딩 실패:', error);
        kpiData.value = kpiData.value.map((k) => ({ ...k, value: '오류', changeText: '로드 실패' }));
    }
};

// 2. 차트 데이터 로드
const fetchChartData = async () => {
    try {
        // (1) '월별 평균 안전 점수' (LineChart)
        const scoreResponse = await apiClient.get('/admin/stats/monthly-safety-scores');

        if (scoreResponse && scoreResponse.labels && scoreResponse.data) {
            // (★수정★) data 객체를 직접 할당 (null.labels 오류 수정)
            chartData.value.helmet.data = {
                labels: scoreResponse.labels,
                datasets: [
                    {
                        label: '평균 안전 점수', // (범례용 레이블 추가)
                        data: scoreResponse.data,
                        // (LineChart.vue 기본 옵션 사용 - 파란색)
                    },
                ],
            };
        }

        // (2) '시간대별 총 위험 행동' (LineChart)
        const hourlyResponse = await apiClient.get('/admin/stats/hourly-risk');

        if (hourlyResponse && hourlyResponse.labels && hourlyResponse.data) {
            // (★수정★) data 객체를 직접 할당 (null.labels 오류 수정)
            chartData.value.road.data = {
                labels: hourlyResponse.labels,
                datasets: [
                    {
                        label: '총 위험 행동', // (★수정★) 'undefined' 오류 수정을 위해 레이블 추가
                        data: hourlyResponse.data,
                    },
                ],
            };
        }
    } catch (error) {
        console.error('차트 데이터 로딩 실패:', error);
        chartData.value.helmet.data = null;
        chartData.value.road.data = null;
    }
};

// (지도 관련 함수 - 기존과 동일)
const translateStatus = (pm_status, battery) => {
    if (pm_status === 'maintenance') return '고장';
    if (pm_status === 'in_use') return '운행중';
    return '대기';
};

const fetchMapData = async () => {
    try {
        const response = await apiClient.get('/admin/kickboards');
        let running = 0;
        let error = 0;
        let available = 0;

        const newPmData = response.kickboards.map((pm) => {
            const status = translateStatus(pm.pm_status, pm.battery);
            if (status === '운행중') running++;
            else if (status === '고장') error++;
            else if (status === '대기') available++;

            return {
                id: pm.pm_id,
                lat: pm.location.lat,
                lng: pm.location.lng,
                status: status,
            };
        });

        pmData.value = newPmData;
        pmStats.value = {
            total: response.totalCount || 0,
            running,
            error,
            available,
        };
    } catch (error) {
        console.error('지도 데이터 로딩 실패:', error);
        pmData.value = [];
        pmStats.value = { total: 0, running: 0, error: 0, available: 0 };
    }
};

onMounted(async () => {
    fetchKpiData();
    fetchChartData();
    fetchMapData();
});
</script>

<style scoped src="@/assets/styles/views/DashboardView.css"></style>
