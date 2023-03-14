import { CHARGEDID_COOKIE_NAME, CHARGED_ID } from '../../../src/util/constants'
import { convertToWZRKDate } from '../../../src/util/datetime'
import { StorageManager } from '../../../src/util/storage'
import {
  isChargedEventStructureValid,
  isEventStructureFlat
} from '../../../src/util/validator'

// mock everything except for the module that's being tested and constants and datatype validators
jest.enableAutomock().unmock('../../../src/util/validator').unmock('../../../src/util/constants')
  .unmock('../../../src/util/datatypes')

convertToWZRKDate.mockReturnValue('supported_date_format')

describe('util/validator', function () {
  describe('isEventStructureFlat', () => {
    test('should return false if input is not an object', () => {
      const result = isEventStructureFlat('test')
      expect(result).toBeFalsy()
    })

    test('should return false if input has nested object', () => {
      const input = {
        name: 'test',
        value: {
          some: 'foo'
        }
      }
      const result = isEventStructureFlat(input)
      expect(result).toBeFalsy()
    })

    test('should return false if input has an array', () => {
      const input = {
        name: 'test',
        value: [1, 2, 3]
      }

      const result = isEventStructureFlat(input)
      expect(result).toBeFalsy()
    })

    test('should return true if input is flat object and convert date to required format', () => {
      const input = {
        name: 'test',
        ts: new Date()
      }
      const result = isEventStructureFlat(input)
      expect(result).toBeTruthy()
      expect(input.ts).toBe('supported_date_format')
    })
  })

  describe('isChargedEventStructureValid', () => {
    beforeEach(() => {
      this.logger = {
        reportError: jest.fn(),
        error: jest.fn()
      }
    })

    test('should return false if input is not an object', () => {
      const result = isChargedEventStructureValid('test', this.logger)
      expect(result).toBeFalsy()
    })

    describe('"Items" key', () => {
      test('should return false if "Items" is not an array', () => {
        const input = {
          Items: {}
        }
        const result = isChargedEventStructureValid(input, this.logger)
        expect(result).toBeFalsy()
      })

      test('should log error if array length > 50 and returns false if array items are not an object', () => {
        const items = []
        for (let i = 0; i < 50; i++) {
          items.push('item' + i)
        }
        const input = {
          Items: items
        }
        const result = isChargedEventStructureValid(input, this.logger)
        expect(result).toBeFalsy()
        expect(this.logger.reportError).toHaveBeenCalledWith(522, expect.any(String))
      })

      test('should return false if Items array is not a flat object', () => {
        const items = [
          {
            name: 'test',
            value: {
              foo: 'bar'
            }
          }
        ]
        const input = {
          Items: items
        }
        const result = isChargedEventStructureValid(input, this.logger)
        expect(result).toBeFalsy()
      })

      test('should return true if Items array is a flat object', () => {
        const items = [
          {
            name: 'test',
            amount: 10
          }
        ]
        const input = {
          Items: items
        }
        const result = isChargedEventStructureValid(input, this.logger)
        expect(result).toBeTruthy()
      })
    })

    describe('for key != "Items"', () => {
      test('should return false if input has nested object', () => {
        const input = {
          name: 'test',
          value: {
            some: 'foo'
          }
        }
        const result = isChargedEventStructureValid(input, this.logger)
        expect(result).toBeFalsy()
      })

      test('should return false if input has array', () => {
        const input = {
          name: 'test',
          value: [1, 2, 3]
        }
        const result = isChargedEventStructureValid(input, this.logger)
        expect(result).toBeFalsy()
      })

      test('should return true if input is flat object and convert date to required format', () => {
        const input = {
          name: 'test',
          ts: new Date()
        }
        const result = isChargedEventStructureValid(input, this.logger)
        expect(result).toBeTruthy()
        expect(input.ts).toBe('supported_date_format')
      })
    })

    describe('"Charged ID" key', () => {
      test('should save "Charged ID" to LS or cookie', () => {
        const input = {
          name: 'test',
          [CHARGED_ID]: 'abc'
        }

        const result = isChargedEventStructureValid(input, this.logger)
        expect(result).toBeTruthy()
        expect(StorageManager.saveToLSorCookie).toHaveBeenCalledWith(CHARGEDID_COOKIE_NAME, 'abc')
      })

      test('should log error and return false when saving 2 charged objects with same Charged ID', () => {
        const input1 = {
          name: 'test1',
          [CHARGED_ID]: '123'
        }
        const result1 = isChargedEventStructureValid(input1, this.logger)
        expect(result1).toBeTruthy()

        const input2 = {
          name: 'test2',
          [CHARGED_ID]: 123
        }
        const result2 = isChargedEventStructureValid(input2, this.logger)
        expect(result2).toBeFalsy()
        expect(this.logger.error).toHaveBeenCalled()
      })
    })
  })
})
