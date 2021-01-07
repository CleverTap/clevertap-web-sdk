import {
  convertToWZRKDate,
  getNow,
  getToday,
  setDate
} from '../../../src/util/datetime'

describe('util/datetime', function () {
  test('getToday', () => {
    jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'))
    const result = getToday()
    const expectedDate = new Date()
    expect(result).toBe(`${expectedDate.getFullYear()}${expectedDate.getMonth()}${expectedDate.getDay()}`)
  })

  test('getNow', () => {
    jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'))
    const result = getNow()
    const expectedTs = 1577836800
    expect(result).toBe(expectedTs)
  })

  test('convertToWZRKDate', () => {
    const result = convertToWZRKDate(new Date('2020-01-01T00:00:00.000Z'))
    const expectedTs = 1577836800
    expect(result).toBe(`$D_${expectedTs}`)
  })

  describe('setDate', () => {
    test('should return undefined when random string is provided', () => {
      const result = setDate('fooBar')
      expect(result).toBeUndefined()
    })

    test('should return undefined when date is in yyyyddmm format', () => {
      const result = setDate('20203101')
      expect(result).toBeUndefined()
    })

    test('should return set date', () => {
      const result = setDate('20200131')
      expect(result).toBe('$D_20200131')
    })
  })
})
