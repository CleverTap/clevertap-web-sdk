import {
  getCampaignObject,
  saveCampaignObject,
  closeIframe
} from '../clevertap'
import {
  CAMP_COOKIE_G,
  GCOOKIE_NAME,
  EV_COOKIE,
  WZRK_ID,
  NOTIFICATION_VIEWED,
  WEB_NATIVE_TEMPLATES,
  WEB_NATIVE_DISPLAY_VISUAL_EDITOR_TYPES,
  QUALIFIED_CAMPAIGNS
} from '../constants'
import { StorageManager, $ct } from '../storage'
import RequestDispatcher from '../requestDispatcher'
import { compressToBase64 } from '../encoder'

export const invokeExternalJs = (jsFunc, targetingMsgJson) => {
  const func = window.parent[jsFunc]
  if (typeof func === 'function') {
    if (targetingMsgJson.display.kv != null) {
      func(targetingMsgJson.display.kv)
    } else {
      func()
    }
  }
}

export const appendScriptForCustomEvent = (targetingMsgJson, html) => {
  const script = `<script>
      const ct__camapignId = '${targetingMsgJson.wzrk_id}';
      const ct__formatVal = (v) => {
          return v && v.trim().substring(0, 20);
      }
      const ct__parentOrigin =  window.parent.origin;
      document.body.addEventListener('click', (event) => {
        const elem = event.target.closest?.('a[wzrk_c2a], button[wzrk_c2a]');
        if (elem) {
            const {innerText, id, name, value, href} = elem;
            const clickAttr = elem.getAttribute('onclick') || elem.getAttribute('click');
            const onclickURL = clickAttr?.match(/(window.open)[(\](\"|')(.*)(\"|',)/)?.[3] || clickAttr?.match(/(location.href *= *)(\"|')(.*)(\"|')/)?.[3];
            const props = {innerText, id, name, value};
            let msgCTkv = Object.keys(props).reduce((acc, c) => {
                const formattedVal = ct__formatVal(props[c]);
                formattedVal && (acc['wzrk_click_' + c] = formattedVal);
                return acc;
            }, {});
            if(onclickURL) { msgCTkv['wzrk_click_' + 'url'] = onclickURL; }
            if(href) { msgCTkv['wzrk_click_' + 'c2a'] = href; }
            const notifData = { msgId: ct__camapignId, msgCTkv, pivotId: '${targetingMsgJson.wzrk_pivot}' };
            window.parent.clevertap.renderNotificationClicked(notifData);
        }
      });
      </script>
    `
  return html.replace(/(<\s*\/\s*body)/, `${script}\n$1`)
}

export const staleDataUpdate = (staledata, campType) => {
  const campObj = getCampaignObject()
  const globalObj = campObj[campType].global
  if (globalObj != null && campType) {
    for (const idx in staledata) {
      if (staledata.hasOwnProperty(idx)) {
        delete globalObj[staledata[idx]]
        if (StorageManager.read(CAMP_COOKIE_G)) {
          const guidCampObj = JSON.parse(
            decodeURIComponent(StorageManager.read(CAMP_COOKIE_G))
          )
          const guid = JSON.parse(
            decodeURIComponent(StorageManager.read(GCOOKIE_NAME))
          )
          if (
            guidCampObj[guid] &&
            guidCampObj[guid][campType] &&
            guidCampObj[guid][campType][staledata[idx]]
          ) {
            delete guidCampObj[guid][campType][staledata[idx]]
            StorageManager.save(
              CAMP_COOKIE_G,
              encodeURIComponent(JSON.stringify(guidCampObj))
            )
          }
        }
      }
    }
  }
  saveCampaignObject(campObj)
}

export const mergeEventMap = (newEvtMap) => {
  if ($ct.globalEventsMap == null) {
    $ct.globalEventsMap = StorageManager.readFromLSorCookie(EV_COOKIE)
    if ($ct.globalEventsMap == null) {
      $ct.globalEventsMap = newEvtMap
      return
    }
  }
  for (const key in newEvtMap) {
    if (newEvtMap.hasOwnProperty(key)) {
      const oldEvtObj = $ct.globalEventsMap[key]
      const newEvtObj = newEvtMap[key]
      if ($ct.globalEventsMap[key] != null) {
        if (newEvtObj[0] != null && newEvtObj[0] > oldEvtObj[0]) {
          $ct.globalEventsMap[key] = newEvtObj
        }
      } else {
        $ct.globalEventsMap[key] = newEvtObj
      }
    }
  }
}

export const incrementImpression = (targetingMsgJson, _request) => {
  const data = {}
  data.type = 'event'
  data.evtName = NOTIFICATION_VIEWED
  data.evtData = { [WZRK_ID]: targetingMsgJson.wzrk_id }
  if (targetingMsgJson.wzrk_pivot) {
    data.evtData = { ...data.evtData, wzrk_pivot: targetingMsgJson.wzrk_pivot }
  }
  _request.processEvent(data)
}

export const setupClickEvent = (
  onClick,
  targetingMsgJson,
  contentDiv,
  divId,
  isLegacy,
  _device,
  _session
) => {
  if (onClick !== '' && onClick != null) {
    let ctaElement
    let jsCTAElements
    if (isLegacy) {
      ctaElement = contentDiv
    } else if (contentDiv !== null) {
      jsCTAElements = contentDiv.getElementsByClassName('jsCT_CTA')
      if (jsCTAElements != null && jsCTAElements.length === 1) {
        ctaElement = jsCTAElements[0]
      }
    }
    const jsFunc = targetingMsgJson.display.jsFunc
    const isPreview = targetingMsgJson.display.preview
    if (isPreview == null) {
      onClick += getCookieParams(_device, _session)
    }

    if (ctaElement != null) {
      ctaElement.onclick = () => {
        // invoke js function call
        if (jsFunc != null) {
          // track notification clicked event
          if (isPreview == null) {
            RequestDispatcher.fireRequest(onClick)
          }
          invokeExternalJs(jsFunc, targetingMsgJson)
          // close iframe. using -1 for no campaignId
          closeIframe('-1', divId, _session.sessionId)
        } else {
          const rValue = targetingMsgJson.display.preview
            ? targetingMsgJson.display.onClick
            : new URL(targetingMsgJson.display.onClick).searchParams.get('r')
          const campaignId = targetingMsgJson.wzrk_id.split('_')[0]

          if (rValue === 'pushPrompt') {
            if (!targetingMsgJson.display.preview) {
              window.parent.clevertap.renderNotificationClicked({
                msgId: targetingMsgJson.wzrk_id,
                pivotId: targetingMsgJson.wzrk_pivot
              })
            }
            // Open Web Push Soft prompt
            window.clevertap.notifications.push({
              skipDialog: true
            })
            closeIframe(campaignId, divId, _session.sessionId)
          } else if (rValue === 'none') {
            // Close notification
            closeIframe(campaignId, divId, _session.sessionId)
          } else {
            // Will get the url to open
            if (targetingMsgJson.display.window === 1) {
              window.open(onClick, '_blank')
              if (targetingMsgJson.display['close-popup']) {
                closeIframe(campaignId, divId, _session.sessionId)
              }
              if (!targetingMsgJson.display.preview) {
                window.parent.clevertap.renderNotificationClicked({
                  msgId: targetingMsgJson.wzrk_id,
                  pivotId: targetingMsgJson.wzrk_pivot
                })
              }
            } else {
              window.location = onClick
            }
          }
        }
      }
    }
  }
}

export const getCookieParams = (_device, _session) => {
  const gcookie = _device.getGuid()
  const scookieObj = _session.getSessionCookieObject()
  return (
    '&t=wc&d=' +
    encodeURIComponent(
      compressToBase64(gcookie + '|' + scookieObj.p + '|' + scookieObj.s)
    )
  )
}

export const webNativeDisplayCampaignUtils = {
  /**
   * Checks if a campaign triggers a custom event push based on its template type.
   *
   * @param {Object} campaign - The campaign object to evaluate.
   * @returns {boolean} - Returns true if the campaign pushes a custom event, otherwise false.
   */
  doesCampaignPushCustomEvent: (campaign) => {
    return (
      [WEB_NATIVE_TEMPLATES.KV_PAIR, WEB_NATIVE_TEMPLATES.JSON].includes(
        campaign?.msgContent?.type
      ) ||
      (campaign?.msgContent?.type === WEB_NATIVE_TEMPLATES.VISUAL_BUILDER &&
        campaign?.display?.details?.[0]?.selectorData
          ?.map((s) => s?.values?.editor)
          ?.includes(WEB_NATIVE_DISPLAY_VISUAL_EDITOR_TYPES.JSON))
    )
  },

  /**
   * Determines if a campaign mutates the DOM node based on its template type.
   *
   * @param {Object} campaign - The campaign object to evaluate.
   * @returns {boolean} - Returns true if the campaign mutates the DOM node, otherwise false.
   */
  doesCampaignMutateDOMNode: (campaign) => {
    return (
      [
        WEB_NATIVE_TEMPLATES.BANNER,
        WEB_NATIVE_TEMPLATES.CAROUSEL,
        WEB_NATIVE_TEMPLATES.CUSTOM_HTML
      ].includes(campaign?.msgContent?.type) ||
      (WEB_NATIVE_TEMPLATES.VISUAL_BUILDER === campaign?.msgContent?.type &&
        campaign?.display?.details?.[0]?.selectorData?.some((s) =>
          [
            WEB_NATIVE_DISPLAY_VISUAL_EDITOR_TYPES.HTML,
            WEB_NATIVE_DISPLAY_VISUAL_EDITOR_TYPES.FORM
          ].includes(s?.values?.editor)
        ))
    )
  },

  /**
   * Sorts campaigns based on their priority in descending order.
   *
   * @param {Array<Object>} campaigns - The list of campaign objects.
   * @returns {Array<Object>} - A new array of campaigns sorted by priority.
   */
  sortCampaignsByPriority: (campaigns) => {
    return campaigns.sort((a, b) => b.priority - a.priority)
  },

  /**
   * Retrieves the DOM nodes associated with a campaign based on its template type.
   *
   * @param {Object} campaign - The campaign object to extract nodes from.
   * @returns {Array<string>} - An array of DOM node selectors or IDs associated with the campaign.
   */
  getCampaignNodes: (campaign) => {
    const { msgContent, display } = campaign
    const { type } = msgContent

    switch (type) {
      case WEB_NATIVE_TEMPLATES.BANNER:
      case WEB_NATIVE_TEMPLATES.CAROUSEL:
        return [display?.divSelector]

      case WEB_NATIVE_TEMPLATES.CUSTOM_HTML:
        return [display?.divId]

      case WEB_NATIVE_TEMPLATES.VISUAL_BUILDER:
        return (
          display?.details?.[0]?.selectorData
            ?.filter(
              (s) =>
                s?.values?.editor ===
                WEB_NATIVE_DISPLAY_VISUAL_EDITOR_TYPES.HTML
            )
            ?.map((s) => s?.selector) || []
        )

      default:
        return []
    }
  },

  /**
   * Determines whether the current custom event campaign should be skipped based on existing executed targets.
   *
   * @param {Object} targetNotif - The current notification object containing campaign details.
   * @param {ExecutedTargets} executedTargets - An object holding already executed custom events.
   * @returns {boolean} - Returns true if the current custom event campaign should be skipped, false otherwise.
   */
  shouldCurrentCustomEventCampaignBeSkipped (targetNotif, executedTargets) {
    const currentSameTypeCampaigns = executedTargets.customEvents.filter(
      (customEvent) =>
        customEvent.customEventType === targetNotif?.msgContent?.type
    )

    let shouldSkip = false

    // If KV Pair, check for topic and type
    // if visual builder or JSON, just check for the type of event, because we do not have `topic`
    if (currentSameTypeCampaigns?.length) {
      switch (targetNotif?.msgContent?.type) {
        case WEB_NATIVE_TEMPLATES.KV_PAIR:
          if (
            currentSameTypeCampaigns
              .map((c) => c?.eventTopic)
              ?.includes(targetNotif?.display?.kv?.topic)
          ) {
            shouldSkip = true
          }
          break

          /* TODO: Within Visual Editor : Why do we need to select a DOM node for create customEvent
          and can we inform the user the type of event they will receive in the editor
        */
          /* TODO: Can we intro a key for `topic` similar to KV_PAIR in VISUAL_EDITOR & JSON for parity and better UX */
          /* Visual Editor has all the events from different campaigns combined in single JSON within selectorData */
          /* So we can not use Separated Campaigns logic for it, Hence skipping */

        case WEB_NATIVE_TEMPLATES.VISUAL_BUILDER:
        case WEB_NATIVE_TEMPLATES.JSON:
          shouldSkip = true
          break
      }
    }
    return shouldSkip
  }
}

export const deliveryPreferenceUtils = {
  /**
   * Updates a frequency counter object based on the given array.
   * If a key from the array exists in the object, its value is incremented.
   * Otherwise, the key is added with an initial count of 1.
   *
   * @param {string[]} arr - The array of keys to process.
   * @param {Object<string, number>} [obj={}] - The existing frequency counter object (optional).
   * @returns {Object<string, number>} - The updated frequency counter object.
   *
   * @example
   * let freq = updateFrequencyCounter(["a", "b", "c"]);
   * console.log(freq); // { a: 1, b: 1, c: 1 }
   *
   * freq = updateFrequencyCounter(["a", "b"], freq);
   * console.log(freq); // { a: 2, b: 2, c: 1 }
   */
  updateFrequencyCounter (arr, obj = {}) {
    if (!arr || arr.length === 0) {
      return obj
    }

    arr.forEach((key) => {
      obj[key] = (obj[key] || 0) + 1
    })
    return obj
  },

  /**
   * Updates a timestamp tracker object based on the given array of keys.
   * If a key exists, it appends the current timestamp; otherwise, it starts a new array with the timestamp.
   *
   * @param {string[]} arr - The array of keys to process.
   * @param {Object<string, number[]>} [obj={}] - The existing timestamp tracker object (optional).
   * @returns {Object<string, number[]>} - The updated timestamp tracker object.
   *
   * @example
   * let timestamps = updateTimestampTracker(["a", "b", "c"]);
   * console.log(timestamps);
   * // { a: [1712134567], b: [1712134567], c: [1712134567] }
   *
   * timestamps = updateTimestampTracker(["a", "b"], timestamps);
   * console.log(timestamps);
   * // { a: [1712134567, 1712134570], b: [1712134567, 1712134570], c: [1712134567] }
   */
  updateTimestampTracker (arr, obj = {}) {
    if (!arr || arr.length === 0) {
      return obj
    }

    const now = Math.floor(Date.now() / 1000) // Current timestamp in seconds (Epoch UTC)
    arr.forEach((key) => {
      if (!obj[key]) {
        obj[key] = []
      }
      obj[key].push(now)
    })

    return obj
  },

  /**
   * Migrates legacy TLC data to the latest WSC
   * and WFC structures.
   *
   * This function reads from `CAMP.wp`, which stores web popup data keyed by session IDs and global campaign data.
   * Each campaign ID (except for the key `tc`, which is a total count) maps to either:
   * - `1` → campaign was shown once
   * - `'dnd'` → campaign was shown and dismissed (Do Not Disturb)
   *
   * After migrating each campaign's data using `deliveryPreferenceUtils.portCampaignDetails`,
   * the old TLC data (`CAMP.wp`) is cleared from storage.
   *
   * @param {Object} _session - The current session object.
   * @param {string} _session.sessionId - The unique identifier for the session, used to access session-specific campaign data.
   */
  portTLC (_session) {
    // TODO: Add the campaignId keys which has value as `dnd` to the `dnd` array
    const existingCamp = getCampaignObject()
    const dnd = []

    /* If no campaigns are present, then we don't need to port anything */
    if (!existingCamp?.wp || Object.keys(existingCamp?.wp).length === 0) {
      return
    }

    const webPopupGlobalDetails = existingCamp?.wp?.global || {}
    const webPopupSessionDetails = existingCamp?.wp?.[_session.sessionId] || {}
    const campaignIds = Object.keys(webPopupGlobalDetails)

    for (const campaignId of campaignIds) {
      if (campaignId !== 'tc') {
        const globalCampaignCount = webPopupGlobalDetails[campaignId]
        const sessionCampaignCount = webPopupSessionDetails[campaignId]
        if (sessionCampaignCount === 'dnd') {
          dnd.push(campaignId)
        }
        const updatedCamp = deliveryPreferenceUtils.portCampaignDetails(
          campaignId,
          sessionCampaignCount,
          globalCampaignCount
        )
        saveCampaignObject(updatedCamp)
      }
    }

    const updatedCamp = getCampaignObject()
    saveCampaignObject({
      ...updatedCamp,
      dnd: [...new Set([...(updatedCamp.dnd || []), ...dnd])],
      wp: {}
    })
  },

  portCampaignDetails (campaignId, sessionCount, globalCount) {
    /* If we have a dnd count for sesion then we will default its count to globalCount */
    const sCount = sessionCount === 'dnd' ? globalCount : sessionCount
    const campaignObj = getCampaignObject()

    // Ensure campaignObj and campaignObj.wfc exist
    campaignObj.wfc = campaignObj.wfc || {}

    // Fallback to an empty array if campaignObj.wfc[campaignId] is undefined
    const existingTimestamps = Array.isArray(campaignObj.wfc[campaignId])
      ? campaignObj.wfc[campaignId]
      : []

    // Generate new timestamps safely
    let newTimestamps = []
    try {
      newTimestamps = deliveryPreferenceUtils.generateTimestamps(
        globalCount,
        sCount
      )
    } catch (err) {
      console.error('Failed to generate timestamps:', err)
    }

    // Safely update the object
    campaignObj.wfc = {
      ...campaignObj.wfc,
      [campaignId]: [...existingTimestamps, ...newTimestamps]
    }

    /* Or tc can also be used to assign once */
    campaignObj.wsc = (campaignObj?.wsc ?? 0) + globalCount

    return campaignObj
  },

  /**
   * Generates an array of timestamps.
   *
   * - The first `a` timestamps are from the current time, each 1 second apart (now, now - 1s, now - 2s, ...).
   * - The remaining `(b - a)` timestamps are from previous days (now - 1 day, now - 2 days, ...).
   *
   * @param {number} globalCount - Number of recent timestamps with 1-second gaps.
   * @param {number} sessionCount - Total number of timestamps to generate.
   * @returns {number[]} Array of timestamps in milliseconds since the Unix epoch.
   */
  generateTimestamps (globalCount, sessionCount) {
    try {
      const now = Math.floor(Date.now() / 1000)
      const oneDay = 24 * 60 * 60

      // (globalCount - sessionCount) timestamps: today - 1 day + 1ms, today - 1 day + 2ms, ...
      const pastDays = Array.from(
        { length: globalCount - sessionCount },
        (_, i) => now - oneDay + (i + 1)
      )

      // a timestamps: today, today + 1ms, today + 2ms, ...
      const recentMs = Array.from({ length: sessionCount }, (_, i) => now + i + 1)

      return [...recentMs, ...pastDays]
    } catch {
      return []
    }
  },

  isPopupCampaignAlreadyShown (campaignId) {
    const campaignObj = getCampaignObject()
    const campaignDetails = campaignObj?.wfc?.[campaignId]
    return campaignDetails?.length > 0
  },

  isCampaignAddedToDND (campaignId) {
    const campaignObj = getCampaignObject()
    return campaignObj?.dnd?.includes(campaignId)
  },

  updateOccurenceForPopupAndNativeDisplay (msg, device, logger) {
    // If the guid is present in CAMP_G retain it instead of using the CAMP
    const globalCamp = JSON.parse(
      decodeURIComponent(StorageManager.read(CAMP_COOKIE_G))
    )
    const currentIdCamp = globalCamp?.[device?.gcookie]
    let campaignObj =
      currentIdCamp || getCampaignObject()
    const woc = deliveryPreferenceUtils.updateFrequencyCounter(msg.wtq, campaignObj.woc)
    const wndoc = deliveryPreferenceUtils.updateFrequencyCounter(msg.wndtq, campaignObj.wndoc)
    // If we are retreiving CAMP_G data, we can not retain details on web inbox as they are only session based.
    const wi = getCampaignObject()?.wi ?? {}
    const wp = getCampaignObject()?.wp ?? {}
    const wsc = getCampaignObject()?.wsc ?? 0
    const wndsc = getCampaignObject()?.wndsc ?? 0

    campaignObj = {
      ...campaignObj,
      woc,
      wndoc,
      wi,
      wp,
      wsc,
      wndsc
    }
    saveCampaignObject(campaignObj)
  },

  /**
   * Gets the daily count for a campaign, automatically resetting to 1 when date changes
   * Date tracking is done in localStorage for persistence across page reloads
   * @param {Object} campaignObj - The campaign object to store count
   * @param {string} dailyCountKey - The key to store the daily count
   * @returns {number} The new daily count (incremented from previous or reset to 1)
   */
  getDailyCount (campaignObj, dailyCountKey) {
    const DATE_TRACKER_KEY = 'ct_daily_date_tracker'
    const today = new Date().toISOString().split('T')[0]
    let storedDate = null
    storedDate = localStorage.getItem(DATE_TRACKER_KEY)

    // Get current count
    const storedCount = typeof campaignObj[dailyCountKey] === 'number'
      ? campaignObj[dailyCountKey]
      : 0

    let newDailyCount

    if (storedDate !== today) {
      newDailyCount = 1
      localStorage.setItem(DATE_TRACKER_KEY, today)
    } else {
      newDailyCount = storedCount + 1
    }
    return newDailyCount
  },

  /**
 * Clears stale campaign entries from the campaign object based on provided message data.
 *
 * @param {Object} msg - Message object containing stale campaign information
 * @param {Array<string>} [msg.native_display_stale] - Array of campaign IDs for native display campaigns to clear
 * @param {Array<string>} [msg.inbox_stale] - Array of campaign IDs for inbox campaigns to clear
 * @param {Object} logger - Logger instance for logging operations
 * @returns {void}
 *
 * @description
 * This function processes stale campaign data and removes corresponding entries:
 * - For inbox_stale campaigns: removes entries from wfc and woc
 * - For native_display_stale campaigns: removes entries from wndfc and wndoc
 *
 * The function retrieves the current campaign object, modifies it by removing
 * stale entries, and saves the updated object back to storage.
 */
  clearStaleCampaigns (msg, logger) {
    try {
      // Get current campaign object
      const campaignObject = getCampaignObject()

      if (!campaignObject) {
        logger.debug('No campaign object found')
        return
      }

      let modified = false

      // Handle inbox_stale campaigns - clear wfc and woc entries
      if (msg.inbox_stale && Array.isArray(msg.inbox_stale)) {
        logger.debug(`Processing ${msg.inbox_stale.length} inbox stale campaigns`)

        for (const campaignId of msg.inbox_stale) {
          // Clear wfc entry
          if (campaignObject.wfc && campaignObject.wfc[campaignId]) {
            delete campaignObject.wfc[campaignId]
            logger.debug(`Cleared wfc entry for campaign ${campaignId}`)
            modified = true
          }

          // Clear woc entry
          if (campaignObject.woc && campaignObject.woc[campaignId]) {
            delete campaignObject.woc[campaignId]
            logger.debug(`Cleared woc entry for campaign ${campaignId}`)
            modified = true
          }
        }
      }

      // Handle native_display_stale campaigns - clear wndfc and wndoc entries
      if (msg.native_display_stale && Array.isArray(msg.native_display_stale)) {
        logger.debug(`Processing ${msg.native_display_stale.length} native display stale campaigns`)

        for (const campaignId of msg.native_display_stale) {
          // Clear wndfc entry
          if (campaignObject.wndfc && campaignObject.wndfc[campaignId]) {
            delete campaignObject.wndfc[campaignId]
            logger.debug(`Cleared wndfc entry for campaign ${campaignId}`)
            modified = true
          }

          // Clear wndoc entry
          if (campaignObject.wndoc && campaignObject.wndoc[campaignId]) {
            delete campaignObject.wndoc[campaignId]
            logger.debug(`Cleared wndoc entry for campaign ${campaignId}`)
            modified = true
          }
        }
      }

      // Save updated campaign object if modifications were made
      if (modified) {
        saveCampaignObject(campaignObject)
        logger.debug('Campaign object updated with stale campaign removals')
      } else {
        logger.debug('No stale campaigns found to clear')
      }
    } catch (error) {
      logger.error('Error clearing stale campaigns:', error)
      throw error
    }
  }

}

export function addScriptTo (script, target = 'body') {
  const targetEl = document.querySelector(target)
  if (!targetEl) return
  const newScript = document.createElement('script')
  newScript.textContent = script.textContent
  if (script.src) newScript.src = script.src
  newScript.async = script.async
  Array.from(script.attributes).forEach((attr) => {
    if (attr.name !== 'src' && attr.name !== 'async') {
      newScript.setAttribute(attr.name, attr.value)
    }
  })
  targetEl.appendChild(newScript)
  script.remove()
}

export function addCampaignToLocalStorage (campaign, region = 'eu1', accountId) {
  /* No Need to store campaigns in local storage in preview mode */
  if (campaign?.display?.preview === true) {
    return
  }

  const campaignId = campaign.wzrk_id.split('_')[0]
  const dashboardUrl = `https://${region}.dashboard.clevertap.com/${accountId}/campaigns/campaign/${campaignId}/report/stats`

  const enrichedCampaign = {
    ...campaign,
    url: dashboardUrl
  }

  const storedData = StorageManager.readFromLSorCookie(QUALIFIED_CAMPAIGNS)
  const existingCampaigns = storedData ? JSON.parse(decodeURIComponent(storedData)) : []

  const isDuplicate = existingCampaigns.some(c => c.wzrk_id === campaign.wzrk_id)

  if (!isDuplicate) {
    const updatedCampaigns = [...existingCampaigns, enrichedCampaign]
    StorageManager.saveToLSorCookie(
      QUALIFIED_CAMPAIGNS,
      encodeURIComponent(JSON.stringify(updatedCampaigns))
    )
  }
}
