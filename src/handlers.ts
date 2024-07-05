import type { Ref } from "vue";
import { state, lights } from "./globals";
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
let moveHandlerWithM0: any = null;
let m0: Vec
export const setMoveHandlerWithM0 = (h: any, m: Vec) => {
    moveHandlerWithM0 = h
    m0 = m
}
export const svgMoveHandler = (e: any) => {
    e.preventDefault();
    if (moveHandlerWithM0 !== null) {
        preventDefaultAndStopPropagation(e)
        const d = getPositionDiffOnSvgApp(e, m0)
        moveHandlerWithM0(e, d)
    }
}
export const svgMoveEndHandler = () => {
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
