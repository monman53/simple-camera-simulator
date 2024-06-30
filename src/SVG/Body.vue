<script setup lang="ts">
import { aperture, body, lensesSorted, lensFronts, lensGroups, lensRs, maxLensX, maxLightX, options, sensor } from '@/globals';
import WithBackground from './WithBackground.vue';
import * as h from '../handlers'

const move = (e: any) => {
    h.preventDefaultAndStopPropagation(e)
    const m0 = h.getPositionOnSvg(e)
    const x10 = lensGroups.value.map((lensGroup) => lensGroup.lenses.map((lens) => lens.x1))
    const x20 = lensGroups.value.map((lensGroup) => lensGroup.lenses.map((lens) => lens.x2))
    const sensorS0 = sensor.value.s.copy()
    const sensorT0 = sensor.value.t.copy()
    const apertureX0 = aperture.value.x
    h.setMoveHandler((e_: any) => {
        const d = h.getPositionDiffOnSvgApp(e_, m0)
        let minX = Math.min(sensorS0.x, sensorT0.x, apertureX0)
        x10.forEach((g) => [
            g.forEach((x1) => {
                minX = Math.min(minX, x1)
            })
        ])
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
        sensor.value.s.x = sensorS0.x + d.x
        sensor.value.t.x = sensorT0.x + d.x
        aperture.value.x = apertureX0 + d.x
    })
}

</script>

<template>
    <g @mousedown="move" class="grab">
        <WithBackground :ui="true">
            <g v-if="body.front !== null && body.back !== null && body.r !== null" class="stroke-white thicker">
                <!-- Outline -->
                <line :x1="body.front" :y1="-body.r" :x2="body.back" :y2="-body.r"></line>
                <line :x1="body.front" :y1="body.r" :x2="body.back" :y2="body.r"></line>
                <line v-if="options.sensor" :x1="body.back" :y1="-body.r" :x2="body.back" :y2="body.r"></line>

                <!-- Lenses -->
                <g v-if="options.lens">
                    <g v-for="(lens, idx) of lensesSorted">
                        <g v-if="options.lensIdeal">
                            <line :x1="(lens.x1 + lens.x2) / 2" :y1="-body.r" :x2="(lens.x1 + lens.x2) / 2"
                                :y2="-lensRs[idx]">
                            </line>
                            <line :x1="(lens.x1 + lens.x2) / 2" :y1="body.r" :x2="(lens.x1 + lens.x2) / 2"
                                :y2="lensRs[idx]">
                            </line>
                        </g>
                        <g v-else>
                            <line :x1="lensFronts[idx]" :y1="-body.r" :x2="lensFronts[idx]" :y2="-lensRs[idx]"></line>
                            <line :x1="lensFronts[idx]" :y1="body.r" :x2="lensFronts[idx]" :y2="lensRs[idx]"></line>
                        </g>
                    </g>
                </g>
            </g>
        </WithBackground>
    </g>
</template>