import { COOKIE_EXPIRY, FIRE_PUSH_UNREGISTERED, GCOOKIE_NAME, KCOOKIE_NAME, LRU_CACHE_SIZE, USEIP_KEY } from '../util/constants'
import { isValueValid } from '../util/datatypes'
import { getNow } from '../util/datetime'
import LRUCache from '../util/lruCache'

export default class CleverTapAPI {
  #logger
  #request
  #device
  #session
  #domainSpecification
  #instanceManager

  constructor ({ logger, request, device, session, domainSpecification, instanceManager }) {
    this.domainSpecification = domainSpecification
    this.#logger = logger
    this.#request = request
    this.#device = device
    this.#session = session
    this.#instanceManager = instanceManager
  }

  get domainSpecification () {
    return this.#domainSpecification
  }

  set domainSpecification (domainSpecification) {
    this.#domainSpecification = domainSpecification
  }

  /**
   *
   * @param {string} global gcookie
   * @param {string} session
   * @param {boolean} resume sent true in case of an OUL request from client side, which is returned as it is by server
   * @param {number} respNumber the index of the request in backupmanager
   * @param {boolean} optOutResponse
   * @returns
   */

  s (global, session, resume, respNumber, optOutResponse) {
    let oulReq = false
    let newGuid = false

    // for a scenario when OUL request is true from client side
    // but resume is returned as false from server end
    // we maintan a OulReqN var in the window object
    // and compare with respNumber to determine the response of an OUL request
    if (this.#instanceManager.isOULInProgress) {
      if (resume || (respNumber !== 'undefined' && respNumber === this.#instanceManager.oulReqN)) {
        this.#instanceManager.isOULInProgress = false
        oulReq = true
      }
    }

    // call back function used to store global and session ids for the user
    if (typeof respNumber === 'undefined') {
      respNumber = 0
    }

    this.#instanceManager.storage.removeBackup(respNumber, this.#logger)

    if (respNumber > this.#instanceManager.state.globalCache.REQ_N) {
      // request for some other user so ignore
      return
    }

    if (!isValueValid(this.#device.gcookie)) {
      if (global) {
        newGuid = true
      }
    }

    if (!isValueValid(this.#device.gcookie) || resume || typeof optOutResponse === 'boolean') {
      const sessionObj = this.#session.getSessionCookieObject()

      /*  If the received session is less than the session in the cookie,
          then don't update guid as it will be response for old request
      */
      if (this.#instanceManager.isOULInProgress || (sessionObj.s && (session < sessionObj.s))) {
        return
      }
      this.#logger.debug(`Cookie was ${this.#device.gcookie} set to ${global}`)
      this.#device.gcookie = global
      if (!isValueValid(this.#device.gcookie)) {
        // clear useIP meta prop
        this.#instanceManager.storage.getAndClearMetaProp(USEIP_KEY)
      }
      if (global && this.#instanceManager.storage._isLocalStorageSupported()) {
        if (this.#instanceManager.state.LRU_CACHE == null) {
          this.#instanceManager.state.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE)
        }

        const kIdFromLS = this.#instanceManager.storage.readFromLSorCookie(KCOOKIE_NAME)
        let guidFromLRUCache
        if (kIdFromLS != null && kIdFromLS.id) {
          guidFromLRUCache = this.#instanceManager.state.LRU_CACHE.cache[kIdFromLS.id]
          if (resume) {
            if (!guidFromLRUCache) {
              this.#instanceManager.storage.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, true)
              // replace login identity in OUL request
              // with the gcookie returned in exchange
              this.#instanceManager.state.LRU_CACHE.set(kIdFromLS.id, global)
            }
          }
        }

        this.#instanceManager.storage.saveToLSorCookie(GCOOKIE_NAME, global)
        // lastk provides the guid
        const lastK = this.#instanceManager.state.LRU_CACHE.getSecondLastKey()
        if (this.#instanceManager.storage.readFromLSorCookie(FIRE_PUSH_UNREGISTERED) && lastK !== -1) {
          const lastGUID = this.#instanceManager.state.LRU_CACHE.cache[lastK]
          // fire the request directly via fireRequest to unregister the token
          // then other requests with the updated guid should follow
          this.#request.unregisterTokenForGuid(lastGUID)
        }
      }
      this.#instanceManager.storage.createBroadCookie(GCOOKIE_NAME, global, COOKIE_EXPIRY, window.location.hostname, this.domainSpecification)
      this.#instanceManager.storage.saveToLSorCookie(GCOOKIE_NAME, global)
    }

    if (this.#instanceManager.storage._isLocalStorageSupported()) {
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
      this.#instanceManager.state.blockRequest = false
    }

    // only process the backup events after an OUL request or a new guid is recieved
    if ((oulReq || newGuid) && !this.#request.processingBackup) {
      this.#request.processBackupEvents()
    }

    this.#instanceManager.state.globalCache.RESP_N = respNumber
  }
}
