<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'

import { state, lights, lens, sensor, sensorData, options, style, infR } from './globals'
import { getIntersectionY } from './math'

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

  const sensorDataTmp = []

  //================================
  // Light path drawing like ray-tracing
  //================================
  for (const light of lights.value) {
    ctx.strokeStyle = `hsl(${light.color}, 100%, 50%)`
    ctx.lineWidth = style.value.rayWidth

    // Find image position of the light source
    const s1 = lens.value.x - light.x;
    const s2 = lens.value.f * s1 / (s1 - lens.value.f);
    const imageX = s2;
    const imageY = -light.y * (s2 / s1)

    // Draw 2^nRaysLog rays from light center
    const nRays = (1 << params.nRaysLog);
    for (let i = 0; i < nRays; i++) {
      // Initial position and direction
      let sx = light.x
      let sy = light.y
      let theta = 2 * Math.PI * i / nRays
      let tx: number;
      let ty: number;

      //--------------------------------
      // Collision to lens
      //--------------------------------
      if (options.value.lens) {
        const p = getIntersectionY(sx, sy, theta, lens.value.x, -lens.value.r, lens.value.r);
        if (p) {
          tx = p.x
          ty = p.y
          drawSegment(sx, sy, tx, ty)

          // Refracted ray
          sx = tx;
          sy = ty;
          theta = Math.atan2(imageY - ty, imageX);
          if (imageX === Infinity) {
            theta = Math.atan2(-light.y, -(light.x - lens.value.x));
          }
          if (lens.value.x - lens.value.f < light.x) {
            theta += Math.PI;
          }
        }
      }

      //--------------------------------
      // Collision to body
      //--------------------------------
      if (options.value.body) {
        // Upper
        {
          const p = getIntersectionY(sx, sy, theta, lens.value.x, lens.value.r, infR.value);
          if (p) {
            tx = p.x
            ty = p.y
            drawSegment(sx, sy, tx, ty)
            continue;
          }
        }
        // Lower
        {
          const p = getIntersectionY(sx, sy, theta, lens.value.x, -infR.value, -lens.value.r);
          if (p) {
            tx = p.x
            ty = p.y
            drawSegment(sx, sy, tx, ty)
            continue;
          }
        }
      }

      //--------------------------------
      // Collision to sensor
      //--------------------------------
      if (options.value.sensor) {
        const p = getIntersectionY(sx, sy, theta, sensor.value.x, -sensor.value.r, sensor.value.r);
        if (p) {
          tx = p.x
          ty = p.y
          drawSegment(sx, sy, tx, ty)
          sensorDataTmp.push({y: p.y, color: light.color})
          continue;
        }
      }

      // to infinity
      tx = sx + infR.value * Math.cos(theta)
      ty = sy + infR.value * Math.sin(theta)
      drawSegment(sx, sy, tx, ty)
    }
  }

  sensorData.value = sensorDataTmp

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
watch([state, lights, lens, sensor, options, style], () => {
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
