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

/** Inner HTML for `#ct-pip-play svg` when video is playing (`msgContent.html` only ships play). Path uses viewBox 0 0 48 48. */
export const PIP_PAUSE_ICON_SVG =
  '<path d="M21 14C21.5523 14 22 14.4477 22 15V33C22 33.5523 21.5523 34 21 34H19C18.4477 34 18 33.5523 18 33V15C18 14.4477 18.4477 14 19 14H21ZM29 14C29.5523 14 30 14.4477 30 15V33C30 33.5523 29.5523 34 29 34H27C26.4477 34 26 33.5523 26 33V15C26 14.4477 26.4477 14 27 14H29Z" fill="currentColor"></path>'

/** Inner HTML for `#ct-pip-expand svg` when PIP is fullscreen (collapse control). Path uses viewBox 0 0 48 48. */
export const PIP_COLLAPSE_ICON_SVG =
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M25.5273 27.5285C25.5274 26.4241 26.4229 25.5285 27.5273 25.5285L32.5263 25.5285C33.0786 25.5285 33.5263 25.9763 33.5263 26.5285C33.5262 27.0807 33.0785 27.5285 32.5263 27.5285L28.9375 27.5285L34.1748 32.7658C34.5652 33.1563 34.5652 33.7894 34.1748 34.1799C33.7843 34.5702 33.1512 34.5703 32.7607 34.1799L27.5273 28.9465L27.5273 32.5275C27.5272 33.0797 27.0796 33.5275 26.5273 33.5275C25.9751 33.5275 25.5274 33.0797 25.5273 32.5275L25.5273 27.5285ZM13.8252 15.2346C13.4349 14.8441 13.4349 14.211 13.8252 13.8205C14.2157 13.4302 14.8488 13.4302 15.2392 13.8205L20.4726 19.0539L20.4726 15.4728C20.4728 14.9207 20.9204 14.4729 21.4726 14.4728C22.0248 14.4728 22.4725 14.9207 22.4726 15.4728L22.4726 20.4719C22.4724 21.5761 21.577 22.4719 20.4726 22.4719L15.4736 22.4719C14.9215 22.4718 14.4739 22.0239 14.4736 21.4719C14.4738 20.9198 14.9215 20.4719 15.4736 20.4719L19.0625 20.4719L13.8252 15.2346Z" fill="currentColor"></path>'

/** Inner HTML for `#ct-pip-mute svg` when video is muted (unmute action). Path uses viewBox 0 0 48 48; mute glyph comes from `msgContent.html`. */
export const PIP_UNMUTE_ICON_SVG =
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M24.7349 14.1514C25.2641 13.7718 26.0013 14.1496 26.0015 14.8008V33.1973C26.0015 33.8487 25.2642 34.2273 24.7349 33.8477L16.7905 28.1504C16.6547 28.0531 16.4918 28.0011 16.3247 28.001H14.061C13.6194 28.0009 13.2615 27.6427 13.2612 27.2012V20.8008C13.2612 20.359 13.6193 20.0011 14.061 20.001H16.3208C16.4879 20.0009 16.6508 19.948 16.7866 19.8506L24.7349 14.1514ZM28.8325 16.5371C29.0285 16.066 29.5723 15.839 30.021 16.082C31.3075 16.7788 32.4094 17.7808 33.2261 19.0059C34.2142 20.4882 34.7407 22.2303 34.7388 24.0117C34.7369 25.7932 34.2067 27.5345 33.2153 29.0147C32.3961 30.2378 31.2922 31.2377 30.0044 31.9317C29.5552 32.1737 29.0119 31.9451 28.8169 31.4736C28.6221 31.002 28.8498 30.4659 29.2925 30.2119C30.2453 29.6655 31.0634 28.9048 31.6792 27.9854C32.467 26.809 32.8886 25.4256 32.8901 24.0098C32.8917 22.5939 32.4734 21.2094 31.688 20.0313C31.0742 19.1105 30.2577 18.3483 29.3062 17.7998C28.864 17.545 28.6367 17.0084 28.8325 16.5371ZM27.7212 19.377C27.9319 18.8703 28.5198 18.6238 28.9849 18.9151C29.7019 19.364 30.319 19.9618 30.7925 20.6719C31.4507 21.6593 31.8016 22.8202 31.8003 24.0068C31.799 25.1934 31.4459 26.3529 30.7856 27.3389C30.3106 28.0482 29.6914 28.6452 28.9731 29.0928C28.5075 29.3826 27.921 29.1348 27.7114 28.6279C27.5019 28.1206 27.7543 27.5482 28.1948 27.2207C28.5601 26.9491 28.8783 26.6156 29.1343 26.2334C29.5758 25.5741 29.8121 24.7984 29.813 24.0049C29.8138 23.2113 29.5793 22.4347 29.1392 21.7744C28.8841 21.3919 28.5662 21.0585 28.2017 20.7861C27.7619 20.4577 27.5106 19.8838 27.7212 19.377Z" fill="currentColor"></path>'

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
