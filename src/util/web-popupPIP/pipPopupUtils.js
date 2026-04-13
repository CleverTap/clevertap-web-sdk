import { ACTION_TYPES } from '../constants'
import { invokeExternalJs } from '../campaignRender/utilities'

export const PIP_DRAG_CONTROL_SELECTOR =
  '#ct-pip-close, #ct-pip-expand, #ct-pip-play, #ct-pip-mute'

/** Fullscreen expand: letterbox video with native aspect ratio (object-fit: contain). */
export const PIP_EXPAND_RUNTIME_CSS = `
.ct-pip-overlay.ct-pip--expanded {
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  pointer-events: auto !important;
  background: rgba(0, 0, 0, 0.88);
}
.ct-pip-overlay.ct-pip--expanded .ct-pip-container {
  position: relative !important;
  max-width: none !important;
  width: 100vw !important;
  height: 100vh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 0 !important;
}
.ct-pip-overlay.ct-pip--expanded .ct-pip-media {
  width: auto !important;
  height: auto !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  object-fit: contain !important;
}
`

/** Nearest anchor id -> flex placement on `.ct-pip-overlay` (row: justify = horizontal, align = vertical). */
export const PIP_ANCHOR_FLEX = {
  center: { alignItems: 'center', justifyContent: 'center' },
  'top-right': { alignItems: 'flex-start', justifyContent: 'flex-end' },
  'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start' },
  'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
  'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
  top: { alignItems: 'flex-start', justifyContent: 'center' },
  bottom: { alignItems: 'flex-end', justifyContent: 'center' },
  left: { alignItems: 'center', justifyContent: 'flex-start' },
  right: { alignItems: 'center', justifyContent: 'flex-end' }
}

/**
 * `display.pip.onClick` / `display.mobile.pip.onClick` (nested payload).
 * @param {Record<string, unknown>} pipConfig — result of desktop/mobile `pip` slice
 * @returns {Record<string, unknown>}
 */
export function getPipOnClickConfig (pipConfig) {
  const oc = pipConfig?.onClick
  return oc && typeof oc === 'object' ? oc : {}
}

/** @param {Record<string, unknown>} pipConfig */
export function getPipOnClickAction (pipConfig) {
  const t = getPipOnClickConfig(pipConfig).type
  if (t != null) {
    const s = String(t).trim()
    if (s !== '') return s
  }
  const legacy = pipConfig?.onClickAction
  return legacy != null && legacy !== '' ? legacy : ''
}

/** @param {Record<string, unknown>} pipConfig */
export function getPipOnClickUrl (pipConfig, display) {
  const oc = getPipOnClickConfig(pipConfig)
  return (
    oc.webUrl ||
    oc.url ||
    pipConfig?.onClickUrl ||
    display?.onClickUrl ||
    ''
  )
}

/** Used only for {@link ACTION_TYPES.OPEN_LINK} (`url`). */
export function getPipOpenLinkUsesNewTab (pipConfig, display) {
  if (typeof pipConfig?.window === 'boolean') return pipConfig.window
  return !!display?.window
}

/** @param {Record<string, unknown>} pipConfig */
export function getPipOnClickJsName (pipConfig) {
  const oc = getPipOnClickConfig(pipConfig)
  if (typeof oc.js === 'string' && oc.js) return oc.js
  if (typeof oc.jsName === 'string' && oc.jsName) return oc.jsName
  if (oc.js && typeof oc.js === 'object' && oc.js?.name) return oc.js.name
  return pipConfig?.onClickJs || ''
}

export function buildPipNotificationClickedPayload (msgId, pivotId, pipConfig) {
  const oc = getPipOnClickConfig(pipConfig)
  const kv = oc.kv
  const payload = { msgId, pivotId }
  if (kv && typeof kv === 'object' && Object.keys(kv).length > 0) {
    payload.kv = kv
  }
  return payload
}

function navigateOpenWebUrl (url, oc, closeTemplate) {
  const openInNewTab = oc.openInNewTab === true
  const closeOnClick = oc.closeOnClick === true
  if (openInNewTab) {
    window.open(url, '_blank', 'noopener')
    if (closeOnClick) closeTemplate()
  } else {
    if (closeOnClick) closeTemplate()
    window.location.href = url
  }
}

/**
 * @param {object} params
 * @param {Record<string, unknown>} params.pipConfig — `getPipDisplayConfig()` slice
 * @param {Record<string, unknown>} params.display — `target.display`
 * @param {Record<string, unknown>} params.targetingMsgJson — campaign / `target`
 * @param {boolean} [params.preview]
 * @param {() => void} params.closeTemplate
 */
export function runPipClickAction ({
  pipConfig,
  display,
  targetingMsgJson,
  preview,
  closeTemplate
}) {
  const action = getPipOnClickAction(pipConfig)
  if (!action) return

  const fireClicked = () => {
    if (!preview) {
      window.clevertap.renderNotificationClicked(
        buildPipNotificationClickedPayload(
          targetingMsgJson.wzrk_id,
          targetingMsgJson.wzrk_pivot,
          pipConfig
        )
      )
    }
  }

  switch (action) {
    case ACTION_TYPES.OPEN_LINK: {
      const url = getPipOnClickUrl(pipConfig, display)
      if (!url) return
      fireClicked()
      if (getPipOpenLinkUsesNewTab(pipConfig, display)) {
        window.open(url, '_blank', 'noopener')
      } else {
        window.parent.location.href = url
      }
      break
    }
    case ACTION_TYPES.OPEN_WEB_URL: {
      const url = getPipOnClickUrl(pipConfig, display)
      if (!url) return
      fireClicked()
      navigateOpenWebUrl(url, getPipOnClickConfig(pipConfig), closeTemplate)
      break
    }
    case ACTION_TYPES.SOFT_PROMPT:
      fireClicked()
      window.clevertap.notifications.push({ skipDialog: true })
      break
    case ACTION_TYPES.RUN_JS: {
      const jsName = getPipOnClickJsName(pipConfig)
      if (!jsName) return
      fireClicked()
      invokeExternalJs(jsName, targetingMsgJson)
      break
    }
    default:
      break
  }
}
