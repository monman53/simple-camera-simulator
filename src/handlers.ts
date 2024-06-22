import type { Ref } from "vue";
import { state, lights, sensor, minLensX, maxLensX } from "./globals";
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
export const setMoveHandler = (h: any) => {
    moveHandler = h
}
export const svgMoveStartHandler = (e: any) => {
    e.preventDefault();
    const m0 = getPositionOnSvg(e);
    const c0 = state.value.c.copy()
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
}
export const svgMoveEndHandler = () => {
    moveHandler = null;
    // tpCache = [];
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
            if (c0.x + d.x > minLensX.value) {
                light.c.x = minLensX.value
            } else {
                light.c.x = c0.x + d.x
            }
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
            if (s0.x >= t0.x && sn.x > minLensX.value) {
                sn.x = minLensX.value
                tn.x = minLensX.value + (t0.x - s0.x)
            } else if (t0.x > s0.x && tn.x > minLensX.value) {
                sn.x = minLensX.value + (s0.x - t0.x)
                tn.x = minLensX.value
            }
            light.s = sn
            light.t = tn
        }
    }
}
export const parallelLightNodeMoveStartHandler = (e: any, idx: number, which: string) => {
    preventDefaultAndStopPropagation(e)
    // Last touched light is always front
    const light = lights.value[idx];
    const newLights = lights.value.filter((light, i) => {
        return i !== idx
    })
    newLights.push(light)
    lights.value = newLights

    if (light.type === Light.Parallel) {
        const m0 = getPositionOnSvg(e);
        const p0 = which === "s" ? light.s.copy() : light.t.copy()
        const p = which === "s" ? light.s : light.t
        moveHandler = (e_: any) => {
            const d = getPositionDiffOnSvgApp(e_, m0)
            if (p0.x + d.x > minLensX.value) {
                p.x = minLensX.value
            } else {
                p.x = p0.x + d.x
            }
            p.y = p0.y + d.y
        }
    }
}
export const sensorMoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const cx0 = sensor.value.x;
    moveHandler = (e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (cx0 + d.x < maxLensX.value) {
            sensor.value.x = maxLensX.value
        } else {
            sensor.value.x = cx0 + d.x
        }
    }
}
export const sensorSizeChangeStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const r0 = sensor.value.r;
    moveHandler = (e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (r0 - d.y < 0.1) {
            sensor.value.r = 0.1;
        } else {
            sensor.value.r = r0 - d.y;
        }
    }
}
export const addLight = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m = getPositionOnSvgApp(e);
    if (state.value.newLightType === Light.Point) {
        lights.value.push({ type: Light.Point, c: m, color: state.value.newLightColor })
    }
    if (state.value.newLightType === Light.Parallel) {
        lights.value.push({ type: Light.Parallel, s: vec(m.x, m.y - 25), t: vec(m.x, m.y + 25), color: state.value.newLightColor })
    }
}
export const deleteLight = (e: any, idx: number) => {
    preventDefaultAndStopPropagation(e)
    lights.value.splice(idx, 1)
}
