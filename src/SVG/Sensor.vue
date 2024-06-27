<script setup lang="ts">
import { aperture, maxLensX, sensor } from '@/globals';
import * as h from '../handlers'
import { vec } from '@/math';
import WithBackground from './WithBackground.vue';
import CircleUI from './CircleUI.vue';

const move = (e: any) => {
    h.preventDefaultAndStopPropagation(e)
    const m0 = h.getPositionOnSvg(e);
    const cx0 = sensor.value.x;
    h.setMoveHandler((e_: any) => {
        const d = h.getPositionDiffOnSvgApp(e_, m0)
        const maxX = Math.max(maxLensX.value, aperture.value.x)
        if (cx0 + d.x < maxX) {
            sensor.value.x = maxX
            return
        }
        sensor.value.x = cx0 + d.x
    })
}

const resize = (e: any) => {
    h.preventDefaultAndStopPropagation(e)
    const m0 = h.getPositionOnSvg(e);
    const r0 = sensor.value.r;
    h.setMoveHandler((e_: any) => {
        const d = h.getPositionDiffOnSvgApp(e_, m0)
        if (r0 - d.y < 0.1) {
            sensor.value.r = 0.1;
        } else {
            sensor.value.r = r0 - d.y;
        }
    })
}

</script>

<template>
    <g>
        <g @mousedown="move">
            <WithBackground :ui="true">
                <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="stroke-white normal" />
            </WithBackground>
        </g>
        <!-- dummies for ui -->
        <!-- <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="ui-stroke transparent grab"
        @mousedown="move" /> -->
        <CircleUI :c="vec(sensor.x, -sensor.r)" class="vertical-resize" @mousedown="resize">
        </CircleUI>
    </g>
</template>