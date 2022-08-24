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

  constructor({
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

  push(...profilesArr) {
    this.#processProfileArray(profilesArr)
    return 0
  }

  _processOldValues() {
    if (this.#oldValues) {
      this.#processProfileArray(this.#oldValues)
    }
    this.#oldValues = null
  }

  getAttribute(propName) {
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

  #processProfileArray(profileArr) {
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
  /**
   * 
   * @param {any} key 
   * @param {number} value 
   * @param {string} command
   * increases or decreases value of the number type properties in profile object
   */
  _handleIncrementDecrementValue(key, value, command) {
    // Check if the value is greater than 0
    if (!value || typeof value !== 'number' || value <= 0) {
      console.log("Value should be a number greater than 0")
    }
    //   // Check if the profile map already has the propery defined
    else if (!$ct.globalProfileMap.hasOwnProperty(key)) {
      console.log('Property doesnt exist')
    }
    // Update the profile property in local storage
      
    else {
      if (command === COMMAND_INCREMENT) {
        $ct.globalProfileMap[key] = $ct.globalProfileMap[key] + value
      } else {
        $ct.globalProfileMap[key] = $ct.globalProfileMap[key] - value
      }
      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)

      // Send the updated value to LC
      let data = {}
      const profileObj = {}
      data.type = 'profile'
      profileObj[key] = { [command]: value }
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
  /**
   * 
   * @param {any} key 
   * @param {array} arrayVal 
   * @param {string} command
   * overwrites/sets new value(s) against a key/property in profile object
   */
  _handleMultiValueSet(key, arrayVal, command) {
    let array = []
    for (let i = 0; i < arrayVal.length; i++) {
      if ((typeof arrayVal[i] === 'number' && !array.includes(arrayVal[i])) || !array.includes(arrayVal[i].toLowerCase())) {
        array.push(arrayVal[i]).toLowerCase()
      }
    }
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    $ct.globalProfileMap[key] = array
    StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
    this.sendMultiValueData(key, arrayVal, command)
  }

  /**
   * 
   * @param {any} propKey - the property name to be added in the profile object
   * @param {string, number, array} propVal - the property value to be added against the @propkey key
   * @param {string} command 
   * Adds array or single value against a key/property in profile object
   */
  _handleMultiValueAdd(propKey, propVal, command) {
    var array = []
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    // if the value to be set is either string or number
    if (typeof propVal === 'string' || typeof propVal === 'number') {
      if ($ct.globalProfileMap.hasOwnProperty(propKey)) {
        array = $ct.globalProfileMap[propKey]
        array.push(propVal)
      } else {
        $ct.globalProfileMap[propKey] = propVal
      }
      // if propVal is an array
    } else {
      if ($ct.globalProfileMap.hasOwnProperty(propKey)) {
        array = $ct.globalProfileMap[propKey]
      }
      /**
       * checks for case sensitive inputs and filters the same ones
       */
      for (var i = 0; i < propVal.length; i++) {
        if ((typeof propVal[i] === 'number' && !array.includes(propVal[i])) || (typeof propVal[i] === 'string' && !array.includes(propVal[i].toLowerCase()))) {

          array.push(propVal[i]).toLowerCase()
        }
      }
      $ct.globalProfileMap[propKey] = array
    }
    StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
    this.sendMultiValueData(propKey, propVal, command)
  }

  /**
   * 
   * @param {any} propKey 
   * @param {string, number, array} propVal 
   * @param {string} command
   * removes value(s) against a key/property in profile object
   */
  _handleMultiValueRemove(propKey, propVal, command) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    if (!$ct.globalProfileMap.hasOwnProperty(propKey)) {
      console.log(`The property ${propKey} does not exist.`)
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

  /**
   * 
   * @param {any} propKey 
   * @param {string} command 
   * deletes a key value pair from the profile object
   */
  _handleMultiValueDelete(propKey, command) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    if (!$ct.globalProfileMap.hasOwnProperty(propKey)) {
      console.log(`The property ${propKey} does not exist.`)
    } else {
      delete $ct.globalProfileMap[propKey]
    }
    StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
    this.sendMultiValueData(propKey, null, command)
  }

  sendMultiValueData(propKey, propVal, command) {
    // Send the updated value to LC
    let data = {}
    const profileObj = {}
    data.type = 'profile'

    // this removes the property at backend
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
