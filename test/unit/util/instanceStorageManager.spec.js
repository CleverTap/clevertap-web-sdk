import InstanceStorageManager from '../../../src/util/instanceStorageManager'
import InstanceManager from '../../../src/util/instanceManager'
import { Encryption } from '../../../src/modules/security/Encryption'
import { BLOCK_REQUEST_COOKIE, GCOOKIE_NAME, META_COOKIE, SCOOKIE_PREFIX } from '../../../src/util/constants'
import { clearAllStorage } from './storageTestUtils'

const createStorage = (accountId, isDefault = false) => new InstanceStorageManager(accountId, isDefault, new Encryption())

describe('util/instanceStorageManager', () => {
  beforeEach(clearAllStorage)

  describe('key prefixing', () => {
    test('default instance stores keys as {accountId}:KEY (no bare keys)', () => {
      const storage = createStorage('ACC-1', true)
      storage.saveToLSorCookie(GCOOKIE_NAME, 'guid-1')

      expect(localStorage.getItem('ACC-1:' + GCOOKIE_NAME)).not.toBeNull()
      expect(localStorage.getItem(GCOOKIE_NAME)).toBeNull()
      expect(storage.readFromLSorCookie(GCOOKIE_NAME)).toBe('guid-1')
    })

    test('non-default instance stores keys as {accountId}:KEY', () => {
      const storage = createStorage('ACC-2', false)
      storage.save('foo', 'bar')

      expect(localStorage.getItem('ACC-2:foo')).toBe('bar')
      expect(localStorage.getItem('foo')).toBeNull()
    })

    test('cookies are prefixed with the account id for the default instance too', () => {
      const storage = createStorage('ACC-1', true)
      storage.createCookie('some_cookie', 'value', 0, window.location.hostname)

      expect(document.cookie).toContain('ACC-1:some_cookie=value')
      expect(storage.readCookie('some_cookie')).toBe('value')
    })

    test('session cookie is stored as {accountId}:WZRK_S', () => {
      const storage = createStorage('ACC-1', true)
      storage.createCookie(SCOOKIE_PREFIX, '{"s":1}', 0, window.location.hostname)

      expect(document.cookie).toContain('ACC-1:' + SCOOKIE_PREFIX + '=' + encodeURIComponent('{"s":1}'))
      expect(document.cookie).not.toContain(SCOOKIE_PREFIX + '_ACC-1=')
      expect(storage.readCookie(SCOOKIE_PREFIX)).toBe('{"s":1}')
    })

    test('session cookie falls back to the previous WZRK_S_{accountId} name', () => {
      document.cookie = SCOOKIE_PREFIX + '_ACC-1=' + encodeURIComponent('{"s":9}') + '; path=/'
      const storage = createStorage('ACC-1', true)

      expect(storage.readCookie(SCOOKIE_PREFIX)).toBe('{"s":9}')

      storage.removeCookie(SCOOKIE_PREFIX, window.location.hostname)
      expect(storage.readCookie(SCOOKIE_PREFIX)).toBeNull()
    })

    test('two accounts never see each other keys, whichever is the default', () => {
      const first = createStorage('ACC-1', true)
      const second = createStorage('ACC-2', false)
      first.saveToLSorCookie(GCOOKIE_NAME, 'guid-1')
      second.saveToLSorCookie(GCOOKIE_NAME, 'guid-2')

      expect(first.readFromLSorCookie(GCOOKIE_NAME)).toBe('guid-1')
      expect(second.readFromLSorCookie(GCOOKIE_NAME)).toBe('guid-2')

      // The first account is removed and the second one becomes the default
      const promoted = createStorage('ACC-2', true)
      expect(promoted.readFromLSorCookie(GCOOKIE_NAME)).toBe('guid-2')
    })
  })

  describe('account id binding', () => {
    test('does not read or write anything until the account id is known', () => {
      const storage = createStorage(null, true)
      storage.saveToLSorCookie(GCOOKIE_NAME, 'guid-1')
      storage.save('foo', 'bar')
      storage.createCookie('c', 'v', 0, window.location.hostname)

      expect(localStorage.length).toBe(0)
      expect(document.cookie).toBe('')
      expect(storage.read('foo')).toBeNull()
      expect(storage.readFromLSorCookie(GCOOKIE_NAME)).toBeUndefined()
    })

    test('setAccountId binds the prefix and drops values cached before binding', () => {
      localStorage.setItem('ACC-1:' + GCOOKIE_NAME, encodeURIComponent(JSON.stringify('guid-1')))
      const storage = createStorage(null, true)
      storage.setAccountId('ACC-1')

      expect(storage.readFromLSorCookie(GCOOKIE_NAME)).toBe('guid-1')
    })

    test('setAccountId ignores empty ids', () => {
      const storage = createStorage('ACC-1', true)
      storage.setAccountId(null)
      expect(storage.accountId).toBe('ACC-1')
    })
  })

  describe('legacy fallback (dual read while migrating)', () => {
    test('is off by default: legacy bare keys are not read', () => {
      localStorage.setItem('foo', 'legacy')
      const storage = createStorage('ACC-1', true)
      expect(storage.read('foo')).toBeNull()
    })

    test('reads the legacy key when the prefixed one is missing', () => {
      localStorage.setItem('foo', 'legacy')
      const storage = createStorage('ACC-1', true)
      storage.setLegacyFallback(true)
      expect(storage.read('foo')).toBe('legacy')
    })

    test('prefers the prefixed key over the legacy one', () => {
      localStorage.setItem('foo', 'legacy')
      localStorage.setItem('ACC-1:foo', 'current')
      const storage = createStorage('ACC-1', true)
      storage.setLegacyFallback(true)
      expect(storage.read('foo')).toBe('current')
    })

    test('reads legacy cookies as well', () => {
      document.cookie = 'legacy_cookie=legacy; domain=' + window.location.hostname + '; path=/'
      const storage = createStorage('ACC-1', true)
      expect(storage.readCookie('legacy_cookie')).toBeNull()
      storage.setLegacyFallback(true)
      expect(storage.readCookie('legacy_cookie')).toBe('legacy')
    })

    test('remove also drops the legacy copy so it cannot resurrect', () => {
      localStorage.setItem('foo', 'legacy')
      localStorage.setItem('ACC-1:foo', 'current')
      const storage = createStorage('ACC-1', true)
      storage.setLegacyFallback(true)
      storage.remove('foo')
      expect(storage.read('foo')).toBeNull()
    })
  })

  describe('blockRequest state', () => {
    test('is persisted per instance under its own prefixed key', () => {
      const first = new InstanceManager('ACC-1', false)
      first.storage = createStorage('ACC-1')
      const second = new InstanceManager('ACC-2', false)
      second.storage = createStorage('ACC-2')

      first.state.blockRequest = true

      expect(first.state.blockRequest).toBe(true)
      expect(second.state.blockRequest).toBe(false)
      expect(localStorage.getItem('ACC-1:' + BLOCK_REQUEST_COOKIE)).not.toBeNull()
      expect(localStorage.getItem('ACC-2:' + BLOCK_REQUEST_COOKIE)).toBeNull()
    })

    test('is kept in memory until the storage is bound to an account', () => {
      const manager = new InstanceManager(null, true)
      manager.storage = createStorage(null, true)
      manager.state.blockRequest = true
      expect(manager.state.blockRequest).toBe(true)
      expect(localStorage.length).toBe(0)
    })
  })

  describe('meta props', () => {
    test('are scoped to the account', () => {
      const first = createStorage('ACC-1', true)
      const second = createStorage('ACC-2')
      first.setMetaProp('sc', 5)
      second.setMetaProp('sc', 1)

      expect(first.getMetaProp('sc')).toBe(5)
      expect(second.getMetaProp('sc')).toBe(1)
      expect(localStorage.getItem(META_COOKIE)).toBeNull()
    })
  })
})
