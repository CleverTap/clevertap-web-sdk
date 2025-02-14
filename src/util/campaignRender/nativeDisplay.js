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
  console.log('renderCustomHtml targetingMsgJson', targetingMsgJson)
  const { display, wzrk_id: wzrkId, wzrk_pivot: wzrkPivot } = targetingMsgJson || {}

  const { divId, preview: isPreview, url, divSelector } = display || {}
  const details = display.details[0]
  const html = details.html
  // const divId = targetingMsgJson.display.divId
  // const html = targetingMsgJson.display.html
  // const isPreview = targetingMsgJson.display.preview

  if (!divId || !html) {
    console.error('No div Id or no html found')
    return
  }

  if (isPreview) {
    renderPreviewIframe(url, divSelector, divId, html)
    return
    // const iframe = document.createElement('iframe')
    // // iframe.src = 'https://web-push-automation.vercel.app/?region=sk1&accountId=844-R9K-896Z'
    // iframe.src = targetingMsgJson.display.url
    // iframe.width = '100%'
    // iframe.height = '500px'
    // iframe.sandbox = 'allow-scripts allow-same-origin'
    // iframe.id = 'wiz-custom-html-preview'
    // const divSelector = targetingMsgJson.display.divSelector
    // const containerElement = document.querySelector(divSelector)
    // console.log('containerElement', containerElement)
    // console.log('iframe', iframe)
    // containerElement.innerHTML = ''
    // containerElement.appendChild(iframe)

    // const findIframeElement = () => {
    //   let count = 0
    //   const intervalId = setInterval(() => {
    //     const iframeElement = document.getElementById('wiz-custom-html-preview');
    //     if (iframeElement && iframe && iframe.contentDocument) {
    //       // Access the iframe's document and query for a div inside
    //       const divInsideIframe = iframe.contentDocument.querySelector(divId);
    //       processElement(iframeElement)

    //       clearInterval(intervalId)
    //       console.log('divInsideIframe', divInsideIframe);
    //     } else if (++count >= 20) {
    //       console.log(`No iframe element found '${ divId }'.`)
    //       clearInterval(intervalId)
    //     }
    //   }, 500)
    // }
    // findIframeElement()
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
  console.log('processElement element', element)
  console.log('processElement html', html)
  if (element) {
    element.outerHTML = html
  }
}

const renderPreviewIframe = async (url, divSelector, divId, html) => {
  const containerElement = document.querySelector(divSelector)
  console.log('containerElement', containerElement)
  containerElement.style.height = 'calc(100% - 52px)'
  if (!containerElement) {
    console.error(`No element found for selector: ${divSelector}`)
    return
  }

  const response = await fetch(url)
  if (!response.ok || !response.body) {
    return
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let htmlString = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    htmlString += decoder.decode(value, { stream: true })
  }
  htmlString += decoder.decode()
  const iframe = document.createElement('iframe')
  iframe.srcdoc = htmlString
  iframe.width = '100%'
  iframe.height = '100%'
  iframe.sandbox = 'allow-scripts allow-same-origin'
  iframe.id = 'wiz-custom-html-preview'

  console.log('iframe', iframe)

  containerElement.innerHTML = ''
  containerElement.appendChild(iframe)

  // findIframeElement(() => {
  //   const divInsideIframe = iframe.contentDocument?.querySelector(divId);
  //   if (divInsideIframe) {
  //     processElement(divInsideIframe, html)
  //     console.log('Found div inside iframe:', divInsideIframe);
  //   } else {
  //     console.warn('No div found inside iframe.');
  //   }
  // });
  iframe.onload = function () {
    console.log('iframe onload')
    findIframeElement(divId, html, iframe)
  }
}

const findIframeElement = (divId, html, iframeElement) => {
  console.log('findIframeElement divId', divId)
  console.log('findIframeElement html', html)
  console.log('findIframeElement iframeElement', iframeElement)
  let count = 0
  const intervalId = setInterval(() => {
    console.log('count', count)
    if (iframeElement && iframeElement.contentDocument) {
      const divInsideIframe = iframeElement.contentDocument?.querySelector(divId)
      if (divInsideIframe) {
        processElement(divInsideIframe, html)
        clearInterval(intervalId)
        // callback();
      }
    } else if (++count >= 20) {
      clearInterval(intervalId)
      console.warn('Iframe element not found after 20 attempts.')
    }
  }, 500)
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

export const checkCustomHtmlNativeDisplayPreview = (logger, accountId) => {
  console.log('checkCustomHtmlNativeDisplayPreview')
  // const search = window.location.search
  // const parentWindow = window.opener

  // if (search === '?customHtmlPreview') {
  //   // open in visual builder mode
  //   logger.debug('open in visual builder mode')
  //   window.addEventListener('message', handleMessageEvent, false)
  //   if (parentWindow) {
  //     parentWindow.postMessage({message: 'builder', originUrl: window.location.href}, '*')
  //   }
  //   return
  // }
  if (!window.opener) {
    console.log('This tab was manually opened. Resetting window.name.')
    window.name = '' // Reset to prevent incorrect flag detection
    return
  }
  if (window.opener) {
    console.log('This tab was opened from the parent tab!')

    // Now attach the event listener
    window.addEventListener('message', (event) => {
      // if (event.origin !== "http://localhost:8083") return; // Security check

      console.log('Received message from parent:', event.data)
      // Perform actions based on the received data
    })
  } else {
    console.log('This tab was opened manually, not by the parent tab.')
  }
}
