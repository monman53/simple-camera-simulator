<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'

const props = defineProps(['params'])
const params = props.params

const canvas = ref()

// Prepare offscreen canvas
const offscreenCanvas = new OffscreenCanvas(params.width, params.height);
const ctx = offscreenCanvas.getContext("2d", { alpha: false });
let mainCtx: any = null;

if (!ctx) {
  throw new Error()
}

const infR = computed(() => {
  const w = params.width / 2 / params.scale;
  const h = params.height / 2 / params.scale;
  return (Math.sqrt(w * w + h * h) + Math.sqrt(params.cx * params.cx + params.cy * params.cy)) * 3;
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
  ctx.transform(params.scale, 0, 0, params.scale, params.width * 0.5 - params.cx * params.scale, params.height * 0.5 - params.cy * params.scale);
  // ctx.fillRect(params.viewBox.x, params.viewBox.y, params.viewBox.w, params.viewBox.h); // background
  ctx.globalCompositeOperation = 'lighten';

  //================================
  // Ray-tracing like light path drawing
  //================================
  for (const light of params.lights) {
    ctx.strokeStyle = light.color
    ctx.lineWidth = params.style.rayWidth
    // Draw 2^nRaysLog rays from light center
    const nRays = (1 << params.nRaysLog);
    for (let i = 0; i < nRays; i++) {
      const sx = light.x
      const sy = light.y
      const tx = sx + infR.value * Math.cos(2 * Math.PI * i / nRays)
      const ty = sy + infR.value * Math.sin(2 * Math.PI * i / nRays)
      drawSegment(sx, sy, tx, ty)
    }
    // // debug
    // ctx.beginPath();
    // ctx.arc(light.x, light.y, params.style.rLight, 0, 2 * Math.PI, false)
    // ctx.fillStyle = light.color
    // ctx.fill()
    // ctx.stroke()
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
