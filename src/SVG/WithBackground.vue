<script setup lang="ts">
defineProps({
    ui: {
        type: Boolean,
        default: false,
    }
})
</script>

<template>
  <g class="background">
    <slot />
  </g>
  <g class="foreground">
    <slot />
  </g>
  <g
    v-if="ui"
    class="ui"
  >
    <slot />
  </g>
</template>