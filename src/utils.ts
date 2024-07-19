import { triggerRef, type ShallowRef } from 'vue'
import { lights, releaseAllLenses, sensor } from './globals'

export const humanReadable = (x: number) => {
  return x.toPrecision(4)
}

export const removeElement = <T>(arr: ShallowRef<T[]>, idx: number) => {
  if (window.confirm('Really remove?')) {
    arr.value.splice(idx, 1)
    triggerRef(arr)
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
