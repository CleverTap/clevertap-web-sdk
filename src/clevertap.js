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
import RequestDispatcher from './util/requestDispatcher'
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
  EVT_PUSH,
  WZRK_FETCH,
  WEBINBOX_CONFIG,
  TIMER_FOR_NOTIF_BADGE_UPDATE,
  ACCOUNT_ID,
  APPLICATION_SERVER_KEY_RECEIVED,
  VARIABLES,
  GCOOKIE_NAME,
  QUALIFIED_CAMPAIGNS,
  BLOCK_REQUEST_COOKIE,
  ISOLATE_COOKIE,
  ENABLE_TV_CONTROLS,
  WZRK_GEO
} from './util/constants'
import { EMBED_ERROR } from './util/messages'
import { StorageManager, $ct, getMuteExpiry, isMuted } from './util/storage'
import { addToURL, getDomain, getURLParams } from './util/url'
import { getCampaignObjForLc, setEnum, handleEmailSubscription, closeIframe, dismissActiveCampaigns, _allCampaignDivMaps } from './util/clevertap'
import { compressData } from './util/encoder'
import Privacy from './modules/privacy'
import NotificationHandler from './modules/notification'
import { hasWebInboxSettingsInLS, checkAndRegisterWebInboxElements, initializeWebInbox, getInboxMessages, saveInboxMessages } from './modules/web-inbox/helper'
import { Variable } from './modules/variables/variable'
import VariableStore from './modules/variables/variableStore'
import { addAntiFlicker, handleActionMode, renderVisualBuilder } from './modules/visualBuilder/pageBuilder'
import { setServerKey } from './modules/webPushPrompt/prompt'
import encryption from './modules/security/Encryption'
import InstanceManager from './util/instanceManager'
import InstanceStorageManager from './util/instanceStorageManager'
import { Encryption } from './modules/security/Encryption'
import { checkCustomHtmlNativeDisplayPreview } from './util/campaignRender/nativeDisplay'
import { checkWebPopupPreview } from './util/campaignRender/webPopup'
import { reconstructNestedObject, validateCustomCleverTapID } from './util/helpers'
import TVNavigation from './modules/tvNavigation'

export default class CleverTap {
  static _instances = {}
  static defaultInstance = null
  static MAX_INSTANCES = 5

  static createInstance (config = {}) {
    const { accountId, region, targetDomain, token } = config
    if (!accountId) {
      throw new Error('CleverTap.createInstance: accountId is required')
    }
    if (CleverTap._instances[accountId]) {
      return CleverTap._instances[accountId]
    }
    if (Object.keys(CleverTap._instances).length >= CleverTap.MAX_INSTANCES) {
      Logger.getInstance().error('CleverTap: Maximum of ' + CleverTap.MAX_INSTANCES + ' instances allowed. Cannot create instance for ' + accountId)
      return null
    }
    const instance = new CleverTap({
      account: [{ id: accountId }],
      region,
      targetDomain,
      token
    })
    // Expose on window
    const safeId = accountId.replace(/[^a-zA-Z0-9_]/g, '_')
    window[`clevertap_${safeId}`] = instance
    return instance
  }

  #logger
  #api
  #onloadcalled
  #device
  #session
  #account
  #request
  #variableStore
  #isSpa
  #previousUrl
  #boundCheckPageChanged = this.#checkPageChanged.bind(this)
  #dismissSpamControl
  enablePersonalization
  #pageChangeTimeoutId
  #tvNavigation
  #enableFetchApi
  #enableEncryptionInTransit
  #domainSpecification
  #instanceManager

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
    this.#instanceManager.state.dismissSpamControl = dismissSpamControl
  }

  get enableFetchApi () {
    return this.#enableFetchApi
  }

  set enableFetchApi (value) {
    this.#enableFetchApi = value
    // propagate the setting to the instance manager so util layer can honour it
    this.#instanceManager.enableFetchApi = value
  }

  get enableEncryptionInTransit () {
    return this.#enableEncryptionInTransit
  }

  set enableEncryptionInTransit (value) {
    this.#enableEncryptionInTransit = value
    // propagate the setting to the instance manager so util layer can honour it
    this.#instanceManager.enableEncryptionInTransit = value
  }

  get domainSpecification () {
    return this.#domainSpecification
  }

  set domainSpecification (value) {
    if (value && isFinite(value)) {
      this.#domainSpecification = Number(value)
    } else {
      this.#domainSpecification = 0
    }
  }

  constructor (clevertap = {}) {
    this.#onloadcalled = 0
    this._isPersonalisationActive = this._isPersonalisationActive.bind(this)
    this.domainSpecification = clevertap.domainSpecification || null
    this.raiseNotificationClicked = () => { }
    this.#logger = new Logger(logLevels.INFO)
    this.#account = new Account(clevertap.account?.[0], clevertap.region || clevertap.account?.[1], clevertap.targetDomain || clevertap.account?.[2], clevertap.token || clevertap.account?.[3])

    // Determine if this is the default instance
    const isDefault = CleverTap.defaultInstance === null
    const accountId = clevertap.account?.[0]?.id || null

    // Create per-instance encryption
    const instanceEncryption = isDefault ? encryption : new Encryption()
    instanceEncryption.key = accountId

    // Create InstanceManager with all per-instance state
    this.#instanceManager = new InstanceManager(accountId, isDefault)
    this.#instanceManager.storage = new InstanceStorageManager(accountId, isDefault, instanceEncryption)
    this.#instanceManager.logger = this.#logger

    // For default instance, make the global $ct point to our state
    if (isDefault) {
      this.#instanceManager.state = $ct
    }

    // Register this instance's campaignDivMap for cross-instance popup closing
    _allCampaignDivMaps.push(this.#instanceManager.state.campaignDivMap)

    // Register instance
    if (accountId) {
      CleverTap._instances[accountId] = this
    }
    if (isDefault) {
      CleverTap.defaultInstance = this
    }

    // Custom Guid will be set here

    const result = validateCustomCleverTapID(clevertap?.config?.customId)
    if (!result.isValid && clevertap?.config?.customId) {
      this.#logger.error(result.error)
    }

    this.#device = new DeviceManager({
      logger: this.#logger,
      customId: result?.isValid ? result?.sanitizedId : null,
      domainSpecification: this.domainSpecification,
      storageManager: this.#instanceManager.storage
    })
    this.#dismissSpamControl = clevertap.dismissSpamControl ?? true
    this.shpfyProxyPath = clevertap.shpfyProxyPath || ''
    this.#enableFetchApi = clevertap.enableFetchApi || false
    this.#instanceManager.enableFetchApi = this.#enableFetchApi
    this.#enableEncryptionInTransit = clevertap.enableEncryptionInTransit || false
    this.#instanceManager.enableEncryptionInTransit = this.#enableEncryptionInTransit
    this.#session = new SessionManager({
      logger: this.#logger,
      isPersonalisationActive: this._isPersonalisationActive,
      domainSpecification: this.domainSpecification,
      storageManager: this.#instanceManager.storage
    })
    this.#request = new ReqestManager({
      logger: this.#logger,
      account: this.#account,
      device: this.#device,
      session: this.#session,
      isPersonalisationActive: this._isPersonalisationActive,
      instanceManager: this.#instanceManager
    })
    this.#tvNavigation = new TVNavigation(this.#logger)
    this.enablePersonalization = clevertap.enablePersonalization || false
    this.event = new EventHandler({
      logger: this.#logger,
      request: this.#request,
      isPersonalisationActive: this._isPersonalisationActive,
      instanceManager: this.#instanceManager
    }, clevertap.event)

    this.profile = new ProfileHandler({
      logger: this.#logger,
      request: this.#request,
      account: this.#account,
      isPersonalisationActive: this._isPersonalisationActive,
      instanceManager: this.#instanceManager
    }, clevertap.profile)

    this.onUserLogin = new UserLoginHandler({
      request: this.#request,
      account: this.#account,
      session: this.#session,
      logger: this.#logger,
      device: this.#device,
      instanceManager: this.#instanceManager
    }, clevertap.onUserLogin)

    this.privacy = new Privacy({
      request: this.#request,
      account: this.#account,
      logger: this.#logger,
      instanceManager: this.#instanceManager
    }, clevertap.privacy)

    this.notifications = new NotificationHandler({
      logger: this.#logger,
      request: this.#request,
      account: this.#account,
      instanceManager: this.#instanceManager
    }, clevertap.notifications)

    this.#variableStore = new VariableStore({
      logger: this.#logger,
      request: this.#request,
      account: this.#account,
      event: this.event,
      instanceManager: this.#instanceManager
    })
    // Set variableStore on instance state so campaign utils can access it
    this.#instanceManager.state.variableStore = this.#variableStore

    this.#api = new CleverTapAPI({
      logger: this.#logger,
      request: this.#request,
      device: this.#device,
      session: this.#session,
      domainSpecification: this.domainSpecification,
      instanceManager: this.#instanceManager
    })

    // Wire the API reference into the request dispatcher for response routing
    if (this.#request.dispatcher) {
      this.#request.dispatcher.api = this.#api
    }

    this.spa = clevertap.spa
    this.dismissSpamControl = clevertap.dismissSpamControl ?? true

    if (clevertap.config?.enableTVControls) {
      this.#instanceManager.storage.saveToLSorCookie(ENABLE_TV_CONTROLS, true)
    } else {
      this.#instanceManager.storage.saveToLSorCookie(ENABLE_TV_CONTROLS, false)
    }
    this.user = new User({
      isPersonalisationActive: this._isPersonalisationActive
    })

    instanceEncryption.logger = this.#logger

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
      this.#instanceManager.storage.setInstantDeleteFlagInK()
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
      this.#instanceManager.state.flutterVersion = { [libName]: libVersion }
    }

    // Set the Signed Call sdk version and fire request
    this.setSCSDKVersion = (ver) => {
      this.#account.scSDKVersion = ver
      const data = {}
      data.af = { scv: 'sc-sdk-v' + this.#account.scSDKVersion }
      let pageLoadUrl = this.#account.dataPostURL
      pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page')
      pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))
      this.#request.saveAndFireRequest(pageLoadUrl, this.#instanceManager.state.blockRequest)
    }

    if (hasWebInboxSettingsInLS()) {
      checkAndRegisterWebInboxElements()
      initializeWebInbox(this.#logger, this.#instanceManager)
    }

    // Get Inbox Message Count
    this.getInboxMessageCount = () => {
      const msgCount = getInboxMessages(this.#instanceManager)
      return Object.keys(msgCount).length
    }

    // Get Inbox Unread Message Count
    this.getInboxMessageUnreadCount = () => {
      try {
        const unreadMessages = this.getUnreadInboxMessages()
        const result = Object.keys(unreadMessages).length
        return result
      } catch (e) {
        this.#logger.error('Error in getInboxMessageUnreadCount' + e)
      }
    }

    // Get All Inbox messages
    this.getAllInboxMessages = () => {
      return getInboxMessages(this.#instanceManager)
    }

    // Get only Unread messages
    this.getUnreadInboxMessages = () => {
      try {
        const messages = getInboxMessages(this.#instanceManager)
        const result = {}

        if (Object.keys(messages).length > 0) {
          for (const message in messages) {
            if (messages[message].viewed === 0) {
              result[message] = messages[message]
            }
          }
        }
        return result
      } catch (e) {
        this.#logger.error('Error in getUnreadInboxMessages' + e)
      }
    }

    // Get message object belonging to the given message id only. Message id should be a String
    this.getInboxMessageForId = (messageId) => {
      const messages = getInboxMessages(this.#instanceManager)
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
      const messages = getInboxMessages(this.#instanceManager)
      if ((messageId !== null || messageId !== '') && messages.hasOwnProperty(messageId)) {
        if (messages[messageId].viewed === 0) {
          if (this.#instanceManager.state.inbox) {
            this.#instanceManager.state.inbox.unviewedCounter--
            delete this.#instanceManager.state.inbox.unviewedMessages[messageId]
          }
          const unViewedBadge = document.getElementById('unviewedBadge')
          if (unViewedBadge) {
            unViewedBadge.innerText = this.#instanceManager.state.inbox.unviewedCounter
            unViewedBadge.style.display = this.#instanceManager.state.inbox.unviewedCounter > 0 ? 'flex' : 'none'
          }
        }
        const ctInbox = document.querySelector('ct-web-inbox')
        if (ctInbox) {
          const el = ctInbox.shadowRoot.getElementById(messageId)
          el && el.remove()
        }
        delete messages[messageId]
        saveInboxMessages(messages, this.#instanceManager)
      } else {
        this.#logger.error('No message available for message Id ' + messageId)
      }
    }

    /* Mark Message as Read. Message id should be a String
     - Check if the message Id exist in the unread message list
     - Remove the unread marker, update the viewed flag, decrement the bage Count
     - renderNotificationViewed */
    this.markReadInboxMessage = (messageId) => {
      const messages = getInboxMessages(this.#instanceManager)
      if ((messageId !== null || messageId !== '') && messages.hasOwnProperty(messageId)) {
        if (messages[messageId].viewed === 1) {
          return this.#logger.error('Message already viewed' + messageId)
        }
        const ctInbox = document.querySelector('ct-web-inbox')
        if (ctInbox) {
          const el = ctInbox.shadowRoot.getElementById(messageId)
          if (el !== null) {
            el.shadowRoot.getElementById('unreadMarker').style.display = 'none'
          }
        }
        messages[messageId].viewed = 1
        const unViewedBadge = document.getElementById('unviewedBadge')
        if (unViewedBadge) {
          var counter = parseInt(unViewedBadge.innerText) - 1
          unViewedBadge.innerText = counter
          unViewedBadge.style.display = counter > 0 ? 'flex' : 'none'
        }
        this.renderNotificationViewed({ msgId: messages[messageId].wzrk_id, pivotId: messages[messageId].pivotId })
        if (this.#instanceManager.state.inbox) {
          this.#instanceManager.state.inbox.unviewedCounter--
          delete this.#instanceManager.state.inbox.unviewedMessages[messageId]
        }
        saveInboxMessages(messages, this.#instanceManager)
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
      const messages = getInboxMessages(this.#instanceManager)
      const unreadMsg = this.getUnreadInboxMessages()
      if (Object.keys(unreadMsg).length > 0) {
        const msgIds = Object.keys(unreadMsg)
        msgIds.forEach(key => {
          const ctInbox = document.querySelector('ct-web-inbox')
          if (ctInbox) {
            const el = ctInbox.shadowRoot.getElementById(key)
            if (el !== null) {
              el.shadowRoot.getElementById('unreadMarker').style.display = 'none'
            }
          }
          messages[key].viewed = 1
          this.renderNotificationViewed({ msgId: messages[key].wzrk_id, pivotId: messages[key].wzrk_pivot })
        })
        const unViewedBadge = document.getElementById('unviewedBadge')
        if (unViewedBadge) {
          unViewedBadge.innerText = 0
          unViewedBadge.style.display = 'none'
        }
        saveInboxMessages(messages, this.#instanceManager)
        this.#instanceManager.state.inbox.unviewedCounter = 0
        this.#instanceManager.state.inbox.unviewedMessages = {}
      } else {
        this.#logger.debug('All messages are already read')
      }
    }

    this.toggleInbox = (e) => this.#instanceManager.state.inbox?.toggleInbox(e)

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
        this.#logger.error('setMultiValuesForKey should be called with a value of type array')
      }
    }

    this.addMultiValueForKey = (key, value) => {
      if (typeof value === 'string' || typeof value === 'number') {
        this.profile._handleMultiValueAdd(key, value, COMMAND_ADD)
      } else {
        this.#logger.error('addMultiValueForKey should be called with a value of type string or number.')
      }
    }

    this.addMultiValuesForKey = (key, value) => {
      if (Array.isArray(value)) {
        this.profile._handleMultiValueAdd(key, value, COMMAND_ADD)
      } else {
        this.#logger.error('addMultiValuesForKey should be called with a value of type array.')
      }
    }

    this.removeMultiValueForKey = (key, value) => {
      if (typeof value === 'string' || typeof value === 'number') {
        this.profile._handleMultiValueRemove(key, value, COMMAND_REMOVE)
      } else {
        this.#logger.error('removeMultiValueForKey should be called with a value of type string or number.')
      }
    }

    this.removeMultiValuesForKey = (key, value) => {
      if (Array.isArray(value)) {
        this.profile._handleMultiValueRemove(key, value, COMMAND_REMOVE)
      } else {
        this.#logger.error('removeMultiValuesForKey should be called with a value of type array.')
      }
    }

    this.removeValueForKey = (key) => {
      this.profile._handleMultiValueDelete(key, COMMAND_DELETE)
    }

    this.enableLocalStorageEncryption = (value) => {
      instanceEncryption.enableLocalStorageEncryption = value
    }

    this.isLocalStorageEncryptionEnabled = () => {
      return instanceEncryption.enableLocalStorageEncryption
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
        this.#instanceManager.state.location = { Latitude: lat, Longitude: lng }
        this.#sendLocationData({ Latitude: lat, Longitude: lng })
      } else {
        if (navigator.geolocation) {
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
          if (isSafari) {
            try {
              if (localStorage.getItem(WZRK_GEO) !== null) {
                return
              }
            } catch (e) {}
          }
          navigator.geolocation.getCurrentPosition(showPosition.bind(this), showError)
        } else {
          console.log('Geolocation is not supported by this browser.')
        }
      }
    }

    function showPosition (position) {
      var lat = position.coords.latitude
      var lng = position.coords.longitude
      try { localStorage.setItem(WZRK_GEO, 'true') } catch (e) {}
      this.#instanceManager.state.location = { Latitude: lat, Longitude: lng }
      this.#sendLocationData({ Latitude: lat, Longitude: lng })
    }

    function showError (error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log('User denied the request for Geolocation.')
          try { localStorage.setItem(WZRK_GEO, 'false') } catch (e) {}
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
      closeIframe(campaignId, divIdIgnored, this.#session.sessionId, this.#instanceManager.state.campaignDivMap)
    }
    api.enableWebPush = (enabled, applicationServerKey) => {
      setServerKey(applicationServerKey)
      this.notifications._enableWebPush(enabled, applicationServerKey)
      try {
        this.#instanceManager.storage.saveToLSorCookie(APPLICATION_SERVER_KEY_RECEIVED, true)
      } catch (error) {
        this.#logger.error('Could not read value from local storage', error)
      }
    }
    api.tr = (msg) => {
      _tr(msg, {
        device: this.#device,
        session: this.#session,
        request: this.#request,
        logger: this.#logger,
        region: this.#account.region,
        instanceManager: this.#instanceManager,
        instance: this
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
      this.#instanceManager.state.unsubGroups = []
      const elements = document.getElementsByClassName('ct-unsub-group-input-item')

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        if (element.name) {
          const data = { name: element.name, isUnsubscribed: element.checked }
          this.#instanceManager.state.unsubGroups.push(data)
        }
      }

      _handleEmailSubscription(GROUP_SUBSCRIPTION_REQUEST_ID, reEncoded)
    }
    api.setSubscriptionGroups = (value) => {
      this.#instanceManager.state.unsubGroups = value
    }
    api.getSubscriptionGroups = () => {
      return this.#instanceManager.state.unsubGroups
    }
    api.changeSubscriptionGroups = (reEncoded, updatedGroups) => {
      api.setSubscriptionGroups(updatedGroups)
      _handleEmailSubscription(GROUP_SUBSCRIPTION_REQUEST_ID, reEncoded)
    }
    api.isGlobalUnsubscribe = () => {
      return this.#instanceManager.state.globalUnsubscribe
    }
    api.setIsGlobalUnsubscribe = (value) => {
      this.#instanceManager.state.globalUnsubscribe = value
    }
    api.setUpdatedCategoryLong = (profile) => {
      if (profile[categoryLongKey]) {
        this.#instanceManager.state.updatedCategoryLong = profile[categoryLongKey]
      }
    }
    // SDK Muting - for churned accounts (progressive muting)
    api.getMuteExpiry = () => {
      return getMuteExpiry()
    }
    api.isMuted = () => {
      return isMuted()
    }
    // Set up JSONP response routing
    // For the default instance, set the global callback directly.
    // For multi-instance, the dispatcher routes responses to the correct instance
    // based on a global request-number-to-api map.
    if (!window.$WZRK_WR) {
      // First instance -- create the dispatcher
      window.$WZRK_WR = {
        // Map of reqN -> api handler for routing JSONP responses
        _apiMap: {},
        _defaultApi: api,
        _lastHandler: null, // tracks which instance s() resolved to, for subsequent tr()/enableWebPush()
        s: function (...args) {
          const rn = args[3] // respNumber is 4th arg
          const handler = this._apiMap[rn] || this._defaultApi
          this._lastHandler = handler // remember for tr() and enableWebPush() in same response
          if (handler && handler.s) handler.s(...args)
          delete this._apiMap[rn]
        },
        tr: function (...args) {
          // Route to the same instance that s() resolved to in this response
          const handler = this._lastHandler || this._defaultApi
          if (handler && handler.tr) handler.tr(...args)
        },
        enableWebPush: function (...args) {
          const handler = this._lastHandler || this._defaultApi
          if (handler && handler.enableWebPush) handler.enableWebPush(...args)
        }
      }
      // Copy other api methods for backward compat
      const dispatcherProxy = window.$WZRK_WR
      Object.keys(api).forEach(key => {
        if (!dispatcherProxy.hasOwnProperty(key)) {
          dispatcherProxy[key] = typeof api[key] === 'function' ? api[key].bind(api) : api[key]
        }
      })
      window.$CLTP_WR = window.$WZRK_WR
    } else {
      // Additional instances register themselves
      // The api's response handler will be routed via _apiMap
    }
    // Store reference so request module can register request numbers
    this.#api._wzrkDispatcher = window.$WZRK_WR
    this.#api._selfApi = api

    if (clevertap.account?.[0].id) {
      // The accountId is present so can init with empty values.
      // Needed to maintain backward compatability with legacy implementations.
      // Npm imports/require will need to call init explictly with accountId
      this.#instanceManager.storage.saveToLSorCookie(ACCOUNT_ID, clevertap.account?.[0].id)
      this.init()
    }
  }

  createCustomIdIfValid (customId) {
    const result = validateCustomCleverTapID(customId)

    if (!result.isValid) {
      this.#logger.error(result.error)
    }

    /* Only add Custom Id if no existing id is present */
    if (this.#device.gcookie) {
      return
    }

    if (result.isValid) {
      this.#device.gcookie = result?.sanitizedId
      this.#instanceManager.storage.saveToLSorCookie(GCOOKIE_NAME, result?.sanitizedId)
      this.#logger.debug('CT Initialized with customId:: ' + result?.sanitizedId)
    } else {
      this.#logger.error('Invalid customId')
    }
  }

  init (accountId, region, targetDomain, token, config = {
    antiFlicker: {},
    customId: null,
    isolateSubdomain: false,
    enableTVControls: false,
    domainSpecification: null
  }) {
    if (config?.domainSpecification) {
      this.domainSpecification = config.domainSpecification
      this.#session.domainSpecification = config.domainSpecification
      this.#device.domainSpecification = config.domainSpecification
      this.#api.domainSpecification = config.domainSpecification
    }
    if (config?.antiFlicker && Object.keys(config?.antiFlicker).length > 0) {
      addAntiFlicker(config.antiFlicker)
    }

    if (config?.isolateSubdomain) {
      this.#instanceManager.storage.saveToLSorCookie(ISOLATE_COOKIE, true)
    }

    if (this.#onloadcalled === 1) {
      // already initailsed
      return
    }

    // Clear EIT fallback flag on new session (init)
    if (this.#request.dispatcher) {
      this.#request.dispatcher.clearEITFallback()
    }

    if (accountId) {
      this.#instanceManager.storage.encryption.key = accountId
    }

    const enableControls = this.#instanceManager.storage.readFromLSorCookie(ENABLE_TV_CONTROLS) ?? false
    if ((config?.enableTVControls) || enableControls) {
      // CleverTap handles navigation
      this.#instanceManager.storage.saveToLSorCookie(ENABLE_TV_CONTROLS, true)
      this.#logger.debug('CleverTap TV Navigation Mode: CleverTap will handle all navigation')
      // Initialize CleverTap TV navigation system
      this.#tvNavigation.init()
    }

    this.#instanceManager.storage.removeCookie('WZRK_P', window.location.hostname)
    if (!this.#account.id) {
      if (!accountId) {
        this.#logger.error(EMBED_ERROR)
        return
      }
      this.#account.id = accountId
      this.#instanceManager.storage.saveToLSorCookie(ACCOUNT_ID, accountId)
      this.#logger.debug('CT Initialized with Account ID: ' + this.#account.id)
    }
    handleActionMode(this.#logger, this.#account.id)
    checkCustomHtmlNativeDisplayPreview(this.#logger)
    checkWebPopupPreview()
    this.#session.cookieName = SCOOKIE_PREFIX + '_' + this.#account.id
    if (region) {
      this.#account.region = region
    }
    if (targetDomain) {
      this.#account.targetDomain = targetDomain
    }
    if (token) {
      this.#account.token = token
    }
    if (config?.customId) {
      this.createCustomIdIfValid(config.customId)
    }

    if (config.enableFetchApi) {
      this.#enableFetchApi = config.enableFetchApi
      this.#instanceManager.enableFetchApi = config.enableFetchApi
    }

    if (config.enableEncryptionInTransit) {
      this.#enableEncryptionInTransit = config.enableEncryptionInTransit
      this.#instanceManager.enableEncryptionInTransit = config.enableEncryptionInTransit
    }

    // Only process OUL backup events if BLOCK_REQUEST_COOKIE is set
    // This ensures user identity is established before other events
    if (this.#instanceManager.storage.readFromLSorCookie(BLOCK_REQUEST_COOKIE) === true) {
      this.#logger.debug('Processing OUL backup events first to establish user identity')
      this.#request.processBackupEvents(true)
    }
    const currLocation = location.href
    const urlParams = getURLParams(currLocation.toLowerCase())

    // eslint-disable-next-line eqeqeq
    if (typeof urlParams.e !== 'undefined' && urlParams.wzrk_ex == '0') {
      return
    }

    this.#instanceManager.state.isPrivacyArrPushed = true
    if (this.#instanceManager.state.privacyArray.length > 0) {
      this.privacy.push(this.#instanceManager.state.privacyArray)
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

      /* Listen for the Back and Forward buttons */
      window.addEventListener('popstate', this.#boundCheckPageChanged)
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

  #debounce (func, delay = 50) {
    let timeout
    return function () {
      clearTimeout(timeout)
      timeout = setTimeout(func, delay)
    }
  }

  #checkPageChanged () {
    const debouncedPageChanged = this.#debounce(() => {
      if (this.#previousUrl !== location.href) {
        this.pageChanged()
      }
    })
    debouncedPageChanged()
  }

  #updateUnviewedBadgePosition () {
    try {
      if (this.#pageChangeTimeoutId) {
        clearTimeout(this.#pageChangeTimeoutId)
      }

      const unViewedBadge = document.getElementById('unviewedBadge')
      if (!unViewedBadge) {
        this.#logger.debug('unViewedBadge not found')
        return
      }

      /* Reset to None */
      unViewedBadge.style.display = 'none'

      /* Set Timeout to let the page load and then update the position and display the badge */
      this.#pageChangeTimeoutId = setTimeout(() => {
        const config = this.#instanceManager.storage.readFromLSorCookie(WEBINBOX_CONFIG) || {}
        const inboxNode = document.getElementById(config?.inboxSelector)
        /* Creating a Local Variable to avoid reference to stale DOM Node */
        const unViewedBadge = document.getElementById('unviewedBadge')

        if (!unViewedBadge) {
          this.#logger.debug('unViewedBadge not found')
          return
        }

        if (inboxNode) {
          const { top, right } = inboxNode.getBoundingClientRect()
          if (Number(unViewedBadge.innerText) > 0 || unViewedBadge.innerText === '9+') {
            unViewedBadge.style.display = 'flex'
          }
          unViewedBadge.style.top = `${top - 8}px`
          unViewedBadge.style.left = `${right - 8}px`
        }
      }, TIMER_FOR_NOTIF_BADGE_UPDATE)
    } catch (error) {
      this.#logger.debug('Error updating unviewed badge position:', error)
    }
  }

  pageChanged () {
    const currLocation = window.location.href
    if (
      this.#isSpa &&
      this.#previousUrl !== undefined &&
      this.#previousUrl !== currLocation
    ) {
      dismissActiveCampaigns()
    }
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
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))

    this.#request.saveAndFireRequest(pageLoadUrl, this.#instanceManager.state.blockRequest)

    if (parseInt(data.pg) === 1) {
      this.event.push(WZRK_FETCH, { t: 4 })
    }

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

    this.#updateUnviewedBadgePosition()
    this._handleVisualEditorPreview()
  }

  _handleVisualEditorPreview () {
    if (this.#instanceManager.state.intervalArray.length) {
      this.#instanceManager.state.intervalArray.forEach(interval => {
        if (typeof interval === 'string' && interval.startsWith('addNewEl-')) {
          clearInterval(parseInt(interval.split('-')[1], 10))
        } else {
          clearInterval(interval)
        }
      })
    }
    this.#instanceManager.state.intervalArray = []
    const storedData = sessionStorage.getItem('visualEditorData')
    const targetJson = storedData ? JSON.parse(storedData) : null
    if (targetJson) {
      renderVisualBuilder(targetJson, true, this.#logger)
    }
  }

  #pingRequest () {
    let pageLoadUrl = this.#account.dataPostURL
    let data = {}
    data = this.#request.addSystemDataToObject(data, undefined)
    pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PING)
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))

    this.#request.saveAndFireRequest(pageLoadUrl, this.#instanceManager.state.blockRequest)
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
  #sendLocationData (payload) {
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
    if (this.#instanceManager.state.location) {
      data.af = { ...data.af, ...this.#instanceManager.state.location }
    }
    data = this.#request.addSystemDataToObject(data, true)
    this.#request.addFlags(data)
    const compressedData = compressData(JSON.stringify(data), this.#logger)
    let pageLoadUrl = this.#account.dataPostURL
    pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

    this.#request.saveAndFireRequest(pageLoadUrl, this.#instanceManager.state.blockRequest)
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
    // Check if the offline state is changing from true to false
    // If offline is being disabled (arg is false), process any cached events
    if (this.#instanceManager.state.offline !== arg && !arg) {
      this.#request.processBackupEvents()
    }
    this.#instanceManager.state.offline = arg
  }

  delayEvents (arg) {
    if (typeof arg !== 'boolean') {
      console.error('delayEvents should be called with a value of type boolean')
      return
    }
    this.#instanceManager.state.delayEvents = arg
  }

  getSDKVersion () {
    return 'web-sdk-v$$PACKAGE_VERSION$$'
  }

  defineVariable (name, defaultValue) {
    return Variable.define(name, defaultValue, this.#variableStore, this.#logger)
  }

  defineFileVariable (name) {
    return Variable.defineFileVar(name, this.#variableStore, this.#logger)
  }

  syncVariables (onSyncSuccess, onSyncFailure) {
    if (this.#logger.logLevel === 4) {
      return this.#variableStore.syncVariables(onSyncSuccess, onSyncFailure)
    } else {
      const m = 'App log level is not set to 4'
      this.#logger.error(m)
      return Promise.reject(new Error(m))
    }
  }

  fetchVariables (onFetchCallback) {
    this.#variableStore.fetchVariables(onFetchCallback)
  }

  getVariables () {
    return reconstructNestedObject(
      this.#instanceManager.storage.readFromLSorCookie(VARIABLES)
    )
  }

  getVariableValue (variableName) {
    const variables = this.#instanceManager.storage.readFromLSorCookie(VARIABLES)
    const reconstructedVariables = reconstructNestedObject(variables)
    if (variables.hasOwnProperty(variableName)) {
      return variables[variableName]
    } else if (reconstructedVariables.hasOwnProperty(variableName)) {
      return reconstructedVariables[variableName]
    }
  }

  addVariablesChangedCallback (callback) {
    this.#variableStore.addVariablesChangedCallback(callback)
  }

  addOneTimeVariablesChangedCallback (callback) {
    this.#variableStore.addOneTimeVariablesChangedCallback(callback)
  }

  getVariants () {
    return this.#variableStore.getVariants()
  }

  /*
     This function is used for debugging and getting the details of all the campaigns
     that were qualified and rendered for the current user
  */
  getAllQualifiedCampaignDetails () {
    try {
      const existingCampaign = this.#instanceManager.storage.readFromLSorCookie(QUALIFIED_CAMPAIGNS) && JSON.parse(decodeURIComponent(this.#instanceManager.storage.readFromLSorCookie(QUALIFIED_CAMPAIGNS)))
      return existingCampaign
    } catch (e) {
      return null
    }
  }
}
