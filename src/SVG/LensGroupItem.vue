<script lang="ts">
export class LensGroup {
  lenses: ShallowRef<Lens[]>
  selected: Ref<boolean>
  enabled: Ref<boolean>
  fixed: Ref<boolean>

  constructor(lenses: Lens[], selected: boolean, enabled: boolean, fixed: boolean) {
    this.lenses = shallowRef(lenses)
    this.selected = ref(selected)
    this.enabled = ref(enabled)
    this.fixed = ref(fixed)
  }
}

export const groupLensGroups = () => {
  const selected = lensGroups.value.filter((g) => g.selected.value)
  const notSelected = lensGroups.value.filter((g) => !g.selected.value)
  const selectedLenses = selected.reduce((acc: Lens[], cur) => {
    return acc.concat(cur.lenses.value)
  }, [])
  const newGroup = new LensGroup(selectedLenses, true, true, false)
  notSelected.push(newGroup)
  lensGroups.value = notSelected
}

export const ungroupLensGroup = () => {
  const selected = lensGroups.value.filter((g) => g.selected.value)
  const notSelected = lensGroups.value.filter((g) => !g.selected.value)
  const newGroups: LensGroup[] = selected.reduce((acc: LensGroup[], cur) => {
    const groups: LensGroup[] = cur.lenses.value.map((lens) => {
      return new LensGroup([lens], cur.selected.value, cur.enabled.value, cur.fixed.value)
    })
    return acc.concat(groups)
  }, [])
  lensGroups.value = notSelected.concat(newGroups)
}
</script>

<script setup lang="ts">
import type { Vec } from '@/math'
import { lensGroups, lights, releaseAllLenses, sensor } from '../globals'

import LensSVG, { Lens } from './LensItem.vue'
import MoveUI from './MoveUI.vue'
import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

const props = defineProps<{
  lensGroup: LensGroup
  idx: number
}>()

const move = (e: MouseEvent) => {
  // Selection
  if (!e.shiftKey && !props.lensGroup.selected.value) {
    releaseAllLenses()
  }
  sensor.value.selected = false
  // Lights
  lights.value.forEach((light) => {
    light.selected.value = false
  })
  const lensGroup = lensGroups.value[props.idx]
  lensGroup.selected.value = true

  if (props.lensGroup.fixed.value) {
    return () => {}
  }

  const x0s = lensGroups.value.map((lensGroup) =>
    lensGroup.lenses.value.map((lens) => lens.planes.value.map((p) => p.x.value))
  )
  return (e: any, d: Vec) => {
    // Update position
    lensGroups.value.forEach((lensGroup, i) => {
      if (!lensGroup.selected.value) {
        return
      }
      lensGroup.lenses.value.forEach((lens, j) => {
        lens.planes.value.forEach((p, k) => {
          p.x.value = x0s[i][j][k] + d.x
        })
      })
    })
  }
}
</script>

<template>
  <MoveUI :handler-creator="move">
    <g v-for="(lens, idx) in lensGroup.lenses.value" :key="idx">
      <g :class="{ disabled: !lensGroup.enabled.value }">
        <LensSVG :lens :selected="lensGroup.selected.value" :fixed="lensGroup.fixed.value" />
      </g>
    </g>
  </MoveUI>
</template>
