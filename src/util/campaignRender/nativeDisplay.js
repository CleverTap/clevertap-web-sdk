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
  const kvPairsEvent = new CustomEvent('CT_web_native_display', { detail: inaObj })
  document.dispatchEvent(kvPairsEvent)
}

export const renderCustomHtml = (targetingMsgJson) => {
  const { display, wzrk_id: wzrkId, wzrk_pivot: wzrkPivot } = targetingMsgJson || {}

  const { divId } = display || {}
  const details = display.details[0]
  const html = details.html

  if (!divId || !html) {
    console.error('No div Id or no html found')
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
        processElement(retryElement, html)
        clearInterval(intervalId)
      } else if (++count >= 20) {
        console.log(`No element present on DOM with divId '${divId}'.`)
        clearInterval(intervalId)
      }
    }, 500)
  }

  tryFindingElement(divId)
}

const processElement = (element, html) => {
  if (element) {
    element.outerHTML = html
  }
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
}

export const checkCustomHtmlNativeDisplayPreview = (logger) => {
  const searchParams = new URLSearchParams(window.location.search)
  const ctType = searchParams.get('ctActionMode')
  if (ctType) {
    const parentWindow = window.opener
    switch (ctType) {
      case 'ctCustomHtmlPreview':
        if (parentWindow) {
          parentWindow.postMessage('asdasda', '*')
          window.addEventListener('message', (event) => {
            const eventData = JSON.parse(event.data)
            const inAppNotifs = eventData.inapp_notifs
            const msgContent = inAppNotifs[0].msgContent
            if (eventData && msgContent.templateType === 'custom-html' && msgContent.type === 5) {
              renderCustomHtml(inAppNotifs[0])
            }
          }, false)
        }
        break
      default:
        break
    }
  }
}
