import {
  SCOOKIE_PREFIX
} from '../util/constants'

export class SessionManager{
  #SCOOKIE_NAME
  #accountID

  constructor (accountID) {
    this.#accountID = accountID
    this.#SCOOKIE_NAME = SCOOKIE_PREFIX + '_' + accountID
  }

  get SCOOKIE_NAME () {
    return this.#SCOOKIE_NAME
  }

  set SCOOKIE_NAME (accountID) {
    this.#SCOOKIE_NAME = SCOOKIE_PREFIX + '_' + accountID
  }
}
