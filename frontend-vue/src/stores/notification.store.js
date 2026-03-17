import { defineStore } from 'pinia';
import apiClient from '@/api/index.js';

const STORAGE_KEY = 'dismissed_accident_ids';

// 날짜 포맷팅 헬퍼
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
        const dateObj = new Date(dateTimeString);
        return dateObj.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return 'N/A';
    }
};

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        accidentRides: [],
        isLoading: false,
        totalCount: 0,
        // (★추가★) 이미 알림(토스트)을 띄운 사고 ID 목록을 전역 상태로 관리
        // 페이지를 이동해도 이 목록은 초기화되지 않습니다.
        alertedAccidentIds: new Set(),
    }),
    actions: {
        async fetchNotifications() {
            if (this.isLoading) return;
            this.isLoading = true;
            try {
                const response = await apiClient.get('/admin/rides/recent-accidents');

                const storedIds = sessionStorage.getItem(STORAGE_KEY);
                const dismissedIds = storedIds ? new Set(JSON.parse(storedIds)) : new Set();

                const allAccidents = response.kickboards || [];

                this.accidentRides = allAccidents
                    .filter((ride) => !dismissedIds.has(ride.rideId))
                    .map((ride) => ({
                        id: ride.rideId,
                        title: `[사고] 사용자 ${ride.userId || '?'}`,
                        message: `PM ${ride.pmId || '?'} (안전점수: ${ride.safetyScore})`,
                        time: formatDateTime(ride.endTime),
                        pmId: ride.pmId || 'N/A',
                    }));

                this.totalCount = this.accidentRides.length;
            } catch (error) {
                console.error('최근 사고(t_ride) 목록 조회 실패:', error);
                this.accidentRides = [];
                this.totalCount = 0;
            } finally {
                this.isLoading = false;
            }
        },

        dismissNotification(rideId) {
            this.accidentRides = this.accidentRides.filter((item) => item.id !== rideId);
            this.totalCount = this.accidentRides.length;
        },

        markAsRead() {
            this.totalCount = 0;
        },

        // (★추가★) 해당 사고 ID를 '알림 보냄' 상태로 등록
        markAsAlerted(rideId) {
            this.alertedAccidentIds.add(rideId);
        },

        // (★추가★) 해당 사고 ID가 이미 알림을 보냈는지 확인
        hasAlerted(rideId) {
            return this.alertedAccidentIds.has(rideId);
        },
    },
});
