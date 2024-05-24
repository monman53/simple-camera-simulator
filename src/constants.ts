export const createParams = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        cx: 0,
        cy: 0,
        scale: 1,
        lights: [
            { x: 0, y: 0, color: `hsl(120, 100%, 50%)` }, // green
            // { x: -20, y: 0, color: `hsl(120, 100%, 50%)` }, // green
            // { x: 20, y: 0, color: `hsl(120, 100%, 50%)` }, // green
            // { x: 20, y: 40, color: `hsl(120, 100%, 50%)` }, // green
        ],
        nRaysLog: 6,
        style: {
            rLight: 8,
            rayWidth: 2,
        }
    }
}