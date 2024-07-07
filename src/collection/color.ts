import { wavelengthToHue } from "@/math"

export const wavelength = {
    max: 1013.98,
    red: 706.52,
    yellow: 587.56,
    green: 530,
    blue: 435.84,
    min: 365.01,
}

export const lightHSL = (lambda: number, intensity: number) => {
    const hue = wavelengthToHue(lambda)
    return `hsl(${hue}, 100%, 50%, ${intensity})`
}