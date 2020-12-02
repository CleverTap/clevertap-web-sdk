import Account from './modules/account'
import CleverTapAPI from './modules/api'
import DeviceManager from './modules/device'
import EventHandler from './modules/event'
import ProfileHandler from './modules/profile'
import UserLoginHandler from './modules/userLogin'
import User from './modules/user'
import { Logger, logLevels } from './modules/logger'
import SessionManager from './modules/session'
import ReqestManager from './modules/request'
import {
  CAMP_COOKIE_NAME,
  SCOOKIE_PREFIX,
  EVT_PING,
  FIRST_PING_FREQ_IN_MILLIS,
  CONTINUOUS_PING_FREQ_IN_MILLIS
} from './util/constants'
import { EMBED_ERROR } from './util/messages'
import { StorageManager } from './util/storage'
import { addToURL, getDomain, getURLParams } from './util/url'
import { getCampaignObjForLc } from './util/clevertap'
import { compressData } from './util/encoder'
import Privacy from './modules/privacy'
import NotificationHandler from './modules/notification'

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
    this._isPersonalisationActive = this._isPersonalisationActive.bind(this)
    this.#logger = new Logger(logLevels.INFO)
    this.#account = new Account(clevertap.account?.[0], clevertap.region, clevertap.targetDomain)
    this.#device = new DeviceManager({ logger: this.#logger })
    this.#session = new SessionManager({
      logger: this.#logger,
      isPersonalizationActive: this._isPersonalisationActive
    })
    this.#request = new ReqestManager({
      logger: this.#logger,
      account: this.#account,
      device: this.#device,
      session: this.#session,
      isPersonalisationActive: this._isPersonalisationActive
    })
    this.enablePersonalization = clevertap.enablePersonalization || false
    this.event = new EventHandler({
      logger: this.#logger,
      request: this.#request,
      isPersonalisationActive: this._isPersonalisationActive
    }, clevertap.event)

    this.profile = new ProfileHandler({
      logger: this.#logger,
      request: this.#request,
      account: this.#account,
      isPersonalisationActive: this._isPersonalisationActive
    }, clevertap.profile)

    this.onUserLogin = new UserLoginHandler({
      request: this.#request,
      account: this.#account,
      session: this.#session,
      logger: this.#logger,
      device: this.#device
    }, clevertap.onUserLogin)

    this.privacy = new Privacy({
      request: this.#request,
      account: this.#account
    }, clevertap.privacy)

    this.notification = new NotificationHandler({
      logger: this.#logger,
      session: this.#session,
      device: this.#device,
      request: this.#request,
      account: this.#account,
      clevertapInstance: this
    }, clevertap.notifications)

    this.#api = new CleverTapAPI({
      logger: this.#logger,
      request: this.#request,
      device: this.#device,
      session: this.#session
    })

    this.user = new User({
      isPersonalisationActive: this._isPersonalisationActive
    })

    this.session = {
      getTimeElapsed: () => {
        return this.#session.getTimeElapsed()
      },
      getPageCount: () => {
        return this.#session.getPageCount()
      }
    }

    this.logout = () => {
      this.#logger.debug('logout called')
      StorageManager.setInstantDeleteFlagInK()
    }

    this.clear = () => {
      this.onUserLogin.clear()
    }

    window.$CLTP_WR = window.$WZRK_WR = {
      ...this.#api,
      logout: this.logout,
      clear: this.clear,
      closeIframe: (campaignId, divIdIgnored) => {
        this.notification.closeIframe(campaignId, divIdIgnored)
      },
      enableWebPush: (enabled, applicationServerKey) => {
        this.notification.enableWebPush(enabled, applicationServerKey)
      }
    }

    if (clevertap.account?.[0].id) {
      // The accountId is present so can init with empty values.
      // Needed to maintain backward compatability with legacy implementations.
      // Npm imports/require will need to call init explictly with accountId
      this.init()
    }
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
    this.onUserLogin._processOldValues()
    this.privacy._processOldValues()
    this.event._processOldValues()
    this.profile._processOldValues()
    this.notification._processOldValues()
  }

  pageChanged () {
    const currLocation = window.location.href
    const urlParams = getURLParams(currLocation.toLowerCase())
    // -- update page count
    const obj = this.#session.getSessionCookieObject()
    let pgCount = (typeof obj.p === 'undefined') ? 0 : obj.p
    obj.p = ++pgCount
    this.#session.setSessionCookieObject(obj)
    // -- update page count

    let data = {}
    let referrerDomain = getDomain(document.referrer)

    if (window.location.hostname !== referrerDomain) {
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

    setTimeout(() => {
      if (pgCount <= 3) {
        // send ping for up to 3 pages
        this.#pingRequest()
      }

      if (this.#isPingContinuous()) {
        setInterval(() => {
          this.#pingRequest()
        }, CONTINUOUS_PING_FREQ_IN_MILLIS)
      }
    }, FIRST_PING_FREQ_IN_MILLIS)
  }

  #pingRequest () {
    let pageLoadUrl = this.#account.dataPostURL
    let data = {}
    data = this.#request.addSystemDataToObject(data, undefined)
    pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PING)
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data)))

    this.#request.saveAndFireRequest(pageLoadUrl, false)
  }

  #isPingContinuous () {
    return (typeof window.wzrk_d !== 'undefined' && window.wzrk_d.ping === 'continuous')
  }

  _isPersonalisationActive () {
    return StorageManager._isLocalStorageSupported() && this.enablePersonalization
  }

  #overrideDSyncFlag (data) {
    if (this._isPersonalisationActive()) {
      data.dsync = true
    }
  }
}
