import { ref, computed } from "vue"

export const createInitialParams = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        cx: 0,
        cy: 0,
        scale: 0.5,
        lights: [
            { x: -1000, y: 0, color: `hsl(120, 100%, 50%)` }, // green
            { x: -20, y: 0, color: `hsl(0, 100%, 50%)` }, // green
            // { x: 20, y: 0, color: `hsl(240, 100%, 50%)` }, // green
            // { x: 20, y: 40, color: `hsl(120, 100%, 50%)` }, // green
        ],
        nRaysLog: 8,
        lens: {
            x: 0,
            r: 100,
        },
        style: {
            // Lights
            rLight: 16,
            lightStrokeWidth: 2,

            // Rays
            rayWidth: 3,
        }
    }
}

export const state = ref(createInitialParams())

export const infR = computed(() => {
    // Screen diagonal length
    const w = state.value.width / state.value.scale;
    const h = state.value.height / state.value.scale;
    let screen = Math.sqrt(w * w + h * h);

    // light to center max distance
    const cx = state.value.cx;
    const cy = state.value.cy;
    let distanceMax = 0;
    for (const light of state.value.lights) {
        const dx = cx - light.x;
        const dy = cy - light.y
        const d = Math.sqrt(dx * dx + dy * dy)
        distanceMax = Math.max(distanceMax, d);
    }
    return (screen + distanceMax) * 3 /* 3 for safety */;
})