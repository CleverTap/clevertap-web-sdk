import {
  isString
} from '../../../src/util/datatypes'

test('Detects String', () => {
  const a = 'random string'
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
