import {
  isString,
  isObject,
  isDateObject,
  isObjectEmpty,
  isConvertibleToNumber,
  isNumber,
  isValueValid,
  arrayContains,
  removeUnsupportedChars
} from '../../../src/util/datatypes'

// generated using lorem ipsum generator
const string1500Chars = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer neque nisi, tincidunt sed ex sed, congue consequat lectus. Donec ut ligula justo. Aliquam suscipit lacinia pulvinar. Morbi consequat in mi vitae porttitor. Vivamus gravida porttitor risus, eu accumsan nibh dictum eget. Morbi augue sem, tincidunt et nulla ut, condimentum varius tellus. Vivamus at odio eget risus condimentum viverra. Curabitur vitae faucibus lacus, at congue justo. Proin pellentesque nulla dignissim ligula faucibus, non feugiat diam feugiat. Nam ut dictum purus. Integer tempor purus tellus, eget aliquet ligula ornare a. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus sodales, leo ac interdum tincidunt, ante sem luctus turpis, sit amet pharetra tellus massa et nibh. Morbi pretium eros mattis dictum blandit. Maecenas luctus ligula eget odio gravida sagittis. Cras ac tellus et risus eleifend commodo. Aliquam luctus, leo id pretium auctor, odio nulla tincidunt magna, faucibus malesuada ante sem sed odio. Nulla convallis faucibus elementum. Donec non pretium ex. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc et finibus ante. Phasellus efficitur tortor ipsum, et luctus diam ullamcorper sed. Vivamus nec urna tempor, pulvinar tortor eu, imperdiet libero. In nisl purus, dapibus eu sapien vitae, fermentum tincidunt nisi. Donec a nulla pretium, hendrerit sapien nec, porta sem. Nam dictum urna in magna viverra tristique. Suspendisse biam.'
const unsupportedValueString = '   \'String\' with "unsupported" characters\\  '
const unsupportedKeyString = '   \'$tring\' with "un.supported" char:acters\\  '

describe('util/datatypes', function () {
  test('isString', () => {
    const a = 'random string'
    // eslint-disable-next-line no-new-wrappers
    const b = new String('a')
    const c = 2
    const d = ''
    const e = null
    const f = undefined
    const g = {}
    const h = []
    expect(isString(a)).toBeTruthy()
    expect(isString(b)).toBeTruthy()
    expect(isString(c)).toBeFalsy()
    expect(isString(d)).toBeTruthy()
    expect(isString(e)).toBeFalsy()
    expect(isString(f)).toBeFalsy()
    expect(isString(g)).toBeFalsy()
    expect(isString(h)).toBeFalsy()
  })

  test('isObject', () => {
    const a = 'random string'
    // eslint-disable-next-line no-new-wrappers
    const b = new String('a')
    const c = 2
    const d = ''
    const e = null
    const f = undefined
    const g = {}
    const h = []
    expect(isObject(a)).toBeFalsy()
    expect(isObject(b)).toBeFalsy()
    expect(isObject(c)).toBeFalsy()
    expect(isObject(d)).toBeFalsy()
    expect(isObject(e)).toBeFalsy()
    expect(isObject(f)).toBeFalsy()
    expect(isObject(g)).toBeTruthy()
    expect(isObject(h)).toBeFalsy()
  })

  test('isDateObject', () => {
    const a = 'Fri Nov 27 2020 20:53:35 GMT+0530 (India Standard Time)'
    const b = new Date()
    const c = 1606490667239
    const d = {}
    const e = []
    expect(isDateObject(a)).toBeFalsy()
    expect(isDateObject(b)).toBeTruthy()
    expect(isDateObject(c)).toBeFalsy()
    expect(isDateObject(d)).toBeFalsy()
    expect(isDateObject(e)).toBeFalsy()
  })

  test('isObjectEmpty', () => {
    const a = null
    const b = {}
    const c = {
      foo: 'bar'
    }
    const d = ['1']
    const e = undefined
    function F () {
      return this
    }
    F.prototype.foo = 'bar'
    const f = new F()
    expect(isObjectEmpty(a)).toBeTruthy()
    expect(isObjectEmpty(b)).toBeTruthy()
    expect(isObjectEmpty(c)).toBeFalsy()
    expect(isObjectEmpty(d)).toBeFalsy()
    expect(isObjectEmpty(e)).toBeTruthy()
    expect(isObjectEmpty(f)).toBeTruthy()
  })

  test('isConvertibleToNumber', () => {
    const a = null
    const b = ''
    const c = 'abc'
    const d = '123'
    const e = 123
    const f = '123.456'
    const g = 123.456
    const h = {}
    const i = -123
    const j = '-123'
    expect(isConvertibleToNumber(a)).toBeFalsy()
    expect(isConvertibleToNumber(b)).toBeFalsy()
    expect(isConvertibleToNumber(c)).toBeFalsy()
    expect(isConvertibleToNumber(d)).toBeTruthy()
    expect(isConvertibleToNumber(e)).toBeTruthy()
    expect(isConvertibleToNumber(f)).toBeTruthy()
    expect(isConvertibleToNumber(g)).toBeTruthy()
    expect(isConvertibleToNumber(h)).toBeFalsy()
    expect(isConvertibleToNumber(i)).toBeTruthy()
    expect(isConvertibleToNumber(j)).toBeTruthy()
  })

  test('isNumber', () => {
    const a = 123
    const b = -123.456
    const c = '123'
    const d = '-123.456'
    const e = 'abc'
    expect(isNumber(a)).toBeTruthy()
    expect(isNumber(b)).toBeTruthy()
    expect(isNumber(c)).toBeFalsy()
    expect(isNumber(d)).toBeFalsy()
    expect(isNumber(e)).toBeFalsy()
  })

  test('isValueValid', () => {
    const a = null
    const b = undefined
    const c = 'undefined'
    const d = ''
    const e = {}
    expect(isValueValid(a)).toBeFalsy()
    expect(isValueValid(b)).toBeFalsy()
    expect(isValueValid(c)).toBeFalsy()
    expect(isValueValid(d)).toBeTruthy()
    expect(isValueValid(e)).toBeTruthy()
  })

  test('arrayContains', () => {
    const arr1 = []
    const arr2 = ['1', '2', '3']
    const arr3 = ['a', 'b', 'c']
    expect(arrayContains(arr1, 'a')).toBeFalsy()
    expect(arrayContains(arr2, 'a')).toBeFalsy()
    expect(arrayContains(arr3, 'a')).toBeTruthy()
  })

  describe('removeUnsupportedChars', () => {
    beforeEach(() => {
      this.logger = {
        reportError: jest.fn()
      }
    })

    test('should return value without changing when input is number', () => {
      const result = removeUnsupportedChars(1234, this.logger)
      expect(result).toBe(result)
    })

    test('should remove unsupported characters when input is string', () => {
      const input = unsupportedValueString
      const result = removeUnsupportedChars(input, this.logger)
      expect(result).toBe('String with unsupported characters')
    })

    test('should trim string greater than 1024 characters and log the error', () => {
      const input = string1500Chars
      const result = removeUnsupportedChars(input, this.logger)
      expect(this.logger.reportError).toHaveBeenCalledWith(521, expect.any(String))
      expect(result.length).toBe(1024)
    })

    test('should remove unsupported characters from key and value and trim to 1024 when input is object', () => {
      const input = {
        123: unsupportedValueString,
        [unsupportedKeyString]: 'fooBar',
        [string1500Chars]: string1500Chars
      }
      const result = removeUnsupportedChars(input, this.logger)
      expect(this.logger.reportError).toHaveBeenCalledWith(521, expect.any(String))
      expect(this.logger.reportError).toHaveBeenCalledWith(520, expect.any(String))
      expect(result[123]).toBe('String with unsupported characters')
      let keyForFooBar
      for (const key in result) {
        if (result[key] === 'fooBar') {
          keyForFooBar = key
          break
        }
      }
      expect(keyForFooBar).toBe('tring with unsupported characters')
    })
  })
})
