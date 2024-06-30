import { ref, computed } from "vue"
import { Vec, calcLensFront, vec, calcLensR, calcLensBack, fGaussian } from "./math"
import { type Lens, type LensGroup, Light } from "./type"

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
        newLightColor: 120,
        newLightColorComposite: false,
        newLightColorCompositeN: 3,
        newLightType: Light.Point,
    }
}
export const state = ref(createInitialParams())

//--------------------------------
// Lights
//--------------------------------

export const lights0 = ():
    (
        { type: Light.Point, c: Vec, colors: number[] } |
        { type: Light.Parallel, s: Vec, t: Vec, colors: number[] }
    )[] => {
    return [
        // { type: Light.Point, c: vec(-200, 20), color: 0 }, // red
        // { type: Light.Point, c: vec(-160, 0), color: 120 }, // green
        // { type: Light.Point, c: vec(-120, -20), color: 240 }, // blue
        // { type: Light.White, c: vec(-200, -18) }, // white
        { type: Light.Parallel, s: vec(-180, -30), t: vec(-180, 30), colors: [120] }, // green
    ]
}
export const lights = ref(lights0())

//--------------------------------
// Lenses
//--------------------------------

export const defaultConvexLens = (x: number) => {
    const d = 10
    const R = 70
    return { x1: x - d / 2, x2: x + d / 2, R1: R, R2: -R, r: 20, n: 1.5, aperture: 1, selected: false }
}

export const defaultConcaveLens = (x: number) => {
    const R = 30
    return { x1: x - 2, x2: x + 2, R1: -R, R2: R, r: 10, n: 1.5, aperture: 1, selected: false }
}

export const lensGroups0 = (): LensGroup[] => {
    return [
        { lenses: [defaultConvexLens(0)], selected: false }
    ]
}
export const lensGroups = ref(lensGroups0())

export const lensesSorted = computed(() => {
    const res = lensGroups.value.reduce((acc: Lens[], cur: LensGroup) => { return acc.concat(cur.lenses) }, [])
    res.sort((a, b) => {
        if (options.value.lensIdeal) {
            return (a.x1 + a.x2) / 2 - (b.x1 + b.x2) / 2
        } else {
            return a.x1 - b.x1
        }
    })
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

export const releaseAllLenses = () => {
    for (const lensGroup of lensGroups.value) {
        lensGroup.selected = false
    }
}

//--------------------------------
// Sensor
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

    const lights = []

    // Main
    {
        const n = appleProps.value.n
        for (let i = 0; i < n; i++) {
            const theta = i / n * 2 * Math.PI
            const x = cx + r * Math.cos(theta)
            const y = cy + r * Math.sin(theta)
            const c = vec(x, y)
            const color = 0 // red
            if (x >= cx) {
                lights.push({ type: Light.Point, c, color })
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
            const color = 120 // green
            if (x >= cx) {
                lights.push({ type: Light.Point, c, color })
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
        lensIdeal: true,
        lensFocalPoints: false,
        lensDoubleFocalPoints: false,
        hyperfocalPoint: false,
        sensor: true,
        sensorPreview: true,
        sensorMemory: false,
        body: true,
        aperture: true,
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
        if (light.type === Light.Point) {
            const d = c.sub(light.c)
            distanceMax = Math.max(distanceMax, d.length());
        }
        if (light.type === Light.Parallel) {
            const ds = c.sub(light.s)
            const dt = c.sub(light.s)
            const d = Math.max(ds.length(), dt.length())
            distanceMax = Math.max(distanceMax, d);
        }
    }
    return (screen + distanceMax) * 3 /* 3 for safety */;
})

export const minLensX = computed(() => {
    let minX = infR.value
    for (const lensGroup of lensGroups.value) {
        for (const lens of lensGroup.lenses) {
            const left = Math.min(lens.x1, lens.x1)
            minX = Math.min(minX, left)
        }
    }
    return minX
})

export const maxLensX = computed(() => {
    let maxX = -infR.value
    for (const lensGroup of lensGroups.value) {
        for (const lens of lensGroup.lenses) {
            maxX = Math.max(maxX, lens.x2)
        }
    }
    return maxX
})

export const maxLightX = computed(() => {
    let max = -infR.value
    for (const light of lights.value) {
        if (light.type === Light.Point) {
            max = Math.max(max, light.c.x)
        }
        if (light.type === Light.Parallel) {
            max = Math.max(max, light.s.x)
            max = Math.max(max, light.t.x)
        }
    }
    return max
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
        rs = lensGroups.value.reduce((acc: number[], lensGroup) => {
            const rs = lensGroup.lenses.map((lens) => lens.r + padding)
            return acc.concat(rs)
        }, [])
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
        const xm = (lensesSorted.value[0].x1 + lensesSorted.value[0].x2) / 2
        if (options.value.aperture) {
            if (options.value.lensIdeal) {
                front = Math.min(aperture.value.x, xm)
            } else {
                front = Math.min(aperture.value.x, calcLensFront(lensesSorted.value[0]))
            }
        } else {
            if (options.value.lensIdeal) {
                front = xm
            } else {
                front = calcLensFront(lensesSorted.value[0])
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
    const ll: { d: number, r: number, n: number, nn: number }[] = []
    lenses.forEach((lens, idx) => {
        // Left-side
        {
            let d = idx === 0 ? 0 : lens.x1 - lenses[idx - 1].x2
            if (options.value.lensIdeal && idx !== 0) {
                d = (lens.x1 + lens.x2) / 2 - (lenses[idx - 1].x1 + lenses[idx - 1].x2) / 2
            }
            const r = lens.R1
            const n = 1
            const nn = lens.n
            ll.push({ d, r, n, nn })
        }
        // Right-side
        {
            let d = lens.x2 - lens.x1
            if (options.value.lensIdeal) {
                d = 0
            }
            const r = lens.R2
            const n = lens.n
            const nn = 1
            ll.push({ d, r, n, nn })
        }
    })

    const ls: number[] = []
    const lss: number[] = []
    let f = 1
    ll.forEach((l, i) => {
        if (i === 0) {
            //ls[i] = Infinity
            lss[i] = 1 / (1 / l.r * (1 - l.n / l.nn))
            f *= lss[i]
        } else {
            ls[i] = lss[i - 1] - ll[i].d
            lss[i] = 1 / (l.n / l.nn / ls[i] + 1 / l.r * (1 - l.n / l.nn))
            f *= lss[i] / ls[i]
        }
    })
    let H = 0
    if (lenses.length > 0) {
        H = lenses[lenses.length - 1].x2 + lss[lss.length - 1] - f
    }
    return { f, H }
}

export const globalLensInfos = computed(() => {
    return lensesSorted.value.map((lens) => {
        return calcLensInfo([lens])
    })
})

export const globalLensRe = computed(() => {
    // Setup
    // Lenses
    const params: { f: number, r: number, x: number }[] = []
    lensesSorted.value.forEach((lens, idx) => {
        const f = globalLensInfos.value[idx].f
        const r = calcLensR(lens) * lens.aperture
        let x = globalLensInfos.value[idx].H
        if (options.value.lensIdeal) {
            x = (lens.x1 + lens.x2) / 2
        }
        params.push({ f, r, x })
    })
    // Apertures
    if (options.value.aperture) {
        params.push({ f: Infinity, r: aperture.value.r, x: aperture.value.x })
    }
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
                ps.push(ps[idx - 1])
                res.push((ps[idx - 1] - x) / (ps[idx - 1] - xp) * res[idx - 1])
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
    return { re: Math.abs(res[0]) * re, H: ps[ps.length - 1] - globalLensInfo.value.f }
})

export const globalLensInfo = computed(() => {
    return calcLensInfo(lensesSorted.value)
})

export const lensExist = computed(() => {
    return lensesSorted.value.length > 0
})