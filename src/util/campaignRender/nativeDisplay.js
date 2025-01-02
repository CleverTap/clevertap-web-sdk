import { CTWebPersonalisationBanner } from '../web-personalisation/banner'
import { CTWebPersonalisationCarousel } from '../web-personalisation/carousel'

export const renderPersonalisationBanner = (targetingMsgJson) => {
  console.log('renderPersonalisationBanner', targetingMsgJson)
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
  console.log('renderPersonalisationCarousel', targetingMsgJson)
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
  console.log('targetingMsgJson', targetingMsgJson)
  const divId = targetingMsgJson.display.divId
  const html = targetingMsgJson.display.html
  const isPreview = targetingMsgJson.display.preview

  if (isPreview) {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://web-push-automation.vercel.app/?region=sk1&accountId=844-R9K-896Z'
    iframe.width = '100%'
    iframe.height = '500px'
    iframe.sandbox = 'allow-scripts allow-popups allow-popups-to-escape-sandbox'
    iframe.id = 'wiz-custom-html-preview'
    const divSelector = targetingMsgJson.display.divSelector
    const containerElement = document.querySelector(divSelector)
    console.log('containerElement', containerElement)
    console.log('iframe', iframe)
    containerElement.innerHTML = ''
    containerElement.appendChild(iframe)
  }

  if (!divId || !html) {
    return
  }

  let notificationViewed = false
  const payload = {
    msgId: targetingMsgJson.wzrk_id,
    pivotId: targetingMsgJson.wzrk_pivot
  }

  const processElement = (element) => {
    if (element) {
      element.outerHTML = html
    }
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
        processElement(retryElement)
        clearInterval(intervalId)
      } else if (++count >= 20) {
        console.log(`No element present on DOM with divId '${divId}'.`)
        clearInterval(intervalId)
      }
    }, 500)
  }
  tryFindingElement(divId)
}

export const handleJson = (targetingMsgJson) => {
  const inaObj = {}
  inaObj.msgId = targetingMsgJson.wzrk_id
  if (targetingMsgJson.wzrk_pivot) {
    inaObj.pivotId = targetingMsgJson.wzrk_pivot
  }
  if (targetingMsgJson.display.json != null) {
    inaObj.json = targetingMsgJson.msgContent.json
  }
  const jsonEvent = new CustomEvent('CT_web_native_display_json', { detail: inaObj })
  document.dispatchEvent(jsonEvent)
}
