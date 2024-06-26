<script setup lang="ts">
import { ref, computed } from 'vue'
import { state, lights, infR, rUI, minLensX } from '../globals'
import { vec, Vec } from '../math'
import * as h from '../handlers'
import WithBackground from './WithBackground.vue';
import {Light} from '../type'
import CircleUI from './CircleUI.vue';

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

const parallelLightNodeMoveStartHandler = (e: any, idx: number, node: Vec) => {
    h.preventDefaultAndStopPropagation(e)
    // Last touched light is always front
    const light = lights.value[idx];
    const newLights = lights.value.filter((light, i) => {
        return i !== idx
    })
    newLights.push(light)
    lights.value = newLights

    if (light.type === Light.Parallel) {
        const m0 = h.getPositionOnSvg(e);
        const p0 = node.copy()
        const p = node
        h.setMoveHandler((e_: any) => {
            const d = h.getPositionDiffOnSvgApp(e_, m0)
            if (p0.x + d.x > minLensX.value) {
                p.x = minLensX.value
            } else {
                p.x = p0.x + d.x
            }
            p.y = p0.y + d.y
        })
    }
}

</script>

<template>
    <g>
        <g @mousedown="h.lightMoveStartHandler($event, idx)" @dblclick="h.deleteLight($event, idx)">
            <polygon :points :fill="`hsl(${light.color}, 100%, 50%, 0.5)`"></polygon>
            <WithBackground>
                <polygon :points class="stroke-white normal fill-none"></polygon>
            </WithBackground>
        </g>

        <CircleUI :c="light.s" @mousedown="parallelLightNodeMoveStartHandler($event, idx, light.s)"></CircleUI>
        <CircleUI :c="light.t" @mousedown="parallelLightNodeMoveStartHandler($event, idx, light.t)"></CircleUI>
    </g>
</template>