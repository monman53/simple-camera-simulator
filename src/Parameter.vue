<script setup lang="ts">
import {computed} from 'vue'

import { state } from './state'
import { humanReadable } from './utils';
import { createParams } from './constants';

const resetView = () => {
    const state0 = createParams()
    state.value.cx = state0.cx
    state.value.cy = state0.cy
    state.value.scale = state0.scale
}
const resetStyle = () => {
    const state0 = createParams()
    state.value.style = state0.style
}
const nRays = computed(() => {
    return 1 << state.value.nRaysLog
})
</script>

<template>
    <div>
        <fieldset>
            <legend># of rays</legend>
            <input type="range" min="0" max="16" v-model="state.value.nRaysLog">
            {{ nRays }}
        </fieldset>
        <fieldset>
            <legend>Ray width</legend>
            <input type="range" min="0.001" :max="state.value.style.rLight" step="0.001" v-model="state.value.style.rayWidth">
            {{ humanReadable(state.value.style.rayWidth) }}
        </fieldset>
        <fieldset>
            <legend>Reset</legend>
            <button @click="resetView">View</button>
            <button @click="resetStyle">Style</button>
        </fieldset>
        <fieldset>
            <legend>state</legend>
            width: {{ state.value.width }}<br>
            height: {{ state.value.height }}<br>
            (cx, cy): ({{ humanReadable(state.value.cx) }}, {{ humanReadable(state.value.cy) }})<br>
            scale: {{ humanReadable(state.value.scale) }}
        </fieldset>
    </div>
</template>

<style scoped></style>
