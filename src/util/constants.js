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
export const ENCRYPTION_KEY = 'WZRK_E'
export const SCOOKIE_EXP_TIME_IN_SECS = 60 * 20 // 20 mins
export const EV_COOKIE = 'WZRK_EV'
export const META_COOKIE = 'WZRK_META'
export const PR_COOKIE = 'WZRK_PR'
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
export const VAPID_MIGRATION_PROMPT_SHOWN = 'vapid_migration_prompt_shown'
export const NOTIF_LAST_TIME = 'notif_last_time'

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
