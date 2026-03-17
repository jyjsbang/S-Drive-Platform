<template>
    <Line :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Filler, // 선 그래프의 하단 영역을 채우기 위해 필요
} from 'chart.js';

// Chart.js에 필요한 기능들을 등록합니다.
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler);

// 부모 컴포넌트(ChartCard)로부터 차트 데이터를 props로 받습니다.
const props = defineProps({
    chartData: {
        type: Object,
        required: true,
    },
    chartOptions: {
        type: Object,
        // 옵션은 필수가 아니며, 없을 경우 기본값을 사용합니다.
        default: () => ({
            responsive: true, // 반응형
            maintainAspectRatio: false, // 부모 컨테이너 크기에 맞춤
            plugins: {
                legend: {
                    display: false, // 범례 숨기기
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false, // X축 그리드 숨기기
                    },
                },
                y: {
                    beginAtZero: true, // Y축 0부터 시작
                },
            },
            // 시안의 차트처럼 둥글고 부드럽게
            elements: {
                line: {
                    tension: 0.4, // 부드러운 곡선
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', // 선 아래 영역 색상
                    borderColor: '#3b82f6', // 선 색상
                    fill: true, // 영역 채우기
                },
                point: {
                    radius: 0, // 점 숨기기
                },
            },
        }),
    },
});
</script>
