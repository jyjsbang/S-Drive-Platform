<template>
    <button :class="['info-button', `info-button-${variant}`, `info-button-${size}`]">
        <slot name="icon"></slot>
        <slot></slot>
    </button>
</template>
<script setup>
defineProps({
    variant: { type: String, default: 'default' }, // default, destructive, outline
    size: { type: String, default: 'default' }, // default, sm
});
</script>
<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
