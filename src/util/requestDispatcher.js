import { ARP_COOKIE, MAX_TRIES, OPTOUT_COOKIE_ENDSWITH } from './constants'
import { isString, isValueValid } from './datatypes'
import { compressData } from './encoder'
import { StorageManager, $ct } from './storage'
import { addToURL } from './url'

export default class RequestDispatcher {
  static logger
  static device
  static isOptInRequest = false

  static #fireRequest (url, tries, skipARP, sendOULFlag) {
    if (this.#dropRequestDueToOptOut()) {
      this.logger.debug('req dropped due to optout cookie: ' + this.device.gcookie)
      return
    }

    if (!isValueValid(this.device.gcookie) &&
    ($ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1) &&
    tries < MAX_TRIES) {
      setTimeout(() => {
        this.#fireRequest(url, tries + 1, skipARP, sendOULFlag)
      }, 50)
      return
    }

    if (!sendOULFlag) {
      if (isValueValid(this.device.gcookie)) {
        // add cookie to url
        url = addToURL(url, 'gc', this.device.gcookie)
      }
      url = this.#addARPToRequest(url, skipARP)
    }

    url = addToURL(url, 'r', new Date().getTime()) // add epoch to beat caching of the URL
    // TODO: Figure out a better way to handle plugin check
    if (window.clevertap?.hasOwnProperty('plugin') || window.wizrocket?.hasOwnProperty('plugin')) {
      // used to add plugin name in request parameter
      const plugin = window.clevertap.plugin || window.wizrocket.plugin
      url = addToURL(url, 'ct_pl', plugin)
    }
    if (url.indexOf('chrome-extension:') !== -1) {
      url = url.replace('chrome-extension:', 'https:')
    }

    // TODO: Try using Function constructor instead of appending script.
    const s = document.createElement('script')
    s.setAttribute('type', 'text/javascript')
    s.setAttribute('src', url)
    s.setAttribute('rel', 'nofollow')
    s.async = true

    document.getElementsByTagName('head')[0].appendChild(s)
    this.logger.debug('req snt -> url: ' + url)
  }

  static fireRequest (url, skipARP, sendOULFlag) {
    this.#fireRequest(url, 1, skipARP, sendOULFlag)
  }

  static #dropRequestDueToOptOut () {
    if (this.isOptInRequest || !isValueValid(this.device.gcookie) || !isString(this.device.gcookie)) {
      this.isOptInRequest = false
      return false
    }
    return this.device.gcookie.slice(-3) === OPTOUT_COOKIE_ENDSWITH
  }

  static #addARPToRequest (url, skipResARP) {
    if (skipResARP === true) {
      const _arp = {}
      _arp.skipResARP = true
      return addToURL(url, 'arp', compressData(JSON.stringify(_arp)))
    }
    if (StorageManager._isLocalStorageSupported() && typeof localStorage.getItem(ARP_COOKIE) !== 'undefined') {
      return addToURL(url, 'arp', compressData(JSON.stringify(StorageManager.readFromLSorCookie(ARP_COOKIE))))
    }
    return url
  }
}
