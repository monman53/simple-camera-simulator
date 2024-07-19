<script lang="ts">
class LightBase {
  isComposite: Ref<boolean>
  compositeN: Ref<number>
  wavelength: Ref<number>
  selected: Ref<boolean>
  nRaysLog: Ref<number>
  nRays: ComputedRef<number>
  wavelengths: ComputedRef<number[]>
  constructor(isComposite: boolean, wavelength: number) {
    this.isComposite = ref(isComposite)
    this.wavelength = ref(wavelength)
    this.compositeN = ref(3)
    this.selected = ref(false)
    this.nRaysLog = ref(10)
    this.nRays = computed(() => {
      return 1 << this.nRaysLog.value
    })
    this.wavelengths = computed(() => {
      if (this.isComposite.value) {
        const wavelengths = []
        const n = this.compositeN.value
        for (let i = 0; i < n; i++) {
          wavelengths.push(
            (wavelengthCollection.min * i) / n + (wavelengthCollection.max * (n - i)) / n
          )
        }
        return wavelengths
      } else {
        return [this.wavelength.value]
      }
    })
  }
}
export class LightPoint extends LightBase {
  c: Ref<Vec>
  constructor(c: Vec, isComposite: boolean, wavelength: number) {
    super(isComposite, wavelength)
    this.c = ref(c)
  }
}
export class LightParallel extends LightBase {
  s: Ref<Vec>
  t: Ref<Vec>
  constructor(s: Vec, t: Vec, isComposite: boolean, wavelength: number) {
    super(isComposite, wavelength)
    this.s = ref(s)
    this.t = ref(t)
  }
}
export type LightType = LightPoint | LightParallel

export const addLight = (e: any) => {
  preventDefaultAndStopPropagation(e)
  const m = getPositionOnSvgApp(e)
  if (state.value.newLightType === 'Point') {
    lights.value.push(
      new LightPoint(m, state.value.newLightColorComposite, state.value.newLightWavelength)
    )
  }
  if (state.value.newLightType === 'Parallel') {
    const s = vec(m.x, m.y - 25)
    const t = vec(m.x, m.y + 25)
    lights.value.push(
      new LightParallel(s, t, state.value.newLightColorComposite, state.value.newLightWavelength)
    )
  }
  triggerRef(lights)
}
</script>

<script setup lang="ts">
import { computed, ref, triggerRef, type Ref } from 'vue'
import { lights, rUI, state } from '../globals'
import { Vec, vec } from '../math'
import WithBackground from './WithBackground.vue'
import CircleUI from './CircleUI.vue'
import MoveUI from './MoveUI.vue'
import { lightHSL, wavelengthCollection } from '@/collection/color'
import { getPositionOnSvgApp, preventDefaultAndStopPropagation } from './SVG.vue'
import type { ComputedRef } from 'vue'
import { releaseALlItems } from '@/utils'

const props = defineProps<{
  light: LightType
  idx: number
}>()

const points = computed(() => {
  if (props.light instanceof LightParallel) {
    const s = props.light.s.value
    const t = props.light.t.value
    // const c = s.add(t).div(2)
    const v = t.sub(s)
    const vv = v
      .rotate(Math.PI / 2) // 90 deg rotation
      .normalize()
      .mul(rUI.value / 2)

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
      const light = lights.value[idx]
      const newLights = lights.value.filter((light, i) => {
        return i !== idx
      })
      newLights.push(light)
      lights.value = newLights
    }

    const s0 = light.s.value.copy()
    const m0 = light.s.value.add(light.t.value).div(2)

    return (e: MouseEvent, d: Vec) => {
      const ns = s0.add(d)
      if (e.shiftKey) {
        ns.x = m0.x
      }
      light.s.value = ns
      light.t.value = m0.add(m0.sub(ns))
    }
  }
}

const move = (idx: number) => {
  return () => {
    const light = lights.value[idx]

    // Selection
    releaseALlItems()
    light.selected.value = true

    // Last touched light is always front
    const newLights = lights.value.filter((light, i) => {
      return i !== idx
    })
    newLights.push(light)
    lights.value = newLights
    triggerRef(lights)

    if (light instanceof LightParallel) {
      const s0 = light.s.value.copy()
      const t0 = light.t.value.copy()
      const m0 = s0.add(t0).div(2)
      return (e: MouseEvent, d: Vec) => {
        const sn = s0.add(d)
        const tn = t0.add(d)
        if (e.shiftKey) {
          sn.y = s0.y - m0.y
          tn.y = t0.y - m0.y
        }
        light.s.value = sn
        light.t.value = tn
      }
    } else {
      const c0 = light.c.value.copy()
      return (e: any, d: Vec) => {
        light.c.value = c0.add(d)
      }
    }
  }
}

const fill = computed(() => {
  if (props.light.isComposite.value) {
    return `hsl(0, 100%, 100%, 0.5)`
  } else {
    return lightHSL(props.light.wavelength.value, 0.5)
  }
})

const deleteLight = (e: any, idx: number) => {
  e.preventDefault()
  e.stopPropagation()
  lights.value.splice(idx, 1)
  triggerRef(lights)
}
</script>

<template>
  <g>
    <g v-if="light instanceof LightPoint">
      <MoveUI :handler-creator="move(idx)">
        <g class="grab" @dblclick="deleteLight($event, idx)">
          <WithBackground>
            <circle
              :cx="light.c.value.x"
              :cy="light.c.value.y"
              :r="rUI"
              class="stroke-white fill-none"
              :class="{ bold: light.selected.value, normal: !light.selected.value }"
            />
          </WithBackground>
          <circle :cx="light.c.value.x" :cy="light.c.value.y" :r="rUI" :fill />
        </g>
      </MoveUI>
    </g>
    <g v-if="light instanceof LightParallel">
      <MoveUI :handler-creator="move(idx)">
        <g @dblclick="deleteLight($event, idx)">
          <polygon :points :fill />
          <WithBackground>
            <polygon
              :points
              class="stroke-white fill-none"
              :class="{ bold: light.selected.value, normal: !light.selected.value }"
            />
          </WithBackground>
        </g>
      </MoveUI>

      <MoveUI :handler-creator="parallelLightNodeMoveStartHandler(idx, light)">
        <CircleUI :c="light.s.value" />
      </MoveUI>
    </g>
  </g>
</template>
