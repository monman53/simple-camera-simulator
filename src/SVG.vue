<script setup lang="ts">
import { computed, ref } from 'vue'

import { state } from './state'

const svg = ref();

// Computed
const svgViewBox = computed(() => {
  const x = state.value.cx - state.value.width * 0.5 / state.value.scale
  const y = state.value.cy - state.value.height * 0.5 / state.value.scale
  const w = state.value.width / state.value.scale
  const h = state.value.height / state.value.scale
  return `${x} ${y} ${w} ${h}`
})

// Methods
const getPositionOnSvg = (clientX: number, clientY: number) => {
  const rect = svg.value.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  return [x, y]
}
const getPositionOnSvgApp = (clientX: number, clientY: number) => {
  const [mx, my] = getPositionOnSvg(clientX, clientY);
  const x = (mx - state.value.width / 2) / state.value.scale + state.value.cx;
  const y = (my - state.value.height / 2) / state.value.scale + state.value.cy;
  return [x, y]
}

// Event handlers
let moveHandler: any = null;
// let tpCache = [];
// let cx0, cy0;
// let x0_, y0_;
// let scale0;
const svgMoveStartHandler = (e: any) => {
  e.preventDefault();
  // if (e.touches.length === 1) {
  //   tpCache = [e.touches[0]];
  //   cx0 = svg.cx;
  //   cy0 = svg.cy;
  //   scale0 = svg.scale;
  // }
  // if (e.touches.length === 2) {
  //   tpCache = [e.touches[0], e.touches[1]];
  //   cx0 = svg.cx;
  //   cy0 = svg.cy;
  //   [x0_, y0_] = getPositionOnSvgApp((e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2)
  //   scale0 = svg.scale;
  // }
  const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
  const [cx0, cy0] = [state.value.cx, state.value.cy];
  const handler = (e_: any) => {
    e_.preventDefault();
    let clientX = e_.clientX
    let clientY = e_.clientY
    if (e_.type == 'touchmove') {
      clientX = e_.touches[0].clientX
      clientY = e_.touches[0].clientY
    }
    const [x, y] = getPositionOnSvg(clientX, clientY);
    const dx = (x - x0) / state.value.scale
    const dy = (y - y0) / state.value.scale
    state.value.cx = cx0 - dx
    state.value.cy = cy0 - dy
  }
  moveHandler = handler;
}
const svgMoveHandler = (e: any) => {
  e.preventDefault();

  // if (e.targetTouches.length === 1) {
  //   const cogX0 = tpCache[0].clientX;
  //   const cogY0 = tpCache[0].clientY;
  //   const [x0, y0] = getPositionOnSvg(cogX0, cogY0);

  //   const cogX = e.touches[0].clientX;
  //   const cogY = e.touches[0].clientY;

  //   const [x, y] = getPositionOnSvg(cogX, cogY);
  //   const dx = (x - x0) / svg.scale
  //   const dy = (y - y0) / svg.scale
  //   svg.cx = cx0 - dx
  //   svg.cy = cy0 - dy
  // }
  // if (e.touches.length === 2) {

  //   const cogX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
  //   const cogY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
  //   const [x, y] = getPositionOnSvg(cogX, cogY);

  //   const l0 = Math.sqrt(Math.pow(tpCache[0].clientX - tpCache[1].clientX, 2) + Math.pow(tpCache[0].clientY - tpCache[1].clientY, 2));
  //   const l = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));

  //   svg.scale = scale0 * (l / l0)
  //   svg.cx = x0_ - (x - svg.width / 2) / svg.scale;
  //   svg.cy = y0_ - (y - svg.height / 2) / svg.scale;
  // }

  if (moveHandler !== null) {
    moveHandler(e)
  }
}
const svgMoveEndHandler = () => {
  moveHandler = null;
  // tpCache = [];
}
const svgScaleHandler = (e: any) => {
  e.stopPropagation();
  e.preventDefault();

  // Zoom in/out
  const [x, y] = getPositionOnSvgApp(e.clientX, e.clientY);
  const scaleFactor = 1.2;
  const r = e.deltaY > 0 ? 1.2 : 1 / 1.2;
  state.value.cx = state.value.cx + (x - state.value.cx) * (1 - r);
  state.value.cy = state.value.cy + (y - state.value.cy) * (1 - r);
  state.value.scale /= r;
}
const lightMoveStartHandler = (e: any, idx:number) => {
  e.preventDefault();
  e.stopPropagation();
  const light = state.value.lights[idx];
  const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
  const [cx0, cy0] = [light.x, light.y];
  const handler = (e_: any) => {
    e_.preventDefault();
    e_.stopPropagation();
    const [x, y] = getPositionOnSvg(e_.clientX, e_.clientY);
    const dx = (x - x0) / state.value.scale
    const dy = (y - y0) / state.value.scale
    light.x = cx0 + dx
    light.y = cy0 + dy
  }
  moveHandler = handler;
}

</script>

<template>
  <svg id="main-svg" ref="svg" :view-box.camel="svgViewBox" :width="state.width" :height="state.height"
    @mousedown="svgMoveStartHandler" @mousemove="svgMoveHandler" @mouseup="svgMoveEndHandler"
    @mouseleave="svgMoveEndHandler" @wheel="svgScaleHandler">

    <!-- Lights -->
    <g v-for="(light, idx) of state.lights">
      <circle :cx="light.x" :cy="light.y" :r="state.style.rLight" :fill="light.color" stroke="white"
        :stroke-width="state.style.lightStrokeWidth" @mousedown="lightMoveStartHandler($event, idx)">
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
