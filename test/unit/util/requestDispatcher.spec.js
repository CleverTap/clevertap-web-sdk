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
      RequestDispatcher.logger = {
        debug: jest.fn()
      }

      addToURL.mockImplementation((url, key, value) => `${url}&${key}=${value}`)
      compressData.mockImplementation(data => data)
      StorageManager._isLocalStorageSupported.mockReturnValue(true)
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
    })
  })
})
