import { WVE_FRAGMENT_KEYS } from '../builder_constants'

/**
 * Reads a single key from the URL fragment (`#key=value&other=...`) and returns its decoded value.
 * Fragments are never sent to servers; the SDK must strip them after reading.
 */
export function readFragmentValue (key, hash = window.location.hash) {
  if (!hash || hash === '#') {
    return null
  }
  const raw = hash.charAt(0) === '#' ? hash.slice(1) : hash
  const params = new URLSearchParams(raw)
  const value = params.get(key)
  if (value == null || value === '') {
    return null
  }
  try {
    return decodeURIComponent(value)
  } catch (_) {
    return value
  }
}

export function readEditorHandle () {
  return readFragmentValue(WVE_FRAGMENT_KEYS.CT_EDITOR)
}

export function readPreviewBlob () {
  return readFragmentValue(WVE_FRAGMENT_KEYS.CT_PREVIEW)
}

/**
 * Clears the fragment (and rewrites the current history entry) so the handle/blob is not retained
 * in the address bar, Referer, or history after the SDK has consumed it.
 */
export function stripFragment () {
  const { pathname, search } = window.location
  try {
    window.history.replaceState(window.history.state, '', `${pathname}${search}`)
  } catch (_) {
    // ignore — some browsers / sandboxes may block history mutation
  }
}
