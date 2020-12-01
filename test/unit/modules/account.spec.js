import Account from '../../../src/modules/account'

describe('modules/account', function () {
  describe('constructor', () => {
    test('should initialise accountId to undefined when constructor is empty', () => {
      this.account = new Account()
      expect(this.account.id).toBeUndefined()
    })

    test('should initilase accountId with custom region and default target', () => {
      this.account = new Account({ id: '123' }, 'test')
      expect(this.account.id).toBe('123')
      expect(this.account.dataPostURL).toBe('https://test.wzrkt.com/a?t=96')
      expect(this.account.recorderURL).toBe('https://test.wzrkt.com/r?r=1')
      expect(this.account.emailURL).toBe('https://test.wzrkt.com/e?r=1')
    })

    test('should initalise accountId with default region and custom target', () => {
      this.account = new Account({ id: '123' }, '', 'example.com')
      expect(this.account.id).toBe('123')
      expect(this.account.dataPostURL).toBe('https://example.com/a?t=96')
      expect(this.account.recorderURL).toBe('https://example.com/r?r=1')
      expect(this.account.emailURL).toBe('https://example.com/e?r=1')
    })
  })
})
