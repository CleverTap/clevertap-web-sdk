import {
  TARGET_DOMAIN,
  TARGET_PROTOCOL,
} from '../options'
import { StorageManager } from '../util/storage'

export class Account {
  #accountID
  #region
  #appVersion
  #logger

  #targetDomain
  #dataPostURL
  #recorderURL
  #emailURL

  #personalizationActive

  constructor ({
    logger
  }) {
    this.#logger = logger
    this.#targetDomain = TARGET_DOMAIN
    this.#dataPostURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/a?t=96`
    this.#recorderURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/r?r=1`
    this.#emailURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/e?r=1`
  }

  get accountID () {
    return this.#accountID
  }

  set accountID (accountID) {
    // TODO: add some validation
    if (!this.#accountID) {
      this.#accountID = accountID
    }
  }

  get region () {
    return this.#region
  }

  set region (region) {
    // TODO: add some validation
    this.#region = region
    this.#targetDomain = `${region}.${TARGET_DOMAIN}`
    this.#dataPostURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/a?t=96`
    this.#recorderURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/r?r=1`
    this.#emailURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/e?r=1`
  }

  get appVersion () {
    return this.#appVersion
  }

  set appVersion (appVersion) {
    // TODO: add some validation
    this.#appVersion = appVersion
  }

  get targetDomain () {
    return this.#targetDomain
  }

  isPersonalizationActive () {
    return (StorageManager._isLocalStorageSupported() && this.#personalizationActive)
  }

}

export default {
  Account
}
