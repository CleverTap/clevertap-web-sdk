import {
  unsupportedKeyCharRegex,
  unsupportedValueCharRegex
} from './constants'

export const isString = (input) => {
  return (typeof input === 'string' || input instanceof String)
}

export const isObject = (input) => {
  // TODO: refine
  return Object.prototype.toString.call(input) === '[object Object]'
}

export const isDateObject = (input) => {
  return typeof (input) === 'object' && (input instanceof Date)
}

export const isObjectEmpty = (obj) => {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) { return false }
  }
  return true
}

export const isConvertibleToNumber = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

export const isNumber = (n) => {
  return /^-?[\d.]+(?:e-?\d+)?$/.test(n) && typeof n === 'number'
}

export const isValueValid = (value) => {
  if (value === null || value === undefined || value === 'undefined') {
    return false
  }
  return true
}

export const arrayContains = (arr, obj) => {
  var i = arr.length
  while (i--) {
    if (arr[i] === obj) {
      return true
    }
  }
  return false
}

export const removeUnsupportedChars = (o, logger) => {
  // keys can't be greater than 1024 chars, values can't be greater than 1024 chars
  if (typeof o === 'object') {
    for (const key in o) {
      if (o.hasOwnProperty(key)) {
        const sanitizedVal = removeUnsupportedChars(o[key], logger)
        let sanitizedKey
        sanitizedKey = sanitize(key, unsupportedKeyCharRegex)
        if (sanitizedKey.length > 1024) {
          sanitizedKey = sanitizedKey.substring(0, 1024)
          logger.reportError(520, sanitizedKey + '... length exceeded 1024 chars. Trimmed.')
        }
        delete o[key]
        o[sanitizedKey] = sanitizedVal
      }
    }
  } else {
    let val

    if (isString(o)) {
      val = sanitize(o, unsupportedValueCharRegex)
      if (val.length > 1024) {
        val = val.substring(0, 1024)
        logger.reportError(521, val + '... length exceeded 1024 chars. Trimmed.')
      }
    } else {
      val = o
    }
    return val
  }
  return o
}

export const sanitize = (input, regex) => {
  return input.replace(regex, '')
}

/**
 * Safely parses JSON from potentially untrusted sources (like cookies)
 * Validates input before parsing to prevent JSON injection attacks
 * @param {string} jsonString - The JSON string to parse
 * @param {*} defaultValue - Value to return if parsing fails (default: null)
 * @returns {*} Parsed JSON object or defaultValue on error
 */
export const safeJSONParse = (jsonString, defaultValue = null) => {
  // Return default if input is not valid
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
    return defaultValue
  }

  // Remove any leading/trailing whitespace
  jsonString = jsonString.trim()

  // Basic validation: JSON must start with { or [ or be a quoted string/number/boolean/null
  const firstChar = jsonString.charAt(0)
  const validStartChars = ['{', '[', '"', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const validKeywords = ['true', 'false', 'null']

  if (!validStartChars.includes(firstChar) && !validKeywords.some(kw => jsonString.startsWith(kw))) {
    return defaultValue
  }

  // Validate balanced braces/brackets
  let braceCount = 0
  let bracketCount = 0
  let inString = false
  let escaped = false

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"' && !escaped) {
      inString = !inString
      continue
    }

    if (!inString) {
      if (char === '{') braceCount++
      if (char === '}') braceCount--
      if (char === '[') bracketCount++
      if (char === ']') bracketCount--

      // Prevent negative counts (malformed JSON)
      if (braceCount < 0 || bracketCount < 0) {
        return defaultValue
      }
    }
  }

  // Ensure all braces and brackets are balanced
  if (braceCount !== 0 || bracketCount !== 0 || inString) {
    return defaultValue
  }

  // Attempt to parse
  try {
    const parsed = JSON.parse(jsonString)
    return parsed
  } catch (e) {
    // JSON parsing failed, return default value
    return defaultValue
  }
}
