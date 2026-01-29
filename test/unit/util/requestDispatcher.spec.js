import 'regenerator-runtime/runtime'
import { OPTOUT_COOKIE_ENDSWITH, CT_EIT_FALLBACK } from '../../../src/util/constants'
import { compressData } from '../../../src/util/encoder'
import RequestDispatcher from '../../../src/util/requestDispatcher'
import { $ct, StorageManager } from '../../../src/util/storage'
import { addToURL } from '../../../src/util/url'

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

    describe('drop request due to opt out', () => {
      test('should drop request and log in debug if optout cookie (endsWith:00) is set', () => {
        RequestDispatcher.device = {
          gcookie: '123' + OPTOUT_COOKIE_ENDSWITH
        }

        RequestDispatcher.fireRequest('some', true, true)
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(expect.stringContaining('123:OO'))
      })
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
})
