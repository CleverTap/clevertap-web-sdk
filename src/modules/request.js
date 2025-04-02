import { SCOOKIE_PREFIX, CAMP_COOKIE_NAME, CLEAR, EVT_PUSH, EV_COOKIE, FIRE_PUSH_UNREGISTERED, LCOOKIE_NAME, PUSH_SUBSCRIPTION_DATA, WEBPUSH_LS_KEY } from '../util/constants'
import { isObjectEmpty, isValueValid, removeUnsupportedChars } from '../util/datatypes'
import { getNow } from '../util/datetime'
import { compressData } from '../util/encoder'
import RequestDispatcher from '../util/requestDispatcher'
import { StorageManager, $ct } from '../util/storage'
import { addToURL } from '../util/url'
import { getCampaignObjForLc } from '../util/clevertap'

let seqNo = 0
let requestTime = 0

export default class RequestManager {
  #logger
  #account
  #device
  #session
  #isPersonalisationActive
  #clearCookie = false
  processingBackup = false

  constructor ({ logger, account, device, session, isPersonalisationActive }) {
    this.#logger = logger
    this.#account = account
    this.#device = device
    this.#session = session
    this.#isPersonalisationActive = isPersonalisationActive

    RequestDispatcher.logger = logger
    RequestDispatcher.device = device
    RequestDispatcher.account = account
  }

  processBackupEvents () {
    const backupMap = StorageManager.readFromLSorCookie(LCOOKIE_NAME)
    if (typeof backupMap === 'undefined' || backupMap === null) {
      return
    }
    this.processingBackup = true
    for (const idx in backupMap) {
      if (backupMap.hasOwnProperty(idx)) {
        const backupEvent = backupMap[idx]
        if (typeof backupEvent.fired === 'undefined') {
          this.#logger.debug('Processing backup event : ' + backupEvent.q)
          if (typeof backupEvent.q !== 'undefined') {
            /* For extremely slow networks we often recreate the session from the SE hence appending
            the session to the request */

            const session = JSON.parse(StorageManager.readCookie(SCOOKIE_PREFIX + '_' + this.#account.id))
            if (session?.s) {
              backupEvent.q = backupEvent.q + '&s=' + session.s
            }
            RequestDispatcher.fireRequest(backupEvent.q)
          }
          backupEvent.fired = true
        }
      }
    }
    StorageManager.saveToLSorCookie(LCOOKIE_NAME, backupMap)
    this.processingBackup = false
  }

  addSystemDataToObject (dataObject, ignoreTrim) {
    // ignore trim for chrome notifications; undefined everywhere else
    if (typeof ignoreTrim === 'undefined') {
      dataObject = removeUnsupportedChars(dataObject, this.#logger)
    }

    if (!isObjectEmpty(this.#logger.wzrkError)) {
      dataObject.wzrk_error = this.#logger.wzrkError
      this.#logger.wzrkError = {}
    }

    dataObject.id = this.#account.id

    if (isValueValid(this.#device.gcookie)) {
      dataObject.g = this.#device.gcookie
    }

    const obj = this.#session.getSessionCookieObject()
    dataObject.s = obj.s // session cookie
    dataObject.pg = (typeof obj.p === 'undefined') ? 1 : obj.p // Page count
    let proto = document.location.protocol
    proto = proto.replace(':', '')
    dataObject.af = { ...dataObject.af, lib: 'web-sdk-v$$PACKAGE_VERSION$$', protocol: proto, ...$ct.flutterVersion } // app fields
    try {
      if (sessionStorage.hasOwnProperty('WZRK_D') || sessionStorage.getItem('WZRK_D')) {
        dataObject.debug = true
      }
    } catch (e) {
      this.#logger.debug('Error in reading WZRK_D from session storage')
    }

    return dataObject
  }

  addFlags (data) {
    // check if cookie should be cleared.
    this.#clearCookie = StorageManager.getAndClearMetaProp(CLEAR)
    if (this.#clearCookie !== undefined && this.#clearCookie) {
      data.rc = true
      this.#logger.debug('reset cookie sent in request and cleared from meta for future requests.')
    }
    if (this.#isPersonalisationActive()) {
      const lastSyncTime = StorageManager.getMetaProp('lsTime')
      const expirySeconds = StorageManager.getMetaProp('exTs')

      // dsync not found in local storage - get data from server
      if (typeof lastSyncTime === 'undefined' || typeof expirySeconds === 'undefined') {
        data.dsync = true
        return
      }
      const now = getNow()
      // last sync time has expired - get fresh data from server
      if (lastSyncTime + expirySeconds < now) {
        data.dsync = true
      }
    }
  }

  // saves url to backup cache and fires the request
  /**
   *
   * @param {string} url
   * @param {boolean} override whether the request can go through or not
   * @param {Boolean} sendOULFlag - true in case of a On User Login request
   */
  saveAndFireRequest (url, override, sendOULFlag, evtName) {
    const now = getNow()
    url = addToURL(url, 'rn', ++$ct.globalCache.REQ_N)
    const data = url + '&i=' + now + '&sn=' + seqNo
    StorageManager.backupEvent(data, $ct.globalCache.REQ_N, this.#logger)

    // if offline is set to true, save the request in backup and return
    if ($ct.offline) return
    // if there is no override
    // and an OUL request is not in progress
    // then process the request as it is
    // else block the request
    // note - $ct.blockRequest should ideally be used for override
    if ((!override || (this.#clearCookie !== undefined && this.#clearCookie)) && !window.isOULInProgress) {
      if (now === requestTime) {
        seqNo++
      } else {
        requestTime = now
        seqNo = 0
      }
      window.oulReqN = $ct.globalCache.REQ_N
      RequestDispatcher.fireRequest(data, false, sendOULFlag, evtName)
    } else {
      this.#logger.debug(`Not fired due to override - ${$ct.blockRequest} or clearCookie - ${this.#clearCookie} or OUL request in progress - ${window.isOULInProgress}`)
    }
  }

  unregisterTokenForGuid (givenGUID) {
    const payload = StorageManager.readFromLSorCookie(PUSH_SUBSCRIPTION_DATA)
    // Send unregister event only when token is available
    if (payload) {
      const data = {}
      data.type = 'data'
      if (isValueValid(givenGUID)) {
        data.g = givenGUID
      }
      data.action = 'unregister'
      data.id = this.#account.id

      const obj = this.#session.getSessionCookieObject()

      data.s = obj.s // session cookie
      const compressedData = compressData(JSON.stringify(data), this.#logger)

      let pageLoadUrl = this.#account.dataPostURL
      pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data')
      pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)
      RequestDispatcher.fireRequest(pageLoadUrl, true)
      StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false)
    }
    // REGISTER TOKEN
    this.registerToken(payload)
  }

  registerToken (payload) {
    if (!payload) return
    // add gcookie etc to the payload
    payload = this.addSystemDataToObject(payload, true)
    payload = JSON.stringify(payload)
    let pageLoadUrl = this.#account.dataPostURL
    pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data')
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(payload, this.#logger))
    RequestDispatcher.fireRequest(pageLoadUrl)
    // set in localstorage
    StorageManager.save(WEBPUSH_LS_KEY, 'ok')
  }

  processEvent (data) {
    this.#addToLocalEventMap(data.evtName)
    data = this.addSystemDataToObject(data, undefined)
    this.addFlags(data)
    data[CAMP_COOKIE_NAME] = getCampaignObjForLc(this.#session)
    const compressedData = compressData(JSON.stringify(data), this.#logger)
    let pageLoadUrl = this.#account.dataPostURL
    pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

    this.saveAndFireRequest(pageLoadUrl, $ct.blockRequest, false, data.evtName)
  }

  #addToLocalEventMap (evtName) {
    if (StorageManager._isLocalStorageSupported()) {
      if (typeof $ct.globalEventsMap === 'undefined') {
        $ct.globalEventsMap = StorageManager.readFromLSorCookie(EV_COOKIE)
        if (typeof $ct.globalEventsMap === 'undefined') {
          $ct.globalEventsMap = {}
        }
      }

      const nowTs = getNow()
      let evtDetail = $ct.globalEventsMap[evtName]
      if (typeof evtDetail !== 'undefined') {
        evtDetail[2] = nowTs
        evtDetail[0]++
      } else {
        evtDetail = []
        evtDetail.push(1)
        evtDetail.push(nowTs)
        evtDetail.push(nowTs)
      }
      $ct.globalEventsMap[evtName] = evtDetail
      StorageManager.saveToLSorCookie(EV_COOKIE, $ct.globalEventsMap)
    }
  }

  post (url, body) {
    return fetch(url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: body
    })
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw response
      })
      .then((data) => {
        this.#logger.debug('Sync data successful', data)
        return data
      })
      .catch((e) => {
        this.#logger.debug('Error in syncing variables', e)
        throw e
      })
  }
}
