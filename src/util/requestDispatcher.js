import { ARP_COOKIE, MAX_TRIES, OPTOUT_COOKIE_ENDSWITH, USEIP_KEY } from './constants'
import { isString, isValueValid } from './datatypes'
import { compressData } from './encoder'
import { StorageManager, $ct } from './storage'
import { addToURL } from './url'

export default class RequestDispatcher {
  static logger
  static device

  static #fireRequest (url, tries, skipARP, sendOULFlag) {
    if (this.#dropRequestDueToOptOut()) {
      this.logger.debug('req dropped due to optout cookie: ' + this.device.gcookie)
      return
    }

    if (!isValueValid(this.device.gcookie) &&
    ($ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1) &&
    tries < MAX_TRIES) {
      setTimeout(() => {
        this.logger.debug(`retrying fire request for url: ${url}, tries: ${tries}`)
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

    url = addToURL(url, 'tries', tries) // Add tries to URL

    url = this.#addUseIPToRequest(url)
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
    var ctCbScripts = document.getElementsByClassName('ct-jp-cb')
    while (ctCbScripts[0]) {
      ctCbScripts[0].parentNode.removeChild(ctCbScripts[0])
    }
    const s = document.createElement('script')
    s.setAttribute('type', 'text/javascript')
    s.setAttribute('src', url)
    s.setAttribute('class', 'ct-jp-cb')
    s.setAttribute('rel', 'nofollow')
    s.async = true

    document.getElementsByTagName('head')[0].appendChild(s)
    this.logger.debug('req snt -> url: ' + url)
  }

  static fireRequest (url, skipARP, sendOULFlag) {
    this.#fireRequest(url, 1, skipARP, sendOULFlag)
  }

  static #dropRequestDueToOptOut () {
    if ($ct.isOptInRequest || !isValueValid(this.device.gcookie) || !isString(this.device.gcookie)) {
      $ct.isOptInRequest = false
      return false
    }
    return this.device.gcookie.slice(-3) === OPTOUT_COOKIE_ENDSWITH
  }

  static #addUseIPToRequest (pageLoadUrl) {
    var useIP = StorageManager.getMetaProp(USEIP_KEY)
    if (typeof useIP !== 'boolean') {
      useIP = false
    }
    return addToURL(pageLoadUrl, USEIP_KEY, useIP ? 'true' : 'false')
  };

  static #addARPToRequest (url, skipResARP) {
    if (skipResARP === true) {
      const _arp = {}
      _arp.skipResARP = true
      return addToURL(url, 'arp', compressData(JSON.stringify(_arp), this.logger))
    }
    if (StorageManager._isLocalStorageSupported() && typeof localStorage.getItem(ARP_COOKIE) !== 'undefined' && localStorage.getItem(ARP_COOKIE) !== null) {
      return addToURL(url, 'arp', compressData(JSON.stringify(StorageManager.readFromLSorCookie(ARP_COOKIE)), this.logger))
    }
    return url
  }
}
