<script setup lang="ts">
import { ref, computed } from 'vue'
import { state, infR, rUI } from '../globals'
import { vec, Vec } from '../math'
import * as h from '../handlers'

const props = defineProps(['light', 'idx'])

const points = computed(() => {
    const s = props.light.s
    const t = props.light.t
    const c = Vec.add(s, t).div(2)
    const v = Vec.sub(t, s)
    const vv = vec(-v.y, v.x) // 90 deg rotation
        .normalize().mul(rUI.value / 2)

    const p1 = Vec.add(t, vv.copy())
    const p2 = Vec.add(s, vv.copy())
    const p3 = Vec.add(s, vv.copy().minus())
    const p4 = Vec.add(t, vv.copy().minus())

    return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`
})

</script>

<template>
    <g>
        <polygon :points :fill="`hsl(${light.color}, 100%, 50%, 0.5)`"></polygon>
        <polygon :points class="ui-bg"></polygon>
        <polygon :points class="ui" @mousedown="h.lightMoveStartHandler($event, idx)"></polygon>
    </g>
</template>