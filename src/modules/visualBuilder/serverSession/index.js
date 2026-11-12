import { WVE_EDITOR } from '../builder_constants'
import { createEditorApi, EditorApiError } from './api'
import {
  readEditorHandle,
  readEventId,
  readPreviewBlob,
  readRecommendations,
  sanitizeEditorSiteUrl,
  stripFragment
} from './fragment'
import { encodeSdkVersion } from './sdkVersion'

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

/**
 * Map LC `/editor/meta` eventProps (`{ propId: name }`) into the `window.evtMaster`
 * shape PersonalisationInputWidget reads (`{ [eventId]: { id, props: [{ id, name }] } }`).
 */
export function buildEvtMasterFromMeta (meta, eventId) {
  if (typeof eventId !== 'number' || eventId <= 0) {
    return {}
  }
  const eventProps = meta?.eventProps
  const props = []
  if (eventProps && typeof eventProps === 'object' && !Array.isArray(eventProps)) {
    Object.keys(eventProps).forEach((key) => {
      const id = Number(key)
      if (!Number.isFinite(id)) {
        return
      }
      const value = eventProps[key]
      const name = typeof value === 'string' ? value : String(value ?? '')
      if (!name) {
        return
      }
      props.push({ id, name })
    })
  }
  return {
    [eventId]: {
      id: eventId,
      name: '',
      drp: 0,
      props
    }
  }
}

/**
 * Profile from LC `/editor/meta`; event + recommendations from the dashboard fragment.
 * Event prop names stay on meta → `window.evtMaster` (see `buildEvtMasterFromMeta`).
 */
export function buildPersonalisation ({ meta, eventId, recommendations }) {
  return {
    profile: meta ? profileNamesFromMeta(meta) : [],
    event: typeof eventId === 'number' && eventId > 0 ? eventId : 0,
    recommendations:
      recommendations && typeof recommendations === 'object' && !Array.isArray(recommendations)
        ? recommendations
        : {}
  }
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
 *
 * Fragment: `#ctEditor` (handle), optional `#ctEvent` / `#ctRecs` from the dashboard.
 * Profile names come from LC `/editor/meta`; eventProps are fetched with the fragment eventId.
 * The hash is left in place during the session so a refresh can re-auth; strip after save.
 */
export function startServerSessionBuilder ({ account, logger, initialiseCTBuilder }) {
  const handle = readEditorHandle()
  const eventId = readEventId()
  const recommendations = readRecommendations()

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

      // Profile (+ eventProps when dashboard sent ctEvent) from LC meta.
      return editorApi.meta(handle, eventId != null ? eventId : undefined)
        .catch((err) => {
          logger?.debug?.('Visual editor meta bootstrap failed; continuing without personalisation names', err)
          return null
        })
        .then((meta) => {
          const personalisation = buildPersonalisation({
            meta,
            eventId,
            recommendations
          })

          // Widget reads event props from window.evtMaster (classic path posts full evtMaster).
          // Server session only gets id→name maps from LC meta — materialise that shape here.
          try {
            window.evtMaster = buildEvtMasterFromMeta(meta, eventId)
          } catch (_) {
            // ignore — overlay still opens without event personalisation names
          }

          const metaCache = new Map()
          if (meta && eventId != null) {
            metaCache.set(String(eventId), meta)
          }

          const fetchEventMeta = (id) => {
            const key = String(id ?? '')
            if (metaCache.has(key)) {
              return Promise.resolve(metaCache.get(key))
            }
            return editorApi.meta(handle, id).then((response) => {
              metaCache.set(key, response)
              // Keep evtMaster in sync if a later event id is requested.
              try {
                const n = Number(id)
                if (Number.isFinite(n) && n > 0) {
                  window.evtMaster = {
                    ...(window.evtMaster || {}),
                    ...buildEvtMasterFromMeta(response, n)
                  }
                }
              } catch (_) {
                // ignore
              }
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
                // Session is done — drop the capability from the address bar / history entry.
                stripFragment()
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

          // Never pass ctActionMode into the overlay iframe — that re-enters builder mode
          // and nests the Visual Editor inside itself (site never renders).
          const url = sanitizeEditorSiteUrl(details[0]?.url || window.location.href)
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
