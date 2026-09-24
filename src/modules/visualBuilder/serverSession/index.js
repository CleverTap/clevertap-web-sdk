import { WVE_EDITOR } from '../builder_constants'
import { createEditorApi, EditorApiError } from './api'
import { readEditorHandle, readPreviewBlob, stripFragment } from './fragment'
import { encodeSdkVersion } from './sdkVersion'

const EMPTY_PERSONALISATION = {
  profile: [],
  event: 0,
  recommendations: {}
}

function profileNamesFromMeta (meta) {
  const props = meta?.profileProps
  if (!props || typeof props !== 'object') {
    return []
  }
  return Object.keys(props).map((key) => {
    const value = props[key]
    return typeof value === 'string' ? value : String(key)
  }).filter(Boolean)
}

function installBridge (bridge) {
  try {
    window[WVE_EDITOR.BRIDGE_KEY] = bridge
  } catch (_) {
    // ignore
  }
}

function clearBridge () {
  try {
    delete window[WVE_EDITOR.BRIDGE_KEY]
  } catch (_) {
    try {
      window[WVE_EDITOR.BRIDGE_KEY] = undefined
    } catch (__) {
      // ignore
    }
  }
}

function showSessionError (logger, message) {
  logger?.error?.(message)
  try {
    window.alert(message)
  } catch (_) {
    // ignore — alert may be blocked
  }
}

export function getEditorApiBase (account) {
  if (account?.editorApiURL) {
    return String(account.editorApiURL).replace(/\/$/, '')
  }
  // Day-1: same LC host as event ingestion. A dedicated editor hostname can be injected later
  // via Account.editorApiURL with zero SDK logic change.
  if (typeof account?.dataPostURL === 'string') {
    try {
      const u = new URL(account.dataPostURL)
      return `${u.protocol}//${u.host}`
    } catch (_) {
      // fall through
    }
  }
  if (account?.finalTargetDomain) {
    const protocol = (typeof window !== 'undefined' && window.location?.protocol === 'http:')
      ? 'http:'
      : 'https:'
    return `${protocol}//${account.finalTargetDomain}`
  }
  return ''
}

/**
 * Server-session Visual Editor entry (ctBuilderV2). Auth via signed handle → overlay bootstrap;
 * terminal save posts to LC. No window.opener / postMessage to the dashboard.
 */
export function startServerSessionBuilder ({ account, logger, initialiseCTBuilder }) {
  const handle = readEditorHandle()
  stripFragment()

  if (!handle) {
    showSessionError(logger, 'Missing visual editor session. Open the editor again from the dashboard.')
    return Promise.resolve()
  }
  if (!account?.id) {
    showSessionError(logger, 'CleverTap account is not initialised for the visual editor.')
    return Promise.resolve()
  }

  const apiBase = getEditorApiBase(account)
  if (!apiBase) {
    showSessionError(logger, 'Could not resolve the visual editor API host.')
    return Promise.resolve()
  }

  const editorApi = createEditorApi({
    accountId: account.id,
    apiBase,
    logger
  })

  return editorApi.auth(handle, encodeSdkVersion())
    .catch((err) => {
      const message = err instanceof EditorApiError
        ? (err.message || 'Could not start the visual editor session.')
        : 'Could not start the visual editor session.'
      showSessionError(logger, message)
      return null
    })
    .then((authResponse) => {
      if (!authResponse) {
        return
      }

      const details = Array.isArray(authResponse.details) ? authResponse.details : []
      const sessionId = authResponse.sessionId

      return editorApi.meta(handle)
        .catch((err) => {
          logger?.debug?.('Visual editor meta bootstrap failed; continuing without personalisation names', err)
          return null
        })
        .then((meta) => {
          const personalisation = meta
            ? {
              profile: profileNamesFromMeta(meta),
              event: 0,
              recommendations: {}
            }
            : { ...EMPTY_PERSONALISATION }

          const metaCache = new Map()

          const fetchEventMeta = (eventId) => {
            const key = String(eventId ?? '')
            if (metaCache.has(key)) {
              return Promise.resolve(metaCache.get(key))
            }
            return editorApi.meta(handle, eventId).then((response) => {
              metaCache.set(key, response)
              return response
            })
          }

          const saveAndFinish = (payload) => {
            const saveDetails = Array.isArray(payload?.details) ? payload.details : payload
            if (!Array.isArray(saveDetails)) {
              return Promise.reject(new EditorApiError(400, 'Edited content (details) must be a JSON array.'))
            }
            return editorApi.saveContent(handle, saveDetails)
              .then(() => {
                clearBridge()
                logger?.debug?.('Visual editor edits saved to dashboard session', sessionId)
                try {
                  window.close()
                } catch (_) {
                  showSessionError(logger, 'Edits sent to the dashboard. You can close this tab.')
                }
              })
              .catch((err) => {
                const message = err instanceof EditorApiError
                  ? (err.message || 'Could not save edits.')
                  : 'Could not save edits.'
                showSessionError(logger, message)
                throw err
              })
          }

          installBridge({
            sessionId,
            handle,
            save: saveAndFinish,
            fetchEventMeta
          })

          const url = details[0]?.url || window.location.href
          initialiseCTBuilder(url, null, details, personalisation, {
            onSave: saveAndFinish,
            fetchEventMeta,
            serverSession: true
          })
        })
    })
}

/**
 * Server-session preview (ctPreviewV2). Stateless sealed preview handle → apply read-only.
 */
export function startServerSessionPreview ({ account, logger, renderVisualBuilder }) {
  const blob = readPreviewBlob()
  stripFragment()

  if (!blob) {
    logger?.debug?.('Missing visual editor preview blob')
    return Promise.resolve()
  }
  if (!account?.id) {
    logger?.debug?.('CleverTap account is not initialised for visual editor preview')
    return Promise.resolve()
  }

  const apiBase = getEditorApiBase(account)
  if (!apiBase) {
    logger?.debug?.('Could not resolve the visual editor API host for preview')
    return Promise.resolve()
  }

  const editorApi = createEditorApi({
    accountId: account.id,
    apiBase,
    logger
  })

  return editorApi.preview(blob)
    .then((response) => {
      const details = Array.isArray(response?.details) ? response.details : []
      if (!details.length) {
        logger?.debug?.('Visual editor preview returned no details')
        return
      }
      renderVisualBuilder({ details }, true, logger)
    })
    .catch((err) => {
      const message = err instanceof EditorApiError
        ? (err.message || 'This preview link is invalid or has expired.')
        : 'This preview link is invalid or has expired.'
      logger?.error?.(message)
    })
}
