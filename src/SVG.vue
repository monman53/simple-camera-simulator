<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

import { state, lights, lens, sensor, field, options, lensR, lensD, infR, fNumber } from './globals'
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

const effectiveLensRadius = computed(() => {
  if (options.value.aperture) {
    return lens.value.r * lens.value.aperture;
  } else {
    return lens.value.r;
  }
})

const extendSegment = (sx: number, sy: number, tx: number, ty: number) => {
  const theta = Math.atan2(ty - sy, tx - sx);
  const ntx = sx + infR.value * Math.cos(theta);
  const nty = sy + infR.value * Math.sin(theta);
  return [ntx, nty];
}

const guidelines = computed(() => {
  const f = lens.value.f;

  // Angle of view (AOV)
  const b = sensor.value.x - lens.value.x;
  const a = f * b / (b - f);

  const focalPosX = lens.value.x - a;
  const focalPosSize = sensor.value.r * (a / b);

  const [innerX, innerY] = extendSegment(lens.value.x, -effectiveLensRadius.value, focalPosX, -focalPosSize);
  const [outerX, outerY] = extendSegment(lens.value.x, -effectiveLensRadius.value, focalPosX, focalPosSize);

  // Depth of field (DOF)
  const delta = lens.value.circleOfConfusion
  const ls = sensor.value.x - lens.value.x
  const re = effectiveLensRadius.value

  const lf = ls - delta * ls / (2 * re)
  const xf = f * lf / (lf - f)
  const lr = ls + delta * ls / (2 * re)
  const xr = f * lr / (lr - f)

  const dr = focalPosSize * (xr / a) + (1 - xr / a) * effectiveLensRadius.value
  const df = (focalPosSize + effectiveLensRadius.value) * (xf / a) - effectiveLensRadius.value

  return {
    focal: { x: focalPosX, d: focalPosSize },
    aovInner: { x: innerX, y: innerY },
    aovOuter: { x: outerX, y: outerY },
    dofInner: { x: xr, d: dr },
    dofOuter: { x: xf, d: df },
  }
})

const strokeWidth = computed(() => {
  const scale = 1 / state.value.scale
  return {
    thicker: 0.2 * scale,
    thick: 0.5 * scale,
    normal: 1 * scale,
    bold: 2 * scale,
  }
})

const strokeDashArray = computed(() => {
  const scale = 1 / state.value.scale
  return 4 * scale;
})

const rUI = computed(() => {
  const scale = 1 / state.value.scale
  return 8 * scale;
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
    <g v-if="options.grid">
      <line v-for="x of grid.xs" :x1="x" :y1="-infR" :x2="x" :y2="infR" class="thicker">
      </line>
      <line v-for="y of grid.ys" :y1="y" :x1="-infR" :y2="y" :x2="infR" class="thicker">
      </line>
      <line v-for="x of grid.bxs" :x1="x" :y1="-infR" :x2="x" :y2="infR" class="thick">
      </line>
      <line v-for="y of grid.bys" :y1="y" :x1="-infR" :y2="y" :x2="infR" class="thick">
      </line>
    </g>

    <!-- Curvature -->
    <g v-if="options.lens && options.curvature">
      <circle :cx="lens.x + lensD / 2 - lensR" :cy="0" :r="lensR" class="dotted">
      </circle>
      <circle :cx="lens.x - lensD / 2 + lensR" :cy="0" :r="lensR" class="dotted">
      </circle>
      <!-- center point -->
      <circle :cx="lens.x + lensD / 2 - lensR" cy="0" :r="rUI / 2" class="white"></circle>
      <circle :cx="lens.x - lensD / 2 + lensR" cy="0" :r="rUI / 2" class="white"></circle>
    </g>

    <!-- Angle of view -->
    <g v-if="options.lens && options.sensor && options.angleOfView">
      <!-- Inside camera -->
      <line :x1="sensor.x" :y1="sensor.r" :x2="lens.x" :y2="effectiveLensRadius" class="dotted"></line>
      <line :x1="sensor.x" :y1="-sensor.r" :x2="lens.x" :y2="-effectiveLensRadius" class="dotted"></line>
      <!-- Lens to focal plane (outer) -->
      <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="lens.x" :y2="-effectiveLensRadius" class="dotted">
      </line>
      <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="lens.x" :y2="effectiveLensRadius" class="dotted">
      </line>
      <!-- Lens to focal plane (inner) -->
      <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="lens.x" :y2="effectiveLensRadius"
        class="dotted-thick"></line>
      <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="lens.x" :y2="-effectiveLensRadius"
        class="dotted-thick"></line>
      <!-- Focal plane -->
      <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="guidelines.focal.x" :y2="guidelines.focal.d"
        class="dotted"></line>
      <!-- Focal plane to inf (outer) -->
      <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="guidelines.aovOuter.x" :y2="guidelines.aovOuter.y"
        class="dotted"></line>
      <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="guidelines.aovOuter.x" :y2="-guidelines.aovOuter.y"
        class="dotted"></line>
      <!-- Focal plane to inf (inner) -->
      <line :x1="guidelines.focal.x" :y1="guidelines.focal.d" :x2="guidelines.aovInner.x" :y2="-guidelines.aovInner.y"
        class="dotted-thick"></line>
      <line :x1="guidelines.focal.x" :y1="-guidelines.focal.d" :x2="guidelines.aovInner.x" :y2="guidelines.aovInner.y"
        class="dotted-thick"></line>
    </g>

    <!-- Depth of field -->
    <g
      v-if="options.lens && options.sensor && options.circleOfConfusion && options.angleOfView && options.depthOfField">
      <line :x1="lens.x - guidelines.dofInner.x" :y1="-guidelines.dofInner.d" :x2="lens.x - guidelines.dofInner.x"
        :y2="guidelines.dofInner.d" class="dotted-thick"></line>
      <line :x1="lens.x - guidelines.dofOuter.x" :y1="-guidelines.dofOuter.d" :x2="lens.x - guidelines.dofOuter.x"
        :y2="guidelines.dofOuter.d" class="dotted-thick"></line>
    </g>


    <!-- Hyperfocal point -->
    <g
      v-if="options.lens && options.sensor && options.circleOfConfusion && options.angleOfView && options.depthOfField && options.hyperfocalPoint">
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
          <circle :cx="lens.x - lens.f" cy="0" :r="rUI / 2" class="white"></circle>
          <!-- UI -->
          <circle :cx="lens.x - lens.f" cy="0" :r="rUI" @mousedown="h.focalPointMoveStartHandler" class="ui-hidden">
          </circle>
        </g>
        <!-- right hand -->
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

    <!-- Aperture -->
    <g v-if="options.aperture">
      <circle :cx="lens.x" :cy="lens.r * lens.aperture" :r="rUI" @mousedown="h.apertureSizeChangeStartHandler"
        class="hover-sibling-master ui-hidden"></circle>
      <line :x1="lens.x" :y1="-lens.r" :x2="lens.x" :y2="-lens.r * lens.aperture"
        class="hover-sibling no-pointer-events thick">
      </line>
      <line :x1="lens.x" :y1="lens.r" :x2="lens.x" :y2="lens.r * lens.aperture"
        class="hover-sibling no-pointer-events thick">
      </line>
    </g>

    <!-- Lights -->
    <g v-for="(light, idx) of lights">
      <circle :cx="light.x" :cy="light.y" :r="rUI" :fill="`hsl(${light.color}, 100%, 50%)`">
      </circle>
      <circle :cx="light.x" :cy="light.y" :r="rUI" @dblclick="h.deleteLight($event, idx)"
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
        <rect :x="sensor.x - rUI" :y="-sensor.r" :width="rUI * 2" :height="2 * sensor.r"
          @mousedown="h.sensorMoveStartHandler" class='ui-transparent' />
      </g>

      <circle :cx="sensor.x" :cy="-sensor.r" :r="rUI" class="ui-hidden" @mousedown="h.sensorSizeChangeStartHandler">
      </circle>
    </g>
  </svg>
</template>

<style scoped>
svg {
  overflow: hidden;
  display: block;
}

.hover-child {
  stroke: white;
  stroke-width: v-bind('strokeWidth.normal');
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
  stroke-width: v-bind('strokeWidth.bold');
}

.ui {
  stroke: white;
  stroke-width: v-bind('strokeWidth.normal');
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
</style>
