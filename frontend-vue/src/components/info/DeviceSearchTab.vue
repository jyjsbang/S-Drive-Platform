<template>
    <div class="tab-container">
        <div class="search-form">
            <InfoInput v-model="searchTerm" placeholder="기기 고유 번호(PM ID)로 검색" :hasIcon="true">
                <template #icon><v-icon name="bi-search" /></template>
            </InfoInput>
            <InfoButton variant="default" @click="applySearch">검색</InfoButton>
        </div>

        <div class="info-table-wrapper">
            <table class="info-table">
                <thead class="info-table-header">
                    <tr>
                        <th class="info-table-head">PM ID (기기 번호)</th>
                        <th class="info-table-head">모델명</th>
                        <th class="info-table-head">현재 상태</th>
                        <th class="info-table-head">배터리</th>
                        <th class="info-table-head">현재 위치</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr v-if="isLoading">
                        <td colspan="5" class="info-table-cell" style="text-align: center; height: 100px">
                            기기 목록을 불러오는 중입니다...
                        </td>
                    </tr>
                    <tr v-else-if="filteredDevices.length === 0">
                        <td colspan="5" class="info-table-cell" style="text-align: center; height: 100px">
                            {{ searchTerm ? '검색된 기기가 없습니다.' : '조회된 기기가 없습니다.' }}
                        </td>
                    </tr>
                    <tr
                        v-for="device in filteredDevices"
                        :key="device.id"
                        class="info-table-row clickable"
                        @click="openDeviceDetail(device)"
                    >
                        <td class="info-table-cell">{{ device.id }}</td>
                        <td class="info-table-cell">{{ device.model }}</td>
                        <td class="info-table-cell">
                            <InfoBadge :variant="getStatusVariant(device.status)">
                                {{ translateStatusToKorean(device.status) }}
                            </InfoBadge>
                        </td>
                        <td class="info-table-cell">{{ device.battery }}%</td>
                        <td class="info-table-cell">{{ device.location }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <InfoDialog :open="!!selectedDevice" title="기기 상세 정보" @update:open="closeDialog">
            <div class="dialog-section">
                <h3 class="dialog-section-title">기기 상태</h3>
                <div class="info-grid">
                    <div>
                        <p class="text-gray-600 mb-2">배터리 잔량</p>
                        <div class="flex-items-center">
                            <div class="progress-bar-container">
                                <div class="progress-bar" :style="{ width: `${selectedDevice?.battery || 0}%` }"></div>
                            </div>
                            <span class="text-gray-900">{{ selectedDevice?.battery }}%</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-gray-600 mb-2">현재 위치</p>
                        <div class="flex-items-center">
                            <v-icon name="bi-map" class="icon text-gray-600" />
                            <p class="text-gray-900">{{ selectedDevice?.location }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dialog-section">
                <h3 class="dialog-section-title">위치 지도</h3>
                <div id="device-detail-map" class="map-placeholder"></div>
            </div>

            <div class="dialog-section action-buttons">
                <InfoButton variant="outline" @click="handleRemoteLock">원격 잠금</InfoButton>
                <InfoButton variant="outline" @click="handleSetMaintenance">수리 중으로 변경</InfoButton>
            </div>
        </InfoDialog>
    </div>
</template>

<script setup>
// (★수정★) nextTick 추가
import { ref, onMounted, computed, nextTick } from 'vue';
import apiClient from '@/api/index.js';
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoBadge from '../ui/InfoBadge.vue';
import InfoDialog from '../ui/InfoDialog.vue';

const searchTerm = ref('');
const selectedDevice = ref(null);
const isLoading = ref(true);
const allDevices = ref([]);
const currentSearch = ref('');
const mapInstance = ref(null); // (★추가★) 지도 인스턴스 ref

const fetchDevices = async () => {
    isLoading.value = true;
    try {
        const response = await apiClient.get('/admin/kickboards');

        allDevices.value = response.kickboards.map((kickboard) => {
            const lat = kickboard.location?.lat || 'N/A';
            const lng = kickboard.location?.lng || 'N/A';

            return {
                id: kickboard.pm_id,
                model: kickboard.model || 'N/A',
                status: kickboard.pm_status,
                battery: kickboard.battery,
                location: `${lat}, ${lng}`,
            };
        });
    } catch (error) {
        console.error('기기 목록 조회 실패:', error);
        allDevices.value = [];
    } finally {
        isLoading.value = false;
    }
};

const applySearch = () => {
    currentSearch.value = searchTerm.value;
};

const filteredDevices = computed(() => {
    if (!currentSearch.value) {
        return allDevices.value;
    }
    return allDevices.value.filter((device) => device.id.toLowerCase().includes(currentSearch.value.toLowerCase()));
});

/**
 * (★수정★)
 * 다이얼로그 열기 (지도 초기화 로직 추가)
 */
const openDeviceDetail = async (device) => {
    selectedDevice.value = device;
    mapInstance.value = null; // 맵 인스턴스 초기화

    // (★추가★) 다이얼로그가 DOM에 렌더링될 때까지 기다림
    await nextTick();

    // (★추가★) 지도 초기화 함수 호출
    initDetailMap(device);
};

/**
 * (★신규★)
 * 다이얼로그 내부의 카카오 지도를 초기화하는 함수
 */
const initDetailMap = (device) => {
    const mapContainer = document.getElementById('device-detail-map');
    if (!mapContainer || !window.kakao || !window.kakao.maps) {
        console.error('Kakao Maps API가 로드되지 않았거나, 맵 컨테이너를 찾을 수 없습니다.');
        return;
    }

    // "35.8244, 128.738" 형식의 문자열을 lat, lng 숫자로 변환
    const locationParts = device.location.split(', ');
    const lat = parseFloat(locationParts[0]);
    const lng = parseFloat(locationParts[1]);

    // 좌표가 유효하지 않은 경우 (N/A, N/A)
    if (isNaN(lat) || isNaN(lng)) {
        mapContainer.innerHTML =
            '<div style="text-align: center; padding-top: 6rem; color: #6b7280;">위치 좌표가 유효하지 않습니다.</div>';
        return;
    }

    const devicePosition = new window.kakao.maps.LatLng(lat, lng);

    const mapOption = {
        center: devicePosition,
        level: 3, // (확대 레벨)
        disableDefaultUI: true, // (기본 UI 숨김)
    };

    // (★수정★) 맵 인스턴스 생성
    const map = new window.kakao.maps.Map(mapContainer, mapOption);
    mapInstance.value = map;

    // (★추가★) 지도 확대/축소 컨트롤 추가
    const zoomControl = new window.kakao.maps.ZoomControl();
    map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

    // (★추가★) 기기 위치에 마커 표시
    new window.kakao.maps.Marker({
        map: map,
        position: devicePosition,
        title: device.id,
    });

    // (★추가★) 다이얼로그가 열리면서 지도가 깨질 수 있으므로, relayout을 호출
    setTimeout(() => {
        if (map) {
            map.relayout();
            map.setCenter(devicePosition);
        }
    }, 100); // 0.1초 후 레이아웃 재조정
};

const closeDialog = () => {
    selectedDevice.value = null;
    mapInstance.value = null; // (★추가★) 지도 인스턴스 제거
};

// --- (v1.2 명세서 버튼 API 연동) ---
const handleRemoteLock = async () => {
    if (!selectedDevice.value) return;
    if (confirm(`정말로 ${selectedDevice.value.id} 기기를 원격 잠금하시겠습니까?`)) {
        try {
            await apiClient.post(`/admin/kickboards/${selectedDevice.value.id}/lock`);
            alert('기기가 원격 잠금되었습니다.');
        } catch (error) {
            console.error('원격 잠금 실패:', error);
            alert('원격 잠금에 실패했습니다.');
        }
    }
};

const handleSetMaintenance = async () => {
    if (!selectedDevice.value) return;
    if (confirm(`정말로 ${selectedDevice.value.id} 기기의 상태를 '수리중'으로 변경하시겠습니까?`)) {
        try {
            await apiClient.put(`/admin/kickboards/${selectedDevice.value.id}`, {
                pm_status: 'maintenance',
            });
            alert("기기 상태가 'maintenance' (수리중)으로 변경되었습니다.");
            fetchDevices();
            closeDialog();
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경에 실패했습니다.');
        }
    }
};

const translateStatusToKorean = (status) => {
    switch (status) {
        case 'available':
            return '대기';
        case 'in_use':
            return '사용중';
        case 'maintenance':
            return '수리중';
        default:
            return status;
    }
};

const getStatusVariant = (status) => {
    switch (status) {
        case 'in_use':
            return 'default';
        case 'available':
            return 'secondary';
        case 'maintenance':
            return 'destructive';
        default:
            if (status === '수리중') return 'destructive';
            return 'default';
    }
};

onMounted(() => {
    fetchDevices();
});
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
