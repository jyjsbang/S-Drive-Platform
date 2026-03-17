<template>
    <div class="stat-card">
        <div class="stat-card-header">
            <h3 class="stat-card-title">{{ title }}</h3>
            <div class="stat-card-action">
                <slot name="action"></slot>
            </div>
        </div>
        <div class="stat-card-content">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: String,
});
</script>

<style scoped src="@/assets/styles/components/StatCard.css"></style>
