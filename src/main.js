import Clevertap from './clevertap'
import { isWindowDefined } from './util/clevertap'

const clevertap = new Clevertap(isWindowDefined() ? window.clevertap : {})

if (isWindowDefined()) {
  window.clevertap = window.wizrocket = clevertap
} else {
  return (browser) => clevertap
}

export default clevertap
