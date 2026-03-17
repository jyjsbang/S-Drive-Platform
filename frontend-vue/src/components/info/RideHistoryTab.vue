<template>
    <div class="tab-container">
        <div class="filter-form">
            <div class="filter-grid">
                <div>
                    <label class="info-label">시작일</label>
                    <InfoInput type="date" v-model="startDate" />
                </div>
                <div>
                    <label class="info-label">종료일</label>
                    <InfoInput type="date" v-model="endDate" />
                </div>
                <div>
                    <label class="info-label">사용자 ID</label>
                    <InfoInput placeholder="사용자 ID 입력" v-model="userId" />
                </div>
                <div>
                    <label class="info-label">PM ID (기기 번호)</label>
                    <InfoInput placeholder="PM ID 입력" v-model="deviceId" />
                </div>
            </div>
            <InfoButton variant="default" style="width: 100%" @click="fetchRides(1)">
                <template #icon><v-icon name="bi-search" class="icon" /></template>
                검색
            </InfoButton>
        </div>

        <div class="info-table-wrapper">
            <table class="info-table">
                <thead class="info-table-header">
                    <tr>
                        <th class="info-table-head">운행일</th>
                        <th class="info-table-head">사용자 ID</th>
                        <th class="info-table-head">PM ID</th>
                        <th class="info-table-head">시작 시간</th>
                        <th class="info-table-head">종료 시간</th>
                        <th class="info-table-head">안전 점수</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr v-if="isLoading">
                        <td colspan="6" class="info-table-cell" style="text-align: center; height: 100px">
                            운행 기록을 불러오는 중입니다...
                        </td>
                    </tr>
                    <tr v-else-if="rides.length === 0">
                        <td colspan="6" class="info-table-cell" style="text-align: center; height: 100px">
                            조회된 운행 기록이 없습니다.
                        </td>
                    </tr>
                    <tr
                        v-for="(ride, idx) in rides"
                        :key="idx"
                        class="info-table-row clickable"
                        @click="openRideDetail(ride)"
                    >
                        <td class="info-table-cell">{{ ride.date }}</td>
                        <td class="info-table-cell">{{ ride.userId }}</td>
                        <td class="info-table-cell">{{ ride.pmId }}</td>
                        <td class="info-table-cell">{{ ride.startTime }}</td>
                        <td class="info-table-cell">{{ ride.endTime }}</td>
                        <td class="info-table-cell">{{ ride.score }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-controls">
            <p>총 {{ totalRides }}개의 운행 기록</p>
            <div class="pagination-buttons">
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchRides(currentPage - 1)"
                    :disabled="currentPage === 1"
                    >이전</InfoButton
                >
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchRides(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    >다음</InfoButton
                >
            </div>
        </div>

        <InfoDialog :open="!!selectedRide" title="운행 상세 정보" @update:open="closeDialog">
            <div v-if="rideDetail">
                <div class="dialog-section">
                    <h3 class="dialog-section-title">운행 정보</h3>
                    <div class="info-grid">
                        <div>
                            <p>운행일</p>
                            <p>{{ rideDetail.date }}</p>
                        </div>
                        <div>
                            <p>사용자 ID</p>
                            <p>{{ rideDetail.userId }}</p>
                        </div>
                        <div>
                            <p>Ride ID</p>
                            <p>{{ rideDetail.deviceId }}</p>
                        </div>
                        <div>
                            <p>안전 점수</p>
                            <p>{{ rideDetail.score }}</p>
                        </div>
                        <div>
                            <p>출발 시간</p>
                            <p>{{ rideDetail.startTime }}</p>
                        </div>
                        <div>
                            <p>도착 시간</p>
                            <p>{{ rideDetail.endTime }}</p>
                        </div>
                        <div>
                            <p>헬멧 착용</p>
                            <p>{{ rideDetail.helmetOn ? '착용' : '미착용' }}</p>
                        </div>
                        <div>
                            <p>위험 행동 (총)</p>
                            <p>{{ rideDetail.abruptCount }}회</p>
                        </div>
                    </div>
                </div>

                <div class="dialog-section">
                    <div
                        style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 0.75rem;
                        "
                    >
                        <h3 class="dialog-section-title" style="margin-bottom: 0">위치 지도 (GPS 경로)</h3>
                        <InfoButton variant="outline" size="sm" @click="isMapModalOpen = true">
                            <template #icon><v-icon name="bi-arrows-fullscreen" /></template>
                            지도 확대
                        </InfoButton>
                    </div>

                    <div
                        id="ride-detail-map"
                        class="map-placeholder"
                        style="height: 16rem; text-align: left; padding: 0; overflow-y: hidden"
                    >
                        <div
                            v-if="rideDetail.pathLoading"
                            style="text-align: center; padding-top: 6rem; color: #6b7280"
                        >
                            GPS 경로를 불러오는 중입니다...
                        </div>
                        <div
                            v-else-if="!rideDetail.pathData || rideDetail.pathData.length < 2"
                            style="text-align: center; padding-top: 6rem; color: #6b7280"
                        >
                            <p>저장된 GPS 경로 데이터가 없습니다.</p>
                        </div>
                    </div>
                </div>

                <div class="dialog-section">
                    <h3 class="dialog-section-title">운행 중 이벤트 (위험 로그)</h3>
                    <div class="info-table-wrapper" style="max-height: 256px; overflow-y: auto">
                        <table class="info-table">
                            <thead class="info-table-header">
                                <tr>
                                    <th class="info-table-head">발생 시간 (Timestamp)</th>
                                    <th class="info-table-head">위험 항목명 (KPI)</th>
                                    <th class="info-table-head">위치 (Location)</th>
                                </tr>
                            </thead>
                            <tbody class="info-table-body">
                                <tr v-if="rideDetail.events.length === 0">
                                    <td colspan="3" class="info-table-cell" style="text-align: center">
                                        상세 GPS 데이터가 없습니다.
                                    </td>
                                </tr>
                                <tr v-for="(event, idx) in rideDetail.events" :key="idx" class="info-table-row">
                                    <td class="info-table-cell">{{ event.time }}</td>
                                    <td class="info-table-cell">{{ event.kpiName }}</td>
                                    <td class="info-table-cell">{{ event.locationString }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div v-else style="min-height: 300px; display: flex; align-items: center; justify-content: center">
                <p>운행 상세 정보를 불러오는 중입니다...</p>
            </div>
        </InfoDialog>

        <MapModal
            :open="isMapModalOpen"
            :pathData="rideDetail ? rideDetail.pathData : []"
            @close="isMapModalOpen = false"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import apiClient from '@/api/index.js';
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoDialog from '../ui/InfoDialog.vue';
import MapModal from '../MapModal.vue'; // (★신규★)

const startDate = ref('');
const endDate = ref('');
const userId = ref('');
const deviceId = ref('');
const isLoading = ref(true);

const rides = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalRides = ref(0);
const ridesPerPage = 10;

const selectedRide = ref(null);
const rideDetail = ref(null);
const mapInstance = ref(null);
const isMapModalOpen = ref(false); // (★신규★)

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) {
        return { date: 'N/A', time: 'N/A' };
    }
    try {
        const dateObj = new Date(dateTimeString);
        if (isNaN(dateObj.getTime())) {
            return { date: 'Invalid Date', time: 'Invalid Date' };
        }
        const date = dateObj.toISOString().split('T')[0];
        const time = dateObj.toTimeString().split(' ')[0];
        return { date, time };
    } catch (e) {
        return { date: 'N/A', time: 'N/A' };
    }
};

const fetchRides = async (page) => {
    if (page < 1 || (page > totalPages.value && totalRides.value > 0)) {
        return;
    }
    isLoading.value = true;
    try {
        currentPage.value = page;
        const params = {
            page: page,
            size: ridesPerPage,
            userId: userId.value || null,
            pmId: deviceId.value || null,
            startDate: startDate.value || null,
            endDate: endDate.value || null,
        };
        const response = await apiClient.get('/admin/rides', { params });
        totalRides.value = response.totalCount || 0;
        totalPages.value = Math.ceil(totalRides.value / ridesPerPage) || 1;
        rides.value = response.rides.map((ride) => {
            const startTime = formatDateTime(ride.startTime);
            const endTime = formatDateTime(ride.endTime);
            return {
                date: startTime.date,
                userId: ride.userId,
                deviceId: ride.rideId,
                pmId: ride.pmId,
                startTime: startTime.time,
                endTime: endTime.time,
                score: ride.safetyScore,
                helmetOn: ride.helmetOn,
            };
        });
    } catch (error) {
        console.error('과거 운행 목록 조회 실패:', error);
        rides.value = [];
        totalRides.value = 0;
        totalPages.value = 1;
    } finally {
        isLoading.value = false;
    }
};

const openRideDetail = async (ride) => {
    selectedRide.value = ride;
    mapInstance.value = null;
    isMapModalOpen.value = false; // (★추가★)

    rideDetail.value = {
        ...ride,
        events: [],
        pathData: [],
        pathLoading: true,
        abruptCount: 0,
    };

    try {
        // 1. 위험 로그 (Risks) API 호출
        const logResponse = await apiClient.get(`/admin/rides/${ride.deviceId}/risks`);
        const gpsEvents = logResponse.logs.map((log) => ({
            time: formatDateTime(log.timestamp).time,
            kpiName: log.kpiName,
            locationString: log.location ? `${log.location.lat.toFixed(5)}, ${log.location.lng.toFixed(5)}` : 'N/A',
        }));
        rideDetail.value.events = gpsEvents;
        rideDetail.value.abruptCount = logResponse.totalCount;
    } catch (error) {
        console.error('운행 상세 로그(Risks) 조회 실패:', error);
        rideDetail.value.events = [];
        alert('상세 운행 로그(Risks) 로딩에 실패했습니다.');
    }

    try {
        // 2. GPS 경로 (Path) API 호출
        const pathResponse = await apiClient.get(`/admin/rides/${ride.deviceId}/path`);
        rideDetail.value.pathData = pathResponse.pathData || [];
    } catch (error) {
        console.error('운행 상세 경로(Path) 조회 실패:', error);
        rideDetail.value.pathData = [];
    } finally {
        rideDetail.value.pathLoading = false;

        await nextTick();
        initDetailMap();
    }
};

/**
 * (★수정★)
 * 팝업 내부에 카카오 지도를 생성하고 Polyline을 그리는 함수
 * (rideDetail.value.pathData를 사용)
 */
const initDetailMap = () => {
    const mapContainer = document.getElementById('ride-detail-map');
    if (!rideDetail.value || !mapContainer || !window.kakao || !window.kakao.maps || rideDetail.value.pathLoading) {
        return;
    }

    if (!rideDetail.value.pathData || rideDetail.value.pathData.length < 2) {
        return;
    }

    const linePath = rideDetail.value.pathData.map(
        (point) => new window.kakao.maps.LatLng(point.location.lat, point.location.lng)
    );

    const mapOption = {
        center: linePath[0],
        level: 5,
        disableDefaultUI: true,
    };
    const map = new window.kakao.maps.Map(mapContainer, mapOption);
    mapInstance.value = map;

    const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#FF0000',
        strokeOpacity: 0.7,
        strokeStyle: 'solid',
    });
    polyline.setMap(map);

    const bounds = new window.kakao.maps.LatLngBounds();
    linePath.forEach((latlng) => bounds.extend(latlng));
    map.setBounds(bounds);

    new window.kakao.maps.Marker({
        map: map,
        position: linePath[0],
        title: '출발',
    });
    new window.kakao.maps.Marker({
        map: map,
        position: linePath[linePath.length - 1],
        title: '도착',
    });

    setTimeout(() => {
        if (map) {
            map.relayout();
            map.setBounds(bounds);
        }
    }, 350);
};

const closeDialog = () => {
    selectedRide.value = null;
    rideDetail.value = null;
    mapInstance.value = null;
    isMapModalOpen.value = false; // (★추가★)
};

onMounted(() => {
    fetchRides(1);
});
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
