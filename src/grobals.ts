import { ref, computed } from "vue"

//================================
// States
//================================

export const createInitialParams = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        cx: 0,
        cy: 0,
        scale: 0.5,
        nRaysLog: 9,
    }
}
export const state = ref(createInitialParams())

//--------------------------------
// Lights
//--------------------------------

export const lights0 = () => {
    return [
        { x: -1000, y: 0, color: `hsl(120, 100%, 50%)` }, // green
        // { x: -100, y: -100, color: `hsl(0, 100%, 50%)` }, // green
        // { x: -200, y: 100, color: `hsl(240, 100%, 50%)` }, // green
        // { x: 20, y: 40, color: `hsl(120, 100%, 50%)` }, // green
    ]
}
export const lights = ref(lights0())

//--------------------------------
// Lens
//--------------------------------

export const lens0 = () => {
    return {
        x: 0,
        r: 100,
        d: 10,
        f: 50,
    }
}
export const lens = ref(lens0())

//--------------------------------
// Style
//--------------------------------

export const style0 = () => {
    return {
        defaultStrokeWidth: 2,

        // Lights
        rLight: 16,

        // Rays
        rayWidth: 2,
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