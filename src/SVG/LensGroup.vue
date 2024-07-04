<script setup lang="ts">
import { lensGroups, releaseAllLenses, sensor } from '../globals'
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
    const x0s = lensGroups.value.map(lensGroup => lensGroup.lenses.map(lens => lens.planes.map(p => p.x)))
    setMoveHandler((e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        // Fix d.x within maxLightX < d.x < sensor.x
        const sensorMinX = Math.min(sensor.value.s.x, sensor.value.t.x)
        for (let i = 0; i < lensGroups.value.length; i++) {
            const lensGroup = lensGroups.value[i];
            if (!lensGroup.selected) {
                continue
            }
            for (let j = 0; j < lensGroup.lenses.length; j++) {
                const lens = lensGroup.lenses[j]
                for (let k = 0; k < lens.planes.length; k++) {
                    if (x0s[i][j][k] + d.x > sensorMinX) {
                        if (Math.abs(sensorMinX - x0s[i][j][k]) < Math.abs(d.x)) {
                            d.x = sensorMinX - x0s[i][j][k]
                        }
                    }
                }
            }
        }
        // Update position
        lensGroups.value.forEach((lensGroup, i) => {
            if (!lensGroup.selected) {
                return
            }
            lensGroup.lenses.forEach((lens, j) => {
                lens.planes.forEach((p, k) => {
                    p.x = x0s[i][j][k] + d.x
                })
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