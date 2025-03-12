import { CUSTOM_EVENT_KEYS, CUSTOM_EVENTS_CAMPAIGN_SOURCES, CUSTOM_HTML_PREVIEW } from '../constants'
import { CTWebPersonalisationBanner } from '../web-personalisation/banner'
import { CTWebPersonalisationCarousel } from '../web-personalisation/carousel'

import { appendScriptForCustomEvent } from '../campaignRender/utilities'

export const renderPersonalisationBanner = (targetingMsgJson) => {
  if (customElements.get('ct-web-personalisation-banner') === undefined) {
    customElements.define('ct-web-personalisation-banner', CTWebPersonalisationBanner)
  }
  const divId = targetingMsgJson.display.divId ?? targetingMsgJson.display.divSelector
  const bannerEl = document.createElement('ct-web-personalisation-banner')
  bannerEl.msgId = targetingMsgJson.wzrk_id
  bannerEl.pivotId = targetingMsgJson.wzrk_pivot
  bannerEl.divHeight = targetingMsgJson.display.divHeight
  bannerEl.details = targetingMsgJson.display.details[0]
  const containerEl = targetingMsgJson.display.divId ? document.getElementById(divId) : document.querySelector(divId)
  containerEl.innerHTML = ''
  containerEl.appendChild(bannerEl)
}

export const renderPersonalisationCarousel = (targetingMsgJson) => {
  if (customElements.get('ct-web-personalisation-carousel') === undefined) {
    customElements.define('ct-web-personalisation-carousel', CTWebPersonalisationCarousel)
  }
  const divId = targetingMsgJson.display.divId ?? targetingMsgJson.display.divSelector
  const carousel = document.createElement('ct-web-personalisation-carousel')
  carousel.target = targetingMsgJson
  const container = targetingMsgJson.display.divId ? document.getElementById(divId) : document.querySelector(divId)
  container.innerHTML = ''
  container.appendChild(carousel)
}

export const handleKVpairCampaign = (targetingMsgJson) => {
  const inaObj = {}
  inaObj.msgId = targetingMsgJson.wzrk_id
  if (targetingMsgJson.wzrk_pivot) {
    inaObj.pivotId = targetingMsgJson.wzrk_pivot
  }
  if (targetingMsgJson.msgContent.kv != null) {
    inaObj.kv = targetingMsgJson.msgContent.kv
  }

  // TODO: For Backwards compatibility, Need to announce and plan Deprecation of this event structure
  const kvPairsEventOld = new CustomEvent('CT_web_native_display', { detail: inaObj })
  document.dispatchEvent(kvPairsEventOld)

  // combine all events from web native display under single event and add type
  const kvPairsEvent = new CustomEvent(CUSTOM_EVENT_KEYS.WEB_NATIVE_DISPLAY, {
    detail: {
      campaignDetails: inaObj, campaignSource: CUSTOM_EVENTS_CAMPAIGN_SOURCES.KV_PAIR
    }
  })
  document.dispatchEvent(kvPairsEvent)
}

export const renderCustomHtml = (targetingMsgJson, logger) => {
  const { display, wzrk_id: wzrkId, wzrk_pivot: wzrkPivot } = targetingMsgJson || {}

  const { divId } = display || {}
  const details = display.details[0]
  let html = details.html

  if (!divId || !html) {
    logger.error('No div Id or no html found')
    return
  }

  if (display['custom-html-click-track']) {
    html = appendScriptForCustomEvent(targetingMsgJson, html)
  }

  let notificationViewed = false
  const payload = {
    msgId: wzrkId,
    pivotId: wzrkPivot
  }

  const raiseViewed = () => {
    if (!notificationViewed) {
      notificationViewed = true
      window.clevertap.renderNotificationViewed(payload)
    }
  }

  const tryFindingElement = (divId) => {
    let count = 0
    const intervalId = setInterval(() => {
      const retryElement = document.querySelector(divId)
      if (retryElement) {
        raiseViewed()
        retryElement.outerHTML = html
        clearInterval(intervalId)
      } else if (++count >= 20) {
        logger.error(`No element present on DOM with divId '${divId}'.`)
        clearInterval(intervalId)
      }
    }, 500)
  }

  tryFindingElement(divId)
}

export const handleJson = (targetingMsgJson) => {
  const inaObj = {}
  inaObj.msgId = targetingMsgJson.wzrk_id
  const details = targetingMsgJson.display.details[0]
  const json = details.json
  if (targetingMsgJson.wzrk_pivot) {
    inaObj.pivotId = targetingMsgJson.wzrk_pivot
  }
  if (targetingMsgJson.display.json != null) {
    inaObj.json = json
  }

  // TODO: For Backwards compatibility, Need to announce and plan Deprecation of this event structure
  const jsonEventOld = new CustomEvent('CT_web_native_display_json', { detail: inaObj })
  document.dispatchEvent(jsonEventOld)

  const jsonEvent = new CustomEvent(CUSTOM_EVENT_KEYS.WEB_NATIVE_DISPLAY, {
    detail: {
      campaignDetails: inaObj, campaignSource: CUSTOM_EVENTS_CAMPAIGN_SOURCES.JSON
    }
  })
  document.dispatchEvent(jsonEvent)
}

function handleCustomHtmlPreviewPostMessageEvent (event, logger) {
  const eventData = JSON.parse(event.data)
  const inAppNotifs = eventData.inapp_notifs
  const msgContent = inAppNotifs[0].msgContent
  if (eventData && msgContent && msgContent.templateType === 'custom-html' && msgContent.type === 5) {
    renderCustomHtml(inAppNotifs[0], logger)
  }
}

export const checkCustomHtmlNativeDisplayPreview = (logger) => {
  const searchParams = new URLSearchParams(window.location.search)
  const ctType = searchParams.get('ctActionMode')
  if (ctType) {
    const parentWindow = window.opener
    switch (ctType) {
      case CUSTOM_HTML_PREVIEW:
        if (parentWindow) {
          parentWindow.postMessage('ready', '*')
          const eventHandler = (event) => handleCustomHtmlPreviewPostMessageEvent(event, logger)
          window.addEventListener('message', eventHandler, false)
        }
        break
      default:
        logger.debug(`unknown query param ${ctType}`)
        break
    }
  }
}
