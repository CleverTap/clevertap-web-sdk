import { GCOOKIE_NAME, KCOOKIE_NAME, LCOOKIE_NAME } from '../../../src/util/constants'
import {
  StorageManager,
  $ct
} from '../../../src/util/storage'

function deleteAllCookies () {
  const cookies = document.cookie.split(';')

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

describe('util/storage', function () {
  beforeAll(() => {
    // clean start for tests in this file
    localStorage.clear()
    deleteAllCookies()
  })

  afterAll(() => {
    // clear all left over data from tests
    localStorage.clear()
    deleteAllCookies()
  })

  describe('StorageManager', function () {
    test('Localstorage support', () => {
      expect(StorageManager._isLocalStorageSupported()).toBe(true)
    })

    test('should return false if trying to read from localStorage without providing key', () => {
      const result = StorageManager.read()
      expect(result).toBeFalsy()
    })

    describe('save to local storage', () => {
      test('should not save if key is null', () => {
        const success = StorageManager.save(null, 'test value')
        expect(success).toBeFalsy()
      })

      test('should not save if value is null', () => {
        const success = StorageManager.save('fooBar', null)
        expect(success).toBeFalsy()
      })

      test('should be able to read saved value', () => {
        const key = 'foo'
        const value = 'bar'
        const success = StorageManager.save(key, value)
        if (success) {
          const result = StorageManager.read(key)
          expect(result).toBe(value)
        } else {
          throw new Error('not able to save to localStorage')
        }
      })

      describe('remove from local storage', () => {
        beforeEach(() => {
          StorageManager.save('key', 'value')
        })

        test('should return false if key is not provided', () => {
          const success = StorageManager.remove()
          expect(success).toBeFalsy()
          expect(StorageManager.read('key')).toBe('value')
        })

        test('should return null on trying to read value deleted from localStorage', () => {
          const success = StorageManager.remove('key')
          if (success) {
            const result = StorageManager.read('key')
            expect(result).toBeNull()
          } else {
            throw new Error('not able to delete from localStorage')
          }
        })
      })
    })

    describe('save to cookie', () => {
      test('should be able to read saved cookie', () => {
        StorageManager.createCookie('foo', 'testValue')
        const storedCookie = StorageManager.readCookie('foo')
        expect(storedCookie).toBe('testValue')
      })

      test('should not be able to read removed cookie', () => {
        StorageManager.createCookie('foo', 'testValue')
        const storedCookie = StorageManager.readCookie('foo')
        expect(storedCookie).toBe('testValue')
        StorageManager.removeCookie('foo')
        const expiredCookie = StorageManager.readCookie('foo')
        expect(expiredCookie).toBeNull()
      })

      test('should not be able to read removed cookie for a domain', () => {
        StorageManager.createCookie('foo', 'testValue', 0, location.hostname)
        const storedCookie = StorageManager.readCookie('foo')
        expect(storedCookie).toBe('testValue')
        StorageManager.removeCookie('foo', location.hostname)
        const expiredCookie = StorageManager.readCookie('foo')
        expect(expiredCookie).toBeNull()
      })
    })

    describe('save to LS or cookie', () => {
      let isLocalStorageSpy
      beforeEach(() => {
        isLocalStorageSpy = jest.spyOn(StorageManager, '_isLocalStorageSupported')
      })

      describe('localStorage is available', () => {
        beforeEach(() => {
          isLocalStorageSpy.mockReturnValue(true)
        })

        test('should not be able to save with null value', () => {
          StorageManager.saveToLSorCookie('lsTest', null)
          const savedValue = StorageManager.readFromLSorCookie('lsTest')
          expect(savedValue).toBeUndefined()
        })

        test('should be able to retrieve saved value', () => {
          StorageManager.saveToLSorCookie('lsTest', 'lsValue')
          const savedValue = StorageManager.readFromLSorCookie('lsTest')
          expect(savedValue).toBe('lsValue')
        })

        test('should retrieve value from globalCache if value is already fetched', () => {
          StorageManager.saveToLSorCookie('lsTest', 'lsValue')
          delete $ct.globalCache.lsTest
          const savedValue = StorageManager.readFromLSorCookie('lsTest')
          expect(savedValue).toBe('lsValue')
          StorageManager.remove('lsTest')
          const cachedValue = StorageManager.readFromLSorCookie('lsTest')
          expect(cachedValue).toBe('lsValue')
        })
      })

      describe('localStorage is not available', () => {
        beforeEach(() => {
          isLocalStorageSpy.mockReturnValue(false)
        })

        test('should be able to retrieve saved value', () => {
          StorageManager.saveToLSorCookie('cookieTest', 'cookieValue')
          delete $ct.globalCache.cookieTest
          const savedValue = StorageManager.readFromLSorCookie('cookieTest')
          expect(savedValue).toBe('cookieValue')
        })

        test('should be able to save and retrieve GCOOKIE', () => {
          StorageManager.saveToLSorCookie(GCOOKIE_NAME, 'testCookieValue')
          delete $ct.globalCache[GCOOKIE_NAME]
          const gcookieSavedValue = StorageManager.readFromLSorCookie(GCOOKIE_NAME)
          expect(gcookieSavedValue).toBe('testCookieValue')
        })
      })
    })

    describe('broad cookie', () => {
      test('should save to same domain when domain is not speified', () => {
        StorageManager.createBroadCookie('notBroad', 'not a broad cookie value')
        expect($ct.broadDomain).toBeNull()
        const savedCookie = StorageManager.readCookie('notBroad')
        expect(savedCookie).toBe('not a broad cookie value')
      })

      test('should save to broadDomain when domain is specified', () => {
        StorageManager.createBroadCookie('broadCookie', 'broad cookie value', 60, 'www.example.com')
        expect($ct.broadDomain).not.toBeNull()
        const savedBroadCookie = StorageManager.readCookie('broadCookie')
        expect(savedBroadCookie).toBe('broad cookie value')
      })

      test('should update saved broad cookie', () => {
        StorageManager.createBroadCookie('broadCookie2', 'broad cookie value 1', 0, 'www.example.com')
        let savedBroadCookie = StorageManager.readCookie('broadCookie2')
        expect(savedBroadCookie).toBe('broad cookie value 1')
        // emulate page refresh
        $ct.broadDomain = null
        StorageManager.createBroadCookie('broadCookie2', 'broad cookie value 2', 0, 'www.example.com')
        savedBroadCookie = StorageManager.readCookie('broadCookie2')
        expect(savedBroadCookie).toBe('broad cookie value 2')
      })
    })

    describe('meta prop', () => {
      let isLocalStorageSpy
      beforeEach(() => {
        isLocalStorageSpy = jest.spyOn(StorageManager, '_isLocalStorageSupported')
      })

      test('should not save meta prop when local storage is not supported', () => {
        isLocalStorageSpy.mockReturnValue(false)
        StorageManager.setMetaProp('prop1', 'prop value 1')
        const result = StorageManager.getMetaProp('prop1')
        expect(result).toBeUndefined()
      })

      describe('local storage is available', () => {
        beforeEach(() => {
          isLocalStorageSpy.mockReturnValue(true)
        })

        test('should save meta prop', () => {
          StorageManager.setMetaProp('prop1', 'prop value 1')
          const result = StorageManager.getMetaProp('prop1')
          expect(result).toBe('prop value 1')
        })

        test('should get and remove meta prop when `getAndClearMetaProp` is called', () => {
          StorageManager.setMetaProp('prop2', 'prop value 2')
          const result = StorageManager.getAndClearMetaProp('prop2')
          expect(result).toBe('prop value 2')
          const resultAfterClear = StorageManager.getMetaProp('prop2')
          expect(resultAfterClear).toBeUndefined()
        })
      })
    })

    describe('setInstantDeleteFlagInK', () => {
      test('should set "kcookie" with flag set to true', () => {
        StorageManager.setInstantDeleteFlagInK()
        const kcookie = StorageManager.readFromLSorCookie(KCOOKIE_NAME)
        expect(kcookie.flag).toBeTruthy()
      })

      test('should update "kcookie" flag to true if it already exists', () => {
        StorageManager.saveToLSorCookie(KCOOKIE_NAME, { k: false })
        StorageManager.setInstantDeleteFlagInK()
        const kcookie = StorageManager.readFromLSorCookie(KCOOKIE_NAME)
        expect(kcookie.flag).toBeTruthy()
      })
    })

    describe('backup event', () => {
      beforeEach(() => {
        this.logger = {
          debug: jest.fn()
        }
      })

      test('should save data against request number and log to debug', () => {
        const data = {
          event: 'test'
        }
        const reqNo = 1
        StorageManager.backupEvent(data, reqNo, this.logger)
        const lcookieResult = StorageManager.readFromLSorCookie(LCOOKIE_NAME)
        expect(lcookieResult[reqNo]).toMatchObject({ q: data })
        expect(this.logger.debug).toHaveBeenCalledTimes(1)
      })

      test('should remove data for provided request number', () => {
        const data1 = {
          event: 'test1'
        }
        const data2 = {
          event: 'test2'
        }
        let reqNo = 1
        StorageManager.backupEvent(data1, reqNo++, this.logger)
        StorageManager.backupEvent(data2, reqNo++, this.logger)
        StorageManager.removeBackup(1, this.logger)
        const lcookieResult = StorageManager.readFromLSorCookie(LCOOKIE_NAME)
        expect(lcookieResult[1]).toBeUndefined()
        expect(lcookieResult[2]).toMatchObject({ q: data2 })
        expect(this.logger.debug).toHaveBeenCalledTimes(3)
      })

      test('should not do anything when trying to remove backup event not in request', () => {
        StorageManager.removeBackup(10, this.logger)
        expect(this.logger.debug).not.toHaveBeenCalled()
      })
    })
  })
})
