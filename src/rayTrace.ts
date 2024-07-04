import { aperture, body, infR, lensBacks, lensCOGs, lensFronts, lensFs, lensPlaneEdges, lensRs, lensesSorted, options, sensor } from "./globals";
import { crossAngle, dot, eps, fGaussian, intersectionCL, intersectionLS, intersectionX, intersectionY, vec, vecRad, type Vec } from "./math";
import type { Ray } from "./type";

type CollisionResult = ({ p: Vec, d: number, isSensor?: boolean, isEnd?: boolean, vn?: () => Vec } | null)

const collisionLens = (rays: Ray[], cx: number, r: number, h: number, ni: number, no: number): CollisionResult[] => {
    return rays.map(ray => {
        let v = ray.v
        let s = ray.s
        v = v.normalize()
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
                    isEnd: true,
                }
            }
        }
        return null
    })
}

const collisionSensor = (rays: Ray[]): CollisionResult[] => {
    return rays.map(ray => {
        let v = ray.v
        let s = ray.s
        const ps = intersectionLS(s, v, sensor.value.s, sensor.value.t)
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

const collisionAll = (rays: Ray[]): CollisionResult[] => {
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
    if (options.value.body && body.value.r && body.value.front && body.value.back) {
        updateMin(collisionX(rays, -body.value.r, body.value.front, body.value.back))
        updateMin(collisionX(rays, body.value.r, body.value.front, body.value.back))
        if (options.value.sensor) {
            updateMin(collisionY(rays, body.value.back, -body.value.r, body.value.r))
        }
    }

    // Around lenses
    lensesSorted.value.forEach((lens, i) => {
        // Lens
        const h = lensRs.value[i]
        const f = lensFs.value[i]
        const xm = lensCOGs.value[i]
        if (options.value.lensIdeal) {
            updateMin(collisionIdealLens(rays, xm, h * lens.aperture, f))
        } else {
            lens.planes.forEach((p, j) => {
                const ni = p.r > 0 ? p.nb : p.na
                const no = p.r > 0 ? p.na : p.nb
                // Plane
                updateMin(collisionLens(rays, p.x + p.r, p.r, p.h, ni, no))

                // Plane outside
                updateMin(collisionAperture(rays, lensPlaneEdges.value[i][j], p.h, h))
            })
        }

        // Lens aperture
        updateMin(collisionAperture(rays, xm, h * lens.aperture, h))

        // Lens to body
        if (options.value.body && body.value.r !== null) {
            const x = options.value.lensIdeal ? xm : lensFronts.value[i]
            updateMin(collisionAperture(rays, x, h, body.value.r))
        }

        // Lens upper and bottom
        updateMin(collisionX(rays, -h, lensFronts.value[i], lensBacks.value[i]))
        updateMin(collisionX(rays, h, lensFronts.value[i], lensBacks.value[i]))
    })

    // Aperture
    if (options.value.aperture && body.value.r) {
        updateMin(collisionAperture(rays, aperture.value.x, aperture.value.r, body.value.r))
    }

    // Sensor
    if (options.value.sensor) {
        updateMin(collisionSensor(rays))
    }

    return pMins
}

type Segment = { s: Vec, t: Vec, isSensor?: boolean }
export const rayTrace = (rays: Ray[]): Segment[][] => {
    const segments: Segment[][] = rays.map(ray => {
        return []
    })
    const maxItr = 100
    for (let i = 0; rays.length > 0 && i < maxItr; i++) {
        const cs = collisionAll(rays)

        const nextRay: Ray[] = []
        rays.forEach((ray, idx) => {
            const color = ray.color
            const s = ray.s
            const c = cs[idx]
            if (c === null) {
                segments[ray.idx].push({ s, t: ray.s.add(ray.v.mul(infR.value))})
                return
            }

            if (c.isEnd) {
                segments[ray.idx].push({ s, t: c.p })
                return
            }

            if (c.isSensor) {
                segments[ray.idx].push({ s, t: c.p, isSensor: true })
                return
            }

            segments[ray.idx].push({ s, t: c.p })

            // Next ray
            if (c.vn) {
                nextRay.push({ s: c.p, v: c.vn(), color, idx: ray.idx })
            } else {
                console.error('Unexpected: Method does not exit calculating next direction vector.')
            }
        })

        rays = nextRay
    }

    return segments
}