<script setup lang="ts">
import { computed } from 'vue'
import { lensGroups, sensor, options, infR } from '../globals'

import { vec, fGaussian, calcLensF } from '../math'

import WithBackground from './WithBackground.vue'

const lens = computed(() => {
    return lensGroups.value[0].lenses[0]
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
    // const bx = sensor.value.x - x.value;
    // const by = sensor.value.r

    const s = sensorTop.value
    const t = sensorBottom.value
    const ss = fGaussian(f.value, vec(x.value - s.x, s.y))
    const tt = fGaussian(f.value, vec(x.value - t.x, t.y))

    return { s: vec(x.value - ss.x, ss.y), t: vec(x.value - tt.x, tt.y) }
})

// Angle of view
const aov = computed(() => {
    const lensTop = vec(x.value, -re.value)
    const lensBottom = vec(x.value, re.value)

    const focalPlaneTop = focal.value.t
    const focalPlaneBottom = focal.value.s

    // Lens to focal plane
    let middleOuterTop = focalPlaneTop.sub(lensTop)
    let middleOuterBottom = focalPlaneBottom.sub(lensBottom)
    let middleInnerTop = focalPlaneBottom.sub(lensTop)
    let middleInnerBottom = focalPlaneTop.sub(lensBottom)
    // For over infinity modification
    if (x.value + f.value > sensorMiddle.value.x) {
        // middleOuter = middleOuter.minus().normalize().mul(infR.value)
        // middleInner = middleInner.minus().normalize().mul(infR.value)
    }
    if (x.value + f.value === sensorMiddle.value.x) {
        // middleOuter = vec(x.value - sensor.value.x, -sensor.value.r).normalize().mul(infR.value)
        // middleInner = vec(x.value - sensor.value.x, sensor.value.r).normalize().mul(infR.value)
    }

    // Focal plane to infinity
    const innerTop = middleOuterTop.normalize().mul(infR.value)
    const innerBottom = middleOuterBottom.normalize().mul(infR.value)
    const outerTop = middleInnerTop.normalize().mul(infR.value)
    const outerBottom = middleInnerBottom.normalize().mul(infR.value)

    return { middleInnerTop, middleInnerBottom, middleOuterTop, middleOuterBottom, innerTop, innerBottom, outerTop, outerBottom }
})

// Depth of field
const dof = computed(() => {
    const r = re.value
    const st = sensor.value.t.sub(sensor.value.s)
    const sensorSize = st.length()
    const c = sensor.value.circleOfConfusion
    const v = st.normalize()
    const s = sensor.value.s.add(vec(-x.value, 0))

    let inner = ""
    let outer = ""
    const d = (sensorSize + c) / 100
    for (let t = -c; t < sensorSize + d / 2; t += d) {
        const a = s.add(v.mul(t))
        const b = s.add(v.mul(t + c))

        const px = 2 * r * a.x * b.x / (a.x * b.y - b.x * a.y + (a.x + b.x) * r)
        const py = (a.y - r) / a.x * px + r

        const p = fGaussian(f.value, vec(-px, py))
        p.x = x.value - p.x
        p.y = p.y
        if (inner === "") {
            inner += `M ${p.x} ${p.y} `
        } else {
            inner += `L ${p.x} ${p.y} `
        }
    }
    for (let t = -c; t < sensorSize + d / 2; t += d) {
        const a = s.add(v.mul(t + c))
        const b = s.add(v.mul(t))

        const px = 2 * r * a.x * b.x / (a.x * b.y - b.x * a.y + (a.x + b.x) * r)
        const py = (a.y - r) / a.x * px + r

        const p = fGaussian(f.value, vec(-px, py))
        p.x = x.value - p.x
        p.y = p.y
        if (outer === "") {
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
                <line :x1="sensorTop.x" :y1="sensorTop.y" :x2="x" :y2="-re"></line>
                <line :x1="sensorBottom.x" :y1="sensorBottom.y" :x2="x" :y2="re"></line>
            </g>
            <g v-if="x !== sensorMiddle.x">
                <!-- Lens to focal plane (outer) -->
                <g class="thick">
                    <line :x1="x" :y1="-re" :x2="x + aov.middleOuterTop.x" :y2="-re + aov.middleOuterTop.y"></line>
                    <line :x1="x" :y1="re" :x2="x + aov.middleOuterBottom.x" :y2="re + aov.middleOuterBottom.y"></line>
                </g>
                <!-- Lens to focal plane (inner) -->
                <g class="thicker">
                    <line :x1="x" :y1="-re" :x2="x + aov.middleInnerTop.x" :y2="-re + aov.middleInnerTop.y"></line>
                    <line :x1="x" :y1="re" :x2="x + aov.middleInnerBottom.x" :y2="re + aov.middleInnerBottom.y"></line>
                </g>
            </g>
            <!-- Non over infinity -->
            <g v-if="x + f < sensorMiddle.x">
                <!-- Focal plane -->
                <line :x1="focal.s.x" :y1="focal.s.y" :x2="focal.t.x" :y2="focal.t.y" class="thick"></line>
                <!-- Focal plane to inf (outer) -->
                <g class="thick">
                    <line :x1="focal.s.x" :y1="focal.s.y" :x2="focal.s.x + aov.outerTop.x"
                        :y2="focal.s.y + aov.outerTop.y"></line>
                    <line :x1="focal.t.x" :y1="focal.t.y" :x2="focal.t.x + aov.outerBottom.x"
                        :y2="focal.t.y + aov.outerBottom.y"></line>
                </g>
                <!-- Focal plane to inf (inner) -->
                <g class="thicker">
                    <line :x1="focal.t.x" :y1="focal.t.y" :x2="focal.t.x + aov.innerTop.x"
                        :y2="focal.t.y + aov.innerTop.y"></line>
                    <line :x1="focal.s.x" :y1="focal.s.y" :x2="focal.s.x + aov.innerBottom.x"
                        :y2="focal.s.y + aov.innerBottom.y"></line>
                </g>
                <!-- Depth of focus -->
                <g class="thicker">
                    <path :d="dof.inner"></path>
                    <path :d="dof.outer"></path>
                </g>
            </g>
        </g>
    </WithBackground>
</template>