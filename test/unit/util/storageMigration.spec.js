import InstanceStorageManager from '../../../src/util/instanceStorageManager'
import DeviceManager from '../../../src/modules/device'
import { Encryption } from '../../../src/modules/security/Encryption'
import {
  ACCOUNT_ID,
  ACCOUNTS_REGISTRY,
  CAMP_COOKIE_G,
  CAMP_COOKIE_NAME,
  GCOOKIE_NAME,
  LRU_CACHE,
  MUTE_EXPIRY_KEY,
  PR_COOKIE,
  SCOOKIE_PREFIX,
  STORAGE_MIGRATION_FLAG
} from '../../../src/util/constants'
import { clearAllStorage } from './storageTestUtils'
import {
  isMigrationInProgress,
  migrateLegacyStorage,
  parentDomains,
  registerActiveAccount,
  removeAccounts,
  snapshotCookieNames,
  syncActiveAccounts
} from '../../../src/util/storageMigration'

const SK1 = 'TEST-ACC-AAA'
const EU1 = 'TEST-ACC-BBB'

const logger = { debug: jest.fn(), error: jest.fn() }
const encodeLS = (value) => encodeURIComponent(JSON.stringify(value))

const createStorage = (accountId, isDefault = true) =>
  new InstanceStorageManager(accountId, isDefault, new Encryption())

const cookieNames = () => snapshotCookieNames()

// the SDK wrote its cookies with a domain attribute
const BROAD_DOMAIN = '.example.com'
const setCookie = (name, value, domain = window.location.hostname) => {
  document.cookie = name + '=' + value + '; domain=' + domain + '; path=/'
}

const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage')
const disableLocalStorage = () => Object.defineProperty(window, 'localStorage', { configurable: true, get: () => null })
const restoreLocalStorage = () => Object.defineProperty(window, 'localStorage', originalLocalStorage)

/** Unprefixed state as written by the previous SDK for the default account */
const seedLegacyDefault = (owner, guid) => {
  localStorage.setItem(GCOOKIE_NAME, encodeLS(guid))
  localStorage.setItem(ACCOUNT_ID, encodeLS(owner))
  localStorage.setItem(CAMP_COOKIE_NAME, encodeURIComponent(JSON.stringify({ wsc: 3 })))
  localStorage.setItem(CAMP_COOKIE_G, encodeURIComponent(JSON.stringify({ [guid]: {} })))
  localStorage.setItem(PR_COOKIE, encodeLS({ Name: 'legacy' }))
  localStorage.setItem(LRU_CACHE, encodeLS({ cache: [['identity', guid]] }))
  localStorage.setItem(MUTE_EXPIRY_KEY, encodeLS(123))
}

describe('util/storageMigration', () => {
  beforeEach(() => {
    clearAllStorage()
    jest.clearAllMocks()
  })

  describe('migrateLegacyStorage', () => {
    test('does nothing when there is no legacy data and no flag', () => {
      const storage = createStorage(SK1)
      const result = migrateLegacyStorage(storage, SK1, logger)

      expect(result.migrated).toBe(false)
      expect(localStorage.length).toBe(0)
      expect(isMigrationInProgress()).toBe(false)
    })

    test('does nothing without an account id', () => {
      seedLegacyDefault(SK1, 'guid-sk1')
      const storage = createStorage(null)
      expect(migrateLegacyStorage(storage, null, logger).migrated).toBe(false)
      expect(localStorage.getItem(GCOOKIE_NAME)).not.toBeNull()
    })

    test('moves every legacy key to the prefix of the owning (current default) account', () => {
      seedLegacyDefault(SK1, 'guid-sk1')
      const storage = createStorage(SK1)

      const result = migrateLegacyStorage(storage, SK1, logger)

      expect(result).toEqual({ migrated: true, owner: SK1 })
      ;[GCOOKIE_NAME, ACCOUNT_ID, CAMP_COOKIE_NAME, CAMP_COOKIE_G, PR_COOKIE, LRU_CACHE, MUTE_EXPIRY_KEY].forEach(key => {
        expect(localStorage.getItem(key)).toBeNull()
        expect(localStorage.getItem(SK1 + ':' + key)).not.toBeNull()
      })
      expect(storage.readFromLSorCookie(GCOOKIE_NAME)).toBe('guid-sk1')
      expect(storage.readFromLSorCookie(MUTE_EXPIRY_KEY)).toBe(123)
    })

    test('removes the flag once everything moved and turns the legacy fallback off', () => {
      seedLegacyDefault(SK1, 'guid-sk1')
      const storage = createStorage(SK1)
      migrateLegacyStorage(storage, SK1, logger)

      expect(localStorage.getItem(STORAGE_MIGRATION_FLAG)).toBeNull()
      expect(isMigrationInProgress()).toBe(false)
      expect(storage._legacyFallback).toBe(false)
    })

    test('is idempotent: a second run is a no-op', () => {
      seedLegacyDefault(SK1, 'guid-sk1')
      const storage = createStorage(SK1)
      migrateLegacyStorage(storage, SK1, logger)
      const snapshot = JSON.stringify(Object.entries(localStorage))

      expect(migrateLegacyStorage(storage, SK1, logger).migrated).toBe(false)
      expect(JSON.stringify(Object.entries(localStorage))).toBe(snapshot)
    })

    test('never overwrites a value that already exists under the prefixed key', () => {
      seedLegacyDefault(SK1, 'legacy-guid')
      localStorage.setItem(SK1 + ':' + GCOOKIE_NAME, encodeLS('newer-guid'))
      const storage = createStorage(SK1)

      migrateLegacyStorage(storage, SK1, logger)

      expect(storage.readFromLSorCookie(GCOOKIE_NAME)).toBe('newer-guid')
      expect(localStorage.getItem(GCOOKIE_NAME)).toBeNull()
    })

    test('does not touch keys that are not account scoped', () => {
      seedLegacyDefault(SK1, 'guid-sk1')
      localStorage.setItem('WZRK_GEO', 'true')
      localStorage.setItem('some_other_key', 'x')
      const storage = createStorage(SK1)

      migrateLegacyStorage(storage, SK1, logger)

      expect(localStorage.getItem('WZRK_GEO')).toBe('true')
      expect(localStorage.getItem('some_other_key')).toBe('x')
    })

    describe('owner mismatch (the removed first account scenario)', () => {
      test('moves legacy data under the previous owner, not the new default', () => {
        // SK1 was the default and owned the bare keys, now only EU1 is integrated
        seedLegacyDefault(SK1, 'guid-sk1')
        localStorage.setItem(EU1 + ':' + GCOOKIE_NAME, encodeLS('guid-eu1'))
        const storage = createStorage(EU1)

        const result = migrateLegacyStorage(storage, EU1, logger)

        expect(result).toEqual({ migrated: true, owner: SK1 })
        expect(localStorage.getItem(GCOOKIE_NAME)).toBeNull()
        expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).toBe(encodeLS('guid-sk1'))
        // EU1 keeps its own guid and never sees SK1's
        expect(storage.readFromLSorCookie(GCOOKIE_NAME)).toBe('guid-eu1')
        expect(storage._legacyFallback).toBe(false)
      })

      test('new default instance starts without the old account GUID', () => {
        seedLegacyDefault(SK1, 'guid-sk1')
        const storage = createStorage(null)
        // npm flow: the DeviceManager is created before the account is known
        const device = new DeviceManager({ logger, customId: null, domainSpecification: null, storageManager: storage })
        expect(device.gcookie).toBeFalsy()

        storage.setAccountId(EU1)
        migrateLegacyStorage(storage, EU1, logger)
        device.refreshGuid()

        expect(device.gcookie).toBeFalsy()
        expect(storage.readFromLSorCookie(GCOOKIE_NAME)).toBeUndefined()
      })
    })

    describe('resuming an interrupted migration', () => {
      test('continues where it stopped and finishes under the owner of the legacy account id', () => {
        seedLegacyDefault(SK1, 'guid-sk1')
        // first part of the work was done and the flag survived. WZRK_ACCOUNT_ID moves last,
        // so it is still there to tell who owns the rest.
        localStorage.setItem(STORAGE_MIGRATION_FLAG, false)
        localStorage.setItem(SK1 + ':' + GCOOKIE_NAME, localStorage.getItem(GCOOKIE_NAME))
        localStorage.removeItem(GCOOKIE_NAME)

        // after the restart a different account is the default
        const storage = createStorage(EU1)
        expect(isMigrationInProgress()).toBe(true)
        const result = migrateLegacyStorage(storage, EU1, logger)

        expect(result).toEqual({ migrated: true, owner: SK1 })
        expect(isMigrationInProgress()).toBe(false)
        expect(localStorage.getItem(CAMP_COOKIE_NAME)).toBeNull()
        expect(localStorage.getItem(SK1 + ':' + CAMP_COOKIE_NAME)).not.toBeNull()
        expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).toBe(encodeLS('guid-sk1'))
      })

      test('finishes when only the flag is left', () => {
        localStorage.setItem(SK1 + ':' + GCOOKIE_NAME, encodeLS('guid-sk1'))
        localStorage.setItem(STORAGE_MIGRATION_FLAG, false)

        const result = migrateLegacyStorage(createStorage(SK1), SK1, logger)

        expect(result.migrated).toBe(true)
        expect(isMigrationInProgress()).toBe(false)
        expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).toBe(encodeLS('guid-sk1'))
      })

      test('keeps the flag and falls back to legacy reads when the migration is interrupted', () => {
        seedLegacyDefault(SK1, 'guid-sk1')
        const storage = createStorage(SK1)
        const realSetItem = Storage.prototype.setItem
        const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
          if (String(key).indexOf(SK1 + ':' + CAMP_COOKIE_NAME) === 0) {
            throw new Error('quota exceeded')
          }
          return realSetItem.call(this, key, value)
        })

        const result = migrateLegacyStorage(storage, SK1, logger)
        spy.mockRestore()

        expect(result.migrated).toBe(false)
        expect(isMigrationInProgress()).toBe(true)
        expect(logger.error).toHaveBeenCalled()
        // not yet moved keys are still readable through the legacy fallback
        expect(storage._legacyFallback).toBe(true)
        expect(storage.read(CAMP_COOKIE_NAME)).not.toBeNull()

        // the next load finishes the job
        const next = createStorage(SK1)
        expect(migrateLegacyStorage(next, SK1, logger).migrated).toBe(true)
        expect(isMigrationInProgress()).toBe(false)
        expect(localStorage.getItem(CAMP_COOKIE_NAME)).toBeNull()
      })
    })

    describe('cookies', () => {
      test('moves the broad domain GUID cookie to the prefixed name and expires the legacy one', () => {
        seedLegacyDefault(SK1, 'guid-sk1')
        // shared cookies live on the parent domain
        setCookie(GCOOKIE_NAME, 'guid-sk1', BROAD_DOMAIN)
        const storage = createStorage(SK1)

        migrateLegacyStorage(storage, SK1, logger)

        expect(cookieNames()).not.toContain(GCOOKIE_NAME)
        expect(cookieNames()).toContain(SK1 + ':' + GCOOKIE_NAME)
        expect(storage.readCookie(GCOOKIE_NAME)).toBe('guid-sk1')
      })

      test('renames WZRK_S_{accountId} to {accountId}:WZRK_S', () => {
        seedLegacyDefault(SK1, 'guid-sk1')
        setCookie(SCOOKIE_PREFIX + '_' + SK1, '{"s":7}', BROAD_DOMAIN)
        const storage = createStorage(SK1)

        migrateLegacyStorage(storage, SK1, logger)

        expect(cookieNames()).not.toContain(SCOOKIE_PREFIX + '_' + SK1)
        expect(cookieNames()).toContain(SK1 + ':' + SCOOKIE_PREFIX)
        expect(storage.readCookie(SCOOKIE_PREFIX)).toBe('{"s":7}')
      })
    })

    describe('cookie-only mode (localStorage unavailable)', () => {
      beforeEach(() => {
        disableLocalStorage()
      })
      afterEach(() => {
        restoreLocalStorage()
      })

      test('migrates cookies and keeps the flag in a cookie', () => {
        setCookie(GCOOKIE_NAME, 'guid-sk1')
        setCookie(ACCOUNT_ID, encodeURIComponent(encodeLS(SK1)))
        setCookie(PR_COOKIE, encodeURIComponent(encodeLS({ Name: 'x' })))
        const storage = createStorage(SK1)
        expect(storage._isLocalStorageSupported()).toBe(false)

        const result = migrateLegacyStorage(storage, SK1, logger)

        expect(result).toEqual({ migrated: true, owner: SK1 })
        expect(cookieNames()).not.toContain(GCOOKIE_NAME)
        expect(cookieNames()).not.toContain(PR_COOKIE)
        expect(cookieNames()).toContain(SK1 + ':' + GCOOKIE_NAME)
        expect(cookieNames()).toContain(SK1 + ':' + PR_COOKIE)
        expect(cookieNames()).not.toContain(STORAGE_MIGRATION_FLAG)
        expect(storage.readCookie(GCOOKIE_NAME)).toBe('guid-sk1')
      })

      test('reports a migration in progress from the cookie flag', () => {
        setCookie(STORAGE_MIGRATION_FLAG, 'false')
        expect(isMigrationInProgress()).toBe(true)
      })
    })
  })

  describe('parentDomains', () => {
    test('lists every parent domain of a hostname', () => {
      expect(parentDomains('a.b.example.com')).toEqual(['.b.example.com', '.example.com', '.com'])
    })

    test('returns nothing for a single-label host', () => {
      expect(parentDomains('localhost')).toEqual([])
    })
  })

  describe('registerActiveAccount', () => {
    const readRegistry = () => JSON.parse(localStorage.getItem(ACCOUNTS_REGISTRY))

    test('appends each new account without deleting keys', () => {
      localStorage.setItem(SK1 + ':' + GCOOKIE_NAME, encodeLS('guid-sk1'))
      localStorage.setItem(EU1 + ':' + GCOOKIE_NAME, encodeLS('guid-eu1'))

      registerActiveAccount(SK1)
      expect(readRegistry()).toEqual([SK1])
      registerActiveAccount(EU1)
      expect(readRegistry()).toEqual([SK1, EU1])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).not.toBeNull()
    })

    test('is a no-op for an id already in the registry', () => {
      registerActiveAccount(SK1)
      registerActiveAccount(EU1)
      registerActiveAccount(SK1)
      expect(readRegistry()).toEqual([SK1, EU1])
    })

    test('ignores missing or non-string ids', () => {
      registerActiveAccount(undefined)
      registerActiveAccount('')
      registerActiveAccount(42)
      expect(localStorage.getItem(ACCOUNTS_REGISTRY)).toBeNull()
    })

    test('still registers while a migration is in progress', () => {
      localStorage.setItem(STORAGE_MIGRATION_FLAG, false)
      registerActiveAccount(SK1)
      expect(readRegistry()).toEqual([SK1])
    })
  })

  describe('syncActiveAccounts (cleanup of removed accounts)', () => {
    const seedAccount = (id) => {
      localStorage.setItem(id + ':' + GCOOKIE_NAME, encodeLS('guid-' + id))
      localStorage.setItem(id + ':' + CAMP_COOKIE_NAME, 'camp')
      setCookie(id + ':' + GCOOKIE_NAME, 'guid-' + id, BROAD_DOMAIN)
    }

    const readRegistry = () => JSON.parse(localStorage.getItem(ACCOUNTS_REGISTRY))

    test('stores the live set on the first run without deleting anything', () => {
      seedAccount(SK1)
      expect(syncActiveAccounts([SK1])).toEqual([])
      expect(readRegistry()).toEqual([SK1])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).not.toBeNull()
    })

    test('deletes LS keys and cookies of accounts that are no longer live', () => {
      seedAccount(SK1)
      seedAccount(EU1)
      registerActiveAccount(SK1)
      registerActiveAccount(EU1)

      const removed = syncActiveAccounts([EU1], BROAD_DOMAIN)

      expect(removed).toEqual([SK1])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).toBeNull()
      expect(localStorage.getItem(SK1 + ':' + CAMP_COOKIE_NAME)).toBeNull()
      expect(cookieNames()).not.toContain(SK1 + ':' + GCOOKIE_NAME)
      expect(localStorage.getItem(EU1 + ':' + GCOOKIE_NAME)).not.toBeNull()
      expect(cookieNames()).toContain(EU1 + ':' + GCOOKIE_NAME)
      expect(readRegistry()).toEqual([EU1])
    })

    test('does not delete accounts that merely share a prefix with a removed one', () => {
      localStorage.setItem('AB:' + GCOOKIE_NAME, '1')
      localStorage.setItem('ABC:' + GCOOKIE_NAME, '2')
      registerActiveAccount('AB')
      registerActiveAccount('ABC')

      expect(syncActiveAccounts(['ABC'])).toEqual(['AB'])
      expect(localStorage.getItem('AB:' + GCOOKIE_NAME)).toBeNull()
      expect(localStorage.getItem('ABC:' + GCOOKIE_NAME)).toBe('2')
    })

    test('is skipped while a migration is in progress', () => {
      seedAccount(SK1)
      registerActiveAccount(SK1)
      registerActiveAccount(EU1)
      localStorage.setItem(STORAGE_MIGRATION_FLAG, false)

      expect(syncActiveAccounts([EU1])).toEqual([])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).not.toBeNull()
      expect(readRegistry()).toEqual([SK1, EU1])
    })

    test('is skipped when no account is active', () => {
      seedAccount(SK1)
      registerActiveAccount(SK1)
      expect(syncActiveAccounts([])).toEqual([])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).not.toBeNull()
      expect(readRegistry()).toEqual([SK1])
    })

    test('cookie-only: the registry is a cookie and not-live accounts are removed', () => {
      setCookie(SK1 + ':' + GCOOKIE_NAME, 'guid-sk1', BROAD_DOMAIN)
      setCookie(SK1 + ':' + CAMP_COOKIE_NAME, 'camp', BROAD_DOMAIN)
      setCookie(EU1 + ':' + GCOOKIE_NAME, 'guid-eu1', BROAD_DOMAIN)
      setCookie(SK1 + ':cart', 'host-app', BROAD_DOMAIN)
      disableLocalStorage()
      try {
        registerActiveAccount(SK1)
        registerActiveAccount(EU1)
        expect(cookieNames()).toContain(ACCOUNTS_REGISTRY)

        expect(syncActiveAccounts([EU1], BROAD_DOMAIN)).toEqual([SK1])
      } finally {
        restoreLocalStorage()
      }
      expect(cookieNames()).not.toContain(SK1 + ':' + GCOOKIE_NAME)
      expect(cookieNames()).not.toContain(SK1 + ':' + CAMP_COOKIE_NAME)
      expect(cookieNames()).toContain(EU1 + ':' + GCOOKIE_NAME)
      expect(cookieNames()).toContain(SK1 + ':cart')
    })

    test('registers and cleans up a previous owner after a mismatch migrate', () => {
      seedLegacyDefault(SK1, 'guid-sk1')
      migrateLegacyStorage(createStorage(EU1), EU1, logger)

      expect(readRegistry()).toEqual([SK1])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).not.toBeNull()

      expect(syncActiveAccounts([EU1])).toEqual([SK1])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).toBeNull()
      expect(readRegistry()).toEqual([EU1])
    })
  })

  describe('removeAccounts (ids to delete)', () => {
    const seedAccount = (id) => {
      localStorage.setItem(id + ':' + GCOOKIE_NAME, encodeLS('guid-' + id))
      setCookie(id + ':' + GCOOKIE_NAME, 'guid-' + id, BROAD_DOMAIN)
    }
    const readRegistry = () => JSON.parse(localStorage.getItem(ACCOUNTS_REGISTRY))

    test('deletes only the listed ids and leaves uninitialized accounts in the registry', () => {
      seedAccount(SK1)
      seedAccount(EU1)
      registerActiveAccount(SK1)
      registerActiveAccount(EU1)

      expect(removeAccounts([SK1], BROAD_DOMAIN)).toEqual([SK1])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).toBeNull()
      expect(cookieNames()).not.toContain(SK1 + ':' + GCOOKIE_NAME)
      expect(localStorage.getItem(EU1 + ':' + GCOOKIE_NAME)).not.toBeNull()
      expect(readRegistry()).toEqual([EU1])
    })

    test('returns only the accounts that actually had storage deleted', () => {
      seedAccount(SK1)
      registerActiveAccount(SK1)

      expect(removeAccounts([SK1, EU1], BROAD_DOMAIN)).toEqual([SK1])
    })

    test('is a no-op for an empty list', () => {
      seedAccount(SK1)
      registerActiveAccount(SK1)
      expect(removeAccounts([])).toEqual([])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).not.toBeNull()
      expect(readRegistry()).toEqual([SK1])
    })

    test('removes an account that was never registered', () => {
      seedAccount(SK1)
      registerActiveAccount(EU1)

      expect(removeAccounts([SK1], BROAD_DOMAIN)).toEqual([SK1])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).toBeNull()
      expect(readRegistry()).toEqual([EU1])
    })

    test('does not delete accounts that merely share a prefix', () => {
      localStorage.setItem('AB:' + GCOOKIE_NAME, '1')
      localStorage.setItem('ABC:' + GCOOKIE_NAME, '2')
      registerActiveAccount('AB')
      registerActiveAccount('ABC')

      expect(removeAccounts(['AB'])).toEqual(['AB'])
      expect(localStorage.getItem('AB:' + GCOOKIE_NAME)).toBeNull()
      expect(localStorage.getItem('ABC:' + GCOOKIE_NAME)).toBe('2')
      expect(readRegistry()).toEqual(['ABC'])
    })

    test('leaves keys and cookies that the SDK does not own', () => {
      seedAccount(SK1)
      setCookie(SK1 + ':' + SCOOKIE_PREFIX, '{"s":1}', BROAD_DOMAIN)
      localStorage.setItem(SK1 + ':cart', 'host-app-data')
      setCookie(SK1 + ':theme', 'dark', BROAD_DOMAIN)

      removeAccounts([SK1], BROAD_DOMAIN)

      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).toBeNull()
      expect(cookieNames()).not.toContain(SK1 + ':' + SCOOKIE_PREFIX)
      expect(localStorage.getItem(SK1 + ':cart')).toBe('host-app-data')
      expect(cookieNames()).toContain(SK1 + ':theme')
    })

    test('is skipped while a migration is in progress', () => {
      seedAccount(SK1)
      registerActiveAccount(SK1)
      localStorage.setItem(STORAGE_MIGRATION_FLAG, false)

      expect(removeAccounts([SK1])).toEqual([])
      expect(localStorage.getItem(SK1 + ':' + GCOOKIE_NAME)).not.toBeNull()
      expect(readRegistry()).toEqual([SK1])
    })

    test('cookie-only: removes the cookies of the listed accounts and updates the cookie registry', () => {
      setCookie(SK1 + ':' + GCOOKIE_NAME, 'guid-sk1', BROAD_DOMAIN)
      setCookie(EU1 + ':' + GCOOKIE_NAME, 'guid-eu1', BROAD_DOMAIN)
      disableLocalStorage()
      try {
        registerActiveAccount(SK1)
        registerActiveAccount(EU1)
        expect(removeAccounts([SK1], BROAD_DOMAIN)).toEqual([SK1])
        expect(syncActiveAccounts([SK1], BROAD_DOMAIN)).toEqual([EU1])
      } finally {
        restoreLocalStorage()
      }
      expect(cookieNames()).not.toContain(SK1 + ':' + GCOOKIE_NAME)
      expect(cookieNames()).not.toContain(EU1 + ':' + GCOOKIE_NAME)
    })
  })
})
