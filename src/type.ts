import { computed, ref, type ComputedRef, type Ref } from "vue"
import type { CauchyParams } from "./collection/lens"
import type { Vec } from "./math"

export type LightPoint = { type: "Point", c: Vec, wavelengths: number[] }
export type LightParallel = { type: "Parallel", s: Vec, t: Vec, wavelengths: number[] }
export type LightType = LightPoint | LightParallel

export type LensPlane = {
    x: number,
    r: number,
    h: number,
    paramsA: CauchyParams,
    paramsB: CauchyParams,
}

export class Lens {
    planes: Ref<LensPlane[]>
    aperture: Ref<number>
    h: ComputedRef<number>
    constructor(planes: LensPlane[], aperture: number) {
        this.planes = ref(planes)
        this.aperture = ref(aperture)
        this.h = computed(() => {
            const hs = this.planes.value.map((p) => p.h)
            return Math.max(...hs)
        })
    }
}

export type LensGroup = {
    lenses: Lens[],
    selected: boolean,
    enabled: boolean,
    fixed: boolean,
}

export type Ray = {
    s: Vec,
    v: Vec,
    wavelength: number,
    idx: number,
}

export type Aperture = {
    x: number,
    r: number,
}

export type Sensor = {
    s: Vec,
    t: Vec,
    circleOfConfusion: number,
}

export type Body = {
    r: number,
    front: number,
    back: number,
}