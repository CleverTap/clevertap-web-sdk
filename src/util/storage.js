import ShopifyStorageManager from './ShopifyStorageManager'
import ModeManager from '../modules/mode'
import {
  GCOOKIE_NAME,
  META_COOKIE,
  KCOOKIE_NAME,
  LCOOKIE_NAME
} from './constants'
import { getHostName } from './url'

export class StorageManager extends ShopifyStorageManager {
  static save (key, value) {
    if (!key || !value) {
      return false
    }
    if (this._isLocalStorageSupported()) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      return true
    }
  }

  static read (key) {
    if (!key) {
      return false
    }
    let data = null
    if (this._isLocalStorageSupported()) {
      data = localStorage.getItem(key)
    }
    if (data != null) {
      try {
        data = JSON.parse(data)
      } catch (e) {}
    }
    return data
  }

  static remove (key) {
    if (!key) {
      return false
    }
    if (this._isLocalStorageSupported()) {
      localStorage.removeItem(key)
      return true
    }
  }

  static removeCookie (name, domain) {
    let cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

    if (domain) {
      cookieStr = cookieStr + ' domain=' + domain + '; path=/'
    }

    document.cookie = cookieStr
  }

  static createCookie (name, value, seconds, domain) {
    let expires = ''
    let domainStr = ''
    if (seconds) {
      const date = new Date()
      date.setTime(date.getTime() + (seconds * 1000))

      expires = '; expires=' + date.toGMTString()
    }

    if (domain) {
      domainStr = '; domain=' + domain
    }

    value = encodeURIComponent(value)

    document.cookie = name + '=' + value + expires + domainStr + '; path=/'
  }

  static readCookie (name) {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let idx = 0; idx < ca.length; idx++) {
      let c = ca[idx]
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length)
      }
      // eslint-disable-next-line eqeqeq
      if (c.indexOf(nameEQ) == 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length))
      }
    }
    return null
  }

  static _isLocalStorageSupported () {
    if (ModeManager.mode === 'SHOPIFY') return true
    return 'localStorage' in window && window.localStorage !== null && typeof window.localStorage.setItem === 'function'
  }

  static async saveToLSorCookie (property, value) {
    if (value == null) {
      return
    }
    try {
      if (this._isLocalStorageSupported()) {
        await this.addData('localStorage', property, encodeURIComponent(JSON.stringify(value)))
      } else {
        if (property === GCOOKIE_NAME) {
          await this.retrieveData('cookie', property, encodeURIComponent(value), 0, getHostName())
        } else {
          await this.retrieveData('cookie', property, encodeURIComponent(JSON.stringify(value)), 0, getHostName())
        }
      }
      $ct.globalCache[property] = value
    } catch (e) {}
  }

  static async readFromLSorCookie (property) {
    let data
    if ($ct.globalCache.hasOwnProperty(property)) {
      return $ct.globalCache[property]
    }
    if (this._isLocalStorageSupported()) {
      data = await this.retrieveData('localStorage', property)
    } else {
      data = await this.retrieveData('cookie', property)
    }

    if (data !== null && data !== undefined && !(typeof data.trim === 'function' && data.trim() === '')) {
      let value
      try {
        value = JSON.parse(decodeURIComponent(data))
      } catch (err) {
        value = decodeURIComponent(data)
      }
      $ct.globalCache[property] = value
      return value
    }
  }

  static createBroadCookie (name, value, seconds, domain) {
    // sets cookie on the base domain. e.g. if domain is baz.foo.bar.com, set cookie on ".bar.com"
    // To update an existing "broad domain" cookie, we need to know what domain it was actually set on.
    // since a retrieved cookie never tells which domain it was set on, we need to set another test cookie
    // to find out which "broadest" domain the cookie was set on. Then delete the test cookie, and use that domain
    // for updating the actual cookie.

    // This if condition is redundant. Domain will never be not defined.
    // even if it is undefined we directly pass it in the else.
    if (domain) {
      let broadDomain = $ct.broadDomain
      if (broadDomain == null) { // if we don't know the broadDomain yet, then find out
        const domainParts = domain.split('.')
        let testBroadDomain = ''
        for (let idx = domainParts.length - 1; idx >= 0; idx--) {
          if (idx === 0) {
            testBroadDomain = domainParts[idx] + testBroadDomain
          } else {
            testBroadDomain = '.' + domainParts[idx] + testBroadDomain
          }

          // only needed if the cookie already exists and needs to be updated. See note above.
          if (this.readCookie(name)) {
            // no guarantee that browser will delete cookie, hence create short lived cookies
            var testCookieName = 'test_' + name + idx
            this.createCookie(testCookieName, value, 10, testBroadDomain) // self-destruct after 10 seconds
            if (!this.readCookie(testCookieName)) { // if test cookie not set, then the actual cookie wouldn't have been set on this domain either.
              continue
            } else { // else if cookie set, then delete the test and the original cookie
              this.removeCookie(testCookieName, testBroadDomain)
            }
          }

          this.createCookie(name, value, seconds, testBroadDomain)
          const tempCookie = this.readCookie(name)
          // eslint-disable-next-line eqeqeq
          if (tempCookie == value) {
            broadDomain = testBroadDomain
            $ct.broadDomain = broadDomain
            break
          }
        }
      } else {
        this.createCookie(name, value, seconds, broadDomain)
      }
    } else {
      this.createCookie(name, value, seconds, domain)
    }
  }

  static getMetaProp (property) {
    const metaObj = this.readFromLSorCookie(META_COOKIE)
    if (metaObj != null) {
      return metaObj[property]
    }
  }

  static setMetaProp (property, value) {
    if (this._isLocalStorageSupported()) {
      let wzrkMetaObj = this.readFromLSorCookie(META_COOKIE)
      if (wzrkMetaObj == null) {
        wzrkMetaObj = {}
      }
      if (value === undefined) {
        delete wzrkMetaObj[property]
      } else {
        wzrkMetaObj[property] = value
      }
      this.saveToLSorCookie(META_COOKIE, wzrkMetaObj)
    }
  }

  static getAndClearMetaProp (property) {
    const value = this.getMetaProp(property)
    this.setMetaProp(property, undefined)
    return value
  }

  static setInstantDeleteFlagInK () {
    let k = this.readFromLSorCookie(KCOOKIE_NAME)
    if (k == null) {
      k = {}
    }
    k.flag = true
    this.saveToLSorCookie(KCOOKIE_NAME, k)
  }

  static backupEvent (data, reqNo, logger) {
    let backupArr = this.readFromLSorCookie(LCOOKIE_NAME)
    if (typeof backupArr === 'undefined') {
      backupArr = {}
    }
    backupArr[reqNo] = { q: data }
    this.saveToLSorCookie(LCOOKIE_NAME, backupArr)
    logger.debug(`stored in ${LCOOKIE_NAME} reqNo : ${reqNo} -> ${data}`)
  }

  static removeBackup (respNo, logger) {
    const backupMap = this.readFromLSorCookie(LCOOKIE_NAME)
    if (typeof backupMap !== 'undefined' && backupMap !== null && typeof backupMap[respNo] !== 'undefined') {
      logger.debug(`del event: ${respNo} data-> ${backupMap[respNo].q}`)
      delete backupMap[respNo]
      this.saveToLSorCookie(LCOOKIE_NAME, backupMap)
    }
  }

  /**
   * A helper method to get data from either cookies or local storage.
   * This also checks the mode of the SDK and decides which methods to call
   * @param {('cookie' | 'localStorage')} type
   * @param {string} name
   * @returns {Promise<any>} cookieOrLocalStorageValue
   */
  static async retrieveData (type, name) {
    let cookieOrLocalStorageValue
    switch (type) {
      case 'cookie': {
        if (ModeManager.mode === 'WEB') {
          cookieOrLocalStorageValue = this.readCookie(name)
        } else {
          cookieOrLocalStorageValue = await this.readCookieAsync(name)
        }
        break
      }
      case 'localStorage': {
        if (ModeManager.mode === 'WEB') {
          cookieOrLocalStorageValue = this.read(name)
        } else {
          cookieOrLocalStorageValue = await this.readAsync(name)
        }
        break
      }
    }

    return cookieOrLocalStorageValue
  }

  /**
   * A helper method to add data to either cookies or local storage.
   * This also checks the mode of the SDK and decides which methods to call
   * @param {('cookie' | 'localStorage')} type
   * @param {string} name
   * @param {string} value
   * @param {string} seconds
   * @param {string} domain
   * @returns {Promise<any>} saved
   */
  static async addData (type, name, value, seconds, domain) {
    let saved
    switch (type) {
      case 'cookie': {
        if (ModeManager.mode === 'WEB') {
          saved = this.createCookieAsync(name, value, seconds, domain)
        } else {
          saved = await this.readCookieAsync(name, value, seconds, domain)
        }
        break
      }
      case 'localStorage': {
        if (ModeManager.mode === 'WEB') {
          saved = this.save(name, value)
        } else {
          saved = await this.saveAsync(name, value)
        }
        break
      }
    }

    return saved
  }
}

export const $ct = {
  globalCache: {
    gcookie: null,
    REQ_N: 0,
    RESP_N: 0
  },
  LRU_CACHE: null,
  globalProfileMap: undefined,
  globalEventsMap: undefined,
  blockRequest: false,
  isOptInRequest: false,
  broadDomain: null,
  webPushEnabled: null,
  campaignDivMap: {},
  currentSessionId: null,
  wiz_counter: 0, // to keep track of number of times we load the body
  notifApi: {
    notifEnabledFromApi: false
  }, // helper variable to handle race condition and check when notifications were called
  unsubGroups: [],
  updatedCategoryLong: null,
  inbox: null,
  isPrivacyArrPushed: false,
  privacyArray: [],
  offline: false,
  location: null,
  dismissSpamControl: false,
  globalUnsubscribe: true,
  flutterVersion: null
  // domain: window.location.hostname, url -> getHostName()
  // gcookie: -> device
}
