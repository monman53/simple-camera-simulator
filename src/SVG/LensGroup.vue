<script lang="ts">
export const groupLensGroups = () => {
    const selected = lensGroups.value.filter(g => g.selected)
    const notSelected = lensGroups.value.filter(g => !g.selected)
    const selectedLenses = selected.reduce((acc: Lens[], cur) => {
        return acc.concat(cur.lenses)
    }, [])
    const newGroup: LensGroup = {
        lenses: selectedLenses,
        selected: true,
        enabled: true,
        fixed: false,
    }
    notSelected.push(newGroup)
    lensGroups.value = notSelected
}

export const ungroupLensGroup = () => {
    const selected = lensGroups.value.filter(g => g.selected)
    const notSelected = lensGroups.value.filter(g => !g.selected)
    const newGroups: LensGroup[] = selected.reduce((acc: LensGroup[], cur) => {
        const groups: LensGroup[] = cur.lenses.map(lens => {
            return {
                lenses: [lens],
                selected: cur.selected,
                enabled: cur.enabled,
                fixed: cur.fixed,
            }
        })
        return acc.concat(groups)
    }, [])
    lensGroups.value = notSelected.concat(newGroups)
}
</script>

<script setup lang="ts">
import type { Vec } from '@/math';
import { lensGroups, releaseAllLenses, sensor } from '../globals'
import { type Lens, type LensGroup } from '../type'

import LensSVG from './Lens.vue'
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
    sensor.value.selected = false
    props.lensGroup.selected = !props.lensGroup.selected

    if (props.lensGroup.fixed) {
        return () => { }
    }

    const x0s = lensGroups.value.map(lensGroup => lensGroup.lenses.map(lens => lens.planes.value.map(p => p.x)))
    return (e: any, d: Vec) => {
        // Update position
        lensGroups.value.forEach((lensGroup, i) => {
            if (!lensGroup.selected) {
                return
            }
            lensGroup.lenses.forEach((lens, j) => {
                lens.planes.value.forEach((p, k) => {
                    p.x = x0s[i][j][k] + d.x
                })
            })
        })
    }
}

</script>

<template>
    <MoveUI :handler-creator="move">
        <g v-for="(lens, idx) in lensGroup.lenses">
            <g :class="{ disabled: !lensGroup.enabled }">
                <LensSVG :lens :selected="lensGroup.selected" :fixed="lensGroup.fixed"></LensSVG>
            </g>
        </g>
    </MoveUI>
</template>