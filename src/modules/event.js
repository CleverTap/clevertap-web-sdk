// // import { api } from './api'
// // import { isString, isObject } from './util/datatypes'
// // import { errors } from './util/messages'
// import {
//   LCOOKIE_NAME,
//   CHARGED_ID,
//   CHARGEDID_COOKIE_NAME
// } from '../util/constants'
// // import { today, now } from './util/datetime'
// import { StorageManager } from '../util/storage'
// import {
//   isString,
//   sanitize,
//   isObject,
//   isDateObject,
//   isNumber,
//   isConvertibleToNumber,
//   isObjectEmpty
// } from '../util/datatypes'
// import {
//   convertToWZRKDate
// } from '../util/datetime'
// import {
//   EVENT_ERROR,
//   GENDER_ERROR,
//   EMPLOYED_ERROR,
//   MARRIED_ERROR,
//   EDUCATION_ERROR,
//   AGE_ERROR,
//   DOB_ERROR,
//   PHONE_FORMAT_ERROR
// } from '../util/messages'
// export class EventHandler {
//   #api
//   #logger

//   #processingBackup
//   #isOptInRequest

//   constructor ({
//     api,
//     logger
//   }, cachedQueue) {
//     this.#api = api
//     this.#logger = logger
//     this.processingBackup = false
//     this.#isOptInRequest = false
//   }

//   push () {

//   }

//   processBackupEvents () {

//     let backupMap = StorageManager.readFromLSorCookie(LCOOKIE_NAME)
//     if (backupMap == null) {
//       return
//     }
//     this.#processingBackup = true
//     for (let idx in backupMap) {
//       if (backupMap.hasOwnProperty(idx)) {
//         let backupEvent = backupMap[idx]
//         if (backupEvent['fired'] == null) {
//           this.#logger.debug('Processing backup event : ' + backupEvent['q'])
//           if (backupEvent['q'] != null) {
//             this.#api.fireRequest(backupEvent['q'])
//           }
//           backupEvent['fired'] = true
//         }
//       }
//     }
//     StorageManager.saveToLSorCookie(LCOOKIE_NAME, backupMap)
//     this.#processingBackup = false
//   }

//   isEventStructureFlat (eventObj) {
//     // events can't have any nested structure or arrays
//     if (isObject(eventObj)) {
//       for (let key in eventObj) {
//         if (eventObj.hasOwnProperty(key)) {
//           if (isObject(eventObj[key]) || Array.isArray(eventObj[key])) {
//             return false
//           } else if (isDateObject(eventObj[key])) {
//             eventObj[key] = convertToWZRKDate(eventObj[key])
//           }
//         }
//       }
//       return true
//     }
//     return false
//   }

//   isChargedEventStructureValid  (chargedObj) {
//     if (isObject(chargedObj)) {
//       for (let key in chargedObj) {
//         if (chargedObj.hasOwnProperty(key)) {
//           if (key == 'Items') {
//             if (!Array.isArray(chargedObj[key])) {
//               return false
//             }

//             if (chargedObj[key].length > 16) {
//               this.#logger.reportError(522, 'Charged Items exceed 16 limit. Actual count: ' + chargedObj[key].length + '. Additional items will be dropped.')
//             }

//             for (let itemKey in chargedObj[key]) {
//               if (chargedObj[key].hasOwnProperty(itemKey)) {    // since default array implementation could be overridden - e.g. Teabox site
//                 if (!isObject(chargedObj[key][itemKey]) || !isEventStructureFlat(chargedObj[key][itemKey])) {
//                   return false
//                 }
//               }
//             }
//           } else { //Items
//             if (isObject(chargedObj[key]) || Array.isArray(chargedObj[key])) {
//               return false
//             } else if (isDateObject(chargedObj[key])) {
//               chargedObj[key] = convertToWZRKDate(chargedObj[key])
//             }
//           }
//         }
//       }
//       //save charged Id
//       if (isString(chargedObj[CHARGED_ID]) || isNumber(chargedObj[CHARGED_ID])) {
//         let chargedId = chargedObj[CHARGED_ID] + '' //casting chargeedId to string
//         if (globalChargedId == null) {
//           globalChargedId = StorageManager.readFromLSorCookie(CHARGEDID_COOKIE_NAME)
//         }
//         if (globalChargedId != null && globalChargedId.trim() === chargedId.trim()) {
//           //drop event- duplicate charged id
//           this.#logger.error('Duplicate Charged Id - Dropped' + chargedObj)
//           return false
//         }
//         globalChargedId = chargedId
//         StorageManager.saveToLSorCookie(CHARGEDID_COOKIE_NAME, chargedId)
//       }
//       return true
//     } // if object (chargedObject)
//     return false
//   }

//   processEventArray (eventArr) {

//     if (Array.isArray(eventArr)) {

//       /** looping since the events could be fired in quick succession, and we could end up
//        with multiple pushes without getting a chance to process
//        */
//       while (eventArr.length > 0) {
//         let eventName = eventArr.shift() // take out name of the event

//         if (!isString(eventName)) {
//           this.#logger.error(EVENT_ERROR)
//           return
//         }

//         if (eventName.length > 1024) {
//           eventName = eventName.substring(0, 1024)
//           this.#logger.reportError(510, eventName + '... length exceeded 1024 chars. Trimmed.')
//         }

//         if ([
//           'Stayed',
//           'UTM Visited',
//           'App Launched',
//           'Notification Sent',
//           'Notification Viewed',
//           'Notification Clicked'
//         ].includes(eventName)) {
//           this.#logger.reportError(513, eventName + ' is a restricted system event. It cannot be used as an event name.')
//           continue
//         }
//         let data = {}
//         data['type'] = 'event'
// data['evtName'] = sanitize(eventName, unsupportedKeyCharRegex)

// if (eventArr.length != 0) {
//   let eventObj = eventArr.shift()
//   if (!isObject(eventObj)) {
//     eventArr.unshift(eventObj)    // put it back if it is not an object
//   } else {
//     //check Charged Event vs. other events.
//     if (eventName == 'Charged') {
//       if (!wiz.isChargedEventStructureValid(eventObj)) {
//         wiz.reportError(511, "Charged event structure invalid. Not sent.");
//         continue;
//       }
//     } else {
//       if (!wiz.isEventStructureFlat(eventObj)) {
//         wiz.reportError(512, eventName + " event structure invalid. Not sent.");
//         continue;
//       }

//     }

//     data['evtData'] = eventObj;
//   }
// }
// processEvent(data);

//       }

//     }
//   }

//   isProfileValid (profileObj) {
//     if (isObject(profileObj)) {
//       for (let profileKey in profileObj) {
//         if (profileObj.hasOwnProperty(profileKey)) {
//           let valid = true
//           let profileVal = profileObj[profileKey]

//           if (profileVal == null) {
//             delete profileObj[profileKey]
//             continue
//           }
//           if (profileKey == 'Gender' && !profileVal.match(/^M$|^F$/)) {
//             valid = false
//             this.#logger.error(GENDER_ERROR)
//           }

//           if (profileKey == 'Employed' && !profileVal.match(/^Y$|^N$/)) {
//             valid = false
//             this.#logger.error(EMPLOYED_ERROR)
//           }

//           if (profileKey == 'Married' && !profileVal.match(/^Y$|^N$/)) {
//             valid = false
//             this.#logger.error(MARRIED_ERROR)
//           }

//           if (profileKey == 'Education' && !profileVal.match(/^School$|^College$|^Graduate$/)) {
//             valid = false
//             this.#logger.error(EDUCATION_ERROR)
//           }

//           if (profileKey == 'Age' && profileVal != null) {
//             if (isConvertibleToNumber(profileVal)) {
//               profileObj['Age'] = +profileVal
//             } else {
//               valid = false
//               this.#logger.error(AGE_ERROR)
//             }
//           }
//           // dob will come in like this - $dt_19470815 or dateObject
//           if (profileKey == 'DOB') {
//             if (((!(/^\$D_/).test(profileVal) || (profileVal + '').length != 11)) && !isDateObject(profileVal)) {
//               valid = false
//               this.#logger.error(DOB_ERROR)
//             }

//             if (isDateObject(profileVal)) {
//               profileObj[profileKey] = convertToWZRKDate(profileVal)
//             }
//           } else if (isDateObject(profileVal)) {
//             profileObj[profileKey] = convertToWZRKDate(profileVal)
//           }

//           if (profileKey == 'Phone' && !isObjectEmpty(profileVal)) {
//             if (profileVal.length > 8 && (profileVal.charAt(0) == '+')) { // valid phone number
//               profileVal = profileVal.substring(1, profileVal.length)
//               if (isConvertibleToNumber(profileVal)) {
//                 profileObj['Phone'] = +profileVal
//               } else {
//                 valid = false
//                 this.#logger.error(PHONE_FORMAT_ERROR + '. Removed.')
//               }
//             } else {
//               valid = false
//               this.#logger.error(PHONE_FORMAT_ERROR + '. Removed.')
//             }
//           }

//           if (!valid) {
//             delete profileObj[profileKey]
//           }
//         }
//       }
//     }
//     return valid
//   }

//   processProfileArray (profileArr) {
//     if (Array.isArray(profileArr) && profileArr.length > 0) {

//       for (let index in profileArr) {
//         if(profileArr.hasOwnProperty(index)) {
//           let outerObj = profileArr[index]
//           let data = {}
//           let profileObj
//           if (outerObj['Site'] != null) {       //organic data from the site
//             profileObj = outerObj['Site']
//             if (isObjectEmpty(profileObj) || !this.isProfileValid(profileObj)) {
//               return
//             }

//           } else if (outerObj['Facebook'] != null) {   //fb connect data
//             var FbProfileObj = outerObj['Facebook']
//             //make sure that the object contains any data at all

//             if (!isObjectEmpty(FbProfileObj) && (!FbProfileObj['error'])) {
//               profileObj = wiz.processFBUserObj(FbProfileObj);
//             }

//           } else if (typeof outerObj['Google Plus'] != STRING_CONSTANTS.UNDEFINED) {
//             var GPlusProfileObj = outerObj['Google Plus'];
//             if (!wzrk_util.isObjectEmpty(GPlusProfileObj) && (!GPlusProfileObj['error'])) {
//               profileObj = wiz.processGPlusUserObj(GPlusProfileObj);
//             }
//           }
//           if (typeof profileObj != STRING_CONSTANTS.UNDEFINED && (!wzrk_util.isObjectEmpty(profileObj))) {   // profile got set from above
//             data['type'] = "profile";
//             if (typeof profileObj['tz'] === STRING_CONSTANTS.UNDEFINED) {
//               //try to auto capture user timezone if not present
//               profileObj['tz'] = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
//             }

//             data['profile'] = profileObj;
//             wiz.addToLocalProfileMap(profileObj, true);
//             data = wiz.addSystemDataToObject(data, undefined);

//             wiz.addFlags(data);
//             var compressedData = wiz.compressData(JSON.stringify(data));

//             var pageLoadUrl = dataPostURL;
//             pageLoadUrl = wiz.addToURL(pageLoadUrl, "type", EVT_PUSH);
//             pageLoadUrl = wiz.addToURL(pageLoadUrl, "d", compressedData);

//             wiz.saveAndFireRequest(pageLoadUrl, blockRequeust);

//           }
//         }
//       }
//     }
//   }

//   processFBUserObj (user) {
//     let profileData = {}
//     profileData['Name'] = user['name']
//     if (user['id'] != null) {
//       profileData['FBID'] = user['id'] + ''
//     }
//     // Feb 2014 - FB announced over 58 gender options, hence we specifically look for male or female.
//     if (user['gender'] == 'male') {
//       profileData['Gender'] = 'M'
//     } else if (user['gender'] == 'female') {
//       profileData['Gender'] = 'F'
//     } else {
//       profileData['Gender'] = 'O'
//     }

//     let getHighestEducation = function (eduArr) {
//       if (eduArr != null) {
//         let college = ''
//         let highschool = ''

//         for (let i = 0; i < eduArr.length; i++) {
//           let edu = eduArr[i]
//           if (edu.type != null) {
//             let type = edu.type
//             if (type == 'Graduate School') {
//               return 'Graduate'
//             } else if (type == 'College') {
//               college = '1'
//             } else if (type == 'High School') {
//               highschool = '1'
//             }
//           }
//         }

//         if (college == '1') {
//           return 'College'
//         } else if (highschool == '1') {
//           return 'School'
//         }
//       }

//     }; --TODO

//     if (user['relationship_status'] != STRING_CONSTANTS.UNDEFINED) {
//       profileData['Married'] = 'N';
//       if (user['relationship_status'] == 'Married') {
//         profileData['Married'] = 'Y';
//       }
//     }

//     var edu = getHighestEducation(user['education']);
//     if (typeof edu !== "undefined") {
//       profileData['Education'] = edu;
//     }

//     var work = (typeof user['work'] !== STRING_CONSTANTS.UNDEFINED) ? user['work'].length : 0;
//     if (work > 0) {
//       profileData['Employed'] = 'Y';
//     } else {
//       profileData['Employed'] = 'N';
//     }

//     if (typeof user['email'] !== "undefined") {
//       profileData['Email'] = user['email'];
//     }

//     if (typeof user['birthday'] !== "undefined") {
//       var mmddyy = user['birthday'].split('/'); //comes in as "08/15/1947"
//       profileData['DOB'] = $WZRK_WR.setDate(mmddyy[2] + mmddyy[0] + mmddyy[1]);
//     }
//     return profileData;
//   }
// }

import { isString, isObject, sanitize } from '../util/datatypes'
import { EVENT_ERROR } from '../util/messages'
import { EV_COOKIE, SYSTEM_EVENTS, unsupportedKeyCharRegex } from '../util/constants'
import { isChargedEventStructureValid, isEventStructureFlat } from '../util/validator'
import { StorageManager, $ct } from '../util/storage'

export default class EventHandler extends Array {
  #logger
  #oldValues
  #request
  #isPersonalisationActive

  constructor ({ logger, request, isPersonalisationActive }, values) {
    super()
    this.#logger = logger
    this.#oldValues = values
    this.#request = request
    this.#isPersonalisationActive = isPersonalisationActive
  }

  push (...eventsArr) {
    this.#processEventArray(eventsArr)
    return 0
  }

  _processOldValues () {
    if (this.#oldValues) {
      this.#processEventArray(this.#oldValues)
    }
    this.#oldValues = null
  }

  #processEventArray (eventsArr) {
    if (Array.isArray(eventsArr)) {
      while (eventsArr.length > 0) {
        var eventName = eventsArr.shift()
        if (!isString(eventName)) {
          this.#logger.error(EVENT_ERROR)
          continue
        }

        if (eventName.length > 1024) {
          eventName = eventName.substring(0, 1024)
          this.#logger.reportError(510, eventName + '... length exceeded 1024 chars. Trimmed.')
        }

        if (SYSTEM_EVENTS.includes(eventName)) {
          this.#logger.reportError(513, eventName + ' is a restricted system event. It cannot be used as an event name.')
          continue
        }

        const data = {}
        data.type = 'event'
        data.evtName = sanitize(eventName, unsupportedKeyCharRegex)

        if (eventsArr.length !== 0) {
          const eventObj = eventsArr.shift()
          if (!isObject(eventObj)) {
            // put it back if it is not an object
            eventsArr.unshift(eventObj)
          } else {
            // check Charged Event vs. other events.
            if (eventName === 'Charged') {
              if (!isChargedEventStructureValid(eventObj, this.#logger)) {
                this.#logger.reportError(511, 'Charged event structure invalid. Not sent.')
                continue
              }
            } else {
              if (!isEventStructureFlat(eventObj)) {
                this.#logger.reportError(512, eventName + ' event structure invalid. Not sent.')
                continue
              }
            }
            data.evtData = eventObj
          }
        }

        this.#request.processEvent(data)
      }
    }
  }

  getDetails (evtName) {
    if (!this.#isPersonalisationActive()) {
      return
    }
    if (typeof $ct.globalEventsMap === 'undefined') {
      $ct.globalEventsMap = StorageManager.readFromLSorCookie(EV_COOKIE)
    }
    if (typeof $ct.globalEventsMap === 'undefined') {
      return
    }
    const evtObj = $ct.globalEventsMap[evtName]
    const respObj = {}
    if (typeof evtObj !== 'undefined') {
      respObj.firstTime = new Date(evtObj[1] * 1000)
      respObj.lastTime = new Date(evtObj[2] * 1000)
      respObj.count = evtObj[0]
      return respObj
    }
  }
}
