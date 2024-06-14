<script setup lang="ts">
import { computed } from 'vue'
import { lens, sensor, options, infR } from '../globals'

import { vec } from '../math'

const effectiveLensRadius = computed(() => {
  if (options.value.aperture) {
    return lens.value.r * lens.value.aperture;
  } else {
    return lens.value.r;
  }
})

const guidelines = computed(() => {
    const f = lens.value.f;

    // Angle of view (AOV)
    const b = sensor.value.x - lens.value.x;
    const a = f * b / (b - f);

    const focalPosX = lens.value.x - a;
    const focalPosSize = sensor.value.r * (a / b);

    const lensTop = vec(lens.value.x, -effectiveLensRadius.value)

    const focalPlaneTop = vec(focalPosX, -focalPosSize)
    const focalPlaneBottom = vec(focalPosX, focalPosSize)

    const innerVec = focalPlaneTop.sub(lensTop).normalize().mul(infR.value)
    const outerVec = focalPlaneBottom.sub(lensTop).normalize().mul(infR.value)

    // Depth of field (DOF)
    const delta = lens.value.circleOfConfusion
    const ls = sensor.value.x - lens.value.x
    const re = effectiveLensRadius.value

    const lf = ls - delta * ls / (2 * re)
    const xf = f * lf / (lf - f)
    const lr = ls + delta * ls / (2 * re)
    const xr = f * lr / (lr - f)

    const dr = focalPosSize * (xr / a) + (1 - xr / a) * effectiveLensRadius.value
    const df = (focalPosSize + effectiveLensRadius.value) * (xf / a) - effectiveLensRadius.value

    return {
        focal: { x: focalPosX, d: focalPosSize },
        aovInner: innerVec,
        aovOuter: outerVec,
        dofInner: { x: xr, d: dr },
        dofOuter: { x: xf, d: df },
    }
})
</script>

<template>
    <!-- Inside camera -->
    <line :x1="sensor.x" :y1="sensor.r" :x2="lens.x" :y2="effectiveLensRadius" class="dotted-bg"></line>
    <line :x1="sensor.x" :y1="-sensor.r" :x2="lens.x" :y2="-effectiveLensRadius" class="dotted-bg"></line>
    <line :x1="sensor.x" :y1="sensor.r" :x2="lens.x" :y2="effectiveLensRadius" class="dotted"></line>
    <line :x1="sensor.x" :y1="-sensor.r" :x2="lens.x" :y2="-effectiveLensRadius" class="dotted"></line>
    <!-- Non over infinity -->
    <g v-if="lens.x + lens.f < sensor.x">
        <!-- Lens to focal plane (outer) -->
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="lens.x" :y2="-effectiveLensRadius"
            class="dotted-bg">
        </line>
        <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="lens.x" :y2="effectiveLensRadius"
            class="dotted-bg">
        </line>
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="lens.x" :y2="-effectiveLensRadius" class="dotted">
        </line>
        <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="lens.x" :y2="effectiveLensRadius" class="dotted">
        </line>
        <!-- Lens to focal plane (inner) -->
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="lens.x" :y2="effectiveLensRadius"
            class="dotted-thick-bg"></line>
        <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="lens.x" :y2="-effectiveLensRadius"
            class="dotted-thick-bg"></line>
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="lens.x" :y2="effectiveLensRadius"
            class="dotted-thick"></line>
        <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="lens.x" :y2="-effectiveLensRadius"
            class="dotted-thick"></line>
        <!-- Focal plane -->
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="guidelines.focal.x" :y2="guidelines.focal.d"
            class="dotted-bg"></line>
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="guidelines.focal.x" :y2="guidelines.focal.d"
            class="dotted"></line>
        <!-- Focal plane to inf (outer) -->
        <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="guidelines.focal.x + guidelines.aovOuter.x"
            :y2="guidelines.focal.d + guidelines.aovOuter.y" class="dotted-bg"></line>
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="guidelines.focal.x + guidelines.aovOuter.x"
            :y2="-guidelines.focal.d - guidelines.aovOuter.y" class="dotted-bg"></line>
        <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="guidelines.focal.x + guidelines.aovOuter.x"
            :y2="guidelines.focal.d + guidelines.aovOuter.y" class="dotted"></line>
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="guidelines.focal.x + guidelines.aovOuter.x"
            :y2="-guidelines.focal.d - guidelines.aovOuter.y" class="dotted"></line>
        <!-- Focal plane to inf (inner) -->
        <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="guidelines.focal.x + guidelines.aovInner.x"
            :y2="guidelines.focal.d - guidelines.aovInner.y" class="dotted-thick-bg"></line>
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="guidelines.focal.x + guidelines.aovInner.x"
            :y2="-guidelines.focal.d + guidelines.aovInner.y" class="dotted-thick-bg"></line>
        <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="guidelines.focal.x + guidelines.aovInner.x"
            :y2="guidelines.focal.d - guidelines.aovInner.y" class="dotted-thick"></line>
        <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="guidelines.focal.x + guidelines.aovInner.x"
            :y2="-guidelines.focal.d + guidelines.aovInner.y" class="dotted-thick"></line>

        <!-- Depth of field -->
        <g v-if="options.circleOfConfusion && options.depthOfField">
            <line :x1="lens.x - guidelines.dofInner.x" :y1="-guidelines.dofInner.d" :x2="lens.x - guidelines.dofInner.x"
                :y2="guidelines.dofInner.d" class="dotted-thick-bg"></line>
            <line :x1="lens.x - guidelines.dofOuter.x" :y1="-guidelines.dofOuter.d" :x2="lens.x - guidelines.dofOuter.x"
                :y2="guidelines.dofOuter.d" class="dotted-thick-bg"></line>
            <line :x1="lens.x - guidelines.dofInner.x" :y1="-guidelines.dofInner.d" :x2="lens.x - guidelines.dofInner.x"
                :y2="guidelines.dofInner.d" class="dotted-thick"></line>
            <line :x1="lens.x - guidelines.dofOuter.x" :y1="-guidelines.dofOuter.d" :x2="lens.x - guidelines.dofOuter.x"
                :y2="guidelines.dofOuter.d" class="dotted-thick"></line>
        </g>

    </g>
    <!-- Over infinity -->
    <g v-else>
    </g>
</template>