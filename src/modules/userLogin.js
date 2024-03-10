import {
  isObject,
  isObjectEmpty
} from '../util/datatypes'
import {
  KCOOKIE_NAME,
  GCOOKIE_NAME,
  EVT_PUSH,
  LRU_CACHE_SIZE,
  IS_OUL,
  CAMP_COOKIE_NAME,
  CHARGEDID_COOKIE_NAME,
  PR_COOKIE,
  EV_COOKIE,
  ARP_COOKIE,
  CLEAR,
  META_COOKIE,
  FIRE_PUSH_UNREGISTERED
} from '../util/constants'
import {
  StorageManager,
  $ct
} from '../util/storage'
import LRUCache from '../util/lruCache'
import {
  compressData
} from '../util/encoder'
import {
  addToURL,
  getHostName
} from '../util/url'
import {
  isProfileValid,
  processFBUserObj,
  processGPlusUserObj,
  addToLocalProfileMap
} from '../util/clevertap'

export default class UserLoginHandler extends Array {
  #request
  #logger
  #account
  #session
  #oldValues
  #device

  constructor ({
    request,
    account,
    session,
    logger,
    device
  },
  values) {
    super()
    this.#request = request
    this.#account = account
    this.#session = session
    this.#logger = logger
    this.#oldValues = values
    this.#device = device
  }

  // On User Login
  async #processOUL (profileArr) {
    let sendOULFlag = true
    await StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag)
    const addToK = async (ids) => {
      let k = await StorageManager.readFromLSorCookie(KCOOKIE_NAME)
      const g = await StorageManager.readFromLSorCookie(GCOOKIE_NAME)
      let kId
      if (k == null) {
        k = {}
        kId = ids
      } else {
        /* check if already exists */
        kId = k.id
        let anonymousUser = false
        let foundInCache = false
        if (kId == null) {
          kId = ids[0]
          anonymousUser = true
        }
        if ($ct.LRU_CACHE == null && StorageManager._isLocalStorageSupported()) {
          $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE)
        }

        if (anonymousUser) {
          if ((g) != null) {
            // if have gcookie
            $ct.LRU_CACHE.set(kId, g)
            $ct.blockRequest = false
          }
        } else {
          // check if the id is present in the cache
          // set foundInCache to true
          for (const idx in ids) {
            if (ids.hasOwnProperty(idx)) {
              const id = ids[idx]
              if ($ct.LRU_CACHE.cache[id]) {
                kId = id
                foundInCache = true
                break
              }
            }
          }
        }

        if (foundInCache) {
          if (kId !== $ct.LRU_CACHE.getLastKey()) {
            // New User found
            // remove the entire cache
            await this.#handleCookieFromCache()
          } else {
            sendOULFlag = false
            await StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag)
          }
          const gFromCache = $ct.LRU_CACHE.get(kId)
          $ct.LRU_CACHE.set(kId, gFromCache)
          await StorageManager.saveToLSorCookie(GCOOKIE_NAME, gFromCache)
          this.#device.gcookie = gFromCache

          const lastK = $ct.LRU_CACHE.getSecondLastKey()
          if (await StorageManager.readFromLSorCookie(FIRE_PUSH_UNREGISTERED) && lastK !== -1) {
            // CACHED OLD USER FOUND. TRANSFER PUSH TOKEN TO THIS USER
            const lastGUID = $ct.LRU_CACHE.cache[lastK]
            await this.#request.unregisterTokenForGuid(lastGUID)
          }
        } else {
          if (!anonymousUser) {
            this.clear()
          } else {
            if ((g) != null) {
              this.#device.gcookie = g
              await StorageManager.saveToLSorCookie(GCOOKIE_NAME, g)
              sendOULFlag = false
            }
          }
          await StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false)
          kId = ids[0]
        }
      }
      k.id = kId
      await StorageManager.saveToLSorCookie(KCOOKIE_NAME, k)
    }

    if (Array.isArray(profileArr) && profileArr.length > 0) {
      for (const index in profileArr) {
        if (profileArr.hasOwnProperty(index)) {
          const outerObj = profileArr[index]
          let data = {}
          let profileObj
          if (outerObj.Site != null) { // organic data from the site
            profileObj = outerObj.Site
            if (isObjectEmpty(profileObj) || !isProfileValid(profileObj, {
              logger: this.#logger
            })) {
              return
            }
          } else if (outerObj.Facebook != null) { // fb connect data
            const FbProfileObj = outerObj.Facebook
            // make sure that the object contains any data at all

            if (!isObjectEmpty(FbProfileObj) && (!FbProfileObj.error)) {
              profileObj = processFBUserObj(FbProfileObj)
            }
          } else if (outerObj['Google Plus'] != null) {
            const GPlusProfileObj = outerObj['Google Plus']
            if (isObjectEmpty(GPlusProfileObj) && (!GPlusProfileObj.error)) {
              profileObj = processGPlusUserObj(GPlusProfileObj, { logger: this.#logger })
            }
          }
          if (profileObj != null && (!isObjectEmpty(profileObj))) { // profile got set from above
            data.type = 'profile'
            if (profileObj.tz == null) {
              // try to auto capture user timezone if not present
              profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]
            }

            data.profile = profileObj
            const ids = []
            if (StorageManager._isLocalStorageSupported()) {
              if (profileObj.Identity) {
                ids.push(profileObj.Identity)
              }
              if (profileObj.Email) {
                ids.push(profileObj.Email)
              }
              if (profileObj.GPID) {
                ids.push('GP:' + profileObj.GPID)
              }
              if (profileObj.FBID) {
                ids.push('FB:' + profileObj.FBID)
              }
              if (ids.length > 0) {
                await addToK(ids)
              }
            }
            await addToLocalProfileMap(profileObj, true)
            data = await this.#request.addSystemDataToObject(data, undefined)

            this.#request.addFlags(data)
            // Adding 'isOUL' flag in true for OUL cases which.
            // This flag tells LC to create a new arp object.
            // Also we will receive the same flag in response arp which tells to delete existing arp object.
            if (sendOULFlag) {
              data[IS_OUL] = true
            }
            const compressedData = compressData(JSON.stringify(data), this.#logger)
            let pageLoadUrl = this.#account.dataPostURL
            pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
            pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

            // Whenever sendOULFlag is true then dont send arp and gcookie (guid in memory in the request)
            // Also when this flag is set we will get another flag from LC in arp which tells us to delete arp
            // stored in the cache and replace it with the response arp.

            await this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest, sendOULFlag)
          }
        }
      }
    }
  }

  async clear () {
    this.#logger.debug('clear called. Reset flag has been set.')
    await this.#deleteUser()
    await StorageManager.setMetaProp(CLEAR, true)
  }

  async #handleCookieFromCache () {
    $ct.blockRequest = false
    console.debug('Block request is false')
    if (StorageManager._isLocalStorageSupported()) {
      [PR_COOKIE, EV_COOKIE, META_COOKIE, ARP_COOKIE, CAMP_COOKIE_NAME, CHARGEDID_COOKIE_NAME].forEach(async (cookie) => {
        await StorageManager.deleteData('localStorage', cookie)
      })
    }
    await StorageManager.deleteData('cookie', CAMP_COOKIE_NAME, getHostName())
    await StorageManager.deleteData('cookie', this.#session.cookieName, $ct.broadDomain)
    await StorageManager.deleteData('cookie', ARP_COOKIE, $ct.broadDomain)
    await this.#session.setSessionCookieObject('')
  }

  async #deleteUser () {
    $ct.blockRequest = true
    this.#logger.debug('Block request is true')
    $ct.globalCache = {
      gcookie: null,
      REQ_N: 0,
      RESP_N: 0
    }
    if (StorageManager._isLocalStorageSupported()) {
      [GCOOKIE_NAME, KCOOKIE_NAME, PR_COOKIE, EV_COOKIE, META_COOKIE, ARP_COOKIE, CAMP_COOKIE_NAME, CHARGEDID_COOKIE_NAME].forEach(async (cookie) => {
        await StorageManager.deleteData('localStorage', cookie)
      })
    }
    await StorageManager.retrieveData('cookie', GCOOKIE_NAME, $ct.broadDomain)
    await StorageManager.retrieveData('cookie', CAMP_COOKIE_NAME, getHostName())
    await StorageManager.retrieveData('cookie', KCOOKIE_NAME, getHostName())
    await StorageManager.retrieveData('cookie', this.#session.cookieName, $ct.broadDomain)
    await StorageManager.retrieveData('cookie', ARP_COOKIE, $ct.broadDomain)
    this.#device.gcookie = null
    await this.#session.setSessionCookieObject('')
  }

  async #processLoginArray (loginArr) {
    if (Array.isArray(loginArr) && loginArr.length > 0) {
      const profileObj = loginArr.pop()
      const processProfile = profileObj != null && isObject(profileObj) &&
          ((profileObj.Site != null && Object.keys(profileObj.Site).length > 0) ||
              (profileObj.Facebook != null && Object.keys(profileObj.Facebook).length > 0) ||
              (profileObj['Google Plus'] != null && Object.keys(profileObj['Google Plus']).length > 0))
      if (processProfile) {
        await StorageManager.setInstantDeleteFlagInK()
        try {
          await this.#processOUL([profileObj])
        } catch (e) {
          this.#logger.debug(e)
        }
      } else {
        this.#logger.error('Profile object is in incorrect format')
      }
    }
  }

  async push (...profilesArr) {
    await this.#processLoginArray(profilesArr)
    return 0
  }

  _processOldValues () {
    if (this.#oldValues) {
      this.#processLoginArray(this.#oldValues)
    }
    this.#oldValues = null
  }
}
