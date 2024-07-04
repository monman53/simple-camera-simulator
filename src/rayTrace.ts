import { aperture, body, infR, lensBacks, lensCOGs, lensFronts, lensFs, lensRs, lensesSorted, options, sensor } from "./globals";
import { calcLensPlaneEdge, crossAngle, dot, eps, fGaussian, intersectionCL, intersectionSS, intersectionX, intersectionY, vec, vecRad, type Vec } from "./math";

const collisionLens = (s: Vec, v: Vec, cx: number, r: number, h: number, ni: number, no: number) => {
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
}

const collisionIdealLens = (s: Vec, v: Vec, x: number, h: number, f: number) => {
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

const collisionAperture = (s: Vec, v: Vec, x: number, rMin: number, rMax: number) => {
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
}

const collisionSensor = (s: Vec, v: Vec) => {
    const ps = intersectionSS(s, s.add(v.mul(infR.value)), sensor.value.s, sensor.value.t)
    if (ps !== null) {
        return {
            p: ps,
            d: ps.sub(s).length(),
            isSensor: true,
        }
    } else {
        return null
    }
}

const collisionX = (s: Vec, v: Vec, y: number, xMin: number, xMax: number) => {
    const ps = intersectionX(s, v, y, xMin, xMax)
    if (ps.p !== null) {
        return {
            p: ps.p,
            d: ps.d,
            isEnd: true,
        }
    }
    return null
}

const collisionY = (s: Vec, v: Vec, x: number, yMin: number, yMax: number) => {
    const ps = intersectionY(s, v, x, yMin, yMax)
    if (ps.p !== null) {
        return {
            p: ps.p,
            d: ps.d,
            isEnd: true,
        }
    }
    return null
}

const collisionAll = (s: Vec, v: Vec): ({ p: Vec, d: number, isSensor?: boolean, isEnd?: boolean, vn?: () => Vec } | null) => {
    // Closest collision
    let pMin: ({ p: Vec, d: number, isSensor?: boolean, isEnd?: boolean, vn?: () => Vec } | null) = null
    const updateMin = (p: any) => {
        if (p === null) {
            return
        }
        if (p.d <= eps) {
            return
        }
        if (pMin === null) {
            pMin = p
            return
        }
        if (p.d < pMin.d) {
            pMin = p
        }
    }

    //--------------------------------
    // Collisions
    //--------------------------------

    // Body outline
    if (options.value.body && body.value.r && body.value.front && body.value.back) {
        updateMin(collisionX(s, v, -body.value.r, body.value.front, body.value.back))
        updateMin(collisionX(s, v, body.value.r, body.value.front, body.value.back))
        if (options.value.sensor) {
            updateMin(collisionY(s, v, body.value.back, -body.value.r, body.value.r))
        }
    }

    // Around lenses
    lensesSorted.value.forEach((lens, i) => {
        // Lens
        const h = lensRs.value[i]
        const f = lensFs.value[i]
        const xm = lensCOGs.value[i]
        if (options.value.lensIdeal) {
            updateMin(collisionIdealLens(s, v, xm, h * lens.aperture, f))
        } else {
            lens.planes.forEach(p => {
                const ni = p.r > 0 ? p.nb : p.na
                const no = p.r > 0 ? p.na : p.nb
                // Plane
                updateMin(collisionLens(s, v, p.x + p.r, p.r, p.h, ni, no))

                // Plane outside
                updateMin(collisionAperture(s, v, calcLensPlaneEdge(p), p.h, h))
            })
        }

        // Lens aperture
        updateMin(collisionAperture(s, v, xm, h * lens.aperture, h))

        // Lens to body
        if (options.value.body && body.value.r !== null) {
            const x = options.value.lensIdeal ? xm : lensFronts.value[i]
            updateMin(collisionAperture(s, v, x, h, body.value.r))
        }

        // Lens upper and bottom
        updateMin(collisionX(s, v, -h, lensFronts.value[i], lensBacks.value[i]))
        updateMin(collisionX(s, v, h, lensFronts.value[i], lensBacks.value[i]))
    })

    // Aperture
    if (options.value.aperture && body.value.r) {
        updateMin(collisionAperture(s, v, aperture.value.x, aperture.value.r, body.value.r))
    }

    // Sensor
    if (options.value.sensor) {
        updateMin(collisionSensor(s, v))
    }

    return pMin

    //--------------------------------
    // Find nearest collision
    //--------------------------------
    // ps = ps.filter((p) => p !== null && p.d > eps)
    // ps.sort((a, b) => {
    //     if (a !== null && b !== null) {
    //         return a.d - b.d
    //     } else {
    //         return 0
    //     }
    // })

    // if (ps.length > 0) {
    //     return ps[0]
    // } else {
    //     return null
    // }
}

export const rayTrace = (s: Vec, v: Vec) => {
    const ps = []
    const maxItr = 100
    for (let i = 0; i < maxItr; i++) {
        const c = collisionAll(s, v)

        if (c === null) {
            ps.push({ p: s.add(v.mul(infR.value)) })
            break
        }

        if (c.isEnd) {
            ps.push({ p: c.p })
            break
        }

        if (c.isSensor) {
            ps.push({ p: c.p, isSensor: true })
            break
        }

        ps.push({ p: c.p })

        // Next ray
        s = c.p
        if (c.vn) {
            v = c.vn()
        }
    }

    return ps
}