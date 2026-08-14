import 'regenerator-runtime/runtime'
import main from '../../src/main'
import CleverTap from '../../src/clevertap'

describe('main.js', function () {
  test('Main exports CleverTap instance', () => {
    expect(main).toBeInstanceOf(CleverTap)
  })

  test('Main exports createInstance method', () => {
    expect(typeof main.createInstance).toBe('function')
  })

  test('Main exports CleverTap class reference', () => {
    expect(main.CleverTap).toBe(CleverTap)
  })
})
