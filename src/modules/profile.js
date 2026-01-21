import {
  isObjectEmpty
} from '../util/datatypes'
import {
  isProfileValid,
  processFBUserObj,
  processGPlusUserObj,
  addToLocalProfileMap,
  parseNestedPath,
  getNestedValue,
  setNestedValue,
  removeNestedValue
} from '../util/clevertap'
import {
  ACCOUNT_ID,
  COMMAND_DELETE,
  COMMAND_INCREMENT,
  EVT_PUSH,
  PR_COOKIE,
  PROFILE_RESTRICTED_ROOT_KEYS,
  NESTED_OBJECT_ERRORS
} from '../util/constants'
import {
  addToURL
} from '../util/url'
import {
  StorageManager,
  $ct
} from '../util/storage'
import { compressData } from '../util/encoder'
import { isObjStructureValid } from '../util/validator'
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
    if (StorageManager.readFromLSorCookie(ACCOUNT_ID)) {
      this.#processProfileArray(profilesArr)
      return 0
    } else {
      this.#logger.error('Account ID is not set')
    }
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
            if (isObjectEmpty(profileObj)) {
              return
            }
            const validationResult = isObjStructureValid(profileObj, this.#logger, 3)
            // Validation errors are already logged via logger.reportError in validator
            // Use cleaned object if provided (even if validation failed)
            // This removes null/empty values that were logged
            if (validationResult.processedObj) {
              profileObj = validationResult.processedObj
            }

            // Profile-specific validation: Drop restricted keys at root level
            profileObj = this.#filterRestrictedKeys(profileObj)
            if (!isProfileValid(profileObj, { logger: this.#logger })) {
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
   * Filters out restricted keys from profile object and logs errors
   * @param {Object} profileObj - The profile object to filter
   * @returns {Object} Filtered profile object without restricted keys
   * @private
   */
  #filterRestrictedKeys (profileObj) {
    const finalProfileObj = {}
    for (const key in profileObj) {
      if (profileObj.hasOwnProperty(key)) {
        if (PROFILE_RESTRICTED_ROOT_KEYS.includes(key)) {
          this.#logger.reportError(
            NESTED_OBJECT_ERRORS.RESTRICTED_PROFILE_PROPERTY.code,
            NESTED_OBJECT_ERRORS.RESTRICTED_PROFILE_PROPERTY.message.replace('%s', key)
          )
        } else {
          finalProfileObj[key] = profileObj[key]
        }
      }
    }
    return finalProfileObj
  }

  /**
   * Validates, cleans, and sends profile data to backend
   * @param {Object} profileObj - The profile object to send
   * @private
   */
  #validateAndSendProfile (profileObj) {
    if (profileObj.tz == null) {
      profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]
    }

    const validationResult = isObjStructureValid(profileObj, this.#logger, 3)
    if (validationResult.processedObj) {
      const cleanedProfileObj = validationResult.processedObj
      const finalProfileObj = this.#filterRestrictedKeys(cleanedProfileObj)

      if (isObjectEmpty(finalProfileObj)) {
        return
      }

      let data = {}
      data.type = 'profile'
      data.profile = finalProfileObj
      data = this.#request.addSystemDataToObject(data, true)

      this.#request.addFlags(data)
      const compressedData = compressData(JSON.stringify(data), this.#logger)
      let pageLoadUrl = this.#account.dataPostURL
      pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
      pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

      this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
    }
  }

  /**
   *
   * @param {any} key - Can be a simple key or nested path like "Policy[0].price"
   * @param {number} value
   * @param {string} command
   * increases or decreases value of the number type properties in profile object
   */
  _handleIncrementDecrementValue (key, value, command) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    if ($ct.globalProfileMap == null) {
      console.error('Profile map is not initialized. Please create a profile first.')
      return
    }
    if (!value || typeof value !== 'number' || value <= 0) {
      console.error('Value should be a number greater than 0')
      return
    }

    const isNestedPath = key.includes('.') || key.includes('[')
    const profileObj = {}

    if (isNestedPath) {
      const segments = parseNestedPath(key)
      if (segments.length === 0) {
        console.error('Invalid nested path format.')
        return
      }

      const currentValue = getNestedValue($ct.globalProfileMap, segments)
      if (currentValue === undefined) {
        console.error(`Path '${key}' does not exist in profile. Please create the profile structure first.`)
        return
      }

      if (typeof currentValue !== 'number') {
        console.error(`Value at path '${key}' is not a number. Cannot increment/decrement.`)
        return
      }

      const newValue = command === COMMAND_INCREMENT
        ? currentValue + value
        : currentValue - value

      if (!setNestedValue($ct.globalProfileMap, segments, newValue)) {
        console.error(`Failed to update value at path '${key}'.`)
        return
      }

      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      // Use flat key notation (e.g., "Trip[0].Total Amount") instead of nested structure
      profileObj[key] = { [command]: value }
    } else {
      if (!$ct.globalProfileMap.hasOwnProperty(key)) {
        console.error('Kindly create profile with required property to increment/decrement.')
        return
      }

      const currentValue = $ct.globalProfileMap[key] || 0
      $ct.globalProfileMap[key] = command === COMMAND_INCREMENT
        ? currentValue + value
        : currentValue - value

      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      profileObj[key] = { [command]: value }
    }

    this.#validateAndSendProfile(profileObj)
  }

  /**
   *
   * @param {any} key - the property name. Can be a simple key or nested path like "Trip[0].Emergency Contacts[0].Tags"
   * @param {array} arrayVal
   * @param {string} command
   * overwrites/sets new value(s) against a key/property in profile object
   */
  _handleMultiValueSet (key, arrayVal, command) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE) ?? {}
    }

    // Build the normalized array
    const array = []
    for (let i = 0; i < arrayVal.length; i++) {
      if (typeof arrayVal[i] === 'number' && !array.includes(arrayVal[i])) {
        array.push(arrayVal[i])
      } else if (typeof arrayVal[i] === 'string' && !array.includes(arrayVal[i].toLowerCase())) {
        array.push(arrayVal[i].toLowerCase())
      } else if (typeof arrayVal[i] !== 'number' && typeof arrayVal[i] !== 'string') {
        this.#logger.error('Array supports only string or number type values')
      }
    }

    const isNestedPath = key.includes('.') || key.includes('[')

    if (isNestedPath) {
      const segments = parseNestedPath(key)
      if (segments.length === 0) {
        this.#logger.error('Invalid nested path format.')
        return
      }

      // Get the last segment (the property we want to set)
      const lastSegment = segments[segments.length - 1]
      if (lastSegment.type !== 'key') {
        this.#logger.error('The last segment of the path must be a property key, not an array index.')
        return
      }

      // Get parent path segments (all except last)
      const parentSegments = segments.slice(0, -1)

      // Navigate to the parent object
      let parentObj
      if (parentSegments.length === 0) {
        parentObj = $ct.globalProfileMap
      } else {
        parentObj = getNestedValue($ct.globalProfileMap, parentSegments)
        if (parentObj === undefined || parentObj === null) {
          this.#logger.error('Parent path does not exist in profile. Please create the profile structure first.')
          return
        }
        if (typeof parentObj !== 'object' || Array.isArray(parentObj)) {
          this.#logger.error('Parent path does not point to an object.')
          return
        }
      }

      // Set the array at the target key
      parentObj[lastSegment.value] = array

      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      this.sendMultiValueData(key, arrayVal, command, true)
    } else {
      // Simple key handling (existing logic)
      $ct.globalProfileMap[key] = array
      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      this.sendMultiValueData(key, arrayVal, command, false)
    }
  }

  /**
   *
   * @param {any} propKey - the property name to be added in the profile object. Can be a simple key or nested path like "Trip[0].Emergency Contacts[0].Greet"
   * @param {string, number, array} propVal - the property value to be added against the @propkey key
   * @param {string} command
   * Adds array or single value against a key/property in profile object
   */
  _handleMultiValueAdd (propKey, propVal, command) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE) || {}
    }

    const isNestedPath = propKey.includes('.') || propKey.includes('[')

    // Helper to normalize and add values to array
    const addValue = (array, value) => {
      const normalizedValue = typeof value === 'number' ? value : value.toLowerCase()
      if (!array.includes(normalizedValue)) {
        array.push(normalizedValue)
      }
    }

    // Helper to process propVal and add to array
    const processAndAddValues = (array) => {
      if (Array.isArray(propVal)) {
        propVal.forEach(value => {
          if (typeof value === 'string' || typeof value === 'number') {
            addValue(array, value)
          } else {
            this.#logger.error('Array supports only string or number type values')
          }
        })
      } else if (typeof propVal === 'string' || typeof propVal === 'number') {
        addValue(array, propVal)
      } else {
        this.#logger.error('Unsupported value type')
        return false
      }
      return true
    }

    if (isNestedPath) {
      const segments = parseNestedPath(propKey)
      if (segments.length === 0) {
        this.#logger.error('Invalid nested path format.')
        return
      }

      // Get the last segment (the property we want to add to)
      const lastSegment = segments[segments.length - 1]
      if (lastSegment.type !== 'key') {
        this.#logger.error('The last segment of the path must be a property key, not an array index.')
        return
      }

      // Get parent path segments (all except last)
      const parentSegments = segments.slice(0, -1)

      // Navigate to the parent object
      let parentObj
      if (parentSegments.length === 0) {
        parentObj = $ct.globalProfileMap
      } else {
        parentObj = getNestedValue($ct.globalProfileMap, parentSegments)
        if (parentObj === undefined || parentObj === null) {
          this.#logger.error('Parent path does not exist in profile. Please create the profile structure first.')
          return
        }
        if (typeof parentObj !== 'object' || Array.isArray(parentObj)) {
          this.#logger.error('Parent path does not point to an object.')
          return
        }
      }

      // Get or create array at the target key
      const targetKey = lastSegment.value
      const existingValue = parentObj[targetKey]
      const array = Array.isArray(existingValue) ? existingValue : (existingValue != null ? [existingValue] : [])

      // Add values to array
      if (!processAndAddValues(array)) {
        return
      }

      // Set the array back
      parentObj[targetKey] = array

      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      this.sendMultiValueData(propKey, propVal, command, true)
    } else {
      // Simple key handling (existing logic)
      const existingValue = $ct.globalProfileMap[propKey]
      const array = Array.isArray(existingValue) ? existingValue : (existingValue != null ? [existingValue] : [])

      // Add values to array
      if (!processAndAddValues(array)) {
        return
      }

      $ct.globalProfileMap[propKey] = array
      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      this.sendMultiValueData(propKey, propVal, command, false)
    }
  }

  /**
   *
   * @param {any} propKey - the property name. Can be a simple key or nested path like "Trip[0].Emergency Contacts[0].Tags"
   * @param {string, number, array} propVal
   * @param {string} command
   * removes value(s) against a key/property in profile object
   */
  _handleMultiValueRemove (propKey, propVal, command) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE) || {}
    }

    const isNestedPath = propKey.includes('.') || propKey.includes('[')

    if (isNestedPath) {
      const segments = parseNestedPath(propKey)
      if (segments.length === 0) {
        this.#logger.error('Invalid nested path format.')
        return
      }

      // Get the last segment (the property we want to remove from)
      const lastSegment = segments[segments.length - 1]
      if (lastSegment.type !== 'key') {
        this.#logger.error('The last segment of the path must be a property key, not an array index.')
        return
      }

      // Get parent path segments (all except last)
      const parentSegments = segments.slice(0, -1)

      // Navigate to the parent object
      let parentObj
      if (parentSegments.length === 0) {
        parentObj = $ct.globalProfileMap
      } else {
        parentObj = getNestedValue($ct.globalProfileMap, parentSegments)
        if (parentObj === undefined || parentObj === null) {
          this.#logger.error('Parent path does not exist in profile.')
          return
        }
        if (typeof parentObj !== 'object' || Array.isArray(parentObj)) {
          this.#logger.error('Parent path does not point to an object.')
          return
        }
      }

      const targetKey = lastSegment.value
      if (!parentObj.hasOwnProperty(targetKey)) {
        this.#logger.error(`The property ${propKey} does not exist.`)
        return
      }

      const targetArray = parentObj[targetKey]
      if (!Array.isArray(targetArray)) {
        this.#logger.error(`The property ${propKey} is not an array.`)
        return
      }

      // Helper to remove value from array
      const removeValue = (value) => {
        const index = targetArray.indexOf(value)
        if (index !== -1) {
          targetArray.splice(index, 1)
        }
      }

      if (Array.isArray(propVal)) {
        propVal.forEach(removeValue)
      } else if (typeof propVal === 'string' || typeof propVal === 'number') {
        removeValue(propVal)
      } else {
        this.#logger.error('Unsupported propVal type')
        return
      }

      // Remove the key if the array is empty
      if (targetArray.length === 0) {
        delete parentObj[targetKey]
      }

      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      this.sendMultiValueData(propKey, propVal, command, true)
    } else {
      // Simple key handling (existing logic)
      if (!$ct.globalProfileMap.hasOwnProperty(propKey)) {
        this.#logger.error(`The property ${propKey} does not exist.`)
        return
      }

      const removeValue = (value) => {
        const index = $ct.globalProfileMap[propKey].indexOf(value)
        if (index !== -1) {
          $ct.globalProfileMap[propKey].splice(index, 1)
        }
      }

      if (Array.isArray(propVal)) {
        propVal.forEach(removeValue)
      } else if (typeof propVal === 'string' || typeof propVal === 'number') {
        removeValue(propVal)
      } else {
        this.#logger.error('Unsupported propVal type')
        return
      }

      // Remove the key if the array is empty
      if ($ct.globalProfileMap[propKey].length === 0) {
        delete $ct.globalProfileMap[propKey]
      }
      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      this.sendMultiValueData(propKey, propVal, command, false)
    }
  }

  /**
   *
   * @param {any} propKey - Can be a simple key or nested path like "Policy[0].price"
   * @param {string} command
   * deletes a key value pair from the profile object
   * Only primitive values (string, number, boolean) can be deleted.
   * Arrays and objects cannot be deleted - use specific methods for those.
   */
  _handleMultiValueDelete (propKey, command) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
    }
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = {}
    }

    // Helper to check if value is primitive (not array or object)
    const isPrimitive = (value) => {
      return value === null ||
             value === undefined ||
             typeof value === 'string' ||
             typeof value === 'number' ||
             typeof value === 'boolean'
    }

    const isNestedPath = propKey.includes('.') || propKey.includes('[')

    if (isNestedPath) {
      const segments = parseNestedPath(propKey)
      if (segments.length === 0) {
        this.#logger.error('Invalid nested path format.')
        return
      }

      // Check if the path exists
      const currentValue = getNestedValue($ct.globalProfileMap, segments)
      if (currentValue === undefined) {
        this.#logger.error(`Path '${propKey}' does not exist in profile.`)
        return
      }

      // Check if value is primitive - only allow deletion of primitive values
      if (!isPrimitive(currentValue)) {
        this.#logger.error(`Cannot delete '${propKey}': Value is an ${Array.isArray(currentValue) ? 'array' : 'object'}. Only primitive values (string, number, boolean) can be deleted.`)
        return
      }

      // Remove the nested value
      if (!removeNestedValue($ct.globalProfileMap, segments)) {
        this.#logger.error(`Failed to remove value at path '${propKey}'.`)
        return
      }

      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      this.sendMultiValueData(propKey, null, command, true)
    } else {
      // Handle simple key (existing logic)
      if (!$ct.globalProfileMap.hasOwnProperty(propKey)) {
        this.#logger.error(`The property ${propKey} does not exist.`)
        return
      }

      const currentValue = $ct.globalProfileMap[propKey]

      // Check if value is primitive - only allow deletion of primitive values
      if (!isPrimitive(currentValue)) {
        this.#logger.error(`Cannot delete '${propKey}': Value is an ${Array.isArray(currentValue) ? 'array' : 'object'}. Only primitive values (string, number, boolean) can be deleted.`)
        return
      }

      delete $ct.globalProfileMap[propKey]
      StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
      this.sendMultiValueData(propKey, null, command, false)
    }
  }

  sendMultiValueData (propKey, propVal, command, isNested = false) {
    // Send the updated value to LC
    let data = {}
    const profileObj = {}
    data.type = 'profile'

    if (isNested) {
      // For nested paths, use the path as a flat key (e.g., "Platform.Web" or "Trip[0].Price")
      // This sends: { "Platform.Web": { "$delete": true } } instead of nested structure
      if (command === COMMAND_DELETE) {
        profileObj[propKey] = { [command]: true }
      } else {
        profileObj[propKey] = { [command]: propVal }
      }
    } else {
      // Simple key handling
      profileObj[propKey] = { [command]: command === COMMAND_DELETE ? true : propVal }
    }

    if (profileObj.tz == null) {
      profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]
    }

    // Validate and clean the profile object before sending
    const validationResult = isObjStructureValid(profileObj, this.#logger, 3)
    if (validationResult.processedObj) {
      const cleanedProfileObj = validationResult.processedObj
      const finalProfileObj = this.#filterRestrictedKeys(cleanedProfileObj)

      if (isObjectEmpty(finalProfileObj)) {
        return
      }

      data.profile = finalProfileObj
    } else {
      data.profile = profileObj
    }

    data = this.#request.addSystemDataToObject(data, true)
    this.#request.addFlags(data)
    const compressedData = compressData(JSON.stringify(data), this.#logger)
    let pageLoadUrl = this.#account.dataPostURL
    pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

    this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
  }
}
