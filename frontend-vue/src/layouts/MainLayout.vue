<template>
    <div class="app-layout">
        <Sidebar />
        <div class="main-content-wrapper">
            <Header />
            <main class="page-content">
                <router-view />
            </main>
        </div>

        <SettingsModal />
    </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import SettingsModal from '@/components/SettingsModal.vue'; // (★추가★)
</script>

<style scoped src="@/assets/styles/layouts/MainLayout.css"></style>
