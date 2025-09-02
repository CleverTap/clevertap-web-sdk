import 'regenerator-runtime/runtime'
import { ARP_COOKIE, OPTOUT_COOKIE_ENDSWITH } from '../../../src/util/constants'
import { compressData } from '../../../src/util/encoder'
import RequestDispatcher from '../../../src/util/requestDispatcher'
import { $ct, StorageManager } from '../../../src/util/storage'
import { addToURL } from '../../../src/util/url'
import { encryptForBackend, decryptFromBackend } from '../../../src/util/security/encryptionInTransit'

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

      describe('encryption in transit feature', () => {
        beforeEach(() => {
          // Mock encryptForBackend
          encryptForBackend.mockResolvedValue('encrypted-data')

          // Mock crypto for tests
          global.crypto = {
            getRandomValues: jest.fn().mockReturnValue(new Uint8Array(32).fill(1)),
            subtle: {
              importKey: jest.fn().mockResolvedValue({}),
              encrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16))
            }
          }

          // Mock URL constructor and URLSearchParams
          global.URL = jest.fn().mockImplementation((url) => ({
            protocol: 'https:',
            host: 'api.clevertap.com',
            pathname: '/1/upload',
            search: '?d=test-data&other=param'
          }))
          
          const mockSearchParams = {
            get: jest.fn((param) => param === 'd' ? 'test-data' : 'param'),
            set: jest.fn(),
            toString: jest.fn(() => 'd=encrypted-data&other=param')
          }
          global.URLSearchParams = jest.fn().mockImplementation(() => mockSearchParams)
        })

        test('should force fetch API when encryption is enabled', (done) => {
          RequestDispatcher.enableEncryptionInTransit = true
          RequestDispatcher.enableFetchApi = false

          RequestDispatcher.fireRequest('https://api.clevertap.com/1/upload?d=test-data', false, false)

          // Use setTimeout to allow promises to resolve
          setTimeout(() => {
            // Should call handleFetchResponse even though enableFetchApi was false
            expect(RequestDispatcher.handleFetchResponse).toHaveBeenCalled()
            expect(RequestDispatcher.enableFetchApi).toBe(true)
            done()
          }, 0)
        })

        test('should encrypt d parameter when encryption is enabled', (done) => {
          RequestDispatcher.enableEncryptionInTransit = true

          RequestDispatcher.fireRequest('https://api.clevertap.com/1/upload?d=test-data&other=param', false, false)

          setTimeout(() => {
            expect(encryptForBackend).toHaveBeenCalledWith('test-data')
            done()
          }, 0)
        })

        test('should keep GET method with encrypted d parameter in URL when encryption is enabled', (done) => {
          RequestDispatcher.enableEncryptionInTransit = true

          RequestDispatcher.fireRequest('https://api.clevertap.com/1/upload?d=test-data&other=param', false, false)

          setTimeout(() => {
            expect(RequestDispatcher.handleFetchResponse).toHaveBeenCalledWith(
              expect.stringContaining('https://api.clevertap.com/1/upload?d=encrypted-data')
            )
            done()
          }, 0)
        })

        test('should fallback to unencrypted when encryption fails', (done) => {
          RequestDispatcher.enableEncryptionInTransit = true
          encryptForBackend.mockRejectedValue(new Error('Encryption failed'))

          RequestDispatcher.fireRequest('test url?d=data', false, false)

          setTimeout(() => {
            expect(RequestDispatcher.logger.error).toHaveBeenCalledWith(
              'Encryption failed, falling back to unencrypted request:',
              expect.any(Error)
            )
            done()
          }, 0)
        })

        test('should not encrypt when encryption is disabled', (done) => {
          RequestDispatcher.enableEncryptionInTransit = false
          RequestDispatcher.enableFetchApi = true

          RequestDispatcher.fireRequest('test url?d=data', false, false)

          setTimeout(() => {
            expect(encryptForBackend).not.toHaveBeenCalled()
            expect(RequestDispatcher.handleFetchResponse).toHaveBeenCalledWith(
              expect.any(String)
            )
            done()
          }, 0)
        })
      })
    })
  })

  describe('handleFetchResponse', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
      RequestDispatcher.logger = {
        debug: jest.fn(),
        error: jest.fn()
      }
      window.$WZRK_WR = {
        tr: jest.fn(),
        s: jest.fn(),
        enableWebPush: jest.fn()
      }
    })

    test('should handle GET request with unencrypted response', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('{"tr": "test-token"}')
      }
      global.fetch.mockResolvedValue(mockResponse)
      decryptFromBackend.mockRejectedValue(new Error('Not encrypted'))

      await RequestDispatcher.handleFetchResponse('test-url')

      expect(global.fetch).toHaveBeenCalledWith('test-url', {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
      expect(window.$WZRK_WR.tr).toHaveBeenCalledWith('test-token')
    })

    test('should handle GET request with encrypted response', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('encrypted-response-data')
      }
      global.fetch.mockResolvedValue(mockResponse)
      decryptFromBackend.mockResolvedValue('{"tr": "decrypted-token"}')

      await RequestDispatcher.handleFetchResponse('test-url')

      expect(decryptFromBackend).toHaveBeenCalledWith('encrypted-response-data')
      expect(window.$WZRK_WR.tr).toHaveBeenCalledWith('decrypted-token')
      expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith('Successfully decrypted response')
    })

    test('should handle server-side EIT disabled error', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('EIT_DISABLED: Encryption in Transit is disabled')
      }
      global.fetch.mockResolvedValue(mockResponse)
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await RequestDispatcher.handleFetchResponse('test-url')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Encryption in Transit is disabled on server side – disable flag or contact support',
        expect.objectContaining({
          status: 400,
          statusText: 'Bad Request',
          error: 'EIT_DISABLED: Encryption in Transit is disabled'
        })
      )

      consoleSpy.mockRestore()
    })

    test('should handle decryption failures gracefully', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('invalid-encrypted-data')
      }
      global.fetch.mockResolvedValue(mockResponse)
      decryptFromBackend.mockRejectedValue(new Error('EIT decryption failed: Invalid format'))

      await RequestDispatcher.handleFetchResponse('test-url')

      expect(RequestDispatcher.logger.error).toHaveBeenCalledWith(
        'EIT decryption failed',
        expect.any(Error)
      )
    })

    test('should handle fetch errors gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      await RequestDispatcher.handleFetchResponse('test-url')

      expect(RequestDispatcher.logger.error).toHaveBeenCalledWith(
        'Fetch error:',
        expect.any(Error)
      )
    })
  })
})
