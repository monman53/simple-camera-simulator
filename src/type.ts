import type { Vec } from "./math"

// TODO: "Light" -> "LightType"
export enum Light {
    White,
    Point,
    Parallel
}

export type LensPlane = {
    x: number,
    r: number,
    h: number,
    na: number,
    nb: number,
}

export type Lens = {
    planes: LensPlane[]
    aperture: number,
}

export type LensGroup = {
    lenses: Lens[],
    selected: boolean,
}

export type Ray = {
    s: Vec,
    v: Vec,
    color: number,
    idx: number,
}