<script setup lang="ts">
import { humanReadable } from './utils';
import { createParams } from './constants'

const props = defineProps(['params'])
const params = props.params;

const resetView = () => {
    const params0 = createParams()
    params.cx = params0.cx
    params.cy = params0.cy
    params.scale = params0.scale
}
const resetStyle = () => {
    const params0 = createParams()
    params.style = params0.style
}
</script>

<template>
    <div>
        <fieldset>
            <legend># of rays</legend>
            <input type="range" min="0" max="16" v-model="params.nRaysLog">
            {{ 1 << params.nRaysLog }}
        </fieldset>
        <fieldset>
            <legend>Ray width</legend>
            <input type="range" min="0.001" :max="params.style.rLight" step="0.001" v-model="params.style.rayWidth">
            {{ humanReadable(params.style.rayWidth) }}
        </fieldset>
        <fieldset>
            <legend>Reset</legend>
            <button @click="resetView">View</button>
            <button @click="resetStyle">Style</button>
        </fieldset>
        <fieldset>
            <legend>Params</legend>
            width: {{ params.width }}<br>
            height: {{ params.height }}<br>
            (cx, cy): ({{ humanReadable(params.cx) }}, {{ humanReadable(params.cy) }})<br>
            scale: {{ humanReadable(params.scale) }}
        </fieldset>
    </div>
</template>

<style scoped></style>
