<script setup lang="ts">
import { aperture, body, lensesSorted, lensFronts, lensGroups, lensRs, maxLensX, maxLightX, options, sensor } from '@/globals';
import WithBackground from './WithBackground.vue';
import * as h from '../handlers'

const move = (e: any) => {
    h.preventDefaultAndStopPropagation(e)
    const m0 = h.getPositionOnSvg(e)
    const x10 = lensGroups.value.map((lensGroup) => lensGroup.lenses.map((lens) => lens.x1))
    const x20 = lensGroups.value.map((lensGroup) => lensGroup.lenses.map((lens) => lens.x2))
    const sensorX0 = sensor.value.x
    const apertureX0 = aperture.value.x
    h.setMoveHandler((e_: any) => {
        const d = h.getPositionDiffOnSvgApp(e_, m0)
        let minX = Math.min(sensor.value.x, aperture.value.x)
        if (lensesSorted.value.length > 0) {
            minX = Math.min(minX, lensesSorted.value[0].x1)
        }
        if (minX + d.x < maxLightX.value) {
            d.x = maxLightX.value - minX
        }

        // Update
        lensGroups.value.forEach((lensGroup, i) => {
            lensGroup.lenses.forEach((lens, j) => {
                lens.x1 = x10[i][j] + d.x
                lens.x2 = x20[i][j] + d.x
            })
        })
        sensor.value.x = sensorX0 + d.x
        aperture.value.x = apertureX0 + d.x
    })
}

</script>

<template>
    <g @mousedown="move" class="grab">
        <WithBackground :ui="true">
            <g v-if="body.front && body.back && body.r" class="stroke-white thicker">
                <!-- Outline -->
                <line :x1="body.front" :y1="-body.r" :x2="body.back" :y2="-body.r"></line>
                <line :x1="body.front" :y1="body.r" :x2="body.back" :y2="body.r"></line>
                <line v-if="options.sensor" :x1="body.back" :y1="-body.r" :x2="body.back" :y2="body.r"></line>

                <!-- Lenses -->
                <g v-if="options.lens">
                    <g v-for="(lens, idx) of lensesSorted">
                        <line :x1="lensFronts[idx]" :y1="-body.r" :x2="lensFronts[idx]" :y2="-lensRs[idx]"></line>
                        <line :x1="lensFronts[idx]" :y1="body.r" :x2="lensFronts[idx]" :y2="lensRs[idx]"></line>
                    </g>
                </g>
            </g>
        </WithBackground>
    </g>
</template>