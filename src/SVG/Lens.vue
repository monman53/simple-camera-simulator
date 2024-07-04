<script setup lang="ts">
import { computed } from 'vue'
import { options } from '../globals'
import { vec, calcLensFront, calcLensBack, calcLensXCOG, calcLensPlaneEdge, calcLensH } from '../math'
import { setMoveHandler, preventDefaultAndStopPropagation, getPositionOnSvg, getPositionDiffOnSvgApp } from '../handlers'
import type { Lens, LensPlane } from '../type'
import WithBackground from './WithBackground.vue'
import CircleUI from './CircleUI.vue'
import Point from './Point.vue'

const props = defineProps<{
    lens: Lens,
    selected: boolean,
}>()

const xm = computed(() => {
    return calcLensXCOG(props.lens)
})

const r = computed(() => {
    return calcLensH(props.lens)
})

const frontEdge = computed(() => {
    return calcLensFront(props.lens)
})

const backEdge = computed(() => {
    return calcLensBack(props.lens)
})

const path = computed(() => {
    let d = ""
    // Planes
    const planes = props.lens.planes
    for (let i = 0; i < planes.length - 1; i++) {
        const p1 = planes[i] // left
        const p2 = planes[i + 1] //right
        const edge1 = calcLensPlaneEdge(p1)
        const edge2 = calcLensPlaneEdge(p2)
        const absR1 = Math.abs(p1.r)
        const absR2 = Math.abs(p2.r)
        const sweep1 = p1.r > 0 ? 0 : 1
        const sweep2 = p2.r > 0 ? 1 : 0

        // left
        d += `M ${edge1} ${-r.value} `
        d += `L ${edge1} ${-p1.h} `
        d += `A ${absR1} ${absR1} 0 0 ${sweep1} ${edge1} ${p1.h} `
        d += `L ${edge1} ${r.value} `

        // right
        d += `L ${edge2} ${r.value} `
        d += `L ${edge2} ${p2.h} `
        d += `A ${absR2} ${absR2} 0 0 ${sweep2} ${edge2} ${-p2.h} `
        d += `L ${edge2} ${-r.value} `

        // Close
        d += `Z `

    }
    return d
})

const paths = computed(() => {
    return props.lens.planes.map(p => {
        const absR = Math.abs(p.r)
        const sweep = p.r > 0 ? 0 : 1
        const edge = calcLensPlaneEdge(p)
        return `M ${edge} ${-p.h} A ${absR} ${absR} 0 0 ${sweep} ${edge} ${p.h} `
    })
})

const planeMoveStartHandler = (e: any, plane: LensPlane) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const x0 = plane.x;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        // TODO
        plane.x = x0 + d.x
    })
}

const rMoveStartHandler = (e: any, plane: LensPlane) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const h0 = plane.h
    const x0 = plane.x
    const edge0 = calcLensPlaneEdge(plane)
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        let xn = x0 + d.x
        const a = xn - edge0
        const rn = (-h0 * h0 - a * a) / (2 * a)
        plane.r = rn
        plane.x = xn
    })
}

const hChangeStartHandler = (e: any, plane: LensPlane) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const h0 = plane.h;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (h0 - d.y > Math.abs(plane.r)) {
            plane.h = Math.abs(plane.r)
        } else {
            plane.h = h0 - d.y
        }
    })
}

const apertureSizeChangeStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const lens = props.lens
    const a0 = props.lens.aperture * r.value;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        const an = (a0 + d.y) / r.value;
        if (an < 0) {
            lens.aperture = 0;
        } else if (an > 1) {
            lens.aperture = 1;
        } else {
            lens.aperture = an;
        }
    })
}

</script>

<template>
    <g>
        <!-- Curvature circle -->
        <g v-if="options.lens && options.curvature">
            <!-- Circle -->
            <WithBackground>
                <g class="stroke-white thicker fill-none">
                    <template v-for="plane of lens.planes">
                        <circle :cx="plane.x + plane.r" :cy="0" :r="Math.abs(plane.r)"></circle>
                    </template>
                </g>
            </WithBackground>
            <!-- Center Point -->
            <template v-for="plane of lens.planes">
                <Point :c="vec(plane.x + plane.r, 0)"></Point>
            </template>
        </g>

        <!-- Lens -->
        <WithBackground>
            <g class="stroke-white fill-none" :class="{ normal: !selected, bold: selected }">
                <path :d="path"></path>
            </g>
        </WithBackground>

        <!-- dummy for ui -->
        <path :d="path" class='transparent grab' stroke-width="0" />

        <!-- Thickness and change UI -->
        <g class="ui-stroke transparent horizontal-resize">
            <template v-for="(plane, idx) of lens.planes">
                <path :d="paths[idx]" @mousedown="planeMoveStartHandler($event, plane)"></path>
            </template>
        </g>

        <!-- Size change UI -->
        <template v-for="(plane, idx) of lens.planes">
            <CircleUI :c="vec(calcLensPlaneEdge(plane), -plane.h)" @mousedown="hChangeStartHandler($event, plane)" class="vertical-resize">
            </CircleUI>
        </template>

        <!-- Curvature change UI -->
        <g class="horizontal-resize">
            <template v-for="plane of lens.planes">
                <CircleUI :c="vec(plane.x, 0)" @mousedown="rMoveStartHandler($event, plane)"></CircleUI>
            </template>
        </g>

        <!-- Aperture -->
        <WithBackground>
            <!-- Lines -->
            <g class="stroke-white normal no-pointer-events">
                <line :x1="xm" :y1="-r" :x2="xm" :y2="-r * lens.aperture"></line>
                <line :x1="xm" :y1="r" :x2="xm" :y2="r * lens.aperture"></line>
            </g>
        </WithBackground>
        <!-- UI -->
        <CircleUI :c="vec(xm, r * lens.aperture)" @mousedown="apertureSizeChangeStartHandler" class="vertical-resize">
        </CircleUI>
    </g>
</template>