<script setup lang="ts">
import { aperture, maxLensX, sensor } from '@/globals';
import * as h from '../handlers'
import { Vec, vec } from '@/math';
import WithBackground from './WithBackground.vue';
import CircleUI from './CircleUI.vue';
import MoveUI from './MoveUI.vue';

const move = () => {
    const cx0 = sensor.value.x;
    return (e: any, d: Vec) => {
        const maxX = Math.max(maxLensX.value, aperture.value.x)
        if (cx0 + d.x < maxX) {
            sensor.value.x = maxX
            return
        }
        sensor.value.x = cx0 + d.x
    }
}

const resize = () => {
    const r0 = sensor.value.r;
    return (e: any, d: Vec) => {
        if (r0 - d.y < 0.1) {
            sensor.value.r = 0.1;
        } else {
            sensor.value.r = r0 - d.y;
        }
    }
}

</script>

<template>
    <g>
        <MoveUI :handler-creator="move" class="grab">
            <WithBackground :ui="true">
                <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="stroke-white normal" />
            </WithBackground>
        </MoveUI>
        <MoveUI :handler-creator="resize" class="vertical-resize">
            <CircleUI :c="vec(sensor.x, -sensor.r)"></CircleUI>
        </MoveUI>
    </g>
</template>