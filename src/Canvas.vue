<script setup lang="ts">
import { watch, onMounted, ref } from 'vue'

import { state, lights, lens, sensor, sensorData, apple, options, style, lensR, lensD, infR } from './globals'
import { Vec, vec, getIntersectionY, getIntersectionLens, crossAngle } from './math'

// Reference to the canvas
const canvas = ref()

// Prepare offscreen canvas
const offscreenCanvas = new OffscreenCanvas(state.value.width, state.value.height);
const ctx = offscreenCanvas.getContext("2d", { alpha: false });
let mainCtx: any = null;

if (!ctx) {
  throw new Error()
}

// const drawSegment = (sx: number, sy: number, tx: number, ty: number) => {
//   ctx.beginPath();
//   ctx.moveTo(sx, sy);
//   ctx.lineTo(tx, ty);
//   ctx.stroke();
// };

const drawSegment = (p: Vec, v: Vec, length: number) => {
  const q = p.copy().add(v.copy().normalize().mul(length))
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(q.x, q.y);
  ctx.stroke();
  return q
};

const drawRay = (imageX: number, imageY: number, light: any, s: Vec, v: Vec, sensorDataTmp: any[]) => {
  let innerLens = false

  //--------------------------------
  // Collision to lens surface (left-side)
  //--------------------------------
  if (!options.value.lensIdeal && options.value.lens) {
    // Center of lens curvature circle
    const c = vec(lens.value.x - lensD.value / 2 + lensR.value, 0)

    const p = getIntersectionLens(s.x, s.y, v, c.x, c.y, lens.value.r, lensR.value, true)
    if (p) {
      v = p.copy().sub(s)
      s = drawSegment(s, v, v.length())

      // Refraction (inner lens rays)
      const phi1 = crossAngle(Vec.sub(v, c), Vec.sub(vec(light.x, light.y), p));
      const phi2 = Math.asin(Math.sin(phi1) / lens.value.n);
      const theta = Math.atan2(p.y - c.y, p.x - c.x) + Math.PI + phi2;
      v = vec(Math.cos(theta), Math.sin(theta))

      innerLens = true
    }
  }

  //--------------------------------
  // Collision to aperture
  //--------------------------------
  if (options.value.aperture) {
    const p = getIntersectionY(s.x, s.y, v, lens.value.x, -lens.value.r, lens.value.r)
    if (p) {
      const upperHit = p.y > lens.value.aperture * lens.value.r
      const lowerHit = p.y < -lens.value.aperture * lens.value.r
      if (lowerHit || upperHit) {
        v = p.copy().sub(s)
        drawSegment(s, v, v.length())
        return
      }
    }
  }

  //--------------------------------
  // Collision to lens surface (right-side)
  //--------------------------------
  if (!options.value.lensIdeal && innerLens) {
    // Center of lens curvature circle
    const c = vec(lens.value.x + lensD.value / 2 - lensR.value, 0)

    const p = getIntersectionLens(s.x, s.y, v, c.x, c.y, lens.value.r, lensR.value, false)
    if (p) {
      v = p.copy().sub(s)
      const nextS = drawSegment(s, v, v.length())

      // Refraction (inner lens rays)
      const phi1 = crossAngle(Vec.sub(p, c), Vec.sub(p, s));
      const phi2 = Math.asin(Math.sin(phi1) * lens.value.n);
      const theta = Math.atan2(p.y - c.y, p.x - c.x) + phi2;
      v = vec(Math.cos(theta), Math.sin(theta))
      s = nextS
    }
  }

  //--------------------------------
  // Collision to ideal lens
  //--------------------------------
  if (options.value.lensIdeal && options.value.lens) {
    const p = getIntersectionY(s.x, s.y, v, lens.value.x, -lens.value.r, lens.value.r)
    if (p) {
      v = p.copy().sub(s)
      s = drawSegment(s, v, v.length())

      // Refracted ray
      let theta = Math.atan2(imageY - s.y, imageX);
      if (imageX === Infinity) {
        theta = Math.atan2(-light.y, -(light.x - lens.value.x));
      }
      if (lens.value.x - lens.value.f < light.x) {
        theta += Math.PI;
      }
      v = vec(Math.cos(theta), Math.sin(theta))
    }
  }

  //--------------------------------
  // Collision to body
  //--------------------------------
  if (options.value.body) {
    // Upper
    {
      const p = getIntersectionY(s.x, s.y, v, lens.value.x, lens.value.r, infR.value);
      if (p) {
        v = p.copy().sub(s)
        drawSegment(s, v, v.length())
        return
      }
    }
    // Lower
    {
      const p = getIntersectionY(s.x, s.y, v, lens.value.x, -infR.value, -lens.value.r);
      if (p) {
        v = p.copy().sub(s)
        drawSegment(s, v, v.length())
        return
      }
    }
  }

  //--------------------------------
  // Collision to sensor
  //--------------------------------
  if (options.value.sensor) {
    const p = getIntersectionY(s.x, s.y, v, sensor.value.x, -sensor.value.r, sensor.value.r);
    if (p) {
      v = p.copy().sub(s)
      drawSegment(s, v, v.length())
      sensorDataTmp.push({ y: p.y, color: light.color })
      return
    }
  }

  // to infinity
  drawSegment(s, v, infR.value)
  return
}

const draw = () => {
  const params = state.value

  ctx.reset()
  ctx.transform(params.scale, 0, 0, params.scale, params.width * 0.5 - params.cx * params.scale, params.height * 0.5 - params.cy * params.scale);
  // ctx.fillRect(params.viewBox.x, params.viewBox.y, params.viewBox.w, params.viewBox.h); // background
  ctx.globalCompositeOperation = 'lighten';

  // Data for screen drawing
  const sensorDataTmp: any[] = []

  //================================
  // Light path drawing like ray-tracing
  //================================

  // Point sources
  for (const light of lights.value) {
    ctx.strokeStyle = `hsl(${light.color}, 100%, 50%, ${style.value.rayIntensity})`
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
      const sx = light.x
      const sy = light.y
      const theta = 2 * Math.PI * i / nRays
      const v = vec(Math.cos(theta), Math.sin(theta))
      drawRay(imageX, imageY, light, vec(sx, sy), v, sensorDataTmp)
    }
  }

  // Apple
  if (options.value.apple) {
    for (const light of apple.value) {
      ctx.strokeStyle = `hsl(${light.color}, 100%, 50%, ${style.value.rayIntensity})`
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
        const sx = light.x
        const sy = light.y
        const theta = 2 * Math.PI * i / nRays
        const v = vec(Math.cos(theta), Math.sin(theta))
        drawRay(imageX, imageY, light, vec(sx, sy), v, sensorDataTmp)
      }
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
watch([state, lights, apple, lens, sensor, options, style], () => {
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
