<script setup lang="ts">
import { aperture, body, maxLightX, rUI, sensor } from '@/globals';
import WithBackground from './WithBackground.vue';
import * as h from '../handlers'
import CircleUI from './CircleUI.vue';
import { vec } from '@/math';

const resize = (e: any, sgn: number) => {
    h.preventDefaultAndStopPropagation(e)
    // Last touched light is always front
    const m0 = h.getPositionOnSvg(e)
    const r0 = aperture.value.r
    h.setMoveHandler((e_: any) => {
        const d = h.getPositionDiffOnSvgApp(e_, m0)
        let rn = r0 + sgn * d.y
        if (rn < 0) {
            rn = 0
        }
        aperture.value.r = rn
    })
}

const move = (e: any) => {
    h.preventDefaultAndStopPropagation(e)
    const m0 = h.getPositionOnSvg(e)
    const x0 = aperture.value.x
    h.setMoveHandler((e_: any) => {
        const d = h.getPositionDiffOnSvgApp(e_, m0)
        let xn = x0 + d.x
        if (xn < maxLightX.value) {
            xn = maxLightX.value
        } else if (xn > sensor.value.x - rUI.value) {
            xn = sensor.value.x - rUI.value
        }
        aperture.value.x = xn
    })
}

</script>

<template>
    <WithBackground>
        <g class="stroke-white normal">
            <!-- Top -->
            <line :x1="aperture.x" :y1="-body.r - 2 * rUI" :x2="aperture.x" :y2="-aperture.r"></line>
            <!-- Bottom -->
            <line :x1="aperture.x" :y1="body.r + 2 * rUI" :x2="aperture.x" :y2="aperture.r"></line>
            <g class="ui-stroke transparent grab" @mousedown="move">
                <!-- Top -->
                <line :x1="aperture.x" :y1="-body.r - 2 * rUI" :x2="aperture.x" :y2="-aperture.r"></line>
                <!-- Bottom -->
                <line :x1="aperture.x" :y1="body.r + 2 * rUI" :x2="aperture.x" :y2="aperture.r"></line>
            </g>
            <CircleUI :c="vec(aperture.x, -aperture.r)" class="vertical-resize" @mousedown="resize($event, -1)"></CircleUI>
            <CircleUI :c="vec(aperture.x, aperture.r)" class="vertical-resize" @mousedown="resize($event, +1)"></CircleUI>
        </g>
    </WithBackground>
</template>