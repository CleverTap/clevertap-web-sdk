import { COOKIE_EXPIRY, FIRE_PUSH_UNREGISTERED, GCOOKIE_NAME, KCOOKIE_NAME, LRU_CACHE_SIZE, USEIP_KEY } from '../util/constants'
import { isValueValid } from '../util/datatypes'
import { getNow } from '../util/datetime'
import LRUCache from '../util/lruCache'
import { StorageManager, $ct } from '../util/storage'

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

    if (respNumber > $ct.globalCache.REQ_N) {
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
        if ($ct.LRU_CACHE == null) {
          $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE)
        }

        const kIdFromLS = StorageManager.readFromLSorCookie(KCOOKIE_NAME)
        if (kIdFromLS != null && kIdFromLS.id && resume) {
          const guidFromLRUCache = $ct.LRU_CACHE.cache[kIdFromLS.id]
          if (!guidFromLRUCache) {
            StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, true)
            $ct.LRU_CACHE.set(kIdFromLS.id, global)
          }
        }

        StorageManager.saveToLSorCookie(GCOOKIE_NAME, global)
        const lastK = $ct.LRU_CACHE.getSecondLastKey()
        if (StorageManager.readFromLSorCookie(FIRE_PUSH_UNREGISTERED) && lastK !== -1) {
          const lastGUID = $ct.LRU_CACHE.cache[lastK]
          this.#request.unregisterTokenForGuid(lastGUID)
        }
      }

      StorageManager.createBroadCookie(GCOOKIE_NAME, global, COOKIE_EXPIRY, window.location.hostname)
      StorageManager.saveToLSorCookie(GCOOKIE_NAME, global)
    }

    if (resume) {
      $ct.blockRequest = false
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

    $ct.globalCache.RESP_N = respNumber
  }
}
