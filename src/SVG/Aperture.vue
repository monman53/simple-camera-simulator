<script setup lang="ts">
import { aperture, body, sensor, style } from '@/globals';
import WithBackground from './WithBackground.vue';
import CircleUI from './CircleUI.vue';
import { Vec, vec } from '@/math';
import MoveUI from './MoveUI.vue';

const resize = (sgn: number) => {
    return () => {
        const r0 = aperture.value.r
        return (e: any, d: Vec) => {
            let rn = r0 + sgn * d.y
            if (rn < 0) {
                rn = 0
            }
            aperture.value.r = rn
        }
    }
}

const move = () => {
    const x0 = aperture.value.x
    return (e: any, d: Vec) => {
        let xn = x0 + d.x
        const sensorMinX = Math.min(sensor.value.s.x, sensor.value.t.x)
        if (xn > sensorMinX) {
            xn = sensorMinX
        }
        aperture.value.x = xn
    }
}

</script>

<template>
    <MoveUI :handler-creator="move" class="grab">
        <WithBackground :ui="true">
            <g v-if="body.r" class="stroke-white normal">
                <!-- Top -->
                <line :x1="aperture.x" :y1="-body.r - style.bodyPadding" :x2="aperture.x" :y2="-aperture.r"></line>
                <!-- Bottom -->
                <line :x1="aperture.x" :y1="body.r + style.bodyPadding" :x2="aperture.x" :y2="aperture.r"></line>
            </g>
        </WithBackground>
    </MoveUI>
    <WithBackground>
        <MoveUI :handler-creator="resize(-1)" class="vertical-resize">
            <CircleUI :c="vec(aperture.x, -aperture.r)"></CircleUI>
        </MoveUI>
        <MoveUI :handler-creator="resize(+1)" class="vertical-resize">
            <CircleUI :c="vec(aperture.x, aperture.r)"></CircleUI>
        </MoveUI>
    </WithBackground>
</template>