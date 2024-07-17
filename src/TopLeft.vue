<script setup lang="ts">
import { ref, type Ref } from 'vue'

import Document from './DocumentItem.vue'
import Controller from './ControllerItem.vue'
import EditPanel from './EditPanel.vue';
import AddPanel from './AddPanel.vue';

type ModeType = "control" | "add" | "edit" | "info" | ""

const mode: Ref<ModeType> = ref("control")
</script>

<template>
  <div class="base">
    <div class="mode-select">
      <div>
        <i
          v-if="mode === 'control'"
          class="bi bi-gear-fill"
          @click="mode = ''"
        />
        <i
          v-else
          class="bi bi-gear"
          @click="mode = 'control'"
        />
      </div>
      <div>
        <i
          v-if="mode === 'add'"
          class="bi bi-plus-circle-fill"
          @click="mode = ''"
        />
        <i
          v-else
          class="bi bi-plus-circle"
          @click="mode = 'add'"
        />
      </div>
      <div>
        <i
          v-if="mode === 'edit'"
          class="bi bi-pen-fill"
          @click="mode = ''"
        />
        <i
          v-else
          class="bi bi-pen"
          @click="mode = 'edit'"
        />
      </div>
      <div>
        <i
          v-if="mode === 'info'"
          class="bi bi-info-circle-fill"
          @click="mode = ''"
        />
        <i
          v-else
          class="bi bi-info-circle"
          @click="mode = 'info'"
        />
      </div>
      <div style="text-align: right">
        <a href="https://github.com/monman53/simple-camera-simulator"><i class="bi bi-github" /></a>
      </div>
    </div>
    <div class="content">
      <Controller v-if="mode === 'control'" />
      <AddPanel v-if="mode === 'add'" />
      <Document v-if="mode === 'info'" />
      <EditPanel v-if="mode === 'edit'" />
    </div>
    <div
      v-if="mode === 'info'"
      class="footer"
    >
      <small>Created by <a href="https://monman53.github.io/">monman53</a></small>
    </div>
  </div>
</template>

<style>
.base {
    margin: 1em;
    padding: 0.5em;
    max-width: 30em;
    border-radius: 1em;
    color: white;
    background-color: #2228;
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
    grid-template-columns: auto auto auto auto 1fr;
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