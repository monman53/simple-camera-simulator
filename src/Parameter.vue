<script setup lang="ts">
import { humanReadable } from './utils';
import { constants } from './constants'

const props = defineProps(['params'])
const params = props.params;

const resetView = () => {
    params.cx = 0
    params.cy = 0
    params.scale = constants.scale0
}
</script>

<template>
    <div>
        <button @click="resetView">Reset View</button>
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
