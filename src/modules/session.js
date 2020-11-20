// import {
//   SCOOKIE_PREFIX
// } from '../util/constants'
// import { StorageManager } from '../util/storage'

// export class SessionManager {
//   #SCOOKIE_NAME
//   #accountID
//   #logger

//   constructor (params = {
//     accountID,
//     logger
//   }) {
//     this.#accountID = params.accountID
//     this.#SCOOKIE_NAME = SCOOKIE_PREFIX + '_' + accountID
//     this.#logger = params.logger
//   }

//   get SCOOKIE_NAME () {
//     return this.#SCOOKIE_NAME
//   }

//   set SCOOKIE_NAME (accountID) {
//     this.#SCOOKIE_NAME = SCOOKIE_PREFIX + '_' + accountID
//   }

//   logout () {
//     this.#logger.debug('logout called')
//     StorageManager.setInstantDeleteFlagInK()
//   }
// }
import { singleQuoteRegex, SCOOKIE_EXP_TIME_IN_SECS } from '../util/constants'
import { isObject } from '../util/datatypes'
import { getNow } from '../util/datetime'
import { StorageManager } from '../util/storage'

export default class SessionManager {
  #logger
  #sessionId
  cookieName // SCOOKIE_NAME
  scookieObj

  constructor ({ logger }) {
    this.sessionId = StorageManager.getMetaProp('cs')
    this.#logger = logger
  }

  get sessionId () {
    return this.#sessionId
  }

  set sessionId (sessionId) {
    this.#sessionId = sessionId
  }

  getSessionCookieObject () {
    let scookieStr = StorageManager.readCookie(this.cookieName)
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

  setSessionCookieObject (obj) {
    const objStr = JSON.stringify(obj)
    StorageManager.createBroadCookie(this.cookieName, objStr, SCOOKIE_EXP_TIME_IN_SECS, window.location.hostname)
  }

  manageSession (session) {
    // first time. check if current session id in localstorage is same
    // if not same then prev = current and current = this new session
    if (typeof this.sessionId === 'undefined' || this.sessionId !== session) {
      const currentSessionInLS = StorageManager.getMetaProp('cs')
      // if sessionId in meta is undefined - set current to both
      if (typeof currentSessionInLS === 'undefined') {
        StorageManager.setMetaProp('ps', session)
        StorageManager.setMetaProp('cs', session)
        StorageManager.setMetaProp('sc', 1)
      } else if (currentSessionInLS !== session) {
        // not same as session in local storage. new session
        StorageManager.setMetaProp('ps', currentSessionInLS)
        StorageManager.setMetaProp('cs', session)
        let sessionCount = StorageManager.getMetaProp('sc')
        if (typeof sessionCount === 'undefined') {
          sessionCount = 0
        }
        StorageManager.setMetaProp('sc', sessionCount + 1)
      }
      this.sessionId = session
    }
  }
}
