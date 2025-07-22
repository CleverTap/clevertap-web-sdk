// contextManager.js
export const CampaignContext = {
  _device: null,
  _session: null,
  _request: null,
  _logger: null,
  _msg: null,
  _region: null,

  // Initialize with context objects
  update (device, session, request, logger, msg, region) {
    this._device = device
    this._session = session
    this._request = request
    this._logger = logger
    this._msg = msg
    this._region = region
  },

  // Getters for clean access
  get device () {
    return this._device
  },
  get session () {
    return this._session
  },
  get request () {
    return this._request
  },
  get logger () {
    return this._logger
  },
  get msg () {
    return this._msg
  },
  get region () {
    return this._region
  }
}
