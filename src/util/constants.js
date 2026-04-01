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

/** Inner HTML for `#ct-pip-play svg` when video is playing (`msgContent.html` only ships play). */
export const PIP_PAUSE_ICON_SVG =
  '<path d="M8.5 5C8.77614 5 9 5.22386 9 5.5V14.5C9 14.7761 8.77614 15 8.5 15H7.5C7.22386 15 7 14.7761 7 14.5V5.5C7 5.22386 7.22386 5 7.5 5H8.5ZM12.5 5C12.7761 5 13 5.22386 13 5.5V14.5C13 14.7761 12.7761 15 12.5 15H11.5C11.2239 15 11 14.7761 11 14.5V5.5C11 5.22386 11.2239 5 11.5 5H12.5Z" fill="currentColor"></path>'

/** Inner HTML for `#ct-pip-expand svg` when PIP is fullscreen (collapse control). */
export const PIP_COLLAPSE_ICON_SVG =
  '<path d="M7.60059 12.0098C7.82855 12.0563 8 12.2583 8 12.5V14.5C8 14.7761 7.77614 15 7.5 15C7.22386 15 7 14.7761 7 14.5V13H5.5C5.22386 13 5 12.7761 5 12.5C5 12.2239 5.22386 12 5.5 12H7.5C7.53443 12 7.56811 12.0031 7.60059 12.0098ZM14.5 12C14.7761 12 15 12.2239 15 12.5C15 12.7761 14.7761 13 14.5 13H13V14.5C13 14.7761 12.7761 15 12.5 15C12.2239 15 12 14.7761 12 14.5V12.5C12 12.4656 12.0031 12.4319 12.0098 12.3994C12.0497 12.2039 12.2039 12.0497 12.3994 12.0098C12.4319 12.0031 12.4656 12 12.5 12H14.5ZM7.5 5C7.77614 5 8 5.22386 8 5.5V7.5C8 7.53443 7.99686 7.56811 7.99023 7.60059C7.95034 7.79608 7.79608 7.95034 7.60059 7.99023C7.56811 7.99686 7.53443 8 7.5 8H5.5C5.22386 8 5 7.77614 5 7.5C5 7.22386 5.22386 7 5.5 7H7V5.5C7 5.22386 7.22386 5 7.5 5ZM12.5 5C12.7761 5 13 5.22386 13 5.5V7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H12.5C12.4656 8 12.4319 7.99686 12.3994 7.99023C12.2039 7.95034 12.0497 7.79608 12.0098 7.60059C12.0031 7.56811 12 7.53443 12 7.5V5.5C12 5.22386 12.2239 5 12.5 5Z" fill="currentColor"></path>'

/** Inner HTML for `#ct-pip-mute svg` when video is muted (unmute action). Mute glyph comes from `msgContent.html`. */
export const PIP_UNMUTE_ICON_SVG =
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M10.3677 5.07572C10.6322 4.88602 11.0012 5.0745 11.0015 5.39994V14.5982C11.0015 14.9239 10.6323 15.1132 10.3677 14.9234L6.39502 12.0738C6.32711 12.0251 6.24518 11.9996 6.16162 11.9995H5.03076C4.80989 11.9995 4.63037 11.82 4.63037 11.5992V8.39896C4.63053 8.17821 4.80999 7.9996 5.03076 7.99955H6.16162C6.24518 7.99951 6.32711 7.97305 6.39502 7.92435L10.3677 5.07572ZM12.4165 6.2681C12.5143 6.0326 12.7859 5.91844 13.0103 6.03959C13.6534 6.3879 14.2045 6.88914 14.6128 7.5015C15.1068 8.24257 15.3705 9.1138 15.3696 10.0044C15.3687 10.8952 15.1036 11.7663 14.6079 12.5064C14.1983 13.1179 13.6463 13.6174 13.0024 13.9644C12.7779 14.0854 12.5062 13.9715 12.4087 13.7359C12.3113 13.5 12.4256 13.232 12.647 13.105C13.1233 12.8318 13.5325 12.4514 13.8403 11.9917C14.2342 11.4035 14.445 10.7114 14.4458 10.0035C14.4465 9.29559 14.2369 8.60319 13.8442 8.0142C13.5375 7.55405 13.1293 7.17315 12.6538 6.89896C12.4328 6.77161 12.3189 6.50366 12.4165 6.2681ZM11.8608 7.68802C11.9662 7.43473 12.2601 7.31195 12.4927 7.45756C12.8512 7.68208 13.1603 7.98042 13.397 8.33549C13.7261 8.82919 13.9015 9.41011 13.9009 10.0035C13.9002 10.5966 13.7232 11.1766 13.3931 11.6695C13.1556 12.024 12.8458 12.3217 12.4868 12.5454C12.2539 12.6906 11.9607 12.5667 11.856 12.313C11.7514 12.0595 11.8772 11.7736 12.0972 11.6099C12.2798 11.4741 12.4389 11.3069 12.5669 11.1158C12.7877 10.7861 12.9063 10.3983 12.9067 10.0015C12.9071 9.60496 12.7897 9.21723 12.5698 8.88724C12.4422 8.69583 12.2835 8.52833 12.1011 8.39213C11.8812 8.22791 11.7555 7.94146 11.8608 7.68802Z" fill="currentColor"></path>'

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
