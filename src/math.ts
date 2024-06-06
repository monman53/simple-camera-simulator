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

export const getIntersectionY = (px: number, py: number, theta: number, x: number, minY: number, maxY: number) => {
    const sin = Math.sin(theta);
    const cos = Math.cos(theta);
    const r = (x - px) / cos;
    const y = py + r * sin;
    if (r >= 0 && minY <= y && y <= maxY) {
        return { x, y, r }
    } else {
        return null
    }
};

export const getIntersectionLens = (x: number, y: number, theta: number, cx: number, cy: number, r: number /* lens diameter */, R: number /* lens curvature radius */, select: boolean) => {
    const a = 1;
    const b = 2 * ((x - cx) * Math.cos(theta) + (y - cy) * Math.sin(theta));
    const c = Math.pow(x - cx, 2) + Math.pow(y - cy, 2) - R * R;
    const cond = b * b - 4 * a * c;
    if (cond < 0) {
        return null
    }
    // NOTICE: Use smaller r
    const d1 = (-b - Math.sqrt(cond)) / (2 * a);
    const d2 = (-b + Math.sqrt(cond)) / (2 * a);
    const d = select ? d1 : d2;
    const tx = x + d * Math.cos(theta);
    const ty = y + d * Math.sin(theta);
    if (Math.abs(ty) > r || d < 0) {
        return null
    } else {
        return { x: tx, y: ty, r: d }
    }
};

// export const dotAngle = (x1: number, y1: number, x2: number, y2: number) => {
//     const norm1 = Math.sqrt(x1 * x1 + y1 * y1);
//     const norm2 = Math.sqrt(x2 * x2 + y2 * y2);
//     return Math.acos((x1 * x2 + y1 * y2) / (norm1 * norm2));
// };

export const crossAngle = (x1: number, y1: number, x2: number, y2: number) => {
    const norm1 = Math.sqrt(x1 * x1 + y1 * y1);
    const norm2 = Math.sqrt(x2 * x2 + y2 * y2);
    return Math.asin((x1 * y2 - x2 * y1) / (norm1 * norm2));
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