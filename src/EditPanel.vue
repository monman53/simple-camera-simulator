<script setup lang="ts">
import { computed } from 'vue';
import { resizeSensor } from './SVG/Sensor.vue';
import { calcLensInfo, lensGroups, options, sensor } from './globals';
import { humanReadable, removeElement } from './utils';

const visible = computed(() => {
    for (const lensGroup of lensGroups.value) {
        if (lensGroup.selected) {
            return true
        }
    }

    return sensor.value.selected
})

</script>

<template>
    <div v-if="visible" class="edit-panel-base">
        <!-- Lenses -->
        <template v-for="(lensGroup, i) of lensGroups">
            <template v-if="lensGroup.selected">
                <h3>Lenses</h3>
                <fieldset>
                    <legend>
                        Group {{ i }} (f: {{ humanReadable(calcLensInfo(lensGroup.lenses).f) }})
                        <i class="bi bi-trash pointer" @click="removeElement(lensGroups, i)"></i>
                    </legend>
                    <template v-for="(lens, j) of lensGroup.lenses">
                        <fieldset>
                            <legend>Lens {{ j }} (f: {{ humanReadable(calcLensInfo([lens]).f) }})</legend>
                            <table>
                                <tr>
                                    <th>x</th>
                                    <th>r</th>
                                </tr>
                                <template v-for="plane of lens.planes">
                                    <tr>
                                        <td><input type="number" v-model.number="plane.x"></td>
                                        <td><input type="number" v-model.number="plane.r"></td>
                                    </tr>
                                </template>
                            </table>
                        </fieldset>
                    </template>
                </fieldset>
            </template>
        </template>

        <!-- Sensor -->
        <template v-if="options.sensor && sensor.selected">
            <h3>Sensor</h3>
            <h4>Resize</h4>
            <button @click="resizeSensor(24 / 2)">Full frame</button>
            <br>
            <button @click="resizeSensor(15.6 / 2)">APS-C</button>
            <br>
            <button @click="resizeSensor(14.9 / 2)">APS-C (Canon)</button>
            <br>
            <button @click="resizeSensor(13 / 2)">Four thirds</button>
            <br>
            <button @click="resizeSensor(8.8 / 2)">1"</button>

            <h4>Options</h4>
            <label><input type="checkbox" v-model="options.sensorPreview"> Preview</label>
            <br>
            <label><input type="checkbox" v-model="options.circleOfConfusion"> CoC</label>
            <br>
            <template v-if="options.circleOfConfusion">
                <input type="range" min="0" max="10" step="0.001" v-model.number="sensor.circleOfConfusion">
                {{ humanReadable(sensor.circleOfConfusion) }}
            </template>
            <!-- Diameter -->
            <!-- {{ humanReadable(sensor.t.sub(sensor.s).length()) }} -->
        </template>
    </div>
</template>

<style>
.edit-panel-base {
    padding: 0.5em;
}

table td {
    text-align: right;
}

input[type='number'] {
    width: 5em;
}

h3,
h4 {
    margin-top: 1em;
}

h3 {
    margin-top: 0;
}

fieldset {
    padding: 0.1em 0.2em;
    border-top: 0;
    border-bottom: 0;
    border-right: 0;
}
</style>