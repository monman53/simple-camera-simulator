import { ref, computed, watch, shallowRef } from 'vue'
import { vec, calcDispersion } from './math'
import { wavelengthCollection } from './collection/color'
import { createLensGroup, exampleConvexLens, exampleTestLens } from './collection/lens'
import { rayTrace, type Ray, type Segment } from './rayTrace'
import { LensGroup } from './SVG/LensGroupItem.vue'
import { Lens, LensPlane } from './SVG/LensItem.vue'
import type { Body } from './SVG/BodyItem.vue'
import type { Sensor } from './SVG/SensorItem.vue'
import { LightParallel, LightPoint, type LightType } from './SVG/LightItem.vue'
import type { Aperture } from './SVG/ApertureItem.vue'

//================================
// States
//================================

export const createInitialParams = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    c: vec(-100, 0),
    scale: 4,
    newLightWavelength: wavelengthCollection.green,
    newLightColorComposite: false,
    newLightType: 'Point',
    pointerPos: vec(0, 0)
  }
}
export const state = ref(createInitialParams())

//--------------------------------
// Lights
//--------------------------------

export const lights0 = (): LightType[] => {
  return [
    // { type: Light.Point, c: vec(-200, 20), color: 0 }, // red
    // { type: Light.Point, c: vec(-160, 0), color: 120 }, // green
    // { type: Light.Point, c: vec(-120, -20), color: 240 }, // blue
    // { type: Light.White, c: vec(-200, -18) }, // white
    new LightParallel(vec(-180, -30), vec(-180, 30), false, wavelengthCollection.yellow)
  ]
}
export const lights = shallowRef(lights0())

//--------------------------------
// Lenses
//--------------------------------

export const lensGroups0 = (): LensGroup[] => {
  return createLensGroup(exampleConvexLens)
}
export const lensGroups = shallowRef(lensGroups0())

const lensSort = (lenses: Lens[]) => {
  lenses.sort((a, b) => {
    if (options.value.lensIdeal) {
      return a.xcog.value - b.xcog.value
    } else {
      return a.planes.value[0].x.value - b.planes.value[0].x.value
    }
  })
}

export const lensesSorted = computed(() => {
  const res = lensGroups.value
    .filter((g) => g.enabled)
    .reduce((acc: Lens[], cur: LensGroup) => {
      return acc.concat(cur.lenses.value)
    }, [])
  lensSort(res)
  return res
})

export const releaseAllLenses = () => {
  for (const lensGroup of lensGroups.value) {
    lensGroup.selected.value = false
  }
}

//--------------------------------
// Aperture
//--------------------------------

export const aperture0 = () => {
  return {
    x: 40,
    r: 10
  }
}
export const aperture = ref(aperture0())

//--------------------------------
// Sensor
//--------------------------------

export const sensor0 = () => {
  return {
    s: vec(80, -12),
    t: vec(80, 12),
    circleOfConfusion: 1,
    selected: false
  }
}
export const sensor = ref(sensor0())
export const sensorData = ref()
export let memoryCanvasCtx: CanvasRenderingContext2D
export const setMemoryCanvasCtx = (ctx: any) => {
  memoryCanvasCtx = ctx
}

//--------------------------------
// Field
//--------------------------------

export const field0 = () => {
  return {
    gridInterval: 10
  }
}
export const field = ref(field0())

//--------------------------------
// Apple
//--------------------------------

export const appleProps0 = () => {
  return {
    c: vec(-200, 0),
    r: 20,
    n: 24,
    half: true
  }
}
export const appleProps = ref(appleProps0())

export const apple = computed(() => {
  const cx = appleProps.value.c.x
  const cy = appleProps.value.c.y
  const r = appleProps.value.r

  const lights: LightPoint[] = []

  // Main
  {
    const n = appleProps.value.n
    for (let i = 0; i < n; i++) {
      const theta = (i / n) * 2 * Math.PI
      const x = cx + r * Math.cos(theta)
      const y = cy + r * Math.sin(theta)
      const c = vec(x, y)
      if (x >= cx) {
        lights.push(new LightPoint(c, false, wavelengthCollection.red))
      }
    }
  }

  // Leaf
  {
    const n = Math.floor((appleProps.value.n * 2) / 3)
    for (let i = 0; i < n; i++) {
      const theta = (i / n) * 2 * Math.PI
      const rLeaf = 0.4 * r
      const x = cx + rLeaf * Math.cos(theta)
      const y = cy - (r + rLeaf) + rLeaf * Math.sin(theta)
      const c = vec(x, y)
      if (x >= cx) {
        lights.push(new LightPoint(c, false, wavelengthCollection.green))
      }
    }
  }
  return lights
})

//--------------------------------
// Options
//--------------------------------

export const options0 = () => {
  return {
    advanced: false,
    lens: true,
    lensIdeal: false,
    lensFocalPoints: false,
    lensDoubleFocalPoints: false,
    hyperfocalPoint: false,
    sensor: true,
    sensorPreview: true,
    sensorMemory: false,
    body: true,
    aperture: false,
    grid: false,
    opticalAxis: false,
    curvature: false,
    depthOfField: false,
    angleOfView: false,
    circleOfConfusion: false,
    apple: false,
    wavelength: false,
    sensorFreeMove: true,
    pointerPosition: true
  }
}
export const options = ref(options0())

//--------------------------------
// Style
//--------------------------------

export const style0 = () => {
  return {
    // Rays
    rayWidth: 0.2,
    rayIntensity: 0.5,
    // UI
    widthUI: 1.0,
    lineBgColor: '#000a',
    bodyPadding: 4
  }
}
export const style = ref(style0())

//================================
// Computed
//================================

export const infR = computed(() => {
  // Screen diagonal length
  const w = state.value.width / state.value.scale
  const h = state.value.height / state.value.scale
  const screen = Math.sqrt(w * w + h * h)

  // light to center max distance
  const c = vec((sensor.value.s.x + sensor.value.t.x) / 2, 0)
  let distanceMax = 0
  for (const light of lights.value) {
    if (light instanceof LightPoint) {
      const d = c.sub(light.c.value)
      distanceMax = Math.max(distanceMax, d.length())
    }
    if (light instanceof LightParallel) {
      const ds = c.sub(light.s.value)
      const dt = c.sub(light.t.value)
      const d = Math.max(ds.length(), dt.length())
      distanceMax = Math.max(distanceMax, d)
    }
  }
  return (screen + distanceMax) * 3 /* 3 for safety */
})

export const rUI = computed(() => {
  const scale = 1 / state.value.scale
  return 8 * scale
})

export const calcBody = (lenses: Lens[], apertures: Aperture[], sensors: Sensor[]): Body => {
  const padding = style.value.bodyPadding

  // Radius
  let r
  {
    const rs: number[] = []
    rs.push(
      ...lenses.map((lens) => {
        return lens.h.value + padding
      })
    )
    rs.push(...apertures.map((a) => a.r))
    rs.push(
      ...sensors.map((sensor) => {
        const r = Math.max(Math.abs(sensor.s.y), Math.abs(sensor.t.y))
        return r + padding
      })
    )
    r = Math.max(...rs)
  }

  // Front
  let front
  {
    const fronts: number[] = []
    fronts.push(
      ...lenses.map((lens) => {
        if (options.value.lensIdeal) {
          return lens.xcog.value
        } else {
          return lens.front.value
        }
      })
    )
    fronts.push(...apertures.map((a) => a.x))
    front = Math.min(...fronts)
  }

  // Back
  let back
  {
    const backs: number[] = []
    backs.push(
      ...sensors.map((sensor) => {
        return Math.max(sensor.s.x, sensor.t.x) + padding
      })
    )
    backs.push(
      ...lenses.map((lens) => {
        return lens.front.value
      })
    )
    backs.push(...apertures.map((a) => a.x + padding))
    back = Math.max(...backs)
  }

  return {
    r,
    front,
    back
  }
}

export const body = computed(() => {
  let lenses: Lens[] = []
  if (options.value.lens) {
    lenses = lensesSorted.value
  }

  let apertures: Aperture[] = []
  if (options.value.aperture) {
    apertures = [aperture.value]
  }

  let sensors: Sensor[] = []
  if (options.value.sensor) {
    sensors = [sensor.value]
  }

  return calcBody(lenses, apertures, sensors)
})

export const calcLensInfo = (lenses: Lens[]) => {
  // TODO: This is not good
  // Infinity loop may occur since calcLensInfo is used in lenSort()
  // Skip for single element
  if (lenses.length > 0) {
    lensSort(lenses)
  }
  const ll: { d: number; r: number; na: number; nb: number }[] = []
  lenses.forEach((lens, idx) => {
    lens.planes.value.forEach((p, j) => {
      let d = 0
      if (options.value.lensIdeal) {
        if (j === lens.planes.value.length - 1) {
          if (idx !== lenses.length - 1) {
            d = lenses[idx + 1].xcog.value - lenses[idx].xcog.value
          }
        }
      } else {
        if (j === lens.planes.value.length - 1) {
          if (idx !== lenses.length - 1) {
            d = lenses[idx + 1].planes.value[0].x.value - p.x.value
          }
        } else {
          d = lens.planes.value[j + 1].x.value - p.x.value
        }
      }

      ll.push({
        r: p.r.value,
        d,
        na: calcDispersion(wavelengthCollection.d, p.paramsA.value),
        nb: calcDispersion(wavelengthCollection.d, p.paramsB.value)
      })
    })
  })

  const ls: number[] = []
  const lss: number[] = []
  let f = Infinity
  ll.forEach((l, i) => {
    if (i === 0) {
      ls.push(Infinity)
      lss.push(1 / ((1 / l.r) * (1 - l.na / l.nb)))
      f = lss[i]
    } else {
      ls.push(lss[i - 1] - ll[i - 1].d)
      lss.push(1 / (l.na / l.nb / ls[i] + (1 / l.r) * (1 - l.na / l.nb)))
      if (isFinite(f)) {
        f *= lss[i] / ls[i]
      } else {
        f = lss[i]
      }
    }
  })
  let H = 0
  if (lenses.length > 0) {
    if (options.value.lensIdeal) {
      H = lenses[lenses.length - 1].xcog.value + lss[lss.length - 1] - f
    } else {
      H = lenses[lenses.length - 1].xcog.value + lss[lss.length - 1] - f
    }
  }
  return { f, H }
}

export const globalLensInfos = computed(() => {
  return lensesSorted.value.map((lens) => {
    return calcLensInfo([lens])
  })
})

const calcLensRe = (lenses: Lens[], apertures: Aperture[], sensors: Sensor[]) => {
  // Binary search for entrance pupil radius

  // Setup
  let ok = 0
  let ng = Infinity
  let minX = Infinity
  let nPlanes = 0
  lenses.forEach((lens) => {
    lens.planes.value.forEach((p) => {
      if (p.x.value < minX) {
        minX = p.x.value
        ng = p.h.value
      }
    })
    nPlanes += lens.planes.value.length
  })
  apertures.forEach((aperture) => {
    if (aperture.x < minX) {
      minX = aperture.x
      ng = aperture.r
    }
  })
  const body = calcBody(lenses, apertures, sensors)
  let pathTop: Segment[] = []
  let pathBottom: Segment[] = []

  // Binary search
  if (isFinite(ng)) {
    while (ng - ok > 1e-8) {
      const mid = (ok + ng) / 2
      const padding = 10
      const rays: Ray[] = [
        { s: vec(minX - padding, mid), v: vec(1, 0), wavelength: wavelengthCollection.d, idx: 0 },
        { s: vec(minX - padding, -mid), v: vec(1, 0), wavelength: wavelengthCollection.d, idx: 1 }
      ]
      const result = rayTrace(rays, lenses, apertures, sensors, null, body.r)
      const nTop = result[0].length
      const nBottom = result[0].length
      if (
        nTop === nPlanes + 1 &&
        !result[0][nTop - 1].isAperture &&
        nBottom === nPlanes + 1 &&
        !result[1][nBottom - 1].isAperture
      ) {
        ok = mid
        pathTop = result[0]
        pathBottom = result[1]
      } else {
        ng = mid
      }
    }
  }

  const re = ok
  return { re, H: calcLensInfo(lenses).H, pathTop, pathBottom }
}

export const globalLensRe = computed(() => {
  const fwdApertures: Aperture[] = []
  const bwdApertures: Aperture[] = []
  if (options.value.aperture) {
    fwdApertures.push({ x: aperture.value.x, r: aperture.value.r })
    bwdApertures.push({ x: -aperture.value.x, r: aperture.value.r })
  }
  const fwdLenses: Lens[] = lensesSorted.value.map((lens) => {
    return new Lens(
      lens.planes.value.map((p) => {
        return new LensPlane(p.x.value, p.r.value, p.h.value, p.paramsA.value, p.paramsB.value)
      }),
      lens.aperture.value
    )
  })
  const bwdLenses: Lens[] = lensesSorted.value.map((lens) => {
    return new Lens(
      lens.planes.value
        .map((p) => {
          return new LensPlane(-p.x.value, -p.r.value, p.h.value, p.paramsB.value, p.paramsA.value)
        })
        .sort((a, b) => a.x.value - b.x.value),
      lens.aperture.value
    )
  })
  const forward = calcLensRe(fwdLenses, fwdApertures, [])
  const backward = calcLensRe(bwdLenses, bwdApertures, [])
  backward.H *= -1
  return { forward, backward }
})

export const globalLensInfo = computed(() => {
  return calcLensInfo(lensesSorted.value)
})

export const lensExist = computed(() => {
  return lensesSorted.value.length > 0
})

//================================
// Simple test
//================================

const test = () => {
  const lenses = createLensGroup(exampleTestLens)[0].lenses
  const info = calcLensInfo(lenses.value)
  console.log(info.f, 99.78672652)
}

watch(
  [options],
  () => {
    test()
  },
  { deep: true }
)
