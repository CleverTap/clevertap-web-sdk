import 'regenerator-runtime/runtime'
import { CT_EIT_FALLBACK, INITIAL_RETRY_DELAY_MS, MAX_RETRY_DELAY_MS, OPTOUT_COOKIE_ENDSWITH } from '../../../src/util/constants'
import { compressData } from '../../../src/util/encoder'
import RequestDispatcher from '../../../src/util/requestDispatcher'
import { addToURL } from '../../../src/util/url'

const flushPromises = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

jest.enableAutomock().unmock('../../../src/util/requestDispatcher').unmock('../../../src/util/constants')
  .unmock('../../../src/util/datatypes')
  .unmock('../../../src/util/security/encryptionInTransit')

describe('util/requestDispatcher', function () {
  let dispatcher
  let mockInstanceManager

  function createDispatcher (overrides = {}) {
    const mockStorage = {
      _isLocalStorageSupported: jest.fn().mockReturnValue(true),
      read: jest.fn().mockReturnValue(false),
      save: jest.fn().mockReturnValue(true),
      remove: jest.fn().mockReturnValue(true),
      readFromLSorCookie: jest.fn().mockReturnValue(null),
      saveToLSorCookie: jest.fn(),
      getMetaProp: jest.fn().mockReturnValue(false),
      removeBackup: jest.fn()
    }

    mockInstanceManager = {
      isDefault: true,
      state: {
        blockRequest: false,
        isOptInRequest: false,
        globalCache: { REQ_N: 0, RESP_N: 0, gcookie: null }
      },
      isOULInProgress: false,
      oulReqN: 0,
      enableFetchApi: false,
      enableEncryptionInTransit: false,
      storage: mockStorage,
      ...overrides
    }

    const mockLogger = { debug: jest.fn(), error: jest.fn() }
    const mockDevice = { gcookie: null }
    const mockAccount = { id: 'test-account' }

    dispatcher = new RequestDispatcher({
      logger: mockLogger,
      device: mockDevice,
      account: mockAccount,
      instanceManager: mockInstanceManager
    })

    return dispatcher
  }

  describe('fire request', () => {
    beforeEach(() => {
      jest.clearAllMocks()

      createDispatcher()

      // Mock the handleFetchResponse method to avoid actual fetch calls
      dispatcher.handleFetchResponse = jest.fn().mockResolvedValue()

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
      window.clevertap = undefined
      window.wizrocket = undefined

      addToURL.mockImplementation((url, key, value) => `${url}&${key}=${value}`)
      compressData.mockImplementation(data => data)
    })

    describe('drop request due to opt out', () => {
      test('should drop request and log in debug if optout cookie (endsWith:00) is set', () => {
        dispatcher.device = {
          gcookie: '123' + OPTOUT_COOKIE_ENDSWITH
        }

        dispatcher.fireRequest('some', true, true)
        expect(dispatcher.logger.debug).toHaveBeenCalledWith(expect.stringContaining('123:OO'))
      })
    })

    describe('invalid gcookie value', () => {
      test('should retry request 50 times', () => {
        dispatcher.device = { gcookie: null }
        mockInstanceManager.state.globalCache.REQ_N = 2
        mockInstanceManager.state.globalCache.RESP_N = 0

        // sendOULFlag=false so retry logic applies (OUL requests skip retry)
        dispatcher.fireRequest('some', true, false)
        jest.advanceTimersByTime(49 * 50)
        expect(dispatcher.logger.debug).toHaveBeenNthCalledWith(49, expect.stringContaining('retrying fire request'))
      })
    })
  })

  describe('EIT JSONP Fallback Mechanism', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      localStorage.clear()
      createDispatcher()
    })

    describe('isEITFallbackActive', () => {
      test('should return false when fallback flag is not set', () => {
        mockInstanceManager.storage.read.mockReturnValue(false)
        expect(dispatcher.isEITFallbackActive()).toBe(false)
      })

      test('should return true when fallback flag is set', () => {
        mockInstanceManager.storage.read.mockReturnValue(true)
        expect(dispatcher.isEITFallbackActive()).toBe(true)
      })

      test('should return false when localStorage is not supported', () => {
        mockInstanceManager.storage._isLocalStorageSupported.mockReturnValue(false)
        expect(dispatcher.isEITFallbackActive()).toBe(false)
      })
    })

    describe('setEITFallback', () => {
      test('should set fallback flag in localStorage', () => {
        dispatcher.setEITFallback()
        expect(mockInstanceManager.storage.save).toHaveBeenCalledWith(CT_EIT_FALLBACK, true)
        expect(dispatcher.logger.debug).toHaveBeenCalledWith(
          'EIT fallback flag set - subsequent requests will use JSONP'
        )
      })

      test('should not set flag when localStorage is not supported', () => {
        mockInstanceManager.storage._isLocalStorageSupported.mockReturnValue(false)
        dispatcher.setEITFallback()
        expect(mockInstanceManager.storage.save).not.toHaveBeenCalled()
      })
    })

    describe('clearEITFallback', () => {
      test('should remove fallback flag from localStorage', () => {
        dispatcher.clearEITFallback()
        expect(mockInstanceManager.storage.remove).toHaveBeenCalledWith(CT_EIT_FALLBACK)
      })

      test('should not remove flag when localStorage is not supported', () => {
        mockInstanceManager.storage._isLocalStorageSupported.mockReturnValue(false)
        dispatcher.clearEITFallback()
        expect(mockInstanceManager.storage.remove).not.toHaveBeenCalled()
      })
    })

    describe('session reset behavior', () => {
      test('clearEITFallback should be called to reset fallback on new session', () => {
        mockInstanceManager.storage.save.mockClear()
        dispatcher.setEITFallback()
        expect(mockInstanceManager.storage.save).toHaveBeenCalledWith(CT_EIT_FALLBACK, true)

        mockInstanceManager.storage.remove.mockClear()
        dispatcher.clearEITFallback()
        expect(mockInstanceManager.storage.remove).toHaveBeenCalledWith(CT_EIT_FALLBACK)
      })
    })

    describe('fallback flag interaction with encryption setting', () => {
      test('isEITFallbackActive returns correct value based on storage read', () => {
        mockInstanceManager.storage.read.mockReturnValue(false)
        expect(dispatcher.isEITFallbackActive()).toBe(false)

        mockInstanceManager.storage.read.mockReturnValue(true)
        expect(dispatcher.isEITFallbackActive()).toBe(true)
      })

      test('setEITFallback saves the correct key and value', () => {
        dispatcher.setEITFallback()
        expect(mockInstanceManager.storage.save).toHaveBeenCalledWith(CT_EIT_FALLBACK, true)
      })

      test('clearEITFallback removes the correct key', () => {
        dispatcher.clearEITFallback()
        expect(mockInstanceManager.storage.remove).toHaveBeenCalledWith(CT_EIT_FALLBACK)
      })
    })
  })

  describe('retry mechanism', () => {
    let retryDispatcher
    let retryMockInstanceManager

    // Pulls the delay in ms out of a "Retrying request in <ms>ms: <url>" debug log call
    const lastRetryDelay = () => {
      const call = retryDispatcher.logger.debug.mock.calls
        .find(c => typeof c[0] === 'string' && c[0].startsWith('Retrying request in'))
      return call ? parseInt(call[0].match(/Retrying request in (\d+)ms/)[1]) : undefined
    }

    beforeEach(() => {
      jest.clearAllMocks()

      retryDispatcher = createDispatcher({
        enableEncryptionInTransit: false,
        enableFetchApi: false
      })

      retryMockInstanceManager = mockInstanceManager

      // handleFetchResponse is already the real method from createDispatcher()

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
        retryDispatcher.device = { gcookie: 'gc123' }
        retryMockInstanceManager.state.blockRequest = false
        retryMockInstanceManager.state.isOptInRequest = false
        retryMockInstanceManager.state.globalCache = { REQ_N: 0, RESP_N: 0 }

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
        retryDispatcher.fireRequest('http://x.com?d=abc')
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
        retryDispatcher.fireRequest('http://x.com?d=abc')
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

        retryDispatcher.fireRequest('http://x.com?d=abc')
        await flushPromises()

        const delays = []
        for (let i = 0; i < 4; i++) {
          retryDispatcher.logger.debug.mockClear()
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

        retryDispatcher.fireRequest('http://x.com?d=abc')
        await flushPromises()

        // Enough consecutive failures for 1000 * 2^n to exceed MAX_RETRY_DELAY_MS and get capped
        let cappedDelay
        for (let i = 0; i < 12; i++) {
          retryDispatcher.logger.debug.mockClear()
          createdScripts[createdScripts.length - 1].onerror()
          jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
          cappedDelay = lastRetryDelay()
        }
        expect(cappedDelay).toBe(MAX_RETRY_DELAY_MS * 0.5)

        // The very next retry after hitting the cap should restart from the initial delay
        retryDispatcher.logger.debug.mockClear()
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

        retryDispatcher.handleFetchResponse('http://x.com?d=encrypted', 'http://x.com?d=original')
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

        retryDispatcher.handleFetchResponse('http://x.com?d=abc', 'http://x.com?d=abc')
        await flushPromises()

        expect(global.fetch).toHaveBeenCalledTimes(1)
        expect(retryDispatcher.logger.error).toHaveBeenCalledWith('Network response was not ok', expect.any(Error))

        jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
        await flushPromises()

        expect(global.fetch).toHaveBeenCalledTimes(2)
        expect(global.fetch).toHaveBeenNthCalledWith(2, 'http://x.com?d=abc', expect.any(Object))
      })

      test('should keep retrying across multiple consecutive network failures', async () => {
        global.fetch = jest.fn().mockResolvedValue(failedResponse())

        retryDispatcher.handleFetchResponse('http://x.com?d=abc', 'http://x.com?d=abc')
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

        retryDispatcher.handleFetchResponse('http://x.com?d=abc', 'http://x.com?d=abc')
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

        retryDispatcher.handleFetchResponse('http://x.com?d=encrypted', 'http://x.com?d=original')
        await flushPromises()

        jest.advanceTimersByTime(MAX_RETRY_DELAY_MS)
        await flushPromises()

        // still only the original call - the retry went via JSONP, not another fetch
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })
})
