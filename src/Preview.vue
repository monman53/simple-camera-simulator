<script setup lang="ts">
import { watch, onMounted, ref, computed } from 'vue'

import { state, sensor, sensorData, options, style, memoryCanvasCtx } from './globals'

// Reference to the canvas
const canvas = ref()

// Prepare offscreen canvas
const offscreenCanvas = new OffscreenCanvas(100, state.value.height);
const ctx = offscreenCanvas.getContext("2d", { alpha: false });
let mainCtx: any = null;

if (!ctx) {
  throw new Error()
}

const d = computed(() => {
  return sensor.value.t.sub(sensor.value.s).length()
})

const draw = () => {
  const height = state.value.height
  const scale = height / d.value
  ctx.reset()
  ctx.transform(scale * 2, 0, 0, scale, 100 * 0.5, height * 0.5);
  ctx.globalCompositeOperation = 'lighten';

  // Lights
  for (const p of sensorData.value) {
    ctx.beginPath()
    ctx.fillStyle = `hsl(${p.color}, 100%, 50%, ${style.value.rayIntensity})`;
    ctx.rect(-10, (p.y - d.value / 2) - style.value.rayWidth / 2, 20, style.value.rayWidth)
    ctx.fill()
    ctx.stroke();
  }

  // Circle of confession
  if (options.value.circleOfConfusion) {
    ctx.beginPath();
    ctx.fillStyle = 'white'
    const width = 0.005 * d.value
    ctx.rect(-width / 2, -sensor.value.circleOfConfusion / 2, width, sensor.value.circleOfConfusion);
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

// TODO: Optimize here ('deep' is enabled)
watch([state, sensor, options, style], () => {
  canvas.value.height = state.value.height
  offscreenCanvas.height = state.value.height
}, { deep: true })

const save = () => {
  memoryCanvasCtx.drawImage(mainCtx.canvas, 0, 0)
  options.value.sensorMemory = true
}

</script>

<template>
  <canvas ref="canvas" width="100" :height="state.height"></canvas>
  <button @click="save"><i class="bi bi-camera-fill"></i></button>
</template>

<style scoped>
canvas,
button {
  position: absolute
}
</style>
