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
 * Safely parses JSON from potentially untrusted sources (like cookies or localStorage)
 *
 * Protects against DOM-based JSON injection by pre-filtering malicious patterns
 * identified in security scans (Burp Suite) before passing to JSON.parse().
 *
 * ## Security Protection
 *
 * - Validates input type and emptiness
 * - Rejects patterns containing injection signatures (%, <, >, `)
 * - Catches malformed JSON with try-catch
 * - Returns safe defaults instead of throwing exceptions
 *
 * ## Blocked Patterns (from security reports)
 *
 * - URL-encoded characters (%) - Found in: ydiiw8uab9%27%22...
 * - HTML/script tags (<, >) - XSS injection attempts
 * - Template literals/backticks (`) - Code injection attempts
 *
 * @param {string} jsonString - The JSON string to parse (from cookies, localStorage, etc.)
 * @param {*} [defaultValue=null] - Safe value to return if parsing fails or input is malicious
 * @returns {*} Parsed JSON value, or defaultValue if invalid/malicious
 *
 * @example
 * // Valid JSON - parses successfully
 * safeJSONParse('{"session":"abc123"}', {})
 * // → {session: "abc123"}
 *
 * @example
 * // Burp Suite injection payload - rejected in pre-filter
 * safeJSONParse('ydiiw8uab9%27%22`""/ydiiw8uab9/><ydiiw8uab9/\>fv11wdwggu&', {})
 * // → {} (malicious pattern detected, JSON.parse NOT called)
 *
 * @example
 * // Malformed JSON - caught by try-catch
 * safeJSONParse('{"unclosed":', {})
 * // → {} (JSON.parse error caught)
 */
export const safeJSONParse = (jsonString, defaultValue = null) => {
  // Validate input is a non-empty string
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
    return defaultValue
  }

  const trimmed = jsonString.trim()

  // PRE-FILTER: Block malicious patterns from security reports
  // These patterns are NOT valid JSON and indicate injection attempts
  const maliciousPatterns = [
    /%/, // URL encoding (e.g., %27, %22, %3C) - Burp payloads contain %27, %22
    /</, // HTML/script tag start - XSS/injection attempts
    />/, // HTML/script tag end - XSS/injection attempts
    /`/ // Template literal/backtick injection
    // Note: Backslash (\) is valid in JSON for escape sequences, so we don't block it
    // Invalid backslash usage will be caught by JSON.parse
  ]

  // Check for any malicious pattern - reject BEFORE calling JSON.parse
  for (const pattern of maliciousPatterns) {
    if (pattern.test(trimmed)) {
      return defaultValue // Malicious pattern detected
    }
  }

  // Input passed pre-filter - attempt to parse with error handling
  try {
    return JSON.parse(trimmed)
  } catch (e) {
    // JSON.parse failed (malformed JSON) - return safe default
    return defaultValue
  }
}
