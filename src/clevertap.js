import options from './options'
export default class CleverTap {
  constructor (clevertap = {}) {
    this.options = {...options}
    this.event = clevertap.event || []
    this.profile = clevertap.profile || []
  }
}
