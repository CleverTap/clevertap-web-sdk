// Campaign frequency-capping primitives, kept dependency-free of
// commonCampaignUtils/nativeDisplay/tr to avoid circular imports.
// doCampHouseKeeping needs to reschedule `_tr` on a display delay; since `_tr`
// (tr.js) itself depends on commonCampaignUtils, that reference is injected
// via setTrRef instead of imported directly.

import { addDeliveryPreferenceDetails } from '../clevertap.js'
import { getCampaignObject, saveCampaignObject } from '../campaignStorage.js'
import { CAMP_COOKIE_NAME, DISPLAY, GLOBAL } from '../constants.js'
import { getToday } from '../datetime.js'
import { deliveryPreferenceUtils } from '../campaignRender/utilities.js'
import { CampaignContext } from './campaignContext.js'

let _trRef = null

export const setTrRef = (tr) => {
  _trRef = tr
}

/*
  This function is used to increment the counters for session, daily, and global objects
*/
export const incrCount = (obj, campaignId, excludeFromFreqCaps) => {
  let currentCount = 0
  let totalCount = 0
  if (obj[campaignId] != null) {
    // Current count for this campaign
    currentCount = obj[campaignId]
  }
  currentCount++
  if (obj.tc != null) {
    // Total count across all campaigns
    totalCount = obj.tc
  }
  // If campaign is excluded from frequency caps, don't increment total count
  if (excludeFromFreqCaps < 0) {
    totalCount++
  }

  obj.tc = totalCount
  obj[campaignId] = currentCount
}

/*
   * @param {Object} campTypeObj - Campaign type object to check/modify
   * @param {string} campaignId - Current campaign ID
   * @param {Object} targetingMsgJson - Campaign configuration
   * @param {Object} capSettings - Frequency capping settings
   * @returns {boolean|Object} - false if cap exceeded, session object otherwise
   */
export const checkSessionCapping = (campTypeObj, campaignId, targetingMsgJson, capSettings) => {
  // Session-level capping: Checks if campaign exceeds session limits
  const sessionId = CampaignContext.session.sessionId
  let sessionObj = campTypeObj[sessionId]

  if (sessionObj) {
    const campaignSessionCount = sessionObj[campaignId]
    const totalSessionCount = sessionObj.tc

    // For web inbox campaigns
    if (targetingMsgJson[DISPLAY].wtarget_type === 3) {
      // Inbox session limit check
      if (
        capSettings.totalInboxSessionLimit > 0 &&
          totalSessionCount >= capSettings.totalInboxSessionLimit &&
          capSettings.excludeFromFreqCaps < 0
      ) {
        return false
      }
    } else {
      // Web popup session limit check
      if (
        capSettings.totalSessionLimit > 0 &&
          totalSessionCount >= capSettings.totalSessionLimit &&
          capSettings.excludeFromFreqCaps < 0
      ) {
        return false
      }
    }

    // Campaign-specific session limit check
    if (
      capSettings.campaignSessionLimit > 0 &&
        campaignSessionCount >= capSettings.campaignSessionLimit
    ) {
      return false
    }
  } else {
    // Initializes session object if not present
    sessionObj = {}
    campTypeObj[sessionId] = sessionObj
  }

  return sessionObj
}

/**
   * Checks daily-level capping and initializes daily object if needed
   * Mutates campTypeObj reference
   *
   * @param {Object} campTypeObj - Campaign type object to check/modify
   * @param {string} campaignId - Current campaign ID
   * @param {string} today - Today's date string
   * @param {Object} capSettings - Frequency capping settings
   * @returns {boolean|Object} - false if cap exceeded, daily object otherwise
   */
export const checkDailyCapping = (campTypeObj, campaignId, today, capSettings) => {
  // Daily-level capping: Checks if campaign exceeds daily limits
  let dailyObj = campTypeObj[today]

  if (dailyObj != null) {
    const campaignDailyCount = dailyObj[campaignId]
    const totalDailyCount = dailyObj.tc

    // Total daily limit check
    if (
      capSettings.totalDailyLimit > 0 &&
        totalDailyCount >= capSettings.totalDailyLimit &&
        capSettings.excludeFromFreqCaps < 0
    ) {
      return false
    }

    // Campaign-specific daily limit check
    if (
      capSettings.campaignDailyLimit > 0 &&
        campaignDailyCount >= capSettings.campaignDailyLimit
    ) {
      return false
    }
  } else {
    // Initializes daily object if not present
    dailyObj = {}
    campTypeObj[today] = dailyObj
  }

  return dailyObj
}

/**
   * Checks global-level (lifetime) capping and initializes global object if needed
   * Mutates campTypeObj reference
   *
   * @param {Object} campTypeObj - Campaign type object to check/modify
   * @param {string} campaignId - Current campaign ID
   * @param {number} campaignTotalLimit - Campaign lifetime limit
   * @returns {boolean|Object} - false if cap exceeded, global object otherwise
   */
export const checkGlobalCapping = (campTypeObj, campaignId, campaignTotalLimit) => {
  // Global-level capping: Checks lifetime limit for the campaign
  let globalObj = campTypeObj[GLOBAL]

  if (globalObj != null) {
    const campaignTotalCount = globalObj[campaignId]

    // Campaign lifetime limit check
    if (campaignTotalLimit > 0 && campaignTotalCount >= campaignTotalLimit) {
      return false
    }
  } else {
    // Initializes global object if not present
    globalObj = {}
    campTypeObj[GLOBAL] = globalObj
  }

  return globalObj
}

/**
   * Extracts frequency capping settings from campaign configuration
   * @param {Object} targetingMsgJson - Campaign configuration
   * @returns {Object} - Object containing all frequency capping settings
   */
export const extractFrequencyCappingSettings = (targetingMsgJson) => {
  // Variables to store campaign frequency capping settings
  var excludeFromFreqCaps = -1 // efc - Exclude from frequency caps (-1 means not excluded)
  let campaignSessionLimit = -1 // mdc - Once per session
  let campaignDailyLimit = -1 // tdc - Once per day
  let campaignTotalLimit = -1 // tlc - Once per user for the duration of campaign
  let totalDailyLimit = -1
  let totalSessionLimit = -1 // wmc - Web Popup Global Session Limit
  let totalInboxSessionLimit = -1 // wimc - Web Inbox Global Session Limit

  // Parses frequency capping settings from the message
  if (targetingMsgJson[DISPLAY].efc != null) {
    // exclude from frequency cap
    excludeFromFreqCaps = parseInt(targetingMsgJson[DISPLAY].efc, 10)
  }
  if (targetingMsgJson[DISPLAY].mdc != null) {
    // Campaign Session Limit
    campaignSessionLimit = parseInt(targetingMsgJson[DISPLAY].mdc, 10)
  }
  if (targetingMsgJson[DISPLAY].tdc != null) {
    // No of web popups in a day per campaign
    campaignDailyLimit = parseInt(targetingMsgJson[DISPLAY].tdc, 10)
  }
  if (targetingMsgJson[DISPLAY].tlc != null) {
    // Total lifetime count
    campaignTotalLimit = parseInt(targetingMsgJson[DISPLAY].tlc, 10)
  }
  if (targetingMsgJson[DISPLAY].wmp != null) {
    // No of campaigns per day
    totalDailyLimit = parseInt(targetingMsgJson[DISPLAY].wmp, 10)
  }
  if (targetingMsgJson[DISPLAY].wmc != null) {
    // No of campaigns per session
    totalSessionLimit = parseInt(targetingMsgJson[DISPLAY].wmc, 10)
  }
  if (targetingMsgJson[DISPLAY].wimc != null) {
    // No of inbox campaigns per session
    totalInboxSessionLimit = parseInt(targetingMsgJson[DISPLAY].wimc, 10)
  }

  return {
    excludeFromFreqCaps, // efc - Exclude from frequency caps (-1 means not excluded)
    campaignSessionLimit, // mdc - Once per session
    campaignDailyLimit, // tdc - Once per day per campaign
    campaignTotalLimit, // tlc - Once per user for the duration of campaign
    totalDailyLimit, // wmp - No of campaigns per day
    totalSessionLimit, // wmc - Web Popup Global Session Limit
    totalInboxSessionLimit // wimc - Web Inbox Global Session Limit
  }
}

export const doCampHouseKeeping = (targetingMsgJson, logger) => {
  // Extracts campaign ID from wzrk_id (e.g., "123_456" -> "123")
  const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
  // Gets current date for daily capping
  const today = getToday()

  if (
    deliveryPreferenceUtils.isCampaignAddedToDND(campaignId) &&
    !CampaignContext.instanceManager.state.dismissSpamControl
  ) {
    return false
  }

  if (CampaignContext.instanceManager.storage._isLocalStorageSupported()) {
    // Clears old session storage for campaigns
    delete sessionStorage[CAMP_COOKIE_NAME]
    var campTypeObj = {}
    // Retrieves stored campaign data from local storage
    const campObj = getCampaignObject()
    // Determines campaign type (web inbox or web popup) and fetches corresponding data
    if (
      targetingMsgJson.display.wtarget_type === 3 &&
      campObj.hasOwnProperty('wi')
    ) {
      // Web inbox campaigns
      campTypeObj = campObj.wi
    } else if (
      (targetingMsgJson.display.wtarget_type === 0 ||
        targetingMsgJson.display.wtarget_type === 1) &&
      campObj.hasOwnProperty('wp')
    ) {
      // Web popup campaigns
      // campTypeObj = campObj.wp
    } else {
      campTypeObj = {}
    }
    if (campObj.hasOwnProperty('global')) {
      // Merges global data if present
      // campTypeObj.wp = campObj
    }
    // Sets default global session limits if not specified
    if (targetingMsgJson[DISPLAY].wmc == null) {
      // Default web popup session limit
      targetingMsgJson[DISPLAY].wmc = 1
    }

    // Sets default global session limit for web inbox if not specified
    if (targetingMsgJson[DISPLAY].wimc == null) {
      // Default web inbox session limit
      targetingMsgJson[DISPLAY].wimc = 1
    }

    const capSettings = extractFrequencyCappingSettings(targetingMsgJson)

    // Session-level capping: Checks if campaign exceeds session limits
    const sessionObj = checkSessionCapping(campTypeObj, campaignId, targetingMsgJson, capSettings)
    if (sessionObj === false) return false

    // Daily-level capping: Checks if campaign exceeds daily limits
    const dailyObj = checkDailyCapping(campTypeObj, campaignId, today, capSettings)
    if (dailyObj === false) return false

    // Global-level capping: Checks lifetime limit for the campaign
    const globalObj = checkGlobalCapping(campTypeObj, campaignId, capSettings.campaignTotalLimit)
    if (globalObj === false) return false

    // Handles delay in displaying the campaign
    const displayObj = targetingMsgJson.display
    if (displayObj.delay != null && displayObj.delay > 0) {
      const delay = displayObj.delay
      // Resets delay to prevent re-triggering
      displayObj.delay = 0
      setTimeout(_trRef, delay * 1000, CampaignContext.msg, {
        device: CampaignContext.device,
        session: CampaignContext.session,
        request: CampaignContext.request,
        logger: logger,
        instanceManager: CampaignContext.instanceManager,
        instance: CampaignContext.instance
      })
      // Delays execution, skips immediate rendering
      return false
    }

    // Increments counters for session, daily, and global objects
    incrCount(sessionObj, campaignId, capSettings.excludeFromFreqCaps)
    incrCount(dailyObj, campaignId, capSettings.excludeFromFreqCaps)
    incrCount(globalObj, campaignId, capSettings.excludeFromFreqCaps)

    // Determines storage key based on campaign type (web popup or inbox)
    let campKey
    if (targetingMsgJson[DISPLAY].wtarget_type === 3) {
      campKey = 'wi'
    }
    if (campKey === 'wi') {
    // Updates campaign object with new counts and saves to storage
      const newCampObj = {}
      newCampObj[CampaignContext.session.sessionId] = sessionObj
      newCampObj[today] = dailyObj
      newCampObj[GLOBAL] = globalObj
      // Save CAMP to localstorage here
      saveCampaignObject({ [campKey]: newCampObj })
    } else {
    /* For Web Native Display and Web Popup */
      addDeliveryPreferenceDetails(targetingMsgJson, logger)
    }
  }
}
