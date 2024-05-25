<script setup lang="ts">
import { computed } from 'vue'

import { state, options, options0, style, style0, createInitialParams, infR } from './grobals'
import { humanReadable } from './utils';

const resetView = () => {
    const state0 = createInitialParams()
    state.value.cx = state0.cx
    state.value.cy = state0.cy
    state.value.scale = state0.scale
}
const resetStyle = () => {
    style.value = style0()
}
// const resetAll = () => {
//     state.value = createInitialParams()
// }
const nRays = computed(() => {
    return 1 << state.value.nRaysLog
})
</script>

<template>
    <div class="base">
        <fieldset>
            <legend># of rays</legend>
            <input type="range" min="0" max="16" v-model="state.nRaysLog">
            {{ nRays }}
        </fieldset>
        <fieldset>
            <legend>Ray width</legend>
            <input type="range" min="0.001" :max="style.rLight / 2" step="0.001" v-model="style.rayWidth">
            {{ humanReadable(style.rayWidth) }}
        </fieldset>
        <fieldset>
            <legend>Options</legend>
            <label>
                <input type="checkbox" v-model="options.lens">
                Lens
                <br>
            </label>
            <button @click="options = options0()">Reset</button>
        </fieldset>
        <fieldset>
            <legend>Reset</legend>
            <button @click="resetView">View</button>
            <button @click="resetStyle">Style</button>
            <!-- <button @click="resetAll">All</button> -->
        </fieldset>
        <fieldset>
            <legend>state</legend>
            width: {{ state.width }}<br>
            height: {{ state.height }}<br>
            (cx, cy): ({{ humanReadable(state.cx) }}, {{ humanReadable(state.cy) }})<br>
            scale: {{ humanReadable(state.scale) }}<br>
            infR: {{ humanReadable(infR) }}
        </fieldset>
    </div>
</template>

<style scoped>
.base {
    padding: 0.5em;
    color: white;
    background-color: #0008;
    backdrop-filter: blur(4px);
}
</style>
