<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

import { state, options } from './globals'

import SVG from './SVG.vue'
import Canvas from './Canvas.vue'
import Parameter from './Parameter.vue'
import Preview from './Preview.vue'

const main = ref()

const resize = () => {
  state.value.width = main.value.offsetWidth
  state.value.height = window.innerHeight
}

const containerType = computed(() => {
  if (options.value.sensor && options.value.sensorPreview) {
    if (options.value.sensorMemory) {
      return 'col3'
    }
    return 'col2'
  }
  return 'col1'
})

watch(containerType, () => {
  resize()
}, { deep: true })

onMounted(() => {
  window.addEventListener('resize', resize)
  const observer = new ResizeObserver(resize)
  observer.observe(main.value)
  resize()
})

</script>

<template>
  <div class='container' :class="containerType">
    <div id="stage" ref="main">
      <Canvas id="canvas"></Canvas>
      <SVG id="svg"></SVG>
      <Parameter id="parameter"></Parameter>
    </div>
    <div v-if="options.sensor && options.sensorPreview">
      <Preview id="preview"></Preview>
    </div>
    <!-- <div v-if="options.sensorPreview && options.sensorMemory">
    </div> -->
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-rows: 100vh;
  gap: 8px;
  background-color: #222;
}

.col1 {
  grid-template-columns: 1fr;
}

.col2 {
  grid-template-columns: 1fr 100px;
}

.col3 {
  grid-template-columns: 1fr 100px 100px;
}

#stage {
  position: relative;
}

#canvas,
#svg,
#parameter {
  position: absolute;
}

#preview {
  position: absolute;
}
</style>
