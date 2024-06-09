<script setup lang="ts">
import { watch, onMounted, ref } from 'vue'

import { state, options, setMemoryCanvasCtx } from './globals'

// Reference to the canvas
const canvas = ref()
let mainCtx: any = null;

onMounted(() => {
  if (!canvas) {
    return;
  }
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
  <canvas ref="canvas" width="100" :height="state.height"></canvas>
</template>

<style scoped>
canvas {
  position: absolute;
}
</style>
