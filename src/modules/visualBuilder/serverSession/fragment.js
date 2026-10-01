import { WVE_FRAGMENT_KEYS } from '../builder_constants'

/**
 * Reads a single key from the URL fragment (`#key=value&other=...`) and returns its decoded value.
 * Fragments are never sent to servers (no access logs / Referer).
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
 * Dashboard packs `{ profile, event, recommendations }` as JSON under `ctPers`.
 * Returns null when absent or malformed.
 */
export function readPersonalisation () {
  const raw = readFragmentValue(WVE_FRAGMENT_KEYS.CT_PERS)
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    return {
      profile: Array.isArray(parsed.profile) ? parsed.profile : [],
      event: typeof parsed.event === 'number' ? parsed.event : 0,
      recommendations:
        parsed.recommendations && typeof parsed.recommendations === 'object'
          ? parsed.recommendations
          : {}
    }
  } catch (_) {
    return null
  }
}

/**
 * Clears the fragment (and rewrites the current history entry).
 * Used after a terminal save / preview consume — not on editor bootstrap, so a refresh can
 * re-read `#ctEditor` / `#ctPers` from the address bar.
 */
export function stripFragment () {
  const { pathname, search } = window.location
  try {
    window.history.replaceState(window.history.state, '', `${pathname}${search}`)
  } catch (_) {
    // ignore — some browsers / sandboxes may block history mutation
  }
}

/**
 * URL the overlay iframe should load — the real customer page, not a builder/preview mode URL.
 * Passing `window.location.href` (or a saved detail url) that still has `ctActionMode=ctBuilderV2`
 * nests the Visual Editor inside itself.
 */
export function sanitizeEditorSiteUrl (rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return rawUrl
  }
  try {
    const url = new URL(rawUrl)
    url.searchParams.delete('ctActionMode')
    if (url.hash) {
      const raw = url.hash.charAt(0) === '#' ? url.hash.slice(1) : url.hash
      const params = new URLSearchParams(raw)
      const hadEditorKey =
        params.has(WVE_FRAGMENT_KEYS.CT_EDITOR) ||
        params.has(WVE_FRAGMENT_KEYS.CT_PREVIEW) ||
        params.has(WVE_FRAGMENT_KEYS.CT_PERS)
      // Leave customer hashes alone (`#top`, `#/spa/route`). Only rewrite when our
      // transport keys are present — URLSearchParams would otherwise turn `#top` into `#top=`.
      if (hadEditorKey) {
        params.delete(WVE_FRAGMENT_KEYS.CT_EDITOR)
        params.delete(WVE_FRAGMENT_KEYS.CT_PREVIEW)
        params.delete(WVE_FRAGMENT_KEYS.CT_PERS)
        url.hash = params.toString()
      }
    }
    return url.toString()
  } catch (_) {
    return rawUrl
  }
}
