<script setup lang="ts">
import { computed } from 'vue'
import { items, sensor, options, infR } from '../globals'

import { vec, fGaussian, calcLensF } from '../math'

const lens = computed(() => {
    return items.value[0]
})

const x = computed(() => {
    return (lens.value.x1 + lens.value.x2) / 2
})

const f = computed(() => {
    return calcLensF(lens.value)
})

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
    const bx = sensor.value.x - x.value;
    const by = sensor.value.r

    const a = fGaussian(f.value, bx, by)

    return { x: x.value - a.x, d: a.y }
})

// Angle of view
const aov = computed(() => {
    const lensTop = vec(x.value, -re.value)

    const focalPlaneTop = vec(focal.value.x, -focal.value.d)
    const focalPlaneBottom = vec(focal.value.x, focal.value.d)

    // Lens to focal plane
    let middleOuter = focalPlaneTop.sub(lensTop)
    let middleInner = focalPlaneBottom.sub(lensTop)
    // For over infinity modification
    if (x.value + f.value > sensor.value.x) {
        middleOuter = middleOuter.minus().normalize().mul(infR.value)
        middleInner = middleInner.minus().normalize().mul(infR.value)
    }
    if (x.value + f.value === sensor.value.x) {
        middleOuter = vec(x.value - sensor.value.x, -sensor.value.r).normalize().mul(infR.value)
        middleInner = vec(x.value - sensor.value.x, sensor.value.r).normalize().mul(infR.value)
    }

    // Focal plane to infinity
    const inner = middleOuter.normalize().mul(infR.value)
    const outer = middleInner.normalize().mul(infR.value)

    return { middleInner, middleOuter, inner, outer }
})

// Depth of field
const dof = computed(() => {
    const r = re.value
    const delta = sensor.value.circleOfConfusion

    const bx = sensor.value.x - x.value
    const by = sensor.value.r // Unused
    const a = fGaussian(f.value, bx, by)

    // Image space
    const bFront = bx / (1 + delta / (2 * r)) // Lens side
    const bBack = bx / (1 - delta / (2 * r))

    // Object space
    const aFront = 1 / (1 / f.value - 1 / bFront)
    const aBack = 1 / (1 / f.value - 1 / bBack) // Lens side

    // Radius of planes
    const c = a.x * (re.value / (re.value + focal.value.d))
    const dFront = re.value / c * (aFront - c)
    const dBack = focal.value.d * (aBack / a.x) + re.value * (1 - aBack / a.x) // Lens side

    const inner = { x: aBack, d: dBack } // Lens side
    const outer = { x: aFront, d: dFront }
    return { inner, outer }
})

</script>

<template>
    <!-- Inside camera -->
    <line :x1="sensor.x" :y1="sensor.r" :x2="x" :y2="re" class="dotted-bg"></line>
    <line :x1="sensor.x" :y1="-sensor.r" :x2="x" :y2="-re" class="dotted-bg"></line>
    <line :x1="sensor.x" :y1="sensor.r" :x2="x" :y2="re" class="dotted"></line>
    <line :x1="sensor.x" :y1="-sensor.r" :x2="x" :y2="-re" class="dotted"></line>
    <g v-if="x !== sensor.x">
        <!-- Lens to focal plane (outer) -->
        <line :x1="x" :y1="-re" :x2="x + aov.middleOuter.x" :y2="-re + aov.middleOuter.y" class="dotted-bg">
        </line>
        <line :x1="x" :y1="re" :x2="x + aov.middleOuter.x" :y2="re - aov.middleOuter.y" class="dotted-bg">
        </line>
        <line :x1="x" :y1="-re" :x2="x + aov.middleOuter.x" :y2="-re + aov.middleOuter.y" class="dotted">
        </line>
        <line :x1="x" :y1="re" :x2="x + aov.middleOuter.x" :y2="re - aov.middleOuter.y" class="dotted"></line>
        <!-- Lens to focal plane (inner) -->
        <line :x1="x" :y1="-re" :x2="x + aov.middleInner.x" :y2="-re + aov.middleInner.y" class="dotted-thick-bg">
        </line>
        <line :x1="x" :y1="re" :x2="x + aov.middleInner.x" :y2="re - aov.middleInner.y" class="dotted-thick-bg">
        </line>
        <line :x1="x" :y1="-re" :x2="x + aov.middleInner.x" :y2="-re + aov.middleInner.y" class="dotted-thick">
        </line>
        <line :x1="x" :y1="re" :x2="x + aov.middleInner.x" :y2="re - aov.middleInner.y" class="dotted-thick">
        </line>
    </g>
    <!-- Non over infinity -->
    <g v-if="x + f < sensor.x">
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
            <line :x1="x - dof.inner.x" :y1="-dof.inner.d" :x2="x - dof.inner.x" :y2="dof.inner.d"
                class="dotted-thick-bg"></line>
            <line :x1="x - dof.outer.x" :y1="-dof.outer.d" :x2="x - dof.outer.x" :y2="dof.outer.d"
                class="dotted-thick-bg"></line>
            <line :x1="x - dof.inner.x" :y1="-dof.inner.d" :x2="x - dof.inner.x" :y2="dof.inner.d" class="dotted-thick">
            </line>
            <line :x1="x - dof.outer.x" :y1="-dof.outer.d" :x2="x - dof.outer.x" :y2="dof.outer.d" class="dotted-thick">
            </line>
        </g>

    </g>
</template>