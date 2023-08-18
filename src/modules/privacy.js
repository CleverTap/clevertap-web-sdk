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
  #logger

  constructor ({
    request,
    account,
    logger
  },
  values) {
    super()
    this.#logger = logger
    this.#request = request
    this.#account = account
    this.#oldValues = values
  }

  push (...privacyArr) {
    if ($ct.isPrivacyArrPushed) {
      this.#processPrivacyArray($ct.privacyArray.length > 0 ? $ct.privacyArray : privacyArr)
    } else {
      $ct.privacyArray.push(...privacyArr)
    }
    return 0
  }

  _processOldValues () {
    if (this.#oldValues) {
      this.#processPrivacyArray(this.#oldValues)
    }
    this.#oldValues = null
  }

  #processPrivacyArray (privacyArr) {
    if (Array.isArray(privacyArr) && privacyArr.length > 0) {
      const privacyObj = privacyArr.reduce((prev, curr) => ({ ...prev, ...curr }), {})
      let data = {}
      const profileObj = {}
      var optOut = false

      if (privacyObj.hasOwnProperty(OPTOUT_KEY)) {
        optOut = privacyObj[OPTOUT_KEY]
        if (typeof optOut === 'boolean') {
          profileObj[CT_OPTOUT_KEY] = optOut
          // should be true when user wants to opt in
          $ct.isOptInRequest = !optOut
        }
      }
      if (privacyObj.hasOwnProperty(USEIP_KEY)) {
        const useIP = privacyObj[USEIP_KEY]
        const shouldUseIP = (typeof useIP === 'boolean') ? useIP : false
        StorageManager.setMetaProp(USEIP_KEY, shouldUseIP)
      }
      if (!isObjectEmpty(profileObj)) {
        data.type = 'profile'
        data.profile = profileObj
        data = this.#request.addSystemDataToObject(data, undefined)
        let pageLoadUrl = this.#account.dataPostURL
        pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
        // check if sessionStorage has key WZRK_D
        if (sessionStorage.hasOwnProperty('WZRK_D')) {
          data.debug = true
          pageLoadUrl = addToURL(pageLoadUrl, 'debug', true)
        }
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))
        pageLoadUrl = addToURL(pageLoadUrl, OPTOUT_KEY, optOut ? 'true' : 'false')
        this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
        privacyArr.splice(0, privacyArr.length)
      }
    }
  }
}
