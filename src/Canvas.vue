<script setup lang="ts">
import { watch, onMounted, ref, computed } from 'vue'

import { state, lights, lensGroups, sensor, sensorData, apple, options, style, infR, lensesSorted, lensRs, lensFs, body, lensFronts, aperture, lensBacks } from './globals'
import { Vec, vec, vecRad, getIntersectionLens, crossAngle, fGaussian, calcLensF, intersectionSS, calcRMax, intersectionX, intersectionY, calcLensNWavelength } from './math'

import { Light, type Lens, type LensGroup } from './type'

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

const intersectionBody = (s: Vec, v: Vec) => {
  v = v.normalize()
  let ps = []

  // Outlines
  if (options.value.body && body.value.r && body.value.front && body.value.back) {
    ps.push(intersectionX(s, v, -body.value.r, body.value.front, body.value.back))
    ps.push(intersectionX(s, v, body.value.r, body.value.front, body.value.back))
    if (options.value.sensor) {
      ps.push(intersectionY(s, v, body.value.back, -body.value.r, body.value.r))
    }
  }

  // Lenses
  if (options.value.lens) {
    lensesSorted.value.forEach((lens, idx) => {
      const lensR = lensRs.value[idx]
      const front = lensFronts.value[idx]
      const back = lensBacks.value[idx]
      // Lens to body
      if (options.value.body && body.value.r) {
        ps.push(intersectionY(s, v, front, -body.value.r, -lensR))
        ps.push(intersectionY(s, v, front, lensR, body.value.r))
      }
      // Upper / Bottom
      ps.push(intersectionX(s, v, -lensR, front, back))
      ps.push(intersectionX(s, v, lensR, front, back))
      // Aperture
      const xm = (lens.x1 + lens.x2) / 2
      ps.push(intersectionY(s, v, xm, -lensR, -lensR * lens.aperture))
      ps.push(intersectionY(s, v, xm, lensR * lens.aperture, lensR))
    })
  }

  // Aperture
  if (options.value.aperture && body.value.r) {
    ps.push(intersectionY(s, v, aperture.value.x, -body.value.r, -aperture.value.r))
    ps.push(intersectionY(s, v, aperture.value.x, aperture.value.r, body.value.r))
  }

  ps = ps.filter((p) => p.p !== null)
  ps.sort((p, q) => p.d - q.d)

  if (ps.length === 0) {
    return { p: null, d: null }
  } else {
    return ps[0]
  }
}

const drawRay = (s: Vec, v: Vec, color: number, sensorDataTmp: any[]) => {
  // Multiple lens
  for (let lensIdx = 0; lensIdx < lensesSorted.value.length; lensIdx++) {
    const lens = lensesSorted.value[lensIdx]
    const s0 = s.copy()
    const xm = (lens.x1 + lens.x2) / 2
    const f = lensFs.value[lensIdx]
    const r = lensRs.value[lensIdx]
    const n = options.value.wavelength ? calcLensNWavelength(lens.n, color) : lens.n
    let innerLens = false

    //--------------------------------
    // Collision to lens surface (left-side)
    //--------------------------------
    if (!options.value.lensIdeal && options.value.lens) {
      // Center of lens curvature circle
      const c = vec(lens.x1 + lens.R1, 0)

      let pl = getIntersectionLens(s, v, c, r, lens.R1)
      const pb = intersectionBody(s, v)
      if ((pb.p && pl.p && pb.d < pl.d) || (!pl.p && pb.p)) {
        v = pb.p.sub(s)
        drawSegment(s, v, v.length())
        return
      }

      if (pl.p) {
        const p = pl.p
        v = p.sub(s)
        s = drawSegment(s, v, v.length())

        // Refraction (inner lens rays)
        const phi1 = crossAngle(Vec.sub(p, c).mul(lens.R1 > 0 ? 1 : -1), Vec.sub(s0, p));
        const phi2 = Math.asin(Math.sin(phi1) / n);
        const theta = Math.atan2(p.y - c.y, p.x - c.x) + Math.PI + phi2;
        if (lens.R1 > 0) {
          v = vecRad(theta)
        } else {
          v = vecRad(theta + Math.PI)
        }

        innerLens = true
      }

      // Optimization
      if (lensIdx === 0 && !pl.p && !pb.p) {
        drawSegment(s, v, infR.value)
        return
      }
    }

    //--------------------------------
    // Collision to lens surface (right-side)
    //--------------------------------
    if (!options.value.lensIdeal && innerLens) {
      // Center of lens curvature circle
      const c = vec(lens.x2 + lens.R2, 0)

      const pl = getIntersectionLens(s, v, c, r, lens.R2)
      const pb = intersectionBody(s, v)
      if ((pb.p && pl.p && pb.d < pl.d) || (!pl.p && pb.p)) {
        v = pb.p.sub(s)
        drawSegment(s, v, v.length())
        return
      }
      if (pl.p) {
        const p = pl.p
        v = p.sub(s)
        const nextS = drawSegment(s, v, v.length())

        // Refraction (inner lens rays)
        const phi1 = crossAngle(Vec.sub(p, c).mul(lens.R2 < 0 ? 1 : -1), Vec.sub(p, s));
        const phi2 = Math.asin(Math.sin(phi1) * n);
        const theta = Math.atan2(p.y - c.y, p.x - c.x) + phi2;
        if (lens.R2 > 0) {
          v = vecRad(theta + Math.PI)
        } else {
          v = vecRad(theta)
        }
        s = nextS
      }
    }

    //--------------------------------
    // Collision to ideal lens
    //--------------------------------
    if (options.value.lensIdeal && options.value.lens) {
      const pl = intersectionY(s, v, xm, -r, r)
      const pb = intersectionBody(s, v)
      // TODO: Find better condition
      const eps = 1e-9
      if ((pb.p && pl.p && pb.d < pl.d + eps) || (!pl.p && pb.p)) {
        v = pb.p.sub(s)
        drawSegment(s, v, v.length())
        return
      }
      if (pl.p) {
        const p = pl.p
        v = p.sub(s)
        s = drawSegment(s, v, v.length())

        // Find image position of the light source
        // TODO:
        const image = fGaussian(f, xm - s0.x, -s0.y)

        // Refracted ray
        let theta = Math.atan2(image.y - s.y, image.x);
        if (image.x === Infinity) {
          theta = Math.atan2(-s0.y, -(s0.x - xm));
        }
        if (f < 0) {
          theta += Math.PI
        }
        if (xm - f < s0.x) {
          theta += Math.PI
        }
        v = vecRad(theta)
      }

      // Optimization
      if (lensIdx === 0 && !pl.p && !pb.p) {
        drawSegment(s, v, infR.value)
        return
      }
    }
  }

  //--------------------------------
  // Collision to sensor
  //--------------------------------
  if (options.value.sensor) {
    const ps = intersectionY(s, v, sensor.value.x, -sensor.value.r, sensor.value.r)
    const pb = intersectionBody(s, v)
    if ((pb.p && ps.p && pb.d < ps.d) || (!ps.p && pb.p)) {
      v = pb.p.sub(s)
      drawSegment(s, v, v.length())
      return
    }
    if (ps.p) {
      const p = ps.p
      v = p.sub(s)
      drawSegment(s, v, v.length())
      sensorDataTmp.push({ y: p.y, color })
      return
    }
  }

  const pb = intersectionBody(s, v)
  if (pb.p) {
    v = pb.p.sub(s)
    drawSegment(s, v, v.length())
    return
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
    ctx.lineWidth = style.value.rayWidth
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
          ctx.strokeStyle = `hsl(${color}, 100%, 50%, ${style.value.rayIntensity})`
          drawRay(s, v, color, sensorDataTmp)
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
          ctx.strokeStyle = `hsl(${color}, 100%, 50%, ${style.value.rayIntensity})`
          drawRay(s, v, color, sensorDataTmp)
        }
      }
    }
  }

  // Apple
  if (options.value.apple) {
    for (const light of apple.value) {
      ctx.strokeStyle = `hsl(${light.color}, 100%, 50%, ${style.value.rayIntensity})`
      ctx.lineWidth = style.value.rayWidth
      // Draw 2^nRaysLog rays from light center
      const nRays = (1 << params.nRaysLog);
      for (let i = 0; i < nRays; i++) {
        // Initial position and direction
        const s = vec(light.c.x, light.c.y)
        const theta = 2 * Math.PI * i / nRays
        const v = vecRad(theta)
        drawRay(s, v, light.color, sensorDataTmp)
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
