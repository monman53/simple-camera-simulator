<script setup lang="ts">
import { computed } from 'vue'

import { state, lens, sensor, options, style, lensD, lensR, fNumber } from './globals'
import { humanReadable } from './utils';

const nRays = computed(() => {
    return 1 << state.value.nRaysLog
})
</script>

<template>
    <div class="base">
        <table>
            <!-- Rays -->
            <tr>
                <th colspan="3">Lights</th>
            </tr>
            <tr>
                <td># of rays</td>
                <td><input type="range" min="0" max="16" v-model.number="state.nRaysLog"></td>
                <td>{{ nRays }}</td>
            </tr>
            <tr>
                <td>Intensity</td>
                <td><input type="range" min="0" max="1" step="0.001" v-model.number="style.rayIntensity"></td>
                <td>{{ humanReadable(style.rayIntensity) }}</td>
            </tr>
            <tr>
                <td>Ray thickness</td>
                <td><input type="range" min="0.01" max="1" step="0.001" v-model.number="style.rayWidth"></td>
                <td>{{ humanReadable(style.rayWidth) }}</td>
            </tr>
            <tr>
                <td>New light color</td>
                <td>
                    <input type="range" min="0" max="360" step="0.001" v-model="state.newLightColor">
                    <br>
                    <button @click="state.newLightColor = 0">Red</button>
                    <button @click="state.newLightColor = 120">Green</button>
                    <button @click="state.newLightColor = 240">Blue</button>
                </td>
                <td :style="`background-color: hsl(${state.newLightColor}, 100%, 50%)`"></td>
            </tr>
            <!-- Lens -->
            <tr>
                <th colspan="3">
                    <hr><label><input type="checkbox" v-model="options.lens"> Lens</label>
                </th>
            </tr>
            <template v-if="options.lens">
                <tr>
                    <td><label><input type="checkbox" v-model="options.lensFocalPoints"> Focal points</label></td>
                </tr>
                <tr v-if="options.lensFocalPoints && options.advanced">
                    <td><label><input type="checkbox" v-model="options.lensDoubleFocalPoints"> 2x Focal points</label>
                    </td>
                </tr>
            </template>
            <tr v-if="options.advanced">
                <td><label><input type="checkbox" v-model="options.aperture"> Aperture</label></td>
            </tr>
            <template v-if="options.lens">
                <template v-if="options.advanced">
                    <tr>
                        <td><label><input type="checkbox" v-model="options.curvature"> Curvature</label></td>
                        <td></td>
                        <td>{{ humanReadable(lensR) }}</td>
                    </tr>
                    <tr>
                        <td><label><input type="checkbox" v-model="options.lensIdeal"> Ideal lens</label></td>
                    </tr>
                    <tr>
                        <td>Refractive index</td>
                        <td><input type="range" min="1.01" max="3" step="0.001" v-model.number="lens.n"></td>
                        <td>{{ humanReadable(lens.n) }}</td>
                    </tr>
                </template>
                <tr>
                    <td>Focal Length</td>
                    <td></td>
                    <td>{{ humanReadable(lens.f) }}</td>
                </tr>
                <tr>
                    <td>F-number</td>
                    <td></td>
                    <td>{{ humanReadable(fNumber) }}</td>
                </tr>
                <template v-if="options.advanced">
                    <tr>
                        <td>Position</td>
                        <td></td>
                        <td>{{ humanReadable(lens.x) }}</td>
                    </tr>
                    <tr>
                        <td>Diameter</td>
                        <td></td>
                        <td>{{ humanReadable(lens.r * 2) }}</td>
                    </tr>
                    <tr>
                        <td>Thickness</td>
                        <td></td>
                        <td>{{ humanReadable(lensD) }}</td>
                    </tr>
                </template>
            </template>
            <!-- Screen -->
            <tr>
                <th colspan="3">
                    <hr><label><input type="checkbox" v-model="options.sensor"> Screen</label>
                </th>
            </tr>
            <template v-if="options.sensor">
                <tr>
                    <td><label><input type="checkbox" v-model="options.sensorPreview"> Preview</label></td>
                </tr>
                <tr v-if="options.sensorPreview">
                    <td><label><input type="checkbox" v-model="options.sensorMemory"> Memory</label></td>
                </tr>
                <template v-if="options.advanced">
                    <tr>
                        <td><label><input type="checkbox" v-model="options.circleOfConfusion"> CoC</label></td>
                        <template v-if="options.circleOfConfusion">
                            <td><input type="range" min="0" max="10" step="0.001"
                                    v-model.number="lens.circleOfConfusion">
                            </td>
                            <td>{{ humanReadable(lens.circleOfConfusion) }}</td>
                        </template>
                    </tr>
                    <tr>
                        <td>Diameter</td>
                        <td></td>
                        <td>{{ humanReadable(sensor.r * 2) }}<br></td>
                    </tr>
                </template>
            </template>
            <!-- Other options -->
            <tr>
                <th colspan="3">
                    <hr>Other Options
                </th>
            </tr>
            <tr>
                <td><label><input type="checkbox" v-model="options.body"> Wall</label></td>
            </tr>
            <tr v-if="options.lens && options.sensor">
                <td><label><input type="checkbox" v-model="options.angleOfView"> Guide lines</label></td>
            </tr>
            <tr>
                <td><label><input type="checkbox" v-model="options.advanced"> Advanced mode</label></td>
            </tr>
            <template v-if="options.advanced">
                <tr v-if="options.lens && options.sensor && options.circleOfConfusion">
                    <td><label><input type="checkbox" v-model="options.depthOfField"> Depth of field</label></td>
                </tr>
                <tr v-if="options.lens && options.sensor && options.circleOfConfusion && options.depthOfField">
                    <td><label><input type="checkbox" v-model="options.hyperfocalPoint"> Hyperfocal point</label></td>
                </tr>
                <tr>
                    <td><label><input type="checkbox" v-model="options.grid"> Grid</label></td>
                </tr>
                <tr>
                    <td><label><input type="checkbox" v-model="options.opticalAxis"> Optical axis</label></td>
                </tr>
            </template>
            <!-- Field -->
            <template v-if="options.advanced">
                <tr>
                    <th colspan="3">
                        <hr>Field
                    </th>
                </tr>
                <tr>
                    <td>Width</td>
                    <td></td>
                    <td>{{ humanReadable(state.width) }}</td>
                </tr>
                <tr>
                    <td>Height</td>
                    <td></td>
                    <td>{{ humanReadable(state.height) }}</td>
                </tr>
                <tr>
                    <td>Center x</td>
                    <td></td>
                    <td>{{ humanReadable(state.cx) }}</td>
                </tr>
                <tr>
                    <td>Center y</td>
                    <td></td>
                    <td>{{ humanReadable(state.cy) }}</td>
                </tr>
                <tr>
                    <td>Scale</td>
                    <td></td>
                    <td>{{ humanReadable(state.scale) }}</td>
                </tr>
            </template>

            <!-- footer -->
            <tr>
                <th colspan="3">
                    <hr>
                </th>
            </tr>
            <tr>
                <td><small>Created by</small></td>
                <td><a href="https://monman53.github.io/"><small>monman53</small></a></td>
                <td>
                    <a href="https://github.com/monman53/simple-camera-simulator" class="github"><i
                            class="bi bi-github"></i></a>
                </td>
            </tr>
        </table>
    </div>
</template>

<style scoped>
.base {
    margin: 1em;
    padding: 0.5em;
    max-height: 80vh;
    border-radius: 1em;
    overflow: auto;
    color: white;
    background-color: #0008;
    backdrop-filter: blur(4px);
}

.indent {
    padding-left: 1em;
}

table td {
    vertical-align: top;
}

table td:nth-child(1) {
    padding-left: 1em;
    text-align: left;
}

table td:nth-child(2) {
    text-align: right;
}

table td:nth-child(3) {
    text-align: right;
}

a {
    color: white;
    text-decoration: none;
}
</style>
