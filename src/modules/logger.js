import {
  CLEVERTAP_ERROR_PREFIX
} from '../util/messages'

export const logLevels = {
  DISABLE: 0,
  ERROR: 1,
  INFO: 2,
  DEBUG: 3,
  DEBUG_PE: 4
}

export class Logger {
  #logLevel
  wzrkError = {}
  constructor (logLevel) {
    // Singleton pattern - return existing instance if it exists
    if (Logger.instance) {
      return Logger.instance
    }

    this.#logLevel = logLevel == null ? logLevels.INFO : logLevel
    this.wzrkError = {}

    Logger.instance = this
  }

  // Static method for explicit singleton access
  static getInstance (logLevel) {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel)
    }
    return Logger.instance
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

  debugShopify (message, type = 'web') {
    if (this.logLevelValue >= logLevels.DEBUG || this.#isLegacyDebug) {
      this.#log('debug', message, type)
    }
  }

  debugPE (message) {
    if (this.#logLevel >= logLevels.DEBUG_PE) {
      this.#log('debug_pe', message)
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
