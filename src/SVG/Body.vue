<script setup lang="ts">
import { body, lensesSorted, lensFronts, lensRs, options } from '@/globals';
import WithBackground from './WithBackground.vue';

</script>

<template>
    <g>
        <WithBackground>
            <g v-if="body.front && body.back && body.r" class="stroke-white thicker">
                <!-- Outline -->
                <line :x1="body.front" :y1="-body.r" :x2="body.back" :y2="-body.r"></line>
                <line :x1="body.front" :y1="body.r" :x2="body.back" :y2="body.r"></line>
                <line v-if="options.sensor" :x1="body.back" :y1="-body.r" :x2="body.back" :y2="body.r"></line>

                <!-- Lenses -->
                <g v-if="options.lens">
                    <g v-for="(lens, idx) of lensesSorted">
                        <line :x1="lensFronts[idx]" :y1="-body.r" :x2="lensFronts[idx]" :y2="-lensRs[idx]"></line>
                        <line :x1="lensFronts[idx]" :y1="body.r" :x2="lensFronts[idx]" :y2="lensRs[idx]"></line>
                    </g>
                </g>
            </g>
        </WithBackground>
    </g>
</template>