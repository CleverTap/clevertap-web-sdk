import { StorageManager } from './storage'
import { LRU_CACHE, COOKIE_EXPIRY } from './constants'

export default class LRUCache {
  #keyOrder

  constructor (max) {
    this.max = max
    let lruCache = StorageManager.readFromLSorCookie(LRU_CACHE)
    if (lruCache) {
      const tempLruCache = {}
      this.#keyOrder = []
      lruCache = lruCache.cache
      for (const entry in lruCache) {
        if (lruCache.hasOwnProperty(entry)) {
          tempLruCache[lruCache[entry][0]] = lruCache[entry][1]
          this.#keyOrder.push(lruCache[entry][0])
        }
      }
      this.cache = tempLruCache
    } else {
      this.cache = {}
      this.#keyOrder = []
    }

    // Merge entries from broad-domain cookie so that identity→GUID
    // mappings written on a sibling sub-domain are visible here.
    this.#mergeCookieCache()
  }

  #mergeCookieCache () {
    try {
      const cookieData = StorageManager.readCookie(LRU_CACHE)
      if (cookieData) {
        const parsed = JSON.parse(cookieData)
        if (parsed && parsed.cache) {
          let merged = false
          for (const entry of parsed.cache) {
            const key = entry[0]
            const value = entry[1]
            if (key && value && !this.cache[key]) {
              this.cache[key] = value
              this.#keyOrder.push(key)
              merged = true
            }
          }
          if (merged) {
            // Persist merged state back to localStorage and cookie
            this.saveCacheToLS(this.cache)
          }
        }
      }
    } catch (e) {
      // Cookie data may be malformed; ignore
    }
  }

  #saveCacheToBroadCookie (objToArray) {
    try {
      const cookieValue = JSON.stringify({ cache: objToArray })
      StorageManager.createBroadCookie(LRU_CACHE, cookieValue, COOKIE_EXPIRY, window.location.hostname)
    } catch (e) {
      // Cookie storage may fail; non-critical
    }
  }

  get (key) {
    const item = this.cache[key]
    if (item) {
      this.cache = this.#deleteFromObject(key, this.cache)
      this.cache[key] = item
      this.#keyOrder.push(key)
    }
    this.saveCacheToLS(this.cache)
    return item
  }

  set (key, value) {
    const item = this.cache[key]
    const allKeys = this.#keyOrder
    if (item != null) {
      this.cache = this.#deleteFromObject(key, this.cache)
    } else if (allKeys.length === this.max) {
      this.cache = this.#deleteFromObject(allKeys[0], this.cache)
    }
    this.cache[key] = value
    if (this.#keyOrder[this.#keyOrder - 1] !== key) {
      this.#keyOrder.push(key)
    }
    this.saveCacheToLS(this.cache)
  }

  saveCacheToLS (cache) {
    const objToArray = []
    const allKeys = this.#keyOrder
    for (const index in allKeys) {
      if (allKeys.hasOwnProperty(index)) {
        const temp = []
        temp.push(allKeys[index])
        temp.push(cache[allKeys[index]])
        objToArray.push(temp)
      }
    }
    StorageManager.saveToLSorCookie(LRU_CACHE, { cache: objToArray })

    // Also persist to broad-domain cookie for cross-subdomain sharing
    this.#saveCacheToBroadCookie(objToArray)
  }

  getKey (value) {
    if (value === null) {
      return null
    }
    const allKeys = this.#keyOrder
    for (const index in allKeys) {
      if (allKeys.hasOwnProperty(index)) {
        if (this.cache[allKeys[index]] === value) {
          return allKeys[index]
        }
      }
    }
    return null
  }

  getSecondLastKey () {
    const keysArr = this.#keyOrder
    if (keysArr != null && keysArr.length > 1) {
      return keysArr[keysArr.length - 2]
    }
    return -1
  }

  getLastKey () {
    const keysLength = this.#keyOrder.length
    if (keysLength) {
      return this.#keyOrder[keysLength - 1]
    }
  }

  #deleteFromObject (key, obj) {
    const allKeys = JSON.parse(JSON.stringify(this.#keyOrder))
    const newCache = {}
    let indexToDelete
    for (const index in allKeys) {
      if (allKeys.hasOwnProperty(index)) {
        if (allKeys[index] !== key) {
          newCache[allKeys[index]] = obj[allKeys[index]]
        } else {
          indexToDelete = index
        }
      }
    }
    allKeys.splice(indexToDelete, 1)
    this.#keyOrder = JSON.parse(JSON.stringify(allKeys))
    return newCache
  }
}
