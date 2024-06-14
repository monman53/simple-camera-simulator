<script setup lang="ts">
import { computed } from 'vue'
import { lens, sensor, options, infR } from '../globals'

import { vec } from '../math'

// Effective lens radius
const re = computed(() => {
    if (options.value.aperture) {
        return lens.value.r * lens.value.aperture;
    } else {
        return lens.value.r;
    }
})

// Focal plane
const focal = computed(() => {
    const f = lens.value.f;

    const b = sensor.value.x - lens.value.x;
    const a = f * b / (b - f);

    const focalPosX = lens.value.x - a;
    const focalPosSize = sensor.value.r * (a / b);

    return { x: focalPosX, d: focalPosSize }
})

// Angle of view
const aov = computed(() => {
    const lensTop = vec(lens.value.x, -re.value)

    const focalPlaneTop = vec(focal.value.x, -focal.value.d)
    const focalPlaneBottom = vec(focal.value.x, focal.value.d)

    const inner = focalPlaneTop.sub(lensTop).normalize().mul(infR.value)
    const outer = focalPlaneBottom.sub(lensTop).normalize().mul(infR.value)

    return { inner, outer }
})

// Depth of field
const dof = computed(() => {
    const f = lens.value.f;
    const b = sensor.value.x - lens.value.x;
    const a = f * b / (b - f);

    const delta = lens.value.circleOfConfusion
    const ls = sensor.value.x - lens.value.x

    const lf = ls - delta * ls / (2 * re.value)
    const xf = f * lf / (lf - f)
    const lr = ls + delta * ls / (2 * re.value)
    const xr = f * lr / (lr - f)

    const dr = focal.value.d * (xr / a) + (1 - xr / a) * re.value
    const df = (focal.value.d + re.value) * (xf / a) - re.value

    const inner = { x: xr, d: dr }
    const outer = { x: xf, d: df }

    return { inner, outer }
})

</script>

<template>
    <!-- Inside camera -->
    <line :x1="sensor.x" :y1="sensor.r" :x2="lens.x" :y2="re" class="dotted-bg"></line>
    <line :x1="sensor.x" :y1="-sensor.r" :x2="lens.x" :y2="-re" class="dotted-bg"></line>
    <line :x1="sensor.x" :y1="sensor.r" :x2="lens.x" :y2="re" class="dotted"></line>
    <line :x1="sensor.x" :y1="-sensor.r" :x2="lens.x" :y2="-re" class="dotted"></line>
    <!-- Non over infinity -->
    <g v-if="lens.x + lens.f < sensor.x">
        <!-- Lens to focal plane (outer) -->
        <line :x1="focal.x" :y1="-focal.d" :x2="lens.x" :y2="-re" class="dotted-bg"></line>
        <line :x1="focal.x" :y1="focal.d" :x2="lens.x" :y2="re" class="dotted-bg"></line>
        <line :x1="focal.x" :y1="-focal.d" :x2="lens.x" :y2="-re" class="dotted"></line>
        <line :x1="focal.x" :y1="focal.d" :x2="lens.x" :y2="re" class="dotted"></line>
        <!-- Lens to focal plane (inner) -->
        <line :x1="focal.x" :y1="-focal.d" :x2="lens.x" :y2="re" class="dotted-thick-bg"></line>
        <line :x1="focal.x" :y1="focal.d" :x2="lens.x" :y2="-re" class="dotted-thick-bg"></line>
        <line :x1="focal.x" :y1="-focal.d" :x2="lens.x" :y2="re" class="dotted-thick"></line>
        <line :x1="focal.x" :y1="focal.d" :x2="lens.x" :y2="-re" class="dotted-thick"></line>
        <!-- Focal plane -->
        <line :x1="focal.x" :y1="-focal.d" :x2="focal.x" :y2="focal.d" class="dotted-bg"></line>
        <line :x1="focal.x" :y1="-focal.d" :x2="focal.x" :y2="focal.d" class="dotted"></line>
        <!-- Focal plane to inf (outer) -->
        <line :x1="focal.x" :y1="focal.d" :x2="focal.x + aov.outer.x" :y2="focal.d + aov.outer.y" class="dotted-bg">
        </line>
        <line :x1="focal.x" :y1="-focal.d" :x2="focal.x + aov.outer.x" :y2="-focal.d - aov.outer.y" class="dotted-bg">
        </line>
        <line :x1="focal.x" :y1="focal.d" :x2="focal.x + aov.outer.x" :y2="focal.d + aov.outer.y" class="dotted"></line>
        <line :x1="focal.x" :y1="-focal.d" :x2="focal.x + aov.outer.x" :y2="-focal.d - aov.outer.y" class="dotted">
        </line>
        <!-- Focal plane to inf (inner) -->
        <line :x1="focal.x" :y1="focal.d" :x2="focal.x + aov.inner.x" :y2="focal.d - aov.inner.y"
            class="dotted-thick-bg">
        </line>
        <line :x1="focal.x" :y1="-focal.d" :x2="focal.x + aov.inner.x" :y2="-focal.d + aov.inner.y"
            class="dotted-thick-bg"></line>
        <line :x1="focal.x" :y1="focal.d" :x2="focal.x + aov.inner.x" :y2="focal.d - aov.inner.y" class="dotted-thick">
        </line>
        <line :x1="focal.x" :y1="-focal.d" :x2="focal.x + aov.inner.x" :y2="-focal.d + aov.inner.y"
            class="dotted-thick">
        </line>

        <!-- Depth of field -->
        <g v-if="options.circleOfConfusion && options.depthOfField">
            <line :x1="lens.x - dof.inner.x" :y1="-dof.inner.d" :x2="lens.x - dof.inner.x" :y2="dof.inner.d"
                class="dotted-thick-bg"></line>
            <line :x1="lens.x - dof.outer.x" :y1="-dof.outer.d" :x2="lens.x - dof.outer.x" :y2="dof.outer.d"
                class="dotted-thick-bg"></line>
            <line :x1="lens.x - dof.inner.x" :y1="-dof.inner.d" :x2="lens.x - dof.inner.x" :y2="dof.inner.d"
                class="dotted-thick"></line>
            <line :x1="lens.x - dof.outer.x" :y1="-dof.outer.d" :x2="lens.x - dof.outer.x" :y2="dof.outer.d"
                class="dotted-thick"></line>
        </g>

    </g>
    <!-- Over infinity -->
    <g v-else>
    </g>
</template>