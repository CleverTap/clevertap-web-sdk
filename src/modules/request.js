import { SCOOKIE_PREFIX, CAMP_COOKIE_NAME, CLEAR, EVT_PUSH, EV_COOKIE, FIRE_PUSH_UNREGISTERED, LCOOKIE_NAME, PUSH_SUBSCRIPTION_DATA, WEBPUSH_LS_KEY, MUTE_EXPIRY_KEY } from '../util/constants'
import { isObjectEmpty, isValueValid, removeUnsupportedChars, safeJSONParse } from '../util/datatypes'
import { getNow } from '../util/datetime'
import { compressData } from '../util/encoder'
import RequestDispatcher from '../util/requestDispatcher'
import { addToURL } from '../util/url'
import { getCampaignObjForLc } from '../util/clevertap'

export default class RequestManager {
  #logger
  #account
  #device
  #session
  #isPersonalisationActive
  #instanceManager
  #clearCookie = false
  #seqNo = 0
  #requestTime = 0
  processingBackup = false

  constructor ({ logger, account, device, session, isPersonalisationActive, instanceManager }) {
    this.#logger = logger
    this.#account = account
    this.#device = device
    this.#session = session
    this.#isPersonalisationActive = isPersonalisationActive
    this.#instanceManager = instanceManager

    this.dispatcher = new RequestDispatcher({ logger, device, account, instanceManager })
  }

  /**
 * Unified backup processing method
 * @param {boolean} oulOnly - If true, process only OUL requests. If false, process all non-fired requests.
 */
  processBackupEvents (oulOnly = false) {
    const backupMap = this.#instanceManager.storage.readFromLSorCookie(LCOOKIE_NAME)
    if (typeof backupMap === 'undefined' || backupMap === null) {
      return
    }

    this.processingBackup = true

    for (const idx in backupMap) {
      if (backupMap.hasOwnProperty(idx)) {
        const backupEvent = backupMap[idx]

        if (typeof backupEvent.fired !== 'undefined') {
          continue
        }

        const isOULRequest = this.#instanceManager.storage.isBackupOUL(parseInt(idx))
        const shouldProcess = oulOnly ? isOULRequest : true

        if (shouldProcess) {
          this.#logger.debug(`Processing ${isOULRequest ? 'OUL' : 'regular'} backup event : ${backupEvent.q}`)

          if (typeof backupEvent.q !== 'undefined') {
            // Use safe JSON parsing to prevent injection attacks
            const session = safeJSONParse(this.#instanceManager.storage.readCookie(SCOOKIE_PREFIX + '_' + this.#account.id), null)
            if (session?.s) {
              backupEvent.q = backupEvent.q + '&s=' + session.s
            }
            this.dispatcher.fireRequest(backupEvent.q)
          }
          backupEvent.fired = true
        }
      }
    }
    this.#instanceManager.storage.saveToLSorCookie(LCOOKIE_NAME, backupMap)
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
    dataObject.af = { ...dataObject.af, lib: 'web-sdk-v$$PACKAGE_VERSION$$', protocol: proto, ...this.#instanceManager.state.flutterVersion } // app fields
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
    this.#clearCookie = this.#instanceManager.storage.getAndClearMetaProp(CLEAR)
    if (this.#clearCookie !== undefined && this.#clearCookie) {
      data.rc = true
      this.#logger.debug('reset cookie sent in request and cleared from meta for future requests.')
    }
    if (this.#isPersonalisationActive()) {
      const lastSyncTime = this.#instanceManager.storage.getMetaProp('lsTime')
      const expirySeconds = this.#instanceManager.storage.getMetaProp('exTs')

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
    // Check if SDK is muted (for churned accounts) - drop request silently
    // Unlike offline mode, muted requests are NOT saved to backup
    const muteExpiry = this.#instanceManager.storage.readFromLSorCookie(MUTE_EXPIRY_KEY)
    if (muteExpiry && muteExpiry > 0 && Date.now() < muteExpiry) {
      this.#logger.debug('Request dropped - SDK is muted')
      return
    }

    const now = getNow()

    // Get the next available request number that doesn't conflict with existing backups
    const nextReqN = this.#getNextAvailableReqN()
    this.#instanceManager.state.globalCache.REQ_N = nextReqN

    // Register this request number in the JSONP dispatcher so responses route to this instance
    if (window.$WZRK_WR && window.$WZRK_WR._apiMap && this.dispatcher && this.dispatcher.api) {
      window.$WZRK_WR._apiMap[nextReqN] = this.dispatcher.api
    }

    url = addToURL(url, 'rn', nextReqN)
    const data = url + '&i=' + now + '&sn=' + this.#seqNo
    this.#instanceManager.storage.backupEvent(data, nextReqN, this.#logger)

    // Mark as OUL if it's an OUL request
    if (sendOULFlag) {
      this.#instanceManager.storage.markBackupAsOUL(nextReqN)
    }

    // if offline is set to true, save the request in backup and return
    if (this.#instanceManager.state.offline || this.#instanceManager.state.delayEvents) return

    // if there is no override
    // and an OUL request is not in progress
    // then process the request as it is
    // else block the request
    // note - blockRequest should ideally be used for override
    if ((!override || (this.#clearCookie !== undefined && this.#clearCookie)) && !this.#instanceManager.isOULInProgress) {
      if (now === this.#requestTime) {
        this.#seqNo++
      } else {
        this.#requestTime = now
        this.#seqNo = 0
      }
      this.#instanceManager.oulReqN = nextReqN
      this.dispatcher.fireRequest(data, false, sendOULFlag, evtName)
    } else {
      this.#logger.debug(`Not fired due to override - ${this.#instanceManager.state.blockRequest} or clearCookie - ${this.#clearCookie} or OUL request in progress - ${this.#instanceManager.isOULInProgress}`)
    }
  }

#getNextAvailableReqN () {
  // Read existing backup data to check for conflicts
  const backupMap = this.#instanceManager.storage.readFromLSorCookie(LCOOKIE_NAME)

  // Start from the current REQ_N + 1
  let candidateReqN = this.#instanceManager.state.globalCache.REQ_N + 1

  // If no backup data exists, use the candidate
  if (!backupMap || typeof backupMap !== 'object') {
    return candidateReqN
  }

  // Keep incrementing until we find a request number that doesn't exist in backup
  while (backupMap.hasOwnProperty(candidateReqN.toString())) {
    candidateReqN++
    this.#logger.debug(`Request number ${candidateReqN - 1} already exists in backup, trying ${candidateReqN}`)
  }

  this.#logger.debug(`Using request number: ${candidateReqN}`)
  return candidateReqN
}

unregisterTokenForGuid (givenGUID) {
  const payload = this.#instanceManager.storage.readFromLSorCookie(PUSH_SUBSCRIPTION_DATA)
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
    this.dispatcher.fireRequest(pageLoadUrl, true)
    this.#instanceManager.storage.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false)
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
  this.dispatcher.fireRequest(pageLoadUrl)
  // set in localstorage
  this.#instanceManager.storage.save(WEBPUSH_LS_KEY, 'ok')
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

  this.saveAndFireRequest(pageLoadUrl, this.#instanceManager.state.blockRequest, false, data.evtName)
}

  #addToLocalEventMap (evtName) {
    if (this.#instanceManager.storage._isLocalStorageSupported()) {
      if (typeof this.#instanceManager.state.globalEventsMap === 'undefined') {
        this.#instanceManager.state.globalEventsMap = this.#instanceManager.storage.readFromLSorCookie(EV_COOKIE)
        if (typeof this.#instanceManager.state.globalEventsMap === 'undefined') {
          this.#instanceManager.state.globalEventsMap = {}
        }
      }

      const nowTs = getNow()
      let evtDetail = this.#instanceManager.state.globalEventsMap[evtName]
      if (typeof evtDetail !== 'undefined') {
        evtDetail[2] = nowTs
        evtDetail[0]++
      } else {
        evtDetail = []
        evtDetail.push(1)
        evtDetail.push(nowTs)
        evtDetail.push(nowTs)
      }
      this.#instanceManager.state.globalEventsMap[evtName] = evtDetail
      this.#instanceManager.storage.saveToLSorCookie(EV_COOKIE, this.#instanceManager.state.globalEventsMap)
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
