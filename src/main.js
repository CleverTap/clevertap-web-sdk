import CleverTap from './clevertap'

// Read the pre-config before overwriting window.clevertap
const preConfig = window.clevertap

const clevertap = new CleverTap(preConfig)

// Attach createInstance on the default instance for easy access
clevertap.createInstance = CleverTap.createInstance.bind(CleverTap)
clevertap.CleverTap = CleverTap

window.clevertap = window.wizrocket = clevertap

// Auto-create additional instances from account config.
// Additional instances are account objects with { id: '...' } pushed after the default:
//   clevertap.account.push({ id: 'ACC1' }, 'region1', 'domain1')   // default (indices 0-2)
//   clevertap.account.push({ id: 'ACC2', region: 'r2', targetDomain: 'd2' })  // additional
const accounts = preConfig?.account || []
for (let i = 3; i < accounts.length; i++) {
  if (accounts[i] && typeof accounts[i] === 'object' && accounts[i].id) {
    CleverTap.createInstance({
      accountId: accounts[i].id,
      region: accounts[i].region,
      targetDomain: accounts[i].targetDomain
    })
  }
}

export default clevertap
