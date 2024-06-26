<script setup lang="ts">
import { ref, computed } from 'vue'
import { state, infR, rUI } from '../globals'
import { vec, Vec } from '../math'
import * as h from '../handlers'
import WithBackground from './WithBackground.vue';

const props = defineProps(['light', 'idx'])

const points = computed(() => {
    const s = props.light.s
    const t = props.light.t
    // const c = s.add(t).div(2)
    const v = t.sub(s)
    const vv = v.rotate(Math.PI / 2) // 90 deg rotation
        .normalize().mul(rUI.value / 2)

    const p1 = t.add(vv)
    const p2 = s.add(vv)
    const p3 = s.add(vv.minus())
    const p4 = t.add(vv.minus())

    return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`
})

</script>

<template>
    <g>
        <!-- <polygon :points class="ui-bg"></polygon> -->
        <g @mousedown="h.lightMoveStartHandler($event, idx)" @dblclick="h.deleteLight($event, idx)">
            <polygon :points :fill="`hsl(${light.color}, 100%, 50%, 0.5)`"></polygon>
            <WithBackground>
                <polygon :points class="stroke-white normal fill-none"></polygon>
            </WithBackground>
        </g>

        <circle :cx="light.s.x" :cy="light.s.y" :r="rUI"
            @mousedown="h.parallelLightNodeMoveStartHandler($event, idx, 's')" class="ui-hidden"></circle>
        <circle :cx="light.t.x" :cy="light.t.y" :r="rUI"
            @mousedown="h.parallelLightNodeMoveStartHandler($event, idx, 't')" class="ui-hidden"></circle>
    </g>
</template>