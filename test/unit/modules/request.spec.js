import 'regenerator-runtime/runtime'
import { OPTOUT_COOKIE_ENDSWITH } from '../../../src/util/constants'
import RequestManager from '../../../src/modules/request'
import { isMuted } from '../../../src/util/storage'

jest.enableAutomock().unmock('../../../src/modules/request').unmock('../../../src/util/constants')
  .unmock('../../../src/util/datatypes')

const createMockInstanceManager = () => ({
  id: 'test',
  isDefault: true,
  state: {
    globalCache: { REQ_N: 0, RESP_N: 0, gcookie: null },
    blockRequest: false,
    offline: false,
    delayEvents: false,
    flutterVersion: null,
    globalEventsMap: undefined,
    isOptInRequest: false
  },
  isOULInProgress: false,
  oulReqN: 0,
  enableFetchApi: false,
  enableEncryptionInTransit: false,
  storage: {
    readFromLSorCookie: jest.fn(),
    saveToLSorCookie: jest.fn(),
    readCookie: jest.fn(),
    getMetaProp: jest.fn(),
    getAndClearMetaProp: jest.fn(),
    setMetaProp: jest.fn(),
    backupEvent: jest.fn(),
    removeBackup: jest.fn(),
    markBackupAsOUL: jest.fn(),
    isBackupOUL: jest.fn(),
    save: jest.fn(),
    read: jest.fn(),
    _isLocalStorageSupported: jest.fn().mockReturnValue(true)
  }
})

const createMockDispatcher = () => ({
  fireRequest: jest.fn(),
  api: null,
  clearEITFallback: jest.fn()
})

const buildRequestManager = (device = {}) => {
  const mockInstanceManager = createMockInstanceManager()
  const mockDispatcher = createMockDispatcher()

  const rm = new RequestManager({
    logger: {
      debug: jest.fn(),
      error: jest.fn(),
      wzrkError: {}
    },
    account: { id: 'acc1', dataPostURL: 'https://x.com/a' },
    device: { gcookie: null, ...device },
    session: { getSessionCookieObject: jest.fn().mockReturnValue({ s: 's1' }) },
    isPersonalisationActive: () => false,
    instanceManager: mockInstanceManager
  })

  rm.dispatcher = mockDispatcher

  return { requestManager: rm, mockInstanceManager, mockDispatcher }
}

describe('modules/request', function () {
  let requestManager
  let mockInstanceManager
  let mockDispatcher

  beforeEach(() => {
    jest.clearAllMocks()

    const built = buildRequestManager()
    requestManager = built.requestManager
    mockInstanceManager = built.mockInstanceManager
    mockDispatcher = built.mockDispatcher

    mockInstanceManager.state.offline = false
    mockInstanceManager.state.delayEvents = false
    mockInstanceManager.state.blockRequest = false
    mockInstanceManager.state.isOptInRequest = false
    mockInstanceManager.state.globalCache = { REQ_N: 0, RESP_N: 0 }

    window.isOULInProgress = false

    mockInstanceManager.storage.readFromLSorCookie.mockReturnValue(null)
    isMuted.mockReturnValue(false)
  })

  describe('saveAndFireRequest - opt out handling', () => {
    test('should still fire the request (opt-out is handled by RequestDispatcher)', () => {
      const built = buildRequestManager({ gcookie: '123' + OPTOUT_COOKIE_ENDSWITH })
      requestManager = built.requestManager
      mockDispatcher = built.mockDispatcher

      requestManager.saveAndFireRequest('http://x.com?d=abc', false, false, 'evt')

      // Opt-out is now checked in RequestDispatcher.#fireRequest, not in saveAndFireRequest
      expect(mockDispatcher.fireRequest).toHaveBeenCalled()
    })

    test('should fire the request as normal when the gcookie does not end with the opt-out suffix', () => {
      const built = buildRequestManager({ gcookie: 'abc123' })
      requestManager = built.requestManager
      mockDispatcher = built.mockDispatcher

      requestManager.saveAndFireRequest('http://x.com?d=abc', false, false, 'evt')

      expect(mockDispatcher.fireRequest).toHaveBeenCalled()
    })

    test('should fire the request as normal when there is no gcookie yet', () => {
      const built = buildRequestManager({ gcookie: null })
      requestManager = built.requestManager
      mockDispatcher = built.mockDispatcher

      requestManager.saveAndFireRequest('http://x.com?d=abc', false, false, 'evt')

      expect(mockDispatcher.fireRequest).toHaveBeenCalled()
    })
  })

  describe('saveAndFireRequest - muted SDK', () => {
    test('should drop the request without backing it up when the SDK is muted', () => {
      // Mock mute expiry to a future timestamp
      mockInstanceManager.storage.readFromLSorCookie.mockImplementation((key) => {
        if (key === 'WZRK_MUTE_EXPIRY') return Date.now() + 60000
        return null
      })

      requestManager.saveAndFireRequest('http://x.com?d=abc', false, false, 'evt')

      expect(mockDispatcher.fireRequest).not.toHaveBeenCalled()
      expect(mockInstanceManager.storage.backupEvent).not.toHaveBeenCalled()
    })
  })

  describe('processBackupEvents', () => {
    test('should skip processing entirely when a previous run is already in progress', () => {
      mockInstanceManager.storage.readFromLSorCookie.mockReturnValue({ 1: { q: 'foo=bar' } })
      requestManager.processingBackup = true

      requestManager.processBackupEvents()

      expect(mockDispatcher.fireRequest).not.toHaveBeenCalled()
      expect(requestManager.processingBackup).toBe(true) // left untouched, previous run still owns it
    })

    test('should skip processing when backup events are already processed', () => {
      mockInstanceManager.storage.readFromLSorCookie.mockReturnValue({ 1: { q: 'foo=bar' } })
      requestManager.processedBackup = true

      requestManager.processBackupEvents()

      expect(mockDispatcher.fireRequest).not.toHaveBeenCalled()
      expect(requestManager.processedBackup).toBe(true)
    })

    test('should fire backup events that have a valid query string and clear the in-progress flag', () => {
      mockInstanceManager.storage.readFromLSorCookie.mockReturnValue({ 1: { q: 'foo=bar' } })

      requestManager.processBackupEvents()

      expect(mockDispatcher.fireRequest).toHaveBeenCalledWith('foo=bar')
      expect(requestManager.processingBackup).toBe(false)
    })

    test('should remove malformed backup events (missing q) instead of retrying them forever', () => {
      const malformedEvent = {} // no q property and not already fired
      mockInstanceManager.storage.readFromLSorCookie.mockReturnValue({ 1: malformedEvent })

      requestManager.processBackupEvents()

      expect(mockInstanceManager.storage.removeBackup).toHaveBeenCalledWith('1', expect.anything())
      expect(mockDispatcher.fireRequest).not.toHaveBeenCalled()
    })

    test('should only process OUL backups when oulOnly is true', () => {
      mockInstanceManager.storage.readFromLSorCookie.mockReturnValue({
        1: { q: 'oul=1' },
        2: { q: 'normal=1' }
      })
      mockInstanceManager.storage.isBackupOUL.mockImplementation((idx) => idx === 1)

      requestManager.processBackupEvents(true)

      expect(mockDispatcher.fireRequest).toHaveBeenCalledTimes(1)
      expect(mockDispatcher.fireRequest).toHaveBeenCalledWith('oul=1')
    })

    test('should do nothing when there is no backup data', () => {
      mockInstanceManager.storage.readFromLSorCookie.mockReturnValue(null)

      requestManager.processBackupEvents()

      expect(mockDispatcher.fireRequest).not.toHaveBeenCalled()
    })
  })
})
