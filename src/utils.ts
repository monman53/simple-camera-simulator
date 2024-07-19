import { lights, releaseAllLenses, sensor } from './globals'

export const humanReadable = (x: number) => {
  return x.toPrecision(4)
}

export const removeElement = (arr: any[], idx: number) => {
  if (window.confirm('Really remove?')) {
    arr.splice(idx, 1)
  }
}

export const releaseALlItems = () => {
  // Lenses
  releaseAllLenses()
  // Sensor
  sensor.value.selected = false
  // Lights
  lights.value.forEach((light) => {
    light.selected.value = false
  })
}
