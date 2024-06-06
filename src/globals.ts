import { ref, computed } from "vue"

//================================
// States
//================================

export const createInitialParams = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        cx: -100,
        cy: 0,
        scale: 4,
        nRaysLog: 10,
        newLightColor: 120,
    }
}
export const state = ref(createInitialParams())

//--------------------------------
// Lights
//--------------------------------

export const lights0 = () => {
    // const ret = []
    // const n = 5;
    // const r = 50;
    // for (let i = 0; i < n; i++) {
    //     const theta = Math.PI * i / (n - 1) - Math.PI / 2;
    //     ret.push({ x: -200 + r * Math.cos(theta), y: r * Math.sin(theta), color: 120 });
    // }
    // return ret;
    return [
        { x: -200, y: 20, color: 0 }, // red
        { x: -160, y: 0, color: 120 }, // green
        { x: -120, y: -20, color: 240 }, // blue
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
        aperture: 0.5,
        circleOfConfusion: 1,
    }
}
export const lens = ref(lens0())

//--------------------------------
// Sensor
//--------------------------------

export const sensor0 = () => {
    return {
        x: 80,
        r: 20,
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
// Options
//--------------------------------

export const options0 = () => {
    return {
        lens: true,
        lensIdeal: true,
        lensFocalPoints: false,
        sensor: false,
        sensorPreview: true,
        sensorMemory: false,
        body: false,
        aperture: false,
        grid: false,
        opticalAxis: false,
        curvature: false,
        angleOfView: true,
        circleOfConfusion: true,
    }
}
export const options = ref(options0())

//--------------------------------
// Style
//--------------------------------

export const style0 = () => {
    return {
        rUI: 2,
        // Rays
        rayWidth: 0.2,
        rayIntensity: 0.5,
    }
}
export const style = ref(style0())

//================================
// Computed
//================================

export const lensR = computed(() => {
    return 2 * (lens.value.n - 1) * (2 * lens.value.f)
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
    const cx = state.value.cx;
    const cy = state.value.cy;
    let distanceMax = 0;
    for (const light of lights.value) {
        const dx = cx - light.x;
        const dy = cy - light.y
        const d = Math.sqrt(dx * dx + dy * dy)
        distanceMax = Math.max(distanceMax, d);
    }
    return (screen + distanceMax) * 3 /* 3 for safety */;
})

export const maxLightX = computed(() => {
    let max = -infR.value
    for (const light of lights.value) {
        max = Math.max(max, light.x)
    }
    return max
})