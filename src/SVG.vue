<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

import { state, lights, lens, sensor, field, options, style, lensR, lensD, infR } from './globals'
import * as h from './handlers'
import { isBinaryOperatorToken, isSwitchStatement } from 'typescript';

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

const grid = computed(() => {
  const xs: number[] = []
  const ys: number[] = []
  const bxs: number[] = []
  const bys: number[] = []
  const xMin = state.value.cx - state.value.width / 2 / state.value.scale;
  const xMax = state.value.cx + state.value.width / 2 / state.value.scale
  const yMin = state.value.cy - state.value.height / 2 / state.value.scale;
  const yMax = state.value.cy + state.value.height / 2 / state.value.scale;
  const size = Math.max(xMax - xMin, yMax - yMin);
  const interval = Math.pow(10, Math.floor(Math.log10(size * 0.3)));
  const boldInterval = interval * 10;
  for (let x = Math.floor(xMin / interval) * interval; x < xMax; x += interval) {
    xs.push(x)
  }
  for (let y = Math.floor(yMin / interval) * interval; y < yMax; y += interval) {
    ys.push(y)
  }
  for (let x = Math.floor(xMin / boldInterval) * boldInterval; x < xMax; x += boldInterval) {
    bxs.push(x)
  }
  for (let y = Math.floor(yMin / boldInterval) * boldInterval; y < yMax; y += boldInterval) {
    bys.push(y)
  }
  return { xs, ys, bxs, bys }
})

</script>

<template>
  <svg id="main-svg" ref="svg" :view-box.camel="svgViewBox" :width="state.width" :height="state.height"
    @mousedown="h.svgMoveStartHandler" @mousemove="h.svgMoveHandler" @mouseup="h.svgMoveEndHandler"
    @mouseleave="h.svgMoveEndHandler" @wheel="h.svgScaleHandler" @dblclick="h.addLight">

    <!-- Optical axis -->
    <g v-if="options.opticalAxis">
      <line :x1="-infR" y1="0" :x2="infR" y2="0" stroke="white" :stroke-width="0.5 / state.scale"></line>
      </g>


    <!-- Grid -->
    <g v-if="options.grid">
      <line v-for="x of grid.xs" :x1="x" :y1="-infR" :x2="x" :y2="infR" stroke="white" :stroke-width="0.5 / state.scale"></line>
      <line v-for="y of grid.ys" :y1="y" :x1="-infR" :y2="y" :x2="infR" stroke="white" :stroke-width="0.5 / state.scale"></line>
      <line v-for="x of grid.bxs" :x1="x" :y1="-infR" :x2="x" :y2="infR" stroke="white" :stroke-width="1 / state.scale"></line>
      <line v-for="y of grid.bys" :y1="y" :x1="-infR" :y2="y" :x2="infR" stroke="white" :stroke-width="1 / state.scale"></line>
    </g>

    <!-- Lens and Sensor move dummy element-->
    <g v-if="options.lens && options.sensor" class="hover-parent">
      <!-- lens -->
      <path :d="`M ${lens.x} ${-lens.r} A ${lensR} ${lensR} 0 0 0 ${lens.x} ${lens.r}`" class="hover-child fill-none" />
      <path :d="`M ${lens.x} ${-lens.r} A ${lensR} ${lensR} 0 0 1 ${lens.x} ${lens.r}`" class="hover-child fill-none" />
      <!-- sensor -->
      <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="hover-child" />
      <!-- dummy for ui -->
      <rect class="ui-transparent" :x="lens.x" :y="-Math.max(lens.r, sensor.r)" :width="sensor.x - lens.x"
        :height="2 * Math.max(lens.r, sensor.r)" @mousedown="h.cameraMoveStartHandler" />
    </g>

    <!-- Lens -->
    <g v-if="options.lens">
      <g class="hover-parent">
        <!-- left half -->
        <path :d="`M ${lens.x} ${-lens.r} A ${lensR} ${lensR} 0 0 0 ${lens.x} ${lens.r}`" class="hover-child fill-none" />
        <!-- right half -->
        <path :d="`M ${lens.x} ${-lens.r} A ${lensR} ${lensR} 0 0 1 ${lens.x} ${lens.r}`" class="hover-child fill-none" />
        <!-- dummy for ui -->
        <rect class='ui-transparent' :x="lens.x - lensD / 2" :y="-lens.r" :width="lensD" :height="2 * lens.r"
          @mousedown="h.lensMoveStartHandler" />
      </g>
      <!-- Focal points -->
      <g v-if="options.lensFocalPoints">
        <!-- left hand -->
        <g>
          <circle :cx="lens.x - lens.f" cy="0" r="0.6" class="white"></circle>
          <!-- UI -->
          <circle :cx="lens.x - lens.f" cy="0" :r="style.rUI" @mousedown="h.focalPointMoveStartHandler" class="ui-hidden">
          </circle>
        </g>
        <!-- right hand -->
        <circle :cx="lens.x + lens.f" cy="0" r="0.6" class="white"></circle>
      </g>
      <!-- Lens size change UI-->
      <circle :cx="lens.x" :cy="-lens.r" :r="style.rUI" class="ui-hidden" @mousedown="h.lensSizeChangeStartHandler">
      </circle>
    </g>

    <!-- Aperture -->
    <g v-if="options.aperture">
      <circle :cx="lens.x" :cy="lens.r * lens.aperture" :r="style.rUI" @mousedown="h.apertureSizeChangeStartHandler"
        class="hover-sibling-master ui-hidden"></circle>
      <line :x1="lens.x" :y1="-lens.r" :x2="lens.x" :y2="-lens.r * lens.aperture" class="hover-sibling no-pointer-events thick">
      </line>
      <line :x1="lens.x" :y1="lens.r" :x2="lens.x" :y2="lens.r * lens.aperture" class="hover-sibling no-pointer-events thick">
      </line>
    </g>

    <!-- Lights -->
    <g v-for="(light, idx) of lights">
      <circle :cx="light.x" :cy="light.y" :r="style.rUI" :fill="`hsl(${light.color}, 100%, 50%)`">
      </circle>
      <circle :cx="light.x" :cy="light.y" :r="style.rUI" @dblclick="h.deleteLight($event, idx)"
        @mousedown="h.lightMoveStartHandler($event, idx)" class="ui">
      </circle>
    </g>

    <!-- Body -->
    <g v-if="options.body">
      <line :x1="lens.x" :y1="lens.r" :x2="lens.x" :y2="infR" class="white thick" />
      <line :x1="lens.x" :y1="-lens.r" :x2="lens.x" :y2="-infR" class="white thick" />
    </g>

    <!-- Sensor -->
    <g v-if="options.sensor">
      <g class="hover-parent">
        <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="hover-child" />
        <!-- dummy for ui -->
        <rect :y="-sensor.r" :width="style.rUI * 2" :height="2 * sensor.r" @mousedown="h.sensorMoveStartHandler"
          class='ui-transparent' :x="sensor.x - 2" />
      </g>

      <circle :cx="sensor.x" :cy="-sensor.r" :r="style.rUI" class="ui-hidden" @mousedown="h.sensorSizeChangeStartHandler">
      </circle>
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: hidden;
  display: block;
}

/* line {
  stroke: white;
  stroke-width: 0.2;
} */

.hover-child {
  stroke: white;
  stroke-width: 0.2;
}

.fill-none {
  fill: none;
}

.no-pointer-events {
  pointer-events: none;
}

.hover-sibling-master:hover~.hover-sibling,
.hover-parent:hover .hover-child,
.hover-parent:hover .hidden-hover-child {
  stroke: white;
  stroke-width: 0.6;
}

.ui {
  stroke: white;
  stroke-width: 0.2;
  fill: transparent
}

.ui-transparent,
.ui-hidden {
  stroke: none;
  fill: transparent;
}

.ui:hover,
.ui-hidden:hover {
  stroke: white;
  stroke-width: 0.6;
}

.white {
  fill: white;
}

.thick {
  stroke: white;
  stroke-width: 0.2;
}

.bold {
  stroke-width: 0.6;
}

.grid-thick {
  stroke: white;
  stroke-width: 0.04;
}
</style>
