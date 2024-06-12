import { CSS_PATH, OVERLAY_PATH } from './builder_constants'

export const checkBuilder = (logger) => {
  const search = window.location.search
  const parentWindow = window.opener

  if (search === '?ctBuilder') {
    // open in visual builder mode
    logger.debug('open in visual builder mode')
    window.addEventListener('message', handleMessageEvent, false)
    if (parentWindow) {
      parentWindow.postMessage('builder', '*')
    }
    return
  }
  if (search === '?ctBuilderPreview') {
    window.addEventListener('message', handleMessageEvent, false)
    if (parentWindow) {
      parentWindow.postMessage('preview', '*')
    }
  }
}

const handleMessageEvent = (event) => {
  if (event.data && event.data.message) {
    if (event.data.message === 'Dashboard' && event.data.url) {
      initialiseCTBuilder(event.data.url, event.data.variant ?? null, event.data.details ?? {})
    } else if (event.data.message === 'Overlay') {
      renderVisualBuilder(event.data, true)
    }
  }
}
/**
 * Initializes the Clevertap builder.
 * @param {string} url - The URL to initialize the builder.
 * @param {string} variant - The variant of the builder.
 * @param {Object} details - The details object.
 */
const initialiseCTBuilder = (url, variant, details) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => onContentLoad(url, variant, details))
  } else {
    onContentLoad(url, variant, details)
  }
}

let container
let contentLoaded = false
/**
 * Handles content load for Clevertap builder.
 */
function onContentLoad (url, variant, details) {
  if (!contentLoaded) {
    document.body.innerHTML = ''
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
    loadTypeKit()
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
        window.Overlay({ id: '#overlayDiv', url, variant, details })
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
 * Loads TypeKit script.
 */
function loadTypeKit () {
  const config = {
    kitId: 'eqj6nom',
    scriptTimeout: 3000,
    async: true
  }

  const docElement = document.documentElement
  const timeoutId = setTimeout(function () {
    docElement.className = docElement.className.replace(/\bwf-loading\b/g, '') + ' wf-inactive'
  }, config.scriptTimeout)
  const typeKitScript = document.createElement('script')
  let scriptLoaded = false
  const firstScript = document.getElementsByTagName('script')[0]
  let scriptReadyState

  docElement.className += ' wf-loading'
  typeKitScript.src = 'https://use.typekit.net/' + config.kitId + '.js'
  typeKitScript.async = true
  typeKitScript.onload = typeKitScript.onreadystatechange = function () {
    scriptReadyState = this.readyState
    if (scriptLoaded || (scriptReadyState && scriptReadyState !== 'complete' && scriptReadyState !== 'loaded')) return
    scriptLoaded = true
    clearTimeout(timeoutId)
    try {
      // eslint-disable-next-line no-undef
      Typekit.load(config)
    } catch (e) {}
  }

  firstScript.parentNode.insertBefore(typeKitScript, firstScript)
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

  if (siteUrl === window.location.href.split('?')[0]) {
    for (const selector in selectors) {
      const element = document.querySelector(selector)
      if (element) {
        if (selectors[selector].html) {
          element.outerHTML = selectors[selector].html
        } else {
          // Update json data
          dispatchJsonData(targetingMsgJson, selectors[selector])
        }
        elementDisplayed = true
      } else {
        let count = 0
        const intervalId = setInterval(() => {
          const retryElement = document.querySelector(selector)
          if (retryElement) {
            if (selectors[selector].html) {
              retryElement.outerHTML = selectors[selector].html
            } else {
              // Update json data
              dispatchJsonData(targetingMsgJson, selectors[selector])
            }
            elementDisplayed = true
            clearInterval(intervalId)
          } else {
            count++
            if (count >= 20) {
              console.log(`No element present on DOM with selector '${selector}'.`)
              clearInterval(intervalId)
            }
          }
        }, 500)
      }
    }
    if (elementDisplayed && !isPreview) {
      window.clevertap.renderNotificationViewed({ msgId: targetingMsgJson.wzrk_id, pivotId: targetingMsgJson.wzrk_pivot })
    }
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
