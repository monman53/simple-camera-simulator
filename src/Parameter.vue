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
            <input type="range" min="0" max="16" v-model="state.nRaysLog">
            {{ nRays }}
        </fieldset>
        <fieldset>
            <legend>Ray width</legend>
            <input type="range" min="0.001" :max="state.style.rLight" step="0.001" v-model="state.style.rayWidth">
            {{ humanReadable(state.style.rayWidth) }}
        </fieldset>
        <fieldset>
            <legend>Reset</legend>
            <button @click="resetView">View</button>
            <button @click="resetStyle">Style</button>
        </fieldset>
        <fieldset>
            <legend>state</legend>
            width: {{ state.width }}<br>
            height: {{ state.height }}<br>
            (cx, cy): ({{ humanReadable(state.cx) }}, {{ humanReadable(state.cy) }})<br>
            scale: {{ humanReadable(state.scale) }}
        </fieldset>
    </div>
</template>

<style scoped></style>
