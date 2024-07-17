<script setup lang="ts">
import TopLeft from './TopLeft.vue'
import BottomRight from './BottomRight.vue'
</script>

<template>
  <TopLeft id="top-left" />
  <BottomRight id="bottom-right" />
</template>

<style scoped>
#top-left {
  position: absolute;
  top: 0;
  left: 0;
}

#bottom-right {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
