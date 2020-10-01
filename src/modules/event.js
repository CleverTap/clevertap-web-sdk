// import { api } from './api'
// import { logger } from './util/logger'
// import { isString, isObject } from './util/datatypes'
// import { errors } from './util/messages'
import {
  LCOOKIE_NAME
} from '../util/constants'
// import { today, now } from './util/datetime'
import { StorageManager } from '../util/storage'
export class EventHandler {
  #api
  #logger

  #processingBackup
  #isOptInRequest

  constructor ({
    api,
    logger
  }, cachedQueue) {
    this.#api = api
    this.#logger = logger

    this.#isOptInRequest = false
  }

  push () {

  }

  processBackupEvents () {

    let backupMap = StorageManager.readFromLSorCookie(LCOOKIE_NAME)
    if (backupMap == null) {
      return
    }
    this.#processingBackup = true
    for (let idx in backupMap) {
      if (backupMap.hasOwnProperty(idx)) {
        let backupEvent = backupMap[idx]
        if (backupEvent['fired'] == null) {
          this.#logger.debug('Processing backup event : ' + backupEvent['q'])
          if (backupEvent['q'] != null) {
            wiz.fireRequest(backupEvent['q'])
          }
          backupEvent['fired'] = true
        }
      }
    }
    StorageManager.saveToLSorCookie(LCOOKIE_NAME, backupMap)
    this.#processingBackup = false
  }


  // static _processEventArray = function (eventArr) {
  //   if (!Array.isArray(eventArr)) {
  //     return
  //   }
  
  //   const _errorCallback = function (code, message) {
  //     logger.error(message)
  //   }
  
  //   var data = null
  
  //   while (eventArr.length > 0) {
  //     var eventName = eventArr.shift() // take out name of the event
  
  //     if (!isString(eventName)) {
  //       logger.error(errors.INVALID_EVENT)
  //       return
  //     }
  
  //     if (eventName.length > 1024) {
  //       eventName = eventName.substring(0, 1024)
  //       logger.error(eventName + '... length exceeded 1024 chars. Trimmed.')
  //     }
  
  //     if (['Stayed', 'UTM Visited', 'App Launched', 'Notification Sent', 'Notification Viewed', 'Notification Clicked'].includes(eventName)) {
  //       logger.error(eventName + ' is a restricted system event. It cannot be used as an event name.')
  //       continue
  //     }
  
  //     data = {
  //       type: EVENT_TYPES.EVENT,
  //       ep: now(),
  //       evtName: eventName.replace(unsupportedKeyCharRegex, ''),
  //     }
  
  //     if (eventArr.length !== 0) {
  //       let eventObj = eventArr.shift()
  
  //       if (!isObject(eventObj)) {
  //         eventArr.unshift(eventObj)    // put it back if it is not an object
  //       } else {
  //             //check Charged Event vs. other events.
  //             if (eventName === "Charged") {
  //                 if (!Validator.isChargedEventStructureValid(eventObj), _errorCallback) {
  //                     Utils.reportError(511, "Charged event structure invalid. Not sent.");
  //                     continue;
  //                 }
  //             } else {
  //                 if (!Validator.isEventStructureFlat(eventObj)) {
  //                     Utils.reportError(512, eventName + " event structure invalid. Not sent.");
  //                     continue;
  //                 }
  //             }
  //             data.evtData = eventObj
  //         }
  //     }
  //   }
  //   return data
  // }
}
