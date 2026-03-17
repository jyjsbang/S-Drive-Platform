<template>
  <div class="stats-container">
    <section class="kpi-grid-4">
      <StatsKpiCard
        title="누적 이용자 수"
        :value="kpiData.users.value"
        :unit="kpiData.users.unit"
        icon="bi-people"
        iconBgColor="bg-blue-100"
      />
      <StatsKpiCard
        title="누적 운행거리"
        :value="kpiData.distance.value"
        :unit="kpiData.distance.unit"
        icon="bi-cursor"
        iconBgColor="bg-cyan-100"
      />
      <StatsKpiCard
        title="누적 운행 수"
        :value="kpiData.rides.value"
        :unit="kpiData.rides.unit"
        icon="bi-activity"
        iconBgColor="bg-indigo-100"
      />
      <StatsKpiCard
        title="누적 발생 위험 행동 수"
        :value="kpiData.risks.value"
        :unit="kpiData.risks.unit"
        icon="bi-exclamation-triangle"
        iconBgColor="bg-red-100"
      />
    </section>

    <section class="kpi-grid-3">
      <StatsKpiCard
        title="운행당 평균 위험 발생수"
        :value="kpiData.riskRate.value"
        :unit="kpiData.riskRate.unit"
        icon="bi-graph-up"
        iconBgColor="bg-orange-100"
      />
      <StatsKpiCard
        title="평균 안전모 착용율"
        :value="kpiData.helmetRate.value"
        :unit="kpiData.helmetRate.unit"
        icon="bi-shield-check"
        iconBgColor="bg-green-100"
      />
      <StatsKpiCard
        title="평균 안전운행 점수"
        :value="kpiData.safetyScore.value"
        :unit="kpiData.safetyScore.unit"
        icon="bi-award"
        iconBgColor="bg-purple-100"
      />
    </section>

    <section class="trend-section">
      <StatCard title="위험 행동 유형 트렌드">
        <div class="chart-wrapper" style="height: 280px">
          <LineChart
            :chartData="kpiTrendChartData"
            :chartOptions="kpiTrendChartOptions"
          />
        </div>
      </StatCard>
    </section>

    <section class="stats-main-grid">
      <StatCard title="위험 행동 유형별 통계">
        <template #action>
          <InfoButton
            variant="default"
            size="sm"
            @click="showRiskTable = !showRiskTable"
          >
            <template #icon><v-icon name="bi-file-earmark-text" /></template>
            {{ showRiskTable ? "차트 보기" : "발생빈도 표" }}
          </InfoButton>
        </template>
        <div v-if="!showRiskTable" class="chart-content-wrapper-horizontal">
          <div class="chart-wrapper-pie">
            <PieChart
              :chartData="riskTypeChartData"
              :chartOptions="riskTypeChartOptions"
            />
          </div>
          <div class="legend-wrapper">
            <div
              v-for="item in riskTypeData"
              :key="item.name"
              class="legend-item"
            >
              <div
                class="legend-color"
                :style="{ backgroundColor: item.color }"
              ></div>
              <span class="legend-label">{{ item.name }}</span>
              <span class="legend-value">{{ item.value }}%</span>
            </div>
          </div>
        </div>
        <div v-else class="table-content-wrapper">
          <div
            class="info-table-wrapper"
            style="max-height: 280px; overflow-y: auto"
          >
            <table class="info-table">
              <thead class="info-table-header">
                <tr>
                  <th class="info-table-head">위험 행동 유형</th>
                  <th class="info-table-head">발생 건수</th>
                  <th class="info-table-head">비율</th>
                </tr>
              </thead>
              <tbody class="info-table-body">
                <tr v-if="riskTypeData.length === 0">
                  <td
                    colspan="3"
                    class="info-table-cell"
                    style="text-align: center; height: 100px"
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
                <tr
                  v-for="item in riskTypeData"
                  :key="item.name"
                  class="info-table-row"
                >
                  <td class="info-table-cell">
                    <div class="legend-item">
                      <div
                        class="legend-color"
                        :style="{ backgroundColor: item.color }"
                      ></div>
                      <span class="legend-label">{{ item.name }}</span>
                    </div>
                  </td>
                  <td class="info-table-cell">{{ item.count }}건</td>
                  <td class="info-table-cell">{{ item.value }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </StatCard>

      <StatCard title="사고 시 위험 행동 발생 빈도">
        <div class="chart-wrapper" style="height: 240px">
          <BarChart
            :chartData="accidentKpiChartData"
            :chartOptions="accidentKpiChartOptions"
          />
        </div>
      </StatCard>

      <StatCard title="시간대별 위험도 분석">
        <div class="chart-wrapper" style="height: 240px">
          <BarChart
            :chartData="timeRiskChartData"
            :chartOptions="timeRiskChartOptions"
          />
        </div>
      </StatCard>

      <StatCard title="사용자 그룹별 비교">
        <div class="chart-wrapper" style="height: 240px">
          <BarChart
            :chartData="userGroupChartData"
            :chartOptions="userGroupChartOptions"
          />
        </div>
      </StatCard>

      <StatCard title="사고 발생률 추이 (최근 30일)">
        <div class="chart-wrapper" style="height: 240px">
          <LineChart
            :chartData="accidentTrendChartData"
            :chartOptions="accidentTrendChartOptions"
          />
        </div>
      </StatCard>

      <StatCard title="안전 점수 분포">
        <div class="chart-wrapper" style="height: 280px">
          <BarChart
            :chartData="safetyScoreChartData"
            :chartOptions="safetyScoreChartOptions"
          />
        </div>
      </StatCard>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiClient from "@/api/index.js";
import StatsKpiCard from "@/components/StatsKpiCard.vue";
import StatCard from "@/components/StatCard.vue";
import InfoButton from "@/components/ui/InfoButton.vue";
import LineChart from "@/components/charts/LineChart.vue";
import BarChart from "@/components/charts/BarChart.vue";
import PieChart from "@/components/charts/PieChart.vue";

const riskColors = [
  "#EF4444",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];
const showRiskTable = ref(false);

const kpiData = ref({
  users: { value: "...", unit: "명" },
  distance: { value: "...", unit: "km" },
  rides: { value: "...", unit: "건" },
  risks: { value: "...", unit: "건" },
  riskRate: { value: "...", unit: "건" },
  helmetRate: { value: "...", unit: "%" },
  safetyScore: { value: "...", unit: "점" },
});

const kpiTrendData = ref({
  labels: [],
  datasets: { rideCounts: [], helmetRates: [], riskCounts: [] },
});
const riskTypeData = ref([]);
const timeRiskData = ref({ labels: [], data: [] });
const safetyScoreDistribution = ref({ labels: [], data: [] });
const userGroupData = ref([]);
const accidentKpiData = ref({ labels: [], data: [] }); // (★신규★)
const accidentTrendData = ref({ labels: [], data: [] }); // (★신규★)

const getToday = () => new Date().toISOString().split("T")[0];
const getPastDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

const fetchKpiData = async () => {
  try {
    const [kpiResponse, scoreResponse] = await Promise.all([
      apiClient.get("/admin/stats/kpis"),
      apiClient.get("/admin/stats/safety-scores"),
    ]);
    kpiData.value.users.value = (
      kpiResponse.totalUserCount || 0
    ).toLocaleString();
    kpiData.value.distance.value = (
      parseFloat(kpiResponse.totalDistance) || 0
    ).toLocaleString();
    kpiData.value.risks.value = (
      kpiResponse.totalRiskCount || 0
    ).toLocaleString();
    kpiData.value.helmetRate.value = kpiResponse.helmetRate || "0.0";
    kpiData.value.rides.value = (kpiResponse.totalRides || 0).toLocaleString();
    kpiData.value.safetyScore.value = scoreResponse.averageScore || "0.0";
    const totalRides = kpiResponse.totalRides || 0;
    const totalRisks = kpiResponse.totalRiskCount || 0;
    kpiData.value.riskRate.value =
      totalRides > 0 ? (totalRisks / totalRides).toFixed(1) : "0.0";
  } catch (error) {
    console.error("KPI 데이터 로딩 실패:", error);
  }
};

const fetchKpiTrends = async () => {
  try {
    const params = {
      startDate: getPastDate(30),
      endDate: getToday(),
      interval: "daily",
    };
    const response = await apiClient.get("/admin/stats/kpi-trends", { params });
    kpiTrendData.value = response;
  } catch (error) {
    console.error("위험 행동 트렌드 데이터 로딩 실패:", error);
  }
};

const fetchRiskTypes = async () => {
  try {
    const response = await apiClient.get("/admin/stats/risk-types");
    riskTypeData.value = response.data.map((item, index) => ({
      name: item.kpiName,
      value: item.percentage,
      count: item.count,
      color: riskColors[index % riskColors.length],
    }));
  } catch (error) {
    console.error("위험 행동 유형 데이터 로딩 실패:", error);
  }
};

const fetchHourlyRisk = async () => {
  try {
    const response = await apiClient.get("/admin/stats/hourly-risk");
    timeRiskData.value = response;
  } catch (error) {
    console.error("시간대별 위험도 데이터 로딩 실패:", error);
  }
};

const fetchUserGroupComparison = async () => {
  try {
    const response = await apiClient.get("/admin/stats/user-group-comparison");
    userGroupData.value = response.groups;
  } catch (error) {
    console.error("사용자 그룹 비교 데이터 로딩 실패:", error);
  }
};

const fetchSafetyScoreDistribution = async () => {
  try {
    const response = await apiClient.get("/admin/stats/safety-scores");
    safetyScoreDistribution.value = {
      labels: Object.keys(response.distribution),
      data: Object.values(response.distribution),
    };
  } catch (error) {
    console.error("안전 점수 분포 데이터 로딩 실패:", error);
  }
};

// (★신규★)
const fetchAccidentKpiStats = async () => {
  try {
    const response = await apiClient.get("/admin/stats/accident-kpi");
    accidentKpiData.value = response;
  } catch (error) {
    console.error("사고 KPI 통계 로딩 실패:", error);
  }
};

// (★신규★)
const fetchAccidentTrend = async () => {
  try {
    const params = { startDate: getPastDate(30), endDate: getToday() };
    const response = await apiClient.get("/admin/stats/accident-trend", {
      params,
    });
    accidentTrendData.value = response;
  } catch (error) {
    console.error("사고 발생률 추이 로딩 실패:", error);
  }
};

// --- Chart Data ---
const kpiTrendChartData = computed(() => ({
  labels: kpiTrendData.value.labels,
  datasets: [
    {
      label: "이용건수",
      data: kpiTrendData.value.datasets.rideCounts,
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      fill: true,
      yAxisID: "yLeft",
      tension: 0.3,
    },
    {
      label: "안전모착용률",
      data: kpiTrendData.value.datasets.helmetRates,
      borderColor: "#10B981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      fill: false,
      yAxisID: "yRight",
      tension: 0.3,
    },
    {
      label: "위험행동수",
      data: kpiTrendData.value.datasets.riskCounts,
      borderColor: "#EF4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      fill: false,
      yAxisID: "yLeft",
      tension: 0.3,
    },
  ],
}));
const kpiTrendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, position: "bottom" } },
  scales: {
    yLeft: {
      type: "linear",
      display: true,
      position: "left",
      title: { display: true, text: "건수" },
    },
    yRight: {
      type: "linear",
      display: true,
      position: "right",
      title: { display: true, text: "%" },
      grid: { drawOnChartArea: false },
    },
  },
};

const riskTypeChartData = computed(() => ({
  labels: riskTypeData.value.map((d) => d.name),
  datasets: [
    {
      data: riskTypeData.value.map((d) => d.value),
      backgroundColor: riskTypeData.value.map((d) => d.color),
    },
  ],
}));
const riskTypeChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%",
  plugins: { legend: { display: false } },
};

const timeRiskChartData = computed(() => ({
  labels: timeRiskData.value.labels,
  datasets: [
    {
      label: "위험 행동 수",
      data: timeRiskData.value.data,
      backgroundColor: "#EF4444",
      borderRadius: 4,
    },
  ],
}));
const timeRiskChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const userGroupLabels = ["신규 사용자", "10회 이상", "100회 이상"];
const userGroupChartData = computed(() => {
  const dataMap = new Map(
    userGroupData.value.map((d) => [d.group, d["평균 안전점수"]])
  );
  const data = userGroupLabels.map((label) => dataMap.get(label) || 0);
  return {
    labels: userGroupLabels,
    datasets: [
      {
        label: "평균 안전점수",
        data: data,
        backgroundColor: "#3B82F6",
        borderRadius: 4,
      },
    ],
  };
});
const userGroupChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { min: 0, max: 100 } },
};

const safetyScoreChartData = computed(() => ({
  labels: safetyScoreDistribution.value.labels,
  datasets: [
    {
      label: "사용자 수",
      data: safetyScoreDistribution.value.data,
      backgroundColor: "#8B5CF6",
      borderRadius: 4,
    },
  ],
}));
const safetyScoreChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

// (★신규★) 사고 KPI 차트 (가로 눈금 정수 설정 추가)
const accidentKpiChartData = computed(() => ({
  labels: accidentKpiData.value.labels,
  datasets: [
    {
      label: "사고 시 발생 횟수",
      data: accidentKpiData.value.data,
      backgroundColor: "#EF4444",
      borderRadius: 4,
    },
  ],
}));
const accidentKpiChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y",
  plugins: { legend: { display: false } },
  scales: {
    x: {
      beginAtZero: true,
      // (★추가★) 정수(1단위) 눈금 강제 설정
      ticks: {
        // stepSize: 1,  // <--- 이 줄은 지워주세요! (숫자가 커지면 빽빽해짐 방지)
        precision: 0,
      },
    },
  },
};

// (★신규★) 사고 추이 차트
const accidentTrendChartData = computed(() => ({
  labels: accidentTrendData.value.labels,
  datasets: [
    {
      label: "사고 발생률 (%)",
      data: accidentTrendData.value.data,
      borderColor: "#DC2626",
      backgroundColor: "rgba(220, 38, 38, 0.1)",
      fill: true,
      tension: 0.3,
    },
  ],
}));
const accidentTrendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, title: { display: true, text: "%" } } },
};

onMounted(() => {
  fetchKpiData();
  fetchSafetyScoreDistribution();
  fetchKpiTrends();
  fetchRiskTypes();
  fetchHourlyRisk();
  fetchUserGroupComparison();
  fetchAccidentKpiStats();
  fetchAccidentTrend();
});
</script>

<style scoped src="@/assets/styles/views/StatsView.css"></style>
