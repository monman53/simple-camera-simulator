<script lang="ts">

export type LensPlane = {
  x: number,
  r: number,
  h: number,
  paramsA: CauchyParams,
  paramsB: CauchyParams,
}

export class Lens {
  planes: Ref<LensPlane[]>
  aperture: Ref<number>
  h: ComputedRef<number>
  f: ComputedRef<number>
  H: ComputedRef<number>
  xcog: ComputedRef<number>
  front: ComputedRef<number>
  back: ComputedRef<number>
  constructor(planes: LensPlane[], aperture: number) {
    this.planes = ref(planes)
    this.aperture = ref(aperture)
    this.h = computed(() => {
      const hs = this.planes.value.map((p) => p.h)
      return Math.max(...hs)
    })
    this.f = computed(() => {
      return calcLensInfo([this]).f
    })
    this.H = computed(() => {
      return calcLensInfo([this]).H
    })
    this.xcog = computed(()=>{
      return calcLensXCOG(this)
    })
    this.front= computed(()=>{
      return calcLensFront(this)
    })
    this.back= computed(()=>{
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

export const calcLensPlaneEdge = (plane: LensPlane) => {
    const x = plane.x
    const r = plane.r
    const h = plane.h
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
    const hs = lens.planes.value.map(p => p.h)
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
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { calcLensInfo, infR, options } from '../globals'
import { vec, Vec } from '../math'
import WithBackground from './WithBackground.vue'
import CircleUI from './CircleUI.vue'
import Point from './PointItem.vue'
import MoveUI from './MoveUI.vue'
import type { CauchyParams } from '@/collection/lens'

const props = defineProps<{
  lens: Lens,
  selected: boolean,
  fixed: boolean,
}>()

const xm = computed(() => {
  return calcLensXCOG(props.lens)
})

const r = computed(() => {
  return calcLensH(props.lens)
})

const path = computed(() => {
  let d = ""
  // Planes
  const planes = props.lens.planes.value
  for (let i = 0; i < planes.length - 1; i++) {
    const p1 = planes[i] // left
    const p2 = planes[i + 1] //right
    const edge1 = calcLensPlaneEdge(p1)
    const edge2 = calcLensPlaneEdge(p2)
    const absR1 = Math.abs(p1.r)
    const absR2 = Math.abs(p2.r)
    const sweep1 = p1.r > 0 ? 0 : 1
    const sweep2 = p2.r > 0 ? 1 : 0

    // left
    d += `M ${edge1} ${-r.value} `
    d += `L ${edge1} ${-p1.h} `
    if (isFinite(p1.r)) {
      d += `A ${absR1} ${absR1} 0 0 ${sweep1} ${edge1} ${p1.h} `
    } else {
      d += `L ${edge1} ${p1.h} `
    }
    d += `L ${edge1} ${r.value} `

    // right
    d += `L ${edge2} ${r.value} `
    d += `L ${edge2} ${p2.h} `
    if (isFinite(p2.r)) {
      d += `A ${absR2} ${absR2} 0 0 ${sweep2} ${edge2} ${-p2.h} `
    } else {
      d += `L ${edge2} ${-p2.h} `
    }
    d += `L ${edge2} ${-r.value} `

    // Close
    d += `Z `

  }
  return d
})

const paths = computed(() => {
  return props.lens.planes.value.map(p => {
    const absR = Math.abs(p.r)
    const sweep = p.r > 0 ? 0 : 1
    const edge = calcLensPlaneEdge(p)

    let d = ""
    d += `M ${edge} ${-r.value} L ${edge} ${-p.h} `
    if (isFinite(p.r)) {
      d += `A ${absR} ${absR} 0 0 ${sweep} ${edge} ${p.h} `
    } else {
      d += `L ${edge} ${p.h}`
    }
    d += `L ${edge} ${r.value}`
    return d
  })
})

const planeMoveStartHandler = (plane: LensPlane) => {
  return () => {
    const x0 = plane.x;
    return (e: any, d: Vec) => {
      // TODO
      plane.x = x0 + d.x
    }
  }
}

const hChangeStartHandler = (plane: LensPlane) => {
  return () => {
    const h0 = plane.h;
    return (e: any, d: Vec) => {
      if (h0 - d.y > Math.abs(plane.r)) {
        plane.h = Math.abs(plane.r)
      } else {
        plane.h = h0 - d.y
      }
    }
  }
}

const rMoveStartHandler = (plane: LensPlane) => {
  return () => {
    const h0 = plane.h
    const x0 = plane.x
    const edge0 = calcLensPlaneEdge(plane)
    return (e: any, d: Vec) => {
      let xn = x0 + d.x
      const a = xn - edge0
      const rn = (-h0 * h0 - a * a) / (2 * a)
      plane.r = rn
      plane.x = xn
    }
  }
}

const apertureSizeChangeStartHandler = () => {
  const lens = props.lens
  const a0 = props.lens.aperture.value * r.value;
  return (e: any, d: Vec) => {
    const an = (a0 + d.y) / r.value;
    if (an < 0) {
      lens.aperture.value = 0;
    } else if (an > 1) {
      lens.aperture.value = 1;
    } else {
      lens.aperture.value = an;
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
            <circle v-if="isFinite(plane.r)" :cx="plane.x + plane.r" :cy="0" :r="Math.abs(plane.r)" />
            <!-- Infinity curvature -->
            <line v-if="!isFinite(plane.r)" :x1="plane.x" :y1="-infR" :x2="plane.x" :y2="infR" />
          </template>
        </g>
      </WithBackground>
      <!-- Center Point -->
      <template v-for="(plane, idx) of lens.planes.value" :key="idx">
        <Point v-if="isFinite(plane.r)" :c="vec(plane.x + plane.r, 0)" />
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
        <CircleUI :c="vec(calcLensPlaneEdge(plane), -plane.h)" class="vertical-resize" />
      </MoveUI>
    </template>

    <!-- Curvature change UI -->
    <g v-if="!fixed" class="horizontal-resize">
      <template v-for="(plane, idx) of lens.planes.value" :key="idx">
        <MoveUI :handler-creator="rMoveStartHandler(plane)">
          <CircleUI :c="vec(plane.x, 0)" />
        </MoveUI>
      </template>
    </g>

    <!-- Aperture -->
    <g>
      <WithBackground>
        <!-- Lines -->
        <g class="stroke-white normal no-pointer-events">
          <line :x1="xm" :y1="-r" :x2="xm" :y2="-r * lens.aperture.value" />
          <line :x1="xm" :y1="r" :x2="xm" :y2="r * lens.aperture.value" />
        </g>
      </WithBackground>
      <!-- UI -->
      <MoveUI v-if="!fixed" :handler-creator="apertureSizeChangeStartHandler">
        <CircleUI :c="vec(xm, r * lens.aperture.value)" class="vertical-resize" />
      </MoveUI>
    </g>

    <!-- dummy for ui -->
    <path :d="path" class="transparent grab" stroke-width="0" />
  </g>
</template>