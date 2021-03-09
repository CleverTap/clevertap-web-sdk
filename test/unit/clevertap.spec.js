import Clevertap from '../../src/clevertap'
import Account from '../../src/modules/account'
import DeviceManager from '../../src/modules/device'
import { Logger, logLevels } from '../../src/modules/logger'
import RequestManager from '../../src/modules/request'
import SessionManager from '../../src/modules/session'
import { compressData } from '../../src/util/encoder'
import { EMBED_ERROR } from '../../src/util/messages'
import { getURLParams, getDomain, addToURL } from '../../src/util/url'
import { StorageManager } from '../../src/util/storage'
import { CONTINUOUS_PING_FREQ_IN_MILLIS, FIRST_PING_FREQ_IN_MILLIS } from '../../src/util/constants'
import UserLoginHandler from '../../src/modules/userLogin'

// mock everything except for the module that's being tested and constants
jest.enableAutomock().unmock('../../src/clevertap').unmock('../../src/util/constants')

const string121Char = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut posuere nisi id velit laoreet condimentum. Mauris tempor sed.'
const maxLen = 120

const accountId = 'WWW'
const region = 'in'
const targetDomain = 'foo.com'
const dataPostURL = 'data.post.url'
let mockLogger, mockDevice, mockSessionObject, mockRequestObject, mockOUL

describe('clevertap.js', function () {
  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      error: jest.fn()
    }
    mockDevice = {}
    mockSessionObject = {
      cookieName: '',
      getTimeElapsed: jest.fn(),
      getPageCount: jest.fn(),
      getSessionCookieObject: jest.fn(),
      setSessionCookieObject: jest.fn()
    }
    mockRequestObject = {
      processBackupEvents: jest.fn(),
      addSystemDataToObject: jest.fn((data) => data),
      addFlags: jest.fn(),
      saveAndFireRequest: jest.fn()
    }
    mockOUL = {
      clear: jest.fn(),
      _processOldValues: jest.fn()
    }
    Logger.mockReturnValue(mockLogger)
    DeviceManager.mockReturnValue(mockDevice)
    Account.mockImplementation((accountId, region, targetDomain) => {
      return {
        id: accountId,
        region,
        targetDomain,
        dataPostURL
      }
    })
    SessionManager.mockReturnValue(mockSessionObject)
    RequestManager.mockReturnValue(mockRequestObject)
    StorageManager._isLocalStorageSupported.mockReturnValue(true)
    UserLoginHandler.mockReturnValue(mockOUL)
  })

  describe('constructor', () => {
    test('should initialise logger with default log level "INFO"', () => {
      // eslint-disable-next-line no-new
      new Clevertap()
      expect(Logger).toHaveBeenCalledWith(logLevels.INFO)
    })

    test('should not invoke init when no arguments are passed', () => {
      // eslint-disable-next-line no-new
      new Clevertap()
      expect(mockRequestObject.saveAndFireRequest).not.toHaveBeenCalled()
    })

    test('should invoke init when clevertap object is passed with account.id', () => {
      const accountObj = { id: accountId }
      mockSessionObject.getSessionCookieObject.mockReturnValue({})
      getURLParams.mockReturnValue({})
      getDomain.mockReturnValue(location.hostname)
      // eslint-disable-next-line no-new
      new Clevertap({ account: [accountObj], region, targetDomain })
      expect(Account).toHaveBeenCalledWith(accountObj, region, targetDomain)
      expect(mockRequestObject.saveAndFireRequest).toHaveBeenCalled()
    })
  })

  describe('init', () => {
    beforeEach(() => {
      mockSessionObject.getSessionCookieObject.mockReturnValue({})
      this.clevertap = new Clevertap()
    })

    test('should log error when accountId is not provided', () => {
      this.clevertap.init()
      expect(mockLogger.error).toHaveBeenCalledWith(EMBED_ERROR)
    })

    test('should not fireRequest when urlParams contain query indicating email unsubscribe page', () => {
      getURLParams.mockReturnValue({
        e: '1',
        wzrk_ex: '0'
      })
      this.clevertap.init(accountId, region, targetDomain)
      expect(mockRequestObject.saveAndFireRequest).not.toHaveBeenCalled()
    })

    describe('referrer domain is not the same as current', () => {
      test('should not add referrer to data when referrer is empty', () => {
        getURLParams.mockReturnValue({})
        getDomain.mockReturnValue('')
        this.clevertap.init(accountId, region, targetDomain)
        const data = JSON.parse(compressData.mock.calls[0][0])
        expect(data.referrer).toBeUndefined()
      })

      describe('referrer is present', () => {
        test('should add referrer to data', () => {
          getURLParams.mockReturnValue({})
          const referrer = 'fooBar'
          getDomain.mockReturnValue(referrer)
          this.clevertap.init(accountId, region, targetDomain)
          const data = JSON.parse(compressData.mock.calls[0][0])
          expect(data.referrer).toBe(referrer)
        })

        test('should trim and add referrer if greater than 120 chars', () => {
          getURLParams.mockReturnValue({})
          const referrer = string121Char
          getDomain.mockReturnValue(referrer)
          this.clevertap.init(accountId, region, targetDomain)
          const data = JSON.parse(compressData.mock.calls[0][0])
          expect(data.referrer).not.toBe(referrer)
          expect(data.referrer.length).toBe(maxLen)
        })

        describe('utm_source and wzrk_source', () => {
          beforeEach(() => {
            const referrer = 'fooBar'
            getDomain.mockReturnValue(referrer)
          })

          test('should add us to data when utm_source is present', () => {
            getURLParams.mockReturnValue({
              utm_source: 'mock_utm_source'
            })
            this.clevertap.init(accountId, region, targetDomain)
            const data = JSON.parse(compressData.mock.calls[0][0])
            expect(data.us).toBe('mock_utm_source')
          })

          test('should trim and add us when wzrk_source is present', () => {
            getURLParams.mockReturnValue({
              wzrk_source: string121Char
            })
            this.clevertap.init(accountId, region, targetDomain)
            const data = JSON.parse(compressData.mock.calls[0][0])
            expect(data.us.length).toBe(maxLen)
          })
        })

        describe('utm_medium and wzrkSource', () => {
          beforeEach(() => {
            const referrer = 'fooBar'
            getDomain.mockReturnValue(referrer)
          })

          test('should add us to data when utm_medium is present', () => {
            getURLParams.mockReturnValue({
              utm_medium: 'mock_utm_medium'
            })
            this.clevertap.init(accountId, region, targetDomain)
            const data = JSON.parse(compressData.mock.calls[0][0])
            expect(data.um).toBe('mock_utm_medium')
          })

          test('should trim and add us when wzrk_medium is present', () => {
            getURLParams.mockReturnValue({
              wzrk_medium: string121Char
            })
            this.clevertap.init(accountId, region, targetDomain)
            const data = JSON.parse(compressData.mock.calls[0][0])
            expect(data.um.length).toBe(maxLen)
          })

          test('should add wm when wzrk_medium equals "email"', () => {
            getURLParams.mockReturnValue({
              wzrk_medium: 'email'
            })
            this.clevertap.init(accountId, region, targetDomain)
            const data = JSON.parse(compressData.mock.calls[0][0])
            expect(data.wm).toBe('email')
          })
        })

        describe('utm_campaign and wzrk_source', () => {
          beforeEach(() => {
            const referrer = 'fooBar'
            getDomain.mockReturnValue(referrer)
          })

          test('should add us to data when utm_campaign is present', () => {
            getURLParams.mockReturnValue({
              utm_campaign: 'mock_utm_campaign'
            })
            this.clevertap.init(accountId, region, targetDomain)
            const data = JSON.parse(compressData.mock.calls[0][0])
            expect(data.uc).toBe('mock_utm_campaign')
          })

          test('should trim and add us when wzrk_campaign is present', () => {
            getURLParams.mockReturnValue({
              wzrk_campaign: string121Char
            })
            this.clevertap.init(accountId, region, targetDomain)
            const data = JSON.parse(compressData.mock.calls[0][0])
            expect(data.uc.length).toBe(maxLen)
          })
        })
      })
    })

    test('should override dsync flag when pg == 1 and personalisation is active', () => {
      getURLParams.mockReturnValue({})
      getDomain.mockReturnValue('')
      mockRequestObject.addSystemDataToObject.mockImplementation(data => ({ ...data, pg: 1 }))
      this.clevertap.enablePersonalization = true
      this.clevertap.init(accountId)
      const data = JSON.parse(compressData.mock.calls[0][0])
      expect(data.dsync).toBeTruthy()
    })

    test('should not override dsync flag when pg == 1 and personalisation is not active', () => {
      getURLParams.mockReturnValue({})
      getDomain.mockReturnValue('')
      mockRequestObject.addSystemDataToObject.mockImplementation(data => ({ ...data, pg: 1 }))
      this.clevertap.enablePersonalization = false
      this.clevertap.init(accountId)
      const data = JSON.parse(compressData.mock.calls[0][0])
      expect(data.dsync).not.toBeTruthy()
    })

    test('should not try to initalise twice', () => {
      getURLParams.mockReturnValue({})
      getDomain.mockReturnValue('')
      this.clevertap.init(accountId)
      expect(StorageManager.removeCookie).toHaveBeenCalledWith('WZRK_P', location.hostname)
      this.clevertap.init(accountId)
      expect(StorageManager.removeCookie).toHaveBeenCalledTimes(1)
    })
  })

  describe('pageChanged', () => {
    beforeEach(() => {
      mockSessionObject.getSessionCookieObject.mockReturnValue({
        p: 0
      })
      getURLParams.mockReturnValue({})
      getDomain.mockReturnValue('')
      this.clevertap = new Clevertap()
    })

    test('should send ping request after 2 minutes when page count <= 3', () => {
      this.clevertap.pageChanged()
      jest.advanceTimersByTime(FIRST_PING_FREQ_IN_MILLIS)
      expect(addToURL).toHaveBeenCalledWith(dataPostURL, 'type', 'ping')
      expect(mockRequestObject.saveAndFireRequest).toHaveBeenCalledTimes(2)
    })

    test('should not send ping request after 2 minutes when page count > 3', () => {
      mockSessionObject.getSessionCookieObject.mockReturnValue({
        p: 4
      })
      this.clevertap.pageChanged()
      jest.advanceTimersByTime(FIRST_PING_FREQ_IN_MILLIS)
      expect(mockRequestObject.saveAndFireRequest).toHaveBeenCalledTimes(1)
    })

    test('should send ping request in intervals of 5 minutes when `wzrk_d.ping` == "continuous"', () => {
      window.wzrk_d = {
        ping: 'continuous'
      }
      this.clevertap.pageChanged()
      jest.advanceTimersByTime(FIRST_PING_FREQ_IN_MILLIS)
      jest.advanceTimersByTime(CONTINUOUS_PING_FREQ_IN_MILLIS)
      expect(mockRequestObject.saveAndFireRequest).toHaveBeenCalledTimes(3)
    })
  })

  describe('clear', () => {
    test('should call clear method of onUserLogin', () => {
      this.clevertap = new Clevertap()
      this.clevertap.clear()
      expect(mockOUL.clear).toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    test('should invoke `setInstantDeleteFlagInK`', () => {
      this.clevertap = new Clevertap()
      this.clevertap.logout()
      expect(StorageManager.setInstantDeleteFlagInK).toHaveBeenCalled()
    })
  })

  describe('session', () => {
    test('should invoke `getTimeElapsed` from SessionManager when `getTimeElapsed` is called', () => {
      this.clevertap = new Clevertap()
      this.clevertap.session.getTimeElapsed()
      expect(mockSessionObject.getTimeElapsed).toHaveBeenCalled()
    })

    test('should invoke `getPageCount` from SessionManager when `getPageCount` is called', () => {
      this.clevertap = new Clevertap()
      this.clevertap.session.getPageCount()
      expect(mockSessionObject.getPageCount).toHaveBeenCalled()
    })
  })
})
