import { CAMP_COOKIE_NAME, CLEAR, EVT_PUSH, EV_COOKIE, FIRE_PUSH_UNREGISTERED, LCOOKIE_NAME, PUSH_SUBSCRIPTION_DATA, WEBPUSH_LS_KEY } from '../util/constants'
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

    return dataObject
  }

  addSystemDataToProfileObject (dataObject, ignoreTrim) {
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

  saveAndFireRequest (url, override, sendOULFlag) {
    const now = getNow()
    url = addToURL(url, 'rn', ++$ct.globalCache.REQ_N)
    const data = url + '&i=' + now + '&sn=' + seqNo
    StorageManager.backupEvent(data, $ct.globalCache.REQ_N, this.#logger)

    if (!override || (this.#clearCookie !== undefined && this.#clearCookie)) {
      if (now === requestTime) {
        seqNo++
      } else {
        requestTime = now
        seqNo = 0
      }

      RequestDispatcher.fireRequest(data, false, sendOULFlag)
    } else {
      this.#logger.debug(`Not fired due to block request - ${$ct.blockRequest} or clearCookie - ${this.#clearCookie}`)
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
    data[CAMP_COOKIE_NAME] = getCampaignObjForLc()
    const compressedData = compressData(JSON.stringify(data), this.#logger)
    let pageLoadUrl = this.#account.dataPostURL
    pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

    this.saveAndFireRequest(pageLoadUrl, false)
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
}
