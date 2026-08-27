import _tr from '../util/tr'

const MAX_CONCURRENT = 5
const REQUEST_TIMEOUT_MS = 10000

export default class ContentFetchManager {
  #logger
  #account
  #request
  #instanceManager
  #inFlightCount = 0
  #abortControllers = []

  constructor ({ logger, account, request, instanceManager }) {
    this.#logger = logger
    this.#account = account
    this.#request = request
    this.#instanceManager = instanceManager
  }

  /**
   * Called from _tr() when the server response contains a content_fetch array.
   * Builds the payload and sends a POST request to /content.
   * @param {Array} contentFetchItems - the content_fetch array from the response
   * @param {object} trDeps - dependencies for processing the response: { device, session, request, logger, region, instanceManager, instance }
   */
  handleContentFetch (contentFetchItems, trDeps) {
    if (!contentFetchItems || contentFetchItems.length === 0) {
      return
    }

    this.#logger.debug('ContentFetchManager: received ' + contentFetchItems.length + ' content_fetch items')

    const payload = this.#buildPayload(contentFetchItems)
    if (!payload) {
      this.#logger.debug('ContentFetchManager: failed to build payload')
      return
    }

    this.#sendContentFetchRequest(payload, trDeps)
  }

  /**
   * Builds the request payload: [metaHeader, event1, event2, ...]
   * The meta header contains system data (id, g, af, arp, etc.)
   * Each event wraps a content_fetch item with event metadata.
   */
  #buildPayload (contentFetchItems) {
    try {
      // Build meta header with system data
      const header = this.#request.addSystemDataToObject({ type: 'meta' }, undefined)
      this.#request.addFlags(header)

      // Build event entries for each content_fetch item
      const events = []
      const session = this.#instanceManager.state.globalCache
      const now = Math.floor(Date.now() / 1000)

      for (let i = 0; i < contentFetchItems.length; i++) {
        const item = contentFetchItems[i]
        const event = {
          type: 'event',
          evtName: 'content_fetch',
          s: session.s || 0,
          pg: header.pg || 1,
          ep: now,
          f: false,
          evtData: item
        }
        events.push(event)
      }

      // Serialize: [header, event1, event2, ...]
      const payloadArray = [header, ...events]
      return JSON.stringify(payloadArray)
    } catch (e) {
      this.#logger.error('ContentFetchManager: error building payload', e)
      return null
    }
  }

  /**
   * Sends a POST request to the /content endpoint.
   * - Max 5 concurrent requests
   * - 10-second timeout per request
   * - No retries on failure
   * - On success: processes response via _tr() (same as /a1 response)
   */
  #sendContentFetchRequest (payload, trDeps) {
    if (this.#inFlightCount >= MAX_CONCURRENT) {
      this.#logger.debug('ContentFetchManager: max concurrent requests reached (' + MAX_CONCURRENT + '). Dropping request.')
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

    this.#logger.debug('ContentFetchManager: sending request to ' + url)

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      signal: abortController.signal
    })
      .then(response => {
        clearTimeout(timeoutId)

        if (response.ok) {
          return response.json()
        }

        if (response.status === 429) {
          this.#logger.info('ContentFetchManager: rate limited (429)')
        } else {
          this.#logger.error('ContentFetchManager: request failed with status ' + response.status)
        }
        return null
      })
      .then(data => {
        if (data) {
          this.#logger.debug('ContentFetchManager: response received, processing via _tr()')
          // Process response through the same _tr() pipeline as /a1
          _tr(data, trDeps)
        }
      })
      .catch(err => {
        clearTimeout(timeoutId)
        if (err.name === 'AbortError') {
          this.#logger.debug('ContentFetchManager: request aborted (timeout or user switch)')
        } else {
          this.#logger.error('ContentFetchManager: request error', err)
        }
      })
      .finally(() => {
        this.#inFlightCount--
        const idx = this.#abortControllers.indexOf(abortController)
        if (idx > -1) {
          this.#abortControllers.splice(idx, 1)
        }
      })
  }

  /**
   * Cancels all in-flight content_fetch requests.
   * Called during user switch (OUL) to prevent stale data from being processed.
   */
  cancelAll () {
    this.#logger.debug('ContentFetchManager: cancelling all pending requests')
    this.#abortControllers.forEach(controller => {
      try { controller.abort() } catch (e) { /* ignore */ }
    })
    this.#abortControllers = []
    this.#inFlightCount = 0
  }
}
