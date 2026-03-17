<template>
    <div class="stats-kpi-card">
        <div class="card-content">
            <span class="title">{{ title }}</span>
            <span class="value">{{ value }} {{ unit }}</span>
        </div>
        <div :class="['icon-wrapper', iconBgColor]">
            <v-icon :name="icon" class="icon" />
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: String,
    value: String,
    unit: String,
    icon: String,
    iconBgColor: String,
});
</script>

<style scoped src="@/assets/styles/components/StatsKpiCard.css"></style>
