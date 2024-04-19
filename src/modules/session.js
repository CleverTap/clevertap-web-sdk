import { singleQuoteRegex, SCOOKIE_EXP_TIME_IN_SECS } from '../util/constants'
import { isObject } from '../util/datatypes'
import { getNow } from '../util/datetime'
import { StorageManager } from '../util/storage'
import { getHostName } from '../util/url'

export default class SessionManager {
  #logger
  #sessionId
  #isPersonalisationActive
  cookieName // SCOOKIE_NAME
  scookieObj

  constructor ({
    logger,
    isPersonalisationActive
  }) {
    this.sessionId = StorageManager.getMetaProp('cs')
    this.#logger = logger
    this.#isPersonalisationActive = isPersonalisationActive
  }

  get sessionId () {
    return this.#sessionId
  }

  set sessionId (sessionId) {
    this.#sessionId = sessionId
  }

  async getSessionCookieObject () {
    let scookieStr = await StorageManager.retrieveData('cookie', this.cookieName)
    let obj = {}

    if (scookieStr != null) {
      // converting back single quotes to double for JSON parsing - http://www.iandevlin.com/blog/2012/04/html5/cookies-json-localstorage-and-opera
      scookieStr = scookieStr.replace(singleQuoteRegex, '"')

      obj = JSON.parse(scookieStr)
      if (!isObject(obj)) {
        obj = {}
      } else {
        if (typeof obj.t !== 'undefined') { // check time elapsed since last request
          const lastTime = obj.t
          const now = getNow()
          if ((now - lastTime) > (SCOOKIE_EXP_TIME_IN_SECS + 60)) {
            // adding 60 seconds to compensate for in-journey requests
            // ideally the cookie should've died after SCOOKIE_EXP_TIME_IN_SECS but it's still around as we can read
            // hence we shouldn't use it.
            obj = {}
          }
        }
      }
    }
    this.scookieObj = obj
    return obj
  }

  async setSessionCookieObject (obj) {
    const objStr = JSON.stringify(obj)
    await StorageManager.createBroadCookie(this.cookieName, objStr, SCOOKIE_EXP_TIME_IN_SECS, getHostName())
  }

  async manageSession (session) {
    // first time. check if current session id in localstorage is same
    // if not same then prev = current and current = this new session
    if (typeof this.sessionId === 'undefined' || this.sessionId !== session) {
      const currentSessionInLS = StorageManager.getMetaProp('cs')
      // if sessionId in meta is undefined - set current to both
      if (typeof currentSessionInLS === 'undefined') {
        await StorageManager.setMetaProp('ps', session)
        await StorageManager.setMetaProp('cs', session)
        await StorageManager.setMetaProp('sc', 1)
      } else if (currentSessionInLS !== session) {
        // not same as session in local storage. new session
        await StorageManager.setMetaProp('ps', currentSessionInLS)
        await StorageManager.setMetaProp('cs', session)
        let sessionCount = StorageManager.getMetaProp('sc')
        if (typeof sessionCount === 'undefined') {
          sessionCount = 0
        }
        await StorageManager.setMetaProp('sc', sessionCount + 1)
      }
      this.sessionId = session
    }
  }

  async getTimeElapsed () {
    if (!this.#isPersonalisationActive()) {
      return
    }
    if (this.scookieObj != null) { // TODO: check logic?
      this.scookieObj = await this.getSessionCookieObject()
    }
    const sessionStart = this.scookieObj.s
    if (sessionStart != null) {
      const ts = getNow()
      return Math.floor(ts - sessionStart)
    }
  }

  async getPageCount () {
    if (!this.#isPersonalisationActive()) {
      return
    }

    if (this.scookieObj != null) { // TODO: check logic
      this.scookieObj = await this.getSessionCookieObject()
    }
    return this.scookieObj.p
  }
}
