// CleverTap specific utilities

import { StorageManager } from './storage'
import {
  CAMP_COOKIE_NAME,
  singleQuoteRegex
} from './constants'

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
    let campObj = JSON.stringify(campaignObj)
    StorageManager.save(CAMP_COOKIE_NAME, encodeURIComponent(campObj))
  }
}
