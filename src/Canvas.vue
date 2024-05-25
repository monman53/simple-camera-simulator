<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'

import { state, lights, lens, style, infR } from './grobals'

// Reference to the canvas
const canvas = ref()

// Prepare offscreen canvas
const offscreenCanvas = new OffscreenCanvas(state.value.width, state.value.height);
const ctx = offscreenCanvas.getContext("2d", { alpha: false });
let mainCtx: any = null;

if (!ctx) {
  throw new Error()
}

const drawSegment = (sx: number, sy: number, tx: number, ty: number) => {
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(tx, ty);
  ctx.stroke();
};

const draw = () => {
  const params = state.value;

  ctx.reset()
  ctx.transform(params.scale, 0, 0, params.scale, params.width * 0.5 - params.cx * params.scale, params.height * 0.5 - params.cy * params.scale);
  // ctx.fillRect(params.viewBox.x, params.viewBox.y, params.viewBox.w, params.viewBox.h); // background
  ctx.globalCompositeOperation = 'lighten';

  //================================
  // Light path drawing like ray-tracing
  //================================
  for (const light of lights.value) {
    ctx.strokeStyle = light.color
    ctx.lineWidth = style.value.rayWidth
    // Draw 2^nRaysLog rays from light center
    const nRays = (1 << params.nRaysLog);
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

// TODO: Optimize here ('deep' is enabled)
watch([state, style, lens], () => {
  canvas.value.width = state.value.width
  canvas.value.height = state.value.height
  offscreenCanvas.width = state.value.width
  offscreenCanvas.height = state.value.height
  window.requestAnimationFrame(draw)
}, { deep: true })

</script>

<template>
  <canvas ref="canvas" :width="state.width" :height="state.height"></canvas>
</template>

<style scoped></style>
