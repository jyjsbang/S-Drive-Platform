import { defineStore } from 'pinia';
import apiClient from '@/api/index.js';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        isSettingsModalOpen: false,
        kpiList: [], // t_risk_kpi 목록
        kpiRecommendations: {}, // (★신규★) { kpi_id: { recommended_weight, reason... } }
        isLoading: false,
        newKpiData: {
            kpi_name: '',
            kpi_desc: '',
            weight: 1.0,
        },
    }),
    actions: {
        openSettingsModal() {
            this.isSettingsModalOpen = true;
            this.fetchKpis();
            this.fetchKpiRecommendations(); // (★신규★) 추천 데이터 로드
        },
        closeSettingsModal() {
            this.isSettingsModalOpen = false;
            this.kpiRecommendations = {}; // 초기화
        },
        async fetchKpis() {
            this.isLoading = true;
            try {
                const response = await apiClient.get('/admin/kpis');
                this.kpiList = response || [];
            } catch (error) {
                console.error('KPI 목록 조회 실패:', error);
                this.kpiList = [];
            } finally {
                this.isLoading = false;
            }
        },
        /**
         * (★신규★) KPI 가중치 추천 데이터 조회
         */
        async fetchKpiRecommendations() {
            try {
                const response = await apiClient.get('/admin/kpis/recommend');

                // kpi_id를 Key로 하는 객체로 변환
                const recommendationMap = {};
                if (response && response.analysis_result) {
                    response.analysis_result.forEach((item) => {
                        recommendationMap[item.kpi_id] = item;
                    });
                }
                this.kpiRecommendations = recommendationMap;
            } catch (error) {
                console.error('KPI 추천 데이터 조회 실패:', error);
                this.kpiRecommendations = {};
            }
        },
        async updateKpiWeight(kpiId, newWeight) {
            try {
                await apiClient.put(`/admin/kpis/${kpiId}`, {
                    weight: parseFloat(newWeight),
                });
                await this.fetchKpis();
                alert('가중치가 성공적으로 업데이트되었습니다.');
            } catch (error) {
                console.error('KPI 가중치 업데이트 실패:', error);
                alert('업데이트에 실패했습니다.');
            }
        },
        async createKpi() {
            if (!this.newKpiData.kpi_name || !this.newKpiData.weight) {
                alert('KPI 이름과 가중치는 필수입니다.');
                return;
            }
            try {
                await apiClient.post('/admin/kpis', {
                    kpi_name: this.newKpiData.kpi_name,
                    kpi_desc: this.newKpiData.kpi_desc,
                    weight: parseFloat(this.newKpiData.weight),
                });
                alert('새 KPI 항목이 추가되었습니다.');
                this.newKpiData = { kpi_name: '', kpi_desc: '', weight: 1.0 };
                await this.fetchKpis();
            } catch (error) {
                console.error('KPI 생성 실패:', error);
                alert('항목 추가에 실패했습니다. (DB 에러 발생)');
            }
        },
        async deleteKpi(kpiId) {
            try {
                await apiClient.delete(`/admin/kpis/${kpiId}`);
                alert('KPI 항목이 삭제되었습니다.');
                await this.fetchKpis();
            } catch (error) {
                console.error('KPI 삭제 실패:', error);
                alert('삭제에 실패했습니다.');
            }
        },
    },
});
