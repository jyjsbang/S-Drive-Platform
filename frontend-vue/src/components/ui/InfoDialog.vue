<template>
    <div v-if="open" class="info-dialog-portal">
        <div class="info-dialog-overlay" @click="close"></div>
        <div class="info-dialog-content">
            <div class="info-dialog-header">
                <h3 class="info-dialog-title">{{ title }}</h3>
            </div>
            <slot></slot>
            <button class="info-dialog-close-btn" @click="close">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    </div>
</template>
<script setup>
const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: 'Dialog Title' },
});
const emit = defineEmits(['update:open']);
const close = () => {
    emit('update:open', false);
};
</script>
<style scoped src="../../assets/styles/components/info/CommonUI.css"></style>
