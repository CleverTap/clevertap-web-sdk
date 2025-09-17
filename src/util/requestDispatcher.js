
import { ARP_COOKIE, MAX_TRIES, OPTOUT_COOKIE_ENDSWITH, USEIP_KEY, MAX_DELAY_FREQUENCY, PUSH_DELAY_MS, WZRK_FETCH } from './constants'
import { isString, isValueValid } from './datatypes'
import { compressData } from './encoder'
import { StorageManager, $ct } from './storage'
import { addToURL } from './url'
import encryptionInTransitInstance from './security/encryptionInTransit'

export default class RequestDispatcher {
  static logger
  static device
  static account
  /**
   * Controls whether Fetch API should be used instead of the JSONP <script> fallback.
   * This is configured at runtime by the CleverTap SDK during initialisation.
   * Do NOT access this flag via the global $ct map anymore.
   */
  static enableFetchApi = false
  /**
   * Controls whether outbound payloads should be encrypted using AES-GCM-256.
   * This is configured at runtime by the CleverTap SDK during initialisation.
   * When enabled, all requests will be sent using Fetch API with encrypted payload envelope.
   */
  static enableEncryptionInTransit = false
  networkRetryCount = 0
  minDelayFrequency = 0

  /**
   * Encrypts the 'd' parameter value if encryption is enabled
   * @param {string} url - The URL containing query parameters
   * @returns {Promise<{url: string, body?: string, method: string}>} - Modified URL with encrypted 'd' parameter
   */
  static #prepareEncryptedRequest (url) {
    if (!this.enableEncryptionInTransit) {
      return Promise.resolve({ url, method: 'GET' })
    }

    // Force Fetch API when encryption is enabled
    this.enableFetchApi = true

    try {
      // Extract query string from URL
      const urlObj = new URL(url)
      const searchParams = new URLSearchParams(urlObj.search)

      // Check if 'd' parameter exists
      const dParam = searchParams.get('d')
      if (!dParam) {
        return Promise.resolve({ url, method: 'GET' })
      }

      // Encrypt only the 'd' parameter value
      return encryptionInTransitInstance.encryptForBackend(dParam, { id: this.account.id })
        .then((encryptedData) => {
          // Replace the 'd' parameter with encrypted data
          searchParams.set('d', encryptedData)

          // Reconstruct the URL with encrypted 'd' parameter
          const newUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}?${searchParams.toString()}`

          return {
            url: newUrl,
            method: 'GET'
          }
        })
        .catch((error) => {
          this.logger.error('Encryption failed, falling back to unencrypted request:', error)
          return { url, method: 'GET' }
        })
    } catch (error) {
      this.logger.error('URL parsing failed, falling back to unencrypted request:', error)
      return Promise.resolve({ url, method: 'GET' })
    }
  }

  // ANCHOR - Requests get fired from here
  static #fireRequest (url, tries, skipARP, sendOULFlag, evtName) {
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
        setTimeout(() => {
          this.logger.debug(`retrying fire request for url: ${url}, tries: ${tries}`)
          this.#fireRequest(url, tries + 1, skipARP, sendOULFlag)
        }, 50)
        return
      }
    }

    // set isOULInProgress to true
    // when sendOULFlag is set to true
    if (!sendOULFlag) {
      if (isValueValid(this.device.gcookie)) {
        // add gcookie to url
        url = addToURL(url, 'gc', this.device.gcookie)
      }
      url = this.#addARPToRequest(url, skipARP)
    } else {
      window.isOULInProgress = true
    }

    url = addToURL(url, 'tries', tries) // Add tries to URL
    url = addToURL(url, 'origin', window?.location?.origin ?? window?.location?.href) // Add origin to URL

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

    // Prepare request with optional encryption
    this.#prepareEncryptedRequest(url)
      .then((requestConfig) => {
        // TODO: Try using Function constructor instead of appending script.
        var ctCbScripts = document.getElementsByClassName('ct-jp-cb')
        while (ctCbScripts[0] && ctCbScripts[0].parentNode) {
          ctCbScripts[0].parentNode.removeChild(ctCbScripts[0])
        }

        // Use the static flag instead of the global $ct map
        // When encryption is enabled, always use Fetch API
        if (!this.enableFetchApi && !this.enableEncryptionInTransit) {
          const s = document.createElement('script')
          s.setAttribute('type', 'text/javascript')
          s.setAttribute('src', requestConfig.url)
          s.setAttribute('class', 'ct-jp-cb')
          s.setAttribute('rel', 'nofollow')
          s.async = true
          document.getElementsByTagName('head')[0].appendChild(s)
          this.logger.debug('req snt -> url: ' + requestConfig.url)
        } else {
          this.handleFetchResponse(requestConfig.url)
        }
      })
      .catch((error) => {
        this.logger.error('Request preparation failed:', error)
      })
  }

  /**
   *
   * @param {string} url
   * @param {*} skipARP
   * @param {boolean} sendOULFlag
   */
  static fireRequest (url, skipARP, sendOULFlag, evtName) {
    this.#fireRequest(url, 1, skipARP, sendOULFlag, evtName)
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

  static handleFetchResponse (url, body = null, method = 'GET') {
    const fetchOptions = {
      method: 'GET',
      headers: { Accept: 'application/json' }
    }

    fetch(url, fetchOptions)
      .then((response) => {
        if (!response.ok) {
          // Check for server-side EIT disabled scenario
          if (response.status === 400) {
            return response.text().then((errorText) => {
              if (errorText.includes('EIT_DISABLED')) {
                console.error('Encryption in Transit is disabled on server side – disable flag or contact support', {
                  status: response.status,
                  statusText: response.statusText,
                  error: errorText
                })
              }
              throw new Error(`Network response was not ok: ${response.statusText}`)
            })
          }
          throw new Error(`Network response was not ok: ${response.statusText}`)
        }
        return response.text()
      })
      .then((rawResponse) => {
        // Phase 2: Attempt to decrypt the response if it might be encrypted
        const tryDecryption = () => {
          if (rawResponse && rawResponse.length > 0) {
            return encryptionInTransitInstance.decryptFromBackend(rawResponse)
              .then((decryptedResponse) => {
                this.logger.debug('Successfully decrypted response')
                return decryptedResponse
              })
              .catch((decryptError) => {
                // If decryption fails, assume the response was not encrypted
                this.logger.debug('Response decryption failed, assuming unencrypted:', decryptError.message)
                return rawResponse
              })
          }
          return Promise.resolve(rawResponse)
        }

        return tryDecryption()
      })
      .then((processedResponse) => {
        // Parse the final response as JSON
        let jsonResponse
        try {
          jsonResponse = JSON.parse(processedResponse)
        } catch (parseError) {
          this.logger.error('Failed to parse response as JSON:', parseError)
          throw new Error('Invalid JSON response')
        }

        const { tr, meta, wpe } = jsonResponse
        if (tr) {
          window.$WZRK_WR.tr(tr)
        }
        if (meta) {
          const { g, sid, rf, rn, optOut } = meta
          if (g && sid !== undefined && rf !== undefined && rn !== undefined) {
            const parsedRn = parseInt(rn)

            // Include optOut as 5th parameter if present
            if (optOut !== undefined) {
              window.$WZRK_WR.s(g, sid, rf, parsedRn, optOut)
            } else {
              window.$WZRK_WR.s(g, sid, rf, parsedRn)
            }
          }
        }
        if (wpe) {
          window.$WZRK_WR.enableWebPush(wpe.enabled, wpe.key)
        }
        this.logger.debug('req snt -> url: ' + url)
      })
      .catch((error) => {
        if (error.message && error.message.includes('EIT decryption failed')) {
          this.logger.error('EIT decryption failed', error)
          // Safely ignore the response payload and proceed without applying server changes
          return
        }
        this.logger.error('Fetch error:', error)
      })
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
