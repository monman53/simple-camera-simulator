//================================
// Liner algebra
//================================

export const vec = (x: number, y: number) => {
    return new Vec(x, y)
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

    add(v: Vec) {
        this.x += v.x
        this.y += v.y
        return this
    }

    sub(v: Vec) {
        this.x -= v.x
        this.y -= v.y
        return this
    }

    mul(a: number) {
        this.x *= a
        this.y *= a
        return this
    }

    div(a: number) {
        this.x /= a
        this.y /= a
        return this
    }

    minus() {
        this.x = -this.x
        this.y = -this.y
        return this
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    normalize() {
        return this.div(this.length())
    }

    static add(a: Vec, b: Vec) {
        return a.copy().add(b)
    }

    static sub(a: Vec, b: Vec) {
        return a.copy().sub(b)
    }

    static mul(v: Vec, a: number) {
        return v.copy().mul(a)
    }

    static div(v: Vec, a: number) {
        return v.copy().div(a)
    }

    static normalize(v: Vec) {
        return v.copy().normalize()
    }

    // TODO: toString
}

//================================
// Support functions
//================================
// export const getIntersectionX = (px: number, py: number, theta: number, minX: number, maxX: number, y: number, maxR: number) => {
//     const sin = Math.sin(theta);
//     const cos = Math.cos(theta);
//     const r = (y - py) / sin;
//     const x = px + r * cos;
//     if (r >= 0 && minX <= x && x <= maxX) {
//         return [true, x, y, r];
//     } else {
//         return [false, px + maxR * cos, py + maxR * sin, maxR];
//     }
// }

export const getIntersectionY = (s: Vec, v: Vec, x: number, minY: number, maxY: number) => {
    const n = v.copy().normalize()
    const r = (x - s.x) / n.x;
    const y = s.y + r * n.y;
    if (r >= 0 && minY <= y && y <= maxY) {
        return vec(x, y)
    } else {
        return null
    }
}

export const getIntersectionLens = (s: Vec, v: Vec, cl: Vec, r: number /* lens diameter */, R: number /* lens curvature radius */, select: boolean) => {
    const n = v.copy().normalize()

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

// export const dotAngle = (x1: number, y1: number, x2: number, y2: number) => {
//     const norm1 = Math.sqrt(x1 * x1 + y1 * y1);
//     const norm2 = Math.sqrt(x2 * x2 + y2 * y2);
//     return Math.acos((x1 * x2 + y1 * y2) / (norm1 * norm2));
// };

export const crossAngle = (p: Vec, q: Vec) => {
    return Math.asin((p.x * q.y - q.x * p.y) / (p.length() * q.length()));
};

// const getIntersectionBody = (cx, cy, theta, maxR, isInner) => {
//     // Front
//     if (!isInner) {
//         const [hit0, x0, y0, r0] = getIntersectionY(cx, cy, theta, this.lens.x, -this.bodyHeight / 2, this.bodyHeight / 2, maxR);
//         if (hit0 && r0 > 0) {
//             // NOTICE: Assume all rays passes left to right
//             // r0 > 0 condition is for inner rays.
//             return [hit0, x0, y0, r0];
//         }
//     }
//     // Top
//     const [hit1, x1, y1, r1] = getIntersectionX(cx, cy, theta, this.lens.x, this.lens.x + this.bodyWidth, -this.bodyHeight / 2, maxR);
//     if (hit1 && isInner) {
//         return [hit1, x1, y1, r1];
//     }
//     // Bottom
//     const [hit2, x2, y2, r2] = getIntersectionX(cx, cy, theta, this.lens.x, this.lens.x + this.bodyWidth, this.bodyHeight / 2, maxR);
//     if (hit2 && isInner) {
//         return [hit2, x2, y2, r2];
//     }

//     if (!isInner) {
//         if (r1 < r2) {
//             return [hit1, x1, y1, r1];
//         } else {
//             return [hit2, x2, y2, r2];
//         }
//     }

//     // Behind the sensor
//     const [hit3, x3, y3, r3] = getIntersectionY(cx, cy, theta, this.lens.x + this.bodyWidth, -this.bodyHeight / 2, this.bodyHeight / 2, maxR);
//     if (hit3) {
//         return [hit3, x3, y3, r3];
//     }

//     // Return closest intersection
//     if (r1 <= r2 && r1 <= r3) {
//         return [hit1, x1, y1, r1];
//     } else if ((r2 <= r1 && r2 <= r3)) {
//         return [hit2, x2, y2, r2];
//     } else {
//         return [hit3, x3, y3, r3];
//     }
// };

//================================
// Lens
//================================

export const fGaussian = (f: number, px: number, py: number) => {
    const qx = f * px / (px - f)
    const qy = py * (qx / px)
    return vec(qx, qy)
}

export const calcLensR = (n: number, f: number, r: number) => {
    // This formula is made from lens-maker's formula and d = 2(R-sqrt(R^2-r^2))
    const func = (R: number) => {
        let res = 0;
        res += n * n * Math.pow(R, 4);
        res += - 4 * n * (n - 1) * f * Math.pow(R, 3);
        res += 4 * (n - 1) * (n - 1) * f * f * (1 - (n - 1) * (n - 1)) * R * R;
        res += 4 * Math.pow(n - 1, 4) * f * f * r * r;

        return res;
    };

    // Derivative of func
    const funcc = (R: number) => {
        let res = 0;
        res += 4 * n * n * Math.pow(R, 3);
        res += - 12 * n * (n - 1) * f * Math.pow(R, 2);
        res += 8 * (n - 1) * (n - 1) * f * f * (1 - (n - 1) * (n - 1)) * R;
        return res;
    };

    // Solve func(R) = 0 by Newton' method
    let R = 100 * n; // NOTICE: Very heuristic
    for (let i = 0; i < 100; i++) {
        // console.log(R, func(R), funcc(R))
        R = R - func(R) / funcc(R);

        // Validation R with desired focal length
        // Calculate focal length by lens maker's formula
        const d = 2 * (R - Math.sqrt(R * R - r * r));
        const desiredLensF = f;
        const actualLensF = 1.0 / (2 * (n - 1) / R - (n - 1) * (n - 1) * d / (n * R * R));

        const absError = Math.abs(desiredLensF - actualLensF);
        const relError = absError / desiredLensF;
        if (relError < 1e-8) {
            return R;
        }
    }

    // Failed
    return -1.0;
}