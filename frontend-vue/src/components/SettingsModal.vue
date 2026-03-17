<template>
    <div v-if="store.isSettingsModalOpen" class="settings-modal-overlay" @click="close">
        <div class="settings-modal-content" @click.stop>
            <div class="settings-modal-header">
                <h3 class="settings-modal-title">설정: 위험 행동(KPI) 가중치 관리</h3>
                <button class="settings-modal-close-btn" @click="close">
                    <v-icon name="bi-x-lg" />
                </button>
            </div>
            <div class="settings-modal-body">
                <p class="description">
                    'Weight'는 해당 위험 행동이 감지되었을 때 사용자의 안전 점수에서 차감될 **감점 점수**입니다.
                </p>

                <div class="info-table-wrapper">
                    <table class="info-table">
                        <thead class="info-table-header">
                            <tr>
                                <th class="info-table-head" style="width: 60px">ID</th>
                                <th class="info-table-head">위험 행동</th>
                                <th class="info-table-head">설명</th>
                                <th class="info-table-head" style="width: 100px">현재 가중치</th>
                                <th class="info-table-head" style="width: 200px">통계 분석 추천</th>
                                <th class="info-table-head" style="width: 80px">저장</th>
                                <th class="info-table-head" style="width: 80px">삭제</th>
                            </tr>
                        </thead>
                        <tbody class="info-table-body">
                            <tr v-if="store.isLoading">
                                <td colspan="7" class="info-table-cell" style="text-align: center; height: 100px">
                                    KPI 목록을 불러오는 중입니다...
                                </td>
                            </tr>
                            <tr v-else-if="store.kpiList.length === 0">
                                <td colspan="7" class="info-table-cell" style="text-align: center; height: 100px">
                                    조회된 KPI 항목이 없습니다.
                                </td>
                            </tr>
                            <tr v-else v-for="kpi in store.kpiList" :key="kpi.kpi_id" class="info-table-row">
                                <td class="info-table-cell">{{ kpi.kpi_id }}</td>
                                <td class="info-table-cell">{{ kpi.kpi_name }}</td>
                                <td class="info-table-cell">{{ kpi.kpi_desc }}</td>

                                <td class="info-table-cell">
                                    <InfoInput
                                        type="number"
                                        :modelValue="String(editingWeights[kpi.kpi_id] ?? kpi.weight)"
                                        @input="updateEditingWeight(kpi.kpi_id, $event.target.value)"
                                    />
                                </td>

                                <td class="info-table-cell">
                                    <div v-if="store.kpiRecommendations[kpi.kpi_id]" class="recommendation-box">
                                        <div class="rec-value-row">
                                            <span class="rec-label">권장:</span>
                                            <strong class="rec-value">
                                                {{ store.kpiRecommendations[kpi.kpi_id].recommended_weight }}
                                            </strong>
                                            <button
                                                class="apply-btn"
                                                @click="
                                                    applyRecommendation(
                                                        kpi.kpi_id,
                                                        store.kpiRecommendations[kpi.kpi_id].recommended_weight
                                                    )
                                                "
                                                title="권장 값 적용"
                                            >
                                                적용
                                            </button>
                                        </div>
                                        <div class="rec-reason">
                                            {{ store.kpiRecommendations[kpi.kpi_id].reason }}
                                        </div>
                                    </div>
                                    <div v-else class="no-rec">데이터 부족</div>
                                </td>

                                <td class="info-table-cell">
                                    <InfoButton
                                        variant="default"
                                        size="sm"
                                        @click="handleSave(kpi.kpi_id)"
                                        :disabled="!isWeightChanged(kpi)"
                                    >
                                        Save
                                    </InfoButton>
                                </td>
                                <td class="info-table-cell">
                                    <InfoButton
                                        variant="destructive"
                                        size="sm"
                                        class="btn-delete"
                                        @click="handleDelete(kpi.kpi_id, kpi.kpi_name)"
                                    >
                                        Del
                                    </InfoButton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="add-kpi-form">
                    <h4 class="form-title">새 위험 행동 추가</h4>
                    <div class="form-grid">
                        <InfoInput placeholder="KPI 이름 (예: 인도 주행)" v-model="store.newKpiData.kpi_name" />
                        <InfoInput placeholder="설명 (예: 인도 주행 감지)" v-model="store.newKpiData.kpi_desc" />
                        <InfoInput type="number" placeholder="가중치 (예: 2.5)" v-model="store.newKpiData.weight" />
                    </div>
                    <InfoButton variant="default" @click="handleCreate" style="width: 100%; margin-top: 8px">
                        DB에 새 항목 추가
                    </InfoButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings.store.js';
import InfoInput from './ui/InfoInput.vue';
import InfoButton from './ui/InfoButton.vue';

const store = useSettingsStore();

const editingWeights = ref({});

const close = () => {
    store.closeSettingsModal();
    editingWeights.value = {};
};

const updateEditingWeight = (kpiId, newValue) => {
    editingWeights.value[kpiId] = newValue;
};

// (★신규★) '적용' 버튼 클릭 시
const applyRecommendation = (kpiId, recommendedValue) => {
    editingWeights.value[kpiId] = String(recommendedValue);
};

const isWeightChanged = (kpi) => {
    const editedValue = editingWeights.value[kpi.kpi_id];
    return editedValue !== undefined && parseFloat(editedValue) !== parseFloat(kpi.weight);
};

const handleSave = async (kpiId) => {
    const newWeight = editingWeights.value[kpiId];
    if (newWeight === undefined) return;

    await store.updateKpiWeight(kpiId, newWeight);
    delete editingWeights.value[kpiId];
};

const handleDelete = async (kpiId, kpiName) => {
    if (window.confirm(`정말 [${kpiName}] 항목을 DB에서 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        await store.deleteKpi(kpiId);
    }
};

const handleCreate = async () => {
    await store.createKpi();
};
</script>

<style scoped src="@/assets/styles/components/SettingsModal.css"></style>
<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>

<style scoped>
/* (★신규★) 추천 영역 스타일 */
.recommendation-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.rec-value-row {
    display: flex;
    align-items: center;
    gap: 6px;
}
.rec-label {
    font-size: 0.75rem;
    color: #6b7280;
}
.rec-value {
    font-size: 0.9rem;
    color: #2563eb; /* 파란색 강조 */
    font-weight: 700;
}
.apply-btn {
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #2563eb;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}
.apply-btn:hover {
    background-color: #dbeafe;
}
.rec-reason {
    font-size: 0.75rem;
    color: #9ca3af; /* 연한 회색 */
}
.no-rec {
    font-size: 0.75rem;
    color: #d1d5db;
    font-style: italic;
}
</style>
