<script setup lang="ts">
import type { Vec } from '@/math';
import { lensGroups, releaseAllLenses, sensor } from '../globals'
import { type LensGroup } from '../type'

import Lens from './Lens.vue'
import MoveUI from './MoveUI.vue';

const props = defineProps<{
    lensGroup: LensGroup
    idx: number
}>()

const move = (e: any) => {
    // Selection
    if (!e.shiftKey && !props.lensGroup.selected) {
        releaseAllLenses()
    }
    props.lensGroup.selected = true

    const x0s = lensGroups.value.map(lensGroup => lensGroup.lenses.map(lens => lens.planes.map(p => p.x)))
    return (e: any, d: Vec) => {
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
    }
}

const deleteLensGroup = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    lensGroups.value.splice(props.idx, 1)
}

</script>

<template>
    <MoveUI :handler-creator="move">
        <g v-for="(lens, idx) in lensGroup.lenses" @dblclick="deleteLensGroup">
            <Lens :lens :selected="lensGroup.selected"></Lens>
        </g>
    </MoveUI>
</template>