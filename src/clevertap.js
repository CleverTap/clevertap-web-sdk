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
  categoryLongKey,
  COMMAND_INCREMENT,
  COMMAND_DECREMENT,
  COMMAND_SET,
  COMMAND_ADD,
  COMMAND_REMOVE,
  COMMAND_DELETE,
  EVT_PUSH
} from './util/constants'
import { EMBED_ERROR } from './util/messages'
import { StorageManager, $ct } from './util/storage'
import { addToURL, getDomain, getURLParams } from './util/url'
import { getCampaignObjForLc, setEnum, handleEmailSubscription, closeIframe } from './util/clevertap'
import { compressData } from './util/encoder'
import Privacy from './modules/privacy'
import NotificationHandler from './modules/notification'
import { hasWebInboxSettingsInLS, checkAndRegisterWebInboxElements, initializeWebInbox, getInboxMessages, saveInboxMessages } from './modules/web-inbox/helper'

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
  #dismissSpamControl
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

  get dismissSpamControl () {
    return this.#dismissSpamControl
  }

  set dismissSpamControl (value) {
    const dismissSpamControl = value === true
    this.#dismissSpamControl = dismissSpamControl
    $ct.dismissSpamControl = dismissSpamControl
  }

  constructor (clevertap = {}) {
    this.#onloadcalled = 0
    this._isPersonalisationActive = this._isPersonalisationActive.bind(this)
    this.raiseNotificationClicked = () => { }
    this.#logger = new Logger(logLevels.INFO)
    this.#account = new Account(clevertap.account?.[0], clevertap.region || clevertap.account?.[1], clevertap.targetDomain || clevertap.account?.[2])
    this.#device = new DeviceManager({ logger: this.#logger })
    this.#dismissSpamControl = clevertap.dismissSpamControl || false
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
    this.dismissSpamControl = clevertap.dismissSpamControl

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

    this.getSCDomain = () => {
      return this.#account.finalTargetDomain
    }

    this.setLibrary = (libName, libVersion) => {
      $ct.flutterVersion = { [libName]: libVersion }
    }

    // Set the Signed Call sdk version and fire request
    this.setSCSDKVersion = (ver) => {
      this.#account.scSDKVersion = ver
      const data = {}
      data.af = { scv: 'sc-sdk-v' + this.#account.scSDKVersion }
      let pageLoadUrl = this.#account.dataPostURL
      pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page')
      pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))
      this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
    }

    if (hasWebInboxSettingsInLS()) {
      checkAndRegisterWebInboxElements()
      initializeWebInbox(this.#logger)
    }

    // Get Inbox Message Count
    this.getInboxMessageCount = () => {
      const msgCount = getInboxMessages()
      return Object.keys(msgCount).length
    }

    // Get Inbox Unread Message Count
    this.getInboxMessageUnreadCount = () => {
      if ($ct.inbox) {
        return $ct.inbox.unviewedCounter
      } else {
        this.#logger.debug('No unread messages')
      }
    }

    // Get All Inbox messages
    this.getAllInboxMessages = () => {
      return getInboxMessages()
    }

    // Get only Unread messages
    this.getUnreadInboxMessages = () => {
      if ($ct.inbox) {
        return $ct.inbox.unviewedMessages
      } else {
        this.#logger.debug('No unread messages')
      }
    }

    // Get message object belonging to the given message id only. Message id should be a String
    this.getInboxMessageForId = (messageId) => {
      const messages = getInboxMessages()
      if ((messageId !== null || messageId !== '') && messages.hasOwnProperty(messageId)) {
        return messages[messageId]
      } else {
        this.#logger.error('No message available for message Id ' + messageId)
      }
    }

    // Delete message from the Inbox. Message id should be a String
    // If the message to be deleted is unviewed then decrement the badge count, delete the message from unviewedMessages list
    // Then remove the message from local storage and update cookie
    this.deleteInboxMessage = (messageId) => {
      const messages = getInboxMessages()
      if ((messageId !== null || messageId !== '') && messages.hasOwnProperty(messageId)) {
        const el = document.querySelector('ct-web-inbox').shadowRoot.getElementById(messageId)
        if (messages[messageId].viewed === 0) {
          $ct.inbox.unviewedCounter--
          delete $ct.inbox.unviewedMessages[messageId]
          document.getElementById('unviewedBadge').innerText = $ct.inbox.unviewedCounter
          document.getElementById('unviewedBadge').style.display = $ct.inbox.unviewedCounter > 0 ? 'flex' : 'none'
        }
        el && el.remove()
        delete messages[messageId]
        saveInboxMessages(messages)
      } else {
        this.#logger.error('No message available for message Id ' + messageId)
      }
    }

    /* Mark Message as Read. Message id should be a String
     - Check if the message Id exist in the unread message list
     - Remove the unread marker, update the viewed flag, decrement the bage Count
     - renderNotificationViewed */
    this.markReadInboxMessage = (messageId) => {
      const unreadMsg = $ct.inbox.unviewedMessages
      const messages = getInboxMessages()
      if ((messageId !== null || messageId !== '') && unreadMsg.hasOwnProperty(messageId)) {
        const el = document.querySelector('ct-web-inbox').shadowRoot.getElementById(messageId)
        if (el !== null) { el.shadowRoot.getElementById('unreadMarker').style.display = 'none' }
        messages[messageId].viewed = 1
        if (document.getElementById('unviewedBadge')) {
          var counter = parseInt(document.getElementById('unviewedBadge').innerText) - 1
          document.getElementById('unviewedBadge').innerText = counter
          document.getElementById('unviewedBadge').style.display = counter > 0 ? 'flex' : 'none'
        }
        window.clevertap.renderNotificationViewed({ msgId: messages[messageId].wzrk_id, pivotId: messages[messageId].pivotId })
        $ct.inbox.unviewedCounter--
        delete $ct.inbox.unviewedMessages[messageId]
        saveInboxMessages(messages)
      } else {
        this.#logger.error('No message available for message Id ' + messageId)
      }
    }

    /* Mark Message as Read. messageIds should be a an array of string */
    this.markReadInboxMessagesForIds = (messageIds) => {
      if (Array.isArray(messageIds)) {
        for (var id = 0; id < messageIds.length; id++) {
          this.markReadInboxMessage(messageIds[id])
        }
      }
    }

    /* Mark all messages as read
      - Get the count of unread messages, update unread marker style
      - renderNotificationViewed, update the badge count and style
    */
    this.markReadAllInboxMessage = () => {
      const unreadMsg = $ct.inbox.unviewedMessages
      const messages = getInboxMessages()
      if (Object.keys(unreadMsg).length > 0) {
        const msgIds = Object.keys(unreadMsg)
        msgIds.forEach(key => {
          const el = document.querySelector('ct-web-inbox').shadowRoot.getElementById(key)
          if (el !== null) { el.shadowRoot.getElementById('unreadMarker').style.display = 'none' }
          messages[key].viewed = 1
          window.clevertap.renderNotificationViewed({ msgId: messages[key].wzrk_id, pivotId: messages[key].wzrk_pivot })
        })
        document.getElementById('unviewedBadge').innerText = 0
        document.getElementById('unviewedBadge').style.display = 'none'
        saveInboxMessages(messages)
        $ct.inbox.unviewedCounter = 0
        $ct.inbox.unviewedMessages = {}
      } else {
        this.#logger.debug('All messages are already read')
      }
    }

    this.toggleInbox = (e) => $ct.inbox?.toggleInbox(e)

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

      if (eventDetail.wzrk_slideNo) {
        data.evtData = { ...data.evtData, wzrk_slideNo: eventDetail.wzrk_slideNo }
      }

      // Adding kv pair to event data
      if (eventDetail.kv && eventDetail.kv !== null && eventDetail.kv !== undefined) {
        for (const key in eventDetail.kv) {
          if (key.startsWith(WZRK_PREFIX)) {
            data.evtData = { ...data.evtData, [key]: eventDetail.kv[key] }
          }
        }
      }

      // Adding msgCTkv to event data
      if (eventDetail.msgCTkv && eventDetail.msgCTkv !== null && eventDetail.msgCTkv !== undefined) {
        for (const key in eventDetail.msgCTkv) {
          if (key.startsWith(WZRK_PREFIX)) {
            data.evtData = { ...data.evtData, [key]: eventDetail.msgCTkv[key] }
          }
        }
      }
      this.#request.processEvent(data)
    }

    this.setLogLevel = (l) => {
      this.#logger.logLevel = Number(l)
      if (l === 3) {
        sessionStorage.WZRK_D = ''
      } else {
        delete sessionStorage.WZRK_D
      }
    }
    /**
 * @param {} key
 * @param {*} value
 */
    this.handleIncrementValue = (key, value) => {
      this.profile._handleIncrementDecrementValue(key, value, COMMAND_INCREMENT)
    }

    this.handleDecrementValue = (key, value) => {
      this.profile._handleIncrementDecrementValue(key, value, COMMAND_DECREMENT)
    }

    this.setMultiValuesForKey = (key, value) => {
      if (Array.isArray(value)) {
        this.profile._handleMultiValueSet(key, value, COMMAND_SET)
      } else {
        console.error('setMultiValuesForKey should be called with a value of type array')
      }
    }

    this.addMultiValueForKey = (key, value) => {
      if (typeof value === 'string' || typeof value === 'number') {
        this.profile._handleMultiValueAdd(key, value, COMMAND_ADD)
      } else {
        console.error('addMultiValueForKey should be called with a value of type string or number.')
      }
    }

    this.addMultiValuesForKey = (key, value) => {
      if (Array.isArray(value)) {
        this.profile._handleMultiValueAdd(key, value, COMMAND_ADD)
      } else {
        console.error('addMultiValuesForKey should be called with a value of type array.')
      }
    }

    this.removeMultiValueForKey = (key, value) => {
      if (typeof value === 'string' || typeof value === 'number') {
        this.profile._handleMultiValueRemove(key, value, COMMAND_REMOVE)
      } else {
        console.error('removeMultiValueForKey should be called with a value of type string or number.')
      }
    }

    this.removeMultiValuesForKey = (key, value) => {
      if (Array.isArray(value)) {
        this.profile._handleMultiValueRemove(key, value, COMMAND_REMOVE)
      } else {
        console.error('removeMultiValuesForKey should be called with a value of type array.')
      }
    }

    this.removeValueForKey = (key) => {
      this.profile._handleMultiValueDelete(key, COMMAND_DELETE)
    }

    const _handleEmailSubscription = (subscription, reEncoded, fetchGroups) => {
      handleEmailSubscription(subscription, reEncoded, fetchGroups, this.#account, this.#logger)
    }

    /**
     *
     * @param {number} lat
     * @param {number} lng
     * @param {callback function} handleCoordinates
     * @returns
    */
    this.getLocation = function (lat, lng) {
      // latitude and longitude should be number type
      if ((lat && typeof lat !== 'number') || (lng && typeof lng !== 'number')) {
        console.log('Latitude and Longitude must be of number type')
        return
      }
      if (lat && lng) {
        // valid latitude ranges bw +-90
        if (lat <= -90 || lat > 90) {
          console.log('A vaid latitude must range between -90 and 90')
          return
        }
        // valid longitude ranges bw +-180
        if (lng <= -180 || lng > 180) {
          console.log('A valid longitude must range between -180 and 180')
          return
        }
        $ct.location = { Latitude: lat, Longitude: lng }
        this.sendLocationData({ Latitude: lat, Longitude: lng })
      } else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition.bind(this), showError)
        } else {
          console.log('Geolocation is not supported by this browser.')
        }
      }
    }

    function showPosition (position) {
      var lat = position.coords.latitude
      var lng = position.coords.longitude
      $ct.location = { Latitude: lat, Longitude: lng }
      this.sendLocationData({ Latitude: lat, Longitude: lng })
    }

    function showError (error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log('User denied the request for Geolocation.')
          break
        case error.POSITION_UNAVAILABLE:
          console.log('Location information is unavailable.')
          break
        case error.TIMEOUT:
          console.log('The request to get user location timed out.')
          break
        case error.UNKNOWN_ERROR:
          console.log('An unknown error occurred.')
          break
      }
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
    api.isGlobalUnsubscribe = () => {
      return $ct.globalUnsubscribe
    }
    api.setIsGlobalUnsubscribe = (value) => {
      $ct.globalUnsubscribe = value
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

  // starts here
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

    $ct.isPrivacyArrPushed = true
    if ($ct.privacyArray.length > 0) {
      this.privacy.push($ct.privacyArray)
    }

    this.#processOldValues()
    this.pageChanged()
    const backupInterval = setInterval(() => {
      if (this.#device.gcookie) {
        clearInterval(backupInterval)
        this.#request.processBackupEvents()
      }
    }, 3000)
    if (this.#isSpa) {
      // listen to click on the document and check if URL has changed.
      document.addEventListener('click', this.#boundCheckPageChanged)
    } else {
      // remove existing click listeners if any
      document.removeEventListener('click', this.#boundCheckPageChanged)
    }
    this.#onloadcalled = 1
  }

  // process the option array provided to the clevertap object
  // after its been initialized
  #processOldValues () {
    this.onUserLogin._processOldValues()
    this.privacy._processOldValues()
    this.event._processOldValues()
    this.profile._processOldValues()
    this.notifications._processOldValues()
  }

  debounce (func, delay) {
    let timeout
    return function () {
      clearTimeout(timeout)
      timeout = setTimeout(func, delay)
    }
  }

  #checkPageChanged () {
    const debouncedPageChanged = this.debounce(() => {
      if (this.#previousUrl !== location.href) {
        this.pageChanged()
      }
    }, 300)
    debouncedPageChanged()
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
    let proto = document.location.protocol
    proto = proto.replace(':', '')
    data.af = { lib: 'web-sdk-v$$PACKAGE_VERSION$$', protocol: proto, ...$ct.flutterVersion }
    pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page')
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))

    this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)

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

    this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
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

  /**
   *
   * @param {object} payload
   */
  sendLocationData (payload) {
    // Send the updated value to LC
    let data = {}
    data.af = {}
    const profileObj = {}
    data.type = 'profile'
    if (profileObj.tz == null) {
      profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]
    }
    data.profile = profileObj
    if (payload) {
      const keys = Object.keys(payload)
      keys.forEach(key => {
        data.af[key] = payload[key]
      })
    }
    if ($ct.location) {
      data.af = { ...data.af, ...$ct.location }
    }
    data = this.#request.addSystemDataToProfileObject(data, undefined)
    this.#request.addFlags(data)
    const compressedData = compressData(JSON.stringify(data), this.#logger)
    let pageLoadUrl = this.#account.dataPostURL
    pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

    this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
  }

  // offline mode
  /**
   * events will be recorded and queued locally when passed with true
   * but will not be sent to the server until offline is disabled by passing false
   * @param {boolean} arg
   */

  setOffline (arg) {
    if (typeof arg !== 'boolean') {
      console.error('setOffline should be called with a value of type boolean')
      return
    }
    $ct.offline = arg
    // if offline is disabled
    // process events from cache
    if (!arg) {
      this.#request.processBackupEvents()
    }
  }
}
