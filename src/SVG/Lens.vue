<script setup lang="ts">
import { computed } from 'vue'
import { items, sensor, options, style, rUI, maxLightX } from '../globals'
import { calcLensF, calcRMax } from '../math'
import { setMoveHandler, preventDefaultAndStopPropagation, getPositionOnSvg, getPositionDiffOnSvgApp } from '../handlers'
import type { Lens } from '../type'

// const props = defineProps(['lens', 'idx'])
const props = defineProps<{
    lens: Lens
    idx: number
}>()

const f = computed(() => {
    return calcLensF(props.lens)
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

const moveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const x10 = props.lens.x1;
    const x20 = props.lens.x2;
    // const leftX0 = leftX.value
    // const rightX0 = rightX.value
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (x10 + d.x < maxLightX.value) {
            items.value[props.idx].x1 = maxLightX.value
            items.value[props.idx].x2 = maxLightX.value + (x20 - x10)
        } else if (x20 + d.x > sensor.value.x) {
            items.value[props.idx].x1 = sensor.value.x - (x20 - x10)
            items.value[props.idx].x2 = sensor.value.x
        } else {
            items.value[props.idx].x1 = x10 + d.x
            items.value[props.idx].x2 = x20 + d.x
        }
    })
}

const x1MoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const x10 = props.lens.x1;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (x10 + d.x < maxLightX.value) {
            items.value[props.idx].x1 = maxLightX.value
        } else if (x10 + d.x > props.lens.x2) {
            items.value[props.idx].x1 = props.lens.x2
        } else {
            items.value[props.idx].x1 = x10 + d.x
        }
    })
}

const x2MoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const x20 = props.lens.x2
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (x20 + d.x < props.lens.x1) {
            items.value[props.idx].x2 = props.lens.x1
        } else if (x20 + d.x > sensor.value.x) {
            items.value[props.idx].x2 = sensor.value.x
        } else {
            items.value[props.idx].x2 = x20 + d.x
        }
    })
}

const r1MoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const r0 = r.value
    const x10 = props.lens.x1
    const leftX0 = leftX.value
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        let x1n = x10 + d.x
        if (leftX0 - x1n > r0) {
            x1n = leftX0 - r0
        }
        if (x1n > props.lens.x2) {
            x1n = props.lens.x2
        }
        const a = x1n - leftX0
        const R1n = (-r0 * r0 - a * a) / (2 * a)
        items.value[props.idx].R1 = R1n
        items.value[props.idx].x1 = x1n
    })
}

const r2MoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const r0 = r.value
    const x20 = props.lens.x2
    const rightX0 = rightX.value
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        let x2n = x20 + d.x
        if (x2n - rightX0 > r0) {
            x2n = r0 + rightX0
        }
        if (x2n < props.lens.x1) {
            x2n = props.lens.x1
        }
        const a = x2n - rightX0
        const R2n = (-r0 * r0 - a * a) / (2 * a)
        items.value[props.idx].R2 = R2n
        items.value[props.idx].x2 = x2n
    })
}

const lensSizeChangeStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const r0 = props.lens.r;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (r0 - d.y < 0.1) {
            items.value[props.idx].r = 0.1
        } else if (r0 - d.y > rMax.value) {
            items.value[props.idx].r = rMax.value
        } else {
            items.value[props.idx].r = r0 - d.y
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
    const a0 = props.lens.aperture * r.value;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        const an = (a0 + d.y) / r.value;
        if (an < 0) {
            items.value[props.idx].aperture = 0;
        } else if (an > 1) {
            items.value[props.idx].aperture = 1;
        } else {
            items.value[props.idx].aperture = an;
        }
    })
}

</script>

<template>
    <g>
        <!-- Curvature circle -->
        <g v-if="options.lens && options.curvature">
            <circle :cx="lens.x1 + lens.R1" :cy="0" :r="Math.abs(lens.R1)" class="dotted"></circle>
            <circle :cx="lens.x2 + lens.R2" :cy="0" :r="Math.abs(lens.R2)" class="dotted"></circle>
            <!-- center point -->
            <circle :cx="lens.x1 + lens.R1" cy="0" :r="rUI / 2" class="white"></circle>
            <circle :cx="lens.x2 + lens.R2" cy="0" :r="rUI / 2" class="white"></circle>
        </g>

        <!-- Hyperfocal point -->
        <g
            v-if="options.lens && options.sensor && options.circleOfConfusion && options.angleOfView && options.depthOfField && options.hyperfocalPoint">
            <circle :cx="xm - f - f * f / (sensor.circleOfConfusion * fNumber)" cy="0" :r="rUI / 2 * 1.2"
                :fill="style.lineBgColor"></circle>
            <circle :cx="xm - f - f * f / (sensor.circleOfConfusion * fNumber)" cy="0" :r="rUI / 2" class="white">
            </circle>
        </g>

        <!-- Lens -->
        <g class="hover-parent">
            <!-- dummy for ui -->
            <path :d="path" class='ui-transparent' @mousedown="moveStartHandler"/>
            <!-- Background -->
            <g class="hover-child-bg fill-none">
                <!-- left -->
                <path :d="path1" />
                <!-- right -->
                <path :d="path2" />
                <!-- Top -->
                <line :x1="leftX" :y1="-r" :x2="rightX" :y2="-r"></line>
                <!-- Bottom -->
                <line :x1="leftX" :y1="r" :x2="rightX" :y2="r"></line>
            </g>
            <!-- Foreground -->
            <g class="hover-child fill-none">
                <!-- left -->
                <path :d="path1" />
                <!-- right -->
                <path :d="path2" />
                <!-- Top -->
                <line :x1="leftX" :y1="-r" :x2="rightX" :y2="-r"></line>
                <!-- Bottom -->
                <line :x1="leftX" :y1="r" :x2="rightX" :y2="r"></line>
            </g>
        </g>

        <!-- Thickness change UI -->
        <g class="fill-none" pointer-events="stroke">
            <!-- left -->
            <path :d="path1" class="ui-hidden" @mousedown="x1MoveStartHandler" />
            <!-- right -->
            <path :d="path2" class="ui-hidden" @mousedown="x2MoveStartHandler" />
        </g>

        <!-- Curvature change UI -->
        <circle :cx="lens.x1" :cy="0" :r="rUI" class="ui-hidden" @mousedown="r1MoveStartHandler"></circle>
        <circle :cx="lens.x2" :cy="0" :r="rUI" class="ui-hidden" @mousedown="r2MoveStartHandler"></circle>

        <!-- Focal points -->
        <g v-if="options.lensFocalPoints">
            <!-- left hand -->
            <g>
                <circle :cx="xm - f" cy="0" :r="rUI / 2 * 1.2" :fill="style.lineBgColor"></circle>
                <circle :cx="xm - f" cy="0" :r="rUI / 2" class="white"></circle>
                <!-- UI -->
                <!-- <circle :cx="xm - f" cy="0" :r="rUI" @mousedown="focalPointMoveStartHandler" class="ui-hidden">
                </circle> -->
            </g>
            <!-- right hand -->
            <circle :cx="xm + f" cy="0" :r="rUI / 2 * 1.2" :fill="style.lineBgColor"></circle>
            <circle :cx="xm + f" cy="0" :r="rUI / 2" class="white"></circle>

            <!-- Double focal points -->
            <g v-if="options.lensDoubleFocalPoints">
                <circle :cx="xm - 2 * f" cy="0" :r="rUI / 2" class="white"></circle>
                <circle :cx="xm + 2 * f" cy="0" :r="rUI / 2" class="white"></circle>
            </g>
        </g>

        <!-- Lens size change UI-->
        <circle :cx="(leftX + rightX) / 2" :cy="-r" :r="rUI" class="ui-hidden" @mousedown="lensSizeChangeStartHandler">
        </circle>

        <!-- Aperture -->
        <g v-if="options.aperture">
            <!-- Lines -->
            <!-- Background -->
            <g class="hover-sibling-bg no-pointer-events">
                <line :x1="xm" :y1="-r" :x2="xm" :y2="-r * lens.aperture"></line>
                <line :x1="xm" :y1="r" :x2="xm" :y2="r * lens.aperture"></line>
            </g>
            <!-- Foreground -->
            <g class="hover-sibling no-pointer-events">
                <line :x1="xm" :y1="-r" :x2="xm" :y2="-r * lens.aperture"></line>
                <line :x1="xm" :y1="r" :x2="xm" :y2="r * lens.aperture"></line>
            </g>
            <!-- UI -->
            <circle :cx="xm" :cy="r * lens.aperture" :r="rUI" @mousedown="apertureSizeChangeStartHandler"
                class="hover-sibling-master ui-hidden"></circle>
        </g>
    </g>
</template>