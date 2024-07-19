import { wavelengthToHue } from '@/math'

export const wavelengthCollection = {
  min: 380,
  max: 750,

  // Fraunhofer lines
  F: 486.134,
  d: 587.565,
  C: 656.281,

  // By color
  red: 706.52,
  yellow: 587.565,
  green: 530,
  blue: 435.84
}

export const lightHSL = (lambda: number, intensity: number) => {
  const hue = wavelengthToHue(lambda)
  return `hsl(${hue}, 100%, 50%, ${intensity})`
}
