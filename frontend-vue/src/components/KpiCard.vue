<template>
    <div :class="['kpi-card', `kpi-card-${cardId}`]">
        <div class="value">{{ value }}</div>
        <div class="label">{{ label }}</div>
        <div class="change-text">{{ changeText }}</div>
    </div>
</template>

<script setup>
defineProps({
    // (★추가★) DashboardView로부터 받을 ID
    cardId: {
        type: Number,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    changeText: {
        type: String,
        required: true,
    },
});
</script>

<style scoped src="@/assets/styles/components/KpiCard.css"></style>
