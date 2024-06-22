<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

import { state, lights, lens, items, sensor, style, apple, options, lensR, lensD, infR, fNumber, rUI } from '../globals'
import * as h from '../handlers'
import { Light } from '../type'

import Grid from './Grid.vue'
import Guideline from './Guideline.vue'
import LightParallel from './LightParallel.vue'
import Lens from './Lens.vue'

// Reference to the svg element
// This is needed for handles in handlers.ts
// TODO: Find a better way
const svg = ref()
onMounted(() => {
  h.setSvg(svg)
})

const svgViewBox = computed(() => {
  const x = state.value.c.x - state.value.width * 0.5 / state.value.scale
  const y = state.value.c.y - state.value.height * 0.5 / state.value.scale
  const w = state.value.width / state.value.scale
  const h = state.value.height / state.value.scale
  return `${x} ${y} ${w} ${h}`
})

const strokeWidth = computed(() => {
  const scale = style.value.widthUI / state.value.scale
  const scaleFd = 2
  const scaleBg = 4
  return {
    // Foreground
    thicker: 0.2 * scale * scaleFd,
    thick: 0.5 * scale * scaleFd,
    normal: 1 * scale * scaleFd,
    bold: 2 * scale * scaleFd,
    // Background
    thickerBg: 0.2 * scale * scaleBg,
    thickBg: 0.6 * scale * scaleBg,
    normalBg: 1 * scale * scaleBg,
    boldBg: 2 * scale * scaleBg,
  }
})

const strokeDashArray = computed(() => {
  const scale = 1 / state.value.scale
  return 4 * scale;
})

</script>

<template>
  <svg id="main-svg" ref="svg" :view-box.camel="svgViewBox" :width="state.width" :height="state.height"
    @mousedown="h.svgMoveStartHandler" @mousemove="h.svgMoveHandler" @mouseup="h.svgMoveEndHandler"
    @mouseleave="h.svgMoveEndHandler" @wheel="h.svgScaleHandler" @dblclick="h.addLight">

    <!-- Optical axis -->
    <g v-if="options.opticalAxis">
      <line :x1="-infR" y1="0" :x2="infR" y2="0" stroke="white" class="thick"></line>
    </g>

    <!-- Grid -->
    <Grid v-if="options.grid"></Grid>

    <!-- Curvature -->
    <g v-if="options.lens && options.curvature">
      <circle :cx="lens.x + lensD / 2 - lensR" :cy="0" :r="lensR" class="dotted"></circle>
      <circle :cx="lens.x - lensD / 2 + lensR" :cy="0" :r="lensR" class="dotted"></circle>
      <!-- center point -->
      <circle :cx="lens.x + lensD / 2 - lensR" cy="0" :r="rUI / 2" class="white"></circle>
      <circle :cx="lens.x - lensD / 2 + lensR" cy="0" :r="rUI / 2" class="white"></circle>
    </g>

    <!-- Guidelines -->
    <Guideline v-if="options.lens && options.sensor && options.angleOfView"></Guideline>

    <!-- Hyperfocal point -->
    <g
      v-if="options.lens && options.sensor && options.circleOfConfusion && options.angleOfView && options.depthOfField && options.hyperfocalPoint">
      <circle :cx="lens.x - lens.f - lens.f * lens.f / (lens.circleOfConfusion * fNumber)" cy="0" :r="rUI / 2 * 1.2"
        :fill="style.lineBgColor"></circle>
      <circle :cx="lens.x - lens.f - lens.f * lens.f / (lens.circleOfConfusion * fNumber)" cy="0" :r="rUI / 2"
        class="white"></circle>
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
        <!-- left half background -->
        <path :d="`M ${lens.x} ${-lens.r} A ${lensR} ${lensR} 0 0 0 ${lens.x} ${lens.r}`"
          class="hover-child-bg fill-none" />
        <!-- right half background -->
        <path :d="`M ${lens.x} ${-lens.r} A ${lensR} ${lensR} 0 0 1 ${lens.x} ${lens.r}`"
          class="hover-child-bg fill-none" />
        <!-- left half -->
        <path :d="`M ${lens.x} ${-lens.r} A ${lensR} ${lensR} 0 0 0 ${lens.x} ${lens.r}`"
          class="hover-child fill-none" />
        <!-- right half -->
        <path :d="`M ${lens.x} ${-lens.r} A ${lensR} ${lensR} 0 0 1 ${lens.x} ${lens.r}`"
          class="hover-child fill-none" />
        <!-- dummy for ui -->
        <rect class='ui-transparent' :x="lens.x - lensD / 2" :y="-lens.r" :width="lensD" :height="2 * lens.r"
          @mousedown="h.lensMoveStartHandler" />
      </g>
      <!-- Focal points -->
      <g v-if="options.lensFocalPoints">
        <!-- left hand -->
        <g>
          <circle :cx="lens.x - lens.f" cy="0" :r="rUI / 2 * 1.2" :fill="style.lineBgColor"></circle>
          <circle :cx="lens.x - lens.f" cy="0" :r="rUI / 2" class="white"></circle>
          <!-- UI -->
          <circle :cx="lens.x - lens.f" cy="0" :r="rUI" @mousedown="h.focalPointMoveStartHandler" class="ui-hidden">
          </circle>
        </g>
        <!-- right hand -->
        <circle :cx="lens.x + lens.f" cy="0" :r="rUI / 2 * 1.2" :fill="style.lineBgColor"></circle>
        <circle :cx="lens.x + lens.f" cy="0" :r="rUI / 2" class="white"></circle>

        <!-- Double focal points -->
        <g v-if="options.lensDoubleFocalPoints">
          <circle :cx="lens.x - 2 * lens.f" cy="0" :r="rUI / 2" class="white"></circle>
          <circle :cx="lens.x + 2 * lens.f" cy="0" :r="rUI / 2" class="white"></circle>
        </g>
      </g>
      <!-- Lens size change UI-->
      <circle :cx="lens.x" :cy="-lens.r" :r="rUI" class="ui-hidden" @mousedown="h.lensSizeChangeStartHandler">
      </circle>
    </g>

    <!-- Items -->
    <g v-if="options.lens">
      <g v-for="(item, idx) in items">
        <Lens :lens="item" :idx></Lens>
      </g>
    </g>

    <!-- Aperture -->
    <g v-if="options.aperture">
      <!-- Lines -->
      <line :x1="lens.x" :y1="-lens.r" :x2="lens.x" :y2="-lens.r * lens.aperture"
        class="hover-sibling-bg no-pointer-events">
      </line>
      <line :x1="lens.x" :y1="lens.r" :x2="lens.x" :y2="lens.r * lens.aperture"
        class="hover-sibling-bg no-pointer-events">
      </line>
      <line :x1="lens.x" :y1="-lens.r" :x2="lens.x" :y2="-lens.r * lens.aperture"
        class="hover-sibling no-pointer-events">
      </line>
      <line :x1="lens.x" :y1="lens.r" :x2="lens.x" :y2="lens.r * lens.aperture" class="hover-sibling no-pointer-events">
      </line>
      <!-- UI -->
      <circle :cx="lens.x" :cy="lens.r * lens.aperture" :r="rUI" @mousedown="h.apertureSizeChangeStartHandler"
        class="hover-sibling-master ui-hidden"></circle>
    </g>

    <!-- Apple -->
    <g v-if="options.apple">
      <g v-for="(light, idx) of apple">
        <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" :fill="`hsl(${light.color}, 100%, 50%, 0.5)`"></circle>
        <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" class="ui-bg"></circle>
        <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" class="ui"></circle>
      </g>
    </g>

    <!-- Lights -->
    <g v-for="(light, idx) of lights">
      <g v-if="light.type === Light.Point">
        <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" :fill="`hsl(${light.color}, 100%, 50%, 0.5)`"></circle>
        <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" class="ui-bg"></circle>
        <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" @dblclick="h.deleteLight($event, idx)"
          @mousedown="h.lightMoveStartHandler($event, idx)" class="ui">
        </circle>
      </g>
      <g v-if="light.type === Light.Parallel">
        <LightParallel :light :idx></LightParallel>
      </g>
    </g>

    <!-- Body -->
    <g v-if="options.body">
      <line :x1="lens.x" :y1="lens.r" :x2="lens.x" :y2="infR" class="white thick" />
      <line :x1="lens.x" :y1="-lens.r" :x2="lens.x" :y2="-infR" class="white thick" />
    </g>

    <!-- Sensor -->
    <g v-if="options.sensor">
      <g class="hover-parent">
        <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="hover-child-bg" />
        <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="hover-child" />
        <!-- dummy for ui -->
        <rect :x="sensor.x - rUI" :y="-sensor.r" :width="rUI * 2" :height="2 * sensor.r"
          @mousedown="h.sensorMoveStartHandler" class='ui-transparent' />
      </g>

      <circle :cx="sensor.x" :cy="-sensor.r" :r="rUI" class="ui-hidden" @mousedown="h.sensorSizeChangeStartHandler">
      </circle>
    </g>
  </svg>
</template>

<style>
svg {
  overflow: hidden;
  display: block;
}

.hover-child {
  stroke: white;
  stroke-width: v-bind('strokeWidth.normal');
}

.hover-child-bg {
  stroke: v-bind('style.lineBgColor');
  stroke-width: v-bind('strokeWidth.normalBg');
}

.fill-none {
  fill: none;
}

.no-pointer-events {
  pointer-events: none;
}

.hover-sibling {
  stroke: white;
  stroke-width: v-bind('strokeWidth.normal');
}

.hover-sibling-bg {
  stroke: v-bind('style.lineBgColor');
  stroke-width: v-bind('strokeWidth.normalBg');
}

.hover-sibling-master:hover~.hover-sibling,
.hover-parent:hover .hover-child,
.hover-parent:hover .hidden-hover-child {
  stroke: white;
  stroke-width: v-bind('strokeWidth.bold');
}

.hover-sibling-master:hover~.hover-sibling-bg,
.hover-parent:hover .hover-child-bg,
.hover-parent:hover .hidden-hover-child-bg {
  stroke: v-bind('style.lineBgColor');
  stroke-width: v-bind('strokeWidth.boldBg');
}

.ui {
  stroke: white;
  stroke-width: v-bind('strokeWidth.normal');
  fill: transparent
}

.ui-bg {
  stroke: v-bind('style.lineBgColor');
  stroke-width: v-bind('strokeWidth.normalBg');
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
  stroke-width: v-bind('strokeWidth.bold');
}

.white {
  fill: white;
}

.thicker {
  stroke: white;
  stroke-width: v-bind('strokeWidth.thicker');
}

.thick {
  stroke: white;
  stroke-width: v-bind('strokeWidth.thick');
}

.normal {
  stroke: white;
  stroke-width: v-bind('strokeWidth.normal');
}

.bold {
  stroke-width: v-bind('strokeWidth.bold');
}

.dotted {
  stroke: white;
  /* dasharray is disabled for performance issue when close-up */
  /* stroke-dasharray: v-bind(strokeDashArray); */
  stroke-width: v-bind('strokeWidth.thick');
  fill: none;
}

.dotted-thick {
  stroke: white;
  /* dasharray is disabled for performance issue when close-up */
  /* stroke-dasharray: v-bind(strokeDashArray); */
  stroke-width: v-bind('strokeWidth.thicker');
  fill: none;
}

.dotted-bg {
  stroke: v-bind('style.lineBgColor');
  /* dasharray is disabled for performance issue when close-up */
  /* stroke-dasharray: v-bind(strokeDashArray); */
  stroke-width: v-bind('strokeWidth.thickBg');
  fill: none;
}

.dotted-thick-bg {
  stroke: v-bind('style.lineBgColor');
  /* dasharray is disabled for performance issue when close-up */
  /* stroke-dasharray: v-bind(strokeDashArray); */
  stroke-width: v-bind('strokeWidth.thickerBg');
  fill: none;
}
</style>
