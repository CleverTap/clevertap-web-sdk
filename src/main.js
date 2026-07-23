import CleverTap from './clevertap'

// Read the pre-config before overwriting window.clevertap
const preConfig = window.clevertap

// If no default account is specified but instances are configured,
// use the first instance as the default (matches Android SDK behavior).
const hasDefaultAccount = preConfig?.account?.[0]?.id
const instances = Array.isArray(preConfig?.instances) ? preConfig.instances : []

let defaultConfig = preConfig
if (!hasDefaultAccount && instances.length > 0) {
  const first = instances[0]
  defaultConfig = {
    ...preConfig,
    account: [{ id: first.accountId }, first.region, first.targetDomain, first.token],
    privacy: first.privacy || preConfig?.privacy || []
  }
}

const clevertap = new CleverTap(defaultConfig)

// Attach createInstance on the default instance for easy access
clevertap.createInstance = CleverTap.createInstance.bind(CleverTap)
clevertap.CleverTap = CleverTap

window.clevertap = window.wizrocket = clevertap

// Auto-create additional instances from pre-config.
// Skip the first entry if it was promoted to default above.
const startIdx = (!hasDefaultAccount && instances.length > 0) ? 1 : 0
for (let i = startIdx; i < instances.length; i++) {
  const config = instances[i]
  if (config && config.accountId) {
    const instance = CleverTap.createInstance({
      accountId: config.accountId,
      region: config.region,
      targetDomain: config.targetDomain,
      token: config.token
    })
    if (instance && Array.isArray(config.privacy)) {
      config.privacy.forEach(p => instance.privacy.push(p))
    }
  }
}

export default clevertap
