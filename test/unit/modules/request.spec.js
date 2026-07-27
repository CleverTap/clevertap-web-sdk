import 'regenerator-runtime/runtime'
import { OPTOUT_COOKIE_ENDSWITH } from '../../../src/util/constants'
import RequestManager from '../../../src/modules/request'
import RequestDispatcher from '../../../src/util/requestDispatcher'
import { StorageManager, $ct, isMuted } from '../../../src/util/storage'

jest.enableAutomock().unmock('../../../src/modules/request').unmock('../../../src/util/constants')
  .unmock('../../../src/util/datatypes')

const buildRequestManager = (device = {}) => new RequestManager({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    wzrkError: {}
  },
  account: { id: 'acc1', dataPostURL: 'https://x.com/a' },
  device: { gcookie: null, ...device },
  session: { getSessionCookieObject: jest.fn().mockReturnValue({ s: 's1' }) },
  isPersonalisationActive: () => false
})

describe('modules/request', function () {
  let requestManager

  beforeEach(() => {
    jest.clearAllMocks()

    requestManager = buildRequestManager()

    Object.assign($ct, {
      offline: false,
      delayEvents: false,
      blockRequest: false,
      isOptInRequest: false,
      globalCache: { REQ_N: 0, RESP_N: 0 }
    })

    window.isOULInProgress = false

    StorageManager.readFromLSorCookie.mockReturnValue(null)
    isMuted.mockReturnValue(false)
    RequestDispatcher.fireRequest = jest.fn()
  })

  describe('saveAndFireRequest - opt out handling', () => {
    test('should drop the request and not save/fire it when the gcookie ends with the opt-out suffix', () => {
      requestManager = buildRequestManager({ gcookie: '123' + OPTOUT_COOKIE_ENDSWITH })

      requestManager.saveAndFireRequest('http://x.com?d=abc', false, false, 'evt')

      expect(RequestDispatcher.fireRequest).not.toHaveBeenCalled()
      expect(StorageManager.backupEvent).not.toHaveBeenCalled()
    })

    test('should not drop the request when an opt-in is in progress, and should reset the opt-in flag afterwards', () => {
      $ct.isOptInRequest = true
      requestManager = buildRequestManager({ gcookie: '123' + OPTOUT_COOKIE_ENDSWITH })

      requestManager.saveAndFireRequest('http://x.com?d=abc', false, false, 'evt')

      expect(RequestDispatcher.fireRequest).toHaveBeenCalled()
      expect($ct.isOptInRequest).toBe(false)
    })

    test('should fire the request as normal when the gcookie does not end with the opt-out suffix', () => {
      requestManager = buildRequestManager({ gcookie: 'abc123' })

      requestManager.saveAndFireRequest('http://x.com?d=abc', false, false, 'evt')

      expect(RequestDispatcher.fireRequest).toHaveBeenCalled()
    })

    test('should fire the request as normal when there is no gcookie yet', () => {
      requestManager = buildRequestManager({ gcookie: null })

      requestManager.saveAndFireRequest('http://x.com?d=abc', false, false, 'evt')

      expect(RequestDispatcher.fireRequest).toHaveBeenCalled()
    })
  })

  describe('saveAndFireRequest - muted SDK', () => {
    test('should drop the request without backing it up when the SDK is muted', () => {
      isMuted.mockReturnValue(true)

      requestManager.saveAndFireRequest('http://x.com?d=abc', false, false, 'evt')

      expect(RequestDispatcher.fireRequest).not.toHaveBeenCalled()
      expect(StorageManager.backupEvent).not.toHaveBeenCalled()
    })
  })

  describe('processBackupEvents', () => {
    test('should skip processing entirely when a previous run is already in progress', () => {
      StorageManager.readFromLSorCookie.mockReturnValue({ 1: { q: 'foo=bar' } })
      requestManager.processingBackup = true

      requestManager.processBackupEvents()

      expect(RequestDispatcher.fireRequest).not.toHaveBeenCalled()
      expect(requestManager.processingBackup).toBe(true) // left untouched, previous run still owns it
    })

    test('should skip processing when backup events are already processed', () => {
      StorageManager.readFromLSorCookie.mockReturnValue({ 1: { q: 'foo=bar' } })
      requestManager.processedBackup = true

      requestManager.processBackupEvents()

      expect(RequestDispatcher.fireRequest).not.toHaveBeenCalled()
      expect(requestManager.processedBackup).toBe(true)
    })

    test('should fire backup events that have a valid query string and clear the in-progress flag', () => {
      StorageManager.readFromLSorCookie.mockReturnValue({ 1: { q: 'foo=bar' } })

      requestManager.processBackupEvents()

      expect(RequestDispatcher.fireRequest).toHaveBeenCalledWith('foo=bar')
      expect(requestManager.processingBackup).toBe(false)
    })

    test('should remove malformed backup events (missing q) instead of retrying them forever', () => {
      const malformedEvent = { fired: true }
      StorageManager.readFromLSorCookie.mockReturnValue({ 1: malformedEvent })

      requestManager.processBackupEvents()

      expect(StorageManager.removeBackup).toHaveBeenCalledWith('1', expect.anything())
      expect(RequestDispatcher.fireRequest).not.toHaveBeenCalled()
    })

    test('should only process OUL backups when oulOnly is true', () => {
      StorageManager.readFromLSorCookie.mockReturnValue({
        1: { q: 'oul=1' },
        2: { q: 'normal=1' }
      })
      StorageManager.isBackupOUL.mockImplementation((idx) => idx === 1)

      requestManager.processBackupEvents(true)

      expect(RequestDispatcher.fireRequest).toHaveBeenCalledTimes(1)
      expect(RequestDispatcher.fireRequest).toHaveBeenCalledWith('oul=1')
    })

    test('should do nothing when there is no backup data', () => {
      StorageManager.readFromLSorCookie.mockReturnValue(null)

      requestManager.processBackupEvents()

      expect(RequestDispatcher.fireRequest).not.toHaveBeenCalled()
    })
  })
})
