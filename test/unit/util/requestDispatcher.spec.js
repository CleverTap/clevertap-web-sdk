import 'regenerator-runtime/runtime'
import { OPTOUT_COOKIE_ENDSWITH, CT_EIT_FALLBACK } from '../../../src/util/constants'
import { compressData } from '../../../src/util/encoder'
import RequestDispatcher from '../../../src/util/requestDispatcher'
import { addToURL } from '../../../src/util/url'

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
      getMetaProp: jest.fn().mockReturnValue(false)
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

        dispatcher.fireRequest('some', true, true)
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
})
