import { aperture, body, infR, lensBacks, lensFronts, lensFs, lensRs, lensesSorted, options, sensor } from "./globals";
import { calcLensXCOG, cross, crossAngle, dot, eps, fGaussian, intersectionCL, intersectionSS, intersectionX, intersectionY, vec, vecRad, type Vec } from "./math";

const collisionLens = (s: Vec, v: Vec, cx: number, r: number, h: number, ni: number, no: number) => {
    v = v.normalize()
    const pls = intersectionCL(cx, r, s, v)
    if (pls.length === 0) {
        return null
    }
    const lx = Math.sqrt(r * r - h * h)
    const e1 = r > 0 ? vec(-lx, h) : vec(lx, h)
    const e2 = r > 0 ? vec(-lx, -h) : vec(lx, -h)
    for (const pl of pls) {
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

const collisionAll = (s: Vec, v: Vec) => {
    //--------------------------------
    // Collisions
    //--------------------------------
    let ps: ({ p: Vec, d: number, isSensor?: boolean, isEnd?: boolean, vn?: () => Vec } | null)[] = []

    // Body outline
    if (options.value.body && body.value.r && body.value.front && body.value.back) {
        ps.push(collisionX(s, v, -body.value.r, body.value.front, body.value.back))
        ps.push(collisionX(s, v, body.value.r, body.value.front, body.value.back))
        if (options.value.sensor) {
            ps.push(collisionY(s, v, body.value.back, -body.value.r, body.value.r))
        }
    }

    // Around lenses
    lensesSorted.value.forEach((lens, i) => {
        // Lense
        const h = lensRs.value[i]
        const f = lensFs.value[i]
        const xm = calcLensXCOG(lens)
        if (options.value.lensIdeal) {
            ps.push(collisionIdealLens(s, v, xm, h * lens.aperture, f))
        } else {
            lens.planes.forEach(p=>{
                const ni = p.r > 0 ? p.nb : p.na
                const no = p.r > 0 ? p.na : p.nb
                ps.push(collisionLens(s, v, p.x + p.r, p.r, p.h, ni, no))
            })
            // {
            //     const ni = lens.R1 > 0 ? n : 1
            //     const no = lens.R1 > 0 ? 1 : n
            //     ps.push(collisionLens(s, v, lens.x1 + lens.R1, lens.R1, h, ni, no))
            // }
            // {
            //     const ni = lens.R2 > 0 ? 1 : n
            //     const no = lens.R2 > 0 ? n : 1
            //     ps.push(collisionLens(s, v, lens.x2 + lens.R2, lens.R2, h, ni, no))
            // }
        }

        // Lens aperture
        ps.push(collisionAperture(s, v, xm, h * lens.aperture, h))

        // Lens to body
        if (options.value.body && body.value.r !== null) {
            const x = options.value.lensIdeal ? xm : lensFronts.value[i]
            ps.push(collisionAperture(s, v, x, h, body.value.r))
        }

        // Lens upper and bottom
        ps.push(collisionX(s, v, -h, lensFronts.value[i], lensBacks.value[i]))
        ps.push(collisionX(s, v, h, lensFronts.value[i], lensBacks.value[i]))
    })

    // Aperture
    if (options.value.aperture && body.value.r) {
        ps.push(collisionAperture(s, v, aperture.value.x, aperture.value.r, body.value.r))
    }

    // Sensor
    if (options.value.sensor) {
        ps.push(collisionSensor(s, v))
    }

    //--------------------------------
    // Find nearest collision
    //--------------------------------
    ps = ps.filter((p) => p !== null && p.d > eps)
    ps.sort((a, b) => {
        if (a !== null && b !== null) {
            return a.d - b.d
        } else {
            return 0
        }
    })

    if (ps.length > 0) {
        return ps[0]
    } else {
        return null
    }
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