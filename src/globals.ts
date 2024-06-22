import { ref, computed } from "vue"
import { Vec, vec, calcLensR } from "./math"
import { Light } from "./type"

//================================
// States
//================================

export const createInitialParams = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        c: vec(-100, 0),
        scale: 4,
        nRaysLog: 10,
        newLightColor: 120,
        newLightType: Light.Point,
    }
}
export const state = ref(createInitialParams())

//--------------------------------
// Lights
//--------------------------------

export const lights0 = ():
    (
        { type: Light.Point, c: Vec, color: number } |
        { type: Light.Parallel, s: Vec, t: Vec, color: number }
    )[] => {
    return [
        { type: Light.Point, c: vec(-200, 20), color: 0 }, // red
        { type: Light.Point, c: vec(-160, 0), color: 120 }, // green
        { type: Light.Point, c: vec(-120, -20), color: 240 }, // blue
        { type: Light.Parallel, s: vec(-180, -30), t: vec(-180, 30), color: 120 }, // green
    ]
}
export const lights = ref(lights0())

//--------------------------------
// Lens
//--------------------------------

export const lens0 = () => {
    return {
        x: 0,
        r: 20,
        n: 1.5,
        f: 50,
        aperture: 1,
    }
}
export const lens = ref(lens0())

//--------------------------------
// Items
//--------------------------------

export const items0 = () => {
    return [
        { x: -50, r: 20, f: 50, n: 1.5, aperture: 1 },
        { x: -100, r: 12, f: 100, n: 1.5, aperture: 1 },
    ]
}
export const items = ref(items0())

//--------------------------------
// Sensor
//--------------------------------

export const sensor0 = () => {
    return {
        x: 80,
        r: 24 / 2, // Full frame
        circleOfConfusion: 1,
    }
}
export const sensor = ref(sensor0())
export const sensorData = ref()
export let memoryCanvasCtx: CanvasRenderingContext2D;
export const setMemoryCanvasCtx = (ctx: any) => {
    memoryCanvasCtx = ctx
}

//--------------------------------
// Field
//--------------------------------

export const field0 = () => {
    return {
        gridInterval: 10,
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
        half: true,
    }
}
export const appleProps = ref(appleProps0())

export const apple = computed(() => {
    const cx = appleProps.value.c.x
    const cy = appleProps.value.c.y
    const r = appleProps.value.r

    const lights = []

    // Main
    {
        const n = appleProps.value.n
        for (let i = 0; i < n; i++) {
            const theta = i / n * 2 * Math.PI
            const x = cx + r * Math.cos(theta)
            const y = cy + r * Math.sin(theta)
            const c = vec(x, y)
            const color = 0 // red
            if (x >= cx) {
                lights.push({ type: Light.Point, c, color })
            }
        }
    }

    // Leaf
    {
        const n = Math.floor(appleProps.value.n * 2 / 3)
        for (let i = 0; i < n; i++) {
            const theta = i / n * 2 * Math.PI
            const rLeaf = 0.4 * r
            const x = cx + rLeaf * Math.cos(theta)
            const y = cy - (r + rLeaf) + rLeaf * Math.sin(theta)
            const c = vec(x, y)
            const color = 120 // green
            if (x >= cx) {
                lights.push({ type: Light.Point, c, color })
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
        lensIdeal: true,
        lensFocalPoints: false,
        lensDoubleFocalPoints: false,
        hyperfocalPoint: false,
        sensor: true,
        sensorPreview: true,
        sensorMemory: false,
        body: false,
        aperture: true,
        grid: false,
        opticalAxis: false,
        curvature: false,
        depthOfField: false,
        angleOfView: false,
        circleOfConfusion: false,
        apple: false,
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
        lineBgColor: "#000a",
    }
}
export const style = ref(style0())

//================================
// Computed
//================================

export const lensR = computed(() => {
    return calcLensR(lens.value.n, lens.value.f, lens.value.r)
    // return 2 * (lens.value.n - 1) * (2 * lens.value.f)
})

export const lensD = computed(() => {
    const R = lensR.value
    const r = lens.value.r
    return 2 * (R - Math.sqrt(R * R - r * r))
})

export const infR = computed(() => {
    // Screen diagonal length
    const w = state.value.width / state.value.scale;
    const h = state.value.height / state.value.scale;
    let screen = Math.sqrt(w * w + h * h);

    // light to center max distance
    const c = state.value.c;
    let distanceMax = 0;
    for (const light of lights.value) {
        if (light.type === Light.Point) {
            const d = c.sub(light.c)
            distanceMax = Math.max(distanceMax, d.length());
        }
        if (light.type === Light.Parallel) {
            const ds = c.sub(light.s)
            const dt = c.sub(light.s)
            const d = Math.max(ds.length(), dt.length())
            distanceMax = Math.max(distanceMax, d);
        }
    }
    return (screen + distanceMax) * 3 /* 3 for safety */;
})

export const fNumber = computed(() => {
    if (options.value.aperture) {
        return lens.value.f / (2 * lens.value.r * lens.value.aperture)
    } else {
        return lens.value.f / (2 * lens.value.r)
    }
})

export const maxLightX = computed(() => {
    let max = -infR.value
    for (const light of lights.value) {
        if (light.type === Light.Point) {
            max = Math.max(max, light.c.x)
        }
        if (light.type === Light.Parallel) {
            max = Math.max(max, light.s.x)
            max = Math.max(max, light.t.x)
        }
    }
    return max
})

export const rUI = computed(() => {
    const scale = 1 / state.value.scale
    return 8 * scale;
})