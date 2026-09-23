import { WZRK_L_MAX_AGE_SECONDS, WZRK_L_MAX_SIZE_BYTES } from './constants'
import { getNow } from './datetime'
import { getURLParam } from './url'

/**
 * Resolve the epoch-seconds timestamp for a WZRK_L backup entry.
 * Prefers entry.ts; falls back to &i= in the request URL; else 0 (oldest).
 * @param {{ q?: string, ts?: number }} entry
 * @returns {number}
 */
export const getBackupEntryTs = (entry) => {
  if (entry == null) {
    return 0
  }
  if (typeof entry.ts === 'number' && !isNaN(entry.ts)) {
    return entry.ts
  }
  if (typeof entry.q === 'string' && entry.q.length > 0) {
    const iParam = getURLParam(entry.q, 'i')
    if (iParam !== '') {
      const parsed = parseInt(iParam, 10)
      if (!isNaN(parsed)) {
        return parsed
      }
    }
  }
  return 0
}

/**
 * Size of the string that would be written to localStorage for WZRK_L
 * (encodeURIComponent(JSON.stringify(...)) as used by saveToLSorCookie).
 * @param {object} backupMap
 * @returns {number}
 */
export const getWZRK_LStoredSize = (backupMap) => {
  if (backupMap == null) {
    return 0
  }
  return encodeURIComponent(JSON.stringify(backupMap)).length
}

/**
 * Drop backups older than max age, then evict oldest until under size cap.
 * Mutates backupMap in place (same pattern as removeBackup).
 *
 * @param {object} backupMap
 * @param {{ debug?: Function }} logger
 * @param {{ now?: number, maxAgeSeconds?: number, maxSizeBytes?: number }} [options]
 * @returns {object} the same backupMap reference
 */
export const pruneBackupMap = (backupMap, logger, options = {}) => {
  if (backupMap == null || typeof backupMap !== 'object') {
    return backupMap
  }

  const now = typeof options.now === 'number' ? options.now : getNow()
  const maxAgeSeconds = typeof options.maxAgeSeconds === 'number'
    ? options.maxAgeSeconds
    : WZRK_L_MAX_AGE_SECONDS
  const maxSizeBytes = typeof options.maxSizeBytes === 'number'
    ? options.maxSizeBytes
    : WZRK_L_MAX_SIZE_BYTES

  let ageDropped = 0
  let sizeDropped = 0

  for (const reqNo in backupMap) {
    if (!Object.prototype.hasOwnProperty.call(backupMap, reqNo)) {
      continue
    }
    const ts = getBackupEntryTs(backupMap[reqNo])
    if (now - ts > maxAgeSeconds) {
      delete backupMap[reqNo]
      ageDropped++
    }
  }

  while (getWZRK_LStoredSize(backupMap) > maxSizeBytes) {
    let oldestReqNo = null
    let oldestTs = Infinity
    let oldestNumericReqNo = Infinity

    for (const reqNo in backupMap) {
      if (!Object.prototype.hasOwnProperty.call(backupMap, reqNo)) {
        continue
      }
      const ts = getBackupEntryTs(backupMap[reqNo])
      const numericReqNo = parseInt(reqNo, 10)
      const reqNoRank = isNaN(numericReqNo) ? Infinity : numericReqNo

      if (
        ts < oldestTs ||
        (ts === oldestTs && reqNoRank < oldestNumericReqNo)
      ) {
        oldestTs = ts
        oldestReqNo = reqNo
        oldestNumericReqNo = reqNoRank
      }
    }

    if (oldestReqNo == null) {
      break
    }
    delete backupMap[oldestReqNo]
    sizeDropped++
  }

  if ((ageDropped > 0 || sizeDropped > 0) && logger && typeof logger.debug === 'function') {
    logger.debug(
      `WZRK_L prune: dropped ${ageDropped} age-expired and ${sizeDropped} size-evicted backup(s)`
    )
  }

  return backupMap
}
