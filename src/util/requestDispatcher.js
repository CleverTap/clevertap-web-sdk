
import { clevertapApi } from '../modules/api'
import ModeManager from '../modules/mode'
import globalWindow from '../modules/window'
import { arp } from './clevertap'
import { ARP_COOKIE, MAX_TRIES, OPTOUT_COOKIE_ENDSWITH, USEIP_KEY, MAX_DELAY_FREQUENCY, PUSH_DELAY_MS, WZRK_FETCH } from './constants'
import { isString, isValueValid } from './datatypes'
import { compressData } from './encoder'
import { StorageManager, $ct } from './storage'
import { addToURL } from './url'

export default class RequestDispatcher {
  static logger
  static device
  static mode
  static api
  static account
  networkRetryCount = 0
  minDelayFrequency = 0

  // ANCHOR - Requests get fired from here
  static async #fireRequest (url, tries, skipARP, sendOULFlag, evtName) {
    if (this.#dropRequestDueToOptOut()) {
      this.logger.debug('req dropped due to optout cookie: ' + this.device.gcookie)
      return
    }

    // set a request in progress
    // so that if gcookie is not present, no other request can be made asynchronusly
    if (!isValueValid(this.device.gcookie)) {
      $ct.blockRequest = true
    }
    /**
     * if the gcookie is null
     * and the request is not the first request
     * and the tries are less than max tries
     * keep retrying
     */

    if (evtName && evtName === WZRK_FETCH) {
      // New retry mechanism
      if (!isValueValid(this.device.gcookie) && ($ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1)) {
        setTimeout(() => {
          this.logger.debug(`retrying fire request for url: ${url}, tries: ${this.networkRetryCount}`)
          this.#fireRequest(url, undefined, skipARP, sendOULFlag)
        }, this.getDelayFrequency())
      }
    } else {
      if (!isValueValid(this.device.gcookie) &&
      ($ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1) &&
      tries < MAX_TRIES) {
      // if ongoing First Request is in progress, initiate retry
        setTimeout(async () => {
          this.logger.debug(`retrying fire request for url: ${url}, tries: ${tries}`)
          await this.#fireRequest(url, tries + 1, skipARP, sendOULFlag)
        }, 50)
        return
      }

      // set isOULInProgress to true
      // when sendOULFlag is set to true
      if (!sendOULFlag) {
        if (isValueValid(this.device.gcookie)) {
        // add gcookie to url
          url = addToURL(url, 'gc', this.device.gcookie)
        }
        url = await this.#addARPToRequest(url, skipARP)
      } else {
        globalWindow.isOULInProgress = true
      }

      url = addToURL(url, 'tries', tries) // Add tries to URL
      url = addToURL(url, 'origin', window?.location?.origin ?? window?.location?.href) // Add origin to URL

      url = await this.#addUseIPToRequest(url)
      url = addToURL(url, 'r', new Date().getTime()) // add epoch to beat caching of the URL
      if (url.indexOf('chrome-extension:') !== -1) {
        url = url.replace('chrome-extension:', 'https:')
      }

      if (ModeManager.mode === 'WEB') {
      // TODO: Figure out a better way to handle plugin check
        if (window.clevertap?.hasOwnProperty('plugin') || window.wizrocket?.hasOwnProperty('plugin')) {
        // used to add plugin name in request parameter
          const plugin = window.clevertap.plugin || window.wizrocket.plugin
          url = addToURL(url, 'ct_pl', plugin)
        }
        // TODO: Try using Function constructor instead of appending script.
        var ctCbScripts = document.getElementsByClassName('ct-jp-cb')
        while (ctCbScripts[0] && ctCbScripts[0].parentNode) {
          ctCbScripts[0].parentNode.removeChild(ctCbScripts[0])
        }

        const s = document.createElement('script')
        s.setAttribute('type', 'text/javascript')
        s.setAttribute('src', url)
        s.setAttribute('class', 'ct-jp-cb')
        s.setAttribute('rel', 'nofollow')
        s.async = true
        document.getElementsByTagName('head')[0].appendChild(s)
      } else {
        fetch(url, { headers: { accept: 'application/json' } }).then(res => res.json()).then(async () => {
          if (response.arp) {
            await arp(response.arp)
          }

          if (response.meta) {
            await clevertapApi.s(
              response.meta.g, // cookie
              response.meta.sid, // session id
              response.meta.rf, // resume
              response.meta.rn // response number for backup manager
            )
          }
        })
      }
      this.logger.debug('req snt -> url: ' + url)
    }
  }

  /**
   *
   * @param {string} url
   * @param {*} skipARP
   * @param {boolean} sendOULFlag
   */
  static async fireRequest (url, skipARP, sendOULFlag, evtName) {
    await this.#fireRequest(url, 1, skipARP, sendOULFlag, evtName)
  }

  static #dropRequestDueToOptOut () {
    if ($ct.isOptInRequest || !isValueValid(this.device.gcookie) || !isString(this.device.gcookie)) {
      $ct.isOptInRequest = false
      return false
    }
    return this.device.gcookie.slice(-3) === OPTOUT_COOKIE_ENDSWITH
  }

  static async #addUseIPToRequest (pageLoadUrl) {
    var useIP = await StorageManager.getMetaProp(USEIP_KEY)
    if (typeof useIP !== 'boolean') {
      useIP = false
    }
    return addToURL(pageLoadUrl, USEIP_KEY, useIP ? 'true' : 'false')
  };

  static async #addARPToRequest (url, skipResARP) {
    if (skipResARP === true) {
      const _arp = {}
      _arp.skipResARP = true
      return addToURL(url, 'arp', compressData(JSON.stringify(_arp), this.logger))
    }
    const arpValue = await StorageManager.readFromLSorCookie(ARP_COOKIE)
    if (typeof arpValue !== 'undefined' && arpValue !== null) {
      return addToURL(url, 'arp', compressData(JSON.stringify(arpValue), this.logger))
    }
    return url
  }

  getDelayFrequency () {
    this.logger.debug('Network retry #' + this.networkRetryCount)

    // Retry with delay as 1s for first 10 retries
    if (this.networkRetryCount < 10) {
      this.logger.debug(this.account.id, 'Failure count is ' + this.networkRetryCount + '. Setting delay frequency to 1s')
      this.minDelayFrequency = PUSH_DELAY_MS // Reset minimum delay to 1s
      return this.minDelayFrequency
    }

    if (this.account.region == null) {
      // Retry with delay as 1s if region is null in case of eu1
      this.logger.debug(this.account.id, 'Setting delay frequency to 1s')
      return PUSH_DELAY_MS
    } else {
      // Retry with delay as minimum delay frequency and add random number of seconds to scatter traffic
      const randomDelay = (Math.floor(Math.random() * 10) + 1) * 1000
      this.minDelayFrequency += randomDelay
      if (this.minDelayFrequency < MAX_DELAY_FREQUENCY) {
        this.logger.debug(this.account.id, 'Setting delay frequency to ' + this.minDelayFrequency)
        return this.minDelayFrequency
      } else {
        this.minDelayFrequency = PUSH_DELAY_MS
      }
      this.logger.debug(this.account.id, 'Setting delay frequency to ' + this.minDelayFrequency)
      return this.minDelayFrequency
    }
  }
}
