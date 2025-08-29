import { CSS_PATH, OVERLAY_PATH, WVE_CLASS, WVE_QUERY_PARAMS, WVE_URL_ORIGIN } from './builder_constants'
import { updateFormData, updateElementCSS } from './dataUpdate'
import { addScriptTo } from '../../util/campaignRender/utilities'
import { $ct } from '../../util/storage'

let logger = null

export const handleActionMode = (_logger, accountId) => {
  const searchParams = new URLSearchParams(window.location.search)
  const ctType = searchParams.get('ctActionMode')
  logger = _logger

  if (ctType) {
    const parentWindow = window.opener
    switch (ctType) {
      case WVE_QUERY_PARAMS.BUILDER:
        logger.debug('open in visual builder mode')
        window.addEventListener('message', handleMessageEvent, false)
        if (parentWindow) {
          parentWindow.postMessage({ message: 'builder', originUrl: window.location.href }, '*')
        }
        break
      case WVE_QUERY_PARAMS.PREVIEW:
        logger.debug('preview of visual editor')
        window.addEventListener('message', handleMessageEvent, false)
        if (parentWindow) {
          parentWindow.postMessage({ message: 'preview', originUrl: window.location.href }, '*')
        }
        break
      case WVE_QUERY_PARAMS.SDK_CHECK:
        if (parentWindow) {
          logger.debug('SDK version check')
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
        break
      default:
        logger.debug(`unknown query param ${ctType}`)
        break
    }
  }
}

const handleMessageEvent = (event) => {
  if (event.data && isValidUrl(event.data.originUrl)) {
    // Visual Editor is opened from only dashboard, while preview can be opened from both dashboard & Visual Editor
    // therefore adding check for self origin
    // Visual Editor can only be opened in their domain not inside dashboard

    if (
      !event.origin.endsWith(WVE_URL_ORIGIN.CLEVERTAP) &&
      !event.origin.endsWith(window.location.origin)
    ) {
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
    loadOverlayScript(OVERLAY_PATH, url, variant, details, personalisation)
      .then(() => {
        logger.debug('Overlay script loaded successfully.')
        contentLoaded = true
      })
      .catch((error) => {
        logger.debug('Error loading overlay script:', error)
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
 * @param _logger - instance of logger class
 */
export const renderVisualBuilder = (targetingMsgJson, isPreview, _logger) => {
  if (_logger) {
    logger = _logger
  }
  if (isPreview) {
    sessionStorage.setItem('visualEditorData', JSON.stringify(targetingMsgJson))
  }
  const insertedElements = []
  const reorderingOptions = [] // Collect reordering operations to execute at the end
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
    window.clevertap.renderNotificationClicked(payload)
  }

  const processElement = (element, selector) => {
    if (selector?.reorderingOptions?.positionsChanged) {
      // Collect drag operation to execute later (after all elements are processed)
      reorderingOptions.push({ element, selector })
    }
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
      switch (selector.values.editor) {
        case 'html':
          if (isPreview) {
            element.outerHTML = selector.values.html.text
          } else {
            element.outerHTML = selector.values.html
          }
          executeScripts(selector.selector)
          break
        case 'json':
          dispatchJsonData(targetingMsgJson, selector.values, isPreview)
          break
        case 'form':
          payload.msgCTkv = { wzrk_selector: selector.selector }
          updateFormData(element, selector.values.form, payload, isPreview)
          break
      }
    }
  }

  const tryFindingElement = (selector) => {
    let count = 0
    const intervalId = setInterval(() => {
      let retryElement
      try {
        retryElement = document.querySelector(selector.selector)
      } catch (_) {}
      if (retryElement) {
        raiseViewed()
        processElement(retryElement, selector)
        applyReorder()
        clearInterval(intervalId)
      } else if (++count >= 20) {
        logger.debug(`No element present on DOM with selector '${selector}'.`)
        clearInterval(intervalId)
      }
    }, 500)
    $ct.intervalArray.push(intervalId)
  }

  details.forEach(d => {
    d.selectorData.forEach(s => {
      if ((s.selector.includes('-afterend-') || s.selector.includes('-beforebegin-')) &&
          s.values.initialHtml) {
        insertedElements.push(s)
      } else {
        let element
        try {
          element = document.querySelector(s.selector)
        } catch (_) {}
        if (element) {
          raiseViewed()
          processElement(element, s)
        } else {
          tryFindingElement(s)
        }
      }
    })
  })

  const addNewEl = (selector) => {
    const { pos, sibling } = findSiblingSelector(selector.selector)
    let count = 0
    const intervalId = setInterval(() => {
      let element = null
      try {
        const siblingEl = document.querySelector(sibling)
        const ctEl = document.querySelector(`[ct-selector="${sibling}"]`)
        element = ctEl || siblingEl
      } catch (_) {
        element = document.querySelector(`[ct-selector="${sibling}"]`)
      }
      if (element) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = selector.values.initialHtml
        const newElement = tempDiv.firstElementChild
        element.insertAdjacentElement(pos, newElement)
        if (!element.getAttribute('ct-selector')) {
          element.setAttribute('ct-selector', sibling)
        }
        const insertedElement = document.querySelector(`[ct-selector="${selector.selector}"]`)
        raiseViewed()
        processElement(insertedElement, selector)
        clearInterval(intervalId)
      } else if (++count >= 20) {
        logger.debug(`No element present on DOM with selector '${sibling}'.`)
        clearInterval(intervalId)
      }
    }, 500)
    $ct.intervalArray.push(intervalId)
  }

  if (insertedElements.length > 0) {
    const sortedArr = insertedElements.sort((a, b) => {
      const numA = parseInt(a.selector.split('-')[0], 10)
      const numB = parseInt(b.selector.split('-')[0], 10)
      return numA - numB
    })
    sortedArr.forEach(addNewEl)
  }

  // Execute all drag operations after all elements have been processed
  const applyReorder = () => {
    reorderingOptions.forEach(({ element, selector }) => {
    // ensure DOM matches layout (safety sync)
    // newOrder contains ALL child elements in their desired order
    // First, collect all elements before any DOM manipulation
    // This prevents nth-child selectors from becoming invalid during reordering
      const orderedChildren = []
      selector.reorderingOptions.newOrder.forEach(cssSelector => {
        const child = document.querySelector(cssSelector)
        if (child && element.contains(child)) {
          orderedChildren.push(child)
        }
      })

      // Now reorder using insertBefore with index-based positioning
      orderedChildren.forEach((child, targetIndex) => {
        const currentIndex = Array.from(element.children).indexOf(child)
        if (currentIndex !== targetIndex) {
          // Insert child at the correct position
          const referenceChild = element.children[targetIndex]
          if (referenceChild) {
            element.insertBefore(child, referenceChild)
          } else {
            element.appendChild(child)
          }
        }
      })
    })
  }
}

function findSiblingSelector (input) {
  const regex = /^(\d+)-(afterend|beforebegin)-(.+)$/
  const match = input.match(regex)

  if (match) {
    return { pos: match[2], sibling: match[3] }
  }
  return { pos: 'beforebegin', sibling: '' }
}

/**
 * Dispatches JSON data.
 * @param {Object} targetingMsgJson - The point and click campaign JSON object.
 * @param {Object} selector - The selector object.
 * @param {boolean} isPreview - If preview different handling
 */
function dispatchJsonData (targetingMsgJson, selector, isPreview = false) {
  const inaObj = {}
  inaObj.msgId = targetingMsgJson.wzrk_id
  if (targetingMsgJson.wzrk_pivot) {
    inaObj.pivotId = targetingMsgJson.wzrk_pivot
  }
  if (selector.json != null) {
    if (isPreview) {
      inaObj.json = selector.json.text
    } else {
      inaObj.json = selector.json
    }
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

export function executeScripts (selector) {
  try {
    let newElement
    if (selector.includes('-afterend-') || selector.includes('-beforebegin-')) {
      // doing this because inserted elements saved selectors do not follow normal conventions
      // they start with numbers ex. 0-beforebegin-div#titleContainer
      newElement = document.querySelector(`[ct-selector="${selector}"]`)
    } else {
      newElement = document.querySelector(selector)
    }
    if (!newElement) return
    const scripts = newElement.querySelectorAll('script')
    scripts.forEach((script) => {
      addScriptTo(script)
    })
  } catch (error) {
    logger.debug('Error loading script', error)
  }
}
