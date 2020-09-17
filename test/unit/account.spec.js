import { account } from '../../src/account'

test('Account has ID', () => {
  account.accountID = 'WWW'
  expect(account.accountID).toBe('WWW')
})

test('Account ID cannot be overwritten once set', () => {
  account.accountID = 'WWW'
  account.accountID = 'WWW2'
  expect(account.accountID).toBe('WWW')
})

test('Account has appVersion', () => {
  account.appVersion = '1.0'
  expect(account.appVersion).toBe('1.0')
})

test('Account has region', () => {
  account.region = 'eu'
  expect(account.region).toBe('eu')
})
