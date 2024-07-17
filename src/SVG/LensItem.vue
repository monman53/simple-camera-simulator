<script lang="ts">
export class LensPlane {
  x: Ref<number>
  r: Ref<number>
  h: Ref<number>
  paramsA: Ref<CauchyParams>
  paramsB: Ref<CauchyParams>
  edge: ComputedRef<number>
  constructor(x: number, r: number, h: number, paramsA: CauchyParams, paramsB: CauchyParams) {
    this.x = ref(x)
    this.r = ref(r)
    this.h = ref(h)
    this.paramsA = ref(paramsA)
    this.paramsB = ref(paramsB)
    this.edge = computed(() => {
      return calcLensPlaneEdge(this)
    })
  }
}

export class Lens {
  planes: ShallowRef<LensPlane[]>
  aperture: Ref<number>
  h: ComputedRef<number>
  f: ComputedRef<number>
  H: ComputedRef<number>
  r: ComputedRef<number>
  xcog: ComputedRef<number>
  front: ComputedRef<number>
  back: ComputedRef<number>
  constructor(planes: LensPlane[], aperture: number) {
    this.planes = shallowRef(planes)
    this.aperture = ref(aperture)
    this.h = computed(() => {
      const hs = this.planes.value.map((p) => p.h.value)
      return Math.max(...hs)
    })
    this.f = computed(() => {
      return calcLensInfo([this]).f
    })
    this.r = computed(() => {
      return calcLensH(this)
    })
    this.H = computed(() => {
      return calcLensInfo([this]).H
    })
    this.xcog = computed(() => {
      return calcLensXCOG(this)
    })
    this.front = computed(() => {
      return calcLensFront(this)
    })
    this.back = computed(() => {
      return calcLensBack(this)
    })
  }
}

const calcLensXCOG = (lens: Lens) => {
  let x = 0
  lens.planes.value.forEach((p) => {
    x += calcLensPlaneEdge(p)
  })
  return x / lens.planes.value.length
}

const calcLensPlaneEdge = (plane: LensPlane) => {
  const x = plane.x.value
  const r = plane.r.value
  const h = plane.h.value
  if (!isFinite(r)) {
    return x
  }
  const d = Math.abs(r) - Math.sqrt(r * r - h * h)
  if (r > 0) {
    return x + d
  } else {
    return x - d
  }
}

const calcLensH = (lens: Lens) => {
  const hs = lens.planes.value.map((p) => p.h.value)
  // Find max h
  hs.sort((a, b) => b - a)
  return hs[0]
}

// TODO: merge with calcLensBack
const calcLensFront = (lens: Lens) => {
  return calcLensPlaneEdge(lens.planes.value[0])
}

const calcLensBack = (lens: Lens) => {
  return calcLensPlaneEdge(lens.planes.value[lens.planes.value.length - 1])
}
</script>

<script setup lang="ts">
import { computed, ref, shallowRef, type ComputedRef, type Ref, type ShallowRef } from 'vue'
import { calcLensInfo, infR, options } from '../globals'
import { vec, Vec } from '../math'
import WithBackground from './WithBackground.vue'
import CircleUI from './CircleUI.vue'
import Point from './PointItem.vue'
import MoveUI from './MoveUI.vue'
import type { CauchyParams } from '@/collection/lens'

const props = defineProps<{
  lens: Lens
  selected: boolean
  fixed: boolean
}>()

const path = computed(() => {
  let d = ''
  // Planes
  const planes = props.lens.planes.value
  const r = props.lens.r.value
  for (let i = 0; i < planes.length - 1; i++) {
    const p1 = planes[i] // left
    const p2 = planes[i + 1] //right
    const edge1 = p1.edge.value
    const edge2 = p2.edge.value
    const absR1 = Math.abs(p1.r.value)
    const absR2 = Math.abs(p2.r.value)
    const sweep1 = p1.r.value > 0 ? 0 : 1
    const sweep2 = p2.r.value > 0 ? 1 : 0

    // left
    d += `M ${edge1} ${-r} `
    d += `L ${edge1} ${-p1.h.value} `
    if (isFinite(p1.r.value)) {
      d += `A ${absR1} ${absR1} 0 0 ${sweep1} ${edge1} ${p1.h.value} `
    } else {
      d += `L ${edge1} ${p1.h.value} `
    }
    d += `L ${edge1} ${r} `

    // right
    d += `L ${edge2} ${r} `
    d += `L ${edge2} ${p2.h.value} `
    if (isFinite(p2.r.value)) {
      d += `A ${absR2} ${absR2} 0 0 ${sweep2} ${edge2} ${-p2.h.value} `
    } else {
      d += `L ${edge2} ${-p2.h.value} `
    }
    d += `L ${edge2} ${-r} `

    // Close
    d += `Z `
  }
  return d
})

const paths = computed(() => {
  const r = props.lens.r.value
  return props.lens.planes.value.map((p) => {
    const absR = Math.abs(p.r.value)
    const sweep = p.r.value > 0 ? 0 : 1
    const edge = p.edge.value

    let d = ''
    d += `M ${edge} ${-r} L ${edge} ${-p.h.value} `
    if (isFinite(p.r.value)) {
      d += `A ${absR} ${absR} 0 0 ${sweep} ${edge} ${p.h.value} `
    } else {
      d += `L ${edge} ${p.h.value}`
    }
    d += `L ${edge} ${r}`
    return d
  })
})

const planeMoveStartHandler = (plane: LensPlane) => {
  return () => {
    const x0 = plane.x.value
    return (e: any, d: Vec) => {
      // TODO
      plane.x.value = x0 + d.x
    }
  }
}

const hChangeStartHandler = (plane: LensPlane) => {
  return () => {
    const h0 = plane.h.value
    return (e: any, d: Vec) => {
      if (h0 - d.y > Math.abs(plane.r.value)) {
        plane.h.value = Math.abs(plane.r.value)
      } else {
        plane.h.value = h0 - d.y
      }
    }
  }
}

const rMoveStartHandler = (plane: LensPlane) => {
  return () => {
    const h0 = plane.h.value
    const x0 = plane.x.value
    const edge0 = calcLensPlaneEdge(plane)
    return (e: any, d: Vec) => {
      let xn = x0 + d.x
      const a = xn - edge0
      const rn = (-h0 * h0 - a * a) / (2 * a)
      plane.r.value = rn
      plane.x.value = xn
    }
  }
}

const apertureSizeChangeStartHandler = () => {
  const lens = props.lens
  const r = lens.r.value
  const a0 = lens.aperture.value * r
  return (e: any, d: Vec) => {
    const an = (a0 + d.y) / r
    if (an < 0) {
      lens.aperture.value = 0
    } else if (an > 1) {
      lens.aperture.value = 1
    } else {
      lens.aperture.value = an
    }
  }
}
</script>

<template>
  <g>
    <!-- Curvature circle -->
    <g v-if="options.lens && options.curvature">
      <!-- Circle -->
      <WithBackground>
        <g class="stroke-white thicker fill-none">
          <template v-for="(plane, idx) of lens.planes.value" :key="idx">
            <circle
              v-if="isFinite(plane.r.value)"
              :cx="plane.x.value + plane.r.value"
              :cy="0"
              :r="Math.abs(plane.r.value)"
            />
            <!-- Infinity curvature -->
            <line
              v-if="!isFinite(plane.r.value)"
              :x1="plane.x.value"
              :y1="-infR"
              :x2="plane.x.value"
              :y2="infR"
            />
          </template>
        </g>
      </WithBackground>
      <!-- Center Point -->
      <template v-for="(plane, idx) of lens.planes.value" :key="idx">
        <Point v-if="isFinite(plane.r.value)" :c="vec(plane.x.value + plane.r.value, 0)" />
      </template>
    </g>

    <!-- Lens -->
    <WithBackground>
      <g class="stroke-white fill-none" :class="{ normal: !selected, bold: selected }">
        <path :d="path" />
      </g>
    </WithBackground>

    <!-- Thickness and change UI -->
    <g v-if="!fixed" class="ui-stroke transparent horizontal-resize">
      <template v-for="(plane, idx) of lens.planes.value" :key="idx">
        <MoveUI :handler-creator="planeMoveStartHandler(plane)">
          <path :d="paths[idx]" />
        </MoveUI>
      </template>
    </g>

    <!-- Size change UI -->
    <template v-for="(plane, idx) of lens.planes.value" :key="idx">
      <MoveUI v-if="!fixed" :handler-creator="hChangeStartHandler(plane)">
        <CircleUI :c="vec(plane.edge.value, -plane.h.value)" class="vertical-resize" />
      </MoveUI>
    </template>

    <!-- Curvature change UI -->
    <g v-if="!fixed" class="horizontal-resize">
      <template v-for="(plane, idx) of lens.planes.value" :key="idx">
        <MoveUI :handler-creator="rMoveStartHandler(plane)">
          <CircleUI :c="vec(plane.x.value, 0)" />
        </MoveUI>
      </template>
    </g>

    <!-- Aperture -->
    <g>
      <WithBackground>
        <!-- Lines -->
        <g class="stroke-white normal no-pointer-events">
          <line
            :x1="lens.xcog.value"
            :y1="-lens.r.value"
            :x2="lens.xcog.value"
            :y2="-lens.r.value * lens.aperture.value"
          />
          <line
            :x1="lens.xcog.value"
            :y1="lens.r.value"
            :x2="lens.xcog.value"
            :y2="lens.r.value * lens.aperture.value"
          />
        </g>
      </WithBackground>
      <!-- UI -->
      <MoveUI v-if="!fixed" :handler-creator="apertureSizeChangeStartHandler">
        <CircleUI
          :c="vec(lens.xcog.value, lens.r.value * lens.aperture.value)"
          class="vertical-resize"
        />
      </MoveUI>
    </g>

    <!-- dummy for ui -->
    <path :d="path" class="transparent grab" stroke-width="0" />
  </g>
</template>
