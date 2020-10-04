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
  #logLevel
  constructor (logLevel) {
    this.#logLevel = logLevel == null ? logLevel : logLevels.INFO
  }

  get logLevel () {
    return this.#logLevel
  }

  set logLevel (logLevel) {
    this.#logLevel = logLevel
  }

  error (message) {
    if (this.#logLevel >= logLevels.ERROR) {
      this._log('error', message)
    }
  }

  info (message) {
    if (this.#logLevel >= logLevels.INFO) {
      this._log('log', message)
    }
  }

  debug (message) {
    if (this.#logLevel >= logLevels.DEBUG) {
      this._log('error', message)
    }
  }

  reportError (code, description) {
    this.error(`${CLEVERTAP_ERROR_PREFIX} ${code}: ${description}`)
  }

  _log (level, message) {
    if (window.console) {
      try {
        let ts = new Date().getTime()
        console[level](`CleverTap [${ts}]: ${message}`)
      } catch (e) {}
    }
  }
}

export default {
  Logger,
  logLevels
}
