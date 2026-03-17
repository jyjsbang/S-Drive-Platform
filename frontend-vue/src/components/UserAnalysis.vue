<template>
  <div class="user-analysis-card">
    <h3 class="card-title">사용자 분석</h3>

    <div class="analysis-content">
      <div class="analysis-box score-bad">
        <h4 class="list-title">위험도 높은 사용자</h4>
        <ul class="user-list" v-if="!isLoadingRisk && riskUsers.length > 0">
          <li v-for="user in riskUsers" :key="user.userId">
            <span class="dot score-bad-dot"></span>
            <span class="user-name">{{ user.nickname }}</span>
            <span class="user-value score-bad-text"
              >안전 점수 : {{ user.safetyScore.toFixed(0) }}점</span
            >
          </li>
        </ul>
        <div
          v-else-if="!isLoadingRisk && riskUsers.length === 0"
          class="no-data"
        >
          조회된 사용자가 없습니다.
        </div>
        <div v-else class="no-data">데이터를 불러오는 중입니다...</div>
      </div>

      <div class="analysis-box most-ride">
        <h4 class="list-title">오늘 가장 많이 운행한 사용자</h4>
        <ul class="user-list" v-if="!isLoadingRiders && topRiders.length > 0">
          <li v-for="user in topRiders" :key="user.userId">
            <span class="dot most-ride-dot"></span>
            <span class="user-name">{{ user.nickname }}</span>
            <span class="user-value most-ride-text"
              >{{ user.rideCount }}회</span
            >
          </li>
        </ul>
        <div
          v-else-if="!isLoadingRiders && topRiders.length === 0"
          class="no-data"
        >
          오늘 운행한 사용자가 없습니다.
        </div>
        <div v-else class="no-data">데이터를 불러오는 중입니다...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "@/api/index.js";
// InfoBadge는 더 이상 사용하지 않으므로 제거합니다.

const isLoadingRisk = ref(true);
const riskUsers = ref([]);
const isLoadingRiders = ref(true); // (★추가★)
const topRiders = ref([]); // (★추가★)

/**
 * 컴포넌트 마운트 시 API 호출
 */
onMounted(() => {
  fetchTopRiskUsers();
  fetchTopRidersToday(); // (★추가★)
});

/**
 * /api/admin/users/top-risk API 호출
 */
const fetchTopRiskUsers = async () => {
  isLoadingRisk.value = true;
  try {
    const response = await apiClient.get("/admin/users/top-risk");
    // (★수정★) .slice(0, 2) 제거 -> 5명 모두 가져오기
    riskUsers.value = response;
  } catch (error) {
    console.error("위험 사용자 목록 로딩 실패:", error);
    riskUsers.value = [];
  } finally {
    isLoadingRisk.value = false;
  }
};

/**
 * (★수정★)
 * /api/admin/stats/top-riders-today API 호출 (5명)
 */
const fetchTopRidersToday = async () => {
  isLoadingRiders.value = true;
  try {
    const response = await apiClient.get("/admin/stats/top-riders-today");
    // (★수정★) .slice(0, 2) 제거 -> 5명 모두 가져오기
    topRiders.value = response;
  } catch (error) {
    console.error("오늘의 Top 라이더 로딩 실패:", error);
    topRiders.value = [];
  } finally {
    isLoadingRiders.value = false;
  }
};

// getScoreVariant 함수는 더 이상 사용하지 않으므로 제거합니다.
</script>

<style scoped src="@/assets/styles/components/UserAnalysis.css"></style>
