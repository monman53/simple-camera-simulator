<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'

import { state } from './state'

const canvas = ref()

// Prepare offscreen canvas
const offscreenCanvas = new OffscreenCanvas(state.value.width, state.value.height);
const ctx = offscreenCanvas.getContext("2d", { alpha: false });
let mainCtx: any = null;

if (!ctx) {
  throw new Error()
}

const infR = computed(() => {
  const w = state.value.width / 2 / state.value.scale;
  const h = state.value.height / 2 / state.value.scale;
  return (Math.sqrt(w * w + h * h) + Math.sqrt(state.value.cx * state.value.cx + state.value.cy * state.value.cy)) * 3;
})

const drawSegment = (sx: number, sy: number, tx: number, ty: number) => {
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(tx, ty);
  ctx.stroke();
};

const draw = () => {
  if (!mainCtx) {
    return
  }

  ctx.reset()
  ctx.transform(state.value.scale, 0, 0, state.value.scale, state.value.width * 0.5 - state.value.cx * state.value.scale, state.value.height * 0.5 - state.value.cy * state.value.scale);
  // ctx.fillRect(state.value.viewBox.x, state.value.viewBox.y, state.value.viewBox.w, state.value.viewBox.h); // background
  ctx.globalCompositeOperation = 'lighten';

  //================================
  // Light path drawing like ray-tracing
  //================================
  for (const light of state.value.lights) {
    ctx.strokeStyle = light.color
    ctx.lineWidth = state.value.style.rayWidth
    // Draw 2^nRaysLog rays from light center
    const nRays = (1 << state.value.nRaysLog);
    for (let i = 0; i < nRays; i++) {
      // Initial position and direction
      let sx = light.x
      let sy = light.y
      let theta = 2 * Math.PI * i / nRays

      // default destination
      let tx = sx + infR.value * Math.cos(theta)
      let ty = sy + infR.value * Math.sin(theta)

      //--------------------------------
      // Collision to lens
      //--------------------------------
      {

      }

      // to infinity
      drawSegment(sx, sy, tx, ty)
    }
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

// TODO: Optimize here
watch(state, () => {
  canvas.value.width = state.value.width
  canvas.value.height = state.value.height
  offscreenCanvas.width = state.value.width
  offscreenCanvas.height = state.value.height
  window.requestAnimationFrame(draw)
}, {deep: true})

</script>

<template>
  <canvas ref="canvas" :width="state.width" :height="state.height"></canvas>
</template>

<style scoped></style>
