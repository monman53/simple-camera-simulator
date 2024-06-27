// TODO: "Light" -> "LightType"
export enum Light {
    White,
    Point,
    Parallel
}

export type Lens = {
    x1: number,
    x2: number,
    R1: number,
    R2: number,
    r: number,
    n: number,
    aperture: number,
}

export type LensGroup = {
    lenses: Lens[],
    selected: boolean,
}