<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

import { state } from './state'
import * as h from './handlers'

// Reference to the svg element
// This is needed for handles in handlers.ts
// TODO: Find a better way
const svg = ref()
onMounted(() => {
  h.setSvg(svg)
})

const svgViewBox = computed(() => {
  const x = state.value.cx - state.value.width * 0.5 / state.value.scale
  const y = state.value.cy - state.value.height * 0.5 / state.value.scale
  const w = state.value.width / state.value.scale
  const h = state.value.height / state.value.scale
  return `${x} ${y} ${w} ${h}`
})

</script>

<template>
  <svg id="main-svg" ref="svg" :view-box.camel="svgViewBox" :width="state.width" :height="state.height"
    @mousedown="h.svgMoveStartHandler" @mousemove="h.svgMoveHandler" @mouseup="h.svgMoveEndHandler"
    @mouseleave="h.svgMoveEndHandler" @wheel="h.svgScaleHandler">

    <!-- Lights -->
    <g v-for="(light, idx) of state.lights">
      <circle :cx="light.x" :cy="light.y" :r="state.style.rLight" :fill="light.color" stroke="white"
        :stroke-width="state.style.lightStrokeWidth" @mousedown="h.lightMoveStartHandler($event, idx)">
      </circle>
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: hidden;
  display: block;
}
</style>
