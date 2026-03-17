<template>
    <div class="map-container">
        <div id="realtime-map" class="map-view">
            <div v-if="!mapLoaded" class="map-text">지도 로딩 중...</div>

            <div class="map-controls">
                <button class="map-control-btn" @click="zoomIn">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="3"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
                <div class="map-control-divider"></div>
                <button class="map-control-btn" @click="goToMyLocation">
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
                            d="M12 9.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 12 9.75Z"
                        />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 12c0-4.142-3.358-7.5-7.5-7.5s-7.5 3.358-7.5 7.5 3.358 7.5 7.5 7.5 7.5-3.358 7.5-7.5Z"
                        />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v-3m0 18v-3m-7.5-6h-3m18 0h-3" />
                    </svg>
                </button>
                <div class="map-control-divider"></div>
                <button class="map-control-btn" @click="zoomOut">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="3"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                    </svg>
                </button>
            </div>

            <div class="map-legend">
                <div class="legend-item">
                    <span class="legend-color color-high"></span><span class="legend-label">운행중</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color color-available"></span><span class="legend-label">대기</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color color-danger"></span><span class="legend-label">고장</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
    districts: { type: Object, required: true },
    kickboards: { type: Array, required: true },
});

const mapInstance = ref(null);
const mapLoaded = ref(false);
const pmOverlays = ref([]);

// 킥보드 SVG 아이콘
const kickboardSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 12H16V9H18.5V12ZM18.15 13C18.6 13 19 13.4 19 13.85C19 14.3 18.6 14.7 18.15 14.7C17.7 14.7 17.3 14.3 17.3 13.85C17.3 13.4 17.7 13 18.15 13ZM6.85 13C7.3 13 7.7 13.4 7.7 13.85C7.7 14.3 7.3 14.7 6.85 14.7C6.4 14.7 6 14.3 6 13.85C6 13.4 6.4 13 6.85 13ZM5.5 12H8V9H5.5V12ZM14.75 16H9.25C9.25 16 9 15.75 9 15.5C9 15.25 9.25 15 9.25 15H14.75C14.75 15 15 15.25 15 15.5C15 15.75 14.75 16 14.75 16ZM19 16.5V18H5V16.5L6.5 15.25H17.5L19 16.5ZM13.5 6.5H10.5L11.25 4H12.75L13.5 6.5Z" /></svg>`;

onMounted(() => {
    loadMapScript();
});

watch(
    () => props.kickboards,
    (newKickboards) => {
        if (mapLoaded.value && newKickboards.length > 0) {
            displayPMsOnMap(newKickboards);
            // ※ 주의: 여기서 매번 setBounds를 하면 사용자가 지도를 움직여도
            // 데이터가 갱신될 때마다 강제로 전체 뷰로 돌아가므로 불편할 수 있습니다.
            // 초기 로딩 시에만 bounds를 잡거나, 주석 처리하는 것이 좋습니다.
            /*
            const bounds = new window.kakao.maps.LatLngBounds();
            newKickboards.forEach((kb) => {
                if (kb.lat && kb.lng) {
                    bounds.extend(new window.kakao.maps.LatLng(kb.lat, kb.lng));
                }
            });
            if (mapInstance.value) {
                mapInstance.value.setBounds(bounds);
            }
            */
        } else if (mapLoaded.value) {
            displayPMsOnMap([]);
        }
    },
    { deep: true }
);

const loadMapScript = () => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
        initMap();
    } else {
        setTimeout(loadMapScript, 100);
    }
};

const initMap = () => {
    const mapContainer = document.getElementById('realtime-map');
    if (!mapContainer || mapInstance.value) return;

    const mapOption = {
        center: new window.kakao.maps.LatLng(35.8244, 128.738),
        level: 5,
        disableDefaultUI: true,
    };

    mapInstance.value = new window.kakao.maps.Map(mapContainer, mapOption);
    mapLoaded.value = true;
    mapInstance.value.relayout();
};

const zoomIn = () => {
    if (mapInstance.value) {
        mapInstance.value.setLevel(mapInstance.value.getLevel() - 1);
    }
};

const zoomOut = () => {
    if (mapInstance.value) {
        mapInstance.value.setLevel(mapInstance.value.getLevel() + 1);
    }
};

const goToMyLocation = () => {
    if (!mapInstance.value) {
        alert('지도가 아직 로드되지 않았습니다.');
        return;
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const currentPosition = new window.kakao.maps.LatLng(lat, lng);

                mapInstance.value.setCenter(currentPosition);
                mapInstance.value.setLevel(4);
                mapInstance.value.relayout();

                new window.kakao.maps.Marker({
                    map: mapInstance.value,
                    position: currentPosition,
                    title: '현재 위치',
                });
            },
            () => {
                alert('위치 정보를 가져오는 데 실패했습니다.');
            }
        );
    } else {
        alert('이 브라우저는 Geolocation을 지원하지 않습니다.');
    }
};

// (수정) 외부에서 호출 가능한 '해당 킥보드로 이동' 함수
const focusKickboard = (pmId) => {
    if (!mapInstance.value || !props.kickboards) return;

    // pmId에 해당하는 킥보드 찾기
    const targetKb = props.kickboards.find((kb) => kb.id === pmId);

    if (targetKb && targetKb.lat && targetKb.lng) {
        const moveLatLon = new window.kakao.maps.LatLng(targetKb.lat, targetKb.lng);

        // 부드럽게 이동 (panTo)
        mapInstance.value.panTo(moveLatLon);

        // 필요하다면 줌 레벨도 변경 가능 (예: 좀 더 확대해서 보여주기)
        // mapInstance.value.setLevel(3);
    } else {
        console.warn(`Kickboard ${pmId} not found or invalid location.`);
    }
};

// (수정) 부모 컴포넌트에서 호출할 수 있도록 expose
defineExpose({
    focusKickboard,
});

const getStatusColorClass = (status) => {
    if (status === 'in_use') return 'status-running';
    if (status === 'maintenance') return 'status-error';
    return '';
};

const displayPMsOnMap = (kickboards) => {
    if (!mapInstance.value) return;
    pmOverlays.value.forEach((overlay) => overlay.setMap(null));
    pmOverlays.value = [];

    kickboards.forEach((kb) => {
        const statusClass = getStatusColorClass(kb.status);
        const content = `<div class="pm-icon-overlay ${statusClass}">${kickboardSVG}</div>`;

        const position = new window.kakao.maps.LatLng(kb.lat, kb.lng);
        const customOverlay = new window.kakao.maps.CustomOverlay({
            position: position,
            content: content,
            yAnchor: 1,
            xAnchor: 0.5,
        });
        customOverlay.setMap(mapInstance.value);
        pmOverlays.value.push(customOverlay);
    });
};
</script>

<style scoped src="@/assets/styles/components/RealtimeMap.css"></style>

<style scoped>
.map-text {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 1.25rem;
    font-weight: 500;
}
</style>
