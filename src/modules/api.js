import { COOKIE_EXPIRY, FIRE_PUSH_UNREGISTERED, GCOOKIE_NAME, KCOOKIE_NAME, LRU_CACHE_SIZE, USEIP_KEY } from '../util/constants'
import { isValueValid } from '../util/datatypes'
import { getNow } from '../util/datetime'
import LRUCache from '../util/lruCache'
import { StorageManager, $ct } from '../util/storage'
import { getHostName } from '../util/url'
import globalWindow from './window'

export default class CleverTapAPI {
  #logger
  #request
  #device
  #session

  constructor (props) {
    this.setPrivateProperties(props)
  }

  setPrivateProperties ({ logger, request, device, session }) {
    this.#logger = logger
    this.#request = request
    this.#device = device
    this.#session = session
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

  async s (global, session, resume, respNumber, optOutResponse) {
    let oulReq = false
    let newGuid = false

    // for a scenario when OUL request is true from client side
    // but resume is returned as false from server end
    // we maintan a OulReqN var in the window object
    // and compare with respNumber to determine the response of an OUL request
    if (globalWindow.isOULInProgress) {
      if (resume || (respNumber !== 'undefined' && Number(respNumber) === globalWindow.oulReqN)) {
        globalWindow.isOULInProgress = false
        oulReq = true
      }
    }

    // call back function used to store global and session ids for the user
    if (typeof respNumber === 'undefined') {
      respNumber = 0
    }

    await StorageManager.removeBackup(Number(respNumber), this.#logger)

    if (Number(respNumber) > $ct.globalCache.REQ_N) {
      // request for some other user so ignore
      return
    }

    if (!isValueValid(this.#device.gcookie)) {
      if (global) {
        newGuid = true
      }
    }

    if (!isValueValid(this.#device.gcookie) || resume || typeof optOutResponse === 'boolean') {
      const sessionObj = await this.#session.getSessionCookieObject()

      /*  If the received session is less than the session in the cookie,
          then don't update guid as it will be response for old request
      */
      if (globalWindow.isOULInProgress || (sessionObj.s && (session < sessionObj.s))) {
        return
      }
      this.#logger.debug(`Cookie was ${this.#device.gcookie} set to ${global}`)
      this.#device.gcookie = global
      if (!isValueValid(this.#device.gcookie)) {
        // clear useIP meta prop
        await StorageManager.getAndClearMetaProp(USEIP_KEY)
      }
      if (global && StorageManager._isLocalStorageSupported()) {
        if ($ct.LRU_CACHE == null) {
          $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE)
          await $ct.LRU_CACHE.init()
        }

        const kIdFromLS = await StorageManager.readFromLSorCookie(KCOOKIE_NAME)
        let guidFromLRUCache
        if (kIdFromLS != null && kIdFromLS.id) {
          guidFromLRUCache = $ct.LRU_CACHE.cache[kIdFromLS.id]
          if (resume) {
            if (!guidFromLRUCache) {
              await StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, true)
              // replace login identity in OUL request
              // with the gcookie returned in exchange
              $ct.LRU_CACHE.set(kIdFromLS.id, global)
            }
          }
        }

        await StorageManager.saveToLSorCookie(GCOOKIE_NAME, global)
        // lastk provides the guid
        const lastK = $ct.LRU_CACHE.getSecondLastKey()
        if (await StorageManager.readFromLSorCookie(FIRE_PUSH_UNREGISTERED) && lastK !== -1) {
          const lastGUID = $ct.LRU_CACHE.cache[lastK]
          // fire the request directly via fireRequest to unregister the token
          // then other requests with the updated guid should follow
          this.#request.unregisterTokenForGuid(lastGUID)
        }
      }
      await StorageManager.createBroadCookie(GCOOKIE_NAME, global, COOKIE_EXPIRY, getHostName())
      await StorageManager.saveToLSorCookie(GCOOKIE_NAME, global)
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

    // set blockRequest to false only if the device has a valid gcookie
    if (isValueValid(this.#device.gcookie)) {
      $ct.blockRequest = false
    }

    // only process the backup events after an OUL request or a new guid is recieved
    if ((oulReq || newGuid) && !this.#request.processingBackup) {
      this.#request.processBackupEvents()
    }

    $ct.globalCache.RESP_N = Number(respNumber)
  }
}

const clevertapApi = new CleverTapAPI({
  logger: '',
  request: '',
  device: '',
  session: ''
})
export { clevertapApi }
