<script setup lang="ts">
import { computed } from 'vue'

import { state, lights, lens, sensor, appleProps, options, style, lensD, lensR, fNumber } from './globals'
import { humanReadable } from './utils';
import { Light } from "./type"

const nRays = computed(() => {
    return 1 << state.value.nRaysLog
})

</script>

<template>
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
        <tr>
            <td>New light type</td>
            <td>
                <label>
                    <input type="radio" :value="Light.Point" v-model="state.newLightType">
                    Point
                </label>
                <br>
                <label>
                    <input type="radio" :value="Light.Parallel" v-model="state.newLightType">
                    Parallel
                </label>
            </td>
            <td></td>
        </tr>
        <!-- Lens -->
        <tr>
            <th colspan="3">
                <hr><label><input type="checkbox" v-model="options.lens"> Lens</label>
            </th>
        </tr>
        <template v-if="options.lens">
            <tr>
                <td><label><input type="checkbox" v-model="options.lensFocalPoints"> Focal points</label>
                </td>
            </tr>
            <tr v-if="options.lensFocalPoints && options.advanced">
                <td><label><input type="checkbox" v-model="options.lensDoubleFocalPoints"> 2x Focal
                        points</label>
                </td>
            </tr>
        </template>
        <!-- <tr>
            <td><label><input type="checkbox" v-model="options.aperture"> Aperture</label></td>
        </tr> -->
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
            <!-- <tr v-if="options.sensorPreview">
                            <td><label><input type="checkbox" v-model="options.sensorMemory"> Memory</label></td>
                        </tr> -->
            <template v-if="options.advanced">
                <tr>
                    <td><label><input type="checkbox" v-model="options.circleOfConfusion"> CoC</label></td>
                    <template v-if="options.circleOfConfusion">
                        <td><input type="range" min="0" max="10" step="0.001" v-model.number="lens.circleOfConfusion">
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
                <td><label><input type="checkbox" v-model="options.depthOfField"> Depth of field</label>
                </td>
            </tr>
            <tr v-if="options.lens && options.sensor && options.circleOfConfusion && options.depthOfField">
                <td><label><input type="checkbox" v-model="options.hyperfocalPoint"> Hyperfocal
                        point</label>
                </td>
            </tr>
            <tr>
                <td><label><input type="checkbox" v-model="options.grid"> Grid</label></td>
            </tr>
            <tr>
                <td><label><input type="checkbox" v-model="options.opticalAxis"> Optical axis</label></td>
            </tr>
            <tr>
                <td>UI stroke width</td>
                <td><input type="range" min="0" max="3" step="0.01" v-model.number="style.widthUI"></td>
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
                <td>{{ humanReadable(state.c.x) }}</td>
            </tr>
            <tr>
                <td>Center y</td>
                <td></td>
                <td>{{ humanReadable(state.c.y) }}</td>
            </tr>
            <tr>
                <td>Scale</td>
                <td></td>
                <td>{{ humanReadable(state.scale) }}</td>
            </tr>
        </template>
        <!-- Templates -->
        <template v-if="options.advanced">
            <tr>
                <th colspan="3">
                    <hr>Templates
                </th>
            </tr>
            <tr>
                <td>Focal length</td>
                <td>
                    <button @click="lens.f = 12">12</button>
                    <button @click="lens.f = 24">24</button>
                    <button @click="lens.f = 35">35</button>
                    <button @click="lens.f = 50">50</button>
                    <br>
                    <button @click="lens.f = 85">85</button>
                    <button @click="lens.f = 100">100</button>
                    <button @click="lens.f = 200">200</button>
                </td>
                <td></td>
            </tr>
            <tr>
                <td>Sensor height</td>
                <td>
                    <button @click="sensor.r = 24 / 2">Full frame</button>
                    <br>
                    <button @click="sensor.r = 15.6 / 2">APS-C</button>
                    <br>
                    <button @click="sensor.r = 14.9 / 2">APS-C (Canon)</button>
                    <br>
                    <button @click="sensor.r = 13 / 2">Four thirds</button>
                    <br>
                    <button @click="sensor.r = 8.8 / 2">1"</button>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><label><input type="checkbox" v-model="options.apple">Apple</label></td>
                <td></td>
                <td></td>
            </tr>
            <template v-if="options.apple">
                <tr>
                    <td>
                        <div class="indent">x</div>
                    </td>
                    <td><label><input type="number" v-model.number="appleProps.c.x"></label></td>
                </tr>
                <tr>
                    <td>
                        <div class="indent">r</div>
                    </td>
                    <!-- <td><label><input type="number" v-model.number="appleProps.r"></label></td> -->
                    <td><input type="range" min="0" max="200" step="0.01" v-model.number="appleProps.r"></td>
                    <td>{{ humanReadable(appleProps.r) }}</td>
                </tr>
                <tr>
                    <td>
                        <div class="indent">n</div>
                    </td>
                    <td><input type="range" min="0" max="64" step="1" v-model.number="appleProps.n"></td>
                    <td>{{ appleProps.n }}</td>
                </tr>
            </template>
        </template>
    </table>
</template>

<style scoped>
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
    text-align: left;
}

table td:nth-child(3) {
    text-align: right;
}

input[type='number'] {
    width: 5em;
}
</style>