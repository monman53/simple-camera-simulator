<script setup lang="ts">
import { ref, computed } from 'vue'
import { state, infR, items, sensor, options, style, rUI, maxLightX } from '../globals'
import { vec, Vec, calcLensR } from '../math'
import { setMoveHandler, preventDefaultAndStopPropagation, getPositionOnSvg, getPositionDiffOnSvgApp } from '../handlers'

const props = defineProps(['lens', 'idx'])

const R = computed(() => {
    return calcLensR(props.lens.n, props.lens.f, props.lens.r)
})

const D = computed(() => {
    const r = props.lens.r
    return 2 * (R.value - Math.sqrt(R.value * R.value - r * r))
})

const moveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const cx0 = props.lens.x;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (cx0 + d.x < maxLightX.value + D.value / 2) {
            items.value[props.idx].x = maxLightX.value + D.value / 2
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
            items.value[props.idx].r = 0.1;
        } else {
            items.value[props.idx].r = r0 - d.y;
        }
    })
}
const focalPointMoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const f0 = props.lens.f;
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (f0 - d.x < D.value / 2) {
            items.value[props.idx].f = D.value / 2
        } else {
            items.value[props.idx].f = f0 - d.x
        }
    })
}

</script>

<template>
    <g>
        <g class="hover-parent">
            <!-- left half background -->
            <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 0 ${lens.x} ${lens.r}`"
                class="hover-child-bg fill-none" />
            <!-- right half background -->
            <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 1 ${lens.x} ${lens.r}`"
                class="hover-child-bg fill-none" />
            <!-- left half -->
            <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 0 ${lens.x} ${lens.r}`" class="hover-child fill-none" />
            <!-- right half -->
            <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 1 ${lens.x} ${lens.r}`" class="hover-child fill-none" />
            <!-- dummy for ui -->
            <rect class='ui-transparent' :x="lens.x - D / 2" :y="-lens.r" :width="D" :height="2 * lens.r"
                @mousedown="moveStartHandler" />
        </g>
        <!-- Focal points -->
        <g v-if="options.lensFocalPoints">
            <!-- left hand -->
            <g>
                <circle :cx="lens.x - lens.f" cy="0" :r="rUI / 2 * 1.2" :fill="style.lineBgColor"></circle>
                <circle :cx="lens.x - lens.f" cy="0" :r="rUI / 2" class="white"></circle>
                <!-- UI -->
                <circle :cx="lens.x - lens.f" cy="0" :r="rUI" @mousedown="focalPointMoveStartHandler"
                    class="ui-hidden">
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
        <circle :cx="lens.x" :cy="-lens.r" :r="rUI" class="ui-hidden" @mousedown="lensSizeChangeStartHandler">
        </circle>
    </g>
</template>