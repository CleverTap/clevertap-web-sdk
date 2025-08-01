import { CUSTOM_HTML_PREVIEW, WEB_NATIVE_TEMPLATES } from '../constants'
import { CTWebPersonalisationBanner } from '../web-personalisation/banner'
import { CTWebPersonalisationCarousel } from '../web-personalisation/carousel'

import { addScriptTo, appendScriptForCustomEvent } from '../campaignRender/utilities'
import { WVE_URL_ORIGIN } from '../../modules/visualBuilder/builder_constants'
import { commonCampaignUtils } from '../../util/campaignHouseKeeping/commonCampaignUtils'
import { Logger } from '../../../src/modules/logger'

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
  commonCampaignUtils.doCampHouseKeeping(targetingMsgJson, Logger.getInstance())
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
  commonCampaignUtils.doCampHouseKeeping(targetingMsgJson, Logger.getInstance())
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

  const kvPairsEvent = new CustomEvent('CT_web_native_display', { detail: inaObj })
  document.dispatchEvent(kvPairsEvent)
  commonCampaignUtils.doCampHouseKeeping(targetingMsgJson, Logger.getInstance())
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
        retryElement.innerHTML = html
        const wrapper = document.createElement('div')
        wrapper.innerHTML = html
        const scripts = wrapper.querySelectorAll('script')
        scripts.forEach((script) => {
          addScriptTo(script)
        })
        commonCampaignUtils.doCampHouseKeeping(targetingMsgJson, Logger.getInstance())
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

  const jsonEvent = new CustomEvent('CT_web_native_display_json', { detail: inaObj })
  document.dispatchEvent(jsonEvent)
  commonCampaignUtils.doCampHouseKeeping(targetingMsgJson, Logger.getInstance())
}

function handleCustomHtmlPreviewPostMessageEvent (event, logger) {
  if (!event.origin.endsWith(WVE_URL_ORIGIN.CLEVERTAP)) {
    return
  }
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

export const renderWebNativeDisplayBanner = (targetNotif, logger, arrInAppNotifs) => {
  let count = 0
  const intervalId = setInterval(() => {
    const element = targetNotif.display.divId ? document.getElementById(targetNotif.display.divId) : document.querySelector(targetNotif.display.divSelector)
    if (element !== null) {
      targetNotif.msgContent.type === WEB_NATIVE_TEMPLATES.BANNER ? renderPersonalisationBanner(targetNotif) : renderPersonalisationCarousel(targetNotif)
      clearInterval(intervalId)
    } else if (++count >= 20) {
      logger.debug(`No element present on DOM with selector '${targetNotif.display.divId || targetNotif.display.divSelector}'.`)
      arrInAppNotifs[targetNotif.wzrk_id.split('_')[0]] = targetNotif // Add targetNotif to object
      clearInterval(intervalId)
    }
  }, 500)
}
