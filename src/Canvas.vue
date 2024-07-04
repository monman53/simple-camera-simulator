<script setup lang="ts">
import { watch, onMounted, ref } from 'vue'

import { state, lights, lensGroups, sensor, sensorData, apple, options, style, infR, lensesSorted, lensRs, lensFs, body, lensFronts, aperture, lensBacks } from './globals'
import { Vec, vec, vecRad } from './math'

import { Light, type Ray } from './type'
import { rayTrace } from './rayTrace';

// Reference to the canvas
const canvas = ref()

// Prepare offscreen canvas
const offscreenCanvas = new OffscreenCanvas(state.value.width, state.value.height);
const ctx = offscreenCanvas.getContext("2d", { alpha: false });
let mainCtx: any = null;

if (!ctx) {
  throw new Error()
}

const drawSegment = (p: Vec, q: Vec) => {
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(q.x, q.y);
  ctx.stroke();
};

const drawRay = (rays: Ray[], sensorDataTmp: any[]) => {
  const segments = rayTrace(rays)
  segments.forEach((raySegments, i) => {
    const color = rays[i].color
    ctx.strokeStyle = `hsl(${color}, 100%, 50%, ${style.value.rayIntensity})`
    raySegments.forEach(segment => {
      const s = segment.s
      const t = segment.t
      drawSegment(s, t)
      if (segment.isSensor) {
        sensorDataTmp.push({ y: t.sub(sensor.value.s).length(), color })
        return
      }
    })
  })
}

const draw = () => {
  const params = state.value

  ctx.reset()
  ctx.transform(params.scale, 0, 0, params.scale, params.width * 0.5 - params.c.x * params.scale, params.height * 0.5 - params.c.y * params.scale);
  // ctx.fillRect(params.viewBox.x, params.viewBox.y, params.viewBox.w, params.viewBox.h); // background
  ctx.globalCompositeOperation = 'lighten';

  // Data for screen drawing
  const sensorDataTmp: any[] = []

  //================================
  // Light path drawing
  //================================

  ctx.lineWidth = style.value.rayWidth

  const rays: Ray[] = []

  // Light sources
  for (const light of lights.value) {
    // Point light source
    if (light.type === Light.Point) {
      // Draw 2^nRaysLog rays from light center
      const nRays = (1 << params.nRaysLog);
      for (let i = 0; i < nRays; i++) {
        // Initial position and direction
        const s = light.c.copy()
        const theta = 2 * Math.PI * i / nRays
        const v = vecRad(theta)
        for (let color of light.colors) {
          rays.push({ s, v, color, idx: rays.length })
        }
      }
    }

    // Parallel light source
    if (light.type === Light.Parallel) {
      const l = Vec.sub(light.t, light.s)
      const ln = l.normalize()
      const length = l.length()
      // TODO:
      const nRays = Math.floor((length / (2 * Math.PI)) * (1 << params.nRaysLog) * 0.01)
      for (let i = 0; i < nRays; i++) {
        const s = light.s.add(ln.mul(i / nRays * length))
        const v = l.rotate(-Math.PI / 2).normalize()
        for (let color of light.colors) {
          rays.push({ s, v, color, idx: rays.length })
        }
      }
    }
  }

  // Apple
  if (options.value.apple) {
    for (const light of apple.value) {
      // Draw 2^nRaysLog rays from light center
      const nRays = (1 << params.nRaysLog);
      for (let i = 0; i < nRays; i++) {
        // Initial position and direction
        const s = vec(light.c.x, light.c.y)
        const theta = 2 * Math.PI * i / nRays
        const v = vecRad(theta)
        rays.push({ s, v, color: light.color, idx: rays.length })
      }
    }
  }

  drawRay(rays, sensorDataTmp)

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
watch([state, lights, apple, lensGroups, aperture, sensor, options, style], () => {
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
