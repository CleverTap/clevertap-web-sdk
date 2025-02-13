import { getCampaignObject, saveCampaignObject, closeIframe } from '../clevertap'
import { CAMP_COOKIE_G, GCOOKIE_NAME, EV_COOKIE, WZRK_ID, NOTIFICATION_VIEWED } from '../constants'
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
          const guidCampObj = JSON.parse(decodeURIComponent(StorageManager.read(CAMP_COOKIE_G)))
          const guid = JSON.parse(decodeURIComponent(StorageManager.read(GCOOKIE_NAME)))
          if (guidCampObj[guid] && guidCampObj[guid][campType] && guidCampObj[guid][campType][staledata[idx]]) {
            delete guidCampObj[guid][campType][staledata[idx]]
            StorageManager.save(CAMP_COOKIE_G, encodeURIComponent(JSON.stringify(guidCampObj)))
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

export const setupClickEvent = (onClick, targetingMsgJson, contentDiv, divId, isLegacy, _device, _session) => {
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
          const rValue = targetingMsgJson.display.preview ? targetingMsgJson.display.onClick : new URL(targetingMsgJson.display.onClick).searchParams.get('r')
          const campaignId = targetingMsgJson.wzrk_id.split('_')[0]

          if (rValue === 'pushPrompt') {
            if (!targetingMsgJson.display.preview) {
              window.parent.clevertap.renderNotificationClicked({ msgId: targetingMsgJson.wzrk_id, pivotId: targetingMsgJson.wzrk_pivot })
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
                window.parent.clevertap.renderNotificationClicked({ msgId: targetingMsgJson.wzrk_id, pivotId: targetingMsgJson.wzrk_pivot })
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
  return '&t=wc&d=' + encodeURIComponent(compressToBase64(gcookie + '|' + scookieObj.p + '|' + scookieObj.s))
}

/**
   * Groups campaigns by their target identifiers.
   *
   * @param {Array<Object>} campaigns - The list of campaign objects.
   * @returns {Object<string, Array<Object>>} - An object grouping campaigns by their respective keys.
   */
export function groupCampaignsByTargets (campaigns) {
  const grouped = {}

  for (const campaign of campaigns) {
    if (!isValidCampaign(campaign)) continue

    // TODO: Remove this priority assignment in production
    campaign.display.priority = generateRandomPriority()

    const key = getCampaignKey(campaign)
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(campaign)
  }

  return grouped
}

/**
   * Validates whether the given campaign object is valid.
   *
   * @param {Object} campaign - The campaign object to validate.
   * @returns {boolean} - True if valid, false otherwise.
   */
function isValidCampaign (campaign) {
  return Boolean(campaign && campaign.display)
}

/**
   * Generates a random priority value.
   *
   * @returns {number} - A random integer between 0 and 99.
   */
function generateRandomPriority () {
  return Math.floor(Math.random() * 100)
}

/**
   * Extracts the appropriate key for grouping a campaign.
   *
   * @param {Object} campaign - The campaign object.
   * @returns {string} - The determined key for grouping.
   */
function getCampaignKey (campaign) {
  if (campaign.display?.divId) {
    return campaign.display.divId.trim()
  }
  if (campaign.display?.divSelector) {
    return campaign.display.divSelector.trim()
  }
  const details = campaign.display.details
  if (Array.isArray(details) && details.length > 0) {
    const selectorData = details[0].selectorData
    if (Array.isArray(selectorData) && selectorData.length > 0 && selectorData[0].selector) {
      return selectorData[0].selector.trim()
    }
  }
  return `key-${campaign.wzrk_id}` // Fallback unique key
}

// export function getListOfTopCampaigns (campaigns) {
//   const listOfTopCampaigns = []
//   for (const key in campaigns) {
//     const currentList = campaigns[key]

//     let maxPriority = -1
//     let campaignWithTopPriority = {}
//     for (const item in currentList) {
//       if (maxPriority < currentList[item].display.priority) {
//         maxPriority = currentList[item].display.priority
//         campaignWithTopPriority = currentList[item]
//       } else if (currentList[item]?.msgContent?.templateType === 'custom-key-values') {
//         /* Pushing all KV Campaigns to the final list as they do not need to be eliminated based on priority */
//         listOfTopCampaigns.push(currentList[item])
//       }
//     }
//     listOfTopCampaigns.push(campaignWithTopPriority)
//   }
//   return listOfTopCampaigns
// }

/**
 * Retrieves a list of top-priority campaigns from grouped campaigns.
 *
 * @param {Object<string, Array<Object>>} campaigns - The grouped campaigns object.
 * @returns {Array<Object>} - The list of top-priority campaigns.
 */
export function getListOfTopCampaigns (campaigns, logger) {
  const listOfTopCampaigns = []

  for (const key in campaigns) {
    const currentList = campaigns[key]
    if (!Array.isArray(currentList) || currentList.length === 0) continue

    let maxPriority = -1
    let campaignWithTopPriority = {}

    for (const item of currentList) {
      /*
        * If the grouped list has size one just add it to the final list,
        * * This can happen for the Campaigns where the selector is targetted by only one Campaign and also for Custom Key Value Campaigns
        * * Because they will always be single campaign group as seen in Function `getCampaignKey`
        * If the grouped list has many campaigns then pick the one with highest priority
        * In the grouped campaign if it is a json campaign
      */
      if (currentList.length === 1) {
        campaignWithTopPriority = item
        continue
      } else if (item.display.priority > maxPriority) {
        maxPriority = item.display.priority
        campaignWithTopPriority = item
      }
    }

    if (Object.keys(campaignWithTopPriority).length > 0) {
      listOfTopCampaigns.push(campaignWithTopPriority)
    }
  }

  return listOfTopCampaigns
}
