<script setup lang="ts">
import { lensGroups, releaseAllLenses, sensor, maxLightX } from '../globals'
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
    // Selection
    if (!e.shiftKey && !props.lensGroup.selected) {
        releaseAllLenses()
    }
    props.lensGroup.selected = true

    const m0 = getPositionOnSvg(e);
    const x10s = lensGroups.value.map((lensGroup) => lensGroup.lenses.map((lens) => lens.x1))
    const x20s = lensGroups.value.map((lensGroup) => lensGroup.lenses.map((lens) => lens.x2))
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        // Fix d.x within maxLightX < d.x < sensor.x
        for (let i = 0; i < lensGroups.value.length; i++) {
            const lensGroup = lensGroups.value[i];
            if (!lensGroup.selected) {
                continue
            }
            for (let j = 0; j < lensGroup.lenses.length; j++) {
        const sensorMinX = Math.min(sensor.value.s.x, sensor.value.t.x)
                if (x10s[i][j] + d.x < maxLightX.value) {
                    if (Math.abs(maxLightX.value - x10s[i][j]) < Math.abs(d.x)) {
                        d.x = maxLightX.value - x10s[i][j]
                    }
                } else if (x20s[i][j] + d.x > sensorMinX) {
                    if (Math.abs(sensorMinX - x20s[i][j]) < Math.abs(d.x)) {
                        d.x = sensorMinX - x20s[i][j]
                    }
                }
            }
        }
        // Update x1 and x2
        lensGroups.value.forEach((lensGroup, i) => {
            if (!lensGroup.selected) {
                return
            }
            lensGroup.lenses.forEach((lens, j) => {
                lens.x1 = x10s[i][j] + d.x
                lens.x2 = x20s[i][j] + d.x
            })
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
        <Lens :lens :selected="lensGroup.selected"></Lens>
    </g>
</template>