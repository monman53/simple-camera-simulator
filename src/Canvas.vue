<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'

const props = defineProps(['params'])
const params = props.params

const canvas = ref()

// Prepare offscreen canvas
const offscreenCanvas = new OffscreenCanvas(params.width, params.height);
const ctx = offscreenCanvas.getContext("2d", { alpha: false });
let mainCtx: any = null;

const draw = () => {
  if (!ctx || !mainCtx) {
    return;
  }

  ctx.reset();
  ctx.transform(params.scale, 0, 0, params.scale, params.width * 0.5 - params.cx * params.scale, params.height * 0.5 - params.cy * params.scale);
  // ctx.fillRect(params.viewBox.x, params.viewBox.y, params.viewBox.w, params.viewBox.h); // background
  // ctx.fillRect(0, 0, 100, 100); // black background
  ctx.globalCompositeOperation = 'lighten';

  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'red';
  ctx.fill();
  // ctx.lineWidth = 5;
  // ctx.strokeStyle = '#003300';
  ctx.stroke();

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

watch([() => params.width, () => params.height], () => {
  canvas.value.width = params.width
  canvas.value.height = params.height
  offscreenCanvas.width = params.width
  offscreenCanvas.height = params.height
})

watch([params], () => {
  window.requestAnimationFrame(draw)
})

</script>

<template>
  <canvas ref="canvas" :width="params.width" :height="params.height"></canvas>
</template>

<style scoped></style>
