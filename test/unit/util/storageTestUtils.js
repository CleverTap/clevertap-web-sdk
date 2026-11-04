import { StorageManager } from '../../../src/util/storage'
import { snapshotCookieNames } from '../../../src/util/storageMigration'

// The SDK writes cookies on the host, or on the broad domain (.example.com in jest)
export const clearAllCookies = () => {
  snapshotCookieNames().forEach(name => {
    StorageManager.removeCookie(name, window.location.hostname)
    StorageManager.removeCookie(name, '.example.com')
  })
}

export const clearAllStorage = () => {
  localStorage.clear()
  clearAllCookies()
}
