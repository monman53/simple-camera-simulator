import type { Ref } from "vue";
import { state, lights, lens, sensor, maxLightX, lensD } from "./globals";
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
const getPositionOnSvg = (e: any) => {
    const rect = svg.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return vec(x, y)
}
const getPositionOnSvgApp = (e: any) => {
    const m = getPositionOnSvg(e);
    const x = (m.x - state.value.width / 2) / state.value.scale + state.value.c.x;
    const y = (m.y - state.value.height / 2) / state.value.scale + state.value.c.y;
    return vec(x, y)
}
const getPositionDiffOnSvgApp = (e: any, m0: Vec) => {
    const m = getPositionOnSvg(e);
    const d = m.sub(m0).div(state.value.scale)
    return d
}
const preventDefaultAndStopPropagation = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
}

// Event handlers
let moveHandler: any = null;
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
    const minLensX = lens.value.x - lensD.value / 2

    if (light.type === Light.Point) {
        const m0 = getPositionOnSvg(e);
        const c0 = light.c.copy()
        moveHandler = (e_: any) => {
            const d = getPositionDiffOnSvgApp(e_, m0)
            if (c0.x + d.x > minLensX) {
                light.c.x = minLensX
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
            if (s0.x >= t0.x && sn.x > minLensX) {
                sn.x = minLensX
                tn.x = minLensX + (t0.x - s0.x)
            } else if (t0.x > s0.x && tn.x > minLensX) {
                sn.x = minLensX + (s0.x - t0.x)
                tn.x = minLensX
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
            if (p0.x + d.x > lens.value.x - lensD.value / 2) {
                p.x = lens.value.x - lensD.value / 2
            } else {
                p.x = p0.x + d.x
            }
            p.y = p0.y + d.y
        }
    }
}
export const cameraMoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const lensX0 = lens.value.x;
    const sensorX0 = sensor.value.x;
    moveHandler = (e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (lensX0 + d.x < maxLightX.value) {
            lens.value.x = maxLightX.value
            sensor.value.x = maxLightX.value + (sensorX0 - lensX0)
        } else {
            lens.value.x = lensX0 + d.x
            sensor.value.x = sensorX0 + d.x
        }
    }
}
export const lensMoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const cx0 = lens.value.x;
    moveHandler = (e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (cx0 + d.x < maxLightX.value + lensD.value / 2) {
            lens.value.x = maxLightX.value + lensD.value / 2
        } else if (sensor.value.x < cx0 + d.x) {
            lens.value.x = sensor.value.x
        } else {
            lens.value.x = cx0 + d.x
        }
    }
}
export const lensSizeChangeStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const r0 = lens.value.r;
    moveHandler = (e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (r0 - d.y < 0.1) {
            lens.value.r = 0.1;
        } else {
            lens.value.r = r0 - d.y;
        }
    }
}
export const focalPointMoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const f0 = lens.value.f;
    moveHandler = (e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (f0 - d.x < lensD.value / 2) {
            lens.value.f = lensD.value / 2
        } else {
            lens.value.f = f0 - d.x
        }
    }
}
export const apertureSizeChangeStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const a0 = lens.value.aperture * lens.value.r;
    moveHandler = (e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        const an = (a0 + d.y) / lens.value.r;
        if (an < 0) {
            lens.value.aperture = 0;
        } else if (an > 1) {
            lens.value.aperture = 1;
        } else {
            lens.value.aperture = an;
        }
    }
}
export const sensorMoveStartHandler = (e: any) => {
    preventDefaultAndStopPropagation(e)
    const m0 = getPositionOnSvg(e);
    const cx0 = sensor.value.x;
    moveHandler = (e_: any) => {
        const d = getPositionDiffOnSvgApp(e_, m0)
        if (cx0 + d.x < lens.value.x) {
            sensor.value.x = lens.value.x
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
