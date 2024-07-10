<script lang="ts">
export const addLight = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m = getPositionOnSvgApp(e);
    let wavelengths = [state.value.newLightWavelength]
    if (state.value.newLightColorComposite) {
        const n = state.value.newLightColorCompositeN
        wavelengths = []
        for (let i = 0; i < n; i++) {
            wavelengths.push(wavelength.min * i / n + wavelength.max * (n - i) / n)
        }
    }
    if (state.value.newLightType === 'Point') {
        lights.value.push({ type: 'Point', c: m, wavelengths })
    }
    if (state.value.newLightType === 'Parallel') {
        lights.value.push({ type: 'Parallel', s: vec(m.x, m.y - 25), t: vec(m.x, m.y + 25), wavelengths })
    }
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { lights, rUI, state } from '../globals'
import { Vec, vec } from '../math'
import WithBackground from './WithBackground.vue';
import CircleUI from './CircleUI.vue';
import MoveUI from './MoveUI.vue';
import type { LightParallel, LightType } from '@/type';
import { lightHSL, wavelength } from '@/collection/color';
import { getPositionOnSvgApp, preventDefaultAndStopPropagation } from './SVG.vue';

const props = defineProps<{
    light: LightType
    idx: number,
}>()

const points = computed(() => {
    if (props.light.type === 'Parallel') {
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
    } else {
        return ''
    }
})

const parallelLightNodeMoveStartHandler = (idx: number, light: LightParallel) => {
    return () => {
        // Last touched light is always front
        {
            const light = lights.value[idx];
            const newLights = lights.value.filter((light, i) => {
                return i !== idx
            })
            newLights.push(light)
            lights.value = newLights
        }

        const s0 = light.s.copy()
        const m0 = light.s.add(light.t).div(2)

        return (e: any, d: Vec) => {
            const ns = s0.add(d)
            if (e.shiftKey) {
                ns.x = m0.x
            }
            light.s = ns
            light.t = m0.add(m0.sub(ns))
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

        if (light.type === "Parallel") {
            const s0 = light.s.copy()
            const t0 = light.t.copy()
            const m0 = s0.add(t0).div(2)
            return (e: any, d: Vec) => {
                const sn = s0.add(d)
                const tn = t0.add(d)
                if (e.shiftKey) {
                    sn.y = s0.y - m0.y
                    tn.y = t0.y - m0.y
                }
                light.s = sn
                light.t = tn
            }
        } else {
            const c0 = light.c.copy()
            return (e: any, d: Vec) => {
                light.c.x = c0.x + d.x
                light.c.y = c0.y + d.y
            }
        }
    }
}

const fill = computed(() => {
    if (props.light.wavelengths.length > 1) {
        return `hsl(0, 100%, 100%, 0.5)`
    } else {
        return lightHSL(props.light.wavelengths[0], 0.5)
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
        <g v-if="light.type === 'Point'">
            <MoveUI :handler-creator="move(idx)">
                <g @dblclick="deleteLight($event, idx)" class="grab">
                    <WithBackground>
                        <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" class="stroke-white normal fill-none"></circle>
                    </WithBackground>
                    <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" :fill></circle>
                </g>
            </MoveUI>
        </g>
        <g v-if="light.type === 'Parallel'">
            <MoveUI :handler-creator="move(idx)">
                <g @dblclick="deleteLight($event, idx)">
                    <polygon :points :fill></polygon>
                    <WithBackground>
                        <polygon :points class="stroke-white normal fill-none"></polygon>
                    </WithBackground>
                </g>
            </MoveUI>

            <MoveUI :handler-creator="parallelLightNodeMoveStartHandler(idx, light)">
                <CircleUI :c="light.s"></CircleUI>
            </MoveUI>
        </g>
    </g>
</template>