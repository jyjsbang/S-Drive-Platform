<template>
    <header class="header">
        <div class="header-left">
            <h1 class="page-title">{{ pageTitle }}</h1>
            <span class="date-info">{{ currentDate }}</span>
        </div>

        <div class="header-right">
            <div class="notification-wrapper">
                <button class="icon-button" @click="toggleDropdown">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0v-.002z"
                        />
                    </svg>
                    <span v-if="notificationStore.totalCount > 0" class="notification-badge">
                        {{ notificationStore.totalCount }}
                    </span>
                </button>
                <NotificationDropdown v-if="isDropdownOpen" @close="isDropdownOpen = false" />
            </div>

            <router-link to="/profile" class="icon-button">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275"
                    />
                </svg>
            </router-link>

            <button class="icon-button" @click="openSettings">
                <v-icon name="bi-gear" />
            </button>
        </div>
    </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useNotificationStore } from '@/stores/notification.store.js';
import NotificationDropdown from './NotificationDropdown.vue';
import { useSettingsStore } from '@/stores/settings.store.js'; // (★)

const currentDate = ref('');
let intervalId = null;

const route = useRoute();
const pageTitle = computed(() => {
    switch (route.name) {
        case 'Dashboard':
            return '실시간 현황 분석';
        case 'Realtime':
            return '실시간 관제';
        case 'Info':
            return '정보 조회';
        case 'Stats':
            return '통계 분석';
        case 'MyProfile':
            return '내 정보 관리';
        default:
            return '관제 시스템';
    }
});

const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    currentDate.value = `${year}.${month}.${day} 기준`;
};

// --- (1) 알림 드롭다운 로직 (기존) ---
const notificationStore = useNotificationStore();
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
    if (isDropdownOpen.value) {
        notificationStore.markAsRead();
    }
};

// --- (2) 설정 모달 로직 (기존) ---
const settingsStore = useSettingsStore();
const openSettings = () => {
    settingsStore.openSettingsModal();
};

// (★) 외부 클릭 시 드롭다운 닫기 (기존)
const closeDropdownOnClickOutside = (event) => {
    // 알림 버튼 래퍼가 아니면
    if (!event.target.closest('.notification-wrapper')) {
        isDropdownOpen.value = false;
    }
};

onMounted(() => {
    getFormattedDate();
    intervalId = setInterval(getFormattedDate, 60000);

    notificationStore.fetchNotifications();
    document.addEventListener('click', closeDropdownOnClickOutside);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
    document.removeEventListener('click', closeDropdownOnClickOutside);
});
</script>

<style scoped src="@/assets/styles/components/Header.css"></style>
