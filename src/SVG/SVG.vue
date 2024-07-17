<script lang="ts">

let svg = ref();

// Methods
export const getPositionOnSvg = (e: any) => {
  const rect = svg.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return vec(x, y)
}

export const getPositionOnSvgApp = (e: any) => {
  const m = getPositionOnSvg(e);
  const x = (m.x - state.value.width / 2) / state.value.scale + state.value.c.x;
  const y = (m.y - state.value.height / 2) / state.value.scale + state.value.c.y;
  return vec(x, y)
}

const getPositionDiffOnSvgApp = (e: any, m0: Vec) => {
  const m = getPositionOnSvg(e);
  const d = m.inplaceSub(m0).inplaceDiv(state.value.scale)
  return d
}

export const preventDefaultAndStopPropagation = (e: any) => {
  e.stopPropagation()
  e.preventDefault()
}

// Elements move system on SVG
let moveHandlerWithM0: any = null;
let m0: Vec
export const setMoveHandlerWithM0 = (h: any, m: Vec) => {
  moveHandlerWithM0 = h
  m0 = m
}

const svgMoveHandler = (e: any) => {
  e.preventDefault();
  state.value.pointerPos = getPositionOnSvgApp(e)
  if (moveHandlerWithM0 !== null) {
    preventDefaultAndStopPropagation(e)
    const d = getPositionDiffOnSvgApp(e, m0)
    moveHandlerWithM0(e, d)
  }
}
const svgMoveEndHandler = () => {
  moveHandlerWithM0 = null
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { state, lights, lensGroups, style, apple, options, infR, rUI, globalLensInfo, globalLensRe, lensExist, lensesSorted } from '../globals'
import { Vec, vec } from '../math'

import Grid from './GridItem.vue'
import Guideline from './GuideLines.vue'
import LightSVG, { addLight } from './LightItem.vue'
import LensGroup from './LensGroupItem.vue'
import WithBackground from './WithBackground.vue'
import Aperture from './ApertureItem.vue'
import Body from './BodyItem.vue'
import Point from './PointItem.vue'
import Sensor from './SensorItem.vue'
import MoveUI from './MoveUI.vue'
import { lightHSL } from '@/collection/color'
import { releaseALlItems } from '@/utils'

const svgScaleHandler = (e: any) => {
  preventDefaultAndStopPropagation(e)
  // Zoom in/out
  const p = getPositionOnSvgApp(e);
  const scaleFactor = 1.2;
  const r = e.deltaY > 0 ? scaleFactor : 1 / scaleFactor;
  state.value.c = state.value.c.add(p.sub(state.value.c).mul(1 - r))
  state.value.scale /= r;
}

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

const move = () => {
  const c0 = state.value.c.copy()
  releaseALlItems()
  return (e: any, d: Vec) => {
    state.value.c = c0.sub(d)
  }
}

const pupilPath = computed(() => {
  let top = ""
  let bottom = ""
  const path = globalLensRe.value.forward.pathTop
  for (let i = 0; i < path.length; i++) {
    const s = path[i]
    if (i === 0) {
      top += `M ${-infR.value} ${s.s.y} `
      bottom += `M ${-infR.value} ${-s.s.y} `
    }

    top += `L ${s.t.x} ${s.t.y}`
    bottom += `L ${s.t.x} ${-s.t.y}`
  }
  return { top, bottom }
})

</script>

<template>
  <MoveUI :handler-creator="move">
    <svg
      id="main-svg"
      ref="svg"
      class="move"
      :view-box.camel="svgViewBox"
      :width="state.width"
      :height="state.height"
      @mousemove="svgMoveHandler"
      @mouseup="svgMoveEndHandler"
      @wheel="svgScaleHandler"
      @dblclick="addLight"
    >

      <!-- Optical axis -->
      <g v-if="options.opticalAxis">
        <line
          :x1="-infR"
          y1="0"
          :x2="infR"
          y2="0"
          class="stroke-white thicker"
        />
      </g>

      <!-- Grid -->
      <Grid v-if="options.grid" />

      <!-- Body -->

      <Body v-if="options.body" />

      <!-- Guidelines -->
      <Guideline v-if="options.lens && lensesSorted.length === 1 && options.sensor && options.angleOfView" />

      <!-- Global focal point -->
      <g v-if="options.lens && options.lensFocalPoints && lensExist">
        <WithBackground>
          <g class="stroke-white thick">
            <line
              :x1="globalLensRe.forward.H"
              :y1="-globalLensRe.forward.re"
              :x2="globalLensRe.forward.H"
              :y2="globalLensRe.forward.re"
            />
            <g class="fill-none">
              <path :d="pupilPath.top" />
              <path :d="pupilPath.bottom" />
            </g>
            <!-- <line :x1="globalLensRe.backward.H" :y1="-globalLensRe.backward.re" :x2="globalLensRe.backward.H"
              :y2="globalLensRe.backward.re"></line> -->
          </g>
        </WithBackground>
        <Point :c="vec(globalLensRe.forward.H + globalLensInfo.f, 0)" />
        <Point :c="vec(globalLensRe.backward.H - globalLensInfo.f, 0)" />
      </g>

      <!-- Items -->
      <g v-if="options.lens">
        <g
          v-for="(lensGroup, idx) in lensGroups"
          :key="idx"
        >
          <LensGroup
            :lens-group
            :idx
          />
        </g>
      </g>

      <!-- Aperture -->
      <Aperture v-if="options.aperture" />

      <!-- Apple -->
      <g v-if="options.apple">
        <g
          v-for="(light, idx) of apple"
          :key="idx"
        >
          <WithBackground>
            <circle
              :cx="light.c.x"
              :cy="light.c.y"
              :r="rUI"
              class="stroke-white normal fill-none"
            />
          </WithBackground>
          <circle
            :cx="light.c.x"
            :cy="light.c.y"
            :r="rUI"
            :fill="lightHSL(light.wavelengths[0], 0.5)"
          />
        </g>
      </g>

      <!-- Lights -->
      <g
        v-for="(light, idx) of lights"
        :key="idx"
      >
        <LightSVG
          :light
          :idx
          class="grab"
        />
      </g>

      <!-- Sensor -->
      <Sensor v-if="options.sensor" />
    </svg>
  </MoveUI>
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

.disabled {
  .stroke-white {
    stroke: #444;
  }

  /* Workaround */
  .background {
    .stroke-white {
      stroke: v-bind('style.lineBgColor');
    }
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
