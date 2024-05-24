<script setup lang="ts">
import { ref } from 'vue'

import SVG from './SVG.vue'
import Canvas from './Canvas.vue'
import Parameter from './Parameter.vue'

import {createParams} from './constants'

const params = ref(createParams())

window.addEventListener('resize', () => {
  params.value.width = window.innerWidth
  params.value.height = window.innerHeight
})
</script>

<template>
  <div id="stage">
    <Canvas id="canvas" :params="params"></Canvas>
    <SVG id="svg" :params="params"></SVG>
    <Parameter id="parameter" :params="params"></Parameter>
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
