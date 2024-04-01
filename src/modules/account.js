import { DEFAULT_REGION, TARGET_DOMAIN, TARGET_PROTOCOL } from '../options'

export default class Account {
  #accountId
  #region = ''
  #targetDomain = TARGET_DOMAIN
  #dcSdkversion = ''

  constructor ({ id } = {}, region = '', targetDomain = TARGET_DOMAIN) {
    this.id = id
    if (region) {
      this.region = region
    }
    if (targetDomain) {
      this.targetDomain = targetDomain
    }
  }

  get id () {
    return this.#accountId
  }

  set id (accountId) {
    this.#accountId = accountId
  }

  get region () {
    return this.#region
  }

  set region (region) {
    this.#region = region
  }

  get dcSDKVersion () {
    return this.#dcSdkversion
  }

  set dcSDKVersion (dcSDKVersion) {
    this.#dcSdkversion = dcSDKVersion
  }

  get targetDomain () {
    return this.#targetDomain
  }

  set targetDomain (targetDomain) {
    this.#targetDomain = targetDomain
  }

  get finalTargetDomain () {
    if (this.region) {
      return `${this.region}.${this.targetDomain}`
    } else {
      if (this.targetDomain === TARGET_DOMAIN) {
        return `${DEFAULT_REGION}.${this.targetDomain}`
      }
      return this.targetDomain
    }
  }

  get dataPostURL () {
    return 'http://localhost:8080/a?t=96'
    // return `${TARGET_PROTOCOL}//${this.finalTargetDomain}/a?t=96`
  }

  get recorderURL () {
    return `${TARGET_PROTOCOL}//${this.finalTargetDomain}/r?r=1`
  }

  get emailURL () {
    return `${TARGET_PROTOCOL}//${this.finalTargetDomain}/e?r=1`
  }
}
