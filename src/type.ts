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