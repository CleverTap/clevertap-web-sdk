import {
  addToLocalProfileMap,
  getCampaignObject,
  getCampaignObjForLc,
  isProfileValid,
  processFBUserObj,
  processGPlusUserObj,
  saveCampaignObject
} from '../../../src/util/clevertap'
import { CAMP_COOKIE_NAME, PR_COOKIE } from '../../../src/util/constants'
import { convertToWZRKDate, setDate } from '../../../src/util/datetime'
import {
  AGE_ERROR,
  DOB_ERROR,
  EDUCATION_ERROR,
  EMPLOYED_ERROR,
  GENDER_ERROR,
  MARRIED_ERROR,
  PHONE_FORMAT_ERROR
} from '../../../src/util/messages'
import { $ct, StorageManager } from '../../../src/util/storage'

jest.enableAutomock().unmock('../../../src/util/clevertap').unmock('../../../src/util/constants')
  .unmock('../../../src/util/datatypes').unmock('../../../src/util/messages')

describe('util/clevertap', function () {
  describe('save campaign object', () => {
    beforeEach(() => {
      this.input = {
        foo: 'bar'
      }
    })
    test('should do nothing if localStorage is not supported', () => {
      StorageManager._isLocalStorageSupported.mockReturnValue(false)
      saveCampaignObject(this.input)
      expect(StorageManager.save).not.toHaveBeenCalled()
    })

    test('should save to localStorage when localStorage is supported', () => {
      StorageManager._isLocalStorageSupported.mockReturnValue(true)
      saveCampaignObject(this.input)
      expect(StorageManager.save).toHaveBeenCalledWith(CAMP_COOKIE_NAME, encodeURIComponent(JSON.stringify(this.input)))
    })
  })

  describe('get campaign object', () => {
    test('should return empty object if localStorage is not supported', () => {
      StorageManager._isLocalStorageSupported.mockReturnValue(false)
      const result = getCampaignObject()
      expect(result).toMatchObject({})
    })

    test('should return empty object if campaign object is not stored in localStorage', () => {
      StorageManager._isLocalStorageSupported.mockReturnValue(true)
      StorageManager.read.mockReturnValue(null)
      const result = getCampaignObject()
      expect(result).toMatchObject({})
    })

    test('should return campaing object stored in local storage', () => {
      const campObject = {
        camp: 'test'
      }
      StorageManager._isLocalStorageSupported.mockReturnValue(true)
      StorageManager.read.mockReturnValue(encodeURIComponent(JSON.stringify(campObject)))
      const result = getCampaignObject()
      expect(result).toMatchObject(campObject)
    })
  })

  describe('get campaign object for LC', () => {
    test('should return undefined if localStorage is not supported', () => {
      StorageManager._isLocalStorageSupported.mockReturnValue(false)
      const result = getCampaignObjForLc()
      expect(result).toBeUndefined()
    })

    test('should return object with empty values when campaign object is not saved to local storage', () => {
      StorageManager._isLocalStorageSupported.mockReturnValue(true)
      StorageManager.read.mockReturnValue(null)
      const result = getCampaignObjForLc()
      const expectedObj = {
        wmp: 0,
        tlc: []
      }
      expect(result).toMatchObject(expectedObj)
    })

    // TODO : Add test casse for setCampaignObjectForGuid

    // test('should return campaign object when value is present in localStorage', () => {
    //   const campObject = {
    //     global: {
    //       tc: 10,
    //       id1: 1,
    //       id2: 2,
    //       id3: 3
    //     },
    //     today: {
    //       tc: 5,
    //       id2: 1
    //     }
    //   }
    //   StorageManager._isLocalStorageSupported.mockReturnValue(true)
    //   StorageManager.read.mockReturnValue(encodeURIComponent(JSON.stringify(campObject)))
    //   getToday.mockReturnValue('today')
    //   const result = getCampaignObjForLc()
    //   const expectedObj = {
    //     wmp: 5,
    //     tlc: [
    //       ['id1', 0, 1],
    //       ['id2', 1, 2],
    //       ['id3', 0, 3]
    //     ]
    //   }
    //   console.log('result', result)
    //   console.log('expectedObj ', expectedObj)
    //   expect(result).toMatchObject(expectedObj)
    // })
  })

  describe('is profile valid', () => {
    beforeEach(() => {
      this.logger = {
        error: jest.fn()
      }

      convertToWZRKDate.mockReturnValue('converted_date')
    })

    test('should return false if profile is not an object', () => {
      const result = isProfileValid('some', { logger: this.logger })
      expect(result).toBeFalsy()
    })

    test('should delete null values from profileObj', () => {
      const input = {
        name: 'fooBar',
        key1: null
      }
      isProfileValid(input, { logger: this.logger })
      expect(input).toMatchObject({ name: 'fooBar' })
    })

    test('should delete Gender key and log error if value is not "M","F","O","U","male","female","others","unknown"', () => {
      const input = {
        name: 'fooBar',
        Gender: 'hello'
      }

      isProfileValid(input, { logger: this.logger })
      expect(input).toMatchObject({ name: 'fooBar' })
      expect(this.logger.error).toHaveBeenCalledWith(GENDER_ERROR)
    })

    test('should delete Employed key and log error if value is not "Y" or "N"', () => {
      const input = {
        name: 'fooBar',
        Employed: 'yes'
      }

      isProfileValid(input, { logger: this.logger })
      expect(input).toMatchObject({ name: 'fooBar' })
      expect(this.logger.error).toHaveBeenCalledWith(EMPLOYED_ERROR)
    })

    test('should delete Married key and log error if value is not "Y" or "N"', () => {
      const input = {
        name: 'fooBar',
        Married: 'yes'
      }

      isProfileValid(input, { logger: this.logger })
      expect(input).toMatchObject({ name: 'fooBar' })
      expect(this.logger.error).toHaveBeenCalledWith(MARRIED_ERROR)
    })

    test('should delete Education key and log error if value is not "School", "College" or "Graduate"', () => {
      const input = {
        name: 'fooBar',
        Education: 'MBA'
      }

      isProfileValid(input, { logger: this.logger })
      expect(input).toMatchObject({ name: 'fooBar' })
      expect(this.logger.error).toHaveBeenCalledWith(EDUCATION_ERROR)
    })

    test('should delete Age key and log error if value is not convertible to number', () => {
      const input = {
        name: 'fooBar',
        Age: 'twenty'
      }

      isProfileValid(input, { logger: this.logger })
      expect(input).toMatchObject({ name: 'fooBar' })
      expect(this.logger.error).toHaveBeenCalledWith(AGE_ERROR)
    })

    test('should delete DOB key and log error if value is not JS Date object or clevertap date format', () => {
      const input = {
        name: 'fooBar',
        DOB: '01-01-2020'
      }

      isProfileValid(input, { logger: this.logger })
      expect(input).toMatchObject({ name: 'fooBar' })
      expect(this.logger.error).toHaveBeenCalledWith(DOB_ERROR)
    })

    test('should delete Phone key and log error if value does not start with "+"', () => {
      const input = {
        name: 'fooBar',
        Phone: '1234567890'
      }

      isProfileValid(input, { logger: this.logger })
      expect(input).toMatchObject({ name: 'fooBar' })
      expect(this.logger.error).toHaveBeenCalledWith(PHONE_FORMAT_ERROR + '. Removed.')
    })

    test('should delete Phone key and log error if value is not convertible to number', () => {
      const input = {
        name: 'fooBar',
        Phone: '+oneTwoThree'
      }

      isProfileValid(input, { logger: this.logger })
      expect(input).toMatchObject({ name: 'fooBar' })
      expect(this.logger.error).toHaveBeenCalledWith(PHONE_FORMAT_ERROR + '. Removed.')
    })

    test('should return true if all values are valid and convert date to clevertap format', () => {
      const input = {
        name: 'fooBar',
        Gender: 'M',
        Employed: 'N',
        Married: 'N',
        Education: 'School',
        Age: '20',
        DOB: new Date('2020-01-01T00:00:00.000Z'),
        Phone: '+1234567890',
        PurchaseDate: new Date('2020-01-01T00:00:00.000Z')
      }

      const expectedObject = {
        name: 'fooBar',
        Gender: 'M',
        Employed: 'N',
        Married: 'N',
        Education: 'School',
        Age: 20,
        DOB: 'converted_date',
        Phone: 1234567890,
        PurchaseDate: 'converted_date'
      }

      const result = isProfileValid(input, { logger: this.logger })
      expect(result).toBeTruthy()
      expect(input).toMatchObject(expectedObject)
    })
  })

  describe('process FB user', () => {
    beforeEach(() => {
      setDate.mockImplementation(date => date)
    })

    test('should add "Name" to profile data', () => {
      const input = {
        name: 'user'
      }
      const result = processFBUserObj(input)
      expect(result).toMatchObject({ Name: 'user' })
    })

    test('should add FBID if user id exists', () => {
      const input = {
        name: 'user',
        id: 123
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        FBID: '123'
      })
    })

    test('should add Gender as "M" when user gender value is "male"', () => {
      const input = {
        name: 'user',
        gender: 'male'
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        Gender: 'M'
      })
    })

    test('should add Gender as "F" when user gender value is "female"', () => {
      const input = {
        name: 'user',
        gender: 'female'
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        Gender: 'F'
      })
    })

    test('should add Married as "N" when `relationship_status` is not Married', () => {
      const input = {
        name: 'user',
        relationship_status: 'Single'
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        Married: 'N'
      })
    })

    test('should add Married as "Y" when `relationship_status` is Married', () => {
      const input = {
        name: 'user',
        relationship_status: 'Married'
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        Married: 'Y'
      })
    })

    test('should set Education as "Graduate" if user has max education type set to "Graduate School"', () => {
      const input = {
        name: 'user',
        education: [
          { type: 'High School' },
          { type: 'College' },
          { type: 'Graduate School' }
        ]
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        Education: 'Graduate'
      })
    })

    test('should set Education as "College" if user has max education type set to "College"', () => {
      const input = {
        name: 'user',
        education: [
          { type: 'High School' },
          { type: 'College' },
          { type: null }
        ]
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        Education: 'College'
      })
    })

    test('should set Education as "School" if user has max education type set to "High School"', () => {
      const input = {
        name: 'user',
        education: [
          { type: 'High School' },
          { type: 'Junior School' }
        ]
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        Education: 'School'
      })
    })

    test('should add Employed as "Y" if user has work array added', () => {
      const input = {
        name: 'user',
        work: [
          { name: 'CleverTap' }
        ]
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        Employed: 'Y'
      })
    })

    test('should add Email if user has email value', () => {
      const input = {
        name: 'user',
        email: 'user@example.com'
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        Email: 'user@example.com'
      })
    })

    test('should set DOB if user has birthday added', () => {
      const input = {
        name: 'user',
        birthday: '01/01/2020'
      }

      const result = processFBUserObj(input)
      expect(result).toMatchObject({
        Name: 'user',
        DOB: '20200101'
      })
    })
  })

  describe('process GPlus usrs', () => {
    beforeEach(() => {
      this.mockLogger = {
        logger: {
          debug: jest.fn()
        }
      }

      setDate.mockImplementation(date => date)
    })

    test('should return empty object when user is empty', () => {
      const input = {}
      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({})
    })

    test('should add Name when user has displayName', () => {
      const input = {
        displayName: 'user'
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Name: 'user'
      })
    })

    test('should add GPID when user id is present', () => {
      const input = {
        id: '123'
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        GPID: '123'
      })
    })

    test('should add Gender as "M" when user has gender == "male"', () => {
      const input = {
        gender: 'male'
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Gender: 'M'
      })
    })

    test('should add Gender as "F" when user has gender == "female"', () => {
      const input = {
        gender: 'female'
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Gender: 'F'
      })
    })

    test('should add Gender as "O" when user has gender == "other"', () => {
      const input = {
        gender: 'other'
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Gender: 'O'
      })
    })

    test('should add Photo when user has image', () => {
      const input = {
        image: {
          isDefault: false,
          url: 'http://image/url?sz=200'
        }
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Photo: 'http://image/url'
      })
    })

    test('should add Eamil when user has email for type account', () => {
      const input = {
        emails: [
          {
            type: 'account',
            value: 'user@example.com'
          },
          {
            type: 'guest',
            value: 'guest@example.com'
          }
        ]
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Email: 'user@example.com'
      })
    })

    test('should add Employed as "N" when organizations array is empty', () => {
      const input = {
        organizations: []
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Employed: 'N'
      })
    })

    test('should add Employed as "Y" when organizations array has type work', () => {
      const input = {
        organizations: [
          { type: 'work' }
        ]
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Employed: 'Y'
      })
    })

    test('should set DOB when birthday is present', () => {
      const input = {
        birthday: '2020-01-01'
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        DOB: '20200101'
      })
    })

    test('should add Married as "N" when relationshipStatus is not married', () => {
      const input = {
        relationshipStatus: 'single'
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Married: 'N'
      })
    })

    test('should add Married as "Y" when relationshipStatus is married', () => {
      const input = {
        relationshipStatus: 'married'
      }

      const result = processGPlusUserObj(input, this.mockLogger)
      expect(result).toMatchObject({
        Married: 'Y'
      })
    })
  })

  describe('add to local profile map', () => {
    test('should do nothing when localStorage is not supported', () => {
      StorageManager._isLocalStorageSupported.mockReturnValue(false)
      const profileObj = {}
      addToLocalProfileMap(profileObj, false)
      expect(StorageManager.saveToLSorCookie).not.toHaveBeenCalled()
    })

    describe('supports localStorage', () => {
      beforeEach(() => {
        StorageManager._isLocalStorageSupported.mockReturnValue(true)
        $ct.globalProfileMap = null
      })

      test('should add profileObject to globalProfileMap and save to LS or cookie', () => {
        const profileObject = {
          id1: 'value 1',
          id2: 'value 2'
        }
        StorageManager.readFromLSorCookie.mockReturnValue(null)

        addToLocalProfileMap(profileObject, false)
        expect($ct.globalProfileMap).toMatchObject(profileObject)
        expect(StorageManager.saveToLSorCookie).toHaveBeenCalledWith(PR_COOKIE, expect.objectContaining(profileObject))
      })

      test('should not override existing values in map when override flag is false', () => {
        const lsProfileMap = {
          id1: 'value 1',
          id2: 'value 2',
          id3: 'value 3'
        }
        const profileObj = {
          id1: 'updated value 1',
          id4: 'value 4',
          _custom: {
            id2: 'updated value 2',
            id5: 'value 5'
          }
        }

        StorageManager.readFromLSorCookie.mockReturnValue(lsProfileMap)
        addToLocalProfileMap(profileObj, false)

        const expectedObj = {
          id1: 'value 1',
          id2: 'value 2',
          id3: 'value 3',
          id4: 'value 4',
          id5: 'value 5'
        }
        expect($ct.globalProfileMap).toMatchObject(expectedObj)
        expect(StorageManager.saveToLSorCookie).toHaveBeenCalledWith(PR_COOKIE, expect.objectContaining(expectedObj))
      })

      test('should override existing values in map when override flag is true', () => {
        $ct.globalProfileMap = {
          id1: 'value 1',
          id2: 'value 2',
          id3: 'value 3',
          _custom: {
            foo: 'bar'
          }
        }
        const profileObj = {
          id1: 'updated value 1',
          id4: 'value 4',
          _custom: {
            id2: 'updated value 2',
            id5: 'value 5'
          }
        }

        addToLocalProfileMap(profileObj, true)

        const expectedObj = {
          id1: 'updated value 1',
          id2: 'updated value 2',
          id3: 'value 3',
          id4: 'value 4',
          id5: 'value 5'
        }
        expect($ct.globalProfileMap).toMatchObject(expectedObj)
        expect(StorageManager.saveToLSorCookie).toHaveBeenCalledWith(PR_COOKIE, expect.objectContaining(expectedObj))
      })
    })
  })
})
