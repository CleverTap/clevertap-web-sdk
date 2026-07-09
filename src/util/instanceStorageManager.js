import {
  GCOOKIE_NAME,
  META_COOKIE,
  KCOOKIE_NAME,
  LCOOKIE_NAME,
  ISOLATE_COOKIE,
  MUTE_EXPIRY_KEY
} from './constants'

export default class InstanceStorageManager {
  /**
   * @param {string} accountId - The CleverTap account ID
   * @param {boolean} isDefault - Whether this is the default instance (no key prefix)
   * @param {object} encryption - The per-instance Encryption object
   */
  constructor (accountId, isDefault, encryption) {
    this.accountId = accountId
    this.isDefault = isDefault
    this.encryption = encryption

    // Per-instance global cache (not shared across instances)
    this.globalCache = { gcookie: null, REQ_N: 0, RESP_N: 0 }
  }

  /**
   * Returns the prefixed key for storage.
   * Default instance: no prefix (backward compat).
   * Additional instances: prefix with `{accountId}:`.
   */
  _prefixKey (key) {
    if (this.isDefault) {
      return key
    }
    return this.accountId + ':' + key
  }

  // ---------------------------------------------------------------
  // localStorage helpers
  // ---------------------------------------------------------------

  save (key, value) {
    if (!key || !value) {
      return false
    }
    const prefixed = this._prefixKey(key)
    if (this._isLocalStorageSupported()) {
      if (this.encryption.shouldEncrypt(key)) {
        localStorage.setItem(prefixed, this.encryption.encrypt(value))
        return true
      }
      localStorage.setItem(prefixed, typeof value === 'string' ? value : JSON.stringify(value))
      return true
    }
  }

  read (key) {
    if (!key) {
      return false
    }
    const prefixed = this._prefixKey(key)
    let data = null
    if (this._isLocalStorageSupported()) {
      data = localStorage.getItem(prefixed)
    }
    if (data != null) {
      try {
        if (this.encryption.shouldDecrypt(key)) {
          data = this.encryption.decrypt(data)
        }
        data = JSON.parse(data)
      } catch (e) {}
    }
    return data
  }

  remove (key) {
    if (!key) {
      return false
    }
    const prefixed = this._prefixKey(key)
    if (this._isLocalStorageSupported()) {
      localStorage.removeItem(prefixed)
      return true
    }
  }

  // ---------------------------------------------------------------
  // Cookie helpers
  // ---------------------------------------------------------------

  removeCookie (name, domain) {
    const prefixed = this._prefixKey(name)
    let cookieStr = prefixed + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

    if (domain) {
      cookieStr = cookieStr + ' domain=' + domain + '; path=/'
    }

    document.cookie = cookieStr
  }

  createCookie (name, value, seconds, domain) {
    const prefixed = this._prefixKey(name)
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

    document.cookie = prefixed + '=' + value + expires + domainStr + '; path=/'
  }

  readCookie (name) {
    const prefixed = this._prefixKey(name)
    const nameEQ = prefixed + '='
    const ca = document.cookie.split(';')
    for (let idx = 0; idx < ca.length; idx++) {
      let c = ca[idx]
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length)
      }
      // eslint-disable-next-line eqeqeq
      if (c.indexOf(nameEQ) == 0) {
        try {
          return decodeURIComponent(c.substring(nameEQ.length, c.length))
        } catch (e) {
          return null
        }
      }
    }
    return null
  }

  // ---------------------------------------------------------------
  // Composite LS / Cookie helpers
  // ---------------------------------------------------------------

  saveToLSorCookie (property, value) {
    if (value == null) {
      return
    }
    try {
      if (this._isLocalStorageSupported()) {
        this.save(property, encodeURIComponent(JSON.stringify(value)))
      } else {
        if (property === GCOOKIE_NAME) {
          this.createCookie(property, encodeURIComponent(value), 0, window.location.hostname)
        } else {
          this.createCookie(property, encodeURIComponent(JSON.stringify(value)), 0, window.location.hostname)
        }
      }
      this.globalCache[property] = value
    } catch (e) {}
  }

  readFromLSorCookie (property) {
    let data
    if (this.globalCache.hasOwnProperty(property)) {
      return this.globalCache[property]
    }
    if (this._isLocalStorageSupported()) {
      data = this.read(property)
    } else {
      data = this.readCookie(property)
    }

    if (data !== null && data !== undefined && !(typeof data.trim === 'function' && data.trim() === '')) {
      let value
      try {
        value = JSON.parse(decodeURIComponent(data))
      } catch (err) {
        value = decodeURIComponent(data)
      }
      this.globalCache[property] = value
      return value
    }
  }

  // ---------------------------------------------------------------
  // Broad-domain cookie
  // ---------------------------------------------------------------

  /**
   * Creates a cookie scoped to the broadest possible domain.
   *
   * Because the static StorageManager reads/writes $ct.broadDomain, this
   * instance method instead accepts a `broadDomain` parameter (the current
   * known broad domain from the instance's state) and **returns** the
   * discovered broadDomain so the caller can persist it back into state.
   *
   * @param {string} name
   * @param {string} value
   * @param {number} seconds
   * @param {string} domain
   * @param {string|null} broadDomain - current known broad domain (from instance state)
   * @param {number|null} domainSpecification - if set, use this many levels of the hostname
   * @returns {string|null} the discovered broadDomain (caller should store it)
   */
  createBroadCookie (name, value, seconds, domain, domainSpecification = null) {
    let broadDomain = this._broadDomain || null
    if (domainSpecification) {
      const hostnameParts = window.location.hostname.split('.')
      const level = domainSpecification
      let calculatedDomain = ''
      if (level <= hostnameParts.length) {
        const domainParts = hostnameParts.slice(-level)
        calculatedDomain = '.' + domainParts.join('.')
      } else {
        calculatedDomain = '.' + window.location.hostname
      }
      let cookieValue = value
      if (name === GCOOKIE_NAME && this.readCookie(name)) {
        // remove duplicate cookies if they exist
        // removing .bank.in because it is a protected domain
        cookieValue = this.readCookie(name)
        this.removeCookie(name, broadDomain)
        this.removeCookie(name, calculatedDomain)
        this.removeCookie(name, '.bank.in')
      }
      this.createCookie(name, cookieValue, seconds, calculatedDomain)
      return broadDomain
    }

    /* ---------------------------------------------------------------
     * Sub-domain isolation: when the global flag is set, skip the
     * broad-domain logic and write a cookie scoped to the current
     * host only.  Also remove any legacy broad-domain copy so that
     * the host-level cookie has precedence.
     * ------------------------------------------------------------- */
    const isolate = !!this.readFromLSorCookie(ISOLATE_COOKIE)
    if (isolate) {
      // remove any legacy broad-domain cookie
      if (broadDomain) {
        this.removeCookie(name, broadDomain)
      }

      // write host-scoped cookie and stop
      this.createCookie(name, value, seconds, domain)
      return broadDomain
    }

    // sets cookie on the base domain. e.g. if domain is baz.foo.bar.com, set cookie on ".bar.com"
    if (domain) {
      if (broadDomain == null) {
        // discover the broadest domain the cookie can be set on
        const domainParts = domain.split('.')
        let testBroadDomain = ''
        for (let idx = domainParts.length - 1; idx >= 0; idx--) {
          if (idx === 0) {
            testBroadDomain = domainParts[idx] + testBroadDomain
          } else {
            testBroadDomain = '.' + domainParts[idx] + testBroadDomain
          }

          // only needed if the cookie already exists and needs to be updated
          if (this.readCookie(name)) {
            var testCookieName = 'test_' + name + idx
            this.createCookie(testCookieName, value, 10, testBroadDomain)
            if (!this.readCookie(testCookieName)) {
              continue
            } else {
              this.removeCookie(testCookieName, testBroadDomain)
            }
          }

          this.createCookie(name, value, seconds, testBroadDomain)
          const tempCookie = this.readCookie(name)
          // eslint-disable-next-line eqeqeq
          if (tempCookie == value) {
            broadDomain = testBroadDomain
            this._broadDomain = broadDomain
            break
          }
        }
      } else {
        this.createCookie(name, value, seconds, broadDomain)
      }
    } else {
      this.createCookie(name, value, seconds, domain)
    }

    return broadDomain
  }

  // ---------------------------------------------------------------
  // Meta-property helpers
  // ---------------------------------------------------------------

  getMetaProp (property) {
    const metaObj = this.readFromLSorCookie(META_COOKIE)
    if (metaObj != null) {
      return metaObj[property]
    }
  }

  setMetaProp (property, value) {
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

  getAndClearMetaProp (property) {
    const value = this.getMetaProp(property)
    this.setMetaProp(property, undefined)
    return value
  }

  // ---------------------------------------------------------------
  // K-cookie helper
  // ---------------------------------------------------------------

  setInstantDeleteFlagInK () {
    let k = this.readFromLSorCookie(KCOOKIE_NAME)
    if (k == null) {
      k = {}
    }
    k.flag = true
    this.saveToLSorCookie(KCOOKIE_NAME, k)
  }

  // ---------------------------------------------------------------
  // Event backup / restore
  // ---------------------------------------------------------------

  backupEvent (data, reqNo, logger) {
    let backupArr = this.readFromLSorCookie(LCOOKIE_NAME)
    if (typeof backupArr === 'undefined') {
      backupArr = {}
    }
    backupArr[reqNo] = { q: data }
    this.saveToLSorCookie(LCOOKIE_NAME, backupArr)
    logger.debug(`stored in ${LCOOKIE_NAME} reqNo : ${reqNo} -> ${data}`)
  }

  markBackupAsOUL (reqNo) {
    const oulRequests = this.getMetaProp('OUL_REQUESTS') || []
    if (!oulRequests.includes(reqNo)) {
      oulRequests.push(reqNo)
      this.setMetaProp('OUL_REQUESTS', oulRequests)
    }
  }

  isBackupOUL (reqNo) {
    const oulRequests = this.getMetaProp('OUL_REQUESTS') || []
    return oulRequests.includes(reqNo)
  }

  removeBackup (respNo, logger) {
    const backupMap = this.readFromLSorCookie(LCOOKIE_NAME)
    if (typeof backupMap !== 'undefined' && backupMap !== null && typeof backupMap[respNo] !== 'undefined') {
      logger.debug(`del event: ${respNo} data-> ${backupMap[respNo].q}`)
      delete backupMap[respNo]
      this.saveToLSorCookie(LCOOKIE_NAME, backupMap)
    }
  }

  // ---------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------

  _isLocalStorageSupported () {
    return 'localStorage' in window && window.localStorage !== null && typeof window.localStorage.setItem === 'function'
  }
}
