import _tr from '../util/tr'
import { webNativeDisplayCampaignUtils } from '../util/campaignRender/utilities'

const MAX_CONCURRENT = 5
const REQUEST_TIMEOUT_MS = 10000

export default class ContentFetchManager {
  #logger
  #account
  #request
  #instanceManager
  #inFlightCount = 0
  #abortControllers = []
  #unloadHandler = null

  constructor ({ logger, account, request, instanceManager }) {
    this.#logger = logger
    this.#account = account
    this.#request = request
    this.#instanceManager = instanceManager

    this.#unloadHandler = () => this.cancelAll()
    window.addEventListener('beforeunload', this.#unloadHandler)
  }

  handleContentFetch (contentFetchItems, trDeps, deferredNotifs) {
    if (!contentFetchItems || contentFetchItems.length === 0) {
      return
    }

    const payload = this.#buildPayload(contentFetchItems)
    if (!payload) {
      if (deferredNotifs && deferredNotifs.length > 0) {
        _tr({ inapp_notifs: deferredNotifs }, trDeps)
      }
      return
    }

    this.#sendRequest(payload, trDeps, deferredNotifs)
  }

  #buildPayload (contentFetchItems) {
    try {
      const header = this.#request.addSystemDataToObject({ type: 'meta' }, undefined)
      this.#request.addFlags(header)

      const events = contentFetchItems.map(item => ({
        type: 'event',
        evtName: 'content_fetch',
        s: header.s,
        pg: header.pg || 1,
        evtData: item
      }))

      return JSON.stringify([header, ...events])
    } catch (e) {
      this.#logger.error('ContentFetchManager: error building payload - ' + e.message)
      return null
    }
  }

  #sendRequest (payload, trDeps, deferredNotifs) {
    if (this.#inFlightCount >= MAX_CONCURRENT) {
      this.#logger.debug('ContentFetchManager: max concurrent requests reached, dropping')
      if (deferredNotifs && deferredNotifs.length > 0) {
        _tr({ inapp_notifs: deferredNotifs }, trDeps)
      }
      return
    }

    const url = this.#account.contentURL +
      '?os=Web' +
      '&t=web-sdk-v$$PACKAGE_VERSION$$' +
      '&z=' + encodeURIComponent(this.#account.id) +
      '&ts=' + Math.floor(Date.now() / 1000)

    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS)

    this.#abortControllers.push(abortController)
    this.#inFlightCount++

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      signal: abortController.signal
    })
      .then(response => {
        if (response.status === 429) {
          this.#logger.info('ContentFetchManager: rate limited (429)')
          return null
        }

        if (!response.ok) {
          this.#logger.error('ContentFetchManager: request failed with status ' + response.status)
          return null
        }

        return response.json()
      })
      .then(data => {
        if (data) {
          if (deferredNotifs && deferredNotifs.length > 0) {
            if (!data.inapp_notifs) {
              data.inapp_notifs = []
            }
            data.inapp_notifs = webNativeDisplayCampaignUtils.mergeCampaignsByPriority(
              data.inapp_notifs, deferredNotifs
            )
          }
          _tr(data, trDeps)
        } else if (deferredNotifs && deferredNotifs.length > 0) {
          _tr({ inapp_notifs: deferredNotifs }, trDeps)
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          return
        }
        this.#logger.error('ContentFetchManager: request error - ' + err.message)
        if (deferredNotifs && deferredNotifs.length > 0) {
          _tr({ inapp_notifs: deferredNotifs }, trDeps)
        }
      })
      .finally(() => {
        clearTimeout(timeoutId)
        this.#inFlightCount--
        const idx = this.#abortControllers.indexOf(abortController)
        if (idx > -1) {
          this.#abortControllers.splice(idx, 1)
        }
      })
  }

  cancelAll () {
    this.#abortControllers.forEach(controller => {
      try { controller.abort() } catch (e) { /* ignore */ }
    })
    this.#abortControllers = []
    this.#inFlightCount = 0
  }

  destroy () {
    this.cancelAll()
    if (this.#unloadHandler) {
      window.removeEventListener('beforeunload', this.#unloadHandler)
      this.#unloadHandler = null
    }
  }
}
