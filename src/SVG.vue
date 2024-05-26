<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

import { state, lights, lens, sensor, options, style, infR } from './globals'
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
    @mouseleave="h.svgMoveEndHandler" @wheel="h.svgScaleHandler" @dblclick="h.addLight">

    <!-- Lens and Sensor move dummy element-->
    <g v-if="options.lens && options.sensor" class="hover-parent">
      <!-- lens -->
      <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 0 ${lens.x} ${lens.r}`" fill="none" class="hover-child" />
      <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 1 ${lens.x} ${lens.r}`" fill="none" class="hover-child" />
      <!-- sensor -->
      <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="hover-child" />
      <!-- dummy for ui -->
      <rect class="dummy" :x="lens.x" :y="-Math.max(lens.r, sensor.r)" :width="sensor.x - lens.x"
        :height="2 * Math.max(lens.r, sensor.r)" @mousedown="h.cameraMoveStartHandler" />
    </g>

    <!-- Lens -->
    <g v-if="options.lens">
      <g class="hover-parent">
        <!-- left half -->
        <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 0 ${lens.x} ${lens.r}`" fill="none" class="hover-child" />
        <!-- right half -->
        <path :d="`M ${lens.x} ${-lens.r} A ${R} ${R} 0 0 1 ${lens.x} ${lens.r}`" fill="none" class="hover-child" />
        <!-- dummy for ui -->
        <rect class='dummy' :x="lens.x - lens.d / 2" :y="-lens.r" :width="lens.d" :height="2 * lens.r"
          @mousedown="h.lensMoveStartHandler" />
      </g>
      <!-- Focal points -->
      <g v-if="options.lensFocalPoints">
        <!-- left hand -->
        <g class="hover-parent">
          <circle :cx="lens.x - lens.f" cy="0" r="1" fill="white"></circle>
          <!-- UI -->
          <circle :cx="lens.x - lens.f" cy="0" r="4" @mousedown="h.focalPointMoveStartHandler"
            class="hidden-hover-child"></circle>
        </g>
        <!-- right hand -->
        <circle :cx="lens.x + lens.f" cy="0" r="1" fill="white"></circle>
      </g>
    </g>

    <!-- Lights -->
    <g v-for="(light, idx) of lights" class="hover-parent">
      <circle :cx="light.x" :cy="light.y" :r="style.rLight" :fill="`hsl(${light.color}, 100%, 50%)`" @dblclick="h.deleteLight($event, idx)"
        @mousedown="h.lightMoveStartHandler($event, idx)" class="hover-child">
      </circle>
    </g>

    <!-- Body -->
    <g v-if="options.body">
      <line :x1="lens.x" :y1="lens.r" :x2="lens.x" :y2="infR" class="hover-child" />
      <line :x1="lens.x" :y1="-lens.r" :x2="lens.x" :y2="-infR" class="hover-child" />
    </g>

    <!-- Sensor -->
    <g v-if="options.sensor">
      <g class="hover-parent">
        <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="hover-child" />
        <!-- dummy for ui -->
        <rect class='dummy' :x="sensor.x - 2" :y="-sensor.r" :width="4" :height="2 * sensor.r"
          @mousedown="h.sensorMoveStartHandler" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: hidden;
  display: block;
}

.dummy {
  fill: transparent;
}

.hidden-hover-child {
  fill: transparent;
}

.hover-child {
  stroke: white;
  stroke-width: 0.2;
}

.hover-parent:hover .hover-child,
.hover-parent:hover .hidden-hover-child {
  stroke: white;
  stroke-width: 0.5;
}
</style>
