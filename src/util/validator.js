import { isObject, isDateObject, isString, isNumber } from './datatypes'
import { convertToWZRKDate } from './datetime'
import { CHARGED_ID, CHARGEDID_COOKIE_NAME } from './constants'
import { StorageManager } from './storage'

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

export const isChargedEventStructureValid = async (chargedObj, logger) => {
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
        _globalChargedId = await StorageManager.readFromLSorCookie(CHARGEDID_COOKIE_NAME)
      }
      if (typeof _globalChargedId !== 'undefined' && _globalChargedId.trim() === chargedId.trim()) {
        // drop event- duplicate charged id
        logger.error('Duplicate charged Id - Dropped' + chargedObj)
        return false
      }
      _globalChargedId = chargedId
      await StorageManager.saveToLSorCookie(CHARGEDID_COOKIE_NAME, chargedId)
    }
    return true
  } // if object (chargedObject)
  return false
}
