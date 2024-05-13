export const initialiseCTBuilder = (url, variant, details) => {
  document.addEventListener('DOMContentLoaded', () => onContentLoad(url, variant, details))
}

let container

function onContentLoad (url, variant, details) {
  document.body.innerHTML = ''
  container = document.createElement('div')
  container.id = 'overlayDiv'
  container.style.position = 'relative' // Ensure relative positioning for absolute positioning of form
  container.style.display = 'flex'
  document.body.appendChild(container)
  const overlayPath = 'https://d2r1yp2w7bby2u.cloudfront.net/js/lib-overlay/overlay.js'
  loadOverlayScript(overlayPath, url, variant, details)
    .then(() => {
      console.log('Overlay script loaded successfully.')
    })
    .catch((error) => {
      console.error('Error loading overlay script:', error)
    })
  loadCSS()
  loadTypeKit()
}

function loadCSS () {
  var link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = 'https://d2r1yp2w7bby2u.cloudfront.net/js/lib-overlay/style.css'
  document.head.appendChild(link)
}

function loadOverlayScript (overlayPath, url, variant, details) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script')
    script.type = 'module'
    script.src = overlayPath
    script.onload = function () {
      if (typeof window.Overlay === 'function') {
        window.Overlay('#overlayDiv', url, variant, details)
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

function loadTypeKit () {
  var config = {
    kitId: 'eqj6nom',
    scriptTimeout: 3000,
    async: true
  }

  var d = document
  var h = d.documentElement
  var t = setTimeout(function () {
    h.className = h.className.replace(/\bwf-loading\b/g, '') + ' wf-inactive'
    // $(document).trigger("TypeKitReady");
  }, config.scriptTimeout)
  var tk = d.createElement('script')
  var f = false
  var s = d.getElementsByTagName('script')[0]
  var a

  h.className += ' wf-loading'
  tk.src = 'https://use.typekit.net/' + config.kitId + '.js'
  tk.async = true
  tk.onload = tk.onreadystatechange = function () {
    a = this.readyState
    if (f || (a && a !== 'complete' && a !== 'loaded')) return
    f = true
    clearTimeout(t)
    try {
      // eslint-disable-next-line no-undef
      Typekit.load(config)
    } catch (e) {}
  }

  s.parentNode.insertBefore(tk, s)
}

export const renderVisualBuilder = (targetingMsgJson, isPreview) => {
  const details = isPreview ? targetingMsgJson.details[0] : targetingMsgJson.display.details[0]
  const siteUrl = Object.keys(details)[0]
  const selectors = details[siteUrl]

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
        if (!isPreview) {
          window.clevertap.renderNotificationViewed({ msgId: targetingMsgJson.wzrk_id, pivotId: targetingMsgJson.wzrk_pivot })
        }
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
            if (!isPreview) {
              window.clevertap.renderNotificationViewed({ msgId: targetingMsgJson.wzrk_id, pivotId: targetingMsgJson.wzrk_pivot })
            }
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
  }
}

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
