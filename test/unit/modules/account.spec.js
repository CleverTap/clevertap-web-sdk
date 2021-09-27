import Account from '../../../src/modules/account'
import { DEFAULT_REGION } from '../../../src/options'

describe('modules/account', function () {
  describe('constructor', () => {
    test('should initialise accountId to undefined when constructor is empty', () => {
      this.account = new Account()
      expect(this.account.id).toBeUndefined()
    })

    test('should initilase accountId with custom region and default target', () => {
      this.account = new Account({ id: '123' }, 'test')
      expect(this.account.id).toBe('123')
      expect(this.account.dataPostURL).toBe('https://test.clevertap-prod.com/a?t=96')
      expect(this.account.recorderURL).toBe('https://test.clevertap-prod.com/r?r=1')
      expect(this.account.emailURL).toBe('https://test.clevertap-prod.com/e?r=1')
    })

    test('should initalise accountId with default region and custom target', () => {
      this.account = new Account({ id: '123' }, '', 'example.com')
      expect(this.account.id).toBe('123')
      console.log('this.account.dataPostURL', this.account.dataPostURL)
      expect(this.account.dataPostURL).toBe(`https://${DEFAULT_REGION}.example.com/a?t=96`)
      expect(this.account.recorderURL).toBe(`https://${DEFAULT_REGION}.example.com/r?r=1`)
      expect(this.account.emailURL).toBe(`https://${DEFAULT_REGION}.example.com/e?r=1`)
    })
  })
})
