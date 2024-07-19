<script setup lang="ts">
import { triggerRef } from 'vue'
import {
  createLensGroup,
  exampleConcaveLens,
  exampleConvexLens,
  exampleDoubletLens,
  lenseData,
  type LensData
} from './collection/lens'
import { lensGroups } from './globals'
const addLens = (e: any, lens: LensData) => {
  lensGroups.value = lensGroups.value.concat(createLensGroup(lens))
  triggerRef(lensGroups)
}
</script>

<template>
  <div class="add-panel-base">
    <h4>Primitive lenses</h4>
    <button @click="addLens($event, exampleConvexLens)">Convex</button>
    <br />
    <button @click="addLens($event, exampleConcaveLens)">Concave</button>
    <br />
    <button @click="addLens($event, exampleDoubletLens)">Doublet</button>
    <h4>Lens collection (replace all)</h4>
    <template v-for="(lens, idx) of lenseData" :key="idx">
      <button @click="lensGroups = createLensGroup(lens)">
        {{ lens.name }}
      </button>
      <br />
    </template>
  </div>
</template>

<style>
.add-panel-base {
  padding: 0.5em;
}
</style>
