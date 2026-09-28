import Account from '../../../src/modules/account'

describe('modules/account', function () {
  describe('constructor', () => {
    let account
    test('should initialise accountId to undefined when constructor is empty', () => {
      account = new Account()
      expect(account.id).toBeUndefined()
    })

    test('should initilase accountId with custom region and default target', () => {
      account = new Account({ id: '123' }, 'test')
      expect(account.id).toBe('123')
      expect(account.dataPostURL).toBe('https://test.clevertap-prod.com/a?t=96')
      expect(account.recorderURL).toBe('https://test.clevertap-prod.com/r?r=1')
      expect(account.emailURL).toBe('https://test.clevertap-prod.com/e?r=1')
    })

    test('should initalise accountId with custom target', () => {
      account = new Account({ id: '123' }, '', 'example.com')
      expect(account.id).toBe('123')
      expect(account.dataPostURL).toBe('https://example.com/a?t=96')
      expect(account.recorderURL).toBe('https://example.com/r?r=1')
      expect(account.emailURL).toBe('https://example.com/e?r=1')
    })
  })
})
