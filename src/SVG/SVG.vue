<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

import { state, lights, lensGroups, style, apple, options, infR, rUI, globalLensInfo, globalLensRe, lensExist, lensesSorted } from '../globals'
import * as h from '../handlers'
import { Light } from '../type'
import { vec } from '../math'

import Grid from './Grid.vue'
import Guideline from './Guideline.vue'
import LightParallel from './LightParallel.vue'
import LensGroup from './LensGroup.vue'
import WithBackground from './WithBackground.vue'
import Aperture from './Aperture.vue'
import Body from './Body.vue'
import Point from './Point.vue'
import Sensor from './Sensor.vue'

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

// const strokeDashArray = computed(() => {
//   const scale = 1 / state.value.scale
//   return 4 * scale;
// })

</script>

<template>
  <svg id="main-svg" class="move" ref="svg" :view-box.camel="svgViewBox" :width="state.width" :height="state.height"
    @mousedown="h.svgMoveStartHandler" @mousemove="h.svgMoveHandler" @mouseup="h.svgMoveEndHandler"
    @wheel="h.svgScaleHandler" @dblclick="h.addLight">

    <!-- Optical axis -->
    <g v-if="options.opticalAxis">
      <line :x1="-infR" y1="0" :x2="infR" y2="0" class="stroke-white thick"></line>
    </g>

    <!-- Grid -->
    <Grid v-if="options.grid"></Grid>

    <!-- Body -->

    <Body v-if="options.body"></Body>

    <!-- Guidelines -->
    <Guideline v-if="options.lens && lensesSorted.length === 1 && options.sensor && options.angleOfView"></Guideline>

    <!-- Global focal point -->
    <g v-if="options.lensFocalPoints && lensExist">
      <WithBackground>
        <g class="stroke-white thicker">
          <line :x1="globalLensRe.forward.H" :y1="-globalLensRe.forward.re" :x2="globalLensRe.forward.H"
            :y2="globalLensRe.forward.re"></line>
          <line :x1="globalLensRe.backward.H" :y1="-globalLensRe.backward.re" :x2="globalLensRe.backward.H"
            :y2="globalLensRe.backward.re"></line>
        </g>
      </WithBackground>
      <Point :c="vec(globalLensRe.forward.H + globalLensInfo.f, 0)"></Point>
      <Point :c="vec(globalLensRe.backward.H - globalLensInfo.f, 0)"></Point>
    </g>

    <!-- Items -->
    <g v-if="options.lens">
      <g v-for="(lensGroup, idx) in lensGroups">
        <LensGroup :lensGroup :idx></LensGroup>
      </g>
    </g>

    <!-- Aperture -->
    <Aperture v-if="options.aperture"></Aperture>

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
          <circle :cx="light.c.x" :cy="light.c.y" :r="rUI"
            :fill="`hsl(${light.colors[0]}, 100%, ${light.colors.length > 0 ? 50 : 100}%, 0.5)`"></circle>
        </g>
      </g>
      <g v-if="light.type === Light.Parallel">
        <LightParallel :light :idx class="grab"></LightParallel>
      </g>
    </g>

    <!-- Sensor -->
    <Sensor v-if="options.sensor"></Sensor>
  </svg>
</template>

<style>
svg {
  overflow: hidden;
  display: block;
}

.no-pointer-events {
  pointer-events: none;
}

.ui-stroke {
  stroke-width: v-bind((2 * rUI));
  pointer-events: stroke;
}

.hover-hidden-child,
.hover-hidden {
  stroke: transparent;
  fill: transparent;
}

.hover-hidden-parent:hover .hover-hidden-child,
.hover-hidden:hover {
  stroke: inherit;
  fill: inherit;
}

.transparent {
  fill: transparent;
  color: transparent;
  stroke: transparent;
}

.fill-transparent {
  fill: transparent;
}

.fill-none {
  fill: none;
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

.ui {
  .fill-white {
    fill: transparent;
  }

  .stroke-white {
    stroke: transparent;
  }

  .thicker,
  .thick,
  .normal,
  .bold {
    stroke-width: v-bind((2 * rUI));
    pointer-events: stroke;
  }
}
</style>
