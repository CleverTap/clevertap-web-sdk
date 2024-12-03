import { CSS_PATH, OVERLAY_PATH, WVE_CLASS } from './builder_constants'
import { updateFormData, updateElementCSS } from './dataUpdate'

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
      const sdkVersion = '$$PACKAGE_VERSION$$'
      parentWindow.postMessage({
        message: 'SDKVersion',
        accountId,
        originUrl: window.location.href,
        sdkVersion
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
    // handle personalisation
    window.evtMaster = event.data.personalisation.evtMaster
    initialiseCTBuilder(
      event.data.url,
      event.data.variant ?? null,
      event.data.details ?? {},
      event.data.personalisation
    )
  } else if (event.data.message === 'Overlay') {
    renderVisualBuilder(event.data, true)
  }
}
/**
 * Initializes the Clevertap builder.
 * @param {string} url - The URL to initialize the builder.
 * @param {string} variant - The variant of the builder.
 * @param {Object} details - The details object.
 * @param {Object} personalisation - The personalisation object
 */
const initialiseCTBuilder = (url, variant, details, personalisation) => {
  if (document.readyState === 'complete') {
    onContentLoad(url, variant, details, personalisation)
  } else {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        onContentLoad(url, variant, details, personalisation)
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
function onContentLoad (url, variant, details, personalisation) {
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
    loadOverlayScript(overlayPath, url, variant, details, personalisation)
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
 * @param {Object} personalisation
 * @returns {Promise} A promise.
 */
function loadOverlayScript (overlayPath, url, variant, details, personalisation) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script')
    script.type = 'module'
    script.src = overlayPath
    script.onload = function () {
      if (typeof window.Overlay === 'function') {
        window.Overlay({ id: '#overlayDiv', url, variant, details, isShopify, personalisation })
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
  const details = isPreview ? targetingMsgJson.details : targetingMsgJson.display.details
  let notificationViewed = false
  const payload = {
    msgId: targetingMsgJson.wzrk_id,
    pivotId: targetingMsgJson.wzrk_pivot
  }

  const raiseViewed = () => {
    if (!isPreview && !notificationViewed) {
      notificationViewed = true
      window.clevertap.renderNotificationViewed(payload)
    }
  }

  const raiseClicked = (payload) => {
    console.log('clicked')
    window.clevertap.renderNotificationClicked(payload)
  }

  const processElement = (element, selector) => {
    if (selector.elementCSS) {
      updateElementCSS(selector)
    }
    if (selector.isTrackingClicks?.name) {
      element.addEventListener('click', () => {
        const clickedPayload = {
          msgId: targetingMsgJson.wzrk_id,
          pivotId: targetingMsgJson.wzrk_pivot,
          msgCTkv: { wzrk_selector: selector.isTrackingClicks.name }
        }
        raiseClicked(clickedPayload)
      })
    }
    if (selector.values) {
      if (selector.values.html) {
        element.outerHTML = selector.values.html
      } else if (selector.values?.json) {
        dispatchJsonData(targetingMsgJson, selector.values)
      } else {
        payload.msgCTkv = { wzrk_selector: selector.selector }
        updateFormData(element, selector.values.form, payload, isPreview)
      }
    }
  }

  const tryFindingElement = (selector) => {
    let count = 0
    const intervalId = setInterval(() => {
      const retryElement = document.querySelector(selector.selector)
      if (retryElement) {
        raiseViewed()
        processElement(retryElement, selector)
        clearInterval(intervalId)
      } else if (++count >= 20) {
        console.log(`No element present on DOM with selector '${selector}'.`)
        clearInterval(intervalId)
      }
    }, 500)
  }

  details.forEach(d => {
    if (d.url === window.location.href.split('?')[0]) {
      d.selectorData.forEach(s => {
        const element = document.querySelector(s.selector)
        if (element) {
          raiseViewed()
          processElement(element, s)
        } else {
          tryFindingElement(s)
        }
      })
    }
  })
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

export function addAntiFlicker (antiFlicker) {
  const { personalizedSelectors = [], delayTime = 2000 } = antiFlicker
  const retryElements = {} // Track selectors that need retry
  let retryCount = 0 // Counter for retries
  let retryInterval
  function isInViewport (element) {
    const rect = element.getBoundingClientRect()
    const { innerHeight: windowHeight, innerWidth: windowWidth } = window
    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < windowHeight &&
      rect.left < windowWidth
    )
  }
  (function () {
    const styleContent = `
      .wve-anti-flicker-hide {
        opacity: 0 !important;
      }
      .wve-anti-flicker-show {
        transition: opacity 0.5s, filter 0.5s !important;
      }
    `
    // Create and append the style element if it doesn't exist
    const styleId = WVE_CLASS.FLICKER_ID
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.textContent = styleContent
      document.head.appendChild(styleElement)
    }
  })()
  function applyAntiFlicker (selectors) {
    function processSelectors (selectorElements) {
      const elements = []
      selectorElements.forEach(selector => {
        const matchedElements = document.querySelectorAll(selector)
        if (matchedElements.length) {
          matchedElements.forEach(el => {
            if (isInViewport(el)) {
              elements.push(el)
            }
          })
          delete retryElements[selector] // Successfully processed, remove from retry list
        } else {
          retryElements[selector] = false // Add to retry list if not found
        }
      })
      applyStyles(elements)
    }
    function retryProcessing () {
      processSelectors(Object.keys(retryElements))
      retryCount++
      if (Object.keys(retryElements).length === 0 || retryCount > 20) {
        retryCount = 0
        clearInterval(retryInterval)
      }
    }
    processSelectors(selectors)
    if (Object.keys(retryElements).length) {
      retryInterval = setInterval(retryProcessing, 100)
    }
  }
  function applyStyles (elements) {
    elements.forEach(el => el.classList.add(WVE_CLASS.FLICKER_HIDE))
    setTimeout(() => {
      elements.forEach(el => {
        el.classList.remove(WVE_CLASS.FLICKER_HIDE)
        el.classList.add(WVE_CLASS.FLICKER_SHOW)
      })
    }, delayTime) // Apply styles after maxRenderTime
  }
  function observeUrlChange () {
    let previousHref = document.location.href
    const observer = new MutationObserver(() => {
      if (previousHref !== document.location.href) {
        previousHref = document.location.href
        applyAntiFlicker(personalizedSelectors)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }
  window.addEventListener('DOMContentLoaded', () => {
    observeUrlChange()
  })
  applyAntiFlicker(personalizedSelectors)
}
