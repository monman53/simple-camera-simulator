<script setup lang="ts">
import { computed } from 'vue'
import { lensGroups, releaseAllLenses, sensor, options, style, rUI, maxLightX } from '../globals'
import { calcLensF, calcRMax } from '../math'
import { setMoveHandler, preventDefaultAndStopPropagation, getPositionOnSvg, getPositionDiffOnSvgApp } from '../handlers'
import { type LensGroup } from '../type'

import Lens from './Lens.vue'

// const props = defineProps(['lens', 'idx'])
const props = defineProps<{
    lensGroup: LensGroup
    idx: number
}>()

const moveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const lensGroup = props.lensGroup
    // Selection
    if (!e.shiftKey && !props.lensGroup.selected) {
        releaseAllLenses()
    }
    lensGroup.selected = true

    const m0 = getPositionOnSvg(e);
    const x10s = lensGroup.lenses.map((lens) => lens.x1)
    const x20s = lensGroup.lenses.map((lens) => lens.x2)
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        // Fix d.x within maxLightX < d.x < sensor.x
        for (let i = 0; i < lensGroup.lenses.length; i++) {
            if (x10s[i] + d.x < maxLightX.value) {
                if (Math.abs(maxLightX.value - x10s[i]) < Math.abs(d.x)) {
                    d.x = maxLightX.value - x10s[i]
                }
            } else if (x20s[i] + d.x > sensor.value.x) {
                if (Math.abs(sensor.value.x - x20s[i]) < Math.abs(d.x)) {
                    d.x = sensor.value.x - x20s[i]
                }
            }
        }
        // Update x1 and x2
        lensGroup.lenses.forEach((lens, i) => {
            lens.x1 = x10s[i] + d.x
            lens.x2 = x20s[i] + d.x
        })
    })
}

const deleteLensGroup = (e: any) => {
    preventDefaultAndStopPropagation(e)
    lensGroups.value.splice(props.idx, 1)
}

</script>

<template>
    <g v-for="(lens, idx) in lensGroup.lenses" @dblclick="deleteLensGroup" @mousedown="moveStartHandler">
        <Lens :lens></Lens>
    </g>
</template>