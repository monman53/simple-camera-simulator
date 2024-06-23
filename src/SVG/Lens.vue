<script setup lang="ts">
import { computed } from 'vue'
import { items, sensor, options, style, rUI, maxLightX } from '../globals'
import { calcLensF } from '../math'
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

const d = computed(() => {
    return props.lens.x2 - props.lens.x1
})

const xm = computed(() => {
    return (props.lens.x1 + props.lens.x2) / 2
})

const moveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const x10 = props.lens.x1;
    const x20 = props.lens.x2;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        items.value[props.idx].x1 = x10 + d.x
        items.value[props.idx].x2 = x20 + d.x
        // if (x10 + d.x < maxLightX.value + props.lens.d / 2) {
        //     items.value[props.idx].x = maxLightX.value + props.lens.d / 2
        // } else if (sensor.value.x < cx0 + d.x) {
        //     items.value[props.idx].x = sensor.value.x
        // }
    })
}

// const lensSizeChangeStartHandler = (e: any) => {
//     preventDefaultAndStopPropagation(e)
//     const m0 = getPositionOnSvg(e);
//     const r0 = props.lens.r;
//     setMoveHandler((e_: any) => {
//         const d = getPositionDiffOnSvgApp(e_, m0)
//         if (r0 - d.y < 0.1) {
//             items.value[props.idx].r = 0.1
//         } else if (r0 - d.y > rMax.value) {
//             items.value[props.idx].r = rMax.value
//         } else {
//             items.value[props.idx].r = r0 - d.y
//         }
//     })
// }
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

const fNumber = computed(() => {
    if (options.value.aperture) {
        return f.value / (2 * props.lens.r * props.lens.aperture)
    } else {
        return f.value / (2 * props.lens.r)
    }
})

// const rMax = computed(() => {
//     const d = props.lens.d
//     return Math.sqrt(R.value * R.value - (R.value - d / 2) * (R.value - d / 2))
// })

const r = computed(() => {
    // return Math.min(rMax.value, props.lens.r)
    return props.lens.r
})

const leftX = computed(() => {
    const x = props.lens.x1
    const R1 = Math.abs(props.lens.R1)
    const d = R1 - Math.sqrt(R1 * R1 - r.value * r.value)
    return x + d
})

const rightX = computed(() => {
    const x = props.lens.x2
    const R2 = Math.abs(props.lens.R2)
    const d = R2 - Math.sqrt(R2 * R2 - r.value * r.value)
    return x - d
})

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
            <!-- Background -->
            <g class="hover-child-bg fill-none">
                <!-- left -->
                <path :d="`M ${leftX} ${-r} A ${Math.abs(lens.R1)} ${Math.abs(lens.R1)} 0 0 0 ${leftX} ${r}`" />
                <!-- right -->
                <path :d="`M ${rightX} ${-r} A ${Math.abs(lens.R2)} ${Math.abs(lens.R2)} 0 0 1 ${rightX} ${r}`" />
                <!-- Top -->
                <line :x1="leftX" :y1="-r" :x2="rightX" :y2="-r"></line>
                <!-- Bottom -->
                <line :x1="leftX" :y1="r" :x2="rightX" :y2="r"></line>
            </g>
            <!-- Foreground -->
            <g class="hover-child fill-none">
                <!-- left -->
                <path :d="`M ${leftX} ${-r} A ${Math.abs(lens.R1)} ${Math.abs(lens.R1)} 0 0 0 ${leftX} ${r}`" />
                <!-- right -->
                <path :d="`M ${rightX} ${-r} A ${Math.abs(lens.R2)} ${Math.abs(lens.R2)} 0 0 1 ${rightX} ${r}`" />
                <!-- Top -->
                <line :x1="leftX" :y1="-r" :x2="rightX" :y2="-r"></line>
                <!-- Bottom -->
                <line :x1="leftX" :y1="r" :x2="rightX" :y2="r"></line>
            </g>
            <!-- dummy for ui -->
            <rect class='ui-transparent' :x="lens.x1" :y="-r" :width="lens.x2 - lens.x1" :height="2 * r"
                @mousedown="moveStartHandler" />
        </g>
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
        <!-- <circle :cx="lens.x" :cy="-r" :r="rUI" class="ui-hidden" @mousedown="lensSizeChangeStartHandler"> </circle> -->

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