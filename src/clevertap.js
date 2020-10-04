import { Account } from './modules/account'
import {
  logLevels,
  Logger
} from './modules/logger'
import {
  INVALID_ACCOUNT
} from './util/messages'
import { StorageManager } from './util/storage'
import {
  getURLParams
} from './util/url'
// import { api } from './api'
// import { session } from './session'
// import { user } from './user'
import { DeviceManager } from './modules/device'
import { SessionManager } from './modules/session'
import { EventHandler } from './modules/event'
import { CleverTapAPI } from './modules/api'

export default class CleverTap {
  #api
  #session
  #user

  #account
  #logger
  #device
  #event

  // Globals Used. To be sorted later

  // #dataPostURL -> account.js
  // #recorderURL -> account.js
  // #emailURL -> account.js
  #domain
  #broadDomain
  #requestTime
  #seqNo
  #wiz_counter
  #globalCache
  #onloadcalled
  // #processingBackup -> to event.js
  #unsubGroups
  #gcookie
  #scookieObj
  #campaignDivMap
  #blockRequeust
  #clearCookie
  // #SCOOKIE_NAME -> in session
  #globalChargedId
  #globalEventsMap
  #globalProfileMap
  #currentSessionId
  #LRU_CACHE
  #LRU_CACHE_SIZE
  #chromeAgent
  #firefoxAgent
  #safariAgent
  #fcmPublicKey

  constructor (clevertap = {}) {
    // this.options = {...options}
    window.clevertap.event = Array.isArray(window.clevertap.event) ? window.clevertap.event : []
    window.clevertap.profile = Array.isArray(window.clevertap.profile) ? window.clevertap.profile : []
    window.clevertap.account = Array.isArray(window.clevertap.account) ? window.clevertap.account : []
    window.clevertap.onUserLogin = Array.isArray(window.clevertap.onUserLogin) ? window.clevertap.onUserLogin : []
    window.clevertap.notifications = Array.isArray(window.clevertap.notifications) ? window.clevertap.notifications : []
    window.clevertap.privacy = Array.isArray(window.clevertap.privacy) ? window.clevertap.privacy : []

    // Initialize Modules
    this.#logger = new Logger(logLevels.INFO)
    this.#api = new CleverTapAPI({
      logger: this.#logger
    })
    this.#account = new Account({
      logger: this.#logger
    })
    this.#event = new EventHandler({
      api: this.#api,
      logger: this.#logger
    })

    // Other Properties
    this.#requestTime = 0
    this.#seqNo = 0
    this.#wiz_counter = 0 // to keep track of number of times we load the body
    this.#globalCache = {}
    this.#onloadcalled = false
    this.#unsubGroups = []
    this.#campaignDivMap = {}
    this.#blockRequeust = false
    this.#clearCookie = false
    this.#LRU_CACHE_SIZE = 100
    this.#fcmPublicKey = null

    window.$ct = {
      globalCache: {
        gcookie: null,
        RESP_N: 0,
        RESP_N: 0,
      }
    }
  }
  
  init (id, region) {
    if (id + '' === '') {
      this.#logger.error(INVALID_ACCOUNT)
      return
    }
    this.#account.accountID = id
    this.#session = new SessionManager({
      accountID: this.#account.accountID,
      logger: this.#logger
    })

    if (region != null) {
      this.#account.region = region
    }

    if (window.wizrocket != null && window.clevertap == null) {
      window.clevertap = window.wizrocket
    } else {
      window.wizrocket = window.clevertap
    }

    this.#domain = window.location.hostname
    let currentLocation = window.location.href
    let url_params = getURLParams(currentLocation.toLowerCase())
    
    StorageManager.removeCookie('WZRK_P', this.#domain) // delete pcookie
    this.#device = new DeviceManager(
      this.#account.accountID,
      this.#logger
    )
    this.#currentSessionId = StorageManager.getMetaProp('cs')

    if (url_params != null && url_params['wzrk_ex'] == '0') {
      return
    }


    this.#onloadcalled = true // Always set at the end
  }
}
