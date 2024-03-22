import 'regenerator-runtime/runtime.js'
import main from '../../src/main'
import CleverTap from '../../src/clevertap'

describe('main.js', function () {
  test('Main exports CleverTap instance', () => {
    expect(main).toBeInstanceOf(CleverTap)
  })
})
