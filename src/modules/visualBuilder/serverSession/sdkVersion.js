/**
 * Encodes a semver string into a comparable integer for LC's `web-editor-min-sdk-version` gate.
 * `major*10000 + minor*100 + patch` — e.g. `3.0.0` → `30000`, `1.13.1` → `11301`.
 */
export function encodeSdkVersion (version = '$$PACKAGE_VERSION$$') {
  if (typeof version !== 'string' || !version) {
    return 0
  }
  const parts = version.split('.')
  const major = parseInt(parts[0], 10)
  const minor = parseInt(parts[1], 10)
  const patch = parseInt(parts[2], 10)
  if (Number.isNaN(major)) {
    return 0
  }
  return (major * 10000) +
    ((Number.isNaN(minor) ? 0 : minor) * 100) +
    (Number.isNaN(patch) ? 0 : patch)
}
