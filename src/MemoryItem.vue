<script setup lang="ts">
import { watch, onMounted, ref } from 'vue'

import { state, options, setMemoryCanvasCtx } from './globals'

// Reference to the canvas
const canvas = ref()
let mainCtx: any = null;

onMounted(() => {
  mainCtx = canvas.value.getContext("2d");
  setMemoryCanvasCtx(mainCtx)
})

// TODO: Optimize here ('deep' is enabled)
watch([() => state.value.height], () => {
  canvas.value.height = state.value.height
  options.value.sensorMemory = false
}, { deep: true })

</script>

<template>
  <canvas
    ref="canvas"
    width="100"
    :height="state.height"
  />
  <button @click="options.sensorMemory = false">
    <i class="bi bi-trash3-fill" />
  </button>
</template>

<style scoped>
canvas,
button {
  position: absolute;
}
</style>
