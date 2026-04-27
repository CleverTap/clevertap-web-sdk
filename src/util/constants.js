export const unsupportedKeyCharRegex = new RegExp('^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$', 'g')
export const unsupportedValueCharRegex = new RegExp("^\\s+|\'|\"|\\\\|\\s+$", 'g')
export const doubleQuoteRegex = new RegExp('\"', 'g')
export const singleQuoteRegex = new RegExp('\'', 'g')
export const CLEAR = 'clear'
export const CHARGED_ID = 'Charged ID'
export const CHARGEDID_COOKIE_NAME = 'WZRK_CHARGED_ID'
export const GCOOKIE_NAME = 'WZRK_G'
export const KCOOKIE_NAME = 'WZRK_K'
export const CAMP_COOKIE_NAME = 'WZRK_CAMP'
export const CAMP_COOKIE_G = 'WZRK_CAMP_G'// cookie for storing campaign details against guid
export const SCOOKIE_PREFIX = 'WZRK_S'
export const SCOOKIE_EXP_TIME_IN_SECS = 60 * 20 // 20 mins
export const EV_COOKIE = 'WZRK_EV'
export const META_COOKIE = 'WZRK_META'
export const PR_COOKIE = 'WZRK_PR'
export const ACCOUNT_ID = 'WZRK_ACCOUNT_ID'
export const ARP_COOKIE = 'WZRK_ARP'
export const LCOOKIE_NAME = 'WZRK_L'
export const NOTIF_COOKIE_NAME = 'WZRK_N'
export const GLOBAL = 'global' // used for email unsubscribe also
export const TOTAL_COUNT = 'tc'
export const DISPLAY = 'display'
export const UNDEFINED = 'undefined'
export const WEBPUSH_LS_KEY = 'WZRK_WPR'
export const OPTOUT_KEY = 'optOut'
export const CT_OPTOUT_KEY = 'ct_optout'
export const OPTOUT_COOKIE_ENDSWITH = ':OO'
export const USEIP_KEY = 'useIP'
export const LRU_CACHE = 'WZRK_X'
export const LRU_CACHE_SIZE = 100
export const IS_OUL = 'isOUL'
export const EVT_PUSH = 'push'
export const EVT_PING = 'ping'
export const COOKIE_EXPIRY = 86400 * 365 // 1 Year in seconds
export const MAX_TRIES = 200 // API tries
export const FIRST_PING_FREQ_IN_MILLIS = 2 * 60 * 1000 // 2 mins
export const CONTINUOUS_PING_FREQ_IN_MILLIS = 5 * 60 * 1000 // 5 mins
export const GROUP_SUBSCRIPTION_REQUEST_ID = '2'
export const categoryLongKey = 'cUsY'
export const WZRK_PREFIX = 'wzrk_'
export const WZRK_ID = 'wzrk_id'
export const NOTIFICATION_VIEWED = 'Notification Viewed'
export const NOTIFICATION_CLICKED = 'Notification Clicked'
export const FIRE_PUSH_UNREGISTERED = 'WZRK_FPU'
export const PUSH_SUBSCRIPTION_DATA = 'WZRK_PSD' // PUSH SUBSCRIPTION DATA FOR REGISTER/UNREGISTER TOKEN
export const COMMAND_INCREMENT = '$incr'
export const COMMAND_DECREMENT = '$decr'
export const COMMAND_SET = '$set'
export const COMMAND_ADD = '$add'
export const COMMAND_REMOVE = '$remove'
export const COMMAND_DELETE = '$delete'
export const WEBINBOX_CONFIG = 'WZRK_INBOX_CONFIG'
export const WEBINBOX = 'WZRK_INBOX'
export const MAX_INBOX_MSG = 15
export const VARIABLES = 'WZRK_PE'
export const PUSH_DELAY_MS = 1000
export const MAX_DELAY_FREQUENCY = 1000 * 60 * 10
export const WZRK_FETCH = 'wzrk_fetch'
export const WEBPUSH_CONFIG = 'WZRK_PUSH_CONFIG'
export const APPLICATION_SERVER_KEY_RECEIVED = 'WZRK_APPLICATION_SERVER_KEY_RECIEVED'
export const WEBPUSH_CONFIG_RECEIVED = 'WZRK_WEB_PUSH_CONFIG_RECEIVED'
export const NOTIFICATION_PUSH_METHOD_DEFERRED = 'WZRK_NOTIFICATION_PUSH_DEFERRED'
export const VAPID_MIGRATION_PROMPT_SHOWN = 'vapid_migration_prompt_shown'
export const NOTIF_LAST_TIME = 'notif_last_time'
export const TIMER_FOR_NOTIF_BADGE_UPDATE = 300
export const OLD_SOFT_PROMPT_SELCTOR_ID = 'wzrk_wrapper'
export const NEW_SOFT_PROMPT_SELCTOR_ID = 'pnWrapper'
export const POPUP_LOADING = 'WZRK_POPUP_LOADING'
export const CUSTOM_HTML_PREVIEW = 'ctCustomHtmlPreview'
export const WEB_POPUP_PREVIEW = 'ctWebPopupPreview'
export const QUALIFIED_CAMPAIGNS = 'WZRK_QC'
export const CUSTOM_CT_ID_PREFIX = '_w_'
export const BLOCK_REQUEST_COOKIE = 'WZRK_BLOCK'
export const ENABLE_TV_CONTROLS = 'WZRK_TV_CONTROLS'
export const ENCRYPTION_KEY_NAME = 'WZRK_ENCRYPTION_KEY'

// Flag key for optional sub-domain profile isolation
export const ISOLATE_COOKIE = 'WZRK_ISOLATE_SD'

// SDK Muting - Progressive muting for churned customers
export const MUTE_EXPIRY_KEY = 'WZRK_MUTE_EXPIRY'
// Flag key for Encryption in Transit JSONP fallback (session-level)
export const CT_EIT_FALLBACK = 'CT_EIT_FALLBACK'

// Geolocation prompt cache key
export const WZRK_GEO = 'WZRK_GEO'

export const WEB_NATIVE_TEMPLATES = {
  KV_PAIR: 1,
  BANNER: 2,
  CAROUSEL: 3,
  VISUAL_BUILDER: 4,
  CUSTOM_HTML: 5,
  JSON: 6
}

export const WEB_NATIVE_DISPLAY_VISUAL_EDITOR_TYPES = {
  HTML: 'html',
  FORM: 'form',
  JSON: 'json'
}

export const WEB_POPUP_TEMPLATES = {
  BOX: 0,
  INTERSTITIAL: 1,
  BANNER: 2,
  IMAGE_ONLY: 3,
  ADVANCED_BUILDER: 4,
  PIP: 5
}

/** Host container id for `layout === WEB_POPUP_TEMPLATES.PIP` (see `renderPIP`). */
export const WEB_POPUP_PIP_HOST_ID = 'wizPIPDiv'

/** Inner HTML for `#ct-pip-play svg` when video is playing (`msgContent.html` only ships play). Path uses viewBox 0 0 48 48. */
export const PIP_PAUSE_ICON_SVG =
  '<path d="M21 14C21.5523 14 22 14.4477 22 15V33C22 33.5523 21.5523 34 21 34H19C18.4477 34 18 33.5523 18 33V15C18 14.4477 18.4477 14 19 14H21ZM29 14C29.5523 14 30 14.4477 30 15V33C30 33.5523 29.5523 34 29 34H27C26.4477 34 26 33.5523 26 33V15C26 14.4477 26.4477 14 27 14H29Z" fill="currentColor"></path>'

/** Inner HTML for `#ct-pip-expand svg` when PIP is fullscreen (collapse control). Path uses viewBox 0 0 48 48. */
export const PIP_COLLAPSE_ICON_SVG =
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M25.5273 27.5285C25.5274 26.4241 26.4229 25.5285 27.5273 25.5285L32.5263 25.5285C33.0786 25.5285 33.5263 25.9763 33.5263 26.5285C33.5262 27.0807 33.0785 27.5285 32.5263 27.5285L28.9375 27.5285L34.1748 32.7658C34.5652 33.1563 34.5652 33.7894 34.1748 34.1799C33.7843 34.5702 33.1512 34.5703 32.7607 34.1799L27.5273 28.9465L27.5273 32.5275C27.5272 33.0797 27.0796 33.5275 26.5273 33.5275C25.9751 33.5275 25.5274 33.0797 25.5273 32.5275L25.5273 27.5285ZM13.8252 15.2346C13.4349 14.8441 13.4349 14.211 13.8252 13.8205C14.2157 13.4302 14.8488 13.4302 15.2392 13.8205L20.4726 19.0539L20.4726 15.4728C20.4728 14.9207 20.9204 14.4729 21.4726 14.4728C22.0248 14.4728 22.4725 14.9207 22.4726 15.4728L22.4726 20.4719C22.4724 21.5761 21.577 22.4719 20.4726 22.4719L15.4736 22.4719C14.9215 22.4718 14.4739 22.0239 14.4736 21.4719C14.4738 20.9198 14.9215 20.4719 15.4736 20.4719L19.0625 20.4719L13.8252 15.2346Z" fill="currentColor"></path>'

/** Parent `svg` viewBox when showing {@link PIP_UNMUTE_ICON_SVG}. */
export const PIP_UNMUTE_ICON_VIEWBOX = '0 0 22 20'

/** Inner HTML for `#ct-pip-mute svg` when video is muted (unmute). Path uses viewBox 0 0 22 20; set parent svg viewBox to match. */
export const PIP_UNMUTE_ICON_SVG =
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M11.4736 0.151381C12.0029 -0.228166 12.7401 0.149558 12.7402 0.800795V19.1973C12.7402 19.8487 12.003 20.2273 11.4736 19.8477L3.5293 14.1504C3.3935 14.0531 3.23055 14.0011 3.06348 14.001H0.799805C0.358219 14.0009 0.000247366 13.6427 0 13.2012V6.8008C0 6.35903 0.358067 6.0011 0.799805 6.00099H3.05957C3.22669 6.00092 3.38957 5.94799 3.52539 5.8506L11.4736 0.151381ZM15.5713 2.53712C15.7672 2.06604 16.3111 1.83904 16.7598 2.08205C18.0462 2.77883 19.1482 3.78081 19.9648 5.00587C20.953 6.48816 21.4794 8.23028 21.4775 10.0117C21.4756 11.7932 20.9454 13.5345 19.9541 15.0147C19.1349 16.2378 18.031 17.2377 16.7432 17.9317C16.294 18.1737 15.7506 17.9451 15.5557 17.4736C15.3609 17.002 15.5886 16.4659 16.0312 16.2119C16.984 15.6655 17.8022 14.9048 18.418 13.9854C19.2058 12.809 19.6274 11.4256 19.6289 10.0098C19.6304 8.59387 19.2121 7.2094 18.4268 6.03126C17.813 5.11051 16.9965 4.34829 16.0449 3.79982C15.6027 3.54496 15.3755 3.00844 15.5713 2.53712ZM14.46 5.37697C14.6707 4.87034 15.2585 4.62383 15.7236 4.91505C16.4406 5.36404 17.0578 5.96181 17.5312 6.67189C18.1895 7.65929 18.5403 8.82016 18.5391 10.0068C18.5378 11.1934 18.1847 12.3529 17.5244 13.3389C17.0493 14.0482 16.4301 14.6452 15.7119 15.0928C15.2463 15.3826 14.6598 15.1348 14.4502 14.6279C14.2407 14.1206 14.4931 13.5482 14.9336 13.2207C15.2988 12.9491 15.6171 12.6156 15.873 12.2334C16.3146 11.5741 16.5509 10.7984 16.5518 10.0049C16.5526 9.21133 16.3181 8.43472 15.8779 7.77443C15.6229 7.39185 15.3049 7.05845 14.9404 6.78615C14.5007 6.45771 14.2494 5.88384 14.46 5.37697Z" fill="white"></path>'

export const CAMPAIGN_TYPES = {
  EXIT_INTENT: 1, /* Deprecated */
  WEB_NATIVE_DISPLAY: 2,
  FOOTER_NOTIFICATION: 0, /* Web Popup */
  FOOTER_NOTIFICATION_2: null /* Web Popup */
}

export const CUSTOM_EVENTS_CAMPAIGN_SOURCES = {
  KV_PAIR: 'KV_Pair',
  JSON: 'JSON',
  VISUAL_BUILDER: 'Visual_Builder',
  ADVANCED_BUILDER: 'advanced-web-popup-builder'
}

export const SYSTEM_EVENTS = [
  'Stayed',
  'UTM Visited',
  'App Launched',
  'Notification Sent',
  NOTIFICATION_VIEWED,
  NOTIFICATION_CLICKED
]

export const KEYS_TO_ENCRYPT = [
  KCOOKIE_NAME,
  LRU_CACHE,
  PR_COOKIE
]

export const DELIVERY_PREFERENCE_KEYS = {
  EXCLUDE_FROM_FREQUENCY_CAP: 'efc',
  ADVANCE_DELIVERY_PREFERENEC: 'adp',
  WEB_POPUP: {
    SESSION_COUNT: 'wsc',
    FREQUENCY_COUNT: 'wfc',
    OCCURENCE_COUNT: 'woc',
    wtq: 'wtq',
    GLOBAL_SESSION_LIMIT: 'wmc',
    LEGACY: {
      ONCE_PER_SESSION: 'mdc',
      ONCE_PER_DAY: 'tdc'
    }
  },
  WEB_NATIVE_DISPLAY: {
    SESSION_COUNT: 'wndsc',
    FREQUENCY_COUNT: 'wndfc',
    OCCURENCE_COUNT: 'wndoc',
    wndtq: 'wndtq'
  }
}

export const ACTION_TYPES = {
  OPEN_LINK: 'url',
  OPEN_LINK_AND_CLOSE: 'urlCloseNotification',
  CLOSE: 'close',
  OPEN_WEB_URL: 'open-web-url',
  SOFT_PROMPT: 'soft-prompt',
  RUN_JS: 'js'
}

// Nested object errors
export const NESTED_OBJECT_ERRORS = {
  DEPTH_LIMIT_EXCEEDED: {
    code: 541,
    message: 'Event data exceeded maximum nesting depth. Depth: %s, Limit: %s'
  },
  ARRAY_KEY_COUNT_LIMIT_EXCEEDED: {
    code: 542,
    message: 'Event data exceeded maximum array key count. Count: %s, Limit: %s'
  },
  OBJECT_KEY_COUNT_LIMIT_EXCEEDED: {
    code: 543,
    message: 'Event data exceeded maximum object key count. Count: %s, Limit: %s'
  },
  ARRAY_LENGTH_LIMIT_EXCEEDED: {
    code: 543,
    message: 'Event data exceeded maximum array length. Length: %s, Limit: %s'
  },
  KV_PAIR_COUNT_LIMIT_EXCEEDED: {
    code: 544,
    message: 'Event data exceeded maximum key-value pair count. Count: %s, Limit: %s'
  },
  NULL_VALUE_REMOVED: {
    code: 545,
    message: "Null value for key '%s' was removed"
  },
  EMPTY_VALUE_REMOVED: {
    code: 545,
    message: "Empty value for key '%s' was removed"
  },
  RESTRICTED_PROFILE_PROPERTY: {
    code: 513,
    message: "'%s' is a restricted profile property and cannot have nested values (objects or arrays). This property was skipped."
  }
}

// Restricted profile keys that cannot be at root level (0th level)
export const PROFILE_RESTRICTED_ROOT_KEYS = [
  'Name',
  'Email',
  'Education',
  'Married',
  'DOB',
  'Gender',
  'Phone',
  'Age',
  'FBID',
  'GPID',
  'Birthday',
  'Identity'
]
