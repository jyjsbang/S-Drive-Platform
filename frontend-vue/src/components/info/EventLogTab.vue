<template>
    <div class="tab-container">
        <div class="filter-form">
            <div class="filter-grid-3-col">
                <div>
                    <label class="info-label">시작일</label>
                    <InfoInput type="date" v-model="startDate" />
                </div>
                <div>
                    <label class="info-label">종료일</label>
                    <InfoInput type="date" v-model="endDate" />
                </div>
                <div>
                    <InfoSelect label="알림 유형" v-model="eventType" :options="eventOptions" />
                </div>
            </div>
            <InfoButton variant="default" style="width: 100%" @click="fetchEvents(1)">
                <template #icon><v-icon name="bi-search" class="icon" /></template>
                검색
            </InfoButton>
        </div>

        <div class="info-table-wrapper">
            <table class="info-table">
                <thead class="info-table-header">
                    <tr>
                        <th class="info-table-head">발생 시간</th>
                        <th class="info-table-head">알림 유형</th>
                        <th class="info-table-head">상세 내용</th>
                        <th class="info-table-head">관련 사용자 ID</th>
                        <th class="info-table-head">관련 기기 번호</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr v-if="isLoading">
                        <td colspan="5" class="info-table-cell" style="text-align: center; height: 100px">
                            이벤트 로그를 불러오는 중입니다...
                        </td>
                    </tr>
                    <tr v-else-if="logs.length === 0">
                        <td colspan="5" class="info-table-cell" style="text-align: center; height: 100px">
                            조회된 이벤트 로그가 없습니다.
                        </td>
                    </tr>
                    <tr v-else v-for="(log, idx) in logs" :key="idx" class="info-table-row">
                        <td class="info-table-cell">{{ log.time }}</td>
                        <td class="info-table-cell">
                            <InfoBadge :variant="getEventTypeVariant(log.type)">{{ log.type }}</InfoBadge>
                        </td>
                        <td class="info-table-cell">{{ log.detail }}</td>
                        <td class="info-table-cell">{{ log.userId }}</td>
                        <td class="info-table-cell">{{ log.deviceId }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-controls">
            <p>총 {{ totalLogs }}개의 이벤트 로그</p>
            <div class="pagination-buttons">
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchEvents(currentPage - 1)"
                    :disabled="currentPage === 1"
                    >이전</InfoButton
                >
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchEvents(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    >다음</InfoButton
                >
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// (★수정★) apiClient와 컴포넌트 import 경로 수정
import apiClient from '@/api/index.js';
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoBadge from '../ui/InfoBadge.vue';
// (★수정★) InfoDialog는 이 탭에서 사용하지 않으므로 import 제거
// import InfoDialog from '../ui/InfoDialog.vue';
import InfoSelect from '../ui/InfoSelect.vue'; // (★추가★) InfoSelect import

// --- 검색 필터 ---
const startDate = ref('');
const endDate = ref('');
const eventType = ref('전체');

const eventOptions = [
    { value: '전체', label: '전체' },
    { value: '사고', label: '사고' }, // (API 명세서에 따름)
    { value: '위험 행동', label: '위험 행동' }, // (API 명세서에 따름)
    { value: '기기 고장', label: '기기 고장' }, // (API 명세서에 따름)
    { value: '시스템', label: '시스템' }, // (API 명세서에 따름)
];

// --- 목록 데이터 ---
const isLoading = ref(true); // (★추가★)
const logs = ref([]); // 테이블에 표시될 목록
const currentPage = ref(1);
const totalPages = ref(1);
const totalLogs = ref(0);
const logsPerPage = 10;

// (★제거★) Mock 데이터 제거
// const mockEventLogs = [ ... ];

// (★신규★) 날짜 포맷팅 헬퍼 (RideHistoryTab에서 가져옴)
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
        const dateObj = new Date(dateTimeString);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        // 'YYYY-MM-DD HH:MM:SS' 형식으로 반환
        const date = dateObj.toISOString().split('T')[0];
        const time = dateObj.toTimeString().split(' ')[0];
        return `${date} ${time}`;
    } catch (e) {
        return 'N/A';
    }
};

/**
 * (★수정★)
 * Mock 데이터 대신 API 명세서 7번 'GET /api/admin/events'를 호출합니다.
 */
const fetchEvents = async (page) => {
    if (page < 1 || (page > totalPages.value && totalLogs.value > 0)) {
        return;
    }

    isLoading.value = true;
    currentPage.value = page;

    try {
        const params = {
            page: page,
            size: logsPerPage,
            startDate: startDate.value || null,
            endDate: endDate.value || null,
            eventType: eventType.value === '전체' ? null : eventType.value,
        };

        // (★수정★) API 호출
        const response = await apiClient.get('/admin/events', { params });

        totalLogs.value = response.totalCount || 0;
        totalPages.value = Math.ceil(totalLogs.value / logsPerPage) || 1;

        // (★수정★) API 응답 매핑
        logs.value = response.logs.map((log) => ({
            time: formatDateTime(log.timestamp),
            type: log.type,
            detail: log.detail,
            userId: log.relatedUserId || '-', // API 명세서 필드(relatedUserId)
            deviceId: log.relatedPmId || '-', // API 명세서 필드(relatedPmId)
        }));
    } catch (error) {
        console.error('이벤트 로그 조회 실패:', error);
        logs.value = [];
        totalLogs.value = 0;
        totalPages.value = 1;
    } finally {
        isLoading.value = false;
    }
};

// (기존) 이벤트 유형에 따른 뱃지 색상
const getEventTypeVariant = (type) => {
    switch (type) {
        case '사고':
            return 'destructive';
        case '위험 행동':
            return 'default';
        case '기기 고장':
            return 'secondary';
        case '시스템': // (API 명세서에 맞게 '날씨' -> '시스템' 또는 'outline' 타입 추가)
            return 'outline';
        default:
            return 'default';
    }
};

// 컴포넌트가 마운트될 때 첫 페이지 조회
onMounted(() => {
    fetchEvents(1);
});
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
