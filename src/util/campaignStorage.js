// Core campaign storage/DOM primitives, kept dependency-free of higher-level
// campaign render/delivery-preference utilities to avoid circular imports.

import {
  StorageManager,
  $ct
} from './storage'
import {
  CAMP_COOKIE_NAME,
  singleQuoteRegex,
  GCOOKIE_NAME,
  CAMP_COOKIE_G
} from './constants'
import { getToday } from './datetime'
import { isValueValid, safeJSONParse } from './datatypes'

export const getCampaignObject = (storage = StorageManager) => {
  let finalcampObj = {}
  if (storage._isLocalStorageSupported()) {
    let campObj = storage.read(CAMP_COOKIE_NAME)
    if (campObj != null) {
      try {
        campObj = JSON.parse(decodeURIComponent(campObj).replace(singleQuoteRegex, '\"'))
        finalcampObj = campObj
      } catch (e) {
        finalcampObj = {}
      }
    } else {
      finalcampObj = {}
    }
  }
  return finalcampObj
}

// Save Camp here
export const saveCampaignObject = (campaignObj, storage = StorageManager) => {
  if (storage._isLocalStorageSupported()) {
    const newObj = { ...getCampaignObject(storage), ...campaignObj }
    const campObj = JSON.stringify(newObj)
    storage.save(CAMP_COOKIE_NAME, encodeURIComponent(campObj))
    setCampaignObjectForGuid(storage)
  }
}

// set Campaign Object against the guid, with daily count and total count details
export const setCampaignObjectForGuid = (storage = StorageManager) => {
  if (storage._isLocalStorageSupported()) {
    let guid = storage.read(GCOOKIE_NAME)
    if (isValueValid(guid)) {
      try {
        guid = safeJSONParse(decodeURIComponent(storage.read(GCOOKIE_NAME)), null)
        const guidCampObj = storage.read(CAMP_COOKIE_G) ? JSON.parse(decodeURIComponent(storage.read(CAMP_COOKIE_G))) : {}
        if (guid && storage._isLocalStorageSupported()) {
          var finalCampObj = {}
          var campObj = getCampaignObject(storage)

          /* TODO: Check if Webinbox needs these keys or get rid of them */
          Object.keys(campObj).forEach(key => {
            const campKeyObj = (guid in guidCampObj && Object.keys(guidCampObj[guid]).length && guidCampObj[guid][key]) ? guidCampObj[guid][key] : {}
            const globalObj = campObj[key].global
            const today = getToday()
            const dailyObj = campObj[key][today]
            if (typeof globalObj !== 'undefined') {
              const campaignIdArray = Object.keys(globalObj)
              for (const index in campaignIdArray) {
                let resultObj = []
                if (campaignIdArray.hasOwnProperty(index)) {
                  let dailyC = 0
                  let totalC = 0
                  const campaignId = campaignIdArray[index]
                  if (campaignId === 'tc') {
                    continue
                  }
                  if (typeof dailyObj !== 'undefined' && typeof dailyObj[campaignId] !== 'undefined') {
                    dailyC = dailyObj[campaignId]
                  }
                  if (typeof globalObj !== 'undefined' && typeof globalObj[campaignId] !== 'undefined') {
                    totalC = globalObj[campaignId]
                  }
                  resultObj = [campaignId, dailyC, totalC]
                  campKeyObj[campaignId] = resultObj
                }
              }
            }
            finalCampObj = {
              ...finalCampObj,
              [key]: campKeyObj
            }
          })

          finalCampObj = {
            ...finalCampObj,
            wsc: campObj.wsc,
            wfc: campObj.wfc,
            woc: campObj.woc,
            wmp: campObj.wmp,
            wmpdt: campObj.wmpdt,
            dnd: campObj.dnd,
            wndsc: campObj.wndsc,
            wndfc: campObj.wndfc,
            wndoc: campObj.wndoc,
            wndmp: campObj.wndmp
          }

          guidCampObj[guid] = finalCampObj
          storage.save(CAMP_COOKIE_G, encodeURIComponent(JSON.stringify(guidCampObj)))
        }
      } catch (e) {
        console.error('Invalid clevertap Id ' + e)
      }
    }
  }
}

const _storageByCampaignDivMap = new Map()

export const registerCampaignDivMap = (campaignDivMap, storage) => {
  _storageByCampaignDivMap.set(campaignDivMap, storage)
}

export const closeIframe = (campaignId, divIdIgnored, currentSessionId, instanceCampaignDivMap, storage) => {
  // Find the campaignDivMap that contains this campaignId.
  // Check the instance-specific map first, then the global $ct map,
  // then search all registered instance maps (for cross-instance close via iframe).
  let targetMap = null
  if (instanceCampaignDivMap != null && instanceCampaignDivMap[campaignId] != null) {
    targetMap = instanceCampaignDivMap
  } else if ($ct.campaignDivMap != null && $ct.campaignDivMap[campaignId] != null) {
    targetMap = $ct.campaignDivMap
  } else {
    // Search all instance campaignDivMaps (handles cross-instance close from iframe)
    for (const map of _storageByCampaignDivMap.keys()) {
      if (map != null && map[campaignId] != null) {
        targetMap = map
        break
      }
    }
  }

  const ownerStorage = (targetMap != null && _storageByCampaignDivMap.get(targetMap)) || storage || StorageManager
  if (campaignId != null && campaignId !== '-1') {
    if (ownerStorage._isLocalStorageSupported()) {
      const campaignObj = getCampaignObject(ownerStorage)

      // CurrentSesion Id is the problem
      campaignObj.dnd = [...new Set([
        ...(campaignObj.dnd ?? []),
        campaignId
      ])]
      saveCampaignObject(campaignObj, ownerStorage)
    }
  }

  if (targetMap != null) {
    const divId = targetMap[campaignId]
    if (divId != null) {
      const containerEl = document.getElementById(divId)
      if (containerEl == null) {
        // DOM already removed (e.g. SPA navigation ran dismissActiveCampaigns); drop stale map entry
        delete targetMap[campaignId]
        return
      }
      containerEl.remove()
      if (divId === 'intentPreview') {
        if (document.getElementById('intentOpacityDiv') != null) {
          document.getElementById('intentOpacityDiv').remove()
        }
      } else if (divId === 'wizParDiv0') {
        if (document.getElementById('intentOpacityDiv0') != null) {
          document.getElementById('intentOpacityDiv0').remove()
        }
      } else if (divId === 'wizParDiv2') {
        if (document.getElementById('intentOpacityDiv2') != null) {
          document.getElementById('intentOpacityDiv2').remove()
        }
      }
      delete targetMap[campaignId]
    }
  }
}
