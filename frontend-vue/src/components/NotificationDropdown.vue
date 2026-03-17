<template>
    <div class="notification-dropdown">
        <div class="dropdown-header">
            <h3>최근 사고 목록 (t_ride)</h3>
            <router-link to="/info" @click="$emit('close')">전체 운행 보기</router-link>
        </div>

        <ul class="dropdown-list" v-if="!store.isLoading && store.accidentRides.length > 0">
            <li v-for="item in store.accidentRides" :key="item.id" class="dropdown-item">
                <div class="item-icon">🚨</div>
                <div class="item-content">
                    <div class="item-title">{{ item.title }}</div>
                    <div class="item-message">{{ item.message }}</div>
                    <div class="item-time">종료 시간: {{ item.time }}</div>
                </div>
            </li>
        </ul>
        <div v-else-if="store.isLoading" class="dropdown-empty">불러오는 중...</div>
        <div v-else class="dropdown-empty">최근 종료된 사고 이력이 없습니다.</div>
    </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notification.store.js';

// Pinia 스토어 인스턴스
const store = useNotificationStore();
defineEmits(['close']);
</script>

<style scoped src="@/assets/styles/components/NotificationDropdown.css"></style>
