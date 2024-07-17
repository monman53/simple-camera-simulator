<script setup lang="ts">
import { computed } from 'vue'
import { sensor, infR, globalLensInfo, globalLensRe } from '../globals'

import { vec, fGaussian } from '../math'

import WithBackground from './WithBackground.vue'

const xBack = computed(() => {
  return globalLensRe.value.forward.H
})

const xFront = computed(() => {
  return globalLensRe.value.backward.H
})

const f = computed(() => {
  return globalLensInfo.value.f
})

// Effective lens radius
const re = computed(() => {
  return globalLensRe.value.forward.re
})

const sensorTop = computed(() => {
  if (sensor.value.t.y < sensor.value.s.y) {
    return sensor.value.t
  } else {
    return sensor.value.s
  }
})

const sensorBottom = computed(() => {
  if (sensor.value.t.y < sensor.value.s.y) {
    return sensor.value.s
  } else {
    return sensor.value.t
  }
})

const sensorMiddle = computed(() => {
  return sensor.value.t.add(sensor.value.s).div(2)
})

// Focal plane
const focal = computed(() => {
  const s = sensorTop.value
  const t = sensorBottom.value
  const ss = fGaussian(f.value, vec(xBack.value - s.x, s.y))
  const tt = fGaussian(f.value, vec(xBack.value - t.x, t.y))
  return { s: vec(xFront.value - ss.x, ss.y), t: vec(xFront.value - tt.x, tt.y) }
})

// Angle of view
const aov = computed(() => {
  const lensTop = vec(xFront.value, -re.value)
  const lensBottom = vec(xFront.value, re.value)

  const focalPlaneTop = focal.value.t
  const focalPlaneBottom = focal.value.s

  // Lens to focal plane
  let middleOuterTop = focalPlaneTop.sub(lensTop)
  let middleOuterBottom = focalPlaneBottom.sub(lensBottom)
  let middleInnerTop = focalPlaneBottom.sub(lensTop)
  let middleInnerBottom = focalPlaneTop.sub(lensBottom)
  // For over infinity modification
  if (xBack.value + f.value > sensorMiddle.value.x) {
    middleOuterTop = middleOuterTop.minus().normalize().mul(infR.value)
    middleOuterBottom = middleOuterBottom.minus().normalize().mul(infR.value)
    middleInnerTop = middleInnerTop.minus().normalize().mul(infR.value)
    middleInnerBottom = middleInnerBottom.minus().normalize().mul(infR.value)
  }
  if (xBack.value + f.value === sensorMiddle.value.x) {
    // middleOuterTop = vec(x.value - sensorMiddle.value.x, -sensor.value.r).normalize().mul(infR.value)
    // middleInnerTop = vec(x.value - sensorMiddle.value.x, sensor.value.r).normalize().mul(infR.value)
  }

  // Focal plane to infinity
  const innerTop = middleOuterTop.normalize().mul(infR.value)
  const innerBottom = middleOuterBottom.normalize().mul(infR.value)
  const outerTop = middleInnerTop.normalize().mul(infR.value)
  const outerBottom = middleInnerBottom.normalize().mul(infR.value)

  return {
    middleInnerTop,
    middleInnerBottom,
    middleOuterTop,
    middleOuterBottom,
    innerTop,
    innerBottom,
    outerTop,
    outerBottom
  }
})

// Depth of field
const dof = computed(() => {
  const r = re.value
  const st = sensor.value.t.sub(sensor.value.s)
  const sensorSize = st.length()
  const c = sensor.value.circleOfConfusion
  const v = st.normalize()
  const s = sensor.value.s.add(vec(-xBack.value, 0))

  let inner = ''
  let outer = ''
  const d = (sensorSize + c) / 100
  for (let t = -c; t < sensorSize + d / 2; t += d) {
    const a = s.add(v.mul(t))
    const b = s.add(v.mul(t + c))

    const px = (2 * r * a.x * b.x) / (a.x * b.y - b.x * a.y + (a.x + b.x) * r)
    const py = ((a.y - r) / a.x) * px + r

    const p = fGaussian(f.value, vec(-px, py))
    p.x = xFront.value - p.x
    if (inner === '') {
      inner += `M ${p.x} ${p.y} `
    } else {
      inner += `L ${p.x} ${p.y} `
    }
  }
  for (let t = -c; t < sensorSize + d / 2; t += d) {
    const a = s.add(v.mul(t + c))
    const b = s.add(v.mul(t))

    const px = (2 * r * a.x * b.x) / (a.x * b.y - b.x * a.y + (a.x + b.x) * r)
    const py = ((a.y - r) / a.x) * px + r

    const p = fGaussian(f.value, vec(-px, py))
    p.x = xFront.value - p.x
    if (outer === '') {
      outer += `M ${p.x} ${p.y} `
    } else {
      outer += `L ${p.x} ${p.y} `
    }
  }
  return { inner, outer }
})
</script>

<template>
  <WithBackground>
    <g class="stroke-white">
      <!-- Inside camera -->
      <g class="thick">
        <line :x1="sensorTop.x" :y1="sensorTop.y" :x2="xBack" :y2="-re" />
        <line :x1="sensorBottom.x" :y1="sensorBottom.y" :x2="xBack" :y2="re" />
      </g>
      <g v-if="xBack !== sensorMiddle.x">
        <!-- Lens to focal plane (outer) -->
        <g class="thick">
          <line
            :x1="xFront"
            :y1="-re"
            :x2="xFront + aov.middleOuterTop.x"
            :y2="-re + aov.middleOuterTop.y"
          />
          <line
            :x1="xFront"
            :y1="re"
            :x2="xFront + aov.middleOuterBottom.x"
            :y2="re + aov.middleOuterBottom.y"
          />
        </g>
        <!-- Lens to focal plane (inner) -->
        <g class="thicker">
          <line
            :x1="xFront"
            :y1="-re"
            :x2="xFront + aov.middleInnerTop.x"
            :y2="-re + aov.middleInnerTop.y"
          />
          <line
            :x1="xFront"
            :y1="re"
            :x2="xFront + aov.middleInnerBottom.x"
            :y2="re + aov.middleInnerBottom.y"
          />
        </g>
      </g>
      <!-- Non over infinity -->
      <g v-if="xBack + f < sensorMiddle.x">
        <!-- Focal plane -->
        <line :x1="focal.s.x" :y1="focal.s.y" :x2="focal.t.x" :y2="focal.t.y" class="thick" />
        <!-- Focal plane to inf (outer) -->
        <g class="thick">
          <line
            :x1="focal.s.x"
            :y1="focal.s.y"
            :x2="focal.s.x + aov.outerTop.x"
            :y2="focal.s.y + aov.outerTop.y"
          />
          <line
            :x1="focal.t.x"
            :y1="focal.t.y"
            :x2="focal.t.x + aov.outerBottom.x"
            :y2="focal.t.y + aov.outerBottom.y"
          />
        </g>
        <!-- Focal plane to inf (inner) -->
        <g class="thicker">
          <line
            :x1="focal.t.x"
            :y1="focal.t.y"
            :x2="focal.t.x + aov.innerTop.x"
            :y2="focal.t.y + aov.innerTop.y"
          />
          <line
            :x1="focal.s.x"
            :y1="focal.s.y"
            :x2="focal.s.x + aov.innerBottom.x"
            :y2="focal.s.y + aov.innerBottom.y"
          />
        </g>
        <!-- Depth of focus -->
        <g class="thicker fill-none">
          <path :d="dof.inner" />
          <path :d="dof.outer" />
        </g>
      </g>
    </g>
  </WithBackground>
</template>
