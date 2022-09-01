import { StorageManager } from '../../util/storage'
import { WEBINBOX, WEBINBOX_CONFIG } from '../../util/constants'

export const getInboxMessagesFromLS = () => {
  if (StorageManager._isLocalStorageSupported()) {
    try {
      const messages = StorageManager.readFromLSorCookie(WEBINBOX) || '{}'
      return JSON.parse(messages)
    } catch (e) {
      // this.logger.error('Unable to read web inbox messages from LS: ' + e)
    }
  }
}

export const saveInboxMessagesToLS = (messages) => {
  if (StorageManager._isLocalStorageSupported()) {
    try {
      StorageManager.saveToLSorCookie(WEBINBOX, JSON.stringify(messages))
    } catch (e) {
      // this.logger.error('Unable to save web inbox messages from LS: ' + e)
    }
  }
}

export const getConfigurationFromLS = () => {
  if (StorageManager._isLocalStorageSupported()) {
    try {
      const config = StorageManager.readFromLSorCookie(WEBINBOX_CONFIG) || {}
      return config
    } catch (e) {
      // this.logger.error('Unable to read web inbox settings from LS: ' + e)
    }
  }
}
