<template>
    <div v-if="open" class="map-modal-overlay" @click="close">
        <div class="map-modal-content" @click.stop>
            <div class="map-modal-header">
                <h3 class="map-modal-title">전체 경로 지도</h3>
                <button class="map-modal-close-btn" @click="close">
                    <v-icon name="bi-x-lg" />
                </button>
            </div>
            <div class="map-modal-body">
                <div id="large-map-container">
                    <div v-if="!pathData || pathData.length < 2" class="map-text">경로 데이터가 없습니다.</div>
                </div>

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
        </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
    open: Boolean,
    pathData: Array,
});

const emit = defineEmits(['close']);
const mapInstance = ref(null);

const close = () => {
    mapInstance.value = null; // 맵 인스턴스 제거
    emit('close');
};

/**
 * (★신규★)
 * 지도 확대
 */
const zoomIn = () => {
    if (mapInstance.value) {
        mapInstance.value.setLevel(mapInstance.value.getLevel() - 1);
    }
};

/**
 * (★신규★)
 * 지도 축소
 */
const zoomOut = () => {
    if (mapInstance.value) {
        mapInstance.value.setLevel(mapInstance.value.getLevel() + 1);
    }
};

/**
 * (★신규★)
 * 큰 지도 팝업을 초기화하는 함수
 */
const initLargeMap = () => {
    const mapContainer = document.getElementById('large-map-container');
    if (!mapContainer || !window.kakao || !window.kakao.maps) {
        return;
    }

    // 1. 경로 데이터가 없거나, 좌표가 1개 이하인 경우
    if (!props.pathData || props.pathData.length < 2) {
        return;
    }

    // 2. Polyline을 그리기 위한 좌표 배열(kakao.maps.LatLng) 생성
    const linePath = props.pathData.map(
        (point) => new window.kakao.maps.LatLng(point.location.lat, point.location.lng)
    );

    // 3. 지도를 생성합니다.
    const mapOption = {
        center: linePath[0],
        level: 5,
        disableDefaultUI: true, // (★수정★) 기본 UI는 끄고, 커스텀 UI 사용
    };
    const map = new window.kakao.maps.Map(mapContainer, mapOption);
    mapInstance.value = map;

    // 4. Polyline을 생성하고 지도에 표시합니다.
    const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#FF0000', // 빨간색
        strokeOpacity: 0.7,
        strokeStyle: 'solid',
    });
    polyline.setMap(map);

    // 5. (★중요★) 경로가 한눈에 보이도록 지도의 경계(Bounds)를 조절합니다.
    const bounds = new window.kakao.maps.LatLngBounds();
    linePath.forEach((latlng) => bounds.extend(latlng));
    map.setBounds(bounds);

    // 6. 시작점과 종료점 마커 표시
    new window.kakao.maps.Marker({
        map: map,
        position: linePath[0],
        title: '출발',
    });
    new window.kakao.maps.Marker({
        map: map,
        position: linePath[linePath.length - 1],
        title: '도착',
    });

    // 7. (★수정★) 팝업창 애니메이션(300ms) 이후 리레이아웃
    setTimeout(() => {
        if (map) {
            map.relayout();
            map.setBounds(bounds);
        }
    }, 350);
};

// 팝업창이 열릴 때(props.open이 true로 바뀔 때) 지도를 초기화
watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            mapInstance.value = null; // 맵 인스턴스 초기화
            nextTick(() => {
                initLargeMap();
            });
        }
    }
);
</script>

<style scoped src="@/assets/styles/components/MapModal.css"></style>
