<template>
    <div :class="$style['info-container']">
        <div :class="$style['info-tabs']">
            <div :class="$style['tabs-list']">
                <button
                    v-for="tab in tabs"
                    :key="tab.value"
                    :class="[$style['tab-trigger'], { [$style.active]: activeTab === tab.value }]"
                    @click="activeTab = tab.value"
                >
                    {{ tab.label }}
                </button>
            </div>

            <div :class="$style['tabs-content']">
                <UserSearchTab v-show="activeTab === 'users'" />
                <DeviceSearchTab v-show="activeTab === 'devices'" />
                <RideHistoryTab v-show="activeTab === 'rides'" />
                <EventLogTab v-show="activeTab === 'events'" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import UserSearchTab from '@/components/info/UserSearchTab.vue';
import DeviceSearchTab from '@/components/info/DeviceSearchTab.vue';
import RideHistoryTab from '@/components/info/RideHistoryTab.vue';
import EventLogTab from '@/components/info/EventLogTab.vue';

const activeTab = ref('users');
const tabs = [
    { value: 'users', label: '사용자 조회' },
    { value: 'devices', label: '기기 조회' },
    { value: 'rides', label: '과거 운행 조회' },
    { value: 'events', label: '이벤트 로그 조회' },
];
</script>

<style lang="css" module src="@/assets/styles/views/InfoView.module.css"></style>
