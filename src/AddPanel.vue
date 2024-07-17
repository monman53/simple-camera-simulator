<script setup lang="ts">
import { createLensGroup, lenseData } from './collection/lens'
import { lensGroups } from './globals'
</script>

<template>
  <div class="add-panel-base">
    <h4>Lens collection</h4>
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
