import RequestManager from '../../../src/modules/request'
import Account from '../../../src/modules/account'

describe('RequestManager - Blocked Account ID', () => {
  let requestManager
  let mockLogger
  let mockDevice
  let mockSession
  let mockIsPersonalisationActive

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
      wzrkError: {}
    }
    mockDevice = {
      gcookie: 'test-gcookie-123'
    }
    mockSession = {
      getSessionCookieObject: jest.fn(() => ({ s: 'session-123', p: 1 }))
    }
    mockIsPersonalisationActive = jest.fn(() => false)
  })

  test('should drop post requests for blocked account ID 8R5-4K5-466Z', () => {
    const blockedAccount = new Account({ id: '8R5-4K5-466Z' })
    requestManager = new RequestManager({
      logger: mockLogger,
      account: blockedAccount,
      device: mockDevice,
      session: mockSession,
      isPersonalisationActive: mockIsPersonalisationActive
    })

    const testUrl = 'https://example.com/api/sync'
    const testBody = JSON.stringify({ data: 'test' })

    return requestManager.post(testUrl, testBody)
      .then(() => {
        // If we reach here, the test should fail
        expect(true).toBe(false)
      })
      .catch((error) => {
        // Verify that the request was blocked
        expect(error.message).toBe('Account blocked')
        expect(mockLogger.debug).toHaveBeenCalledWith('post req dropped for blocked account: 8R5-4K5-466Z')
      })
  })

  test('should allow post requests for non-blocked account IDs', () => {
    const normalAccount = new Account({ id: 'TEST-ACCOUNT-123' })
    requestManager = new RequestManager({
      logger: mockLogger,
      account: normalAccount,
      device: mockDevice,
      session: mockSession,
      isPersonalisationActive: mockIsPersonalisationActive
    })

    const testUrl = 'https://example.com/api/sync'
    const testBody = JSON.stringify({ data: 'test' })

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    )

    return requestManager.post(testUrl, testBody)
      .then((result) => {
        // Verify that the request was not blocked
        expect(mockLogger.debug).not.toHaveBeenCalledWith(expect.stringContaining('post req dropped for blocked account'))
        expect(result).toEqual({ success: true })
        expect(global.fetch).toHaveBeenCalledWith(testUrl, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: testBody
        })
      })
  })
})
