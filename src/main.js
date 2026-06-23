import CleverTap from './clevertap'

const clevertap = new CleverTap(window.clevertap)

// Attach createInstance on the default instance for easy access
clevertap.createInstance = CleverTap.createInstance.bind(CleverTap)
clevertap.CleverTap = CleverTap

window.clevertap = window.wizrocket = clevertap

export default clevertap
