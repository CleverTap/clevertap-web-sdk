import { Account } from './modules/account'
import {
  logLevels,
  Logger
} from './modules/logger'
import { errors } from './util/messages'
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
    // this.event = Array.isArray(clevertap.event) ? clevertap.event : []
    // this.profile = Array.isArray(clevertap.profile) ? clevertap.profile : []
    // this.account = Array.isArray(clevertap.account) ? clevertap.account : []
    // this.onUserLogin = Array.isArray(clevertap.onUserLogin) ? clevertap.onUserLogin : []
    // this.notifications = Array.isArray(clevertap.notifications) ? clevertap.notifications : []
    // this.privacy = Array.isArray(clevertap.privacy) ? clevertap.privacy : []

    // Initialize Modules
    this.#logger = new Logger(logLevels.INFO)
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
    this.#processingBackup = false
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
      this.#logger.error(errors.INVALID_ACCOUNT)
      return
    }
    this.#account.accountID = id
    this.#session = new SessionManager(this.#account.accountID)

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
