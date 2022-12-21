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

  /**
   *
   * @param {string} global gcookie
   * @param {string} session
   * @param {boolean} resume true in case of OUL (on user login), false in all other cases
   * true signifies that the response in OUL response
   * @param {number} respNumber the index of the request in backupmanager
   * @param {boolean} optOutResponse
   * @returns
   */

  s (global, session, resume, respNumber, optOutResponse) {
    let oulReq, newGuid
    // call back function used to store global and session ids for the user
    if (typeof respNumber === 'undefined') {
      respNumber = 0
    }

    StorageManager.removeBackup(respNumber, this.#logger)

    if (respNumber > $ct.globalCache.REQ_N) {
      // request for some other user so ignore
      return
    }

    // for a condition when a request's response is received
    // while an OUL request is already in progress
    // remove the request from backup cache and return

    if (window.isOULInProgress && !resume) {
      return
    }

    // set isOULInProgress to false, if resume is true
    // also process the backupevents in case of OUL
    if (resume) {
      window.isOULInProgress = false
      oulReq = true
    } else {
      oulReq = false
    }

    if (!isValueValid(this.#device.gcookie)) {
      // since global is received
      if (global) {
        newGuid = true
      }
      if (resume || typeof optOutResponse === 'boolean') {
        this.#logger.debug(`Cookie was ${this.#device.gcookie} set to ${global}`)
        this.#device.gcookie = global
        if (!isValueValid(this.#device.gcookie)) {
          // clear useIP meta prop
          StorageManager.getAndClearMetaProp(USEIP_KEY)
        }
        if (global && StorageManager._isLocalStorageSupported()) {
          if ($ct.LRU_CACHE == null) {
            $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE)
          }

          const kIdFromLS = StorageManager.readFromLSorCookie(KCOOKIE_NAME)
          let guidFromLRUCache
          if (kIdFromLS != null && kIdFromLS.id) {
            guidFromLRUCache = $ct.LRU_CACHE.cache[kIdFromLS.id]
            if (resume) {
              if (!guidFromLRUCache) {
                StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, true)
                // replace login identity in OUL request
                // with the gcookie returned in exchange
                $ct.LRU_CACHE.set(kIdFromLS.id, global)
              }
            }
          }

          StorageManager.saveToLSorCookie(GCOOKIE_NAME, global)
          // lastk provides the guid
          const lastK = $ct.LRU_CACHE.getSecondLastKey()
          if (StorageManager.readFromLSorCookie(FIRE_PUSH_UNREGISTERED) && lastK !== -1) {
            const lastGUID = $ct.LRU_CACHE.cache[lastK]
            // fire the request directly via fireRequest to unregister the token
            // then other requests with the updated guid should follow
            this.#request.unregisterTokenForGuid(lastGUID)
          }
        }
      }
    } else {
      if (global && global !== this.#device.gcookie) {
        newGuid = true
      } else {
        newGuid = false
      }
    }
    StorageManager.createBroadCookie(GCOOKIE_NAME, global, COOKIE_EXPIRY, window.location.hostname)
    StorageManager.saveToLSorCookie(GCOOKIE_NAME, global)

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

    // set blockRequest to false only if the device has a valid gcookie
    if (isValueValid(this.#device.gcookie)) {
      $ct.blockRequest = false
    }

    // only process the backup events after an OUL request or a new guid is recieved
    if ((oulReq || newGuid) && !this.#request.processingBackup) {
      this.#request.processBackupEvents()
    }

    $ct.globalCache.RESP_N = respNumber
  }
}
