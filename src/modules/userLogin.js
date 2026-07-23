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
  addToLocalProfileMap,
  restoreCampaignObjectForGuid
} from '../util/clevertap'
import { validateCustomCleverTapID } from '../util/helpers'

export default class UserLoginHandler extends Array {
  #request
  #logger
  #account
  #session
  #oldValues
  #device
  #instanceManager

  constructor ({
    request,
    account,
    session,
    logger,
    device,
    instanceManager
  },
  values) {
    super()
    this.#request = request
    this.#account = account
    this.#session = session
    this.#logger = logger
    this.#oldValues = values
    this.#device = device
    this.#instanceManager = instanceManager
  }

  // On User Login
  #processOUL (profileArr) {
    let sendOULFlag = true
    this.#instanceManager.storage.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag)
    const addToK = (ids, customIdFlag = false) => {
      let k = this.#instanceManager.storage.readFromLSorCookie(KCOOKIE_NAME)
      const g = this.#instanceManager.storage.readFromLSorCookie(GCOOKIE_NAME)
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
        if (this.#instanceManager.state.LRU_CACHE == null && this.#instanceManager.storage._isLocalStorageSupported()) {
          this.#instanceManager.state.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE)
        }

        if (anonymousUser) {
          if ((g) != null) {
            // if have gcookie
            this.#instanceManager.state.LRU_CACHE.set(kId, g)
            this.#instanceManager.state.blockRequest = false
          }
        } else {
          // check if the id is present in the cache
          // set foundInCache to true
          for (const idx in ids) {
            if (ids.hasOwnProperty(idx)) {
              const id = ids[idx]
              if (this.#instanceManager.state.LRU_CACHE.cache[id]) {
                kId = id
                foundInCache = true
                break
              }
            }
          }
        }

        if (foundInCache) {
          if (kId !== this.#instanceManager.state.LRU_CACHE.getLastKey()) {
            // New User found
            // remove the entire cache
            this.#handleCookieFromCache()
          } else {
            sendOULFlag = false
            this.#instanceManager.storage.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag)
          }
          const gFromCache = this.#instanceManager.state.LRU_CACHE.get(kId)
          this.#instanceManager.state.LRU_CACHE.set(kId, gFromCache)
          this.#instanceManager.storage.saveToLSorCookie(GCOOKIE_NAME, gFromCache)
          // Only override gcookie if we don't have a customId
          if (!customIdFlag) {
            this.#device.gcookie = gFromCache
          }

          // Restore WZRK_CAMP from WZRK_CAMP_G for the returning user's guid
          restoreCampaignObjectForGuid()

          const lastK = this.#instanceManager.state.LRU_CACHE.getSecondLastKey()
          if (this.#instanceManager.storage.readFromLSorCookie(FIRE_PUSH_UNREGISTERED) && lastK !== -1) {
            // CACHED OLD USER FOUND. TRANSFER PUSH TOKEN TO THIS USER
            const lastGUID = this.#instanceManager.state.LRU_CACHE.cache[lastK]
            this.#request.unregisterTokenForGuid(lastGUID)
          }
        } else {
          if (!anonymousUser && !customIdFlag) {
            this.clear()
          } else {
            if ((g) != null && !customIdFlag) {
              this.#device.gcookie = g
              this.#instanceManager.storage.saveToLSorCookie(GCOOKIE_NAME, g)
              sendOULFlag = false
            }
          }
          this.#instanceManager.storage.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false)
          kId = ids[0]
        }
      }
      k.id = kId
      this.#instanceManager.storage.saveToLSorCookie(KCOOKIE_NAME, k)
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
            let hasCustomId = false
            data.type = 'profile'
            if (profileObj.tz == null) {
              // try to auto capture user timezone if not present
              profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]
            }

            // Handle customId field for setting custom CleverTap ID.
            if (profileObj.customId) {
              const result = validateCustomCleverTapID(profileObj.customId)
              if (result.isValid) {
                hasCustomId = true
                // Set the custom ID as gcookie
                this.#device.gcookie = result.sanitizedId
                this.#instanceManager.storage.saveToLSorCookie(GCOOKIE_NAME, result.sanitizedId)
                this.#logger.debug('customId set for OUL flow:: ' + result.sanitizedId)
              } else {
                this.#logger.error('Invalid customId: ' + result.error)
              }
              delete profileObj.customId
            } else if ('customId' in profileObj) {
              // Key present but falsy (e.g. '', 0) — remove so it is not sent as a profile field
              delete profileObj.customId
            }

            data.profile = profileObj
            const ids = []
            if (this.#instanceManager.storage._isLocalStorageSupported()) {
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
                addToK(ids, hasCustomId)
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

            this.#request.saveAndFireRequest(pageLoadUrl, this.#instanceManager.state.blockRequest, sendOULFlag)
          }
        }
      }
    }
  }

  clear () {
    this.#logger.debug('clear called. Reset flag has been set.')
    this.#deleteUser()
    this.#instanceManager.storage.setMetaProp(CLEAR, true)
  }

  #handleCookieFromCache () {
    this.#instanceManager.state.blockRequest = false
    console.debug('Block request is false')
    if (this.#instanceManager.storage._isLocalStorageSupported()) {
      this.#instanceManager.storage.remove(PR_COOKIE)
      this.#instanceManager.storage.remove(EV_COOKIE)
      this.#instanceManager.storage.remove(META_COOKIE)
      this.#instanceManager.storage.remove(ARP_COOKIE)
      this.#instanceManager.storage.remove(CAMP_COOKIE_NAME)
      this.#instanceManager.storage.remove(CHARGEDID_COOKIE_NAME)
    }
    this.#instanceManager.storage.removeCookie(CAMP_COOKIE_NAME, getHostName())
    this.#instanceManager.storage.removeCookie(this.#session.cookieName, this.#instanceManager.state.broadDomain)
    this.#instanceManager.storage.removeCookie(ARP_COOKIE, this.#instanceManager.state.broadDomain)
    this.#session.setSessionCookieObject('')
  }

  #deleteUser () {
    this.#instanceManager.state.blockRequest = true
    this.#logger.debug('Block request is true')
    // Only reset gcookie. Preserve REQ_N and RESP_N to avoid triggering
    // the retry loop in RequestDispatcher (which retries when RESP_N < REQ_N - 1).
    this.#instanceManager.state.globalCache.gcookie = null
    if (this.#instanceManager.storage._isLocalStorageSupported()) {
      this.#instanceManager.storage.remove(GCOOKIE_NAME)
      this.#instanceManager.storage.remove(KCOOKIE_NAME)
      this.#instanceManager.storage.remove(PR_COOKIE)
      this.#instanceManager.storage.remove(EV_COOKIE)
      this.#instanceManager.storage.remove(META_COOKIE)
      this.#instanceManager.storage.remove(ARP_COOKIE)
      this.#instanceManager.storage.remove(CAMP_COOKIE_NAME)
      this.#instanceManager.storage.remove(CHARGEDID_COOKIE_NAME)
    }
    this.#instanceManager.storage.removeCookie(GCOOKIE_NAME, this.#instanceManager.state.broadDomain)
    this.#instanceManager.storage.removeCookie(CAMP_COOKIE_NAME, getHostName())
    this.#instanceManager.storage.removeCookie(KCOOKIE_NAME, getHostName())
    this.#instanceManager.storage.removeCookie(this.#session.cookieName, this.#instanceManager.state.broadDomain)
    this.#instanceManager.storage.removeCookie(ARP_COOKIE, this.#instanceManager.state.broadDomain)
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
        this.#instanceManager.storage.setInstantDeleteFlagInK()
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
