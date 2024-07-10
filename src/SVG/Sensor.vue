<script lang="ts">
export const resizeSensor = (r: number) => {
    const s0 = sensor.value.s.copy()
    const t0 = sensor.value.t.copy()
    const m0 = s0.add(t0).div(2)

    const sn = m0.add(s0.sub(m0).normalize().mul(r))
    const tn = m0.add(t0.sub(m0).normalize().mul(r))
    sensor.value.s = sn
    sensor.value.t = tn
}
</script>

<script setup lang="ts">
import { sensor } from '@/globals';
import { Vec } from '@/math';
import WithBackground from './WithBackground.vue';
import CircleUI from './CircleUI.vue';
import MoveUI from './MoveUI.vue';
import { releaseALlItems } from '@/utils';

const move = () => {
    releaseALlItems()
    sensor.value.selected = true

    const s0 = sensor.value.s.copy()
    const t0 = sensor.value.t.copy()
    return (e: any, d: Vec) => {
        const sn = s0.add(d)
        const tn = t0.add(d)
        if (!e.shiftKey) {
            const ym = (s0.y + t0.y) / 2
            sn.y = s0.y - ym
            tn.y = t0.y - ym
        }
        sensor.value.s = sn
        sensor.value.t = tn
    }
}

const resize = () => {
    const s0 = sensor.value.s.copy()
    const t0 = sensor.value.t.copy()
    const m0 = s0.add(t0).div(2)
    return (e: any, d: Vec) => {
        const sn = s0.add(d)
        if (!e.shiftKey) {
            sn.x = m0.x
        }
        const tn = m0.add(sn.sub(m0).minus())
        sensor.value.s = sn
        sensor.value.t = tn
    }
}

</script>

<template>
    <g>
        <MoveUI :handler-creator="move" class="grab">
            <WithBackground :ui="true">
                <line :x1="sensor.s.x" :y1="sensor.s.y" :x2="sensor.t.x" :y2="sensor.t.y" class="stroke-white"
                    :class="{ normal: !sensor.selected, bold: sensor.selected }" />
            </WithBackground>
        </MoveUI>
        <MoveUI :handler-creator="resize" class="grab">
            <CircleUI :c="sensor.s"></CircleUI>
        </MoveUI>
    </g>
</template>