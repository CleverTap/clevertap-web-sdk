import Account from '../../src/account'

test('Account has ID', () => {
  const account = new Account()
  account.accountID = 'WWW'
  expect(account.accountID).toBe('WWW')
})

test('Account ID cannot be overwritten once set', () => {
  const account = new Account()
  account.accountID = 'WWW'
  account.accountID = 'WWW2'
  expect(account.accountID).toBe('WWW')
})

test('Account has appVersion', () => {
  const account = new Account()
  account.appVersion = '1.0'
  expect(account.appVersion).toBe('1.0')
})

test('Account has region', () => {
  const account = new Account()
  account.region = 'eu'
  expect(account.region).toBe('eu')
})
