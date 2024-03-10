import ModeManager from '../modules/mode'

export default class ShopifyStorageManager {
  /**
   * saves to localStorage
   * @param {string} key
   * @param {*} value
   * @returns {Promise<boolean>} true if the value is saved
   */
  static async saveAsync (key, value) {
    if (!key || !value) {
      return false
    }
    try {
      await ModeManager.browser.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * reads from localStorage
   * @param {string} key
   * @returns {Promise<string | null>}
   */
  static async readAsync (key) {
    if (!key) {
      return false
    }
    let data
    try {
      data = await ModeManager.browser.localStorage.getItem(key)
      data = JSON.parse(data)
    } catch (e) {
      data = null
    }
    return data
  }

  /**
   * removes item from localStorage
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  static async removeAsync (key) {
    if (!key) {
      return false
    }

    try {
      await ModeManager.browser.localStorage.removeItem(key)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * creates a cookie and sets it in the browser
   * @param {string} name
   * @param {string} value
   * @param {strings} seconds
   * @param {*} domain
   * @returns {Promise<boolean>} true if the cookie was created, false if it is not created
   */
  static async createCookieAsync (name, value, seconds, domain) {
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

    try {
      await ModeManager.browser.cookie.set(name, value + expires + domainStr + '; path=/')
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * reads the cookie in the browser
   * @param {string} name
   * @returns {Promise<string | null>} cookie
   */
  static async readCookieAsync (name) {
    let cookie
    try {
      cookie = await ModeManager.browser.cookie.get(name)
    } catch (e) {
      cookie = null
    }
    if (cookie === '') {
      return null
    }

    return cookie
  }

  /**
   * removes the cookie
   * @param {string} name
   * @param {string} domain
   * @returns {Promise<boolean>}
   */
  static async removeCookieAsync (name, domain) {
    let cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

    if (domain) {
      cookieStr = cookieStr + ' domain=' + domain + '; path=/'
    }

    try {
      await ModeManager.browser.cookie.set(cookieStr)
      return true
    } catch (e) {
      return false
    }
  }
}
