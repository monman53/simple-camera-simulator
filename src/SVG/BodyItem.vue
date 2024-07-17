<script setup lang="ts">
import { aperture, body, lensesSorted, lensGroups, options, sensor } from '@/globals'
import WithBackground from './WithBackground.vue'
import MoveUI from './MoveUI.vue'
import type { Vec } from '@/math'

const move = () => {
  const x0s = lensGroups.value.map((lensGroup) =>
    lensGroup.lenses.value.map((lens) => lens.planes.value.map((p) => p.x.value))
  )
  const sensorS0 = sensor.value.s.copy()
  const sensorT0 = sensor.value.t.copy()
  const apertureX0 = aperture.value.x
  return (e: any, d: Vec) => {
    lensGroups.value.forEach((lensGroup, i) => {
      lensGroup.lenses.value.forEach((lens, j) => {
        lens.planes.value.forEach((plane, k) => {
          plane.x.value = x0s[i][j][k] + d.x
        })
      })
    })
    sensor.value.s.x = sensorS0.x + d.x
    sensor.value.t.x = sensorT0.x + d.x
    aperture.value.x = apertureX0 + d.x
  }
}
</script>

<template>
  <MoveUI :handler-creator="move" class="grab">
    <WithBackground :ui="true">
      <g
        v-if="isFinite(body.front) && isFinite(body.back) && isFinite(body.r)"
        class="stroke-white thicker"
      >
        <!-- Outline -->
        <line :x1="body.front" :y1="-body.r" :x2="body.back" :y2="-body.r" />
        <line :x1="body.front" :y1="body.r" :x2="body.back" :y2="body.r" />
        <line v-if="options.sensor" :x1="body.back" :y1="-body.r" :x2="body.back" :y2="body.r" />

        <!-- Lenses -->
        <g v-if="options.lens">
          <g v-for="(lens, idx) of lensesSorted" :key="idx">
            <g v-if="options.lensIdeal">
              <line :x1="lens.xcog.value" :y1="-body.r" :x2="lens.xcog.value" :y2="-lens.h.value" />
              <line :x1="lens.xcog.value" :y1="body.r" :x2="lens.xcog.value" :y2="lens.h.value" />
            </g>
            <g v-else>
              <line
                :x1="lens.front.value"
                :y1="-body.r"
                :x2="lens.front.value"
                :y2="-lens.h.value"
              />
              <line :x1="lens.front.value" :y1="body.r" :x2="lens.front.value" :y2="lens.h.value" />
            </g>
          </g>
        </g>
      </g>
    </WithBackground>
  </MoveUI>
</template>
