import type { Lens, LensGroup, LensPlane } from "@/type"

type PlaneData = {
    r: number, // Curvature
    d: number, // Distance to next plane
    n?: number, // Index to next plane
    h: number, // height
    vd?: number,
}

type LensData = {
    name: string,
    patent?: string,
    url?: string,
    planes: PlaneData[],
    lenses: number[][],
    groups: number[][],
}

export const lenseData: LensData[] = [
    {
        name: 'Rico 9mm-18mm',
        patent: 'JP-S46-019818',
        url: 'https://www.j-platpat.inpit.go.jp/c1801/PU/JP-S46-019818/12/ja',
        planes: [
            // Afocal
            { r: 44.58, d: 4.5, n: 1.58913, vd: 61.2, h: 16 },
            { r: Infinity, d: 3.7, h: 16 },

            { r: Infinity, d: 1.2, n: 1.62374, vd: 47.0, h: 10 },
            { r: 15.49, d: 24.3, h: 10 },

            { r: 40.62, d: 2.4, n: 1.58913, vd: 61.2, h: 8 },
            { r: -40.62, d: 1.2, h: 8 },

            { r: Infinity, d: 0.9, n: 1.62374, vd: 47.0, h: 4 },
            { r: 44.58, d: 5.0, h: 4 },

            // Relay
            { r: 6.9, d: 2.0, n: 1.744, vd: 44.9, h: 4 },
            { r: -153, d: 0.9, h: 4 },

            { r: -12.9, d: 1.4, n: 1.69895, vd: 30.1, h: 4 },
            { r: 5.7, d: 1.5, h: 3 },

            { r: 13.6, d: 2.4, n: 1.713, vd: 53.9, h: 4 },
            { r: -9.1, d: Infinity, h: 4 },
        ],
        lenses: [
            [0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13]
        ],
        groups: [
            [0, 2], [1, 3], [4, 5, 6]
        ],
    }
]

export const createLensGroup = (data: LensData) => {
    let x = 0
    const n0 = 1
    const planes: LensPlane[] = data.planes.map((plane, i) => {
        if (i === 0) {
            const nb = plane.n
            return {
                x: 0,
                r: plane.r,
                na: n0,
                nb: nb === undefined ? n0 : nb,
                h: plane.h,
            }
        } else {
            x += data.planes[i - 1].d
            const na = data.planes[i - 1].n
            const nb = plane.n
            return {
                x,
                r: plane.r,
                na: na === undefined ? n0 : na,
                nb: nb === undefined ? n0 : nb,
                h: plane.h,
            }
        }
    })

    const lenses: Lens[] = data.lenses.map(indices => {
        return {
            aperture: 1,
            planes: indices.map(i => planes[i])
        }
    })

    const groups: LensGroup[] = data.groups.map(indices => {
        return {
            selected: false,
            lenses: indices.map(i => lenses[i])
        }
    })

    return groups
}