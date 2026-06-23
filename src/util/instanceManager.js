import { BLOCK_REQUEST_COOKIE } from './constants'

export default class InstanceManager {
  constructor (id, isDefault = false) {
    this.id = id
    this.isDefault = isDefault

    // Per-instance state (replaces global $ct)
    this.state = {
      globalCache: { gcookie: null, REQ_N: 0, RESP_N: 0 },
      LRU_CACHE: null,
      globalProfileMap: undefined,
      globalEventsMap: undefined,
      blockRequest: false,
      isOptInRequest: false,
      broadDomain: null,
      webPushEnabled: null,
      campaignDivMap: {},
      currentSessionId: null,
      wiz_counter: 0,
      notifApi: { notifEnabledFromApi: false },
      unsubGroups: [],
      updatedCategoryLong: null,
      inbox: null,
      isPrivacyArrPushed: false,
      privacyArray: [],
      offline: false,
      location: null,
      dismissSpamControl: true,
      globalUnsubscribe: true,
      flutterVersion: null,
      variableStore: {},
      pushConfig: null,
      delayEvents: false,
      intervalArray: [],
      enableTVNavigation: false
    }

    // Replaces window.isOULInProgress and window.oulReqN
    this.isOULInProgress = false
    this.oulReqN = 0

    // Replaces RequestDispatcher static settings
    this.enableFetchApi = false
    this.enableEncryptionInTransit = false

    // Set by CleverTap constructor after creation
    this.storage = null // InstanceStorageManager
    this.logger = null // Logger
  }
}
