export const isChrome = () => {
  const ua = navigator.userAgent
  return ua.includes('Chrome') || ua.includes('CriOS')
}

export const isFirefox = () => {
  const ua = navigator.userAgent
  return ua.includes('Firefox') || ua.includes('FxiOS')
}

export const isSafari = () => {
  const ua = navigator.userAgent
  // Ignoring the False Positive of Safari on iOS devices because it gives Safari in all Browsers
  return ua.includes('Safari') &&
         !ua.includes('CriOS') &&
         !ua.includes('FxiOS') &&
         !ua.includes('Chrome') &&
         !ua.includes('Firefox')
}

/**
 * Recursively checks if an object contains an array or a function at any level of nesting.
 *
 * @param {Object} obj - The object to check.
 * @returns {boolean} - Returns `true` if the object contains an array or function, otherwise `false`.
 */
export const objectHasNestedArrayOrFunction = (obj) => {
  if (!obj || typeof obj !== 'object') return false
  if (Array.isArray(obj)) return true
  return Object.values(obj).some(value =>
    typeof value === 'function' || objectHasNestedArrayOrFunction(value)
  )
}

/**
 * Flattens a nested object into a single-level object using dot notation.
 * Arrays are ignored in this transformation.
 *
 * @param {Object} obj - The object to be flattened.
 * @param {string} [parentKey=""] - The parent key for recursion (used internally).
 * @returns {Object} - The transformed object with dot notation keys.
 */
export const flattenObjectToDotNotation = (obj, parentKey = '') => {
  const result = {}

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      const newKey = parentKey ? `${parentKey}.${key}` : key

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively process nested objects
        Object.assign(result, flattenObjectToDotNotation(value, newKey))
      } else if (!Array.isArray(value)) {
        // Assign non-array values directly
        result[newKey] = {
          defaultValue: value,
          type: typeof value
        }
      }
    }
  }

  return result
}

/**
 * Reconstructs an object from a flat key-value structure using dot notation.
 *
 * @param {Object} payload - The input object with flat dot notation keys.
 * @returns {Object} - The reconstructed object with proper nesting.
 */
export const reconstructNestedObject = (payload) => {
  const result = {}

  for (const key in payload) {
    if (Object.hasOwnProperty.call(payload, key)) {
      const value = payload[key]
      const keys = key.split('.') // Split keys on dot notation
      let current = result

      keys.forEach((part, index) => {
        if (index === keys.length - 1) {
          // Assign value at the last key level
          current[part] = value
        } else {
          // Ensure intermediate levels exist
          current = current[part] = current[part] || {}
        }
      })
    }
  }

  return result
}
