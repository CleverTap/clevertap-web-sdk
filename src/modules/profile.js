import {
  isObjectEmpty
} from '../util/datatypes'
import {
  isProfileValid,
  processFBUserObj,
  processGPlusUserObj,
  addToLocalProfileMap
} from '../util/clevertap'
import {
  COMMAND_DELETE,
  COMMAND_INCREMENT,
  EVT_PUSH,
  PR_COOKIE
} from '../util/constants'
import {
  addToURL
} from '../util/url'
import {
  StorageManager,
  $ct
} from '../util/storage'
import { compressData } from '../util/encoder'
export default class ProfileHandler extends Array {
  #logger
  #request
  #account
  #oldValues
  #isPersonalisationActive

  constructor ({
    logger,
    request,
    account,
    isPersonalisationActive
  }, values) {
    super()
    this.#logger = logger
    this.#request = request
    this.#account = account
    this.#oldValues = values
    this.#isPersonalisationActive = isPersonalisationActive
  }

  push (...profilesArr) {
    this.#processProfileArray(profilesArr)
    return 0
  }

  _processOldValues () {
    if (this.#oldValues) {
      this.#processProfileArray(this.#oldValues)
    }
    this.#oldValues = null
  }

  getAttribute (propName) {
    if (!this.#isPersonalisationActive()) {
      return
    }
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    if ($ct.globalProfileMap != null) {
      return $ct.globalProfileMap[propName]
    }
  }

  #processProfileArray (profileArr) {
    if (Array.isArray(profileArr) && profileArr.length > 0) {
      for (const index in profileArr) {
        if (profileArr.hasOwnProperty(index)) {
          const outerObj = profileArr[index]
          let data = {}
          let profileObj
          if (outerObj.Site != null) { // organic data from the site
            profileObj = outerObj.Site
            if (isObjectEmpty(profileObj) || !isProfileValid(profileObj, {
              logger: this.#logger
            })) {
              return
            }
          } else if (outerObj.Facebook != null) { // fb connect data
            const FbProfileObj = outerObj.Facebook
            // make sure that the object contains any data at all

            if (!isObjectEmpty(FbProfileObj) && (!FbProfileObj.error)) {
              profileObj = processFBUserObj(FbProfileObj)
            }
          } else if (outerObj['Google Plus'] != null) {
            const GPlusProfileObj = outerObj['Google Plus']
            if (!isObjectEmpty(GPlusProfileObj) && (!GPlusProfileObj.error)) {
              profileObj = processGPlusUserObj(GPlusProfileObj, { logger: this.#logger })
            }
          }
          if (profileObj != null && (!isObjectEmpty(profileObj))) { // profile got set from above
            data.type = 'profile'
            if (profileObj.tz == null) {
              // try to auto capture user timezone if not present
              profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]
            }

            data.profile = profileObj
            addToLocalProfileMap(profileObj, true)
            data = this.#request.addSystemDataToObject(data, undefined)

            this.#request.addFlags(data)
            const compressedData = compressData(JSON.stringify(data), this.#logger)

            let pageLoadUrl = this.#account.dataPostURL
            pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
            pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

            this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
          }
        }
      }
    }
  }

  _handleIncrementDecrementValue (key, value, commad) {
    if (value <= 0) {
      // Check if the value is greater than 0
      console.log('Value should be greater than 0')
    } else if (!$ct.globalProfileMap.hasOwnProperty(key)) {
      // Check if the profile map already has the propery defined
      console.log('Property doesnt exist')
    } else {
      // Update the profile property in local storage
      if (commad === COMMAND_INCREMENT) {
        $ct.globalProfileMap[key] = $ct.globalProfileMap[key] + value
      } else {
        $ct.globalProfileMap[key] = $ct.globalProfileMap[key] - value
      }
      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)

      // Send the updated value to LC
      let data = {}
      const profileObj = {}
      data.type = 'profile'
      profileObj[key] = { [commad]: value }
      if (profileObj.tz == null) {
        // try to auto capture user timezone if not present
        profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]
      }
      data.profile = profileObj
      data = this.#request.addSystemDataToProfileObject(data, undefined)
      this.#request.addFlags(data)
      const compressedData = compressData(JSON.stringify(data), this.#logger)
      let pageLoadUrl = this.#account.dataPostURL
      pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
      pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

      console.log('page load url ', pageLoadUrl)
      this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
    }
  }

  _handleMultiValueSet (arrayName, arrayVal, command) {
    var array = []
    for (var i = 0; i < arrayVal.length; i++) {
      if ((typeof arrayVal[i] === 'number' && !array.includes(arrayVal[i])) || !array.includes(arrayVal[i].toLowerCase())) {
        array.push(arrayVal[i])
      }
    }
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    $ct.globalProfileMap[arrayName] = array
    StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
    this.sendMultiValueData(arrayName, arrayVal, command)
  }

  _handleMultiValueAdd (propKey, propVal, command) {
    var array = []
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    if (typeof propVal === 'string' || typeof propVal === 'number') {
      if ($ct.globalProfileMap.hasOwnProperty(propKey)) {
        array = $ct.globalProfileMap[propKey]
        array.push(propVal)
      } else {
        $ct.globalProfileMap[propKey] = propVal
      }
    } else {
      if ($ct.globalProfileMap.hasOwnProperty(propKey)) {
        array = $ct.globalProfileMap[propKey]
      }
      for (var i = 0; i < propVal.length; i++) {
        if ((typeof propVal[i] === 'number' && !array.includes(propVal[i])) || (typeof propVal[i] === 'string' && !array.includes(propVal[i].toLowerCase()))) {
          array.push(propVal[i])
        }
      }
      $ct.globalProfileMap[propKey] = array
    }
    StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
    this.sendMultiValueData(propKey, propVal, command)
  }

  _handleMultiValueRemove (propKey, propVal, command) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    if (!$ct.globalProfileMap.hasOwnProperty(propKey)) {
      console.log('Property with this name does not exist. Set the property first')
    } else {
      if (typeof propVal === 'string' || typeof propVal === 'number') {
        var index = $ct.globalProfileMap[propKey].indexOf(propVal)
        if (index !== -1) {
          $ct.globalProfileMap[propKey].splice(index, 1)
        }
      } else {
        for (var k = 0; k < propVal.length; k++) {
          var idx = $ct.globalProfileMap[propKey].indexOf(propVal[k])
          if (idx !== -1) {
            $ct.globalProfileMap[propKey].splice(idx, 1)
          }
        }
      }
    }
    StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
    this.sendMultiValueData(propKey, propVal, command)
  }

  _handleMultiValueDelete (propKey, command) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    if (!$ct.globalProfileMap.hasOwnProperty(propKey)) {
      console.log('Property with this name does not exist. Set the property first')
    } else {
      delete $ct.globalProfileMap[propKey]
    }
    StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
    this.sendMultiValueData(propKey, null, command)
  }

  sendMultiValueData (propKey, propVal, command) {
    // Send the updated value to LC
    let data = {}
    const profileObj = {}
    data.type = 'profile'
    profileObj[propKey] = { [command]: command === COMMAND_DELETE ? true : propVal }
    if (profileObj.tz == null) {
      profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]
    }
    data.profile = profileObj
    data = this.#request.addSystemDataToProfileObject(data, undefined)
    this.#request.addFlags(data)
    const compressedData = compressData(JSON.stringify(data), this.#logger)
    let pageLoadUrl = this.#account.dataPostURL
    pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

    this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
  }
}
