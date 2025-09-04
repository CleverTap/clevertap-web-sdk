import { StorageManager } from './storage'
import { LRU_CACHE } from './constants'

export default class LRUCache {
  #keyOrder

  constructor (max) {
    this.max = max
  }

  async init () {
    let lruCache = await StorageManager.readFromLSorCookie(LRU_CACHE)
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
  }

  async get (key) {
    const item = this.cache[key]
    if (item) {
      this.cache = this.#deleteFromObject(key, this.cache)
      this.cache[key] = item
      this.#keyOrder.push(key)
    }
    await this.saveCacheToLS(this.cache)
    return item
  }

  async set (key, value) {
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
    await this.saveCacheToLS(this.cache)
  }

  async saveCacheToLS (cache) {
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
    await StorageManager.saveToLSorCookie(LRU_CACHE, { cache: objToArray })
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
