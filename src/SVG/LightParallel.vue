<script setup lang="ts">
import { computed } from 'vue'
import { lights, rUI } from '../globals'
import { Vec } from '../math'
import WithBackground from './WithBackground.vue';
import CircleUI from './CircleUI.vue';
import MoveUI from './MoveUI.vue';
import { Light } from '@/type';

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

const parallelLightNodeMoveStartHandler = (idx: number, node: Vec) => {
    return () => {
        // Last touched light is always front
        const light = lights.value[idx];
        const newLights = lights.value.filter((light, i) => {
            return i !== idx
        })
        newLights.push(light)
        lights.value = newLights

        const p0 = node.copy()
        const p = node

        return (e: any, d: Vec) => {
            p.x = p0.x + d.x
            p.y = p0.y + d.y
        }
    }
}

const move = (idx: number) => {
    return () => {
        // Last touched light is always front
        const light = lights.value[idx];
        const newLights = lights.value.filter((light, i) => {
            return i !== idx
        })
        newLights.push(light)
        lights.value = newLights

        if (light.type === Light.Parallel) {
            const [s0, t0] = [light.s.copy(), light.t.copy()];
            return (e: any, d: Vec) => {
                const sn = s0.add(d)
                const tn = t0.add(d)
                light.s = sn
                light.t = tn
            }
        } else {
            console.error('Unexpected: This handler is for Parallel Lights.')
            return (e: any, d: Vec) => {
            }
        }
    }
}

const fill = computed(() => {
    if (props.light.colors.length > 1) {
        return `hsl(0, 100%, 100%, 0.5)`
    } else {
        return `hsl(${props.light.colors[0]}, 100%, 50%, 0.5)`
    }
})

const deleteLight = (e: any, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    lights.value.splice(idx, 1)
}

</script>

<template>
    <g>
        <MoveUI :handler-creator="move(idx)">
            <g @dblclick="deleteLight($event, idx)">
                <polygon :points :fill></polygon>
                <WithBackground>
                    <polygon :points class="stroke-white normal fill-none"></polygon>
                </WithBackground>
            </g>
        </MoveUI>

        <MoveUI :handler-creator="parallelLightNodeMoveStartHandler(idx, light.s)">
            <CircleUI :c="light.s"></CircleUI>
        </MoveUI>
        <MoveUI :handler-creator="parallelLightNodeMoveStartHandler(idx, light.t)">
            <CircleUI :c="light.t"></CircleUI>
        </MoveUI>
    </g>
</template>