//================================
// Liner algebra
//================================

export const vec = (x: number, y: number) => {
    return new Vec(x, y)
}

export const vecRad = (theta: number) => {
    return vec(Math.cos(theta), Math.sin(theta))
}

export class Vec {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    copy() {
        return vec(this.x, this.y)
    }

    inplaceAdd(v: Vec) {
        this.x += v.x
        this.y += v.y
        return this
    }

    inplaceSub(v: Vec) {
        this.x -= v.x
        this.y -= v.y
        return this
    }

    inplaceMul(a: number) {
        this.x *= a
        this.y *= a
        return this
    }

    inplaceDiv(a: number) {
        this.x /= a
        this.y /= a
        return this
    }

    inplaceMinus() {
        this.x = -this.x
        this.y = -this.y
        return this
    }

    inplaceRotate(theta: number) {
        const x = this.x
        const y = this.y
        const cos = Math.cos(theta)
        const sin = Math.sin(theta)
        this.x = cos * x - sin * y
        this.y = sin * x + cos * y
        return this
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    inplaceNormalize() {
        return this.div(this.length())
    }

    add(v: Vec) {
        return this.copy().inplaceAdd(v)
    }

    sub(v: Vec) {
        return this.copy().inplaceSub(v)
    }

    mul(a: number) {
        return this.copy().inplaceMul(a)
    }

    div(a: number) {
        return this.copy().inplaceDiv(a)
    }

    minus() {
        return this.copy().inplaceMinus()
    }

    normalize() {
        return this.copy().inplaceNormalize()
    }

    rotate(theta: number) {
        return this.copy().inplaceRotate(theta)
    }

    static add(a: Vec, b: Vec) {
        return a.add(b)
    }

    static sub(a: Vec, b: Vec) {
        return a.sub(b)
    }

    static mul(v: Vec, a: number) {
        return v.mul(a)
    }

    static div(v: Vec, a: number) {
        return v.div(a)
    }

    static normalize(v: Vec) {
        return v.normalize()
    }

    static rotate(v: Vec, theta: number) {
        return v.rotate(theta)
    }

    // TODO: toString
}

const dot = (p: Vec, q: Vec) => {
    return p.x * q.x + p.y * q.y
}

// export const dotAngle = (x1: number, y1: number, x2: number, y2: number) => {
//     const norm1 = Math.sqrt(x1 * x1 + y1 * y1);
//     const norm2 = Math.sqrt(x2 * x2 + y2 * y2);
//     return Math.acos((x1 * x2 + y1 * y2) / (norm1 * norm2));
// };

const cross = (p: Vec, q: Vec) => {
    return p.x * q.y - q.x * p.y
}

export const crossAngle = (p: Vec, q: Vec) => {
    return Math.asin(cross(p, q) / (p.length() * q.length()));
};

//================================
// Geometry
//================================

const eps = 1e-9

// ccw
const ccw = (a: Vec, b: Vec, c: Vec) => {
    b = b.sub(a)
    c = c.sub(a)
    if (cross(b, c) > eps) return +1 // counter clockwise
    if (cross(b, c) < -eps) return -1 // clockwise
    if (dot(b, c) < 0) return +2 // cab (back)
    if (b.length() < c.length()) return -2 // abc (front)
    return 0                        // acb (on segment)
}

const isIntersectedSS = (a1: Vec, a2: Vec, b1: Vec, b2: Vec) => {
    return ccw(a1, a2, b1) * ccw(a1, a2, b2) <= 0 &&
        ccw(b1, b2, a1) * ccw(b1, b2, a2) <= 0
}

const intersectionLL = (a1: Vec, a2: Vec, b1: Vec, b2: Vec) => {
    const a = a2.sub(a1)
    const b = b2.sub(b1)
    return a1.add(a.mul(cross(b, b1.sub(a1))).div(cross(b, a)))
}

export const intersectionSS = (a1: Vec, a2: Vec, b1: Vec, b2: Vec) => {
    if (isIntersectedSS(a1, a2, b1, b2)) {
        return intersectionLL(a1, a2, b1, b2)
    } else {
        return null
    }
}

export const intersectCC = (c1: Vec, r1: number, c2: Vec, r2: number) => {
    // Swap
    if (r1 < r2) {
        const cTmp = c1.copy()
        c1 = c2
        c2 = cTmp
        const rTmp = r1
        r1 = r2
        r2 = rTmp
    }
    const dc = c2.sub(c1).length();
    // Separated
    if (dc > r1 +r2) {
        return false
    }
    // Connotation
    if (dc + r2 < r1) {
        return false
    }
    return true
}

export const intersectionCC = (c1: Vec, r1: number, c2: Vec, r2: number) => {
    // Swap
    if (r1 < r2) {
        const cTmp = c1.copy()
        c1 = c2
        c2 = cTmp
        const rTmp = r1
        r1 = r2
        r2 = rTmp
    }
    const d = c2.sub(c1).length()
    const n = c2.sub(c1).normalize()
    const theta = Math.acos((d * d + r1 * r1 - r2 * r2) / (2.0 * d * r1));
    return [c1.add(n.rotate(theta).mul(r1)), c1.add(n.rotate(-theta).mul(r1))]
}

//================================
// Support functions
//================================

export const getIntersectionLens = (s: Vec, v: Vec, cl: Vec, r: number /* lens diameter */, R: number /* lens curvature radius */, select: boolean) => {
    const n = v.normalize()

    const a = 1;
    const b = 2 * ((s.x - cl.x) * n.x + (s.y - cl.y) * n.y);
    const c = Math.pow(s.x - cl.x, 2) + Math.pow(s.y - cl.y, 2) - R * R;
    const cond = b * b - 4 * a * c;
    if (cond < 0) {
        return null
    }
    // NOTICE: Use smaller r
    const d1 = (-b - Math.sqrt(cond)) / (2 * a);
    const d2 = (-b + Math.sqrt(cond)) / (2 * a);
    const d = select ? d1 : d2;
    const tx = s.x + d * n.x;
    const ty = s.y + d * n.y;
    if (Math.abs(ty) > r || d < 0) {
        return null
    } else {
        return vec(tx, ty)
    }
}

//================================
// Lens
//================================

export const fGaussian = (f: number, px: number, py: number) => {
    const qx = f * px / (px - f)
    const qy = py * (qx / px)
    return vec(qx, qy)
}

export const calcLensF = (lens: any) => {
    const d = lens.x2 - lens.x1
    const R1 = lens.R1
    const R2 = lens.R2
    const n = lens.n
    const inv = (n - 1) * (1 / R1 - 1 / R2) + (d / n) * ((n - 1) * (n - 1) / (R1 * R2))
    return 1 / inv
}
