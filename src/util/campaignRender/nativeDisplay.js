import { CTWebPersonalisationBanner } from '../web-personalisation/banner'
import { CTWebPersonalisationCarousel } from '../web-personalisation/carousel'

export const processNativeDisplayArr = (arrInAppNotifs) => {
  Object.keys(arrInAppNotifs).map(key => {
    var elementId, id
    if (arrInAppNotifs[key].display.divId) {
      elementId = arrInAppNotifs[key].display.divId
      id = document.getElementById(elementId)
    } else {
      elementId = arrInAppNotifs[key].display.divSelector
      id = document.querySelector(elementId)
    }
    if (id !== null) {
      arrInAppNotifs[key].msgContent.type === 2 ? renderPersonalisationBanner(arrInAppNotifs[key]) : renderPersonalisationCarousel(arrInAppNotifs[key])
      delete arrInAppNotifs[key]
    }
  })
}

// Native Display KV pair
export const nativeDisplayKV = (targetingMsgJson) => {
  const displayObj = targetingMsgJson.display
  if (displayObj.wtarget_type === 2 && targetingMsgJson.msgContent.type === 1) { // Handling Web Native display
    // Logic for kv pair data
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
}

// Native Display Banner rendering logic
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

// Native Display Carousel rendering logic
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
