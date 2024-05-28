<script setup lang="ts">
import { computed } from 'vue'

import { state, lens, options, options0, style, style0, createInitialParams, lensD, infR, maxLightX } from './globals'
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
const fNumber = computed(() => {
    if (options.value.aperture) {
        return lens.value.f / (2 * lens.value.r * lens.value.aperture)
    } else {
        return lens.value.f / (2 * lens.value.r)
    }
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
            <input type="range" min="0.01" max="1" step="0.001" v-model="style.rayWidth">
            {{ humanReadable(style.rayWidth) }}
        </fieldset>
        <fieldset>
            <legend>Lens n</legend>
            <input type="range" min="1.01" max="3" step="0.001" v-model="lens.n">
            {{ humanReadable(lens.n) }}
        </fieldset>
        <fieldset>
            <legend>Light Color</legend>
            <input type="range" min="0" max="360" step="0.001" v-model="state.newLightColor">
            <span :style="`color: hsl(${state.newLightColor}, 100%, 50%)`"> █ </span>
            <br>
            <button @click="state.newLightColor = 0">Red</button>
            <button @click="state.newLightColor = 120">Green</button>
            <button @click="state.newLightColor = 240">Blue</button>
        </fieldset>
        <fieldset>
            <legend>Options</legend>
            <label>
                <input type="checkbox" v-model="options.lens">
                Lens
                <br>
            </label>
            <label v-if="options.lens" class="indent">
                <input type="checkbox" v-model="options.lensFocalPoints">
                Focal Points
                <br>
            </label>
            <label>
                <input type="checkbox" v-model="options.sensor">
                Screen
                <br>
            </label>
            <div v-if="options.sensor" class="indent">
                <label>
                    <input type="checkbox" v-model="options.sensorPreview">
                    Preview
                    <br>
                </label>
                <div v-if="options.sensorPreview" class="indent">
                    <label>
                        <input type="checkbox" v-model="options.sensorMemory">
                        Memory
                        <br>
                    </label>
                </div>
            </div>
            <label>
                <input type="checkbox" v-model="options.body">
                Body
                <br>
            </label>
            <label>
                <input type="checkbox" v-model="options.aperture">
                Aperture
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
            <legend>Info</legend>
            Focal length: {{ humanReadable(lens.f) }}<br>
            f-number: {{ humanReadable(fNumber) }}<br>
        </fieldset>
        <fieldset>
            <legend>Debug output</legend>
            width: {{ state.width }}<br>
            height: {{ state.height }}<br>
            (cx, cy): ({{ humanReadable(state.cx) }}, {{ humanReadable(state.cy) }})<br>
            scale: {{ humanReadable(state.scale) }}<br>
            infR: {{ humanReadable(infR) }}<br>
            maxLightX: {{ humanReadable(maxLightX) }}<br>
            lens.x: {{ humanReadable(lens.x) }}<br>
            lens.f: {{ humanReadable(lens.f) }}<br>
            lens.r: {{ humanReadable(lens.r) }}<br>
            lens.n: {{ humanReadable(lens.n) }}<br>
            lensD: {{ humanReadable(lensD) }}<br>
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

.indent {
    padding-left: 1em;
}
</style>
