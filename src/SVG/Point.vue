<script setup lang="ts">
import { rUI } from '@/globals';
import type { Vec } from '@/math';
import WithBackground from './WithBackground.vue';

const props = defineProps<{
    c: Vec,
}>()

</script>

<template>
    <WithBackground>
        <g class="fill-white stroke-white normal">
            <circle :cx="c.x" :cy="c.y" :r="rUI / 2"></circle>
        </g>
    </WithBackground>
</template>