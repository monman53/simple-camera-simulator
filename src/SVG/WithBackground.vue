<script setup lang="ts">
const props = defineProps({
    ui: {
        type: Boolean,
        default: false,
    }
})
</script>

<template>
    <g class="background">
        <slot></slot>
    </g>
    <g class="foreground">
        <slot></slot>
    </g>
    <g v-if="ui" class="ui">
        <slot></slot>
    </g>
</template>