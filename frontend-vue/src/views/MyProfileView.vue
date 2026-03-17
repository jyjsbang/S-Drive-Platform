<template>
    <div class="profile-container">
        <div class="profile-grid">
            <div class="profile-card">
                <h3 class="card-title">기본 계정 정보</h3>
                <form class="profile-form" @submit.prevent="saveProfile">
                    <div class="form-group">
                        <label class="profile-label" for="adminId">관리자 아이디 (login_id)</label>
                        <input id="adminId" v-model="profileData.login_id" type="text" class="profile-input" readonly />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="adminName">관리자 이름 (user_name)</label>
                        <input
                            id="adminName"
                            v-model="profileData.user_name"
                            type="text"
                            class="profile-input"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="adminPhone">휴대폰 번호 (telno)</label>
                        <input
                            id="adminPhone"
                            v-model="profileData.telno"
                            type="tel"
                            class="profile-input"
                            placeholder="010-0000-0000"
                            required
                        />
                    </div>
                    <button type="submit" class="profile-button">변경사항 저장</button>
                </form>
            </div>

            <div class="profile-card">
                <h3 class="card-title">보안 설정</h3>
                <form class="profile-form" @submit.prevent="changePassword">
                    <div class="form-group">
                        <label class="profile-label" for="currentPw">현재 비밀번호</label>
                        <input
                            id="currentPw"
                            v-model="passwordData.currentPw"
                            type="password"
                            class="profile-input"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="newPw">새 비밀번호</label>
                        <input id="newPw" v-model="passwordData.newPw" type="password" class="profile-input" required />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="confirmPw">새 비밀번호 확인</label>
                        <input
                            id="confirmPw"
                            v-model="passwordData.confirmPw"
                            type="password"
                            class="profile-input"
                            required
                        />
                    </div>
                    <button type="submit" class="profile-button">비밀번호 변경</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/index.js';
// (★제거됨★) '내 활동 로그' 관련 import 삭제

// --- 1. 로그인한 사용자 '객체' 가져오기 (★수정★: API 호출을 위해 ref만 유지) ---
const loggedInUser = ref(null);

// (★제거★) getLoggedInUser 함수 (API 호출로 대체됨)
// const getLoggedInUser = () => { ... };

// --- 2. 프로필 폼 데이터 ---
const profileData = ref({
    user_id: '',
    login_id: 'loading...',
    user_name: '',
    telno: '',
});

// --- 3. 비밀번호 변경 폼 ---
const passwordData = ref({
    currentPw: '',
    newPw: '',
    confirmPw: '',
});

/**
 * (★신규★) 2.4
 * 페이지 로드 시, localStorage 대신 API를 호출하여 프로필 로드
 */
const loadProfileFromAPI = async () => {
    try {
        // (★신규★) 명세서의 GET /api/auth/me 호출
        const user = await apiClient.get('/auth/me');

        if (!user || !user.userId) {
            throw new Error('Invalid user data from API');
        }

        // (★신규★) API 응답으로 loggedInUser ref 설정
        // (참고: API 응답이 localStorage에 저장된 'user' 객체와 형식이 다를 수 있음)
        // (api/index.js 인터셉터가 토큰을 localStorage에서 읽으므로,
        //  로그인 시 저장했던 'user' 객체 형식을 유지하며 API 응답으로 덮어씀)
        const storedUserString = localStorage.getItem('user');
        const storedUser = storedUserString ? JSON.parse(storedUserString) : {};

        loggedInUser.value = {
            ...storedUser, // 기존 토큰 정보 등 유지
            userId: user.userId,
            loginId: user.loginId,
            nickname: user.nickname,
            telno: user.telno,
            role: user.role,
        };

        // (★신규★) 최신 정보로 localStorage 업데이트
        localStorage.setItem('user', JSON.stringify(loggedInUser.value));

        // 폼 데이터 채우기 (API 응답 기준)
        profileData.value.user_id = user.userId;
        profileData.value.login_id = user.loginId;
        profileData.value.user_name = user.nickname;
        profileData.value.telno = user.telno;
    } catch (error) {
        console.error('Failed to load profile from API:', error);
        alert('로그인 정보를 불러오는 데 실패했습니다. 다시 로그인해주세요.');
        localStorage.clear();
        window.location.href = '/login';
    }
};

/**
 * '변경사항 저장' 버튼 클릭 시 (★기능 활성화★)
 */
const saveProfile = async () => {
    if (!loggedInUser.value) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
    }

    try {
        const params = {
            nickname: profileData.value.user_name,
            telno: profileData.value.telno,
        };

        // (★수정★) 1.1에서 수정한 내용 (/auth/me)
        const response = await apiClient.put('/auth/me', params);

        alert('프로필이 성공적으로 저장되었습니다.');

        // (★수정★) 2.4: API 응답(response) 기준으로 localStorage 업데이트
        const updatedUser = { ...loggedInUser.value, ...response };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // (★수정★) 2.4: API를 다시 호출하여 폼 새로고침
        loadProfileFromAPI();
    } catch (error) {
        console.error('프로필 저장 실패:', error);
        alert('프로필 저장 중 오류가 발생했습니다.');
    }
};

/**
 * '비밀번호 변경' 버튼 클릭 시
 */
const changePassword = async () => {
    if (passwordData.value.newPw !== passwordData.value.confirmPw) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
    }
    if (!passwordData.value.newPw) {
        alert('새 비밀번호를 입력하세요.');
        return;
    }

    try {
        const params = {
            currentPassword: passwordData.value.currentPw,
            newPassword: passwordData.value.newPw,
        };

        await apiClient.put(`/auth/password`, params);

        alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
        localStorage.clear();
        window.location.href = '/login';
    } catch (error) {
        console.error('비밀번호 변경 실패:', error);
        alert('비밀번호 변경 중 오류가 발생했습니다. (현재 비밀번호가 틀렸거나 오류 발생)');
    }
};

// --- 4. (★제거됨★) '내 활동 로그' 관련 스크립트가 모두 삭제되었습니다. ---

// --- 5. (★수정★) 2.4: 마운트 시 API에서 정보 로드 ---
onMounted(() => {
    loadProfileFromAPI();
    // (★제거됨★) fetchLogs(1) 호출이 삭제되었습니다.
});
</script>

<style scoped src="@/assets/styles/views/MyProfileView.css"></style>
