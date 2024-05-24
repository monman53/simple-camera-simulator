export const createParams = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        cx: 0,
        cy: 0,
        scale: 0.5,
        lights: [
            { x: -1000, y: 0, color: `hsl(120, 100%, 50%)` }, // green
            // { x: -20, y: 0, color: `hsl(0, 100%, 50%)` }, // green
            // { x: 20, y: 0, color: `hsl(240, 100%, 50%)` }, // green
            // { x: 20, y: 40, color: `hsl(120, 100%, 50%)` }, // green
        ],
        nRaysLog: 6,
        lens: {
            x: 0,
            r: 100,
        },
        style: {
            rLight: 16,
            lightStrokeWidth: 2,
            rayWidth: 4,
        }
    }
}