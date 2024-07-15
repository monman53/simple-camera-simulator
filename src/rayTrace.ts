import type { CauchyParams } from "./collection/lens";
import { calcLensInfo, infR, options } from "./globals";
import { calcDispersion, calcLensBack, calcLensFront, calcLensPlaneEdge, calcLensXCOG, crossAngle, dot, eps, fGaussian, intersectionCL, intersectionLS, intersectionX, intersectionY, vec, vecRad, type Vec } from "./math";
import type { Lens } from "./SVG/Lens.vue";
import type { Aperture, Body, Ray, Sensor } from "./type";

type CollisionResult = ({ p: Vec, d: number, isSensor?: boolean, isAperture?: boolean, isEnd?: boolean, vn?: () => Vec } | null)

const collisionLens = (rays: Ray[], x: number, r: number, h: number, paramsI: CauchyParams, paramsO: CauchyParams): CollisionResult[] => {
    return rays.map(ray => {
        const ni = calcDispersion(ray.wavelength, paramsI)
        const no = calcDispersion(ray.wavelength, paramsO)
        let v = ray.v
        let s = ray.s
        v = v.normalize()
        if (isFinite(r)) {
            const cx = x + r
            const pls = intersectionCL(cx, r, s, v)
            if (pls.length === 0) {
                return null
            }
            for (const pl of pls) {
                // TODO: Find better condition
                const collision = (r > 0 ? pl.p.x < cx : pl.p.x > cx) && Math.abs(pl.p.y) < h
                if (collision) {
                    return {
                        p: pl.p,
                        d: pl.d,
                        vn: () => {
                            const n = vec(pl.p.x - cx, pl.p.y)
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
                }
            }
        } else {
            const pl = intersectionY(s, v, x, -h, h)
            if (pl.p !== null) {
                return {
                    p: pl.p,
                    d: pl.d,
                    vn: () => {
                        // const n = vec(Infinity, 0)
                        const n = vec(-Math.sign(r), 0)
                        if (dot(n, v) < 0) {
                            // Outside to inside
                            const phi1 = crossAngle(v, n)
                            let theta = Math.asin(Math.sin(phi1) * no / ni) + Math.PI
                            if (r === Infinity) {
                                theta += Math.PI
                            }
                            return vecRad(theta)
                        } else {
                            // Inside to outside
                            const phi1 = crossAngle(v.minus(), n)
                            let theta = Math.asin(Math.sin(phi1) * ni / no)
                            if (r === Infinity) {
                                theta += Math.PI
                            }
                            return vecRad(theta)
                        }
                    }
                }
            }
        }
        return null
    })
}

const collisionIdealLens = (rays: Ray[], x: number, h: number, f: number): CollisionResult[] => {
    return rays.map(ray => {
        let v = ray.v
        let s = ray.s
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
    })
}

const collisionAperture = (rays: Ray[], x: number, rMin: number, rMax: number): CollisionResult[] => {
    return rays.map(ray => {
        let v = ray.v
        let s = ray.s
        const pa = intersectionY(s, v, x, -rMax, rMax)
        if (pa.p !== null) {
            if (Math.abs(pa.p.y) > Math.abs(rMin)) {
                return {
                    p: pa.p,
                    d: pa.d,
                    isAperture: true,
                }
            }
        }
        return null
    })
}

const collisionSensor = (rays: Ray[], sensor: Sensor): CollisionResult[] => {
    return rays.map(ray => {
        let v = ray.v
        let s = ray.s
        const ps = intersectionLS(s, v, sensor.s, sensor.t)
        if (ps !== null && dot(ps.sub(s), v) > 0) {
            return {
                p: ps,
                d: ps.sub(s).length(),
                isSensor: true,
            }
        } else {
            return null
        }
    })
}

const collisionX = (rays: Ray[], y: number, xMin: number, xMax: number): CollisionResult[] => {
    return rays.map(ray => {
        let v = ray.v
        let s = ray.s
        const ps = intersectionX(s, v, y, xMin, xMax)
        if (ps.p !== null) {
            return {
                p: ps.p,
                d: ps.d,
                isEnd: true,
            }
        }
        return null
    })
}

const collisionY = (rays: Ray[], x: number, yMin: number, yMax: number): CollisionResult[] => {
    return rays.map(ray => {
        let v = ray.v
        let s = ray.s
        const ps = intersectionY(s, v, x, yMin, yMax)
        if (ps.p !== null) {
            return {
                p: ps.p,
                d: ps.d,
                isEnd: true,
            }
        }
        return null
    })
}

const collisionAll = (rays: Ray[], lenses: Lens[], apertures: Aperture[], sensors: Sensor[], body: Body | null, bodyR: number): CollisionResult[] => {
    // Closest collision
    let pMins: CollisionResult[] = rays.map(ray => {
        return null
    })

    const updateMin = (ps: CollisionResult[]) => {
        ps.forEach((p, i) => {
            if (p === null) {
                return
            }
            if (p.d <= eps) {
                // Ray-tracing technique
                return
            }
            const pMin = pMins[i]
            if (pMin === null) {
                pMins[i] = p
                return
            }
            if (p.d < pMin.d) {
                pMins[i] = p
            }
            return
        })
    }

    //--------------------------------
    // Collisions
    //--------------------------------

    // Body outline
    if (body !== null) {
        updateMin(collisionX(rays, -body.r, body.front, body.back))
        updateMin(collisionX(rays, body.r, body.front, body.back))
        updateMin(collisionY(rays, body.back, -body.r, body.r))
    }

    // Around lenses
    lenses.forEach(lens => {
        // Lens
        const h = lens.h.value
        const f = calcLensInfo([lens]).f
        const xm = calcLensXCOG(lens)
        const front = calcLensFront(lens)
        const back = calcLensBack(lens)

        // Lens surface
        if (options.value.lensIdeal) {
            updateMin(collisionIdealLens(rays, xm, h * lens.aperture.value, f))
        } else {
            lens.planes.value.forEach((p, j) => {
                const paramsI = p.r > 0 ? p.paramsB : p.paramsA
                const paramsO = p.r > 0 ? p.paramsA : p.paramsB
                // Plane
                updateMin(collisionLens(rays, p.x, p.r, p.h, paramsI, paramsO))

                // Plane outside
                const edge = calcLensPlaneEdge(p)
                updateMin(collisionAperture(rays, edge, p.h, h))
            })
        }

        // Lens aperture
        updateMin(collisionAperture(rays, xm, h * lens.aperture.value, h))

        // Lens to body
        if (body !== null) {
            const x = options.value.lensIdeal ? xm : front
            updateMin(collisionAperture(rays, x, h, body.r))
        }

        // Lens upper and bottom
        updateMin(collisionX(rays, -h, front, back))
        updateMin(collisionX(rays, h, front, back))
    })

    // Aperture
    apertures.forEach(aperture => {
        updateMin(collisionAperture(rays, aperture.x, aperture.r, bodyR))
    })

    // Sensor
    sensors.forEach(sensor => {
        updateMin(collisionSensor(rays, sensor))
    })

    return pMins
}

export type Segment = { s: Vec, t: Vec, isSensor?: boolean, isAperture?: boolean }
export const rayTrace = (rays: Ray[], lenses: Lens[], apertures: Aperture[], sensors: Sensor[], body: Body | null, bodyR: number): Segment[][] => {
    const segments: Segment[][] = rays.map(ray => {
        return []
    })
    const maxItr = 100
    for (let i = 0; rays.length > 0 && i < maxItr; i++) {
        const cs = collisionAll(rays, lenses, apertures, sensors, body, bodyR)

        const nextRay: Ray[] = []
        rays.forEach((ray, idx) => {
            const s = ray.s
            const c = cs[idx]
            if (c === null) {
                segments[ray.idx].push({ s, t: ray.s.add(ray.v.mul(infR.value)) })
                return
            }

            if (c.isEnd) {
                segments[ray.idx].push({ s, t: c.p })
                return
            }

            if (c.isAperture) {
                segments[ray.idx].push({ s, t: c.p, isAperture: true })
                return
            }

            if (c.isSensor) {
                segments[ray.idx].push({ s, t: c.p, isSensor: true })
                return
            }

            segments[ray.idx].push({ s, t: c.p })

            // Next ray
            if (c.vn) {
                nextRay.push({ s: c.p, v: c.vn(), wavelength: ray.wavelength, idx: ray.idx })
            } else {
                console.error('Unexpected: Method does not exit calculating next direction vector.')
            }
        })

        rays = nextRay
    }

    return segments
}