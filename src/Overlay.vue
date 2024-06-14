<script setup lang="ts">
import { ref } from 'vue'

import Document from './Document.vue'
import Controller from './Controller.vue'

const mode = ref("control")
</script>

<template>
    <div class="base">
        <div class="mode-select">
            <div>
                <i v-if="mode === 'control'" class="bi bi-gear-fill" @click="mode = ''"></i>
                <i v-else class="bi bi-gear" @click="mode = 'control'"></i>
            </div>
            <div>
                <i v-if="mode === 'info'" class="bi bi-info-circle-fill" @click="mode = ''"></i>
                <i v-else class="bi bi-info-circle" @click="mode = 'info'"></i>
            </div>
            <div style="text-align: right">
                <a href="https://github.com/monman53/simple-camera-simulator"><i class="bi bi-github"></i></a>
            </div>
        </div>
        <div class="content">
            <Controller v-if="mode === 'control'"></Controller>
            <Document v-if="mode === 'info'"></Document>
        </div>
        <div v-if="mode !== ''" class="footer">
            <small>Created by <a href="https://monman53.github.io/">monman53</a></small>
        </div>
    </div>
</template>

<style scoped>
.base {
    margin: 1em;
    padding: 0.5em;
    max-width: 30em;
    border-radius: 1em;
    color: white;
    background-color: #0008;
    backdrop-filter: blur(4px);
}

.content {
    max-height: 80vh;
    overflow: auto;
}

a {
    color: white;
    text-decoration: none;
}

.mode-select {
    margin: 0.3em;
    font-size: 1.5em;
    display: grid;
    grid-template-columns: auto 1fr 1fr;
    gap: 0.3em;
}

.mode-select i {
    cursor: pointer;
}

.footer {
    padding: 0.3em;
    text-align: right;
}
</style>
