import RequestDispatcher from '../../../src/util/requestDispatcher'
import Account from '../../../src/modules/account'

describe('Blocked Account ID', () => {
  let mockLogger
  let mockDevice

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      error: jest.fn()
    }
    mockDevice = {
      gcookie: 'test-gcookie-123'
    }
    RequestDispatcher.logger = mockLogger
    RequestDispatcher.device = mockDevice
  })

  afterEach(() => {
    // Clear script tags added by RequestDispatcher
    const ctCbScripts = document.getElementsByClassName('ct-jp-cb')
    while (ctCbScripts[0]) {
      ctCbScripts[0].parentNode.removeChild(ctCbScripts[0])
    }
  })

  test('should drop requests for blocked account ID 8R5-4K5-466Z', () => {
    const blockedAccount = new Account({ id: '8R5-4K5-466Z' })
    RequestDispatcher.account = blockedAccount

    const testUrl = 'https://example.com/api/test'
    RequestDispatcher.fireRequest(testUrl, false, false)

    // Verify that the debug log was called with the blocked message
    expect(mockLogger.debug).toHaveBeenCalledWith('req dropped for blocked account: 8R5-4K5-466Z')

    // Verify that no script tag was added (request was blocked)
    const scriptTags = document.getElementsByClassName('ct-jp-cb')
    expect(scriptTags.length).toBe(0)
  })

  test('should allow requests for non-blocked account IDs', () => {
    const normalAccount = new Account({ id: 'TEST-ACCOUNT-123' })
    RequestDispatcher.account = normalAccount

    const testUrl = 'https://example.com/api/test'
    RequestDispatcher.fireRequest(testUrl, false, false)

    // Verify that the blocked message was not logged
    expect(mockLogger.debug).not.toHaveBeenCalledWith(expect.stringContaining('req dropped for blocked account'))

    // Verify that a script tag was added (request was not blocked)
    const scriptTags = document.getElementsByClassName('ct-jp-cb')
    expect(scriptTags.length).toBeGreaterThan(0)
  })
})
