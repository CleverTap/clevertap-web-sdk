// CleverTap specific utilities

import { StorageManager } from './storage'
import {
  CAMP_COOKIE_NAME,
  singleQuoteRegex
} from './constants'
import { getToday } from './datetime'

export const getCampaignObject = () => {
  let campObj = {}
  if (StorageManager._isLocalStorageSupported()) {
    campObj = StorageManager.read(CAMP_COOKIE_NAME)
    if (campObj != null) {
      campObj = JSON.parse(decodeURIComponent(campObj).replace(singleQuoteRegex, '\"'))
    } else {
      campObj = {}
    }
  }
  return campObj
}

export const saveCampaignObject = (campaignObj) => {
  if (StorageManager._isLocalStorageSupported()) {
    const campObj = JSON.stringify(campaignObj)
    StorageManager.save(CAMP_COOKIE_NAME, encodeURIComponent(campObj))
  }
}

export const getCampaignObjForLc = () => {
  let campObj = {}
  if (StorageManager._isLocalStorageSupported()) {
    campObj = getCampaignObject()
    let resultObj = []
    const globalObj = campObj.global
    const today = getToday()
    const dailyObj = campObj[today]
    if (typeof globalObj !== 'undefined') {
      const campaignIdArray = Object.keys(globalObj)
      for (const index in campaignIdArray) {
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
          const element = [campaignId, dailyC, totalC]
          resultObj.push(element)
        }
      }
    }
    let todayC = 0
    if (typeof dailyObj !== 'undefined' && typeof dailyObj.tc !== 'undefined') {
      todayC = dailyObj.tc
    }
    resultObj = {
      wmp: todayC,
      tlc: resultObj
    }
    return resultObj
  }
}
