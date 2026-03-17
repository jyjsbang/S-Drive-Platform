<template>
    <div class="alert-list-card">
        <h3 class="card-title">주요 알림 및 경고</h3>

        <ul class="alert-list" v-if="alerts && alerts.length > 0">
            <li v-for="alert in alerts" :key="alert.id" :class="['alert-item', alert.type]">
                <div class="alert-icon">{{ alert.icon }}</div>
                <div class="alert-content">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-message">{{ alert.message }}</div>
                </div>
            </li>
        </ul>
        <div v-else class="loading-text">알림을 불러오는 중입니다...</div>

        <div class="more-link">... 더보기</div>
    </div>
</template>

<script setup>
defineProps({
    alerts: {
        type: Array,
        default: () => [],
    },
});
</script>

<style scoped src="@/assets/styles/components/AlertList.css"></style>
