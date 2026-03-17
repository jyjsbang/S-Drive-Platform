<template>
    <div class="chart-card">
        <h3 class="card-title">{{ title }}</h3>

        <div class="chart-placeholder">
            <LineChart v-if="chartData" :chartData="chartData" :chartOptions="chartOptions" />
            <div v-else class="chart-text">차트 데이터를 불러오는 중입니다...</div>
        </div>
    </div>
</template>

<script setup>
import LineChart from '@/components/charts/LineChart.vue';

defineProps({
    title: {
        type: String,
        required: true,
    },
    chartData: {
        type: Object,
        required: false, // (★수정★) 필수(required)가 아님
    },
    chartOptions: {
        type: Object,
        required: false,
    },
});
</script>

<style scoped src="@/assets/styles/components/ChartCard.css"></style>
