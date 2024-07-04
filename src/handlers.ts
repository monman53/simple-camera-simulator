import type { Ref } from "vue";
import { state, lights, releaseAllLenses } from "./globals";
import { Light } from './type'
import { vec, Vec } from './math'

//================================
// SVG handlers
//================================

// Reference to the svg element
let svg: Ref<any>;
export const setSvg = (svg_: Ref<any>) => {
    svg = svg_;
}

// Methods
export const getPositionOnSvg = (e: any) => {
    const rect = svg.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return vec(x, y)
}
export const getPositionOnSvgApp = (e: any) => {
    const m = getPositionOnSvg(e);
    const x = (m.x - state.value.width / 2) / state.value.scale + state.value.c.x;
    const y = (m.y - state.value.height / 2) / state.value.scale + state.value.c.y;
    return vec(x, y)
}
export const getPositionDiffOnSvgApp = (e: any, m0: Vec) => {
    const m = getPositionOnSvg(e);
    const d = m.sub(m0).div(state.value.scale)
    return d
}
export const preventDefaultAndStopPropagation = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
}

// Event handlers
let moveHandler: any = null;
let moveHandlerWithM0: any = null;
let m0: Vec
export const setMoveHandler = (h: any) => {
    moveHandler = h
}
export const setMoveHandlerWithM0 = (h: any, m: Vec) => {
    moveHandlerWithM0 = h
    m0 = m
}
export const svgMoveStartHandler = (e: any) => {
    const m0 = getPositionOnSvg(e);
    const c0 = state.value.c.copy()
    releaseAllLenses()
    moveHandler = (e_: any) => {
        let clientX = e_.clientX
        let clientY = e_.clientY
        if (e_.type == 'touchmove') {
            clientX = e_.touches[0].clientX
            clientY = e_.touches[0].clientY
        }
        const d = getPositionDiffOnSvgApp(e_, m0)
        state.value.c = c0.sub(d)
    }
}
export const svgMoveHandler = (e: any) => {
    e.preventDefault();
    if (moveHandler !== null) {
        preventDefaultAndStopPropagation(e)
        moveHandler(e)
    }
    if (moveHandlerWithM0 !== null) {
        preventDefaultAndStopPropagation(e)
        const d = getPositionDiffOnSvgApp(e, m0)
        moveHandlerWithM0(e, d)
    }
}
export const svgMoveEndHandler = () => {
    moveHandler = null
    moveHandlerWithM0 = null
}
export const svgScaleHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    // Zoom in/out
    const p = getPositionOnSvgApp(e);
    const scaleFactor = 1.2;
    const r = e.deltaY > 0 ? scaleFactor : 1 / scaleFactor;
    state.value.c = state.value.c.add(p.sub(state.value.c).mul(1 - r))
    state.value.scale /= r;
}
export const lightMoveStartHandler = (e: any, idx: number) => {
    preventDefaultAndStopPropagation(e)
    // Last touched light is always front
    const light = lights.value[idx];
    const newLights = lights.value.filter((light, i) => {
        return i !== idx
    })
    newLights.push(light)
    lights.value = newLights

    if (light.type === Light.Point) {
        const m0 = getPositionOnSvg(e);
        const c0 = light.c.copy()
        moveHandler = (e_: any) => {
            const d = getPositionDiffOnSvgApp(e_, m0)
            light.c.x = c0.x + d.x
            light.c.y = c0.y + d.y
        }
    }
    if (light.type === Light.Parallel) {
        const m0 = getPositionOnSvg(e);
        const [s0, t0] = [light.s.copy(), light.t.copy()];
        moveHandler = (e_: any) => {
            const d = getPositionDiffOnSvgApp(e_, m0)
            const sn = s0.add(d)
            const tn = t0.add(d)
            light.s = sn
            light.t = tn
        }
    }
}
export const addLight = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m = getPositionOnSvgApp(e);
    let colors = [state.value.newLightColor]
    if (state.value.newLightColorComposite) {
        const n = state.value.newLightColorCompositeN
        colors = []
        for (let i = 0; i < n; i++) {
            colors.push(360 * i / n)
        }
    }
    if (state.value.newLightType === Light.Point) {
        lights.value.push({ type: Light.Point, c: m, colors })
    }
    if (state.value.newLightType === Light.Parallel) {
        lights.value.push({ type: Light.Parallel, s: vec(m.x, m.y - 25), t: vec(m.x, m.y + 25), colors })
    }
}
export const deleteLight = (e: any, idx: number) => {
    preventDefaultAndStopPropagation(e)
    lights.value.splice(idx, 1)
}
