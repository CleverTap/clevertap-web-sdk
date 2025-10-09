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
import { validateCustomCleverTapID } from '../util/helpers'

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
  #processOUL (profileArr) {
    let sendOULFlag = true
    let hasCustomCTID = false
    StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag)
    const addToK = (ids, customCTIDFlag = false) => {
      let k = StorageManager.readFromLSorCookie(KCOOKIE_NAME)
      const g = StorageManager.readFromLSorCookie(GCOOKIE_NAME)
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
            this.#handleCookieFromCache()
          } else {
            sendOULFlag = false
            StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag)
          }
          const gFromCache = $ct.LRU_CACHE.get(kId)
          $ct.LRU_CACHE.set(kId, gFromCache)
          StorageManager.saveToLSorCookie(GCOOKIE_NAME, gFromCache)
          this.#device.gcookie = gFromCache

          const lastK = $ct.LRU_CACHE.getSecondLastKey()
          if (StorageManager.readFromLSorCookie(FIRE_PUSH_UNREGISTERED) && lastK !== -1) {
            // CACHED OLD USER FOUND. TRANSFER PUSH TOKEN TO THIS USER
            const lastGUID = $ct.LRU_CACHE.cache[lastK]
            this.#request.unregisterTokenForGuid(lastGUID)
          }
        } else {
          if (!anonymousUser && !customCTIDFlag) {
            this.clear()
          } else {
            if ((g) != null) {
              this.#device.gcookie = g
              StorageManager.saveToLSorCookie(GCOOKIE_NAME, g)
              sendOULFlag = false
            }
          }
          StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false)
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

            // Handle CustomCTID field for setting custom CleverTap ID
            if (profileObj.CustomCTID) {
              hasCustomCTID = true
              const result = validateCustomCleverTapID(profileObj.CustomCTID)
              if (result.isValid) {
                // Set the custom ID as gcookie
                this.#device.gcookie = result.sanitizedId
                StorageManager.saveToLSorCookie(GCOOKIE_NAME, result.sanitizedId)
                this.#logger.debug('CustomCTID set for OUL flow:: ' + result.sanitizedId)

                // Remove CustomCTID from profile data before sending to server
                delete profileObj.CustomCTID
              } else {
                this.#logger.error('Invalid CustomCTID: ' + result.error)
                // Remove invalid CustomCTID from profile data
                delete profileObj.CustomCTID
              }
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
                addToK(ids, hasCustomCTID)
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
            const compressedData = compressData(JSON.stringify(data), this.#logger)
            let pageLoadUrl = this.#account.dataPostURL
            pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
            pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

            // Whenever sendOULFlag is true then dont send arp and gcookie (guid in memory in the request)
            // Also when this flag is set we will get another flag from LC in arp which tells us to delete arp
            // stored in the cache and replace it with the response arp.

            this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest, sendOULFlag)
          }
        }
      }
    }
  }

  clear () {
    this.#logger.debug('clear called. Reset flag has been set.')
    this.#deleteUser()
    StorageManager.setMetaProp(CLEAR, true)
  }

  #handleCookieFromCache () {
    $ct.blockRequest = false
    console.debug('Block request is false')
    if (StorageManager._isLocalStorageSupported()) {
      delete localStorage[PR_COOKIE]
      delete localStorage[EV_COOKIE]
      delete localStorage[META_COOKIE]
      delete localStorage[ARP_COOKIE]
      delete localStorage[CAMP_COOKIE_NAME]
      delete localStorage[CHARGEDID_COOKIE_NAME]
    }
    StorageManager.removeCookie(CAMP_COOKIE_NAME, getHostName())
    StorageManager.removeCookie(this.#session.cookieName, $ct.broadDomain)
    StorageManager.removeCookie(ARP_COOKIE, $ct.broadDomain)
    this.#session.setSessionCookieObject('')
  }

  #deleteUser () {
    $ct.blockRequest = true
    this.#logger.debug('Block request is true')
    $ct.globalCache = {
      gcookie: null,
      REQ_N: 0,
      RESP_N: 0
    }
    if (StorageManager._isLocalStorageSupported()) {
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
    StorageManager.removeCookie(CAMP_COOKIE_NAME, getHostName())
    StorageManager.removeCookie(KCOOKIE_NAME, getHostName())
    StorageManager.removeCookie(this.#session.cookieName, $ct.broadDomain)
    StorageManager.removeCookie(ARP_COOKIE, $ct.broadDomain)
    this.#device.gcookie = null
    this.#session.setSessionCookieObject('')
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
        try {
          this.#processOUL([profileObj])
        } catch (e) {
          this.#logger.debug(e)
        }
      } else {
        this.#logger.error('Profile object is in incorrect format')
      }
    }
  }

  push (...profilesArr) {
    this.#processLoginArray(profilesArr)
    return 0
  }

  _processOldValues () {
    if (this.#oldValues) {
      this.#processLoginArray(this.#oldValues)
    }
    this.#oldValues = null
  }
}
