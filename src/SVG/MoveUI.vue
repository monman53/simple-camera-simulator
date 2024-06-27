<script setup lang="ts">
import { getPositionOnSvg, preventDefaultAndStopPropagation, setMoveHandlerWithM0 } from '@/handlers';
import type { Vec } from '@/math';

const props = defineProps<{
    handlerCreator: (...params: any[])=>((e: any, d: Vec)=>void)
}>()

const moveStart = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    setMoveHandlerWithM0(props.handlerCreator(), m0)
}
</script>

<template>
    <g @mousedown="moveStart">
        <slot></slot>
    </g>
</template>