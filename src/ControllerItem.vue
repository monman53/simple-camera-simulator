<script setup lang="ts">
import { state, appleProps, options, style, globalLensInfo, globalLensRe } from './globals'
import { humanReadable } from './utils'
import { lightHSL, wavelengthCollection } from './collection/color'
</script>

<template>
  <table>
    <!-- Rays -->
    <tr>
      <td>New light color</td>
      <td>
        <label>
          <input v-model="state.newLightColorComposite" type="checkbox" />
          Composite
        </label>
        <br />
        <template v-if="!state.newLightColorComposite">
          <input
            v-model="state.newLightWavelength"
            type="range"
            :min="wavelengthCollection.min"
            :max="wavelengthCollection.max"
            step="0.001"
          />
          <br />
          <button @click="state.newLightWavelength = wavelengthCollection.blue">Blue</button><br />
          <button @click="state.newLightWavelength = wavelengthCollection.green">Green</button
          ><br />
          <button @click="state.newLightWavelength = wavelengthCollection.yellow">Yellow</button
          ><br />
          <button @click="state.newLightWavelength = wavelengthCollection.red">Red</button>
        </template>
      </td>
      <td
        v-if="!state.newLightColorComposite"
        :style="`background-color: ${lightHSL(state.newLightWavelength, style.rayIntensity)}`"
      />
    </tr>
    <tr>
      <td>New light type</td>
      <td>
        <label>
          <input v-model="state.newLightType" type="radio" :value="'Point'" />
          Point
        </label>
        <br />
        <label>
          <input v-model="state.newLightType" type="radio" :value="'Parallel'" />
          Parallel
        </label>
      </td>
      <td />
    </tr>
    <!-- Lens -->
    <tr>
      <th colspan="3">
        <hr />
        <label><input v-model="options.lens" type="checkbox" /> Lens</label>
      </th>
    </tr>
    <template v-if="options.lens">
      <tr>
        <td>
          <label><input v-model="options.lensFocalPoints" type="checkbox" /> Focal points</label>
        </td>
      </tr>
      <tr v-if="options.lensFocalPoints && options.advanced">
        <td>
          <label
            ><input v-model="options.lensDoubleFocalPoints" type="checkbox" /> 2x Focal
            points</label
          >
        </td>
      </tr>
    </template>
    <template v-if="options.lens">
      <tr>
        <td>Focal Length</td>
        <td />
        <td>{{ humanReadable(globalLensInfo.f) }}</td>
      </tr>
      <tr>
        <td>F-number</td>
        <td />
        <td>{{ humanReadable(globalLensInfo.f / (globalLensRe.forward.re * 2)) }}</td>
      </tr>
      <!-- <template v-if="options.advanced">
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
                    <td>{{ humanReadable(lens.d) }}</td>
                </tr>
            </template> -->
    </template>
    <!-- Screen -->
    <tr>
      <th colspan="3">
        <hr />
        <label><input v-model="options.sensor" type="checkbox" /> Screen</label>
      </th>
    </tr>
    <template v-if="options.sensor" />
    <!-- Other options -->
    <tr>
      <th colspan="3">
        <hr />
        Other Options
      </th>
    </tr>
    <tr>
      <td>
        <label><input v-model="options.body" type="checkbox" /> Body</label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input v-model="options.lensIdeal" type="checkbox" /> Ideal lens</label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input v-model="options.curvature" type="checkbox" /> Curvature</label>
      </td>
    </tr>
    <tr v-if="options.lens && options.sensor">
      <td>
        <label><input v-model="options.angleOfView" type="checkbox" /> Guide lines</label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input v-model="options.advanced" type="checkbox" /> Advanced mode</label>
      </td>
    </tr>
    <tr>
      <td>
        <label><input v-model="options.aperture" type="checkbox" /> Aperture</label>
      </td>
    </tr>
    <template v-if="options.advanced">
      <tr v-if="options.lens && options.sensor && options.circleOfConfusion">
        <td>
          <label><input v-model="options.depthOfField" type="checkbox" /> Depth of field</label>
        </td>
      </tr>
      <tr
        v-if="options.lens && options.sensor && options.circleOfConfusion && options.depthOfField"
      >
        <td>
          <label
            ><input v-model="options.hyperfocalPoint" type="checkbox" /> Hyperfocal point</label
          >
        </td>
      </tr>
      <tr>
        <td>
          <label><input v-model="options.grid" type="checkbox" /> Grid</label>
        </td>
      </tr>
      <tr>
        <td>
          <label><input v-model="options.opticalAxis" type="checkbox" /> Optical axis</label>
        </td>
      </tr>
      <tr>
        <td>UI stroke width</td>
        <td>
          <input v-model.number="style.widthUI" type="range" min="0" max="3" step="0.01" />
        </td>
      </tr>
      <!-- <tr>
        <td>
          <label><input v-model="options.wavelength" type="checkbox" /> Wavelength</label>
        </td>
      </tr> -->
    </template>
    <!-- Field -->
    <template v-if="options.advanced">
      <tr>
        <th colspan="3">
          <hr />
          Field
        </th>
      </tr>
      <tr>
        <td>Width</td>
        <td />
        <td>{{ humanReadable(state.width) }}</td>
      </tr>
      <tr>
        <td>Height</td>
        <td />
        <td>{{ humanReadable(state.height) }}</td>
      </tr>
      <tr>
        <td>Center x</td>
        <td />
        <td>{{ humanReadable(state.c.x) }}</td>
      </tr>
      <tr>
        <td>Center y</td>
        <td />
        <td>{{ humanReadable(state.c.y) }}</td>
      </tr>
      <tr>
        <td>Scale</td>
        <td />
        <td>{{ humanReadable(state.scale) }}</td>
      </tr>
    </template>
    <!-- Templates -->
    <template v-if="options.advanced">
      <tr>
        <th colspan="3">
          <hr />
          Templates
        </th>
      </tr>
      <tr>
        <td>
          <label><input v-model="options.apple" type="checkbox" />Apple</label>
        </td>
        <td />
        <td />
      </tr>
      <template v-if="options.apple">
        <tr>
          <td>
            <div class="indent">x</div>
          </td>
          <td>
            <label><input v-model.number="appleProps.c.x" type="number" /></label>
          </td>
        </tr>
        <tr>
          <td>
            <div class="indent">r</div>
          </td>
          <!-- <td><label><input type="number" v-model.number="appleProps.r"></label></td> -->
          <td>
            <input v-model.number="appleProps.r" type="range" min="0" max="200" step="0.01" />
          </td>
          <td>{{ humanReadable(appleProps.r) }}</td>
        </tr>
        <tr>
          <td>
            <div class="indent">n</div>
          </td>
          <td>
            <input v-model.number="appleProps.n" type="range" min="0" max="64" step="1" />
          </td>
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
