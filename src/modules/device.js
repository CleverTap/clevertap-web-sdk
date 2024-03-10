import { isValueValid } from '../util/datatypes'
import { StorageManager } from '../util/storage'
import { GCOOKIE_NAME, COOKIE_EXPIRY } from '../util/constants'
import { getHostName } from '../util/url'

export default class DeviceManager {
  #logger
  gcookie

  constructor ({ logger }) {
    this.#logger = logger
    this.gcookie = this.getGuid()
  }

  async getGuid () {
    let guid = null
    if (isValueValid(this.gcookie)) {
      return this.gcookie
    }
    if (StorageManager._isLocalStorageSupported()) {
      const value = await StorageManager.retrieveData('cookie', GCOOKIE_NAME)
      if (isValueValid(value)) {
        try {
          guid = JSON.parse(decodeURIComponent(value))
        } catch (e) {
          this.#logger.debug('Cannot parse Gcookie from localstorage - must be encoded ' + value)
          // assumming guids are of size 32. supporting both formats.
          // guid can have encodedURIComponent or be without it.
          // 1.56e4078ed15749928c042479ec2b4d47 - breaks on JSON.parse(decodeURIComponent())
          // 2.%2256e4078ed15749928c042479ec2b4d47%22
          if (value.length === 32) {
            guid = value
            await StorageManager.saveToLSorCookie(GCOOKIE_NAME, value)
          } else {
            this.#logger.error('Illegal guid ' + value)
          }
        }

        // Persist to cookie storage if not present there.
        if (isValueValid(guid)) {
          await StorageManager.createBroadCookie(GCOOKIE_NAME, guid, COOKIE_EXPIRY, getHostName())
        }
      }
    }

    if (!isValueValid(guid)) {
      guid = await StorageManager.retrieveData('cookie', GCOOKIE_NAME)
      if (isValueValid(guid) && (guid.indexOf('%') === 0 || guid.indexOf('\'') === 0 || guid.indexOf('"') === 0)) {
        guid = null
      }
      if (isValueValid(guid)) {
        await StorageManager.saveToLSorCookie(GCOOKIE_NAME, guid)
      }
    }

    return guid
  }
}
