import Clevertap from './clevertap'

const clevertap = new Clevertap(window.clevertap)
// eslint-disable-next-line
if (true) {
  // eslint-disable-next-line
  import('./react/index.js')
}

window.clevertap = window.wizrocket = clevertap
