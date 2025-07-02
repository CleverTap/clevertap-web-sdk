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

export const renderAdvancedBuilder = (targetingMsgJson, _session, _logger) => {
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
        _logger.debug('Event received ', e)
        handleIframeEvent(e, targetingMsgJson, divId, _session, _logger)
      }
      )
    } catch (error) {
      _logger.error('Iframe document inaccessible, using postMessage:', error)

      const messageHandler = (event) => {
        if (event.data?.type === 'CT_custom_event') {
          _logger.debug('Event received ', event)
          handleIframeEvent({ detail: event.data.detail }, targetingMsgJson, divId, _session, _logger)
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

const handleIframeEvent = (e, targetingMsgJson, divId, _session, _logger) => {
  const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
  const { detail } = e
  const payload = { msgId: campaignId, pivotId: targetingMsgJson.wzrk_pivot }

  if (!detail?.type) return _logger.debug('Empty or missing event type')

  _logger.debug('Received event type:', detail)

  payload.kv = {
    wzrk_c2a: e.detail.elementDetails.name
  }
  switch (detail.type) {
    case ACTION_TYPES.CLOSE:
      // close Iframe
      window.clevertap.renderNotificationClicked(payload)
      closeIframe(campaignId, divId, _session.sessionId)
      break
    case ACTION_TYPES.OPEN_WEB_URL:
      // handle opening of url
      window.clevertap.renderNotificationClicked(payload)
      if (detail.openInNewTab) {
        window.open(detail.url.value.replacements, '_blank')
        if (detail.closeOnClick) {
          closeIframe(campaignId, divId, _session.sessionId)
        }
      } else {
        window.location.href = detail.url.value.replacements
      }
      break
    case ACTION_TYPES.SOFT_PROMPT:
      // Handle soft prompt
      window.clevertap.renderNotificationClicked(payload)
      window.clevertap.notifications.push({ skipDialog: true })
      break
    case ACTION_TYPES.RUN_JS:
      // Handle JS code
      window.clevertap.renderNotificationClicked(payload)
      invokeExternalJs(e.detail.js, targetingMsgJson)
      break
    default:
      _logger.debug('Empty event type received')
  }
}
