<script setup lang="ts">
import { computed } from 'vue'
import { options } from '../globals'
import { vec, calcLensXCOG, calcLensPlaneEdge, calcLensH, Vec } from '../math'
import type { Lens, LensPlane } from '../type'
import WithBackground from './WithBackground.vue'
import CircleUI from './CircleUI.vue'
import Point from './Point.vue'
import MoveUI from './MoveUI.vue'

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

        let d = ""
        d += `M ${edge} ${-r.value} L ${edge} ${-p.h} `
        d += `A ${absR} ${absR} 0 0 ${sweep} ${edge} ${p.h} `
        d += `L ${edge} ${r.value}`
        return d
    })
})

const planeMoveStartHandler = (plane: LensPlane) => {
    return () => {
        const x0 = plane.x;
        return (e: any, d: Vec) => {
            // TODO
            plane.x = x0 + d.x
        }
    }
}

const hChangeStartHandler = (plane: LensPlane) => {
    return () => {
        const h0 = plane.h;
        return (e: any, d: Vec) => {
            if (h0 - d.y > Math.abs(plane.r)) {
                plane.h = Math.abs(plane.r)
            } else {
                plane.h = h0 - d.y
            }
        }
    }
}

const rMoveStartHandler = (plane: LensPlane) => {
    return () => {
        const h0 = plane.h
        const x0 = plane.x
        const edge0 = calcLensPlaneEdge(plane)
        return (e: any, d: Vec) => {
            let xn = x0 + d.x
            const a = xn - edge0
            const rn = (-h0 * h0 - a * a) / (2 * a)
            plane.r = rn
            plane.x = xn
        }
    }
}

const apertureSizeChangeStartHandler = () => {
    const lens = props.lens
    const a0 = props.lens.aperture * r.value;
    return (e: any, d: Vec) => {
        const an = (a0 + d.y) / r.value;
        if (an < 0) {
            lens.aperture = 0;
        } else if (an > 1) {
            lens.aperture = 1;
        } else {
            lens.aperture = an;
        }
    }
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
                <MoveUI :handler-creator="planeMoveStartHandler(plane)">
                    <path :d="paths[idx]"></path>
                </MoveUI>
            </template>
        </g>

        <!-- Size change UI -->
        <template v-for="(plane, idx) of lens.planes">
            <MoveUI :handler-creator="hChangeStartHandler(plane)">
                <CircleUI :c="vec(calcLensPlaneEdge(plane), -plane.h)" class="vertical-resize"></CircleUI>
            </MoveUI>
        </template>

        <!-- Curvature change UI -->
        <g class="horizontal-resize">
            <template v-for="plane of lens.planes">
                <MoveUI :handler-creator="rMoveStartHandler(plane)">
                    <CircleUI :c="vec(plane.x, 0)"></CircleUI>
                </MoveUI>
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
        <MoveUI :handler-creator="apertureSizeChangeStartHandler">
            <CircleUI :c="vec(xm, r * lens.aperture)" class="vertical-resize">
            </CircleUI>
        </MoveUI>
    </g>
</template>