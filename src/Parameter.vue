<script setup lang="ts">
import { computed } from 'vue'

import { state, lens, sensor, field, options, options0, style, style0, createInitialParams, lensD, infR, maxLightX } from './globals'
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
        <!-- Rays -->
        <fieldset>
            <legend>Rays</legend>
            <fieldset>
                <legend># of rays</legend>
                <input type="range" min="0" max="16" v-model.number="state.nRaysLog">
                {{ nRays }}
            </fieldset>
            <fieldset>
                <legend>Intensity</legend>
                <input type="range" min="0" max="1" step="0.001" v-model.number="style.rayIntensity">
                {{ humanReadable(style.rayIntensity) }}
            </fieldset>
            <fieldset>
                <legend>Thickness</legend>
                <input type="range" min="0.01" max="1" step="0.001" v-model.number="style.rayWidth">
                {{ humanReadable(style.rayWidth) }}
            </fieldset>
        </fieldset>
        <!-- Lens -->
        <fieldset>
            <legend>
                <label>
                    <input type="checkbox" v-model="options.lens">
                    Lens
                </label>
            </legend>
            <div v-if="options.lens">
                <fieldset>
                    <legend>Options</legend>
                    <label>
                        <input type="checkbox" v-model="options.lensFocalPoints">
                        Focal points
                        <br>
                    </label>
                    <label>
                        <input type="checkbox" v-model="options.aperture">
                        Aperture
                        <br>
                    </label>
                    <label>
                        <input type="checkbox" v-model="options.body">
                        Wall
                        <br>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Refractive index</legend>
                    <input type="range" min="1.01" max="3" step="0.001" v-model.number="lens.n">
                    {{ humanReadable(lens.n) }}
                </fieldset>
                <fieldset>
                    <legend>Info</legend>
                    Focal length: {{ humanReadable(lens.f) }}<br>
                    f-number: {{ humanReadable(fNumber) }}<br>
                </fieldset>
            </div>
        </fieldset>
        <!-- Screen -->
        <fieldset>
            <legend>
                <label>
                    <input type="checkbox" v-model="options.sensor">
                    Screen
                </label>
            </legend>
            <div v-if="options.sensor">
                <fieldset>
                    <legend>Options</legend>
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
                </fieldset>
                <fieldset>
                    <legend>Info</legend>
                    Diameter: {{ humanReadable(sensor.r * 2) }}<br>
                </fieldset>
            </div>
        </fieldset>
        <!-- Field -->
        <fieldset>
            <legend>
                Field
            </legend>
            <div>
                <fieldset>
                    <legend>Options</legend>
                    <label>
                        <input type="checkbox" v-model="options.grid">
                        Grid
                        <br>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Grid interval</legend>
                    <button @click="field.gridInterval = 1">1</button>
                    <button @click="field.gridInterval = 10">10</button>
                    <button @click="field.gridInterval = 100">100</button>
                    <!-- <input type="range" min="5" max="100" step="5" v-model.number="field.gridInterval">
                    {{ humanReadable(field.gridInterval) }}<br> -->
                </fieldset>
            </div>
        </fieldset>
        <!-- Lights -->
        <fieldset>
            <legend>Color palette for new light</legend>
            <input type="range" min="0" max="360" step="0.001" v-model="state.newLightColor">
            <span :style="`color: hsl(${state.newLightColor}, 100%, 50%)`"> █ </span>
            <br>
            <button @click="state.newLightColor = 0">Red</button>
            <button @click="state.newLightColor = 120">Green</button>
            <button @click="state.newLightColor = 240">Blue</button>
        </fieldset>
        <!-- <fieldset>
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
        </fieldset> -->
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
