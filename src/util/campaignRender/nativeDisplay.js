import { CUSTOM_EVENT_KEYS, CUSTOM_EVENTS_CAMPAIGN_SOURCES } from '../constants'
import { CTWebPersonalisationBanner } from '../web-personalisation/banner'
import { CTWebPersonalisationCarousel } from '../web-personalisation/carousel'

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

  const divId = display.divId || {}
  const details = display.details[0]
  const html = details.html

  if (!divId || !html) {
    logger.error('No div Id or no html found')
    return
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
        logger.log(`No element present on DOM with divId '${divId}'.`)
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
  const jsonEvent = new CustomEvent(CUSTOM_EVENT_KEYS.WEB_NATIVE_DISPLAY, {
    detail: {
      campaignDetails: inaObj, campaignSource: CUSTOM_EVENTS_CAMPAIGN_SOURCES.JSON
    }
  })
  document.dispatchEvent(jsonEvent)
}
