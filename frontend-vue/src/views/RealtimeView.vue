<template>
    <div class="realtime-container">
        <div class="map-wrapper">
            <RealtimeMap ref="realtimeMapRef" :districts="districts" :kickboards="allKickboards" />
        </div>

        <UserList
            :users="activeRides"
            :class="['user-list-panel', { closed: !isListOpen }]"
            @dismiss-accident="handleDismissAccident"
            @focus-ride="handleFocusRide"
        />

        <button
            :class="['list-toggle-button', { 'list-open': isListOpen }]"
            @click="isListOpen = !isListOpen"
            title="목록 열기/닫기"
        >
            <v-icon name="bi-list" scale="1.5" />
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import apiClient from '@/api/index.js';
import UserList from '@/components/UserList.vue';
import RealtimeMap from '@/components/RealtimeMap.vue';
import { useNotificationStore } from '@/stores/notification.store.js';
import { useToast } from 'vue-toastification'; // Toast 라이브러리

const realtimeMapRef = ref(null);
const activeRides = ref([]);
const allKickboards = ref([]);
const districts = ref({});
const isListOpen = ref(true);
const timer = ref(null);

// (★중요★) 로컬 변수 alertedAccidentIds 삭제됨 -> Store 사용
const notificationStore = useNotificationStore();
const toast = useToast();

const dismissedAccidentRideIds = ref(new Set());
const STORAGE_KEY = 'dismissed_accident_ids';

const handleFocusRide = (pmId) => {
    if (realtimeMapRef.value) {
        realtimeMapRef.value.focusKickboard(pmId);
    }
};

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

const handleDismissAccident = (rideId) => {
    dismissedAccidentRideIds.value.add(rideId);
    const idArray = Array.from(dismissedAccidentRideIds.value);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(idArray));
    activeRides.value = activeRides.value.filter((ride) => ride.rideId !== rideId);
    notificationStore.dismissNotification(rideId);
};

const fetchAllData = async () => {
    try {
        const [activeResponse, completedAccidentResponse, kickboardResponse] = await Promise.all([
            apiClient.get('/admin/rides/active'),
            apiClient.get('/admin/rides/recent-accidents'),
            apiClient.get('/admin/kickboards'),
        ]);

        const mappedKickboards = kickboardResponse.kickboards.map((kb) => ({
            id: kb.pm_id,
            status: kb.pm_status,
            lat: kb.location?.lat || 35.8244,
            lng: kb.location?.lng || 128.738,
        }));
        allKickboards.value = mappedKickboards;

        const mappedActiveRides = activeResponse.kickboards.map((ride) => ({
            id: ride.userId,
            rideId: ride.rideId,
            pmId: ride.pmId,
            startTime: formatDateTime(ride.startTime).time,
            elapsedTimeBase: ride.startTime,
            isCompleted: false,
            accident: ride.accident || false,
            score: ride.safetyScore,
        }));

        const mappedCompletedAccidents = completedAccidentResponse.kickboards.map((ride) => ({
            id: ride.userId,
            rideId: ride.rideId,
            pmId: ride.pmId,
            startTime: formatDateTime(ride.startTime).time,
            elapsedTimeBase: ride.startTime,
            isCompleted: true,
            accident: ride.accident || false,
            score: ride.safetyScore,
        }));

        const allRidesMap = new Map();
        mappedCompletedAccidents.forEach((ride) => {
            allRidesMap.set(ride.rideId, ride);
        });
        mappedActiveRides.forEach((ride) => {
            allRidesMap.set(ride.rideId, ride);
        });

        // (★수정★) Store를 통해 중복 알림 방지
        for (const ride of allRidesMap.values()) {
            if (
                ride.accident &&
                !notificationStore.hasAlerted(ride.rideId) && // <-- Store 확인
                !dismissedAccidentRideIds.value.has(ride.rideId)
            ) {
                // 토스트 알림 표시
                toast.error(`🚨 사고 발생!\n사용자: ${ride.id}\nPM: ${ride.pmId}`, {
                    timeout: 10000,
                    closeOnClick: false,
                    pauseOnHover: true,
                });

                // Store에 '알림 보냄' 기록
                notificationStore.markAsAlerted(ride.rideId);
                notificationStore.fetchNotifications();
            }
        }

        const allRidesList = Array.from(allRidesMap.values());
        const filteredList = allRidesList.filter((ride) => !dismissedAccidentRideIds.value.has(ride.rideId));

        activeRides.value = filteredList.sort((a, b) => {
            if (a.accident && !b.accident) return -1;
            if (!a.accident && b.accident) return 1;
            return 0;
        });
    } catch (error) {
        console.error('실시간 데이터 로딩 실패:', error);
        activeRides.value = activeRides.value.filter((ride) => !dismissedAccidentRideIds.value.has(ride.rideId));
        allKickboards.value = [];
    }
};

onMounted(() => {
    const storedIds = sessionStorage.getItem(STORAGE_KEY);
    if (storedIds) {
        try {
            const idArray = JSON.parse(storedIds);
            dismissedAccidentRideIds.value = new Set(idArray);
        } catch (e) {
            console.error('Failed to parse dismissed IDs from sessionStorage', e);
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }

    fetchAllData();
    timer.value = setInterval(fetchAllData, 15000);
});

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
    }
});
</script>

<style scoped>
.realtime-container {
    position: relative;
    height: 100%;
    overflow: hidden;
    padding: 0;
}
.map-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.user-list-panel {
    position: absolute;
    top: 24px;
    left: 24px;
    bottom: 24px;
    width: 380px;
    z-index: 10;
    transform: translateX(0);
    transition: transform 0.3s ease-in-out;
}
.user-list-panel.closed {
    transform: translateX(calc(-100% - 24px));
}
.list-toggle-button {
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 20;
    width: 44px;
    height: 44px;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #374151;
    transition: transform 0.3s ease-in-out;
}
.list-toggle-button.list-open {
    transform: translateX(calc(380px + 24px));
}
</style>
