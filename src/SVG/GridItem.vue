<script setup lang="ts">
import { computed } from 'vue'
import { state, infR } from '../globals'

const grid = computed(() => {
    const xMin = state.value.c.x - state.value.width / 2 / state.value.scale;
    const xMax = state.value.c.x + state.value.width / 2 / state.value.scale
    const yMin = state.value.c.y - state.value.height / 2 / state.value.scale;
    const yMax = state.value.c.y + state.value.height / 2 / state.value.scale;
    const size = Math.max(xMax - xMin, yMax - yMin);

    // Normal grid
    const interval = Math.pow(10, Math.floor(Math.log10(size * 0.3)));
    const xs: number[] = []
    const ys: number[] = []
    for (let x = Math.floor(xMin / interval) * interval; x < xMax; x += interval) {
        xs.push(x)
    }
    for (let y = Math.floor(yMin / interval) * interval; y < yMax; y += interval) {
        ys.push(y)
    }

    // Bold grid
    const boldInterval = interval * 10;
    const bxs: number[] = []
    const bys: number[] = []
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
  <line
    v-for="(x, idx) of grid.xs"
    :key="idx"
    :x1="x"
    :y1="-infR"
    :x2="x"
    :y2="infR"
    class="thicker"
  />
  <line
    v-for="(y, idx) of grid.ys"
    :key="idx"
    :y1="y"
    :x1="-infR"
    :y2="y"
    :x2="infR"
    class="thicker"
  />
  <line
    v-for="(x, idx) of grid.bxs"
    :key="idx"
    :x1="x"
    :y1="-infR"
    :x2="x"
    :y2="infR"
    class="thick"
  />
  <line
    v-for="(y, idx) of grid.bys"
    :key="idx"
    :y1="y"
    :x1="-infR"
    :y2="y"
    :x2="infR"
    class="thick"
  />
</template>