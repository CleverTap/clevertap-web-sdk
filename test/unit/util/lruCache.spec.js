import { LRU_CACHE } from '../../../src/util/constants'
import LRUCache from '../../../src/util/lruCache'
import { StorageManager } from '../../../src/util/storage'

jest.enableAutomock().unmock('../../../src/util/lruCache')

describe('util/lruCache', function () {
  describe('constructor', () => {
    test('should initialise empty cache object when LS or cookie has no previous LRUCache', () => {
      StorageManager.readFromLSorCookie.mockReturnValue(undefined)
      this.lruCache = new LRUCache(2)
      expect(this.lruCache.cache).toMatchObject({})
    })

    test('should initialise cache with data from LS or cookie', () => {
      const previousCacheData = {
        cache: [
          ['foo', 'value 1'],
          ['bar', 'value 2']
        ]
      }

      const expectedCache = {
        foo: 'value 1',
        bar: 'value 2'
      }

      StorageManager.readFromLSorCookie.mockReturnValue(previousCacheData)
      this.lruCache = new LRUCache(2)
      expect(this.lruCache.cache).toMatchObject(expectedCache)
    })

    describe('LRU cache initalised', () => {
      beforeEach(() => {
        const previousCacheData = {
          cache: [
            ['foo', 'value 1'],
            ['bar', 'value 2'],
            ['test', 'value 3']
          ]
        }
        StorageManager.readFromLSorCookie.mockReturnValue(previousCacheData)
        this.lruCache = new LRUCache(4)
      })

      test('should return undefined if key is not present', () => {
        const result = this.lruCache.get('blah')
        expect(result).toBeUndefined()
      })

      test('should return value and update the order of cache if key is present', () => {
        const result = this.lruCache.get('foo')
        expect(result).toBe('value 1')

        const expectedCacheDataStored = {
          cache: [
            ['bar', 'value 2'],
            ['test', 'value 3'],
            ['foo', 'value 1']
          ]
        }
        expect(StorageManager.saveToLSorCookie).toHaveBeenCalledWith(LRU_CACHE, expect.objectContaining(expectedCacheDataStored))
      })

      describe('set value', () => {
        test('should add new value and append to LS data array when new key is provided', () => {
          this.lruCache.set('test 1', 'value for test 1')
          const expectedCacheDataStored = {
            cache: [
              ['foo', 'value 1'],
              ['bar', 'value 2'],
              ['test', 'value 3'],
              ['test 1', 'value for test 1']
            ]
          }
          expect(StorageManager.saveToLSorCookie).toHaveBeenCalledWith(LRU_CACHE, expect.objectContaining(expectedCacheDataStored))
        })

        test('should update exisiting value and append to end of LS data array when setting value for exisiting key', () => {
          this.lruCache.set('foo', 'updated value for foo')
          const expectedCacheDataStored = {
            cache: [
              ['bar', 'value 2'],
              ['test', 'value 3'],
              ['foo', 'updated value for foo']
            ]
          }
          expect(StorageManager.saveToLSorCookie).toHaveBeenCalledWith(LRU_CACHE, expect.objectContaining(expectedCacheDataStored))
        })

        test('should remove oldest value from LS data array when max limit is reached with adding new values', () => {
          this.lruCache.set('test 1', 'value for test 1')
          this.lruCache.set('test 2', 'value for test 2')
          const expectedCacheDataStored = {
            cache: [
              ['bar', 'value 2'],
              ['test', 'value 3'],
              ['test 1', 'value for test 1'],
              ['test 2', 'value for test 2']
            ]
          }
          expect(StorageManager.saveToLSorCookie).toHaveBeenCalledWith(LRU_CACHE, expect.objectContaining(expectedCacheDataStored))
        })
      })

      describe('get key from value', () => {
        test('should return null if value is null', () => {
          const result = this.lruCache.getKey(null)
          expect(result).toBeNull()
        })

        test('should return null if value is not present in cache object', () => {
          const result = this.lruCache.getKey('unsaved value')
          expect(result).toBeNull()
        })

        test('should return key when value is present in cache object', () => {
          const result = this.lruCache.getKey('value 2')
          expect(result).toBe('bar')
        })
      })

      describe('get last key', () => {
        test('should get last key', () => {
          const result = this.lruCache.getLastKey()
          expect(result).toBe('test')
        })

        test('should return undefined when no items in cache', () => {
          StorageManager.readFromLSorCookie.mockReturnValue(undefined)
          const lruCache = new LRUCache(2)
          const result = lruCache.getLastKey()
          expect(result).toBeUndefined()
        })
      })

      describe('get second last key', () => {
        test('should get second last key when available', () => {
          const result = this.lruCache.getSecondLastKey()
          expect(result).toBe('bar')
        })

        test('should return -1 when only one value is in cache', () => {
          StorageManager.readFromLSorCookie.mockReturnValue({ cache: [['foo', 'value 1']] })
          const lruCache = new LRUCache(2)
          const result = lruCache.getSecondLastKey()
          expect(result).toBe(-1)
        })
      })
    })
  })
})
