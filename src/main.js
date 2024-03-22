import 'regenerator-runtime/runtime.js'
import Clevertap from './clevertap'

const clevertap = new Clevertap(window.clevertap)

window.clevertap = window.wizrocket = clevertap

export default clevertap
