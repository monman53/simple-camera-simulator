<script setup lang="ts">
import { defineProps } from 'vue'
import { Vec } from '../math'
import { rUI } from '@/globals'
import WithBackground from './WithBackground.vue'

defineProps<{
  c: Vec
}>()
</script>

<template>
  <g class="hover-hidden-parent">
    <WithBackground>
      <g class="stroke-white fill-transparent normal">
        <g class="hover-hidden-child">
          <circle :cx="c.x" :cy="c.y" :r="rUI" />
        </g>
      </g>
    </WithBackground>
  </g>
</template>
