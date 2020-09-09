import options from './options'
export default class CleverTap {
  constructor (clevertap = {}) {
    this.options = {...options}
    this.event = Array.isArray(clevertap.event) ? clevertap.event : []
    this.profile = Array.isArray(clevertap.profile) ? clevertap.profile : []
    this.account = Array.isArray(clevertap.account) ? clevertap.account : []
    this.onUserLogin = Array.isArray(clevertap.onUserLogin) ? clevertap.onUserLogin : []
    this.notifications = Array.isArray(clevertap.notifications) ? clevertap.notifications : []
    this.privacy = Array.isArray(clevertap.privacy) ? clevertap.privacy : []
  }
  
  init () {
    // Initialize the plugin
  }
}
