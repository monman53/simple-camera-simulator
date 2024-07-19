import { estimateCauchyParameters } from '@/math'
import { Lens, LensPlane } from '@/SVG/LensItem.vue'
import { LensGroup } from '@/SVG/LensGroupItem.vue'

type PlaneData = {
  r: number // Curvature
  d: number // Distance to next plane
  n?: number // Index of the glass to next plane
  h: number // height
  vd?: number
}

export type LensData = {
  name: string
  patent?: string
  url?: string
  year?: string
  planes: PlaneData[]
  lenses: number[][]
  groups: number[][]
}

const nd0 = 1.5168
const vd0 = 64.17

export const exampleConvexLens: LensData = {
  name: 'Example convex',
  planes: [
    { d: 10, r: 70, h: 20, n: nd0, vd: vd0 },
    { d: Infinity, r: -70, h: 20 }
  ],
  lenses: [[0, 1]],
  groups: [[0]]
}

export const exampleConcaveLens: LensData = {
  name: 'Example concave',
  planes: [
    { d: 4, r: -30, h: 10, n: nd0, vd: vd0 },
    { d: Infinity, r: 30, h: 10 }
  ],
  lenses: [[0, 1]],
  groups: [[0]]
}

export const exampleDoubletLens: LensData = {
  name: 'Example doublet',
  planes: [
    { d: 10, r: 70, h: 20, n: nd0, vd: vd0 },
    { d: 5, r: -70, h: 20, n: nd0, vd: vd0 },
    { d: Infinity, r: -70, h: 20 }
  ],
  lenses: [[0, 1, 2]],
  groups: [[0]]
}

export const exampleTestLens: LensData = {
  name: 'Zeiss Anastigmat F1.9 100mm',
  year: '1938',
  url: 'http://dioptrique.info/OBJECTIFS13/00635/00635.HTM',
  planes: [
    // SK6
    { d: 7.7, r: 85.4, h: 28, n: 1.61375, vd: 56.3 },
    { d: 0.5, r: -500, h: 28 },

    // SK6
    { d: 19, r: 44.5, h: 24, n: 1.61375, vd: 56.3 },
    { d: 4.5, r: 70, h: 16 },

    // SF1
    { d: 2, r: -135, h: 16, n: 1.71736, vd: 29.5 },
    { d: 19, r: 34.3, h: 16 },

    // SK6
    { d: 8, r: 146, h: 22, n: 1.61375, vd: 59.3 },
    { d: Infinity, r: -46.8, h: 22 }
  ],
  lenses: [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7]
  ],
  groups: [[0, 1, 2, 3]]
}

export const lenseData: LensData[] = [
  exampleConvexLens,
  exampleConcaveLens,
  exampleDoubletLens,
  exampleTestLens,
  {
    name: 'Rico 9mm-18mm',
    patent: 'JP-S46-019818',
    url: 'https://www.j-platpat.inpit.go.jp/c1801/PU/JP-S46-019818/12/ja',
    planes: [
      // Afocal
      { r: 44.58, d: 4.5, h: 16, n: 1.58913, vd: 61.2 },
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
      { r: -9.1, d: Infinity, h: 4 }
    ],
    lenses: [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
      [8, 9],
      [10, 11],
      [12, 13]
    ],
    groups: [
      [0, 2],
      [1, 3],
      [4, 5, 6]
    ]
  }
]

export type CauchyParams = { A: number; B: number; C: number }

const createParam = (nd: number | undefined, vd: number | undefined): CauchyParams => {
  if (nd === undefined) {
    // Vacuum
    return { A: 1, B: 0, C: 0 }
  } else if (vd === undefined) {
    // No dispersion
    return { A: nd, B: 0, C: 0 }
  } else {
    return estimateCauchyParameters(nd, vd)
  }
}

export const createLensGroup = (data: LensData): LensGroup[] => {
  let x = 0
  const planes: LensPlane[] = data.planes.map((plane, i) => {
    if (i === 0) {
      return new LensPlane(
        0,
        plane.r,
        plane.h,
        createParam(undefined, undefined),
        createParam(plane.n, plane.vd)
      )
    } else {
      x += data.planes[i - 1].d
      const pre = data.planes[i - 1]
      const cur = data.planes[i]
      return new LensPlane(
        x,
        plane.r,
        plane.h,
        createParam(pre.n, pre.vd),
        createParam(cur.n, cur.vd)
      )
    }
  })

  const lenses: Lens[] = data.lenses.map((indices) => {
    return new Lens(
      indices.map((i) => planes[i]),
      1
    )
  })

  const groups: LensGroup[] = data.groups.map((indices) => {
    return new LensGroup(
      indices.map((i) => lenses[i]),
      false,
      true,
      false
    )
  })

  return groups
}
