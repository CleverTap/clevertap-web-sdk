export const OVERLAY_PATH = 'https://web-native-display-campaign.clevertap.com/production/lib-overlay/overlay.js'
export const CSS_PATH = 'https://web-native-display-campaign.clevertap.com/production/lib-overlay/style.css'
export const WVE_CLASS = {
  FLICKER_SHOW: 'wve-anti-flicker-show',
  FLICKER_HIDE: 'wve-anti-flicker-hide',
  FLICKER_ID: 'wve-flicker-style'
}
export const WVE_QUERY_PARAMS = {
  BUILDER: 'ctBuilder',
  PREVIEW: 'ctBuilderPreview',
  SDK_CHECK: 'ctBuilderSDKCheck',
  /** Server-session Visual Editor (v2) — distinct from legacy postMessage `ctBuilder`. */
  BUILDER_V2: 'ctBuilderV2',
  /** Server-session preview (v2) — distinct from legacy `ctBuilderPreview`. */
  PREVIEW_V2: 'ctPreviewV2'
}

export const WVE_FRAGMENT_KEYS = {
  CT_EDITOR: 'ctEditor',
  CT_PREVIEW: 'ctPreview'
}

export const WVE_EDITOR = {
  ACCOUNT_HEADER: 'X-CleverTap-Account-Id',
  /** Exposed for lib-overlay to call when `onSave` is not yet wired into a deployed overlay build. */
  BRIDGE_KEY: '__CT_VISUAL_EDITOR_V2__'
}

export const WVE_URL_ORIGIN = {
  CLEVERTAP: 'dashboard.clevertap.com',
  LOCAL: 'localhost'
}
