<script setup lang="ts">
import type { Vec } from '@/math'
import { getPositionOnSvg, getPositionOnSvgApp, setMoveHandlerWithM0 } from './SVG.vue'
import { state } from '@/globals'

const props = defineProps<{
  handlerCreator: (...params: any[]) => (e: MouseEvent, d: Vec) => void
}>()

const moveStart = (e: MouseEvent) => {
  // Move only when left button pressed
  if (e.button !== 0) {
    return
  }
  e.preventDefault()
  e.stopPropagation()
  const m0 = getPositionOnSvg(e)
  setMoveHandlerWithM0(props.handlerCreator(e), m0)
  state.value.pointerPos = getPositionOnSvgApp(e)
}
</script>

<template>
  <g @mousedown="moveStart">
    <slot />
  </g>
</template>
