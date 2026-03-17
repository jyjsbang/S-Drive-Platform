<template>
    <span :class="['info-badge', `info-badge-${variant}`]">
        <slot></slot>
    </span>
</template>
<script setup>
defineProps({
    variant: { type: String, default: 'default' }, // default, secondary, destructive, outline
});
</script>
<style scoped src="../../assets/styles/components/info/CommonUI.css"></style>
