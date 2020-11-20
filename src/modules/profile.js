import {
  isObject,
  isDateObject,
  isConvertibleToNumber,
  isObjectEmpty
} from '../util/datatypes'
import {
  setDate,
  convertToWZRKDate
} from '../util/datetime'
import {
  GENDER_ERROR,
  EMPLOYED_ERROR,
  MARRIED_ERROR,
  EDUCATION_ERROR,
  AGE_ERROR,
  DOB_ERROR,
  PHONE_FORMAT_ERROR
} from '../util/messages'
import {
  PR_COOKIE,
  EVT_PUSH
} from '../util/constants'
import {
  addToURL
} from '../util/url'
import {
  StorageManager,
  $ct
} from '../util/storage'
import { compressData } from '../util/encoder'
export default class ProfileHandler extends Array {
  #logger
  #request
  #account
  #oldValues

  constructor ({ logger, request, account }, values) {
    super()
    this.#logger = logger
    this.#request = request
    this.#account = account
    this.#oldValues = values
  }

  push (...profilesArr) {
    this.#processProfileArray(profilesArr)
    return 0
  }

  isProfileValid (profileObj) {
    let valid = false
    if (isObject(profileObj)) {
      for (const profileKey in profileObj) {
        if (profileObj.hasOwnProperty(profileKey)) {
          valid = true
          let profileVal = profileObj[profileKey]

          if (profileVal == null) {
            delete profileObj[profileKey]
            continue
          }
          if (profileKey === 'Gender' && !profileVal.match(/^M$|^F$/)) {
            valid = false
            this.#logger.error(GENDER_ERROR)
          }

          if (profileKey === 'Employed' && !profileVal.match(/^Y$|^N$/)) {
            valid = false
            this.#logger.error(EMPLOYED_ERROR)
          }

          if (profileKey === 'Married' && !profileVal.match(/^Y$|^N$/)) {
            valid = false
            this.#logger.error(MARRIED_ERROR)
          }

          if (profileKey === 'Education' && !profileVal.match(/^School$|^College$|^Graduate$/)) {
            valid = false
            this.#logger.error(EDUCATION_ERROR)
          }

          if (profileKey === 'Age' && profileVal != null) {
            if (isConvertibleToNumber(profileVal)) {
              profileObj.Age = +profileVal
            } else {
              valid = false
              this.#logger.error(AGE_ERROR)
            }
          }
          // dob will come in like this - $dt_19470815 or dateObject
          if (profileKey === 'DOB') {
            if (((!(/^\$D_/).test(profileVal) || (profileVal + '').length !== 11)) && !isDateObject(profileVal)) {
              valid = false
              this.#logger.error(DOB_ERROR)
            }

            if (isDateObject(profileVal)) {
              profileObj[profileKey] = convertToWZRKDate(profileVal)
            }
          } else if (isDateObject(profileVal)) {
            profileObj[profileKey] = convertToWZRKDate(profileVal)
          }

          if (profileKey === 'Phone' && !isObjectEmpty(profileVal)) {
            if (profileVal.length > 8 && (profileVal.charAt(0) === '+')) { // valid phone number
              profileVal = profileVal.substring(1, profileVal.length)
              if (isConvertibleToNumber(profileVal)) {
                profileObj.Phone = +profileVal
              } else {
                valid = false
                this.#logger.error(PHONE_FORMAT_ERROR + '. Removed.')
              }
            } else {
              valid = false
              this.#logger.error(PHONE_FORMAT_ERROR + '. Removed.')
            }
          }

          if (!valid) {
            delete profileObj[profileKey]
          }
        }
      }
    }
    return valid
  }

  processFBUserObj (user) {
    const profileData = {}
    profileData.Name = user.name
    if (user.id != null) {
      profileData.FBID = user.id + ''
    }
    // Feb 2014 - FB announced over 58 gender options, hence we specifically look for male or female. Rest we don't care.
    if (user.gender === 'male') {
      profileData.Gender = 'M'
    } else if (user.gender === 'female') {
      profileData.Gender = 'F'
    } else {
      profileData.Gender = 'O'
    }

    const getHighestEducation = function (eduArr) {
      if (eduArr != null) {
        let college = ''
        let highschool = ''

        for (let i = 0; i < eduArr.length; i++) {
          const edu = eduArr[i]
          if (edu.type != null) {
            const type = edu.type
            if (type === 'Graduate School') {
              return 'Graduate'
            } else if (type === 'College') {
              college = '1'
            } else if (type === 'High School') {
              highschool = '1'
            }
          }
        }

        if (college === '1') {
          return 'College'
        } else if (highschool === '1') {
          return 'School'
        }
      }
    }

    if (user.relationship_status != null) {
      profileData.Married = 'N'
      if (user.relationship_status === 'Married') {
        profileData.Married = 'Y'
      }
    }

    const edu = getHighestEducation(user.education)
    if (edu != null) {
      profileData.Education = edu
    }

    const work = (user.work != null) ? user.work.length : 0
    if (work > 0) {
      profileData.Employed = 'Y'
    } else {
      profileData.Employed = 'N'
    }

    if (user.email != null) {
      profileData.Email = user.email
    }

    if (user.birthday != null) {
      const mmddyy = user.birthday.split('/') // comes in as "08/15/1947"
      profileData.DOB = setDate(mmddyy[2] + mmddyy[0] + mmddyy[1])
    }
    return profileData
  }

  processGPlusUserObj (user) {
    const profileData = {}
    if (user.displayName != null) {
      profileData.Name = user.displayName
    }
    if (user.id != null) {
      profileData.GPID = user.id + ''
    }

    if (user.gender != null) {
      if (user.gender === 'male') {
        profileData.Gender = 'M'
      } else if (user.gender === 'female') {
        profileData.Gender = 'F'
      } else if (user.gender === 'other') {
        profileData.Gender = 'O'
      }
    }

    if (user.image != null) {
      if (user.image.isDefault === false) {
        profileData.Photo = user.image.url.split('?sz')[0]
      }
    }

    if (user.emails != null) {
      for (let emailIdx = 0; emailIdx < user.emails.length; emailIdx++) {
        const emailObj = user.emails[emailIdx]
        if (emailObj.type === 'account') {
          profileData.Email = emailObj.value
        }
      }
    }

    if (user.organizations != null) {
      profileData.Employed = 'N'
      for (let i = 0; i < user.organizations.length; i++) {
        const orgObj = user.organizations[i]
        if (orgObj.type === 'work') {
          profileData.Employed = 'Y'
        }
      }
    }

    if (user.birthday != null) {
      const yyyymmdd = user.birthday.split('-') // comes in as "1976-07-27"
      profileData.DOB = setDate(yyyymmdd[0] + yyyymmdd[1] + yyyymmdd[2])
    }

    if (user.relationshipStatus != null) {
      profileData.Married = 'N'
      if (user.relationshipStatus === 'married') {
        profileData.Married = 'Y'
      }
    }
    this.#logger.debug('gplus usr profile ' + JSON.stringify(profileData))

    return profileData
  }

  addToLocalProfileMap (profileObj, override) {
    let globalProfileMap = $ct.globalProfileMap
    if (StorageManager._isLocalStorageSupported()) {
      if (globalProfileMap == null) {
        globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
        if (globalProfileMap == null) {
          globalProfileMap = {}
        }
      }

      // Move props from custom bucket to outside.
      if (profileObj._custom != null) {
        const keys = profileObj._custom
        for (const key in keys) {
          if (keys.hasOwnProperty(key)) {
            profileObj[key] = keys[key]
          }
        }
        delete profileObj._custom
      }

      for (const prop in profileObj) {
        if (profileObj.hasOwnProperty(prop)) {
          if (globalProfileMap.hasOwnProperty(prop) && !override) {
            continue
          }
          globalProfileMap[prop] = profileObj[prop]
        }
      }
      if (globalProfileMap._custom != null) {
        delete globalProfileMap._custom
      }
      StorageManager.saveToLSorCookie(PR_COOKIE, globalProfileMap)
    }
  }

  #processProfileArray (profileArr) {
    if (Array.isArray(profileArr) && profileArr.length > 0) {
      for (const index in profileArr) {
        if (profileArr.hasOwnProperty(index)) {
          const outerObj = profileArr[index]
          let data = {}
          let profileObj
          if (outerObj.Site != null) { // organic data from the site
            profileObj = outerObj.Site
            if (isObjectEmpty(profileObj) || !this.isProfileValid(profileObj)) {
              return
            }
          } else if (outerObj.Facebook != null) { // fb connect data
            const FbProfileObj = outerObj.Facebook
            // make sure that the object contains any data at all

            if (!isObjectEmpty(FbProfileObj) && (!FbProfileObj.error)) {
              profileObj = this.processFBUserObj(FbProfileObj)
            }
          } else if (outerObj['Google Plus'] != null) {
            const GPlusProfileObj = outerObj['Google Plus']
            if (!isObjectEmpty(GPlusProfileObj) && (!GPlusProfileObj.error)) {
              profileObj = this.processGPlusUserObj(GPlusProfileObj)
            }
          }
          if (profileObj != null && (!isObjectEmpty(profileObj))) { // profile got set from above
            data.type = 'profile'
            if (profileObj.tz == null) {
              // try to auto capture user timezone if not present
              profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]
            }

            data.profile = profileObj
            this.addToLocalProfileMap(profileObj, true)
            data = this.#request.addSystemDataToObject(data, undefined)

            this.#request.addFlags(data)
            const compressedData = compressData(JSON.stringify(data))

            let pageLoadUrl = this.#account.dataPostURL
            pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH)
            pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData)

            this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequeust)
          }
        }
      }
    }
  }
}
