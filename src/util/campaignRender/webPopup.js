import { invokeExternalJs } from './utilities'
import { $ct } from '../storage'
import { closeIframe } from '../clevertap'
import { ACTION_TYPES, WEB_POPUP_PREVIEW } from '../constants'
import { WVE_URL_ORIGIN } from '../../modules/visualBuilder/builder_constants'

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

  // Check for existing wrapper and handle accordingly
  if (handleExistingWrapper(divId)) {
    return // Early exit if existing wrapper should not be replaced
  }
  $ct.campaignDivMap[campaignId] = divId

  // Create DOM elements
  const msgDiv = createWrapperDiv(divId)
  const iframe = createIframe(targetingMsgJson, _logger)

  if (!iframe) {
    _logger.error('Failed to create iframe for Advanced Builder')
    return
  }

  // Setup event handling
  setupIframeEventListeners(iframe, targetingMsgJson, divId, _session, _logger)

  // Append to DOM
  msgDiv.appendChild(iframe)
  document.body.appendChild(msgDiv)

  // Track notification view
  window.clevertap.renderNotificationViewed({
    msgId: targetingMsgJson.wzrk_id,
    pivotId: targetingMsgJson.wzrk_pivot
  })
}

const handleIframeEvent = (e, targetingMsgJson, divId, _session, _logger) => {
  const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
  const { detail } = e

  if (!detail?.type) {
    return _logger.debug('Empty or missing event type')
  }

  _logger.debug('Received event type:', detail)

  const payload = {
    msgId: targetingMsgJson.wzrk_id,
    pivotId: targetingMsgJson.wzrk_pivot,
    kv: {
      wzrk_c2a: e.detail?.elementDetails?.name
    }
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
        window.open(detail.url.value.replacements, '_blank', 'noopener')
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
      invokeExternalJs(e.detail.js.name, targetingMsgJson)
      break
    default:
      _logger.debug('Empty event type received')
  }
}

// Utility: Check and handle existing wrapper
const handleExistingWrapper = (divId) => {
  const existingWrapper = document.getElementById(divId)

  if (existingWrapper) {
    if ($ct.dismissSpamControl) {
      existingWrapper.remove()
      return false // Continue with creation
    } else {
      return true // Stop execution
    }
  }
  return false // No existing wrapper, continue
}

// Utility: Create wrapper div
const createWrapperDiv = (divId) => {
  const msgDiv = document.createElement('div')
  msgDiv.id = divId
  msgDiv.setAttribute('style', FULLSCREEN_STYLE)
  return msgDiv
}

// Utility: Create iframe with attributes and content
const createIframe = (targetingMsgJson, _logger) => {
  try {
    const staticHTML = targetingMsgJson.msgContent.html
    const isDesktop = window.matchMedia('(min-width: 480px)').matches
    const config = isDesktop ? targetingMsgJson.display.desktopConfig : targetingMsgJson.display.mobileConfig
    const html = staticHTML.replace('"##Vars##"', JSON.stringify(config))

    const iframe = document.createElement('iframe')
    iframe.id = 'wiz-iframe'
    iframe.srcdoc = html
    iframe.setAttribute('style', IFRAME_STYLE)

    return iframe
  } catch (error) {
    _logger.error('Error creating iframe:', error)
    return null
  }
}

// Utility: Setup iframe event listeners
const setupIframeEventListeners = (iframe, targetingMsgJson, divId, _session, _logger) => {
  iframe.onload = () => {
    try {
      // Try direct document access first
      iframe.contentDocument.addEventListener('CT_custom_event', (e) => {
        _logger.debug('Event received ', e)
        handleIframeEvent(e, targetingMsgJson, divId, _session, _logger)
      })
    } catch (error) {
      // Fallback to postMessage
      _logger.error('Iframe document inaccessible, using postMessage:', error)
      setupPostMessageListener(targetingMsgJson, divId, _session, _logger)
    }
  }
}

// Utility: Setup postMessage listener as fallback
const setupPostMessageListener = (targetingMsgJson, divId, _session, _logger) => {
  const messageHandler = (event) => {
    if (!event.origin.endsWith(WVE_URL_ORIGIN.CLEVERTAP)) {
      return
    }
    if (event.data?.type === 'CT_custom_event') {
      _logger.debug('Event received ', event)
      handleIframeEvent({ detail: event.data.detail }, targetingMsgJson, divId, _session, _logger)
    }
  }

  window.removeEventListener('message', messageHandler) // Avoid duplicate bindings
  window.addEventListener('message', messageHandler)
}

function handleWebPopupPreviewPostMessageEvent (event, logger) {
  if (!event.origin.endsWith(WVE_URL_ORIGIN.CLEVERTAP) || !event.origin.includes('localhost')) {
    console.log('event', event.data)
    return
  }
  console.log('event', event.origin)
  const eventData = JSON.parse(event.data)
  const inAppNotifs = eventData.inapp_notifs
  const msgContent = inAppNotifs[0].msgContent
  if (eventData && msgContent && msgContent.templateType === 'advanced-builder') {
    renderAdvancedBuilder(inAppNotifs[0], logger)
  }
}

export const checkWebPopupPreview = (logger) => {
  const searchParams = new URLSearchParams(window.location.search)
  const ctType = searchParams.get('ctActionMode')
  if (ctType) {
    const parentWindow = window.opener
    switch (ctType) {
      case WEB_POPUP_PREVIEW:
        if (parentWindow) {
          const eventHandler = (event) => handleWebPopupPreviewPostMessageEvent(event, logger)
          window.addEventListener('message', eventHandler, false)
          console.log('message sent')
          parentWindow.postMessage('ready', '*')
        }
        break
      default:
        logger.debug(`unknown query param ${ctType}`)
        break
    }
  }
}
