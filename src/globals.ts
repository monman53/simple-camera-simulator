import { ref, computed, watch } from "vue"
import { Vec, calcLensFront, vec, calcLensR, calcLensBack, fGaussian, calcLensXCOG, calcLensMaxX, calcLensPlaneEdge, calcDispersion } from "./math"
import { type Lens, type LensGroup, type LightPoint, type LightType } from "./type"
import { wavelength } from "./collection/color"
import { createLensGroup, exampleConvexLens, exampleTestLens } from "./collection/lens"

//================================
// States
//================================

export const createInitialParams = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        c: vec(-100, 0),
        scale: 4,
        nRaysLog: 10,
        newLightWavelength: wavelength.green,
        newLightColorComposite: false,
        newLightColorCompositeN: 3,
        newLightType: "Point",
    }
}
export const state = ref(createInitialParams())

//--------------------------------
// Lights
//--------------------------------

export const lights0 = ():
    LightType[] => {
    return [
        // { type: Light.Point, c: vec(-200, 20), color: 0 }, // red
        // { type: Light.Point, c: vec(-160, 0), color: 120 }, // green
        // { type: Light.Point, c: vec(-120, -20), color: 240 }, // blue
        // { type: Light.White, c: vec(-200, -18) }, // white
        { type: 'Parallel', s: vec(-180, -30), t: vec(-180, 30), wavelengths: [wavelength.yellow] }, // green
    ]
}
export const lights = ref(lights0())

//--------------------------------
// Lenses
//--------------------------------

export const lensGroups0 = (): LensGroup[] => {
    return createLensGroup(exampleConvexLens)
}
export const lensGroups = ref(lensGroups0())

const lensSort = (lenses: Lens[]) => {
    lenses.sort((a, b) => {
        if (options.value.lensIdeal) {
            return calcLensXCOG(a) - calcLensXCOG(b)
        } else {
            return a.planes[0].x - b.planes[0].x
        }
    })
}

export const lensesSorted = computed(() => {
    const res = lensGroups.value.reduce((acc: Lens[], cur: LensGroup) => { return acc.concat(cur.lenses) }, [])
    lensSort(res)
    return res
})

export const lensFs = computed(() => {
    return lensesSorted.value.map((lens) => calcLensInfo([lens]).f)
})

export const lensRs = computed(() => {
    return lensesSorted.value.map((lens) => calcLensR(lens))
})

export const lensFronts = computed(() => {
    return lensesSorted.value.map((lens) => {
        return calcLensFront(lens)
    })
})

export const lensBacks = computed(() => {
    return lensesSorted.value.map((lens) => {
        return calcLensBack(lens)
    })
})

export const lensCOGs = computed(() => {
    return lensesSorted.value.map((lens) => {
        return calcLensXCOG(lens)
    })
})

export const lensPlaneEdges = computed(() => {
    return lensesSorted.value.map((lens) => {
        return lens.planes.map(p => {
            return calcLensPlaneEdge(p)
        })
    })
})

export const releaseAllLenses = () => {
    for (const lensGroup of lensGroups.value) {
        lensGroup.selected = false
    }
}

//--------------------------------
// Aperture
//--------------------------------

export const aperture0 = () => {
    return {
        x: 40,
        r: 10,
    }
}
export const aperture = ref(aperture0())

//--------------------------------
// Sensor
//--------------------------------

export const sensor0 = () => {
    return {
        s: vec(80, -12),
        t: vec(80, 12),
        circleOfConfusion: 1,
    }
}
export const sensor = ref(sensor0())
export const sensorData = ref()
export let memoryCanvasCtx: CanvasRenderingContext2D;
export const setMemoryCanvasCtx = (ctx: any) => {
    memoryCanvasCtx = ctx
}

//--------------------------------
// Field
//--------------------------------

export const field0 = () => {
    return {
        gridInterval: 10,
    }
}
export const field = ref(field0())

//--------------------------------
// Apple
//--------------------------------

export const appleProps0 = () => {
    return {
        c: vec(-200, 0),
        r: 20,
        n: 24,
        half: true,
    }
}
export const appleProps = ref(appleProps0())

export const apple = computed(() => {
    const cx = appleProps.value.c.x
    const cy = appleProps.value.c.y
    const r = appleProps.value.r

    const lights: LightPoint[] = []

    // Main
    {
        const n = appleProps.value.n
        for (let i = 0; i < n; i++) {
            const theta = i / n * 2 * Math.PI
            const x = cx + r * Math.cos(theta)
            const y = cy + r * Math.sin(theta)
            const c = vec(x, y)
            if (x >= cx) {
                lights.push({ type: 'Point', c, wavelengths: [wavelength.red] })
            }
        }
    }

    // Leaf
    {
        const n = Math.floor(appleProps.value.n * 2 / 3)
        for (let i = 0; i < n; i++) {
            const theta = i / n * 2 * Math.PI
            const rLeaf = 0.4 * r
            const x = cx + rLeaf * Math.cos(theta)
            const y = cy - (r + rLeaf) + rLeaf * Math.sin(theta)
            const c = vec(x, y)
            if (x >= cx) {
                lights.push({ type: 'Point', c, wavelengths: [wavelength.green] })
            }
        }
    }
    return lights
})

//--------------------------------
// Options
//--------------------------------

export const options0 = () => {
    return {
        advanced: false,
        lens: true,
        lensIdeal: false,
        lensFocalPoints: false,
        lensDoubleFocalPoints: false,
        hyperfocalPoint: false,
        sensor: true,
        sensorPreview: true,
        sensorMemory: false,
        body: true,
        aperture: false,
        grid: false,
        opticalAxis: false,
        curvature: false,
        depthOfField: false,
        angleOfView: false,
        circleOfConfusion: false,
        apple: false,
        wavelength: false,
        sensorFreeMove: true,
    }
}
export const options = ref(options0())

//--------------------------------
// Style
//--------------------------------

export const style0 = () => {
    return {
        // Rays
        rayWidth: 0.2,
        rayIntensity: 0.5,
        // UI
        widthUI: 1.0,
        lineBgColor: "#000a",
        bodyPadding: 4,
    }
}
export const style = ref(style0())

//================================
// Computed
//================================

export const infR = computed(() => {
    // Screen diagonal length
    const w = state.value.width / state.value.scale;
    const h = state.value.height / state.value.scale;
    let screen = Math.sqrt(w * w + h * h);

    // light to center max distance
    const c = vec((sensor.value.s.x + sensor.value.t.x) / 2, 0)
    let distanceMax = 0;
    for (const light of lights.value) {
        if (light.type === 'Point') {
            const d = c.sub(light.c)
            distanceMax = Math.max(distanceMax, d.length());
        }
        if (light.type === 'Parallel') {
            const ds = c.sub(light.s)
            const dt = c.sub(light.s)
            const d = Math.max(ds.length(), dt.length())
            distanceMax = Math.max(distanceMax, d);
        }
    }
    return (screen + distanceMax) * 3 /* 3 for safety */;
})

export const rUI = computed(() => {
    const scale = 1 / state.value.scale
    return 8 * scale;
})

export const body = computed(() => {
    const lensExist = options.value.lens && lensesSorted.value.length > 0
    const padding = style.value.bodyPadding

    let rs: number[] = []
    if (options.value.lens) {
        rs.push(...lensesSorted.value.map((lens, i) => { return lensRs.value[i] + padding }))
    }
    if (options.value.aperture) {
        rs.push(aperture.value.r)
    }
    if (options.value.sensor) {
        const r = Math.max(Math.abs(sensor.value.s.y), Math.abs(sensor.value.t.y))
        rs.push(r + padding)
    }

    let r = null
    if (rs.length > 0) {
        r = Math.max(...rs)
    }

    let front = null
    if (lensExist) {
        const xm = calcLensXCOG(lensesSorted.value[0])
        if (options.value.aperture) {
            if (options.value.lensIdeal) {
                front = Math.min(aperture.value.x, xm)
            } else {
                front = Math.min(aperture.value.x, lensFronts.value[0])
            }
        } else {
            if (options.value.lensIdeal) {
                front = xm
            } else {
                front = lensFronts.value[0]
            }
        }
    } else {
        if (options.value.aperture) {
            front = aperture.value.x
        }
    }
    let back = null
    if (options.value.sensor) {
        const maxX = Math.max(sensor.value.s.x, sensor.value.t.x)
        back = maxX + padding
    } else if (lensExist) {
        if (options.value.aperture) {
            back = Math.max(...lensFronts.value, aperture.value.x)
        } else {
            back = Math.max(...lensFronts.value)
        }
    }

    return {
        r,
        front,
        back,
    }
})

export const calcLensInfo = (lenses: Lens[]) => {
    // TODO: This is not good
    // Infinity loop may occur since calcLensInfo is used in lenSort()
    // Skip for single element
    if (lenses.length > 0) {
        lensSort(lenses)
    }
    const ll: { d: number, r: number, na: number, nb: number }[] = []
    lenses.forEach((lens, idx) => {
        lens.planes.forEach((p, j) => {
            let d = 0
            if (options.value.lensIdeal) {
                if (j === lens.planes.length - 1) {
                    if (idx !== lenses.length - 1) {
                        d = calcLensXCOG(lenses[idx + 1]) - calcLensXCOG(lenses[idx])
                    }
                }
            } else {
                if (j === lens.planes.length - 1) {
                    if (idx !== lenses.length - 1) {
                        d = lenses[idx + 1].planes[0].x - p.x
                    }
                } else {
                    d = lens.planes[j + 1].x - p.x
                }
            }

            ll.push({
                r: p.r,
                d,
                na: calcDispersion(wavelength.d, p.paramsA),
                nb: calcDispersion(wavelength.d, p.paramsB),
            })
        })
    })

    const ls: number[] = []
    const lss: number[] = []
    let f = Infinity
    ll.forEach((l, i) => {
        if (i === 0) {
            ls.push(Infinity)
            lss.push(1 / (1 / l.r * (1 - l.na / l.nb)))
            f = lss[i]
        } else {
            ls.push(lss[i - 1] - ll[i - 1].d)
            lss.push(1 / (l.na / l.nb / ls[i] + 1 / l.r * (1 - l.na / l.nb)))
            if (isFinite(f)) {
                f *= lss[i] / ls[i]
            } else {
                f = lss[i]
            }
        }
    })
    let H = 0
    if (lenses.length > 0) {
        if (options.value.lensIdeal) {
            H = calcLensXCOG(lenses[lenses.length - 1]) + lss[lss.length - 1] - f
        } else {
            H = calcLensMaxX(lenses[lenses.length - 1]) + lss[lss.length - 1] - f
        }
    }
    return { f, H }
}

export const globalLensInfos = computed(() => {
    return lensesSorted.value.map((lens) => {
        return calcLensInfo([lens])
    })
})

const calcLensRe = (lenses: Lens[], apertures: { r: number, x: number }[]) => {
    // Setup
    // Lenses
    const params: { f: number, r: number, x: number }[] = []
    lenses.forEach((lens, idx) => {
        const info = calcLensInfo([lens])
        const f = info.f
        const r = calcLensR(lens) * lens.aperture
        const x = options.value.lensIdeal ? calcLensXCOG(lens) : info.H
        params.push({ f, r, x })

        if (!options.value.lensIdeal) {
            // TODO: 
            // params.push({ f: Infinity, x: lens.x1, r: calcLensR(lens) })
            // params.push({ f: Infinity, x: lens.x2, r: calcLensR(lens) })
        }
    })
    // Body
    // Apertures
    apertures.forEach((aperture) => {
        params.push({ f: Infinity, r: aperture.r, x: aperture.x })
    })
    params.sort((a, b) => { return a.x - b.x })

    // Calculation
    let re = 1
    const res: number[] = []
    const ps: number[] = []
    params.forEach((param, idx) => {
        const f = param.f
        const r = param.r
        const x = param.x
        if (idx === 0) {
            ps.push(x + f)
            res.push(r)
            re = 1
        } else {
            const xp = params[idx - 1].x
            if (f === Infinity) {
                // TODO: Buggy around
                if (ps[idx - 1] === Infinity) {
                    ps.push(ps[idx - 1])
                    res.push(r)
                } else {
                    ps.push(ps[idx - 1])
                    res.push((ps[idx - 1] - x) / (ps[idx - 1] - xp) * res[idx - 1])
                }
                if (r < Math.abs(res[idx])) {
                    re *= r / Math.abs(res[idx])
                    res[idx] = r
                }
            } else {
                if (ps[idx - 1] === Infinity) {
                    ps.push(x + f)
                    res.push(res[idx - 1])
                } else {
                    ps.push(x + fGaussian(f, vec(ps[idx - 1] - x, 0)).x)
                    res.push((ps[idx - 1] - x) / (ps[idx - 1] - xp) * res[idx - 1])
                }
                if (r < Math.abs(res[idx])) {
                    re *= r / Math.abs(res[idx])
                    res[idx] = r
                }
            }
        }
    })
    return { re: Math.abs(res[0]) * re, H: calcLensInfo(lenses).H }
}

export const globalLensRe = computed(() => {
    const fwdApertures = []
    const bwdApertures = []
    if (options.value.aperture) {
        fwdApertures.push({ x: aperture.value.x, r: aperture.value.r })
        bwdApertures.push({ x: -aperture.value.x, r: aperture.value.r })
    }
    const fwdLenses: Lens[] = lensesSorted.value.map((lens) => {
        return {
            planes: lens.planes.map((p) => {
                return {
                    x: p.x,
                    r: p.r,
                    paramsA: p.paramsA,
                    paramsB: p.paramsB,
                    h: p.h,
                }
            }),
            aperture: lens.aperture,
        }
    })
    const bwdLenses: Lens[] = lensesSorted.value.map((lens) => {
        return {
            planes: lens.planes.map((p) => {
                return {
                    x: -p.x,
                    r: -p.r,
                    paramsA: p.paramsB,
                    paramsB: p.paramsA,
                    h: p.h,
                }
            }).sort((a, b) => a.x - b.x),
            aperture: lens.aperture,
        }
    })
    const forward = calcLensRe(fwdLenses, fwdApertures)
    const backward = calcLensRe(bwdLenses, bwdApertures)
    backward.H *= -1
    return { forward, backward }
})

export const globalLensInfo = computed(() => {
    return calcLensInfo(lensesSorted.value)
})

export const lensExist = computed(() => {
    return lensesSorted.value.length > 0
})

//================================
// Simple test
//================================

const test = () => {
    const lenses = createLensGroup(exampleTestLens)[0].lenses
    const info = calcLensInfo(lenses)
    console.log(info.f, 99.78672652)
}

watch([options], () => {
    // test()
}, { deep: true })