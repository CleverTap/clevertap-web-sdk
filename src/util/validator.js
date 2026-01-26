import { isObject, isDateObject, isString, isNumber } from './datatypes'
import { convertToWZRKDate } from './datetime'
import { CHARGED_ID, CHARGEDID_COOKIE_NAME, NESTED_OBJECT_ERRORS } from './constants'
import { StorageManager } from './storage'

// Destructure error constants for cleaner code
const {
  DEPTH_LIMIT_EXCEEDED,
  ARRAY_KEY_COUNT_LIMIT_EXCEEDED,
  OBJECT_KEY_COUNT_LIMIT_EXCEEDED,
  ARRAY_LENGTH_LIMIT_EXCEEDED,
  KV_PAIR_COUNT_LIMIT_EXCEEDED,
  NULL_VALUE_REMOVED,
  EMPTY_VALUE_REMOVED
} = NESTED_OBJECT_ERRORS

let _globalChargedId

export const isEventStructureFlat = (eventObj) => {
  // Events cannot have nested structure or Arrays
  if (isObject(eventObj)) {
    for (var key in eventObj) {
      if (eventObj.hasOwnProperty(key)) {
        if (isObject(eventObj[key]) || Array.isArray(eventObj[key])) {
          return false
        } else if (isDateObject(eventObj[key])) {
          eventObj[key] = convertToWZRKDate(eventObj[key])
        }
      }
    }
    return true
  }
  return false
}

export const isChargedEventStructureValid = (chargedObj, logger) => {
  if (isObject(chargedObj)) {
    for (var key in chargedObj) {
      if (chargedObj.hasOwnProperty(key)) {
        if (key === 'Items') {
          if (!Array.isArray(chargedObj[key])) {
            return false
          }

          if (chargedObj[key].length > 50) {
            logger.reportError(522, 'Charged Items exceed 50 limit. Actual count: ' + chargedObj[key].length)
          }

          for (var itemKey in chargedObj[key]) {
            if (chargedObj[key].hasOwnProperty(itemKey)) { // since default array implementation could be overridden - e.g. Teabox site
              if (!isObject(chargedObj[key][itemKey]) || !isEventStructureFlat(chargedObj[key][itemKey])) {
                return false
              }
            }
          }
        } else {
          if (isObject(chargedObj[key]) || Array.isArray(chargedObj[key])) {
            return false
          } else if (isDateObject(chargedObj[key])) {
            chargedObj[key] = convertToWZRKDate(chargedObj[key])
          }
        }
      }
    }

    if (isString(chargedObj[CHARGED_ID]) || isNumber(chargedObj[CHARGED_ID])) {
      // save charged Id
      const chargedId = chargedObj[CHARGED_ID] + '' // casting chargedId to string

      if (typeof _globalChargedId === 'undefined') {
        _globalChargedId = StorageManager.readFromLSorCookie(CHARGEDID_COOKIE_NAME)
      }
      if (typeof _globalChargedId !== 'undefined' && _globalChargedId.trim() === chargedId.trim()) {
        // drop event- duplicate charged id
        logger.error('Duplicate charged Id - Dropped' + chargedObj)
        return false
      }
      _globalChargedId = chargedId
      StorageManager.saveToLSorCookie(CHARGEDID_COOKIE_NAME, chargedId)
    }
    return true
  } // if object (chargedObject)
  return false
}

// Validation results structure
const createValidationResult = (isValid, errorMessage = null, processedObj = null) => ({
  isValid,
  errorMessage,
  processedObj
})

// Helper function to check if object/array is null or empty
const isNullOrEmpty = (obj) => {
  if (obj === null || obj === undefined) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (isObject(obj)) return Object.keys(obj).length === 0
  return false
}

// Helper function to clean null/empty objects and arrays
// Expected behavior:
// - Removes null, undefined values
// - Removes empty objects {} and empty arrays []
// - If part of an array, drops that element entirely
// - Recursively cleans nested structures
const cleanNullEmptyValues = (obj, logger = null, currentDepth = 0, maxDepth = 3, keyPath = '') => {
  if (currentDepth > maxDepth) return obj

  if (Array.isArray(obj)) {
    const cleanedArray = []
    obj.forEach((item, index) => {
      if (isNullOrEmpty(item)) {
        if (logger) {
          const currentKeyPath = keyPath ? `${keyPath}[${index}]` : `[${index}]`
          if (item === null || item === undefined) {
            logger.reportError(NULL_VALUE_REMOVED.code, NULL_VALUE_REMOVED.message.replace('%s', currentKeyPath))
          } else {
            logger.reportError(EMPTY_VALUE_REMOVED.code, EMPTY_VALUE_REMOVED.message.replace('%s', currentKeyPath))
          }
        }
        return
      }

      let cleanedItem = item
      if (isObject(item) || Array.isArray(item)) {
        const currentKeyPath = keyPath ? `${keyPath}[${index}]` : `[${index}]`
        cleanedItem = cleanNullEmptyValues(item, logger, currentDepth + 1, maxDepth, currentKeyPath)
      }

      if (!isNullOrEmpty(cleanedItem)) {
        cleanedArray.push(cleanedItem)
      } else if (logger) {
        const currentKeyPath = keyPath ? `${keyPath}[${index}]` : `[${index}]`
        logger.reportError(EMPTY_VALUE_REMOVED.code, EMPTY_VALUE_REMOVED.message.replace('%s', currentKeyPath))
      }
    })

    return cleanedArray.length > 0 ? cleanedArray : undefined
  }

  if (isObject(obj)) {
    const cleanedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key]
        const currentKeyPath = keyPath ? `${keyPath}.${key}` : key

        if (isDateObject(value)) {
          value = convertToWZRKDate(value)
        } else if (isObject(value) || Array.isArray(value)) {
          value = cleanNullEmptyValues(value, logger, currentDepth + 1, maxDepth, currentKeyPath)
        }

        if (!isNullOrEmpty(value)) {
          cleanedObj[key] = value
        } else if (logger) {
          if (value === null || value === undefined) {
            logger.reportError(NULL_VALUE_REMOVED.code, NULL_VALUE_REMOVED.message.replace('%s', currentKeyPath))
          } else {
            logger.reportError(EMPTY_VALUE_REMOVED.code, EMPTY_VALUE_REMOVED.message.replace('%s', currentKeyPath))
          }
        }
      }
    }
    return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined
  }

  return obj
}

// Validate 3-level nested event structure
export const isObjStructureValid = (eventObj, logger, maxDepth = 3) => {
  if (!isObject(eventObj)) {
    return createValidationResult(false, 'Event data must be an object')
  }

  // Clean null/empty values first
  const cleanedObj = cleanNullEmptyValues(eventObj, logger, 0, maxDepth)

  if (isNullOrEmpty(cleanedObj)) {
    return createValidationResult(false, 'Event object is empty after cleaning null/empty values')
  }

  // Validate nesting depth
  let maxDepthFound = 0
  const validateDepth = (obj, currentDepth = 0) => {
    if (currentDepth > maxDepth) {
      maxDepthFound = currentDepth
      return false
    }

    if (isObject(obj)) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (Array.isArray(obj[key])) {
            for (const item of obj[key]) {
              if (isObject(item) && !validateDepth(item, currentDepth + 1)) {
                return false
              }
            }
          } else if (isObject(obj[key])) {
            if (!validateDepth(obj[key], currentDepth + 1)) {
              return false
            }
          }
        }
      }
    }
    return true
  }

  if (!validateDepth(cleanedObj)) {
    const depthMessage = DEPTH_LIMIT_EXCEEDED.message
      .replace('%s', maxDepthFound)
      .replace('%s', maxDepth)
    logger.reportError(DEPTH_LIMIT_EXCEEDED.code, depthMessage)
    return createValidationResult(false, `Maximum nesting depth of ${maxDepth} levels exceeded`, cleanedObj)
  }

  // Helper function to count object/array keys at a specific level
  const countObjectArrayKeys = (obj) => {
    if (!isObject(obj)) return 0
    let count = 0
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (isObject(obj[key]) || Array.isArray(obj[key])) {
          count++
        }
      }
    }
    return count
  }

  // Count object/array keys at root level (0th level)
  const rootObjectArrayCount = countObjectArrayKeys(cleanedObj)
  if (rootObjectArrayCount > 5) {
    const objectKeyMessage = OBJECT_KEY_COUNT_LIMIT_EXCEEDED.message
      .replace('%s', rootObjectArrayCount)
      .replace('%s', 5)
    logger.reportError(OBJECT_KEY_COUNT_LIMIT_EXCEEDED.code, objectKeyMessage)
    return createValidationResult(false, `Maximum 5 object/array keys allowed at root level. Found: ${rootObjectArrayCount}`, cleanedObj)
  }

  // Validate object/array count at each nested level
  const validateObjectArrayCount = (obj, currentDepth = 0) => {
    if (!isObject(obj) || currentDepth > maxDepth) return true

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          // Check array length limit
          if (obj[key].length > 100) {
            const arrayLengthMessage = ARRAY_LENGTH_LIMIT_EXCEEDED.message
              .replace('%s', obj[key].length)
              .replace('%s', 100)
            logger.reportError(ARRAY_LENGTH_LIMIT_EXCEEDED.code, arrayLengthMessage)
            return false
          }

          // Validate each array element
          for (const item of obj[key]) {
            if (isObject(item)) {
              const itemObjectArrayCount = countObjectArrayKeys(item)
              if (itemObjectArrayCount > 5) {
                const arrayKeyMessage = ARRAY_KEY_COUNT_LIMIT_EXCEEDED.message
                  .replace('%s', itemObjectArrayCount)
                  .replace('%s', 5)
                logger.reportError(ARRAY_KEY_COUNT_LIMIT_EXCEEDED.code, arrayKeyMessage)
                return false
              }
              if (!validateObjectArrayCount(item, currentDepth + 1)) {
                return false
              }
            }
          }
        } else if (isObject(obj[key])) {
          const nestedObjectArrayCount = countObjectArrayKeys(obj[key])
          if (nestedObjectArrayCount > 5) {
            const nestedObjectKeyMessage = OBJECT_KEY_COUNT_LIMIT_EXCEEDED.message
              .replace('%s', nestedObjectArrayCount)
              .replace('%s', 5)
            logger.reportError(OBJECT_KEY_COUNT_LIMIT_EXCEEDED.code, nestedObjectKeyMessage)
            return false
          }
          if (!validateObjectArrayCount(obj[key], currentDepth + 1)) {
            return false
          }
        }
      }
    }
    return true
  }

  // Helper function to count total attribute keys recursively
  const countTotalKeys = (obj, currentDepth = 0, maxDepth = 3) => {
    if (!isObject(obj) || currentDepth > maxDepth) return 0

    let count = 0
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        count++ // Count this key

        if (Array.isArray(obj[key])) {
        // Count keys in array elements
          for (const item of obj[key]) {
            if (isObject(item)) {
              count += countTotalKeys(item, currentDepth + 1, maxDepth)
            }
          }
        } else if (isObject(obj[key])) {
        // Count keys in nested object
          count += countTotalKeys(obj[key], currentDepth + 1, maxDepth)
        }
      }
    }
    return count
  }

  if (!validateObjectArrayCount(cleanedObj)) {
    return createValidationResult(false, 'Nested object/array count validation failed', cleanedObj)
  }

  // Count total attribute keys
  const totalKeyCount = countTotalKeys(cleanedObj)
  if (totalKeyCount > 100) {
    const kvPairMessage = KV_PAIR_COUNT_LIMIT_EXCEEDED.message
      .replace('%s', totalKeyCount)
      .replace('%s', 100)
    logger.reportError(KV_PAIR_COUNT_LIMIT_EXCEEDED.code, kvPairMessage)
    return createValidationResult(false, `Maximum 100 attribute keys allowed. Found: ${totalKeyCount}`, cleanedObj)
  }

  return createValidationResult(true, null, cleanedObj)
}
