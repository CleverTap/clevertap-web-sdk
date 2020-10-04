import {
  SCOOKIE_PREFIX
} from '../util/constants'
import { StorageManager } from '../util/storage'

export class SessionManager{
  #SCOOKIE_NAME
  #accountID
  #logger

  constructor (params = {
    accountID,
    logger
  }) {
    this.#accountID = params.accountID
    this.#SCOOKIE_NAME = SCOOKIE_PREFIX + '_' + accountID
    this.#logger = params.logger
  }

  get SCOOKIE_NAME () {
    return this.#SCOOKIE_NAME
  }

  set SCOOKIE_NAME (accountID) {
    this.#SCOOKIE_NAME = SCOOKIE_PREFIX + '_' + accountID
  }

  logout () {
    this.#logger.debug('logout called')
    StorageManager.setInstantDeleteFlagInK()
  }
}
