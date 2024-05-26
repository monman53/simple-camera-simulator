<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { state, setMemoryCanvasCtx } from './globals'

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

</script>

<template>
  <canvas ref="canvas" width="100" :height="state.height"></canvas>
</template>

<style scoped>
canvas {
  position: absolute;
}
</style>
