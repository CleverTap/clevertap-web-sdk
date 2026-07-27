import 'regenerator-runtime/runtime'
import { CT_EIT_FALLBACK, INITIAL_RETRY_DELAY_MS, MAX_RETRY_DELAY_MS } from '../../../src/util/constants'
import { compressData } from '../../../src/util/encoder'
import RequestDispatcher from '../../../src/util/requestDispatcher'
import { $ct, StorageManager } from '../../../src/util/storage'
import { addToURL } from '../../../src/util/url'

const flushPromises = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

const OriginalHandleFetchResponse = RequestDispatcher.handleFetchResponse

jest.enableAutomock().unmock('../../../src/util/requestDispatcher').unmock('../../../src/util/constants')
  .unmock('../../../src/util/datatypes')
  .unmock('../../../src/util/security/encryptionInTransit')

describe('util/requestDispatcher', function () {
  describe('fire request', () => {
    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks()

      RequestDispatcher.logger = {
        debug: jest.fn(),
        error: jest.fn()
      }

      // Mock the handleFetchResponse method to avoid actual fetch calls
      RequestDispatcher.handleFetchResponse = jest.fn().mockResolvedValue()

      // Mock $ct object completely
      Object.assign($ct, {
        enableFetchApi: false,
        blockRequest: false,
        isOptInRequest: false,
        globalCache: {
          REQ_N: 0,
          RESP_N: 0
        }
      })

      // Mock DOM methods
      document.getElementsByClassName = jest.fn().mockReturnValue([])
      document.createElement = jest.fn().mockReturnValue({
        setAttribute: jest.fn(),
        async: true
      })
      document.getElementsByTagName = jest.fn().mockReturnValue([{
        appendChild: jest.fn()
      }])

      // Mock window properties
      window.isOULInProgress = false
      window.clevertap = undefined
      window.wizrocket = undefined
      window.$WZRK_WR = {
        tr: jest.fn(),
        s: jest.fn(),
        enableWebPush: jest.fn()
      }

      addToURL.mockImplementation((url, key, value) => `${url}&${key}=${value}`)
      compressData.mockImplementation(data => data)
      StorageManager._isLocalStorageSupported.mockReturnValue(true)
      StorageManager.getMetaProp.mockReturnValue(false)
      StorageManager.readFromLSorCookie.mockReturnValue(null)
      StorageManager.read.mockReturnValue(false)

      // Reset encryption settings
      RequestDispatcher.enableEncryptionInTransit = false
      RequestDispatcher.enableFetchApi = false
    })

    describe('invalid gcookie value', () => {
      test('should retry request 50 times', () => {
        RequestDispatcher.device = {
          gcookie: null
        }

        $ct.globalCache.REQ_N = 2
        $ct.globalCache.RESP_N = 0

        RequestDispatcher.fireRequest('some', true, true)
        jest.advanceTimersByTime(49 * 50)
        expect(RequestDispatcher.logger.debug).toHaveBeenNthCalledWith(49, expect.stringContaining('retrying fire request'))
      })
    })
  })

  describe('EIT JSONP Fallback Mechanism', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      localStorage.clear()

      RequestDispatcher.logger = {
        debug: jest.fn(),
        error: jest.fn()
      }

      RequestDispatcher.enableEncryptionInTransit = false
      RequestDispatcher.enableFetchApi = false

      StorageManager._isLocalStorageSupported.mockReturnValue(true)
      StorageManager.read.mockReturnValue(false)
      StorageManager.save.mockReturnValue(true)
      StorageManager.remove.mockReturnValue(true)
    })

    describe('isEITFallbackActive', () => {
      test('should return false when fallback flag is not set', () => {
        StorageManager.read.mockReturnValue(false)
        expect(RequestDispatcher.isEITFallbackActive()).toBe(false)
      })

      test('should return true when fallback flag is set', () => {
        StorageManager.read.mockReturnValue(true)
        expect(RequestDispatcher.isEITFallbackActive()).toBe(true)
      })

      test('should return false when localStorage is not supported', () => {
        StorageManager._isLocalStorageSupported.mockReturnValue(false)
        expect(RequestDispatcher.isEITFallbackActive()).toBe(false)
      })
    })

    describe('setEITFallback', () => {
      test('should set fallback flag in localStorage', () => {
        RequestDispatcher.setEITFallback()
        expect(StorageManager.save).toHaveBeenCalledWith(CT_EIT_FALLBACK, true)
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(
          'EIT fallback flag set - subsequent requests will use JSONP'
        )
      })

      test('should not set flag when localStorage is not supported', () => {
        StorageManager._isLocalStorageSupported.mockReturnValue(false)
        RequestDispatcher.setEITFallback()
        expect(StorageManager.save).not.toHaveBeenCalled()
      })
    })

    describe('clearEITFallback', () => {
      test('should remove fallback flag from localStorage', () => {
        RequestDispatcher.clearEITFallback()
        expect(StorageManager.remove).toHaveBeenCalledWith(CT_EIT_FALLBACK)
      })

      test('should not remove flag when localStorage is not supported', () => {
        StorageManager._isLocalStorageSupported.mockReturnValue(false)
        RequestDispatcher.clearEITFallback()
        expect(StorageManager.remove).not.toHaveBeenCalled()
      })
    })

    describe('session reset behavior', () => {
      test('clearEITFallback should be called to reset fallback on new session', () => {
        // Set fallback flag
        StorageManager.save.mockClear()
        RequestDispatcher.setEITFallback()
        expect(StorageManager.save).toHaveBeenCalledWith(CT_EIT_FALLBACK, true)

        // Clear fallback flag (simulating init)
        StorageManager.remove.mockClear()
        RequestDispatcher.clearEITFallback()
        expect(StorageManager.remove).toHaveBeenCalledWith(CT_EIT_FALLBACK)
      })
    })

    describe('fallback flag interaction with encryption setting', () => {
      test('isEITFallbackActive returns correct value based on storage read', () => {
        // When not set
        StorageManager.read.mockReturnValue(false)
        expect(RequestDispatcher.isEITFallbackActive()).toBe(false)

        // When set
        StorageManager.read.mockReturnValue(true)
        expect(RequestDispatcher.isEITFallbackActive()).toBe(true)
      })

      test('setEITFallback saves the correct key and value', () => {
        RequestDispatcher.setEITFallback()

        expect(StorageManager.save).toHaveBeenCalledWith(CT_EIT_FALLBACK, true)
      })

      test('clearEITFallback removes the correct key', () => {
        RequestDispatcher.clearEITFallback()

        expect(StorageManager.remove).toHaveBeenCalledWith(CT_EIT_FALLBACK)
      })
    })
  })

  describe('retry mechanism', () => {
    // Pulls the delay in ms out of a "Retrying request in <ms>ms: <url>" debug log call
    const lastRetryDelay = () => {
      const call = RequestDispatcher.logger.debug.mock.calls
        .find(c => typeof c[0] === 'string' && c[0].startsWith('Retrying request in'))
      return call ? parseInt(call[0].match(/Retrying request in (\d+)ms/)[1]) : undefined
    }

    beforeEach(() => {
      jest.clearAllMocks()

      RequestDispatcher.handleFetchResponse = OriginalHandleFetchResponse

      RequestDispatcher.logger = {
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn()
      }

      RequestDispatcher.enableEncryptionInTransit = false
      RequestDispatcher.enableFetchApi = false

      StorageManager._isLocalStorageSupported.mockReturnValue(true)
      StorageManager.getMetaProp.mockReturnValue(false)
      StorageManager.readFromLSorCookie.mockReturnValue(null)
      StorageManager.read.mockReturnValue(false)
      StorageManager.save.mockReturnValue(true)
      StorageManager.saveToLSorCookie.mockReturnValue(true)

      addToURL.mockImplementation((url, key, value) => `${url}&${key}=${value}`)
      compressData.mockImplementation(data => data)

      window.$WZRK_WR = {
        tr: jest.fn(),
        s: jest.fn(),
        enableWebPush: jest.fn()
      }
    })

    afterEach(() => {
      jest.clearAllTimers()
      jest.restoreAllMocks()
      delete global.fetch
    })

    describe('JSONP retry (script tag onerror)', () => {
      let createdScripts

      beforeEach(() => {
        RequestDispatcher.device = { gcookie: 'gc123' }
        Object.assign($ct, {
          blockRequest: false,
          isOptInRequest: false,
          globalCache: { REQ_N: 0, RESP_N: 0 }
        })

        createdScripts = []
        document.getElementsByClassName = jest.fn().mockReturnValue([])
        document.createElement = jest.fn().mockImplementation(() => {
          const script = { setAttribute: jest.fn(), async: true }
          createdScripts.push(script)
          return script
        })
        document.getElementsByTagName = jest.fn().mockReturnValue([{ appendChild: jest.fn() }])
      })

      test('should attach an onerror handler on the injected script that schedules a retry', async () => {
        RequestDispatcher.fireRequest('http://x.com?d=abc')
        await flushPromises()

        expect(createdScripts.length).toBe(1)
        expect(typeof createdScripts[0].onerror).toBe('function')

        createdScripts[0].onerror()
        // retry is scheduled behind a delay, so no new script is injected synchronously
        expect(createdScripts.length).toBe(1)

        jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)

        expect(createdScripts.length).toBe(2)
        expect(createdScripts[1].setAttribute).toHaveBeenCalledWith('src', expect.stringContaining('http://x.com?d=abc'))
      })

      test('should use a delay within the 50%-100% jitter window of the initial retry delay for the first retry', async () => {
        RequestDispatcher.fireRequest('http://x.com?d=abc')
        await flushPromises()

        jest.spyOn(Math, 'random').mockReturnValue(0)
        createdScripts[0].onerror()

        jest.advanceTimersByTime(INITIAL_RETRY_DELAY_MS / 2 - 1)
        expect(createdScripts.length).toBe(1)

        jest.advanceTimersByTime(1)
        expect(createdScripts.length).toBe(2)
      })

      test('should double the retry delay on each successive failure (exponential backoff)', async () => {
        jest.spyOn(Math, 'random').mockReturnValue(0) // removes jitter randomness -> delay = retryDelay * 0.5

        RequestDispatcher.fireRequest('http://x.com?d=abc')
        await flushPromises()

        const delays = []
        for (let i = 0; i < 4; i++) {
          RequestDispatcher.logger.debug.mockClear()
          createdScripts[createdScripts.length - 1].onerror()
          jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
          delays.push(lastRetryDelay())
        }

        expect(delays).toEqual([
          INITIAL_RETRY_DELAY_MS * 0.5,
          INITIAL_RETRY_DELAY_MS * 2 * 0.5,
          INITIAL_RETRY_DELAY_MS * 4 * 0.5,
          INITIAL_RETRY_DELAY_MS * 8 * 0.5
        ])
      })

      test('should cap the retry delay at MAX_RETRY_DELAY_MS and restart from the initial delay on the following retry', async () => {
        jest.spyOn(Math, 'random').mockReturnValue(0) // removes jitter randomness -> delay = retryDelay * 0.5

        RequestDispatcher.fireRequest('http://x.com?d=abc')
        await flushPromises()

        // Enough consecutive failures for 1000 * 2^n to exceed MAX_RETRY_DELAY_MS and get capped
        let cappedDelay
        for (let i = 0; i < 12; i++) {
          RequestDispatcher.logger.debug.mockClear()
          createdScripts[createdScripts.length - 1].onerror()
          jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
          cappedDelay = lastRetryDelay()
        }
        expect(cappedDelay).toBe(MAX_RETRY_DELAY_MS * 0.5)

        // The very next retry after hitting the cap should restart from the initial delay
        RequestDispatcher.logger.debug.mockClear()
        createdScripts[createdScripts.length - 1].onerror()
        jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
        expect(lastRetryDelay()).toBe(INITIAL_RETRY_DELAY_MS * 0.5)
      })
    })

    describe('JSONP fallback retry (server rejects encryption in transit)', () => {
      let createdScripts

      beforeEach(() => {
        createdScripts = []
        document.getElementsByClassName = jest.fn().mockReturnValue([])
        document.createElement = jest.fn().mockImplementation(() => {
          const script = { setAttribute: jest.fn(), async: true }
          createdScripts.push(script)
          return script
        })
        document.getElementsByTagName = jest.fn().mockReturnValue([{ appendChild: jest.fn() }])
      })

      test('should retry the original (unencrypted) url via JSONP, with its own retry-capable onerror handler', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 402,
          statusText: 'Payment Required',
          headers: { get: () => null }
        })

        RequestDispatcher.handleFetchResponse('http://x.com?d=encrypted', 'http://x.com?d=original')
        await flushPromises()

        expect(createdScripts.length).toBe(1)
        expect(createdScripts[0].setAttribute).toHaveBeenCalledWith('src', 'http://x.com?d=original')
        expect(typeof createdScripts[0].onerror).toBe('function')

        createdScripts[0].onerror()
        jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)

        expect(createdScripts.length).toBe(2)
      })
    })

    describe('Fetch retry (network errors via handleFetchResponse)', () => {
      const failedResponse = (status = 500, statusText = 'Internal Server Error') => ({
        ok: false,
        status,
        statusText,
        headers: { get: () => null }
      })

      const okResponse = (body = '{}') => ({
        ok: true,
        headers: { get: () => null },
        text: () => Promise.resolve(body)
      })

      test('should retry via fetch when the response is not ok', async () => {
        global.fetch = jest.fn().mockResolvedValue(failedResponse())

        RequestDispatcher.handleFetchResponse('http://x.com?d=abc', 'http://x.com?d=abc')
        await flushPromises()

        expect(global.fetch).toHaveBeenCalledTimes(1)
        expect(RequestDispatcher.logger.error).toHaveBeenCalledWith('Network response was not ok', expect.any(Error))

        jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
        await flushPromises()

        expect(global.fetch).toHaveBeenCalledTimes(2)
        expect(global.fetch).toHaveBeenNthCalledWith(2, 'http://x.com?d=abc', expect.any(Object))
      })

      test('should keep retrying across multiple consecutive network failures', async () => {
        global.fetch = jest.fn().mockResolvedValue(failedResponse())

        RequestDispatcher.handleFetchResponse('http://x.com?d=abc', 'http://x.com?d=abc')
        await flushPromises()

        for (let i = 0; i < 3; i++) {
          jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
          await flushPromises()
        }

        expect(global.fetch).toHaveBeenCalledTimes(4)
      })

      test('should stop retrying once a subsequent attempt succeeds', async () => {
        global.fetch = jest.fn()
          .mockResolvedValueOnce(failedResponse())
          .mockResolvedValueOnce(okResponse())

        RequestDispatcher.handleFetchResponse('http://x.com?d=abc', 'http://x.com?d=abc')
        await flushPromises()

        jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
        await flushPromises()
        expect(global.fetch).toHaveBeenCalledTimes(2)

        jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
        await flushPromises()
        // no further retry scheduled after a successful response
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })

      test('should not retry for a 402/419 (encryption disabled) response - it falls back to JSONP instead', async () => {
        global.fetch = jest.fn().mockResolvedValue(failedResponse(419, 'Encryption not enabled'))
        document.getElementsByClassName = jest.fn().mockReturnValue([])
        document.createElement = jest.fn().mockReturnValue({ setAttribute: jest.fn(), async: true })
        document.getElementsByTagName = jest.fn().mockReturnValue([{ appendChild: jest.fn() }])

        RequestDispatcher.handleFetchResponse('http://x.com?d=encrypted', 'http://x.com?d=original')
        await flushPromises()

        jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
        await flushPromises()

        // still only the original call - the retry went via JSONP, not another fetch
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })
})
