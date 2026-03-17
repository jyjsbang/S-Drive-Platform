<template>
    <nav class="sidebar">
        <div>
            <div class="sidebar-header">
                <h2>개인형 이동장치<br />관제 시스템</h2>
            </div>
            <ul class="sidebar-menu">
                <router-link to="/" class="menu-item">
                    <v-icon name="bi-grid" />
                    <span>대시보드</span>
                </router-link>

                <router-link to="/realtime" class="menu-item">
                    <v-icon name="bi-display" />
                    <span>실시간 관제</span>
                </router-link>

                <router-link to="/stats" class="menu-item">
                    <v-icon name="bi-bar-chart" />
                    <span>통계 분석</span>
                </router-link>

                <router-link to="/info" class="menu-item">
                    <v-icon name="bi-info-circle" />
                    <span>정보 조회</span>
                </router-link>
            </ul>
        </div>

        <div class="sidebar-footer">
            <button @click="handleLogout" class="menu-item logout-button">
                <v-icon name="bi-box-arrow-right" />
                <span>로그아웃</span>
            </button>
        </div>
    </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import apiClient from '@/api/index.js';

const router = useRouter();

const handleLogout = async () => {
    try {
        // ⬇️ (핵심 수정) '/userLogout.json' -> '/auth/logout'
        // (baseURL: '/api' + '/auth/logout' = '/api/auth/logout')
        await apiClient.post('/auth/logout');

        console.log('백엔드 로그아웃 요청 성공');
    } catch (error) {
        // 백엔드 API 호출이 실패해도 프론트엔드에서는 로그아웃을 강행합니다.
        console.error('로그아웃 API 호출 실패:', error);
    } finally {
        // (중요) localStorage에서 'user' 객체를 제거
        localStorage.removeItem('user');

        // 로그인 페이지로 이동 (페이지 새로고침)
        // router.push('/login') 대신 window.location을 사용하면
        // 모든 상태(State)가 초기화되어 더 안전합니다.
        window.location.href = '/login';
    }
};
</script>

<style scoped src="@/assets/styles/components/Sidebar.css"></style>
