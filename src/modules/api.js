// import { StorageManager } from "../util/storage"
// import { isString } from '../util/datatypes'
// import {
//   OPTOUT_COOKIE_ENDSWITH,
//   MAX_TRIES,
//   ARP_COOKIE
// } from '../util/constants'
// import {
//   addToURL
// } from '../util/url'
// import {
//   compressData
// } from '../util/encoder'

// export class CleverTapAPI {
//   #logger
//   #event
//   constructor ({
//     logger
//   }) {
//     this.#logger = logger
//   }

//   dropRequestDueToOptOut () {
//     if (!($ct.globalCache.gcookie) || isString($ct.globalCache.gcookie)) {
//       $ct.globalCache.isOptInRequest = false
//       return false
//     }
//     return $ct.globalCache.gcookie.slice(-3) === OPTOUT_COOKIE_ENDSWITH
//   }

//   addARPToRequest (url, skipResARP) {
//     if(skipResARP != null && skipResARP === true) {
//       var _arp = {}
//       _arp['skipResARP'] = true
//       return addToURL(url, 'arp', compressData(JSON.stringify(_arp)))
//     }
//     if (StorageManager._isLocalStorageSupported() && StorageManager.read(ARP_COOKIE) != null) {
//       return addToURL(url, 'arp', compressData(JSON.stringify(StorageManager.readFromLSorCookie(ARP_COOKIE))))
//     }
//     return url
//   };

//   fireRequest (url, tries, skipARP, sendOULFlag) {
//     if (dropRequestDueToOptOut()) {
//       this.#logger.debug('req dropped due to optout cookie: ' + $ct.globalCache.gcookie)
//       return
//     }
//     if (
//         !($ct.globalCache.gcookie) &&
//         $ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1 &&
//         tries < MAX_TRIES
//     ) {
//       setTimeout(function () {
//         fireRequest(url, tries + 1, skipARP, sendOULFlag)
//       }, 50)
//       return
//     }

//     if(!sendOULFlag) {
//       if ($ct.globalCache.gcookie) {
//         url = addToURL(url, 'gc', $ct.globalCache.gcookie) //add cookie to url
//       }
//       url = addARPToRequest(url, skipARP)
//     }

//     url = addToURL(url, 'r', new Date().getTime()) // add epoch to beat caching of the URL
//     if (wizrocket.hasOwnProperty('plugin')) {
//       //used to add plugin name in request parameter
//       let plugin = wizrocket.plugin
//       url = addToURL(url, 'ct_pl', plugin)
//     }
//     if (url.indexOf('chrome-extension:') != -1) {
//       url = url.replace('chrome-extension:', 'https:')
//     }
//     let s = doc.createElement('script')
//     s.setAttribute('type', 'text/javascript')
//     s.setAttribute('src', url)
//     s.setAttribute('rel', 'nofollow')
//     s.async = true

//     doc.getElementsByTagName('head')[0].appendChild(s)
//     this.#logger.debug('req snt -> url: ' + url)
//   }

// }
import { COOKIE_EXPIRY, GCOOKIE_NAME, KCOOKIE_NAME, LRU_CACHE_SIZE, USEIP_KEY } from '../util/constants'
import { isValueValid } from '../util/datatypes'
import { getNow } from '../util/datetime'
import LRUCache from '../util/lruCache'
import { StorageManager } from '../util/storage'

export default class CleverTapAPI {
  #logger
  #request
  #device
  #session

  constructor ({ logger, request, device, session }) {
    this.#logger = logger
    this.#request = request
    this.#device = device
    this.#session = session
  }

  s (global, session, resume, respNumber, optOutResponse) {
    // call back function used to store global and session ids for the user
    if (typeof respNumber === 'undefined') {
      respNumber = 0
    }

    StorageManager.removeBackup(respNumber, this.#logger)

    if (respNumber > window.$ct.globalCache.REQ_N) {
      // request for some other user so ignore
      return
    }

    if (!isValueValid(this.#device.gcookie) || resume || typeof optOutResponse === 'boolean') {
      if (!isValueValid(this.#device.gcookie)) {
        // clear useIP meta prop
        StorageManager.getAndClearMetaProp(USEIP_KEY)
      }
      this.#logger.debug(`Cookie was ${this.#device.gcookie} set to ${global}`)
      this.#device.gcookie = global

      if (global && StorageManager._isLocalStorageSupported()) {
        if (window.$ct.LRU_CACHE == null) {
          window.$ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE)
        }

        const kIdFromLS = StorageManager.readFromLSorCookie(KCOOKIE_NAME)
        if (kIdFromLS != null && kIdFromLS.id && resume) {
          const guidFromLRUCache = window.$ct.LRU_CACHE.cache[kIdFromLS.id]
          if (!guidFromLRUCache) {
            window.$ct.LRU_CACHE.set(kIdFromLS.id, global)
          }
        }

        StorageManager.saveToLSorCookie(GCOOKIE_NAME, global)
        const lastK = window.$ct.LRU_CACHE.getSecondLastKey()
        if (lastK !== -1) {
          const lastGUID = window.$ct.LRU_CACHE.cache[lastK]
          this.#request.unregisterTokenForGuid(lastGUID)
        }
      }

      StorageManager.createBroadCookie(GCOOKIE_NAME, global, COOKIE_EXPIRY, window.location.hostname)
      StorageManager.saveToLSorCookie(GCOOKIE_NAME, global)
    }

    if (resume) {
      window.$ct.blockRequest = false
      this.#logger.debug('Resumed requests')
    }

    if (StorageManager._isLocalStorageSupported()) {
      this.#session.manageSession(session)
    }

    // session cookie
    const obj = this.#session.getSessionCookieObject()

    // for the race-condition where two responses come back with different session ids. don't write the older session id.
    if (typeof obj.s === 'undefined' || obj.s <= session) {
      obj.s = session
      obj.t = getNow() // time of last response from server
      this.#session.setSessionCookieObject(obj)
    }

    if (resume && !this.#request.processingBackup) {
      this.#request.processBackupEvents()
    }

    window.$ct.globalCache.RESP_N = respNumber
  }
}
