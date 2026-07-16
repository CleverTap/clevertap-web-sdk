import CleverTap from './clevertap'

// Read the pre-config before overwriting window.clevertap
const preConfig = window.clevertap

const clevertap = new CleverTap(preConfig)

// Attach createInstance on the default instance for easy access
clevertap.createInstance = CleverTap.createInstance.bind(CleverTap)
clevertap.CleverTap = CleverTap

window.clevertap = window.wizrocket = clevertap

// Auto-create additional instances from pre-config.
// Usage: clevertap.instances = [{ accountId: 'ACC2', region: 'r2', privacy: [{useIP: true}] }]
if (Array.isArray(preConfig?.instances)) {
  preConfig.instances.forEach(config => {
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
  })
}

export default clevertap
