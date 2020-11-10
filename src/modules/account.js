// import {
//   TARGET_DOMAIN,
//   TARGET_PROTOCOL
// } from '../options'
// import { StorageManager } from '../util/storage'

// export class Account {
//   #accountID
//   #region
//   #appVersion
//   #logger

//   #targetDomain
//   #dataPostURL
//   #recorderURL
//   #emailURL

//   #personalizationActive

//   constructor ({
//     logger
//   }) {
//     this.#logger = logger
//     this.#targetDomain = TARGET_DOMAIN
//     this.#dataPostURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/a?t=96`
//     this.#recorderURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/r?r=1`
//     this.#emailURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/e?r=1`
//   }

//   get accountID () {
//     return this.#accountID
//   }

//   set accountID (accountID) {
//     // TODO: add some validation
//     if (!this.#accountID) {
//       this.#accountID = accountID
//     }
//   }

//   get region () {
//     return this.#region
//   }

//   set region (region) {
//     // TODO: add some validation
//     this.#region = region
//     this.#targetDomain = `${region}.${TARGET_DOMAIN}`
//     this.#dataPostURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/a?t=96`
//     this.#recorderURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/r?r=1`
//     this.#emailURL = `${TARGET_PROTOCOL}//${this.#targetDomain}/e?r=1`
//   }

//   get appVersion () {
//     return this.#appVersion
//   }

//   set appVersion (appVersion) {
//     // TODO: add some validation
//     this.#appVersion = appVersion
//   }

//   get targetDomain () {
//     return this.#targetDomain
//   }

//   isPersonalizationActive () {
//     return (StorageManager._isLocalStorageSupported() && this.#personalizationActive)
//   }
// }

// export default {
//   Account
// }
import { TARGET_DOMAIN, TARGET_PROTOCOL } from '../options'

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
    return this.targetDomain
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
