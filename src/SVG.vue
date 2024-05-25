<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

import { state, lights, lens, sensor, options, style } from './grobals'
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

const R = computed(() => {
  const r = lens.value.r;
  const d = lens.value.d;
  return r * r / d + d / 4;
})

</script>

<template>
  <svg id="main-svg" ref="svg" :view-box.camel="svgViewBox" :width="state.width" :height="state.height"
    @mousedown="h.svgMoveStartHandler" @mousemove="h.svgMoveHandler" @mouseup="h.svgMoveEndHandler"
    @mouseleave="h.svgMoveEndHandler" @wheel="h.svgScaleHandler">

    <!-- Lights -->
    <g v-for="(light, idx) of lights">
      <circle :cx="light.x" :cy="light.y" :r="style.rLight" :fill="light.color" stroke="white"
        :stroke-width="style.defaultStrokeWidth" @mousedown="h.lightMoveStartHandler($event, idx)">
      </circle>
    </g>

    <!-- Lens -->
    <g v-if="options.lens">
      <g>
        <!-- left half -->
        <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 0 ${lens.x} ${lens.r}`" fill="none" stroke="white"
          :stroke-width="style.defaultStrokeWidth" />
        <!-- right half -->
        <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 1 ${lens.x} ${lens.r}`" fill="none" stroke="white"
          :stroke-width="style.defaultStrokeWidth" />
        <!-- dummy for ui -->
        <rect class='ui' :x="lens.x - lens.d / 2" :y="-lens.r" :width="lens.d" :height="2 * lens.r"
          @mousedown="h.lensMoveStartHandler" />
      </g>
      <!-- Focal points -->
      <g>
        <circle :cx="lens.x - lens.f" cy="0" r="1" fill="white"></circle>
        <circle :cx="lens.x + lens.f" cy="0" r="1" fill="white"></circle>
      </g>
    </g>

    <!-- Sensor -->
    <g v-if="options.sensor">
      <line class="svg-sensor" :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" stroke="white"
        :stroke-width="style.defaultStrokeWidth" />
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: hidden;
  display: block;
}

.ui {
  fill: transparent;
}
</style>
