import { OPTOUT_COOKIE_ENDSWITH } from '../../../src/util/constants'
import RequestDispatcher from '../../../src/util/requestDispatcher'

jest.enableAutomock().unmock('../../../src/util/requestDispatcher').unmock('../../../src/util/constants')
  .unmock('../../../src/util/datatypes')

describe('util/requestDispatcher', function () {
  describe('fire request', () => {
    beforeEach(() => {
      RequestDispatcher.logger = {
        debug: jest.fn()
      }
    })

    describe('drop request due to opt out', () => {
      test('should drop request and log in debug if optout cookie (endsWith:00) is set', () => {
        RequestDispatcher.device = {
          gcookie: '123' + OPTOUT_COOKIE_ENDSWITH
        }

        RequestDispatcher.fireRequest('some', true, true)
        expect(RequestDispatcher.logger.debug).toHaveBeenCalledWith(expect.stringContaining('123:OO'))
      })
    })
  })
})
