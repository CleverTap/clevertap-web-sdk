import { TARGET_DOMAIN, TARGET_PREFIX, TARGET_PROTOCOL } from '../options'

export default class Account {
  #accountId
  #region = ''
  #targetDomain = TARGET_DOMAIN

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

  get targetDomain () {
    return this.#targetDomain
  }

  set targetDomain (targetDomain) {
    this.#targetDomain = targetDomain
  }

  get finalTargetDomain () {
    if (this.region) {
      return `${this.region}.${this.targetDomain}`
    }
    return `${TARGET_PREFIX}.${this.targetDomain}`
  }

  get dataPostURL () {
    return `${TARGET_PROTOCOL}//${this.finalTargetDomain}/a?t=96`
  }

  get recorderURL () {
    return `${TARGET_PROTOCOL}//${this.finalTargetDomain}/r?r=1`
  }

  get emailURL () {
    return `${TARGET_PROTOCOL}//${this.finalTargetDomain}/e?r=1`
  }
}
