<template>
    <div class="login-container">
        <div class="login-box">
            <h1 class="login-title">개인형 이동장치<br />관제 시스템</h1>

            <form class="login-form" @submit.prevent="userLogin">
                <input v-model="loginData.login_id" type="text" class="login-input" placeholder="아이디" required />

                <input
                    v-model="loginData.user_pw"
                    type="password"
                    class="login-input"
                    placeholder="비밀번호"
                    required
                />

                <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

                <button type="submit" class="login-button">로그인</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api';

const router = useRouter();

// t_user 스키마의 login_id, user_pw와 일치
const loginData = ref({
    login_id: '',
    user_pw: '',
});
const errorMsg = ref(null);

const userLogin = async () => {
    if (!loginData.value.login_id || !loginData.value.user_pw) {
        errorMsg.value = '아이디와 비밀번호를 모두 입력해주세요.';
        return;
    }

    try {
        // 백엔드가 기대하는 'loginId'로 전송
        const loginResult = await apiClient.post('/auth/login', {
            loginId: loginData.value.login_id,
            password: loginData.value.user_pw,
        });

        // (★핵심 수정★)
        // 백엔드가 'accessToken' 키로 토큰을 반환하므로
        // 'loginResult.token'이 아닌 'loginResult.accessToken'을 읽어야 합니다.
        if (loginResult && loginResult.user && loginResult.user.userId && loginResult.accessToken) {
            const userToStore = {
                ...loginResult.user,
                token: loginResult.accessToken, // ⬅️ 'token' -> 'accessToken'
            };

            // api/index.js의 인터셉터가 'user' 객체 안의 'token' 키를 사용합니다.
            localStorage.setItem('user', JSON.stringify(userToStore));

            errorMsg.value = null;
            router.push('/'); // 대시보드 페이지로 이동
        } else {
            // (로그인 실패)
            errorMsg.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
        }
    } catch (error) {
        // (로그인 실패) 서버 에러 또는 apiResponse.success === false
        console.error('로그인 실패 또는 서버 오류:', error);
        errorMsg.value = error.message || '로그인 중 오류가 발생했습니다.';
    }
};
</script>

<style scoped src="@/assets/styles/views/LoginView.css"></style>
