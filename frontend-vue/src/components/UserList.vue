<template>
    <div class="user-list-container">
        <h3 class="card-title">사용자 이용 정보</h3>

        <div class="search-bar-wrapper">
            <InfoInput v-model="searchTerm" placeholder="사용자 ID로 검색..." :hasIcon="true">
                <template #icon><v-icon name="bi-search" /></template>
            </InfoInput>
        </div>

        <ul class="user-list" v-if="paginatedUsers.length > 0">
            <li
                class="user-item"
                v-for="user in paginatedUsers"
                :key="user.rideId"
                :class="{ 'has-accident': user.accident }"
                @click="$emit('focus-ride', user.pmId)"
            >
                <button
                    v-if="user.accident && user.isCompleted"
                    class="accident-dismiss-btn"
                    title="목록에서 지우기"
                    @click.stop="$emit('dismiss-accident', user.rideId)"
                >
                    <v-icon name="bi-x-lg" scale="0.8" />
                </button>

                <div class="user-id-wrapper">
                    <div class="id-grid">
                        <div class="id-item">
                            <span class="info-label">사용자 ID</span>
                            <div class="user-id-value">
                                {{ user.id }}
                                <span v-if="user.accident" class="accident-badge">🚨 사고 발생</span>
                            </div>
                        </div>
                        <div class="id-item">
                            <span class="info-label">킥보드 ID (PM ID)</span>
                            <div class="user-id-value pm-id-value">
                                {{ user.pmId }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">운행 시작</span>
                        <span class="info-value">{{ user.startTime }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">경과 시간</span>
                        <span class="info-value">{{
                            getElapsedTime(user.elapsedTimeBase, user.isCompleted, user.accident)
                        }}</span>
                    </div>
                </div>

                <div class="score-wrapper">
                    <span class="score-label">안전운행 점수</span>
                    <div class="score-bar-value-wrapper">
                        <div class="score-bar-container">
                            <div
                                class="score-bar"
                                :class="getScoreColor(user.score)"
                                :style="{ width: user.score + '%' }"
                            ></div>
                        </div>
                        <span :class="['score-value', getScoreColor(user.score)]"> {{ user.score }}점 </span>
                    </div>
                </div>
            </li>
        </ul>
        <div v-else class="loading-text empty-list-text">
            {{ searchTerm ? '검색 결과가 없습니다.' : '실시간 사용자 정보가 없습니다.' }}
        </div>

        <div class="pagination-controls">
            <p>총 {{ totalUsers }}명</p>
            <div class="pagination-buttons">
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                >
                    이전
                </InfoButton>
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                >
                    다음
                </InfoButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import InfoInput from './ui/InfoInput.vue';
import InfoButton from './ui/InfoButton.vue';

// (수정) 'focus-ride' 이벤트 추가
defineEmits(['dismiss-accident', 'focus-ride']);

const props = defineProps({
    users: {
        type: Array,
        required: true,
    },
});

// --- 경과 시간 계산용 타이머 ---
const now = ref(new Date());
const timer = ref(null);

onMounted(() => {
    timer.value = setInterval(() => {
        now.value = new Date();
    }, 1000);
});

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
    }
});

const getElapsedTime = (startTimeString, isCompleted, isAccident) => {
    if (!startTimeString) return 'N/A';

    if (isAccident && isCompleted) {
        return '운행 종료 (사고)';
    }
    if (isCompleted) {
        return '운행 종료';
    }

    try {
        const start = new Date(startTimeString);
        const diffMs = now.value.getTime() - start.getTime();

        if (diffMs < 0) return '0분 째';

        const totalMinutes = Math.floor(diffMs / 60000);

        if (totalMinutes < 60) {
            return `${totalMinutes}분 째`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}시간 ${minutes}분 째`;
        }
    } catch (e) {
        return 'Error';
    }
};

// --- (기존) 검색 및 페이지네이션 ---
const searchTerm = ref('');
const currentPage = ref(1);
const usersPerPage = 5;

watch(
    () => props.users,
    () => {
        currentPage.value = 1;
    }
);

const filteredUsers = computed(() => {
    if (!searchTerm.value) {
        return props.users;
    }
    return props.users.filter((user) => String(user.id).toLowerCase().includes(searchTerm.value.toLowerCase()));
});

const totalUsers = computed(() => filteredUsers.value.length);
const totalPages = computed(() => Math.ceil(totalUsers.value / usersPerPage) || 1);

const paginatedUsers = computed(() => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = 1;
    }
    const start = (currentPage.value - 1) * usersPerPage;
    const end = start + usersPerPage;
    return filteredUsers.value.slice(start, end);
});

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const getScoreColor = (score) => {
    if (score >= 81) return 'high';
    if (score >= 61) return 'mid';
    if (score >= 21) return 'low';
    return 'danger';
};
</script>

<style scoped src="@/assets/styles/components/UserList.css"></style>

<style scoped>
.user-item {
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
}
.user-item:hover {
    background-color: #f3f4f6; /* 마우스 올렸을 때 배경색 변경 */
    border-color: #d1d5db;
}
/* 사고 발생 항목의 hover 스타일 */
.user-item.has-accident:hover {
    background-color: #fecaca; /* 더 진한 빨강 배경 */
}
</style>
