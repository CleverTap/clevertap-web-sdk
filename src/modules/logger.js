import {
  CLEVERTAP_ERROR_PREFIX
} from '../util/messages'

export const logLevels = {
  DISABLE: 0,
  ERROR: 1,
  INFO: 2,
  DEBUG: 3
}

export class Logger {
  logLevel
  wzrkError = {}
  constructor (logLevel) {
    this.logLevel = logLevel != null ? logLevel : logLevels.INFO
    this.wzrkError = {}
  }

  get logLevelValue () {
    return this.logLevel
  }

  set logLevelValue (logLevel) {
    this.logLevel = logLevel
  }

  error (message) {
    if (this.logLevelValue >= logLevels.ERROR) {
      this.#log('error', message)
    }
  }

  info (message) {
    if (this.logLevelValue >= logLevels.INFO) {
      this.#log('log', message)
    }
  }

  debug (message) {
    if (this.logLevelValue >= logLevels.DEBUG || this.#isLegacyDebug) {
      this.#log('debug', message)
    }
  }

  debugShopify (message) {
    if (this.logLevelValue >= logLevels.DEBUG || this.#isLegacyDebug) {
      this.#log('debug', message, 'shopify_standard_event')
    }
  }

  reportError (code, description) {
    this.wzrkError.c = code
    this.wzrkError.d = description
    this.error(`${CLEVERTAP_ERROR_PREFIX} ${code}: ${description}`)
  }

  #log (level, message, eventType = 'web') {
    try {
      const ts = new Date().getTime()
      if (eventType === 'shopify_standard_event') {
        console.log(`CleverTap [${ts}]: `)
        console.log(JSON.parse(message))
      } else {
        console.log(`CleverTap [${ts}]: ${message}`)
      }
    } catch (e) {}
  }

  get #isLegacyDebug () {
    return (typeof sessionStorage !== 'undefined' && sessionStorage.WZRK_D === '')
  }
}

export default {
  Logger,
  logLevels
}
