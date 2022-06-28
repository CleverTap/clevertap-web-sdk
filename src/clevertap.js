import Account from './modules/account'
import CleverTapAPI from './modules/api'
import DeviceManager from './modules/device'
import EventHandler from './modules/event'
import ProfileHandler from './modules/profile'
import UserLoginHandler from './modules/userLogin'
import _tr from './util/tr'
import User from './modules/user'
import { Logger, logLevels } from './modules/logger'
import SessionManager from './modules/session'
import ReqestManager from './modules/request'
import {
  CAMP_COOKIE_NAME,
  SCOOKIE_PREFIX,
  NOTIFICATION_VIEWED,
  NOTIFICATION_CLICKED,
  EVT_PING,
  FIRST_PING_FREQ_IN_MILLIS,
  CONTINUOUS_PING_FREQ_IN_MILLIS,
  GROUP_SUBSCRIPTION_REQUEST_ID,
  WZRK_ID,
  WZRK_PREFIX,
  categoryLongKey
} from './util/constants'
import { EMBED_ERROR } from './util/messages'
import { StorageManager, $ct } from './util/storage'
import { addToURL, getDomain, getURLParams } from './util/url'
import { getCampaignObjForLc, setEnum, handleEmailSubscription, closeIframe } from './util/clevertap'
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
  #isSpa
  #previousUrl
  #boundCheckPageChanged = this.#checkPageChanged.bind(this)
  enablePersonalization

  get spa () {
    return this.#isSpa
  }

  set spa (value) {
    const isSpa = value === true
    if (this.#isSpa !== isSpa && this.#onloadcalled === 1) {
      // if clevertap.spa is changed after init has been called then update the click listeners
      if (isSpa) {
        document.addEventListener('click', this.#boundCheckPageChanged)
      } else {
        document.removeEventListener('click', this.#boundCheckPageChanged)
      }
    }
    this.#isSpa = isSpa
  }

  constructor (clevertap = {}) {
    this.#onloadcalled = 0
    this._isPersonalisationActive = this._isPersonalisationActive.bind(this)
    this.raiseNotificationClicked = () => {}
    this.#logger = new Logger(logLevels.INFO)
    this.#account = new Account(clevertap.account?.[0], clevertap.region || clevertap.account?.[1], clevertap.targetDomain || clevertap.account?.[2])
    this.#device = new DeviceManager({ logger: this.#logger })
    this.#session = new SessionManager({
      logger: this.#logger,
      isPersonalisationActive: this._isPersonalisationActive
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
      account: this.#account,
      logger: this.#logger
    }, clevertap.privacy)

    this.notifications = new NotificationHandler({
      logger: this.#logger,
      request: this.#request,
      account: this.#account
    }, clevertap.notifications)

    this.#api = new CleverTapAPI({
      logger: this.#logger,
      request: this.#request,
      device: this.#device,
      session: this.#session
    })

    this.spa = clevertap.spa

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

    this.getCleverTapID = () => {
      return this.#device.getGuid()
    }

    this.getAccountID = () => {
      return this.#account.id
    }

    this.getDCDomain = () => {
      return this.#account.finalTargetDomain
    }

    // Set the Direct Call sdk version and fire request
    this.setDCSDKVersion = (ver) => {
      this.#account.dcSDKVersion = ver
      const data = {}
      data.af = { dcv: 'dc-sdk-v' + this.#account.dcSDKVersion }
      let pageLoadUrl = this.#account.dataPostURL
      pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page')
      pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))

      this.#request.saveAndFireRequest(pageLoadUrl, false)
    }
    // method for notification viewed
    this.renderNotificationViewed = (detail) => {
      processNotificationEvent(NOTIFICATION_VIEWED, detail)
    }

    // method for notification clicked
    this.renderNotificationClicked = (detail) => {
      processNotificationEvent(NOTIFICATION_CLICKED, detail)
    }

    const processNotificationEvent = (eventName, eventDetail) => {
      if (!eventDetail || !eventDetail.msgId) { return }
      const data = {}
      data.type = 'event'
      data.evtName = eventName
      data.evtData = { [WZRK_ID]: eventDetail.msgId }

      if (eventDetail.pivotId) {
        data.evtData = { ...data.evtData, wzrk_pivot: eventDetail.pivotId }
      }

      if (eventDetail.kv && eventDetail.kv !== null && eventDetail.kv !== undefined) {
        for (const key in eventDetail.kv) {
          if (key.startsWith(WZRK_PREFIX)) {
            data.evtData = { ...data.evtData, [key]: eventDetail.kv[key] }
          }
        }
      }
      this.#request.processEvent(data)
    }

    this.setLogLevel = (l) => {
      this.#logger.logLevel = Number(l)
    }

    const _handleEmailSubscription = (subscription, reEncoded, fetchGroups) => {
      handleEmailSubscription(subscription, reEncoded, fetchGroups, this.#account, this.#logger)
    }

    const api = this.#api
    api.logout = this.logout
    api.clear = this.clear
    api.closeIframe = (campaignId, divIdIgnored) => {
      closeIframe(campaignId, divIdIgnored, this.#session.sessionId)
    }
    api.enableWebPush = (enabled, applicationServerKey) => {
      this.notifications._enableWebPush(enabled, applicationServerKey)
    }
    api.tr = (msg) => {
      _tr(msg, {
        device: this.#device,
        session: this.#session,
        request: this.#request,
        logger: this.#logger
      })
    }
    api.setEnum = (enumVal) => {
      setEnum(enumVal, this.#logger)
    }
    api.is_onloadcalled = () => {
      return (this.#onloadcalled === 1)
    }
    api.subEmail = (reEncoded) => {
      _handleEmailSubscription('1', reEncoded)
    }
    api.getEmail = (reEncoded, withGroups) => {
      _handleEmailSubscription('-1', reEncoded, withGroups)
    }
    api.unSubEmail = (reEncoded) => {
      _handleEmailSubscription('0', reEncoded)
    }
    api.unsubEmailGroups = (reEncoded) => {
      $ct.unsubGroups = []
      const elements = document.getElementsByClassName('ct-unsub-group-input-item')

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        if (element.name) {
          const data = { name: element.name, isUnsubscribed: element.checked }
          $ct.unsubGroups.push(data)
        }
      }

      _handleEmailSubscription(GROUP_SUBSCRIPTION_REQUEST_ID, reEncoded)
    }
    api.setSubscriptionGroups = (value) => {
      $ct.unsubGroups = value
    }
    api.getSubscriptionGroups = () => {
      return $ct.unsubGroups
    }
    api.changeSubscriptionGroups = (reEncoded, updatedGroups) => {
      api.setSubscriptionGroups(updatedGroups)
      _handleEmailSubscription(GROUP_SUBSCRIPTION_REQUEST_ID, reEncoded)
    }
    api.setUpdatedCategoryLong = (profile) => {
      if (profile[categoryLongKey]) {
        $ct.updatedCategoryLong = profile[categoryLongKey]
      }
    }
    window.$CLTP_WR = window.$WZRK_WR = api

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

    if (this.#isSpa) {
      // listen to click on the document and check if URL has changed.
      document.addEventListener('click', this.#boundCheckPageChanged)
    } else {
      // remove existing click listeners if any
      document.removeEventListener('click', this.#boundCheckPageChanged)
    }
    this.#onloadcalled = 1
  }

  #processOldValues () {
    this.onUserLogin._processOldValues()
    this.privacy._processOldValues()
    this.event._processOldValues()
    this.profile._processOldValues()
    this.notifications._processOldValues()
  }

  #checkPageChanged () {
    if (this.#previousUrl !== location.href) {
      this.pageChanged()
    }
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
    data.af = { lib: 'web-sdk-v$$PACKAGE_VERSION$$' }
    pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page')
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))

    this.#request.saveAndFireRequest(pageLoadUrl, false)

    this.#previousUrl = currLocation
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
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))

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

  popupCallbacks = {};
  popupCurrentWzrkId = '';

  // eslint-disable-next-line accessor-pairs
  set popupCallback (callback) {
    this.popupCallbacks[this.popupCurrentWzrkId] = callback
  }
}
