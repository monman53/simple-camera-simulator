import type { Vec } from "./math"

export type LightPoint = { type: "Point", c: Vec, wavelengths: number[] }
export type LightParallel = { type: "Parallel", s: Vec, t: Vec, wavelengths: number[] }
export type LightType = LightPoint | LightParallel

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