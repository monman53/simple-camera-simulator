<script setup lang="ts">
import { ref, computed } from 'vue'
import { state, infR, items, sensor, options, style, rUI, maxLightX } from '../globals'
import { vec, Vec, calcLensR } from '../math'
import { setMoveHandler, preventDefaultAndStopPropagation, getPositionOnSvg, getPositionDiffOnSvgApp } from '../handlers'

const props = defineProps(['lens', 'idx'])

const R = computed(() => {
    return calcLensR(props.lens.f, props.lens.n, props.lens.d)
})

const moveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const cx0 = props.lens.x;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (cx0 + d.x < maxLightX.value + props.lens.d / 2) {
            items.value[props.idx].x = maxLightX.value + props.lens.d / 2
        } else if (sensor.value.x < cx0 + d.x) {
            items.value[props.idx].x = sensor.value.x
        } else {
            items.value[props.idx].x = cx0 + d.x
        }
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
const focalPointMoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const f0 = props.lens.f;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (f0 - d.x < props.lens.d / 2) {
            items.value[props.idx].f = props.lens.d / 2
        } else {
            items.value[props.idx].f = f0 - d.x
        }
    })
}

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

const rMax = computed(() => {
    const d = props.lens.d
    return Math.sqrt(R.value * R.value - (R.value - d / 2) * (R.value - d / 2))
})

const r = computed(() => {
    return Math.min(rMax.value, props.lens.r)
})

const leftX = computed(() => {
    const x = props.lens.x
    const d = props.lens.d
    return x - d / 2 + (R.value - Math.sqrt(R.value * R.value - r.value * r.value))
})

const rightX = computed(() => {
    const x = props.lens.x
    const d = props.lens.d
    return x + d / 2 - (R.value - Math.sqrt(R.value * R.value - r.value * r.value))
})

</script>

<template>
    <g>
        <g class="hover-parent">
            <!-- Background -->
            <g class="hover-child-bg fill-none">
                <!-- left -->
                <path :d="`M ${leftX} ${-r} A ${R} ${R} 0 0 0 ${leftX} ${r}`" />
                <!-- right -->
                <path :d="`M ${rightX} ${-r} A ${R} ${R} 0 0 1 ${rightX} ${r}`" />
                <!-- Top -->
                <line :x1="leftX" :y1="-r" :x2="rightX" :y2="-r"></line>
                <!-- Bottom -->
                <line :x1="leftX" :y1="r" :x2="rightX" :y2="r"></line>
            </g>
            <!-- Foreground -->
            <g class="hover-child fill-none">
                <!-- left -->
                <path :d="`M ${leftX} ${-r} A ${R} ${R} 0 0 0 ${leftX} ${r}`" />
                <!-- right -->
                <path :d="`M ${rightX} ${-r} A ${R} ${R} 0 0 1 ${rightX} ${r}`" />
                <!-- Top -->
                <line :x1="leftX" :y1="-r" :x2="rightX" :y2="-r"></line>
                <!-- Bottom -->
                <line :x1="leftX" :y1="r" :x2="rightX" :y2="r"></line>
            </g>
            <!-- dummy for ui -->
            <rect class='ui-transparent' :x="lens.x - lens.d / 2" :y="-r" :width="lens.d" :height="2 * r"
                @mousedown="moveStartHandler" />
        </g>
        <!-- Focal points -->
        <g v-if="options.lensFocalPoints">
            <!-- left hand -->
            <g>
                <circle :cx="lens.x - lens.f" cy="0" :r="rUI / 2 * 1.2" :fill="style.lineBgColor"></circle>
                <circle :cx="lens.x - lens.f" cy="0" :r="rUI / 2" class="white"></circle>
                <!-- UI -->
                <circle :cx="lens.x - lens.f" cy="0" :r="rUI" @mousedown="focalPointMoveStartHandler" class="ui-hidden">
                </circle>
            </g>
            <!-- right hand -->
            <circle :cx="lens.x + lens.f" cy="0" :r="rUI / 2 * 1.2" :fill="style.lineBgColor"></circle>
            <circle :cx="lens.x + lens.f" cy="0" :r="rUI / 2" class="white"></circle>

            <!-- Double focal points -->
            <g v-if="options.lensDoubleFocalPoints">
                <circle :cx="lens.x - 2 * lens.f" cy="0" :r="rUI / 2" class="white"></circle>
                <circle :cx="lens.x + 2 * lens.f" cy="0" :r="rUI / 2" class="white"></circle>
            </g>
        </g>
        <!-- Lens size change UI-->
        <circle :cx="lens.x" :cy="-r" :r="rUI" class="ui-hidden" @mousedown="lensSizeChangeStartHandler"> </circle>

        <!-- Aperture -->
        <g v-if="options.aperture">
            <!-- Lines -->
            <!-- Background -->
            <g class="hover-sibling-bg no-pointer-events">
                <line :x1="lens.x" :y1="-r" :x2="lens.x" :y2="-r * lens.aperture"></line>
                <line :x1="lens.x" :y1="r" :x2="lens.x" :y2="r * lens.aperture"></line>
            </g>
            <!-- Foreground -->
            <g class="hover-sibling no-pointer-events">
                <line :x1="lens.x" :y1="-r" :x2="lens.x" :y2="-r * lens.aperture"></line>
                <line :x1="lens.x" :y1="r" :x2="lens.x" :y2="r * lens.aperture"></line>
            </g>
            <!-- UI -->
            <circle :cx="lens.x" :cy="r * lens.aperture" :r="rUI" @mousedown="apertureSizeChangeStartHandler"
                class="hover-sibling-master ui-hidden"></circle>
        </g>
    </g>
</template>