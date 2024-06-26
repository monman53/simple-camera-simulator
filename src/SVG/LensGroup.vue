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

const deleteLensGroup = (e: any) => {
    preventDefaultAndStopPropagation(e)
    lensGroups.value.splice(props.idx, 1)
}

</script>

<template>
    <g v-for="(lens, idx) in lensGroup.lenses" @dblclick="deleteLensGroup">
        <Lens :lens></Lens>
    </g>
</template>