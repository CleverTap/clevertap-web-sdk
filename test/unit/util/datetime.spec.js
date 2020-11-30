import {
  convertToWZRKDate,
  getNow,
  getToday,
  setDate
} from '../../../src/util/datetime'

describe('util/datetime', function () {
  test('getToday', () => {
    jest.setSystemTime(new Date('01-01-2020'))
    const result = getToday()
    const expectedDate = new Date()
    expect(result).toBe(`${expectedDate.getFullYear()}${expectedDate.getMonth()}${expectedDate.getDay()}`)
  })

  test('getNow', () => {
    jest.setSystemTime(new Date('01-01-2020'))
    const result = getNow()
    const expectedTs = 1577817000
    expect(result).toBe(expectedTs)
  })

  test('convertToWZRKDate', () => {
    const result = convertToWZRKDate(new Date('01-01-2020'))
    const expectedTs = 1577817000
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
