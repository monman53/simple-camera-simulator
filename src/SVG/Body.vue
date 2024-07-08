<script setup lang="ts">
import { aperture, body, lensCOGs, lensesSorted, lensFronts, lensGroups, lensRs, options, sensor } from '@/globals';
import WithBackground from './WithBackground.vue';
import MoveUI from './MoveUI.vue';
import type { Vec } from '@/math';

const move = () => {
    const x0s = lensGroups.value.map(lensGroup => lensGroup.lenses.map(lens => lens.planes.map(p => p.x)))
    const sensorS0 = sensor.value.s.copy()
    const sensorT0 = sensor.value.t.copy()
    const apertureX0 = aperture.value.x
    return (e: any, d: Vec) => {
        lensGroups.value.forEach((lensGroup, i) => {
            lensGroup.lenses.forEach((lens, j) => {
                lens.planes.forEach((plane, k) => {
                    plane.x = x0s[i][j][k] + d.x
                })
            })
        })
        sensor.value.s.x = sensorS0.x + d.x
        sensor.value.t.x = sensorT0.x + d.x
        aperture.value.x = apertureX0 + d.x
    }
}
</script>

<template>
    <MoveUI :handler-creator="move" class="grab">
        <WithBackground :ui="true">
            <g v-if="isFinite(body.front) && isFinite(body.back) && isFinite(body.r)" class="stroke-white thicker">
                <!-- Outline -->
                <line :x1="body.front" :y1="-body.r" :x2="body.back" :y2="-body.r"></line>
                <line :x1="body.front" :y1="body.r" :x2="body.back" :y2="body.r"></line>
                <line v-if="options.sensor" :x1="body.back" :y1="-body.r" :x2="body.back" :y2="body.r"></line>

                <!-- Lenses -->
                <g v-if="options.lens">
                    <g v-for="(lens, idx) of lensesSorted">
                        <g v-if="options.lensIdeal">
                            <line :x1="lensCOGs[idx]" :y1="-body.r" :x2="lensCOGs[idx]" :y2="-lensRs[idx]" />
                            <line :x1="lensCOGs[idx]" :y1="body.r" :x2="lensCOGs[idx]" :y2="lensRs[idx]" />
                        </g>
                        <g v-else>
                            <line :x1="lensFronts[idx]" :y1="-body.r" :x2="lensFronts[idx]" :y2="-lensRs[idx]">
                            </line>
                            <line :x1="lensFronts[idx]" :y1="body.r" :x2="lensFronts[idx]" :y2="lensRs[idx]"></line>
                        </g>
                    </g>
                </g>
            </g>
        </WithBackground>
    </MoveUI>
</template>