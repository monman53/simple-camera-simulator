<script setup lang="ts">
import { body, lensesSorted, lensFronts, lensRs } from '@/globals';
import WithBackground from './WithBackground.vue';

</script>

<template>
    <g>
        <WithBackground>
            <g class="stroke-white thick">
                <!-- Outline -->
                <line :x1="body.front" :y1="-body.r" :x2="body.back" :y2="-body.r"></line>
                <line :x1="body.front" :y1="body.r" :x2="body.back" :y2="body.r"></line>
                <line :x1="body.back" :y1="-body.r" :x2="body.back" :y2="body.r"></line>

                <!-- Lenses -->
                <g v-for="(lens, idx) of lensesSorted">
                    <line :x1="lensFronts[idx]" :y1="-body.r" :x2="lensFronts[idx]" :y2="-lensRs[idx]"></line>
                    <line :x1="lensFronts[idx]" :y1="body.r" :x2="lensFronts[idx]" :y2="lensRs[idx]"></line>
                </g>
            </g>
        </WithBackground>
    </g>
</template>