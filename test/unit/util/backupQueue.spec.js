import {
  getBackupEntryTs,
  getWZRK_LStoredSize,
  pruneBackupMap
} from '../../../src/util/backupQueue'

describe('util/backupQueue', () => {
  let logger

  beforeEach(() => {
    logger = { debug: jest.fn() }
  })

  describe('getBackupEntryTs', () => {
    test('prefers entry.ts when present', () => {
      expect(getBackupEntryTs({ q: 'https://x.com?i=1', ts: 999 })).toBe(999)
    })

    test('falls back to &i= in q for legacy entries', () => {
      expect(getBackupEntryTs({ q: 'https://x.com/a?d=abc&i=1700000000&sn=0' })).toBe(1700000000)
    })

    test('returns 0 when ts and i are missing or unparseable', () => {
      expect(getBackupEntryTs({ q: 'foo=bar' })).toBe(0)
      expect(getBackupEntryTs({})).toBe(0)
      expect(getBackupEntryTs(null)).toBe(0)
      expect(getBackupEntryTs({ q: 'https://x.com?i=abc' })).toBe(0)
    })
  })

  describe('getWZRK_LStoredSize', () => {
    test('matches encodeURIComponent(JSON.stringify) length used by saveToLSorCookie', () => {
      const map = { 1: { q: 'a', ts: 1 } }
      expect(getWZRK_LStoredSize(map)).toBe(encodeURIComponent(JSON.stringify(map)).length)
    })

    test('returns 0 for null', () => {
      expect(getWZRK_LStoredSize(null)).toBe(0)
    })
  })

  describe('pruneBackupMap', () => {
    const now = 1_700_000_000
    const day = 24 * 60 * 60

    test('drops only when now - ts > maxAge; keeps boundary equality and fresh', () => {
      const maxAgeSeconds = 3 * day
      const map = {
        1: { q: 'old', ts: now - maxAgeSeconds - 1 },
        2: { q: 'boundary', ts: now - maxAgeSeconds },
        3: { q: 'fresh', ts: now - 10 }
      }

      pruneBackupMap(map, logger, { now, maxAgeSeconds, maxSizeBytes: 10_000_000 })

      expect(map[1]).toBeUndefined()
      expect(map[2]).toMatchObject({ q: 'boundary', ts: now - maxAgeSeconds })
      expect(map[3]).toMatchObject({ q: 'fresh', ts: now - 10 })
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('1 age-expired'))
    })

    test('uses &i= for legacy entries without ts', () => {
      const maxAgeSeconds = 100
      const map = {
        1: { q: `https://x.com?d=1&i=${now - 200}` },
        2: { q: `https://x.com?d=2&i=${now - 10}` }
      }

      pruneBackupMap(map, logger, { now, maxAgeSeconds, maxSizeBytes: 10_000_000 })

      expect(map[1]).toBeUndefined()
      expect(map[2]).toBeDefined()
    })

    test('treats missing/unparseable i as oldest under size pressure', () => {
      const map = {
        1: { q: 'no-ts-no-i' },
        2: { q: 'fresh', ts: now }
      }
      // Force size eviction with a tiny cap after age prune (nothing age-expired if maxAge huge)
      const tinyCap = getWZRK_LStoredSize({ 2: map[2] })

      pruneBackupMap(map, logger, { now, maxAgeSeconds: 999999, maxSizeBytes: tinyCap })

      expect(map[1]).toBeUndefined()
      expect(map[2]).toBeDefined()
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('size-evicted'))
    })

    test('over size cap drops oldest first; same-ts tie breaks by lower reqNo', () => {
      const map = {
        3: { q: 'c', ts: now - 50 },
        1: { q: 'a', ts: now - 100 },
        2: { q: 'b', ts: now - 100 }
      }
      // Cap that can hold only one of the same-ts pair + the newer one, or just the newest
      // Drop both oldest (1 then 2, same ts, lower reqNo first), keep 3
      const sizeWithOnly3 = getWZRK_LStoredSize({ 3: map[3] })

      pruneBackupMap(map, logger, { now, maxAgeSeconds: 999999, maxSizeBytes: sizeWithOnly3 })

      expect(map[1]).toBeUndefined()
      expect(map[2]).toBeUndefined()
      expect(map[3]).toMatchObject({ q: 'c', ts: now - 50 })
    })

    test('runs age prune before size prune in one call', () => {
      const maxAgeSeconds = 100
      const map = {
        1: { q: 'stale', ts: now - 200 },
        2: { q: 'old-fresh', ts: now - 50 },
        3: { q: 'new-fresh', ts: now }
      }
      const sizeWithOnly3 = getWZRK_LStoredSize({ 3: map[3] })

      pruneBackupMap(map, logger, { now, maxAgeSeconds, maxSizeBytes: sizeWithOnly3 })

      expect(map[1]).toBeUndefined()
      expect(map[2]).toBeUndefined()
      expect(map[3]).toBeDefined()
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringMatching(/1 age-expired.*1 size-evicted/)
      )
    })

    test('drops a single entry larger than max alone', () => {
      const map = {
        1: { q: 'x'.repeat(500), ts: now }
      }
      const oversized = getWZRK_LStoredSize(map)

      pruneBackupMap(map, logger, {
        now,
        maxAgeSeconds: 999999,
        maxSizeBytes: oversized - 1
      })

      expect(Object.keys(map)).toHaveLength(0)
      expect(getWZRK_LStoredSize(map)).toBeLessThan(oversized)
    })

    test('leaves map unchanged when under both limits', () => {
      const map = {
        1: { q: 'ok', ts: now }
      }
      const before = JSON.stringify(map)

      pruneBackupMap(map, logger, { now, maxAgeSeconds: 999999, maxSizeBytes: 10_000_000 })

      expect(JSON.stringify(map)).toBe(before)
      expect(logger.debug).not.toHaveBeenCalled()
    })

    test('preserves q and ts on surviving entries', () => {
      const map = {
        1: { q: 'drop-me', ts: now - 1000 },
        2: { q: 'keep-me', ts: now, extra: 'ignored-but-kept-if-present' }
      }

      pruneBackupMap(map, logger, { now, maxAgeSeconds: 100, maxSizeBytes: 10_000_000 })

      expect(map[2]).toEqual({ q: 'keep-me', ts: now, extra: 'ignored-but-kept-if-present' })
    })

    test('returns null/undefined backupMap unchanged', () => {
      expect(pruneBackupMap(null, logger)).toBeNull()
      expect(pruneBackupMap(undefined, logger)).toBeUndefined()
    })
  })
})
