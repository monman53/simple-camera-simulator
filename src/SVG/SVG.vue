<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

import { state, lights, lensGroups, sensor, style, apple, options, infR, rUI } from '../globals'
import * as h from '../handlers'
import { Light } from '../type'

import Grid from './Grid.vue'
import Guideline from './Guideline.vue'
import LightParallel from './LightParallel.vue'
import LensGroup from './LensGroup.vue'
import WithBackground from './WithBackground.vue'

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
  <svg id="main-svg" class="move" ref="svg" :view-box.camel="svgViewBox" :width="state.width" :height="state.height"
    @mousedown="h.svgMoveStartHandler" @mousemove="h.svgMoveHandler" @mouseup="h.svgMoveEndHandler"
    @mouseleave="h.svgMoveEndHandler" @wheel="h.svgScaleHandler" @dblclick="h.addLight">

    <!-- Optical axis -->
    <g v-if="options.opticalAxis">
      <line :x1="-infR" y1="0" :x2="infR" y2="0" stroke="white" class="thick"></line>
    </g>

    <!-- Grid -->
    <Grid v-if="options.grid"></Grid>

    <!-- Guidelines -->
    <Guideline v-if="options.lens && options.sensor && options.angleOfView"></Guideline>

    <!-- Items -->
    <g v-if="options.lens">
      <g v-for="(lensGroup, idx) in lensGroups">
        <LensGroup :lensGroup :idx></LensGroup>
      </g>
    </g>

    <!-- Apple -->
    <g v-if="options.apple">
      <g v-for="(light, idx) of apple">
        <WithBackground>
          <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" class="stroke-white normal fill-none"></circle>
        </WithBackground>
        <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" :fill="`hsl(${light.color}, 100%, 50%, 0.5)`"></circle>
      </g>
    </g>

    <!-- Lights -->
    <g v-for="(light, idx) of lights">
      <g v-if="light.type === Light.Point">
        <g @mousedown="h.lightMoveStartHandler($event, idx)" @dblclick="h.deleteLight($event, idx)" class="grab">
          <WithBackground>
            <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" class="stroke-white normal fill-none"></circle>
          </WithBackground>
          <circle :cx="light.c.x" :cy="light.c.y" :r="rUI" :fill="`hsl(${light.color}, 100%, 50%, 0.5)`"></circle>
        </g>
      </g>
      <g v-if="light.type === Light.Parallel">
        <LightParallel :light :idx class="grab"></LightParallel>
      </g>
    </g>

    <!-- Sensor -->
    <g v-if="options.sensor">
      <WithBackground>
        <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="stroke-white normal" />
      </WithBackground>
      <!-- dummies for ui -->
      <line :x1="sensor.x" :y1="-sensor.r" :x2="sensor.x" :y2="sensor.r" class="ui-stroke transparent grab"
        @mousedown="h.sensorMoveStartHandler" />
      <circle :cx="sensor.x" :cy="-sensor.r" :r="rUI" class="transparent vertical-resize"
        @mousedown="h.sensorSizeChangeStartHandler">
      </circle>
    </g>
  </svg>
</template>

<style>
svg {
  overflow: hidden;
  display: block;
}

.fill-none {
  fill: none;
}

.no-pointer-events {
  pointer-events: none;
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

.ui-hidden {
  stroke: none;
  fill: transparent;
}

.ui:hover,
.ui-hidden:hover {
  stroke: white;
  stroke-width: v-bind('strokeWidth.bold');
}

.fill-white {
  fill: white;
}

.stroke-white {
  stroke: white;
}

.thicker {
  stroke-width: v-bind('strokeWidth.thicker');
}

.thick {
  stroke-width: v-bind('strokeWidth.thick');
}

.normal {
  stroke-width: v-bind('strokeWidth.normal');
}

.bold {
  stroke-width: v-bind('strokeWidth.bold');
}

.background {
  .fill-white {
    fill: v-bind('style.lineBgColor');
  }

  .stroke-white {
    stroke: v-bind('style.lineBgColor');
  }

  .thicker {
    stroke-width: v-bind('strokeWidth.thickerBg');
  }

  .thick {
    stroke-width: v-bind('strokeWidth.thickBg');
  }

  .normal {
    stroke-width: v-bind('strokeWidth.normalBg');
  }

  .bold {
    stroke-width: v-bind('strokeWidth.boldBg');
  }
}

.transparent {
  fill: transparent;
  color: transparent;
  stroke: transparent;
}

.ui-stroke {
  stroke-width: v-bind((2 * rUI));
  pointer-events: stroke;

  circle {
    stroke-width: 0;
    pointer-events: all;
  }
}
</style>
