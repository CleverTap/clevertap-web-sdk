// import { Account } from './modules/account'
// import {
//   logLevels,
//   Logger
// } from './modules/logger'
// import {
//   INVALID_ACCOUNT
// } from './util/messages'
// import { StorageManager } from './util/storage'
// import {
//   getURLParams
// } from './util/url'
// // import { api } from './api'
// // import { session } from './session'
// // import { user } from './user'
// import { DeviceManager } from './modules/device'
// import { SessionManager } from './modules/session'
// import { EventHandler } from './modules/event'
// import { CleverTapAPI } from './modules/api'

// export default class CleverTap {
//   #api
//   #session
//   #user

//   #account
//   #logger
//   #device
//   #event

//   // Globals Used. To be sorted later

//   // #dataPostURL -> account.js
//   // #recorderURL -> account.js
//   // #emailURL -> account.js
//   #domain
//   #broadDomain
//   #requestTime
//   #seqNo
//   #wiz_counter
//   #globalCache
//   #onloadcalled
//   // #processingBackup -> to event.js
//   #unsubGroups
//   #gcookie
//   #scookieObj
//   #campaignDivMap
//   #blockRequeust
//   #clearCookie
//   // #SCOOKIE_NAME -> in session
//   #globalChargedId
//   #globalEventsMap
//   #globalProfileMap
//   #currentSessionId
//   #LRU_CACHE
//   #LRU_CACHE_SIZE
//   #chromeAgent
//   #firefoxAgent
//   #safariAgent
//   #fcmPublicKey

//   constructor (clevertap = {}) {
//     // this.options = {...options}
//     window.clevertap.event = Array.isArray(window.clevertap.event) ? window.clevertap.event : []
//     window.clevertap.profile = Array.isArray(window.clevertap.profile) ? window.clevertap.profile : []
//     window.clevertap.account = Array.isArray(window.clevertap.account) ? window.clevertap.account : []
//     window.clevertap.onUserLogin = Array.isArray(window.clevertap.onUserLogin) ? window.clevertap.onUserLogin : []
//     window.clevertap.notifications = Array.isArray(window.clevertap.notifications) ? window.clevertap.notifications : []
//     window.clevertap.privacy = Array.isArray(window.clevertap.privacy) ? window.clevertap.privacy : []

//     // Initialize Modules
//     this.#logger = new Logger(logLevels.INFO)
//     this.#api = new CleverTapAPI({
//       logger: this.#logger
//     })
//     this.#account = new Account({
//       logger: this.#logger
//     })
//     this.#event = new EventHandler({
//       api: this.#api,
//       logger: this.#logger
//     })

//     // Other Properties
//     this.#requestTime = 0
//     this.#seqNo = 0
//     this.#wiz_counter = 0 // to keep track of number of times we load the body
//     this.#globalCache = {}
//     this.#onloadcalled = false
//     this.#unsubGroups = []
//     this.#campaignDivMap = {}
//     this.#blockRequeust = false
//     this.#clearCookie = false
//     this.#LRU_CACHE_SIZE = 100
//     this.#fcmPublicKey = null

// window.$ct = {
//   globalCache: {
//     gcookie: null,
//     RESP_N: 0,
//     RESP_N: 0,
//   }
// }
//   }

//   init (id, region) {
//     if (id + '' === '') {
//       this.#logger.error(INVALID_ACCOUNT)
//       return
//     }
//     this.#account.accountID = id
//     this.#session = new SessionManager({
//       accountID: this.#account.accountID,
//       logger: this.#logger
//     })

//     if (region != null) {
//       this.#account.region = region
//     }

//     if (window.wizrocket != null && window.clevertap == null) {
//       window.clevertap = window.wizrocket
//     } else {
//       window.wizrocket = window.clevertap
//     }

//     this.#domain = window.location.hostname
//     let currentLocation = window.location.href
//     let url_params = getURLParams(currentLocation.toLowerCase())

//     StorageManager.removeCookie('WZRK_P', this.#domain) // delete pcookie
//     this.#device = new DeviceManager(
//       this.#account.accountID,
//       this.#logger
//     )
//     this.#currentSessionId = StorageManager.getMetaProp('cs')

//     if (url_params != null && url_params['wzrk_ex'] == '0') {
//       return
//     }

//     this.#onloadcalled = true // Always set at the end
//   }
// }

import Account from './modules/account'
import CleverTapAPI from './modules/api'
import DeviceManager from './modules/device'
import EventHandler from './modules/event'
import { Logger, logLevels } from './modules/logger'
import SessionManager from './modules/session'
import ReqestManager from './modules/request'
import { CAMP_COOKIE_NAME, SCOOKIE_PREFIX } from './util/constants'
import { EMBED_ERROR } from './util/messages'
import { StorageManager } from './util/storage'
import { addToURL, getDomain, getURLParams } from './util/url'
import { getCampaignObjForLc } from './util/clevertap'
import { compressData } from './util/encoder'

// TODO: figure out a better way to do this. window is not a good approach
window.$ct = {
  globalCache: {
    gcookie: null,
    REQ_N: 0,
    RESP_N: 0
  },
  blockRequest: false
}

export default class CleverTap {
  #logger
  #api
  #onloadcalled
  #device
  #session
  #account
  #request
  enablePersonalization

  constructor (clevertap = {}) {
    this.#onloadcalled = 0
    this.#logger = new Logger(logLevels.INFO)
    this.#account = new Account(clevertap.account?.[0], clevertap.region, clevertap.targetDomain)
    this.#device = new DeviceManager({ logger: this.#logger })
    this.#session = new SessionManager({ logger: this.#logger })
    this.#request = new ReqestManager({
      logger: this.#logger,
      account: this.#account,
      device: this.#device,
      session: this.#session,
      isPersonalisationActive: this.#isPersonalisationActive
    })
    this.event = new EventHandler({ logger: this.#logger }, clevertap.event)

    this.#api = new CleverTapAPI({ logger: this.#logger })

    window.$WZRK_WR = this.#api
  }

  init (accountId, region, targetDomain) {
    if (this.#onloadcalled === 1) {
      // already initailsed
      return
    }
    StorageManager.removeCookie('WZRK_P', window.location.hostname)
    if (!this.#account.id) {
      if (!accountId) {
        this.#logger.error(EMBED_ERROR)
        return
      }
      this.#account.id = accountId
    }
    this.#session.cookieName = SCOOKIE_PREFIX + '_' + this.#account.id

    if (region) {
      this.#account.region = region
    }
    if (targetDomain) {
      this.#account.targetDomain = targetDomain
    }

    const currLocation = location.href
    const urlParams = getURLParams(currLocation.toLowerCase())

    // eslint-disable-next-line eqeqeq
    if (typeof urlParams.e !== 'undefined' && urlParams.wzrk_ex == '0') {
      return
    }

    this.#request.processBackupEvents()
    this.#processOldValues()

    this.pageChanged()

    this.#onloadcalled = 1
  }

  #processOldValues () {
    // TODO create classes old data handlers for OUL, Privacy, notifications
    this.event.processOldValues()
  }

  pageChanged () {
    const currLocation = location.href
    const urlParams = getURLParams(currLocation.toLowerCase())
    // -- update page count
    const obj = this.#session.getSessionCookieObject()
    let pgCount = (typeof obj.p === 'undefined') ? 0 : obj.p
    obj.p = ++pgCount
    this.#session.setSessionCookieObject(obj)
    // -- update page count

    let data = {}
    let referrerDomain = getDomain(document.referrer)

    if (location.hostname !== referrerDomain) {
      const maxLen = 120
      if (referrerDomain !== '') {
        referrerDomain = referrerDomain.length > maxLen ? referrerDomain.substring(0, maxLen) : referrerDomain
        data.referrer = referrerDomain
      }

      let utmSource = urlParams.utm_source || urlParams.wzrk_source
      if (typeof utmSource !== 'undefined') {
        utmSource = utmSource.length > maxLen ? utmSource.substring(0, maxLen) : utmSource
        data.us = utmSource // utm_source
      }

      let utmMedium = urlParams.utm_medium || urlParams.wzrk_medium
      if (typeof utmMedium !== 'undefined') {
        utmMedium = utmMedium.length > maxLen ? utmMedium.substring(0, maxLen) : utmMedium
        data.um = utmMedium // utm_medium
      }

      let utmCampaign = urlParams.utm_campaign || urlParams.wzrk_campaign
      if (typeof utmCampaign !== 'undefined') {
        utmCampaign = utmCampaign.length > maxLen ? utmCampaign.substring(0, maxLen) : utmCampaign
        data.uc = utmCampaign // utm_campaign
      }

      // also independently send wzrk_medium to the backend
      if (typeof urlParams.wzrk_medium !== 'undefined') {
        const wm = urlParams.wzrk_medium
        if (wm.match(/^email$|^social$|^search$/)) {
          data.wm = wm // wzrk_medium
        }
      }
    }

    data = this.#request.addSystemDataToObject(data, undefined)
    data.cpg = currLocation

    data[CAMP_COOKIE_NAME] = getCampaignObjForLc()
    let pageLoadUrl = this.#account.dataPostURL
    this.#request.addFlags(data)
    // send dsync flag when page = 1
    if (parseInt(data.pg) === 1) {
      this.#overrideDSyncFlag(data)
    }
    pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page')
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data)))

    this.#request.saveAndFireRequest(pageLoadUrl, false)
  }

  #isPersonalisationActive () {
    return StorageManager._isLocalStorageSupported() && this.enablePersonalization
  }

  #overrideDSyncFlag (data) {
    if (this.#isPersonalisationActive()) {
      data.dsync = true
    }
  }
}
