export class StorageManager {
  static save (key, value) {
    if (!key || !value) {
      return false
    }
    if (this._isLocalStorageSupported()) {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    }
  }

  static read (key) {
    if (!key) {
      return false
    }
    let data = null
    if (this._isLocalStorageSupported()) {
      data = localStorage.getItem(key)
    }
    if (data != null) {
      try {
        data = JSON.parse(data)
      } catch (e) {}
    }
    return data
  }

  static remove (key) {
    if (!key) {
      return false
    }
    if (this._isLocalStorageSupported()) {
      localStorage.removeItem(key)
      return true
    }
  }

  static _isLocalStorageSupported = () => {
    return 'localStorage' in window && window.localStorage !== null && typeof window.localStorage.setItem === 'function'
  }
}
