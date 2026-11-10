import 'regenerator-runtime/runtime'
import InstanceStorageManager from '../../../src/util/instanceStorageManager'
import InstanceManager from '../../../src/util/instanceManager'
import LRUCache from '../../../src/util/lruCache'
import { Encryption } from '../../../src/modules/security/Encryption'
import { getMuteExpiry, isMuted } from '../../../src/util/storage'
import {
  arp,
  getCampaignObject,
  initDiscardedEventsFromStorage,
  isEventDiscarded,
  saveCampaignObject
} from '../../../src/util/clevertap'
import {
  ARP_COOKIE,
  CAMP_COOKIE_NAME,
  DISCARDED_EVENT_JSON_KEY,
  DISCARDED_EVENT_XOR_KEY,
  MUTE_EXPIRY_KEY
} from '../../../src/util/constants'
import { clearAllStorage } from './storageTestUtils'

const SK1 = 'TEST-ACC-AAA'
const EU1 = 'TEST-ACC-BBB'

const createStorage = (accountId, isDefault) => new InstanceStorageManager(accountId, isDefault, new Encryption())

const encodeDiscarded = (name) => {
  let binary = ''
  for (let i = 0; i < name.length; i++) {
    binary += String.fromCharCode(name.charCodeAt(i) ^ DISCARDED_EVENT_XOR_KEY.charCodeAt(i % DISCARDED_EVENT_XOR_KEY.length))
  }
  return window.btoa(binary)
}

describe('per instance isolation of previously shared helpers', () => {
  let sk1
  let eu1

  beforeEach(() => {
    clearAllStorage()
    jest.clearAllMocks()
    sk1 = createStorage(SK1, true)
    eu1 = createStorage(EU1, false)
  })

  test('campaign objects (WZRK_CAMP / WZRK_CAMP_G) are not shared', () => {
    saveCampaignObject({ wsc: 5, tc: 2 }, sk1)

    expect(getCampaignObject(sk1)).toMatchObject({ wsc: 5, tc: 2 })
    expect(getCampaignObject(eu1)).toEqual({})
    expect(localStorage.getItem(SK1 + ':' + CAMP_COOKIE_NAME)).not.toBeNull()
    expect(localStorage.getItem(EU1 + ':' + CAMP_COOKIE_NAME)).toBeNull()
    expect(localStorage.getItem(CAMP_COOKIE_NAME)).toBeNull()
  })

  test('the identity -> GUID LRU cache (WZRK_X) is not shared', () => {
    const sk1Cache = new LRUCache(5, sk1)
    sk1Cache.set('identity-1', 'guid-sk1')

    const eu1Cache = new LRUCache(5, eu1)
    expect(eu1Cache.get('identity-1')).toBeFalsy()

    // a reload of each instance still resolves only its own identities
    expect(new LRUCache(5, sk1).get('identity-1')).toBe('guid-sk1')
    expect(new LRUCache(5, eu1).get('identity-1')).toBeFalsy()
  })

  test('mute expiry is per account', () => {
    sk1.saveToLSorCookie(MUTE_EXPIRY_KEY, Date.now() + 60 * 1000)

    expect(isMuted(sk1)).toBe(true)
    expect(getMuteExpiry(sk1)).not.toBeNull()
    expect(isMuted(eu1)).toBe(false)
    expect(getMuteExpiry(eu1)).toBeNull()
  })

  test('ARP responses and the discarded events list are kept per instance', () => {
    const state1 = new InstanceManager(SK1, false).state
    const state2 = new InstanceManager(EU1, false).state

    arp({ [DISCARDED_EVENT_JSON_KEY]: [encodeDiscarded('Blocked Event')], rate: 1 }, sk1, state1)
    arp({ rate: 2 }, eu1, state2)

    expect(isEventDiscarded('blocked event', state1)).toBe(true)
    expect(isEventDiscarded('blocked event', state2)).toBe(false)
    expect(sk1.readFromLSorCookie(ARP_COOKIE).rate).toBe(1)
    expect(eu1.readFromLSorCookie(ARP_COOKIE).rate).toBe(2)

    // after a reload each instance restores only its own discarded events
    const reloaded1 = new InstanceManager(SK1, false).state
    const reloaded2 = new InstanceManager(EU1, false).state
    initDiscardedEventsFromStorage(sk1, reloaded1)
    initDiscardedEventsFromStorage(eu1, reloaded2)
    expect(isEventDiscarded('Blocked Event', reloaded1)).toBe(true)
    expect(isEventDiscarded('Blocked Event', reloaded2)).toBe(false)
  })
})
