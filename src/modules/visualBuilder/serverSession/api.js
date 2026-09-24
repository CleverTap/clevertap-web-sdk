import { WVE_EDITOR } from '../builder_constants'
import { encodeSdkVersion } from './sdkVersion'

export class EditorApiError extends Error {
  constructor (status, message, body) {
    super(message || `Editor request failed (${status})`)
    this.name = 'EditorApiError'
    this.status = status
    this.body = body
  }
}

/**
 * SDK-facing Visual Editor client for LC `/editor/*` (CORS POSTs).
 * Auth is the dashboard-signed handle in the JSON body; account id is a request header.
 */
export function createEditorApi ({ accountId, apiBase, logger }) {
  const base = (apiBase || '').replace(/\/$/, '')

  function post (path, body) {
    const url = `${base}${path}`
    return fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        [WVE_EDITOR.ACCOUNT_HEADER]: accountId
      },
      body: JSON.stringify(body)
    })
      .catch((err) => {
        logger?.debug?.('Visual editor request network error', path, err)
        throw new EditorApiError(0, 'Network error talking to the visual editor.')
      })
      .then((response) => {
        return response.json()
          .catch(() => null)
          .then((payload) => {
            if (!response.ok) {
              const message = (payload && (payload.error || payload.message)) || response.statusText
              logger?.debug?.('Visual editor request failed', path, response.status, message)
              throw new EditorApiError(response.status, message, payload)
            }
            return payload
          })
      })
  }

  return {
    auth (handle, sdkVersion = encodeSdkVersion()) {
      return post('/editor/auth', { handle, sdkVersion })
    },
    saveContent (handle, details) {
      return post('/editor/content', { handle, details })
    },
    meta (handle, eventId) {
      const body = { handle }
      if (eventId != null && eventId !== '') {
        body.eventId = String(eventId)
      }
      return post('/editor/meta', body)
    },
    preview (blob) {
      return post('/editor/preview', { blob })
    }
  }
}
