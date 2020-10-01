import { logger } from './logger'
import { isObject, isDateObject } from './datatypes'
import { convertToWZRKDate } from './datetime'
import { CHARGED_ID } from './constants'

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

export const isChargedEventStructureValid = (chargedObj) => {
  if (isObject(chargedObj)) {
    for (var key in chargedObj) {
      if (chargedObj.hasOwnProperty(key)) {
        if (key === 'Items') {
          if (!Array.isArray(chargedObj[key])) {
            return false
          }

          if (chargedObj[key].length > 16) {
            logger.error('Charged Items exceed 16 limit. Actual count: ' + chargedObj[key].length + '. Additional items will be dropped.')
          }

          for (var itemKey in chargedObj[key]) {
            if (chargedObj[key].hasOwnProperty(itemKey)) {    // since default array implementation could be overridden - e.g. Teabox site
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

    if (typeof chargedObj[CHARGED_ID] !== 'undefined') {
      const chargedId = chargedObj[CHARGED_ID]

      // TODO from here
      const CHARGEDIDKey = StorageManager.getChargedIdKey();
      if (typeof _globalChargedId === Constants.UNDEFINED) {
        _globalChargedId = StorageManager.read(CHARGEDIDKey);
      }
      if (typeof _globalChargedId !== Constants.UNDEFINED && _globalChargedId === chargedId) {
        //drop event- duplicate charged id
        Utils.log.error("Duplicate charged Id - Dropped" + chargedObj);
        return false;
      }
      _globalChargedId = chargedId;
      StorageManager.save(CHARGEDIDKey, chargedId);
    }
    return true;
  } // if object (chargedObject)
  return false;
}
