<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'

import { state, sensor, sensorData, options, style } from './globals'

// Reference to the canvas
const canvas = ref()

// Prepare offscreen canvas
const offscreenCanvas = new OffscreenCanvas(100, state.value.height);
const ctx = offscreenCanvas.getContext("2d", { alpha: false });
let mainCtx: any = null;

if (!ctx) {
  throw new Error()
}

const draw = () => {
  const height = state.value.height
  const scale = height / (sensor.value.r * 2)
  ctx.reset()
  ctx.transform(scale*2, 0, 0, scale, 100 * 0.5, height * 0.5);
  // ctx.fillRect(params.viewBox.x, params.viewBox.y, params.viewBox.w, params.viewBox.h); // background
  ctx.globalCompositeOperation = 'lighten';

  for (const p of sensorData.value) {
    ctx.beginPath()
    ctx.fillStyle = `hsl(${p.color}, 100%, 50%)`;
    ctx.arc(0, p.y, style.value.rayWidth, 0, 2 * Math.PI);
    ctx.fill()
    ctx.stroke();
  }

  //--------------------------------
  // Copy offscreen render result to main canvas
  //--------------------------------
  mainCtx.transferFromImageBitmap(offscreenCanvas.transferToImageBitmap());
}

onMounted(() => {
  if (!canvas) {
    return;
  }
  mainCtx = canvas.value.getContext("bitmaprenderer");
  window.requestAnimationFrame(draw)
})

// TODO: Optimize here ('deep' is enabled)
watch([sensor, sensorData], () => {
  window.requestAnimationFrame(draw)
}, { deep: true })

</script>

<template>
  <canvas ref="canvas" width="100" :height="state.height"></canvas>
</template>

<style scoped></style>
