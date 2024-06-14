<script setup lang="ts">
import { computed } from 'vue'
import { state, infR } from '../globals'

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
</script>

<template>
    <line v-for="x of grid.xs" :x1="x" :y1="-infR" :x2="x" :y2="infR" class="thicker">
    </line>
    <line v-for="y of grid.ys" :y1="y" :x1="-infR" :y2="y" :x2="infR" class="thicker">
    </line>
    <line v-for="x of grid.bxs" :x1="x" :y1="-infR" :x2="x" :y2="infR" class="thick">
    </line>
    <line v-for="y of grid.bys" :y1="y" :x1="-infR" :y2="y" :x2="infR" class="thick">
    </line>
</template>