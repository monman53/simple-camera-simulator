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
    return [
        { x: -200, y: 100, color: 0 }, // red
        { x: -200, y: 0, color: 120 }, // green
        { x: -200, y: -100, color: 240 }, // blue
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
        d: 6,
        f: 50,
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

//--------------------------------
// Options
//--------------------------------

export const options0 = () => {
    return {
        lens: true,
        lensFocalPoints: false,
        sensor: true,
        sensorPreview: true,
        sensorMemory: false,
        body:false,
    }
}
export const options = ref(options0())

//--------------------------------
// Style
//--------------------------------

export const style0 = () => {
    return {
        // Lights
        rLight: 2,
        // Rays
        rayWidth: 0.2,
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
    for(const light of lights.value) {
        max = Math.max(max, light.x)
    }
    return max
})