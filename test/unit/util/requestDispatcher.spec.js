import 'regenerator-runtime/runtime'
import { ARP_COOKIE, OPTOUT_COOKIE_ENDSWITH } from '../../../src/util/constants'
import { compressData } from '../../../src/util/encoder'
import RequestDispatcher from '../../../src/util/requestDispatcher'
import { $ct, StorageManager } from '../../../src/util/storage'
import { addToURL } from '../../../src/util/url'

jest.enableAutomock().unmock('../../../src/util/requestDispatcher').unmock('../../../src/util/constants')
  .unmock('../../../src/util/datatypes')

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

    describe('valid gcookie value', () => {
      beforeEach(() => {
        RequestDispatcher.device = {
          gcookie: '123'
        }
      })

      test('should add arp object and gc when sendOUL flag is false and skipARP is true', () => {
        RequestDispatcher.fireRequest('test url', true, false)
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(expect.stringContaining('gc=123'))
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(expect.stringContaining('arp={"skipResARP":true}'))
      })

      test('should not add arp to query when skipArp is false but arp is not present in local storage', () => {
        localStorage.clear()
        RequestDispatcher.fireRequest('test url', false, false)
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(expect.not.stringContaining('arp'))
      })

      test('should add arp to query when skipArp is false and arp object is present in local storage', () => {
        localStorage.clear()
        const mockArpObject = 'mockArpObject'
        localStorage.setItem(ARP_COOKIE, mockArpObject)
        StorageManager.readFromLSorCookie.mockReturnValue(mockArpObject)
        RequestDispatcher.fireRequest('test url', false, false)
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(expect.stringContaining('arp="mockArpObject"'))
        // cleanup after test
        localStorage.clear()
      })

      test('should add ct_pl to url when clevertap.plugin is present', () => {
        window.clevertap = {
          plugin: 'testPlugin'
        }
        RequestDispatcher.fireRequest('test url', false, false)
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(expect.stringContaining('ct_pl=testPlugin'))
      })

      test('should replace "chrome-extension:" in the url with "https:"', () => {
        RequestDispatcher.fireRequest('chrome-extension://testUrl')
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(expect.stringContaining('https://testUrl'))
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(expect.not.stringContaining('chrome-extension://testUrl'))
      })

      describe('fetch API feature flag', () => {
        test('should use script tag when enableFetchApi is false', () => {
          $ct.enableFetchApi = false
          const mockAppendChild = jest.fn()
          document.getElementsByTagName = jest.fn().mockReturnValue([{ appendChild: mockAppendChild }])
          document.createElement = jest.fn().mockReturnValue({
            setAttribute: jest.fn()
          })
          document.getElementsByClassName = jest.fn().mockReturnValue([])

          RequestDispatcher.fireRequest('test url', false, false)

          expect(RequestDispatcher.handleFetchResponse).not.toHaveBeenCalled()
          expect(mockAppendChild).toHaveBeenCalled()
        })

        test('should use fetch API when enableFetchApi is true', () => {
          $ct.enableFetchApi = true

          RequestDispatcher.fireRequest('test url', false, false)

          expect(RequestDispatcher.handleFetchResponse).toHaveBeenCalled()
        })
      })
    })
  })
})
