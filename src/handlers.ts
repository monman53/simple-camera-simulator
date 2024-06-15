import type { Ref } from "vue";
import { state, lights, lens, sensor, maxLightX, lensD } from "./globals";
import { Light } from './type'

//================================
// SVG handlers
//================================

// Reference to the svg element
// let svg: Ref<any>;
let svg: Ref<any>;
export const setSvg = (svg_: Ref<any>) => {
    svg = svg_;
}

// Methods
const getPositionOnSvg = (clientX: number, clientY: number) => {
    const rect = svg.value.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    return [x, y]
}
const getPositionOnSvgApp = (clientX: number, clientY: number) => {
    const [mx, my] = getPositionOnSvg(clientX, clientY);
    const x = (mx - state.value.width / 2) / state.value.scale + state.value.cx;
    const y = (my - state.value.height / 2) / state.value.scale + state.value.cy;
    return [x, y]
}

// Event handlers
let moveHandler: any = null;
// let tpCache = [];
// let cx0, cy0;
// let x0_, y0_;
// let scale0;
export const svgMoveStartHandler = (e: any) => {
    e.preventDefault();
    // if (e.touches.length === 1) {
    //   tpCache = [e.touches[0]];
    //   cx0 = svg.cx;
    //   cy0 = svg.cy;
    //   scale0 = svg.scale;
    // }
    // if (e.touches.length === 2) {
    //   tpCache = [e.touches[0], e.touches[1]];
    //   cx0 = svg.cx;
    //   cy0 = svg.cy;
    //   [x0_, y0_] = getPositionOnSvgApp((e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2)
    //   scale0 = svg.scale;
    // }
    const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
    const [cx0, cy0] = [state.value.cx, state.value.cy];
    const handler = (e_: any) => {
        e_.preventDefault();
        let clientX = e_.clientX
        let clientY = e_.clientY
        if (e_.type == 'touchmove') {
            clientX = e_.touches[0].clientX
            clientY = e_.touches[0].clientY
        }
        const [x, y] = getPositionOnSvg(clientX, clientY);
        const dx = (x - x0) / state.value.scale
        const dy = (y - y0) / state.value.scale
        state.value.cx = cx0 - dx
        state.value.cy = cy0 - dy
    }
    moveHandler = handler;
}
export const svgMoveHandler = (e: any) => {
    e.preventDefault();

    // if (e.targetTouches.length === 1) {
    //   const cogX0 = tpCache[0].clientX;
    //   const cogY0 = tpCache[0].clientY;
    //   const [x0, y0] = getPositionOnSvg(cogX0, cogY0);

    //   const cogX = e.touches[0].clientX;
    //   const cogY = e.touches[0].clientY;

    //   const [x, y] = getPositionOnSvg(cogX, cogY);
    //   const dx = (x - x0) / svg.scale
    //   const dy = (y - y0) / svg.scale
    //   svg.cx = cx0 - dx
    //   svg.cy = cy0 - dy
    // }
    // if (e.touches.length === 2) {

    //   const cogX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    //   const cogY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    //   const [x, y] = getPositionOnSvg(cogX, cogY);

    //   const l0 = Math.sqrt(Math.pow(tpCache[0].clientX - tpCache[1].clientX, 2) + Math.pow(tpCache[0].clientY - tpCache[1].clientY, 2));
    //   const l = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));

    //   svg.scale = scale0 * (l / l0)
    //   svg.cx = x0_ - (x - svg.width / 2) / svg.scale;
    //   svg.cy = y0_ - (y - svg.height / 2) / svg.scale;
    // }

    if (moveHandler !== null) {
        moveHandler(e)
    }
}
export const svgMoveEndHandler = () => {
    moveHandler = null;
    // tpCache = [];
}
export const svgScaleHandler = (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    // Zoom in/out
    const [x, y] = getPositionOnSvgApp(e.clientX, e.clientY);
    const scaleFactor = 1.2;
    const r = e.deltaY > 0 ? 1.2 : 1 / 1.2;
    state.value.cx = state.value.cx + (x - state.value.cx) * (1 - r);
    state.value.cy = state.value.cy + (y - state.value.cy) * (1 - r);
    state.value.scale /= r;
}
export const lightMoveStartHandler = (e: any, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    // Last touched light is always front
    const light = lights.value[idx];
    const newLights = lights.value.filter((light, i) => {
        return i !== idx
    })
    newLights.push(light)
    lights.value = newLights

    const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
    const [cx0, cy0] = [light.x, light.y];
    const handler = (e_: any) => {
        e_.preventDefault();
        e_.stopPropagation();
        const [x, y] = getPositionOnSvg(e_.clientX, e_.clientY);
        const dx = (x - x0) / state.value.scale
        const dy = (y - y0) / state.value.scale
        if (cx0 + dx > lens.value.x - lensD.value / 2) {
            light.x = lens.value.x - lensD.value / 2
        } else {
            light.x = cx0 + dx
        }
        light.y = cy0 + dy
    }
    moveHandler = handler;
}
export const cameraMoveStartHandler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
    const lensX0 = lens.value.x;
    const sensorX0 = sensor.value.x;
    const handler = (e_: any) => {
        e_.preventDefault();
        e_.stopPropagation();
        const [x, y] = getPositionOnSvg(e_.clientX, e_.clientY);
        const dx = (x - x0) / state.value.scale
        if (lensX0 + dx < maxLightX.value) {
            lens.value.x = maxLightX.value
            sensor.value.x = maxLightX.value + (sensorX0 - lensX0)
        } else {
            lens.value.x = lensX0 + dx
            sensor.value.x = sensorX0 + dx
        }
    }
    moveHandler = handler;
}
export const lensMoveStartHandler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
    const cx0 = lens.value.x;
    const handler = (e_: any) => {
        e_.preventDefault();
        e_.stopPropagation();
        const [x, y] = getPositionOnSvg(e_.clientX, e_.clientY);
        const dx = (x - x0) / state.value.scale
        if (cx0 + dx < maxLightX.value + lensD.value / 2) {
            lens.value.x = maxLightX.value + lensD.value / 2
        } else if (sensor.value.x < cx0 + dx) {
            lens.value.x = sensor.value.x
        } else {
            lens.value.x = cx0 + dx
        }
    }
    moveHandler = handler;
}
export const lensSizeChangeStartHandler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
    const r0 = lens.value.r;
    const handler = (e_: any) => {
        e_.preventDefault();
        e_.stopPropagation();
        const [x, y] = getPositionOnSvg(e_.clientX, e_.clientY);
        const dy = (y - y0) / state.value.scale
        if (r0 - dy < 0.1) {
            lens.value.r = 0.1;
        } else {
            lens.value.r = r0 - dy;
        }
    }
    moveHandler = handler;
}
export const focalPointMoveStartHandler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
    const f0 = lens.value.f;
    const handler = (e_: any) => {
        e_.preventDefault();
        e_.stopPropagation();
        const [x, y] = getPositionOnSvg(e_.clientX, e_.clientY);
        const dx = (x - x0) / state.value.scale
        if (f0 - dx < lensD.value / 2) {
            lens.value.f = lensD.value / 2
        } else {
            lens.value.f = f0 - dx
        }
    }
    moveHandler = handler;
}
export const apertureSizeChangeStartHandler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
    const a0 = lens.value.aperture * lens.value.r;
    const handler = (e_: any) => {
        e_.preventDefault();
        e_.stopPropagation();
        const [x, y] = getPositionOnSvg(e_.clientX, e_.clientY);
        const dy = (y - y0) / state.value.scale
        const an = (a0 + dy) / lens.value.r;
        if (an < 0) {
            lens.value.aperture = 0;
        } else if (an > 1) {
            lens.value.aperture = 1;
        } else {
            lens.value.aperture = an;
        }
    }
    moveHandler = handler;
}
export const sensorMoveStartHandler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
    const cx0 = sensor.value.x;
    const handler = (e_: any) => {
        e_.preventDefault();
        e_.stopPropagation();
        const [x, y] = getPositionOnSvg(e_.clientX, e_.clientY);
        const dx = (x - x0) / state.value.scale
        if (cx0 + dx < lens.value.x) {
            sensor.value.x = lens.value.x
        } else {
            sensor.value.x = cx0 + dx
        }
    }
    moveHandler = handler;
}
export const sensorSizeChangeStartHandler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const [x0, y0] = getPositionOnSvg(e.clientX, e.clientY);
    const r0 = sensor.value.r;
    const handler = (e_: any) => {
        e_.preventDefault();
        e_.stopPropagation();
        const [x, y] = getPositionOnSvg(e_.clientX, e_.clientY);
        const dy = (y - y0) / state.value.scale
        if (r0 - dy < 0.1) {
            sensor.value.r = 0.1;
        } else {
            sensor.value.r = r0 - dy;
        }
    }
    moveHandler = handler;
}
export const addLight = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const [x, y] = getPositionOnSvgApp(e.clientX, e.clientY);
    lights.value.push({ type: Light.Point, x: x, y: y, color: state.value.newLightColor })
}
export const deleteLight = (e: any, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    lights.value.splice(idx, 1)
}
