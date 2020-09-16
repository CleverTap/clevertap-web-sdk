import {
  StorageManager
} from '../../../src/util/storage'

test('Localstorage support', () => {
  expect(StorageManager._isLocalStorageSupported()).toBe(true)
})

test('Storage function works', () => {
  let opt = null
  StorageManager.save('wz', 123)
  opt = StorageManager.read('wz')
  expect(opt).toBe(123)
})

test('Storage Remove works', () => {
  let opt
  StorageManager.save('wz', 123)
  StorageManager.remove('wz', 123)
  opt = StorageManager.read('wz')
  expect(opt).toBeNull()
})

test('Storage write with no key fails gracefully', () => {
  let opt = StorageManager.save(undefined)
  expect(opt).toBeFalsy()
})

test('Storage read with no key fails gracefully', () => {
  let opt = StorageManager.read(undefined)
  expect(opt).toBeFalsy()
})

test('Storage remove with no key fails gracefully', () => {
  let opt = StorageManager.remove(undefined)
  expect(opt).toBeFalsy()
})