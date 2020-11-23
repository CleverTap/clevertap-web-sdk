import {
  isObjectEmpty
} from '../util/datatypes'
import {
  EVT_PUSH,
  USEIP_KEY,
  OPTOUT_KEY,
  CT_OPTOUT_KEY
} from '../util/constants'
import {
  StorageManager,
  $ct
} from '../util/storage'
// import LRUCache from '../util/lruCache'
import {
  compressData
} from '../util/encoder'
import {
  addToURL
} from '../util/url'

export default class Privacy extends Array {
  #request
  #account
  #oldValues

  constructor ({
    request,
    account
  },
  values) {
    super()
    this.#request = request
    this.#account = account
    this.#oldValues = values
  }

  push (...privacyArr) {
    this.#processPrivacyArray(privacyArr)
    return 0
  }

  processOldValues () {
    if (this.#oldValues) {
      this.#processPrivacyArray(this.#oldValues)
    }
    this.#oldValues = null
  }

  #processPrivacyArray (privacyArr) {
    if (Array.isArray(privacyArr) && privacyArr.length > 0) {
      const privacyObj = privacyArr[0]
      let data = {}
      const profileObj = {}
      const optOut = privacyObj[OPTOUT_KEY]
      if (privacyObj.hasOwnProperty(OPTOUT_KEY)) {
        if (typeof optOut === 'boolean') {
          profileObj[CT_OPTOUT_KEY] = optOut
          // should be true when user wants to opt in
          $ct.isOptInRequest = !optOut
        }
      }
      if (privacyObj.hasOwnProperty(USEIP_KEY)) {
        const useIP = privacyObj[USEIP_KEY]
        if (typeof useIP === 'boolean') {
          StorageManager.setMetaProp(USEIP_KEY, useIP)
        }
      }
      if (!isObjectEmpty(profileObj)) {
        data.type = 'profile'
        data.profile = profileObj
        data = this.#request.addSystemDataToObject(data, undefined)
        const compressedData = compressData(JSON.stringify(data))
        let pageLoadUrl = this.#account.dataPostURL
        pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)
        pageLoadUrl = addToURL(pageLoadUrl, OPTOUT_KEY, optOut ? 'true' : 'false')
        this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequeust)
      }
    }
  }
}
