<script setup lang="ts">
import { computed } from 'vue'
import { lensGroups, releaseAllLenses, sensor, options, style, rUI, maxLightX } from '../globals'
import { vec, calcLensF, calcRMax } from '../math'
import { setMoveHandler, preventDefaultAndStopPropagation, getPositionOnSvg, getPositionDiffOnSvgApp } from '../handlers'
import type { Lens } from '../type'
import WithBackground from './WithBackground.vue'
import CircleUI from './CircleUI.vue'

const props = defineProps<{
    lens: Lens,
    selected: boolean,
}>()

const f = computed(() => {
    return calcLensF(props.lens)
})

const H = computed(() => {
    return xm.value - f.value - f.value * f.value / (sensor.value.circleOfConfusion * fNumber.value)
})

const xm = computed(() => {
    return (props.lens.x1 + props.lens.x2) / 2
})

const fNumber = computed(() => {
    if (options.value.aperture) {
        return f.value / (2 * props.lens.r * props.lens.aperture)
    } else {
        return f.value / (2 * props.lens.r)
    }
})

const rMax = computed(() => {
    return calcRMax(props.lens)
})

const r = computed(() => {
    return Math.min(rMax.value, props.lens.r)
})

const leftX = computed(() => {
    const x = props.lens.x1
    const R1 = props.lens.R1
    const d = Math.abs(R1) - Math.sqrt(R1 * R1 - r.value * r.value)
    if (R1 > 0) {
        return x + d
    } else {
        return x - d
    }
})

const rightX = computed(() => {
    const x = props.lens.x2
    const R2 = props.lens.R2
    const d = Math.abs(R2) - Math.sqrt(R2 * R2 - r.value * r.value)
    if (R2 > 0) {
        return x + d
    } else {
        return x - d
    }
})

const path = computed(() => {
    let d = ""
    d += `M ${leftX.value} ${-r.value} `
    const absR1 = Math.abs(props.lens.R1)
    const sweep1 = props.lens.R1 > 0 ? 0 : 1
    d += `A ${absR1} ${absR1} 0 0 ${sweep1} ${leftX.value} ${r.value} `
    d += `L ${rightX.value} ${r.value}`
    const absR2 = Math.abs(props.lens.R2)
    const sweep2 = props.lens.R2 > 0 ? 1 : 0
    d += `A ${absR2} ${absR2} 0 0 ${sweep2} ${rightX.value} ${-r.value} `
    d += `Z`
    return d
})

const path1 = computed(() => {
    const absR1 = Math.abs(props.lens.R1)
    const sweep = props.lens.R1 > 0 ? 0 : 1
    return `M ${leftX.value} ${-r.value} A ${absR1} ${absR1} 0 0 ${sweep} ${leftX.value} ${r.value}`
})

const path2 = computed(() => {
    const absR2 = Math.abs(props.lens.R2)
    const sweep = props.lens.R2 > 0 ? 0 : 1
    return `M ${rightX.value} ${-r.value} A ${absR2} ${absR2} 0 0 ${sweep} ${rightX.value} ${r.value}`
})

const x1MoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const lens = props.lens
    const x10 = lens.x1;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (x10 + d.x < maxLightX.value) {
            lens.x1 = maxLightX.value
        } else if (x10 + d.x > props.lens.x2) {
            lens.x1 = props.lens.x2
        } else {
            lens.x1 = x10 + d.x
        }
    })
}

const x2MoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const lens = props.lens
    const x20 = lens.x2
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (x20 + d.x < props.lens.x1) {
            lens.x2 = props.lens.x1
        } else if (x20 + d.x > sensor.value.x) {
            lens.x2 = sensor.value.x
        } else {
            lens.x2 = x20 + d.x
        }
    })
}

const r1MoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const lens = props.lens
    const r0 = r.value
    const x10 = lens.x1
    const leftX0 = leftX.value
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        let x1n = x10 + d.x
        if (x1n < maxLightX.value) {
            x1n = maxLightX.value
        }
        if (x1n > props.lens.x2) {
            x1n = props.lens.x2
        }
        if (leftX0 - x1n > r0) {
            lens.R1 = r0
            lens.x1 = x1n
            return
        }
        if (x1n - leftX0 > r0) {
            lens.R1 = -r0
            lens.x1 = x1n
            return
        }
        const a = x1n - leftX0
        const R1n = (-r0 * r0 - a * a) / (2 * a)
        lens.R1 = R1n
        lens.x1 = x1n
    })
}

const r2MoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const lens = props.lens
    const r0 = r.value
    const x20 = lens.x2
    const rightX0 = rightX.value
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        let x2n = x20 + d.x
        if (x2n < props.lens.x1) {
            x2n = props.lens.x1
        }
        if (x2n > sensor.value.x) {
            x2n = sensor.value.x
        }
        if (x2n - rightX0 > r0) {
            lens.R2 = -r0
            lens.x2 = x2n
            return
        }
        if (rightX0 - x2n > r0) {
            lens.R2 = r0
            lens.x2 = x2n
            return
        }
        const a = x2n - rightX0
        const R2n = (-r0 * r0 - a * a) / (2 * a)
        lens.R2 = R2n
        lens.x2 = x2n
    })
}

const lensSizeChangeStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const lens = props.lens
    const r0 = props.lens.r;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (r0 - d.y < 0.1) {
            lens.r = 0.1
        } else if (r0 - d.y > rMax.value) {
            lens.r = rMax.value
        } else {
            lens.r = r0 - d.y
        }
    })
}
// const focalPointMoveStartHandler = (e: any) => {
//     preventDefaultAndStopPropagation(e)
//     const m0 = getPositionOnSvg(e);
//     const f0 = props.lens.f;
//     setMoveHandler((e_: any) => {
//         const d = getPositionDiffOnSvgApp(e_, m0)
//         if (f0 - d.x < props.lens.d / 2) {
//             items.value[props.idx].f = props.lens.d / 2
//         } else {
//             items.value[props.idx].f = f0 - d.x
//         }
//     })
// }

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
                    <circle :cx="lens.x1 + lens.R1" :cy="0" :r="Math.abs(lens.R1)"></circle>
                    <circle :cx="lens.x2 + lens.R2" :cy="0" :r="Math.abs(lens.R2)"></circle>
                </g>
                <!-- center point -->
                <g class="fill-white stroke-white normal">
                    <circle :cx="lens.x1 + lens.R1" cy="0" :r="rUI / 2"></circle>
                    <circle :cx="lens.x2 + lens.R2" cy="0" :r="rUI / 2"></circle>
                </g>
            </WithBackground>
        </g>

        <!-- Hyperfocal point -->
        <g
            v-if="options.lens && options.sensor && options.circleOfConfusion && options.angleOfView && options.depthOfField && options.hyperfocalPoint">
            <WithBackground>
                <circle :cx="H" cy=" 0" :r="rUI / 2" class="fill-white stroke-white normal"></circle>
            </WithBackground>
        </g>

        <!-- Lens -->
        <WithBackground>
            <g class="stroke-white fill-none" :class="{ normal: !selected, bold: selected }">
                <path :d="path"></path>
            </g>
        </WithBackground>

        <!-- Thickness change UI -->
        <g class="ui-stroke transparent horizontal-resize">
            <!-- left -->
            <path :d="path1" @mousedown="x1MoveStartHandler" />
            <!-- right -->
            <path :d="path2" @mousedown="x2MoveStartHandler" />
        </g>

        <!-- Lens size change UI-->
        <g class="ui-stroke transparent vertical-resize" @mousedown="lensSizeChangeStartHandler">
            <line :x1="leftX" :y1="-r" :x2="rightX" :y2="-r" stroke-linecap="round"></line>
        </g>

        <!-- dummy for ui -->
        <path :d="path" class='transparent grab' stroke-width="0" />

        <!-- Curvature change UI -->
        <g class="horizontal-resize">
            <CircleUI :c="vec(lens.x1, 0)" @mousedown="r1MoveStartHandler"></CircleUI>
            <CircleUI :c="vec(lens.x2, 0)" @mousedown="r2MoveStartHandler"></CircleUI>
        </g>

        <!-- Focal points -->
        <g v-if="options.lensFocalPoints">
            <WithBackground>
                <g class="fill-white stroke-white normal">
                    <circle :cx="xm - f" cy="0" :r="rUI / 2"></circle>
                    <circle :cx="xm + f" cy="0" :r="rUI / 2"></circle>
                </g>
                <!-- Double focal points -->
                <g v-if="options.lensDoubleFocalPoints">
                    <circle :cx="xm - 2 * f" cy="0" :r="rUI / 2"></circle>
                    <circle :cx="xm + 2 * f" cy="0" :r="rUI / 2"></circle>
                </g>
            </WithBackground>
        </g>

        <!-- Aperture -->
        <g v-if="options.aperture">
            <WithBackground>
                <!-- Lines -->
                <g class="stroke-white normal no-pointer-events">
                    <line :x1="xm" :y1="-r" :x2="xm" :y2="-r * lens.aperture"></line>
                    <line :x1="xm" :y1="r" :x2="xm" :y2="r * lens.aperture"></line>
                </g>
            </WithBackground>
            <!-- UI -->
            <CircleUI :c="vec(xm, r * lens.aperture)" @mousedown="apertureSizeChangeStartHandler"
                class="vertical-resize">
            </CircleUI>
        </g>
    </g>
</template>