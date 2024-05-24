<script setup lang="ts">
import {state} from './state'

import SVG from './SVG.vue'
import Canvas from './Canvas.vue'
import Parameter from './Parameter.vue'

window.addEventListener('resize', () => {
  state.value.width = window.innerWidth
  state.value.height = window.innerHeight
})
</script>

<template>
  <div id="stage">
    <Canvas id="canvas"></Canvas>
    <SVG id="svg"></SVG>
    <Parameter id="parameter"></Parameter>
  </div>
</template>

<style scoped>
#stage {
  position: relative;
}

#canvas,
#svg,
#parameter {
  position: absolute;
}

#parameter {
  padding: 0.5em;
  color: white;
  background-color: #3337;
}
</style>
