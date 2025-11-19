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
*/
export const safeJSONParse = (jsonString, defaultValue = null) => {
  // Validate input is a non-empty string
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
    return defaultValue
  }

  const trimmed = jsonString.trim()

  const maliciousPatterns = [
    // Block specific dangerous URL-encoded characters (not all % signs)
    /%27/i, // URL-encoded single quote (') - used in SQL/JS injection
    /%22/i, // URL-encoded double quote (") - used in string breaking
    /%3C/i, // URL-encoded < - XSS/HTML injection attempts
    /%3E/i, // URL-encoded > - XSS/HTML injection attempts
    /%60/i, // URL-encoded backtick (`) - template literal injection
    /</, // HTML/script tag start - XSS/injection attempts
    />/, // HTML/script tag end - XSS/injection attempts
    /`/ // Template literal/backtick injection
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
