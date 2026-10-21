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

// Cookies shared across sub-domains (written with createBroadCookie)
const BROAD_COOKIE_KEYS = [GCOOKIE_NAME, LRU_CACHE]

const isLocalStorageSupported = InstanceStorageManager.isLocalStorageSupported
const readCookie = InstanceStorageManager._readRawCookie

export const snapshotCookieNames = () =>
  document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(Boolean)

// The SDK always wrote its cookies with a `domain` attribute: the host, or the broad
// (parent) domain for the shared cookies, so both have to be expired.
const expireCookie = (name, broadDomain) => {
  StorageManager.removeCookie(name, window.location.hostname)
  if (broadDomain) {
    StorageManager.removeCookie(name, broadDomain)
  }
}

// Flag: the value `false` ("not migrated yet"), in LS or as a cookie when LS is unsupported.
// It exists only while a migration is in progress.
export const isMigrationInProgress = () =>
  (isLocalStorageSupported() ? localStorage.getItem(STORAGE_MIGRATION_FLAG) : readCookie(STORAGE_MIGRATION_FLAG)) != null

const writeFlag = () =>
  isLocalStorageSupported()
    ? localStorage.setItem(STORAGE_MIGRATION_FLAG, false)
    : StorageManager.createCookie(STORAGE_MIGRATION_FLAG, false, 0, window.location.hostname)

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

const readAccountsRegistry = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(ACCOUNTS_REGISTRY))
    return Array.isArray(ids) ? ids : []
  } catch (e) {
    return []
  }
}

const writeAccountsRegistry = (ids) => {
  localStorage.setItem(ACCOUNTS_REGISTRY, JSON.stringify(ids))
}

// Copy only if the prefixed key is missing (never clobber), then drop the legacy key
const migrateLocalStorageKey = (key, owner) => {
  const raw = localStorage.getItem(key)
  if (raw == null) {
    return
  }
  const target = owner + ':' + key
  if (localStorage.getItem(target) == null) {
    localStorage.setItem(target, raw)
  }
  localStorage.removeItem(key)
}

const migrateCookie = (key, owner, ownerStorage, lsSupported) => {
  const value = readCookie(key)
  if (value === null) {
    return
  }
  const hostname = window.location.hostname
  const existing = readCookie(owner + ':' + key)
  let broadDomain
  if (BROAD_COOKIE_KEYS.includes(key)) {
    // returns the parent domain the cookie was written on, which is where the legacy one lives too
    broadDomain = ownerStorage.createBroadCookie(key, existing ?? value, COOKIE_EXPIRY, hostname)
  } else if (existing === null && !lsSupported) {
    // cookie-only mode: the cookies are the storage
    ownerStorage.createCookie(key, value, 0, hostname)
  }
  expireCookie(key, broadDomain)
}

// Previous SDK: WZRK_S_{accountId}. Now: {accountId}:WZRK_S
const migrateSessionCookie = (owner, ownerStorage) => {
  const legacyName = SCOOKIE_PREFIX + '_' + owner
  const value = readCookie(legacyName)
  if (value === null) {
    return
  }
  const existing = readCookie(owner + ':' + SCOOKIE_PREFIX)
  const hostname = window.location.hostname
  const broadDomain = ownerStorage.createBroadCookie(SCOOKIE_PREFIX, existing ?? value, SCOOKIE_EXP_TIME_IN_SECS, hostname)
  expireCookie(legacyName, broadDomain)
}

// Moves the legacy un-prefixed storage of the default instance to `{owner}:KEY`.
export const migrateLegacyStorage = (storage, accountId, logger) => {
  const inProgress = isMigrationInProgress()
  if (!accountId || (!inProgress && !hasUnprefixedAccountId())) {
    return { migrated: false, owner: null }
  }

  // WZRK_ACCOUNT_ID is the last key to move, so an interrupted run still finds the owner
  const owner = readLegacyOwner() || accountId
  if (owner === accountId) {
    // until the migration is done, reads fall back to the legacy keys
    storage.setLegacyFallback(true)
  }

  try {
    if (!inProgress) {
      writeFlag()
    }
    const lsSupported = isLocalStorageSupported()
    const ownerStorage = new InstanceStorageManager(owner, false, storage.encryption)
    migrateSessionCookie(owner, ownerStorage)

    if (lsSupported && owner !== accountId) {
      // not the default any more: register it so removeStaleInstances can clean it up
      const registry = readAccountsRegistry()
      if (!registry.includes(owner)) {
        writeAccountsRegistry([...registry, owner])
      }
    }

    for (const key of ACCOUNT_SCOPED_KEYS) {
      if (lsSupported) {
        migrateLocalStorageKey(key, owner)
      }
      migrateCookie(key, owner, ownerStorage, lsSupported)
    }

    clearFlag()
    storage.setLegacyFallback(false)
    return { migrated: true, owner }
  } catch (e) {
    // the flag stays, the next load resumes
    logger?.error('Storage migration interrupted: ' + e)
    return { migrated: false, owner }
  }
}

/**
 * Appends one account id to WZRK_ACCOUNTS. Does not delete anything.
 *
 * @param {string} accountId
 */
export const registerActiveAccount = (accountId) => {
  if (!isLocalStorageSupported() || typeof accountId !== 'string' || !accountId || isMigrationInProgress()) {
    return
  }
  try {
    const registry = readAccountsRegistry()
    if (!registry.includes(accountId)) {
      writeAccountsRegistry([...registry, accountId])
    }
  } catch (e) {} // e.g. storage quota, must never surface on the host page
}

const deleteAccountStorage = (removed, broadDomain) => {
  if (removed.length === 0) {
    return
  }
  const isRemoved = (name) => removed.some(id => name.startsWith(id + ':'))
  Object.keys(localStorage).filter(isRemoved).forEach(key => localStorage.removeItem(key))
  snapshotCookieNames().filter(isRemoved).forEach(name => expireCookie(name, broadDomain))
}

/**
 * Deletes storage for these account ids and drops them from WZRK_ACCOUNTS.
 * Other registered accounts (including ones not initialized on this page) stay.
 *
 * @param {string[]} accountIds
 * @param {string} [broadDomain]
 * @returns {string[]} the account ids that were removed
 */
export const removeAccounts = (accountIds, broadDomain) => {
  if (!isLocalStorageSupported() || isMigrationInProgress()) {
    return []
  }
  if (accountIds.length === 0) {
    return []
  }
  deleteAccountStorage(accountIds, broadDomain)
  writeAccountsRegistry(readAccountsRegistry().filter(id => !accountIds.includes(id)))
  return accountIds
}

/**
 * Keep-list: deletes storage for accounts in WZRK_ACCOUNTS that are not in
 * activeAccountIds, then writes that list as the new registry.
 * Used by removeStaleInstances when no remove-list is given.
 *
 * Skipped while a migration is pending and when no account is active.
 *
 * @param {string[]} activeAccountIds
 * @param {string} [broadDomain] parent domain the shared cookies are written on
 * @returns {string[]} the account ids whose storage was removed
 */
export const syncActiveAccounts = (activeAccountIds, broadDomain) => {
  if (!isLocalStorageSupported() || activeAccountIds.length === 0 || isMigrationInProgress()) {
    return []
  }
  const removed = readAccountsRegistry().filter(id => !activeAccountIds.includes(id))
  deleteAccountStorage(removed, broadDomain)
  writeAccountsRegistry(activeAccountIds)
  return removed
}
