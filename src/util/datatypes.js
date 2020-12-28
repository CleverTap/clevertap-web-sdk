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
