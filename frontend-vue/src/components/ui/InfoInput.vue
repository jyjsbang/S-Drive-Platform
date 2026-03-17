<template>
    <div class="info-input-wrapper">
        <span v-if="hasIcon" class="info-input-icon">
            <slot name="icon"></slot>
        </span>
        <input
            :class="['info-input', { 'has-icon': hasIcon }]"
            :type="type"
            :placeholder="placeholder"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
        />
    </div>
</template>
<script setup>
defineProps({
    modelValue: String,
    placeholder: String,
    type: { type: String, default: 'text' },
    hasIcon: { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
</script>
<style scoped src="../../assets/styles/components/info/CommonUI.css"></style>

<style scoped>
/* (★핵심 수정★)
 date input이 CommonUI.css의 height: 36px를 유지하면서
 내부 텍스트가 세로 중앙에 오도록 line-height만 조절합니다.
*/
.info-input[type='date'] {
    line-height: 1.25rem;
    /* CommonUI.css의 padding (0.5rem 0.75rem)을
      그대로 사용하도록 로컬 padding을 제거합니다.
    */
}
</style>
