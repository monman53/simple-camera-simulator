<script setup lang="ts">
import { computed } from 'vue';
import { resizeSensor } from './SVG/SensorItem.vue';
import { calcLensInfo, lensGroups, options, sensor } from './globals';
import { humanReadable, removeElement } from './utils';
import { groupLensGroups, ungroupLensGroup } from './SVG/LensGroupItem.vue';

const visible = computed(() => {
    for (const lensGroup of lensGroups.value) {
        if (lensGroup.selected.value) {
            return true
        }
    }

    return sensor.value.selected
})

const nSelectedLensGroups = computed(() => {
    return lensGroups.value.reduce((acc, cur) => {
        return acc + (cur.selected.value ? 1 : 0)
    }, 0)
})

const nSelectedLenses = computed(() => {
    return lensGroups.value.reduce((acc, cur) => {
        return acc + (cur.selected.value ? cur.lenses.value.length : 0)
    }, 0)
})

</script>

<template>
  <div
    v-if="visible"
    class="edit-panel-base"
  >
    <template v-if="nSelectedLensGroups > 0">
      <h3>Lenses</h3>
      <p>
        <button
          v-if="nSelectedLensGroups > 1"
          @click="groupLensGroups"
        >
          group
        </button>
        <button
          v-if="nSelectedLenses > 1"
          @click="ungroupLensGroup"
        >
          ungroup
        </button>
      </p>
      <!-- Lenses -->
      <template
        v-for="(lensGroup, i) of lensGroups"
        :key="i"
      >
        <template v-if="lensGroup.selected">
          <fieldset>
            <legend :title="`f: ${humanReadable(calcLensInfo(lensGroup.lenses.value).f)}`">
              Group {{ i }}
              <i
                class="bi bi-power pointer"
                :class="{ iconDisabled: !lensGroup.enabled.value }"
                @click="lensGroup.enabled.value = !lensGroup.enabled.value"
              />
              <i
                class="bi bi-lock pointer"
                :class="{ iconDisabled: !lensGroup.fixed.value }"
                @click="lensGroup.fixed.value = !lensGroup.fixed.value"
              />
              <i
                v-if="!lensGroup.fixed.value"
                class="bi bi-trash pointer warning"
                @click="removeElement(lensGroups, i)"
              />
            </legend>
            <template
              v-for="(lens, j) of lensGroup.lenses.value"
              :key="j"
            >
              <fieldset>
                <legend :title="`f: ${humanReadable(calcLensInfo([lens]).f)}`">
                  Lens {{ j }}
                </legend>
                <table>
                  <tr>
                    <th>x</th>
                    <th>r</th>
                  </tr>
                  <template
                    v-for="(plane, k) of lens.planes.value"
                    :key="k"
                  >
                    <tr>
                      <td>
                        <input
                          v-model.number="plane.x"
                          type="number"
                          :disabled="lensGroup.fixed.value"
                        >
                      </td>
                      <td>
                        <input
                          v-model.number="plane.r"
                          type="number"
                          :disabled="lensGroup.fixed.value"
                        >
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
      <button @click="resizeSensor(24 / 2)">
        Full frame
      </button>
      <br>
      <button @click="resizeSensor(15.6 / 2)">
        APS-C
      </button>
      <br>
      <button @click="resizeSensor(14.9 / 2)">
        APS-C (Canon)
      </button>
      <br>
      <button @click="resizeSensor(13 / 2)">
        Four thirds
      </button>
      <br>
      <button @click="resizeSensor(8.8 / 2)">
        1"
      </button>

      <h4>Options</h4>
      <label><input
        v-model="options.sensorPreview"
        type="checkbox"
      > Preview</label>
      <br>
      <label><input
        v-model="options.circleOfConfusion"
        type="checkbox"
      > CoC</label>
      <br>
      <template v-if="options.circleOfConfusion">
        <input
          v-model.number="sensor.circleOfConfusion"
          type="range"
          min="0"
          max="10"
          step="0.001"
        >
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