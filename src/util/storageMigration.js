import {
  ACCOUNT_ID,
  ACCOUNTS_REGISTRY,
  APPLICATION_SERVER_KEY_RECEIVED,
  ARP_COOKIE,
  BLOCK_REQUEST_COOKIE,
  CAMP_COOKIE_G,
  CAMP_COOKIE_NAME,
  CHARGEDID_COOKIE_NAME,
  COOKIE_EXPIRY,
  CT_EIT_FALLBACK,
  ENABLE_TV_CONTROLS,
  EV_COOKIE,
  FIRE_PUSH_UNREGISTERED,
  GCOOKIE_NAME,
  ISOLATE_COOKIE,
  KCOOKIE_NAME,
  LCOOKIE_NAME,
  LRU_CACHE,
  META_COOKIE,
  MUTE_EXPIRY_KEY,
  NOTIFICATION_PUSH_METHOD_DEFERRED,
  POPUP_LOADING,
  PR_COOKIE,
  PUSH_SUBSCRIPTION_DATA,
  QUALIFIED_CAMPAIGNS,
  SCOOKIE_EXP_TIME_IN_SECS,
  SCOOKIE_PREFIX,
  STORAGE_MIGRATION_FLAG,
  VARIABLES,
  WEBINBOX,
  WEBINBOX_CONFIG,
  WEBPUSH_CONFIG,
  WEBPUSH_CONFIG_RECEIVED,
  WEBPUSH_LS_KEY
} from './constants'
import InstanceStorageManager from './instanceStorageManager'
import { StorageManager } from './storage'

// Account scoped keys the default instance used to store un-prefixed.
// ACCOUNT_ID is last, so an interrupted migration can still find the owner.
const ACCOUNT_SCOPED_KEYS = [
  ISOLATE_COOKIE,
  GCOOKIE_NAME,
  KCOOKIE_NAME,
  META_COOKIE,
  PR_COOKIE,
  EV_COOKIE,
  ARP_COOKIE,
  LCOOKIE_NAME,
  CAMP_COOKIE_NAME,
  CAMP_COOKIE_G,
  CHARGEDID_COOKIE_NAME,
  LRU_CACHE,
  MUTE_EXPIRY_KEY,
  BLOCK_REQUEST_COOKIE,
  WEBPUSH_LS_KEY,
  FIRE_PUSH_UNREGISTERED,
  PUSH_SUBSCRIPTION_DATA,
  WEBINBOX_CONFIG,
  WEBINBOX,
  VARIABLES,
  WEBPUSH_CONFIG,
  WEBPUSH_CONFIG_RECEIVED,
  APPLICATION_SERVER_KEY_RECEIVED,
  NOTIFICATION_PUSH_METHOD_DEFERRED,
  QUALIFIED_CAMPAIGNS,
  ENABLE_TV_CONTROLS,
  POPUP_LOADING,
  CT_EIT_FALLBACK,
  'WZRK_P',
  ACCOUNT_ID
]

// Every key/cookie name the SDK writes per account as `KEY:{accountId}`
// (the session cookie is not part of the legacy list: it used to be `WZRK_S_{accountId}`)
const SDK_STORAGE_KEYS = [...ACCOUNT_SCOPED_KEYS, SCOOKIE_PREFIX]

// Cookies shared across sub-domains (written with createBroadCookie)
const BROAD_COOKIE_KEYS = [GCOOKIE_NAME, LRU_CACHE]

const isLocalStorageSupported = StorageManager._isLocalStorageSupported
const readCookie = InstanceStorageManager._readRawCookie

export const snapshotCookieNames = () =>
  document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(Boolean)

// Parent domains of a hostname, e.g. a.b.example.com -> .b.example.com, .example.com, .com.
// The SDK writes the shared cookies on the broadest one the browser accepted.
export const parentDomains = (hostname) => {
  const parts = hostname.split('.')
  const domains = []
  for (let i = 1; i < parts.length; i++) {
    domains.push('.' + parts.slice(i).join('.'))
  }
  return domains
}

// The SDK always wrote its cookies with a `domain` attribute: the host, or a parent
// domain for the shared cookies.
const expireCookie = (name, broadDomain) => {
  const hostname = window.location.hostname
  const domains = new Set([hostname, broadDomain, ...parentDomains(hostname)])
  domains.forEach(domain => {
    if (domain) {
      StorageManager.removeCookie(name, domain, false)
    }
  })
}

// Flag: the value `false` ("not migrated yet"), in LS or as a cookie when LS is unsupported.
// It exists only while a migration is in progress.
export const isMigrationInProgress = () =>
  (isLocalStorageSupported() ? localStorage.getItem(STORAGE_MIGRATION_FLAG) : readCookie(STORAGE_MIGRATION_FLAG)) != null

const writeFlag = () =>
  isLocalStorageSupported()
    ? localStorage.setItem(STORAGE_MIGRATION_FLAG, false)
    : StorageManager.createCookie(STORAGE_MIGRATION_FLAG, false, 0, window.location.hostname, false)

const clearFlag = () =>
  isLocalStorageSupported() ? localStorage.removeItem(STORAGE_MIGRATION_FLAG) : expireCookie(STORAGE_MIGRATION_FLAG)

// The account that wrote the legacy (un-prefixed) keys
const readLegacyOwner = () => {
  const raw = (isLocalStorageSupported() && localStorage.getItem(ACCOUNT_ID)) || readCookie(ACCOUNT_ID)
  try {
    const id = JSON.parse(decodeURIComponent(raw))
    return typeof id === 'string' ? id : null
  } catch (e) {
    return null
  }
}

// ACCOUNT_ID is migrated last, so an unprefixed copy means work is still pending.
const hasUnprefixedAccountId = () =>
  (isLocalStorageSupported() && localStorage.getItem(ACCOUNT_ID) != null) ||
  readCookie(ACCOUNT_ID) != null

// WZRK_ACCOUNTS lives in localStorage, or in a cookie when localStorage is unsupported
const readAccountsRegistry = () => {
  try {
    const raw = isLocalStorageSupported() ? localStorage.getItem(ACCOUNTS_REGISTRY) : readCookie(ACCOUNTS_REGISTRY)
    const ids = JSON.parse(raw)
    return Array.isArray(ids) ? ids : []
  } catch (e) {
    return []
  }
}

const writeAccountsRegistry = (ids) => {
  if (isLocalStorageSupported()) {
    localStorage.setItem(ACCOUNTS_REGISTRY, JSON.stringify(ids))
  } else {
    StorageManager.createCookie(ACCOUNTS_REGISTRY, JSON.stringify(ids), COOKIE_EXPIRY, window.location.hostname, false)
  }
}

const scopedName = (key, accountId) => key + ':' + accountId
const prefixedName = (key, accountId) => accountId + ':' + key

// Copy only if the scoped key is missing (never clobber), then drop the old key
const moveLocalStorageKey = (source, target) => {
  const raw = localStorage.getItem(source)
  if (raw == null) {
    return
  }
  if (localStorage.getItem(target) == null) {
    localStorage.setItem(target, raw)
  }
  localStorage.removeItem(source)
}

// `source` is the old cookie name, written as `{key}:{owner}` through ownerStorage
const moveCookie = (source, key, owner, ownerStorage, lsSupported) => {
  const value = readCookie(source)
  if (value === null) {
    return
  }
  const hostname = window.location.hostname
  const existing = readCookie(scopedName(key, owner))
  let broadDomain
  if (BROAD_COOKIE_KEYS.includes(key)) {
    // returns the parent domain the cookie was written on, which is where the old one lives too
    broadDomain = ownerStorage.createBroadCookie(key, existing ?? value, COOKIE_EXPIRY, hostname)
  } else if (!lsSupported) {
    if (existing === null) {
      // cookie-only mode: the cookies are the storage
      ownerStorage.createCookie(key, value, 0, hostname)
    }
  } else if (localStorage.getItem(scopedName(key, owner)) == null) {
    // written in cookie-only mode, localStorage works now: keep the value there
    ownerStorage.save(key, existing ?? value)
  }
  expireCookie(source, broadDomain)
}

// Session cookie, previously WZRK_S_{accountId} (before v3.2.0) or {accountId}:WZRK_S (v3.2.x).
// Now: WZRK_S:{accountId}
const moveSessionCookie = (source, owner, ownerStorage) => {
  const value = readCookie(source)
  if (value === null) {
    return
  }
  const existing = readCookie(scopedName(SCOOKIE_PREFIX, owner))
  const hostname = window.location.hostname
  const broadDomain = ownerStorage.createBroadCookie(SCOOKIE_PREFIX, existing ?? value, SCOOKIE_EXP_TIME_IN_SECS, hostname)
  expireCookie(source, broadDomain)
}

// Moves every SDK key of `owner` to `{key}:{owner}`. The v3.2.x `{owner}:{key}` copy is newer than
// the bare one, so it is moved first; with includeLegacy the bare (pre v3.2.0) keys follow.
const moveAccountKeys = (owner, ownerStorage, includeLegacy) => {
  const lsSupported = isLocalStorageSupported()
  for (const key of ACCOUNT_SCOPED_KEYS) {
    const sources = includeLegacy ? [prefixedName(key, owner), key] : [prefixedName(key, owner)]
    for (const source of sources) {
      if (lsSupported) {
        moveLocalStorageKey(source, scopedName(key, owner))
      }
      moveCookie(source, key, owner, ownerStorage, lsSupported)
    }
  }
  moveSessionCookie(prefixedName(SCOOKIE_PREFIX, owner), owner, ownerStorage)
  if (includeLegacy) {
    moveSessionCookie(SCOOKIE_PREFIX + '_' + owner, owner, ownerStorage)
  }
}

// Moves the legacy un-prefixed storage of the default instance to `{key}:{owner}`.
export const migrateLegacyStorage = (storage, accountId, logger) => {
  const inProgress = isMigrationInProgress()
  if (!accountId || (!inProgress && !hasUnprefixedAccountId())) {
    return { migrated: false, owner: null }
  }

  // WZRK_ACCOUNT_ID is the last key to move, so an interrupted run still finds the owner
  const owner = readLegacyOwner() || accountId
  if (owner === accountId) {
    // until the migration is done, reads fall back to the old keys
    storage.setLegacyFallback(true)
    storage.setPrefixedFallback(true)
  }

  try {
    if (!inProgress) {
      writeFlag()
    }
    const ownerStorage = new InstanceStorageManager(owner, false, storage.encryption)

    if (owner !== accountId) {
      // not the default any more: register it so removeStaleInstances can clean it up
      const registry = readAccountsRegistry()
      if (!registry.includes(owner)) {
        writeAccountsRegistry([...registry, owner])
      }
    }

    moveAccountKeys(owner, ownerStorage, true)

    clearFlag()
    storage.setLegacyFallback(false)
    storage.setPrefixedFallback(false)
    return { migrated: true, owner }
  } catch (e) {
    // the flag stays, the next load resumes
    logger?.error('Storage migration interrupted: ' + e)
    return { migrated: false, owner }
  }
}

// Old v3.2.x `{accountId}:{key}` names of every SDK key
const prefixedNames = (accountId) => new Set(SDK_STORAGE_KEYS.map(key => prefixedName(key, accountId)))

const hasPrefixedStorage = (accountId) => {
  const names = prefixedNames(accountId)
  return (isLocalStorageSupported() && Object.keys(localStorage).some(key => names.has(key))) ||
    snapshotCookieNames().some(name => names.has(name))
}

/**
 * Moves the v3.2.0 - v3.2.1 `{accountId}:{key}` storage of one account to `{key}:{accountId}`.
 * Runs for every instance. Copy-before-delete and never clobbers, so an interrupted run
 * resumes on the next load (reads fall back to the old keys until then).
 */
export const migratePrefixedStorage = (storage, accountId, logger) => {
  if (!accountId || !hasPrefixedStorage(accountId)) {
    return { migrated: false }
  }
  storage.setPrefixedFallback(true)
  try {
    moveAccountKeys(accountId, new InstanceStorageManager(accountId, false, storage.encryption), false)
    storage.setPrefixedFallback(false)
    return { migrated: true }
  } catch (e) {
    logger?.error('Storage migration interrupted: ' + e)
    return { migrated: false }
  }
}

/**
 * Appends one account id to WZRK_ACCOUNTS. Does not delete anything.
 *
 * @param {string} accountId
 */
export const registerActiveAccount = (accountId) => {
  if (typeof accountId !== 'string' || !accountId) {
    return
  }
  try {
    const registry = readAccountsRegistry()
    if (!registry.includes(accountId)) {
      writeAccountsRegistry([...registry, accountId])
    }
  } catch (e) {} // e.g. storage quota, must never surface on the host page
}

const deleteAccountStorage = (accountIds, broadDomain) => {
  const cleaned = new Set()
  if (accountIds.length === 0) {
    return []
  }
  const owners = new Map()
  accountIds.forEach(id => SDK_STORAGE_KEYS.forEach(key => {
    owners.set(scopedName(key, id), id)
    owners.set(prefixedName(key, id), id)
  }))
  if (isLocalStorageSupported()) {
    Object.keys(localStorage).filter(key => owners.has(key)).forEach(key => {
      localStorage.removeItem(key)
      cleaned.add(owners.get(key))
    })
  }
  snapshotCookieNames().filter(name => owners.has(name)).forEach(name => {
    expireCookie(name, broadDomain)
    cleaned.add(owners.get(name))
  })
  return [...cleaned]
}

/**
 * Deletes storage for these account ids and drops them from WZRK_ACCOUNTS.
 * Other registered accounts (including ones not initialized on this page) stay.
 *
 * @param {string[]} accountIds
 * @param {string} [broadDomain]
 * @returns {string[]} the account ids that had SDK storage deleted
 */
export const removeAccounts = (accountIds, broadDomain) => {
  if (isMigrationInProgress() || accountIds.length === 0) {
    return []
  }
  const removed = deleteAccountStorage(accountIds, broadDomain)
  writeAccountsRegistry(readAccountsRegistry().filter(id => !accountIds.includes(id)))
  return removed
}

/**
 * Keep-list: deletes storage for accounts in WZRK_ACCOUNTS that are not in
 * activeAccountIds, then writes that list as the new registry.
 * Used by removeStaleInstances when no remove-list is given.
 *
 * Skipped while a migration is pending. Also skipped when no account is active
 * (e.g. called before any instance is initialised), unless `removeAll` is true,
 * in which case every registered account is removed.
 *
 * @param {string[]} activeAccountIds
 * @param {string} [broadDomain] parent domain the shared cookies are written on
 * @param {boolean} [removeAll=false] allow an empty active list to remove every registered account
 * @returns {string[]} the account ids that had SDK storage deleted
 */
export const syncActiveAccounts = (activeAccountIds, broadDomain, removeAll = false) => {
  if (isMigrationInProgress() || (activeAccountIds.length === 0 && !removeAll)) {
    return []
  }
  const removedAccounts = readAccountsRegistry().filter(id => !activeAccountIds.includes(id))
  const removed = deleteAccountStorage(removedAccounts, broadDomain)
  writeAccountsRegistry(activeAccountIds)
  return removed
}
