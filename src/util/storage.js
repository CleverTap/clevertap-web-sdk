const saveToStorage = (key, value) => {
  if (!key || value == null) {
    return
  }
  if (isLocalStorageSupported()) {
    localStorage[key] = JSON.stringify(value)
  }
}

const readFromStorage = (key) => {
  if (!key) {
    return
  }
  let data = null
  if (isLocalStorageSupported()) {
    data = localStorage[key]
  }
  if (data != null) {
    try {
      data = JSON.parse(data)
    } catch (e) {}
  }
  return data
}

const removeFromStorage = (key) => {
  if (!key) {
    return
  }
  if (isLocalStorageSupported()) {
    delete localStorage[key]
  }
}

export const isLocalStorageSupported = () => {
  try {
    window.localStorage.setItem('wzrk_debug', '12345678')
    window.localStorage.removeItem('wzrk_debug')
    return 'localStorage' in window && window.localStorage !== null
  } catch (e) {
    return false
  }
}

export default class StorageManager {
  static save (key, value) {
    if (!key || !value) {
      return
    }
    saveToStorage(key, value)
  }

  static read (key) {
    if (!key) {
      return
    }
    return readFromStorage(key)
  }

  static remove (key) {
    if (!key) {
      return
    }
    removeFromStorage(key)
  }
}
