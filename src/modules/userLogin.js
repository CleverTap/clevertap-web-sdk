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
  META_COOKIE
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
  addToURL
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

  constructor ({
    request,
    account,
    session,
    logger
  }) {
    super()
    this.#request = request
    this.#account = account
    this.#session = session
    this.#logger = logger
  }

  #processOUL (profileArr) {
    let sendOULFlag = true
    const addToK = function (ids) {
      let k = StorageManager.readFromLSorCookie(KCOOKIE_NAME)
      const g = StorageManager.readFromLSorCookie(GCOOKIE_NAME)
      let kId
      if (k == null) {
        k = {}
        kId = ids
      } else { /* check if already exists */
        kId = k.id
        let anonymousUser = false
        let foundInCache = false
        if (kId == null) {
          kId = ids[0]
          anonymousUser = true
        }

        if ($ct.LRU_CACHE == null && StorageManager.isLocalStorageSupported()) {
          $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE)
        }

        if (anonymousUser) {
          if ((g) != null) {
            $ct.LRU_CACHE.set(kId, g)
            $ct.blockRequeust = false
          }
        } else {
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
            // Same User
            this.#handleCookieFromCache()
          } else {
            sendOULFlag = false
          }
          const gFromCache = $ct.LRU_CACHE.get(kId)
          $ct.LRU_CACHE.set(kId, gFromCache)
          StorageManager.saveToLSorCookie(GCOOKIE_NAME, gFromCache)
          $ct.gcookie = gFromCache

          const lastK = $ct.LRU_CACHE.getSecondLastKEY()
          if (lastK !== -1) {
            const lastGUID = $ct.LRU_CACHE.cache[lastK]
            this.#request.unregisterTokenForGuid(lastGUID)
          }
        } else {
          if (!anonymousUser) {
            this.#clear()
          } else {
            if ((g) != null) {
              $ct.gcookie = g
              StorageManager.saveToLSorCookie(GCOOKIE_NAME, g)
              sendOULFlag = false
            }
          }
          kId = ids[0]
        }
      }
      k.id = kId
      StorageManager.saveToLSorCookie(KCOOKIE_NAME, k)
    }

    if (Array.isArray(profileArr) && profileArr.length > 0) {
      for (const index in profileArr) {
        if (profileArr.hasOwnProperty(index)) {
          const outerObj = profileArr[index]
          let data = {}
          let profileObj
          if (outerObj.Site != null) { // organic data from the site
            profileObj = outerObj.Site
            if (isObjectEmpty(profileObj) || !isProfileValid(profileObj)) {
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
            if (StorageManager.isLocalStorageSupported()) {
              if (profileObj.Identity != null) {
                ids.push(profileObj.Identity)
              }
              if (profileObj.Email != null) {
                ids.push(profileObj.Email)
              }
              if (profileObj.GPID != null) {
                ids.push('GP:' + profileObj.GPID)
              }
              if (profileObj.FBID != null) {
                ids.push('FB:' + profileObj.FBID)
              }
              if (ids.length > 0) {
                addToK(ids)
              }
            }
            addToLocalProfileMap(profileObj, true)
            data = this.#request.addSystemDataToObject(data, undefined)

            this.#request.addFlags(data)
            // Adding 'isOUL' flag in true for OUL cases which.
            // This flag tells LC to create a new arp object.
            // Also we will receive the same flag in response arp which tells to delete existing arp object.
            if (sendOULFlag) {
              data[IS_OUL] = true
            }

            const compressedData = compressData(JSON.stringify(data))

            let pageLoadUrl = this.#account.dataPostURL
            pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
            pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

            // Whenever sendOULFlag is true then dont send arp and gcookie (guid in memory in the request)
            // Also when this flag is set we will get another flag from LC in arp which tells us to delete arp
            // stored in the cache and replace it with the response arp.
            this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequeust, sendOULFlag)
          }
        }
      }
    }
  }

  #clear () {
    console.debug('clear called. Reset flag has been set.')
    this.#deleteUser()
    StorageManager.setMetaProp(CLEAR, true)
  }

  #handleCookieFromCache () {
    $ct.blockRequeust = false
    console.debug('Block request is false')
    if (StorageManager.isLocalStorageSupported()) {
      delete localStorage[PR_COOKIE]
      delete localStorage[EV_COOKIE]
      delete localStorage[META_COOKIE]
      delete localStorage[ARP_COOKIE]
      delete localStorage[CAMP_COOKIE_NAME]
      delete localStorage[CHARGEDID_COOKIE_NAME]
    }
    StorageManager.removeCookie(CAMP_COOKIE_NAME, $ct.domain)
    StorageManager.removeCookie(this.#session.cookieName, $ct.broadDomain)
    StorageManager.removeCookie(ARP_COOKIE, $ct.broadDomain)
    $ct.scookieObj = ''
  }

  #deleteUser () {
    $ct.blockRequeust = true
    console.debug('Block request is true')
    $ct.globalCache = {}
    if (StorageManager.isLocalStorageSupported()) {
      delete localStorage[GCOOKIE_NAME]
      delete localStorage[KCOOKIE_NAME]
      delete localStorage[PR_COOKIE]
      delete localStorage[EV_COOKIE]
      delete localStorage[META_COOKIE]
      delete localStorage[ARP_COOKIE]
      delete localStorage[CAMP_COOKIE_NAME]
      delete localStorage[CHARGEDID_COOKIE_NAME]
    }
    StorageManager.removeCookie(GCOOKIE_NAME, $ct.broadDomain)
    StorageManager.removeCookie(CAMP_COOKIE_NAME, $ct.domain)
    StorageManager.removeCookie(KCOOKIE_NAME, $ct.domain)
    StorageManager.removeCookie(this.#session.cookieName, $ct.broadDomain)
    StorageManager.removeCookie(ARP_COOKIE, $ct.broadDomain)
    $ct.gcookie = null
    $ct.scookieObj = ''
  }

  #processLoginArray (loginArr) {
    if (Array.isArray(loginArr) && loginArr.length > 0) {
      const profileObj = loginArr.pop()
      const processProfile = profileObj != null && isObject(profileObj) &&
          ((profileObj.Site != null && Object.keys(profileObj.Site).length > 0) ||
              (profileObj.Facebook != null && Object.keys(profileObj.Facebook).length > 0) ||
              (profileObj['Google Plus'] != null && Object.keys(profileObj['Google Plus']).length > 0))
      if (processProfile) {
        StorageManager.setInstantDeleteFlagInK()
        this.#processOUL([profileObj])
      } else {
        console.error('Profile object is in incorrect format')
      }
    }
  }

  push (...profilesArr) {
    this.#processLoginArray(profilesArr)
    return 0
  }
}
