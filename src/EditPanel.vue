<script setup lang="ts">
import { computed } from 'vue';
import { resizeSensor } from './SVG/Sensor.vue';
import { calcLensInfo, lensGroups, options, sensor } from './globals';
import { humanReadable, removeElement } from './utils';
import { groupLensGroups, ungroupLensGroup } from './SVG/LensGroup.vue';

const visible = computed(() => {
    for (const lensGroup of lensGroups.value) {
        if (lensGroup.selected) {
            return true
        }
    }

    return sensor.value.selected
})

const nSelectedLensGroups = computed(() => {
    return lensGroups.value.reduce((acc, cur) => {
        return acc + (cur.selected ? 1 : 0)
    }, 0)
})

const nSelectedLenses = computed(() => {
    return lensGroups.value.reduce((acc, cur) => {
        return acc + (cur.selected ? cur.lenses.length : 0)
    }, 0)
})

</script>

<template>
    <div v-if="visible" class="edit-panel-base">
        <template v-if="nSelectedLensGroups > 0">
            <h3>Lenses</h3>
            <p>
                <button v-if="nSelectedLensGroups > 1" @click="groupLensGroups">group</button>
                <button v-if="nSelectedLenses > 1" @click="ungroupLensGroup">ungroup</button>
            </p>
            <!-- Lenses -->
            <template v-for="(lensGroup, i) of lensGroups">
                <template v-if="lensGroup.selected">
                    <fieldset>
                        <legend :title="`f: ${humanReadable(calcLensInfo(lensGroup.lenses).f)}`">
                            Group {{ i }}
                            <i class="bi bi-power pointer" :class="{ iconDisabled: !lensGroup.enabled }"
                                @click="lensGroup.enabled = !lensGroup.enabled"></i>
                            <i class="bi bi-lock pointer" :class="{ iconDisabled: !lensGroup.fixed }"
                                @click="lensGroup.fixed = !lensGroup.fixed"></i>
                            <i class="bi bi-trash pointer warning" v-if="!lensGroup.fixed"
                                @click="removeElement(lensGroups, i)"></i>
                        </legend>
                        <template v-for="(lens, j) of lensGroup.lenses">
                            <fieldset>
                                <legend :title="`f: ${humanReadable(calcLensInfo([lens]).f)}`">
                                    Lens {{ j }}
                                </legend>
                                <table>
                                    <tr>
                                        <th>x</th>
                                        <th>r</th>
                                    </tr>
                                    <template v-for="plane of lens.planes.value">
                                        <tr>
                                            <td><input type="number" v-model.number="plane.x"
                                                    :disabled="lensGroup.fixed">
                                            </td>
                                            <td><input type="number" v-model.number="plane.r"
                                                    :disabled="lensGroup.fixed">
                                            </td>
                                        </tr>
                                    </template>
                                </table>
                            </fieldset>
                        </template>
                    </fieldset>
                </template>
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

i {
    user-select: none;
}

.iconDisabled {
    color: #555;
}

.warning {
    color: #900;
}
</style>