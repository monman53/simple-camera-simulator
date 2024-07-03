import { cross, crossAngle, dot, fGaussian, intersectionCLNearest, intersectionY, vec, vecRad, type Vec } from "./math";

export const collisionLens = (s: Vec, v: Vec, cx: number, r: number, h: number, ni: number, no: number) => {
    v = v.normalize()
    const pl = intersectionCLNearest(cx, r, s, v)
    if (pl === null) {
        return null
    }
    const lx = Math.sqrt(r * r - h * h)
    const e1 = r > 0 ? vec(-lx, h) : vec(lx, h)
    const e2 = r > 0 ? vec(-lx, -h) : vec(lx, -h)
    const n = vec(pl.p.x - cx, pl.p.y)
    if (cross(n, e1) * cross(n, e2) < 0 && dot(n, e1) > 0 && dot(n, e2) > 0) {
        return {
            p: pl.p,
            d: pl.d,
            vn: () => {
                if (dot(n, v) < 0) {
                    // Outside to inside
                    const phi1 = crossAngle(v, n)
                    const phi2 = Math.asin(Math.sin(phi1) * no / ni)
                    const theta = Math.atan2(n.y, n.x) + phi2 + Math.PI
                    return vecRad(theta)
                } else {
                    // Inside to outside
                    const phi1 = crossAngle(v.minus(), n)
                    const phi2 = Math.asin(Math.sin(phi1) * ni / no)
                    const theta = Math.atan2(n.y, n.x) + phi2
                    return vecRad(theta)
                }
            }
        }
    } else {
        return null
    }
}

export const collisionIdealLens = (s: Vec, v: Vec, x: number, h: number, f: number) => {
    const pl = intersectionY(s, v, x, -h, h)
    if (pl.p === null) {
        return null
    } else {
        return {
            p: pl.p,
            d: pl.d,
            vn: () => {
                const ff = x - s.x > 0 ? f : -f
                const ss = fGaussian(ff, vec(s.x - x, s.y))
                ss.x += x
                ss.inplaceSub(pl.p).inplaceNormalize()
                if (Math.abs(x - s.x) < f) {
                    ss.inplaceMinus()
                }
                if (f < 0) {
                    ss.inplaceMinus()
                }
                return ss
            }
        }
    }
}

export const collisionAperture = (s: Vec, v: Vec, x: number, rMin: number, rMax: number) => {
    const pa = intersectionY(s, v, x, -rMax, rMax)
    if (pa.p !== null) {
        if (pa.p.y < Math.abs(rMin)) {
            return {
                p: pa.p,
                d: pa.d,
            }
        } else {
            return null
        }
    }
}

const collisionAll = (s: Vec, v: Vec) => {

}