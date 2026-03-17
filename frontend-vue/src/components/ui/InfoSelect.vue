<template>
    <div>
        <label v-if="label" class="info-label">{{ label }}</label>
        <select
            class="info-select-trigger"
            :value="modelValue"
            @change="$emit('update:modelValue', $event.target.value)"
        >
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
    </div>
</template>
<script setup>
defineProps({
    modelValue: String,
    label: String,
    options: { type: Array, default: () => [] }, // [{ value: 'v', label: 'L' }]
});
defineEmits(['update:modelValue']);
</script>
<style scoped src="../../assets/styles/components/info/CommonUI.css"></style>
