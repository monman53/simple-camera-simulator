<script setup lang="ts">
import { options, state } from './globals'
import { humanReadable } from './utils'
</script>

<template>
  <div>
    <div v-if="options.pointerPosition" id="base">
      ({{ humanReadable(state.pointerPos.x) }}, {{ humanReadable(state.pointerPos.y) }})
    </div>
  </div>
</template>

<style>
#base {
  padding: 0.2em 0.5em;
  color: white;
  background-color: #0008;
  backdrop-filter: blur(4px);
}
</style>
