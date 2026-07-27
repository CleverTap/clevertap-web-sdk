import {
  addToURL,
  getDomain,
  getHostName,
  getURLParams,
  getURLParam
} from '../../../src/util/url'

describe('util/url', function () {
  describe('get url params', () => {
    test('should return empty object when url has no query params', () => {
      const url = 'www.example.com/test'
      const urlParams = getURLParams(url)
      expect(urlParams).toMatchObject({})
    })

    test('should return urlParams as key value', () => {
      const url = 'www.example.com/test?foo=abc&bar=test+user'
      const urlParams = getURLParams(url)
      const expectedObject = {
        foo: 'abc',
        bar: 'test user'
      }
      expect(urlParams).toMatchObject(expectedObject)
    })
  })

  describe('get url param', () => {
    test('should return empty string when url is empty string', () => {
      const param = getURLParam('', 'foo')
      expect(param).toBe('')
    })

    test.each([['foo', 'abc'], ['bar', 'test user']])('should return urlParam for given param name', (param, expectedValue) => {
      const url = 'www.example.com/test?foo=abc&bar=test+user'
      const value = getURLParam(url, param)
      expect(value).toBe(expectedValue)
    })
  })

  describe('get domain', () => {
    test('should return empty string when url is empty string', () => {
      const domain = getDomain('')
      expect(domain).toBe('')
    })

    test('should return doamin for given url', () => {
      const domain = getDomain('www.example.com/test/path')
      expect(domain).toBe('www.example.com')
    })
  })

  test('should add given key value pair as query params to url', () => {
    const url = getHostName() + '/?test=test'
    const newUrl = addToURL(url, 'foo', 'abc')
    expect(newUrl).toBe(`${url}&foo=abc`)
  })
})
