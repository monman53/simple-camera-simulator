<script setup lang="ts">
import { aperture, body, lensGroups, lensesSorted } from '@/globals';
import WithBackground from './WithBackground.vue';
import { computed } from 'vue';
import { calcLensFront, calcLensR } from '@/math';

// const frontR = computed(() => {
//     if (aperture.value.x < calcLensFront(lensesSorted.value[0])){
//         return aperture.value.r
//     } else {
//         return calcLensR(lensesSorted.value[0])
//     }
// })

const lensFronts = computed(() => {
    return lensesSorted.value.map((lens) => {
        return calcLensFront(lens)
    })
})

const lensRs = computed(()=>{
    return lensesSorted.value.map((lens)=>{
        return calcLensR(lens)
    })
})

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

                <!-- Aperture -->
                <!-- <line :x1="aperture.x" :y1="-body.r" :x2="aperture.x" :y2="-aperture.r"></line> -->
                <!-- <line :x1="aperture.x" :y1="body.r" :x2="aperture.x" :y2="aperture.r"></line> -->
            </g>
        </WithBackground>
    </g>
</template>