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
  EVT_PUSH,
  PR_COOKIE
} from '../util/constants'
import {
  addToURL
} from '../util/url'
import {
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
}
