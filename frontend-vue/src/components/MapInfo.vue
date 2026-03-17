<template>
    <div class="map-info-card">
        <h3 class="card-title">지도 정보</h3>

        <div id="dashboard-map" class="map-view">
            <div v-if="!mapLoaded" class="map-text">지도 로딩 중...</div>

            <div class="map-controls" v-if="mapLoaded">
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
                <button class="map-control-btn" @click="goToMyLocation(false)">
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
        </div>

        <div class="map-stats-footer">
            <div class="stat-item">
                <span class="stat-color green"></span>
                <span class="stat-label">전체</span>
                <span class="stat-value">{{ pmStats.total }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-color blue"></span>
                <span class="stat-label">운행중</span>
                <span class="stat-value">{{ pmStats.running }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-color red"></span>
                <span class="stat-label">고장</span>
                <span class="stat-value">{{ pmStats.error }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-color grey"></span>
                <span class="stat-label">대기</span>
                <span class="stat-value">{{ pmStats.available }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
    pmData: {
        type: Array,
        required: true,
    },
    pmStats: {
        type: Object,
        required: true,
    },
});

const mapInstance = ref(null);
const mapLoaded = ref(false);
const pmOverlays = ref([]);

// (★수정★) 원래 SVG 아이콘으로 복원
const kickboardSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 12H16V9H18.5V12ZM18.15 13C18.6 13 19 13.4 19 13.85C19 14.3 18.6 14.7 18.15 14.7C17.7 14.7 17.3 14.3 17.3 13.85C17.3 13.4 17.7 13 18.15 13ZM6.85 13C7.3 13 7.7 13.4 7.7 13.85C7.7 14.3 7.3 14.7 6.85 14.7C6.4 14.7 6 14.3 6 13.85C6 13.4 6.4 13 6.85 13ZM5.5 12H8V9H5.5V12ZM14.75 16H9.25C9.25 16 9 15.75 9 15.5C9 15.25 9.25 15 9.25 15H14.75C14.75 15 15 15.25 15 15.5C15 15.75 14.75 16 14.75 16ZM19 16.5V18H5V16.5L6.5 15.25H17.5L19 16.5ZM13.5 6.5H10.5L11.25 4H12.75L13.5 6.5Z" /></svg>`;

onMounted(() => {
    loadMapScript();
});

watch(
    () => props.pmData,
    (newPMs) => {
        if (mapLoaded.value && newPMs.length > 0) {
            displayPMsOnMap(newPMs);
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
    const mapContainer = document.getElementById('dashboard-map');
    if (!mapContainer || mapInstance.value) return;

    goToMyLocation(true);
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

const goToMyLocation = (isInit = false) => {
    const mapContainer = document.getElementById('dashboard-map');
    const defaultPosition = new window.kakao.maps.LatLng(35.8244, 128.738);

    const createMap = (centerPosition) => {
        const mapOption = {
            center: centerPosition,
            level: 5,
            disableDefaultUI: true,
        };
        mapInstance.value = new window.kakao.maps.Map(mapContainer, mapOption);
        mapLoaded.value = true;
        mapInstance.value.relayout();

        if (props.pmData.length > 0) {
            displayPMsOnMap(props.pmData);
        }
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const currentPosition = new window.kakao.maps.LatLng(lat, lng);

                if (isInit) {
                    createMap(currentPosition);
                } else {
                    mapInstance.value.setCenter(currentPosition);
                    mapInstance.value.relayout();
                    new window.kakao.maps.Marker({
                        map: mapInstance.value,
                        position: currentPosition,
                        title: '현재 위치',
                    });
                }
            },
            () => {
                if (isInit) {
                    console.warn('Geolocation failed. Defaulting to Gumi.');
                    createMap(defaultPosition);
                } else {
                    alert('위치 정보를 가져오는 데 실패했습니다.');
                }
            }
        );
    } else {
        if (isInit) {
            console.warn('Geolocation not supported. Defaulting to Gumi.');
            createMap(defaultPosition);
        } else {
            alert('이 브라우저는 Geolocation을 지원하지 않습니다.');
        }
    }
};

const getStatusClass = (status) => {
    if (status === '운행중') return 'status-running';
    if (status === '고장') return 'status-error';
    return ''; // '대기' 상태는 기본값(회색) 사용
};

const displayPMsOnMap = (pms) => {
    if (!mapInstance.value) return;

    pmOverlays.value.forEach((overlay) => overlay.setMap(null));
    pmOverlays.value = [];

    pms.forEach((pm) => {
        const statusClass = getStatusClass(pm.status);

        // (★수정★) <img> 태그 대신 다시 SVG 변수 사용
        const content = `<div class="pm-icon-overlay ${statusClass}">${kickboardSVG}</div>`;

        const position = new window.kakao.maps.LatLng(pm.lat, pm.lng);
        const customOverlay = new window.kakao.maps.CustomOverlay({
            position: position,
            content: content,
            yAnchor: 1,
        });

        customOverlay.setMap(mapInstance.value);
        pmOverlays.value.push(customOverlay);
    });
};
</script>

<style scoped src="@/assets/styles/components/MapInfo.css"></style>
<style scoped>
.map-text {
    height: 100%;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 1.25rem;
    font-weight: 500;
}
</style>
