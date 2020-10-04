  // CHARGEDID_COOKIE_NAME: 'WZRK_CHARGED_ID',
  // ECOOKIE_PREFIX: 'CT_E',
  // GCOOKIE_NAME: 'CT_G',
  // KCOOKIE_NAME: 'CT_K',
  // PCOOKIE_PREFIX: 'CT_P',
  // SEQCOOKIE_PREFIX: 'CT_SEQ',
  // SCOOKIE_PREFIX: 'CT_S',
  // EV_COOKIE: 'CT_EV',
  // PR_COOKIE: 'CT_PR',
  // ARP_COOKIE: 'CT_ARP',
  // UNDEFINED: 'undefined',
  // PING_FREQ_IN_MILLIS: (2 * 60 * 1000), // 2 mins
  // EVENT_TYPES: {
  //   EVENT: 'event',
  //   PROFILE: 'profile',
  //   PAGE: 'page',
  //   PING: 'ping',
  // },
  // IDENTITY_TYPES: {
  //   IDENTITY: 'Identity',
  //   EMAIL: 'Email',
  //   FBID: 'FBID',
  //   GPID: 'GPID',
  // },
export const unsupportedKeyCharRegex = new RegExp('^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$', 'g')
export const doubleQuoteRegex = new RegExp('\"', 'g')
export const singleQuoteRegex = new RegExp('\'', 'g')
export const CLEAR = 'clear'
export const CHARGED_ID = 'Charged ID'
export const CHARGEDID_COOKIE_NAME = 'WZRK_CHARGED_ID'
export const GCOOKIE_NAME = 'WZRK_G'
export const KCOOKIE_NAME = 'WZRK_K'
export const CAMP_COOKIE_NAME = 'WZRK_CAMP'
export const SCOOKIE_PREFIX = 'WZRK_S'
export const EV_COOKIE = 'WZRK_EV'
export const META_COOKIE = 'WZRK_META'
export const PR_COOKIE = 'WZRK_PR'
export const ARP_COOKIE = 'WZRK_ARP'
export const LCOOKIE_NAME = 'WZRK_L'
export const NOTIF_COOKIE_NAME = 'WZRK_N'
export const GLOBAL = 'global'
export const TOTAL_COUNT = 'tc'
export const DISPLAY = 'display'
export const UNDEFINED = 'undefined'
export const WEBPUSH_LS_KEY = 'WZRK_WPR'
export const OPTOUT_KEY = 'optOut'
export const CT_OPTOUT_KEY = 'ct_optout'
export const OPTOUT_COOKIE_ENDSWITH = ' =OO'
export const USEIP_KEY = 'useIP'
export const LRU_CACHE = 'WZRK_X'
export const IS_OUL = 'isOUL'
export const COOKIE_EXPIRY = 86400 * 365 * 10 // 10 Years in seconds
export const MAX_TRIES = 50 // API tries
