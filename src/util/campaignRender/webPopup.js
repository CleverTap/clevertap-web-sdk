import { invokeExternalJs } from './utilities'
import { $ct } from '../storage'
import { closeIframe } from '../clevertap'
import { ACTION_TYPES } from '../constants'

export const renderPopUpImageOnly = (targetingMsgJson, _session) => {
  const divId = 'wzrkImageOnlyDiv'
  const popupImageOnly = document.createElement('ct-web-popup-imageonly')
  popupImageOnly.session = _session
  popupImageOnly.target = targetingMsgJson
  const containerEl = document.getElementById(divId)
  containerEl.innerHTML = ''
  containerEl.style.visibility = 'hidden'
  containerEl.appendChild(popupImageOnly)
}

const FULLSCREEN_STYLE = `
  z-index: 2147483647;
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0;
  padding: 0;
  background: transparent;
`

const IFRAME_STYLE = `
  ${FULLSCREEN_STYLE}
  border: 0 !important;
`

export const renderAdvancedBuilder = (targetingMsgJson, _session) => {
  const divId = 'wizAdvBuilder'
  const campaignId = targetingMsgJson.wzrk_id.split('_')[0]

  const existingWrapper = document.getElementById(divId)

  if (existingWrapper) {
    if ($ct.dismissSpamControl) {
      existingWrapper.remove()
    } else {
      return
    }
  }
  $ct.campaignDivMap[campaignId] = divId

  const msgDiv = document.createElement('div')
  msgDiv.id = divId
  msgDiv.setAttribute('style', FULLSCREEN_STYLE)

  const iframe = document.createElement('iframe')
  iframe.id = 'wiz-iframe'

  const isDesktop = window.matchMedia('(min-width: 480px)').matches

  const html = isDesktop
    ? targetingMsgJson.display.desktopHTML
    : targetingMsgJson.display.mobileHTML

  iframe.srcdoc = html
  iframe.setAttribute('style', IFRAME_STYLE)

  iframe.onload = () => {
    try {
      iframe.contentDocument.addEventListener('CT_custom_event', (e) => {
        console.log('Event received ', e)
        handleIframeEvent(e, targetingMsgJson, divId, _session)
      }
      )
    } catch (error) {
      console.warn('Iframe document inaccessible, using postMessage:', error)

      const messageHandler = (event) => {
        if (event.data?.type === 'CT_custom_event') {
          console.log('Event received ', event)
          handleIframeEvent({ detail: event.data.detail }, targetingMsgJson, divId, _session)
        }
      }

      window.removeEventListener('message', messageHandler) // Avoid duplicate bindings
      window.addEventListener('message', messageHandler)
    }
  }
  msgDiv.appendChild(iframe)
  document.body.appendChild(msgDiv)
  window.clevertap.renderNotificationViewed({
    msgId: targetingMsgJson.wzrk_id,
    pivotId: targetingMsgJson.wzrk_pivot
  })
}

const handleIframeEvent = (e, targetingMsgJson, divId, _session) => {
  const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
  const { detail } = e

  if (!detail?.type) return console.log('Empty or missing event type')
  console.log('Received event type:', detail.type)

  switch (detail.type) {
    case ACTION_TYPES.CLOSE:
      // close Iframe
      closeIframe(campaignId, divId, _session.sessionId)
      break
    case ACTION_TYPES.OPEN_WEB_URL:
      // handle opening of url
      if (detail.open?.openInNewTab) {
        window.open(detail.url, '_blank')
        if (detail.closeOnClick) {
          closeIframe(campaignId, divId, _session.sessionId)
        }
      } else {
        window.location.href = detail.url
      }
      break
    case ACTION_TYPES.SOFT_PROMPT:
      // Handle soft prompt
      window.clevertap.notifications.push({ skipDialog: true })
      break
    case ACTION_TYPES.RUN_JS:
      // Handle JS code
      invokeExternalJs(e.detail.js, targetingMsgJson)
      break
    default:
      console.log('Empty event type received')
  }
}
