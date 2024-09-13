import { CSS_PATH, OVERLAY_PATH } from './builder_constants'
import { updateFormData } from './dataUpdate'

export const checkBuilder = (logger, accountId) => {
  const search = window.location.search
  const parentWindow = window.opener

  if (search === '?ctBuilder') {
    // open in visual builder mode
    logger.debug('open in visual builder mode')
    window.addEventListener('message', handleMessageEvent, false)
    if (parentWindow) {
      parentWindow.postMessage({ message: 'builder', originUrl: window.location.href }, '*')
    }
    return
  }
  if (search === '?ctBuilderPreview') {
    window.addEventListener('message', handleMessageEvent, false)
    if (parentWindow) {
      parentWindow.postMessage({ message: 'preview', originUrl: window.location.href }, '*')
    }
  }

  if (search === '?ctBuilderSDKCheck') {
    if (parentWindow) {
      parentWindow.postMessage({
        message: 'SDKVersion',
        accountId,
        originUrl: window.location.href,
        sdkVersion: '$$PACKAGE_VERSION$$'
      },
      '*'
      )
    }
  }
}

const handleMessageEvent = (event) => {
  if (event.data && isValidUrl(event.data.originUrl)) {
    const msgOrigin = new URL(event.data.originUrl).origin
    if (event.origin !== msgOrigin) {
      return
    }
  } else {
    return
  }
  if (event.data.message === 'Dashboard') {
    initialiseCTBuilder(event.data.url, event.data.variant ?? null, event.data.details ?? {})
  } else if (event.data.message === 'Overlay') {
    renderVisualBuilder(event.data, true)
  }
}
/**
 * Initializes the Clevertap builder.
 * @param {string} url - The URL to initialize the builder.
 * @param {string} variant - The variant of the builder.
 * @param {Object} details - The details object.
 */
const initialiseCTBuilder = (url, variant, details) => {
  if (document.readyState === 'complete') {
    onContentLoad(url, variant, details)
  } else {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        onContentLoad(url, variant, details)
      }
    })
  }
}

let container
let contentLoaded = false
let isShopify = false
/**
 * Handles content load for Clevertap builder.
 */
function onContentLoad (url, variant, details) {
  if (!contentLoaded) {
    if (window.Shopify) {
      isShopify = true
    }
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    document.documentElement.innerHTML = ''
    container = document.createElement('div')
    container.id = 'overlayDiv'
    container.style.position = 'relative' // Ensure relative positioning for absolute positioning of form
    container.style.display = 'flex'
    document.body.appendChild(container)
    const overlayPath = OVERLAY_PATH
    loadOverlayScript(overlayPath, url, variant, details)
      .then(() => {
        console.log('Overlay script loaded successfully.')
        contentLoaded = true
      })
      .catch((error) => {
        console.error('Error loading overlay script:', error)
      })
    loadCSS()
  }
}

/**
 * Loads CSS file.
 */
function loadCSS () {
  var link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = CSS_PATH
  document.head.appendChild(link)
}

/**
 * Loads the overlay script.
 * @param {string} overlayPath - The path to overlay script.
 * @param {string} url - The URL.
 * @param {string} variant - The variant.
 * @param {Object} details - The details object.
 * @returns {Promise} A promise.
 */
function loadOverlayScript (overlayPath, url, variant, details) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script')
    script.type = 'module'
    script.src = overlayPath
    script.onload = function () {
      if (typeof window.Overlay === 'function') {
        window.Overlay({ id: '#overlayDiv', url, variant, details, isShopify })
        resolve()
      } else {
        reject(new Error('ContentLayout not found in overlay.js'))
      }
    }
    script.onerror = function (error) {
      reject(error)
    }
    document.head.appendChild(script)
  })
}

/**
 * Renders the visual builder.
 * @param {Object} targetingMsgJson - The point and click campaign JSON object.
 * @param {boolean} isPreview - Indicates if it's a preview.
 */
export const renderVisualBuilder = (targetingMsgJson, isPreview) => {
  const details = isPreview ? targetingMsgJson.details[0] : targetingMsgJson.display.details[0]
  const siteUrl = Object.keys(details)[0]
  const selectors = details[siteUrl]
  let elementDisplayed = false

  if (siteUrl !== window.location.href.split('?')[0]) return

  const processElement = (element, selector) => {
    if (selectors[selector].html) {
      element.outerHTML = selectors[selector].html
    } else if (selectors[selector].json) {
      dispatchJsonData(targetingMsgJson, selectors[selector])
    } else {
      updateFormData(element, selectors[selector].form)
    }
  }

  const tryFindingElement = (selector) => {
    let count = 0
    const intervalId = setInterval(() => {
      const retryElement = document.querySelector(selector)
      if (retryElement) {
        processElement(retryElement, selector)
        clearInterval(intervalId)
      } else if (++count >= 20) {
        console.log(`No element present on DOM with selector '${selector}'.`)
        clearInterval(intervalId)
      }
    }, 500)
  }

  Object.keys(selectors).forEach(selector => {
    const element = document.querySelector(selector)
    if (element) {
      processElement(element, selector)
      elementDisplayed = true
    } else {
      tryFindingElement(selector)
    }
  })

  if (elementDisplayed && !isPreview) {
    window.clevertap.renderNotificationViewed({
      msgId: targetingMsgJson.wzrk_id,
      pivotId: targetingMsgJson.wzrk_pivot
    })
  }
}

/**
 * Dispatches JSON data.
 * @param {Object} targetingMsgJson - The point and click campaign JSON object.
 * @param {Object} selector - The selector object.
 */
function dispatchJsonData (targetingMsgJson, selector) {
  const inaObj = {}
  inaObj.msgId = targetingMsgJson.wzrk_id
  if (targetingMsgJson.wzrk_pivot) {
    inaObj.pivotId = targetingMsgJson.wzrk_pivot
  }
  if (selector.json != null) {
    inaObj.json = selector.json
  }
  const kvPairsEvent = new CustomEvent('CT_web_native_display_buider', { detail: inaObj })
  document.dispatchEvent(kvPairsEvent)
}

function isValidUrl (string) {
  try {
    const url = new URL(string)
    return Boolean(url)
  } catch (_err) {
    return false
  }
}
