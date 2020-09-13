import {
  isLocalStorageSupported
} from '../../../src/util/storage'
import StorageManager from '../../../src/util/storage'

test('Localstorage support', () => {
  const account = isLocalStorageSupported()
  expect(account).toBe(true)
})
