export const fSellmeier = (l: number, g: Glass) => {
    if (g.params === undefined) {
        return g.nd
    }
    const t1 = g.params.b1 * l * l / (l * l - g.params.c1)
    const t2 = g.params.b2 * l * l / (l * l - g.params.c2)
    const t3 = g.params.b3 * l * l / (l * l - g.params.c3)
    const n = Math.sqrt(1 + t1 + t2 + t3)
    return n
}

export type Glass = {
    name: string,
    vender?: string,
    code?: string,
    url?: string,
    nd: number,
    vd: number,
    // Parameters for Sellmeier dispersion formula
    params?: {
        b1: number,
        b2: number,
        b3: number,
        c1: number,
        c2: number,
        c3: number,
    },
}

export const glasses = new Map<string, Glass>();

glasses.set('vacuum', {
    name: 'Vacuum',
    nd: 1,
    vd: NaN,
    params: {
        b1: 0,
        b2: 0,
        b3: 0,
        c1: 0,
        c2: 0,
        c3: 0,
    }
})

glasses.set('589612', {
    name: 'P-SK58A',
    vender: 'Schott',
    nd: 1.58913,
    vd: 61.15,
    url: 'https://www.schott.com/en-ie/products/optical-glass-p1000267/downloads',
    params: {
        b1: 1.316784100,
        b2: 0.171154756,
        b3: 1.125014730,
        c1: 0.007207175,
        c2: 0.0245659595,
        c3: 102.73972800,
    }
})

glasses.set('624470', {
    name: 'BAF8',
    vender: 'Schott',
    nd: 1.58913,
    vd: 61.15,
    url: 'https://www.schott.com/en-ie/products/optical-glass-p1000267/downloads',
    params: {
        b1: 1.44967157,
        b2: 0.00919052911,
        b3: 0.131600677,
        c1: 0.0425730108,
        c2: 0.939224513,
        c3: 112.153963,
    }
})