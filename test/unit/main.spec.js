import main from '../../src/main'
import CleverTap from '../../src/clevertap'

test('Main exports CleverTap instance', () => {
  expect(main).toBeInstanceOf(CleverTap)
})
