import { ref, computed } from "vue"
import { Vec, vec } from "./math"
import { type Lens, type LensGroup, Light } from "./type"

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
        // { type: Light.Point, c: vec(-200, 20), color: 0 }, // red
        // { type: Light.Point, c: vec(-160, 0), color: 120 }, // green
        // { type: Light.Point, c: vec(-120, -20), color: 240 }, // blue
        { type: Light.Parallel, s: vec(-180, -30), t: vec(-180, 30), color: 120 }, // green
    ]
}
export const lights = ref(lights0())

//--------------------------------
// Items
//--------------------------------

export const defaultConvexLens = (x: number) => {
    const d = 10
    const R = 70
    return { x1: x - d / 2, x2: x + d / 2, R1: R, R2: -R, r: 20, n: 1.5, aperture: 1, selected: false }
}

export const defaultConcaveLens = (x: number) => {
    const R = 30
    return { x1: x - 2, x2: x + 2, R1: -R, R2: R, r: 10, n: 1.5, aperture: 1, selected: false }
}

export const lensGroups0 = (): LensGroup[] => {
    return [
        { lenses: [defaultConvexLens(0)] }
    ]
}
export const lensGroups = ref(lensGroups0())

export const releaseAllLenses = () => {
    for (let i = 0; i < lensGroups.value.length; i++) {
        for (let j = 0; j < lensGroups.value[i].lenses.length; j++) {
            lensGroups.value[i].lenses[j].selected = false
        }
    }
}

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

export const minLensX = computed(() => {
    let minX = infR.value
    for (const lensGroup of lensGroups.value) {
        for (const lens of lensGroup.lenses) {
            const left = Math.min(lens.x1, lens.x1)
            minX = Math.min(minX, left)
        }
    }
    return minX
})

export const maxLensX = computed(() => {
    let maxX = -infR.value
    for (const lensGroup of lensGroups.value) {
        for (const lens of lensGroup.lenses) {
            maxX = Math.max(maxX, lens.x2)
        }
    }
    return maxX
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