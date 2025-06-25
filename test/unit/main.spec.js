import main from '../../src/main'
import CleverTap from '../../src/clevertap'
import RequestDispatcher from '../../src/util/requestDispatcher'
import { $ct } from '../../src/util/storage'

// Mock RequestDispatcher and related dependencies to prevent fetch API calls
jest.mock('../../src/util/requestDispatcher', () => ({
  default: {
    handleFetchResponse: jest.fn().mockResolvedValue(),
    fireRequest: jest.fn(),
    logger: undefined,
    device: undefined,
    account: undefined
  }
}))

describe('main.js', function () {
  beforeEach(() => {
    // Mock RequestDispatcher methods to prevent any unexpected calls
    RequestDispatcher.handleFetchResponse = jest.fn().mockResolvedValue()
    RequestDispatcher.fireRequest = jest.fn()

    // Mock $ct object with default values to prevent undefined errors
    $ct.enableFetchApi = false
    $ct.blockRequest = false
    $ct.globalCache = {
      REQ_N: 0,
      RESP_N: 0
    }
    $ct.isOptInRequest = false
    $ct.globalProfileMap = null
  })

  test('Main exports CleverTap instance', () => {
    expect(main).toBeInstanceOf(CleverTap)
  })
})
