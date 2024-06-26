<script setup lang="ts">
import { watch, onMounted, ref } from 'vue'

import { state, lights, lens, sensor, sensorData, apple, options, style, lensR, lensD, infR } from './globals'
import { Vec, vec, vecRad, getIntersectionLens, crossAngle, fGaussian, intersectionSS } from './math'

import { Light } from './type'

// Reference to the canvas
const canvas = ref()

// Prepare offscreen canvas
const offscreenCanvas = new OffscreenCanvas(state.value.width, state.value.height);
const ctx = offscreenCanvas.getContext("2d", { alpha: false });
let mainCtx: any = null;

if (!ctx) {
  throw new Error()
}

const drawSegment = (p: Vec, v: Vec, length: number) => {
  const q = p.add(v.normalize().mul(length))
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(q.x, q.y);
  ctx.stroke();
  return q
};

const drawRay = (image: Vec, s0: Vec, s: Vec, v: Vec, color: number, sensorDataTmp: any[]) => {
  let innerLens = false

  //--------------------------------
  // Collision to lens surface (left-side)
  //--------------------------------
  if (!options.value.lensIdeal && options.value.lens) {
    // Center of lens curvature circle
    const c = vec(lens.value.x - lensD.value / 2 + lensR.value, 0)

    const p = getIntersectionLens(s, v, c, lens.value.r, lensR.value, true)
    if (p) {
      v = p.sub(s)
      s = drawSegment(s, v, v.length())

      // Refraction (inner lens rays)
      const phi1 = crossAngle(Vec.sub(p, c), Vec.sub(s0, p));
      const phi2 = Math.asin(Math.sin(phi1) / lens.value.n);
      const theta = Math.atan2(p.y - c.y, p.x - c.x) + Math.PI + phi2;
      v = vecRad(theta)

      innerLens = true
    }
  }

  //--------------------------------
  // Collision to aperture
  //--------------------------------
  if (options.value.aperture) {
    const p = intersectionSS(s, s.add(v.normalize().mul(infR.value)), vec(lens.value.x, -lens.value.r), vec(lens.value.x, lens.value.r))
    if (p) {
      const upperHit = p.y > lens.value.aperture * lens.value.r
      const lowerHit = p.y < -lens.value.aperture * lens.value.r
      if (lowerHit || upperHit) {
        v = p.sub(s)
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

    const p = getIntersectionLens(s, v, c, lens.value.r, lensR.value, false)
    if (p) {
      v = p.sub(s)
      const nextS = drawSegment(s, v, v.length())

      // Refraction (inner lens rays)
      const phi1 = crossAngle(Vec.sub(p, c), Vec.sub(p, s));
      const phi2 = Math.asin(Math.sin(phi1) * lens.value.n);
      const theta = Math.atan2(p.y - c.y, p.x - c.x) + phi2;
      v = vecRad(theta)
      s = nextS
    }
  }

  //--------------------------------
  // Collision to ideal lens
  //--------------------------------
  if (options.value.lensIdeal && options.value.lens) {
    const p = intersectionSS(s, s.add(v.normalize().mul(infR.value)), vec(lens.value.x, -lens.value.r), vec(lens.value.x, lens.value.r))
    if (p) {
      v = p.sub(s)
      s = drawSegment(s, v, v.length())

      // Refracted ray
      let theta = Math.atan2(image.y - s.y, image.x);
      if (image.x === Infinity) {
        theta = Math.atan2(-s0.y, -(s0.x - lens.value.x));
      }
      if (lens.value.x - lens.value.f < s0.x) {
        theta += Math.PI;
      }
      v = vecRad(theta)
    }
  }

  //--------------------------------
  // Collision to body
  //--------------------------------
  if (options.value.body) {
    // Upper
    {
      const p = intersectionSS(s, s.add(v.normalize().mul(infR.value)), vec(lens.value.x, -infR.value), vec(lens.value.x, -lens.value.r))
      if (p) {
        v = p.sub(s)
        drawSegment(s, v, v.length())
        return
      }
    }
    // Lower
    {
      const p = intersectionSS(s, s.add(v.normalize().mul(infR.value)), vec(lens.value.x, infR.value), vec(lens.value.x, lens.value.r))
      if (p) {
        v = p.sub(s)
        drawSegment(s, v, v.length())
        return
      }
    }
  }

  //--------------------------------
  // Collision to sensor
  //--------------------------------
  if (options.value.sensor) {
    const p = intersectionSS(s, s.add(v.normalize().mul(infR.value)), vec(sensor.value.x, -sensor.value.r), vec(sensor.value.x, sensor.value.r))
    if (p) {
      v = p.sub(s)
      drawSegment(s, v, v.length())
      sensorDataTmp.push({ y: p.y, color })
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
  ctx.transform(params.scale, 0, 0, params.scale, params.width * 0.5 - params.c.x * params.scale, params.height * 0.5 - params.c.y * params.scale);
  // ctx.fillRect(params.viewBox.x, params.viewBox.y, params.viewBox.w, params.viewBox.h); // background
  ctx.globalCompositeOperation = 'lighten';

  // Data for screen drawing
  const sensorDataTmp: any[] = []

  //================================
  // Light path drawing like ray-tracing
  //================================

  // Light sources
  for (const light of lights.value) {
    ctx.strokeStyle = `hsl(${light.color}, 100%, 50%, ${style.value.rayIntensity})`
    ctx.lineWidth = style.value.rayWidth

    // Point light source
    if (light.type === Light.Point) {
      // Find image position of the light source
      const image = fGaussian(lens.value.f, lens.value.x - light.c.x, -light.c.y)

      // Draw 2^nRaysLog rays from light center
      const nRays = (1 << params.nRaysLog);
      for (let i = 0; i < nRays; i++) {
        // Initial position and direction
        const s = light.c.copy()
        const s0 = s.copy()
        const theta = 2 * Math.PI * i / nRays
        const v = vecRad(theta)
        drawRay(image, s0, s, v, light.color, sensorDataTmp)
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
        const s0 = s.copy()
        // Find image position of the light source
        const image = fGaussian(lens.value.f, lens.value.x - s.x, -s.y)
        const v = l.rotate(-Math.PI / 2)
        drawRay(image, s0, s, v, light.color, sensorDataTmp)
      }
    }
  }

  // Apple
  if (options.value.apple) {
    for (const light of apple.value) {
      ctx.strokeStyle = `hsl(${light.color}, 100%, 50%, ${style.value.rayIntensity})`
      ctx.lineWidth = style.value.rayWidth

      // Find image position of the light source
      const image = fGaussian(lens.value.f, lens.value.x - light.c.x, -light.c.y)

      // Draw 2^nRaysLog rays from light center
      const nRays = (1 << params.nRaysLog);
      for (let i = 0; i < nRays; i++) {
        // Initial position and direction
        const s = vec(light.c.x, light.c.y)
        const s0 = s.copy()
        const theta = 2 * Math.PI * i / nRays
        const v = vecRad(theta)
        drawRay(image, s0, s, v, light.color, sensorDataTmp)
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
