// CleverTap specific utilities

import {
  StorageManager,
  $ct
} from './storage'
import {
  CAMP_COOKIE_NAME,
  singleQuoteRegex,
  PR_COOKIE,
  ARP_COOKIE,
  IS_OUL
} from './constants'
import {
  GENDER_ERROR,
  EMPLOYED_ERROR,
  MARRIED_ERROR,
  EDUCATION_ERROR,
  AGE_ERROR,
  DOB_ERROR,
  PHONE_FORMAT_ERROR
} from './messages'
import {
  getToday,
  convertToWZRKDate,
  setDate
} from './datetime'
import {
  isObject,
  isDateObject,
  isConvertibleToNumber,
  isObjectEmpty
} from './datatypes'

export const getCampaignObject = () => {
  let campObj = {}
  if (StorageManager._isLocalStorageSupported()) {
    campObj = StorageManager.read(CAMP_COOKIE_NAME)
    if (campObj != null) {
      campObj = JSON.parse(decodeURIComponent(campObj).replace(singleQuoteRegex, '\"'))
    } else {
      campObj = {}
    }
  }
  return campObj
}

export const saveCampaignObject = (campaignObj) => {
  if (StorageManager._isLocalStorageSupported()) {
    const campObj = JSON.stringify(campaignObj)
    StorageManager.save(CAMP_COOKIE_NAME, encodeURIComponent(campObj))
  }
}

export const getCampaignObjForLc = () => {
  let campObj = {}
  if (StorageManager._isLocalStorageSupported()) {
    campObj = getCampaignObject()
    let resultObj = []
    const globalObj = campObj.global
    const today = getToday()
    const dailyObj = campObj[today]
    if (typeof globalObj !== 'undefined') {
      const campaignIdArray = Object.keys(globalObj)
      for (const index in campaignIdArray) {
        if (campaignIdArray.hasOwnProperty(index)) {
          let dailyC = 0
          let totalC = 0
          const campaignId = campaignIdArray[index]
          if (campaignId === 'tc') {
            continue
          }
          if (typeof dailyObj !== 'undefined' && typeof dailyObj[campaignId] !== 'undefined') {
            dailyC = dailyObj[campaignId]
          }
          if (typeof globalObj !== 'undefined' && typeof globalObj[campaignId] !== 'undefined') {
            totalC = globalObj[campaignId]
          }
          const element = [campaignId, dailyC, totalC]
          resultObj.push(element)
        }
      }
    }
    let todayC = 0
    if (typeof dailyObj !== 'undefined' && typeof dailyObj.tc !== 'undefined') {
      todayC = dailyObj.tc
    }
    resultObj = {
      wmp: todayC,
      tlc: resultObj
    }
    return resultObj
  }
}

export const isProfileValid = (profileObj, { logger }) => {
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
          logger.error(GENDER_ERROR)
        }

        if (profileKey === 'Employed' && !profileVal.match(/^Y$|^N$/)) {
          valid = false
          logger.error(EMPLOYED_ERROR)
        }

        if (profileKey === 'Married' && !profileVal.match(/^Y$|^N$/)) {
          valid = false
          logger.error(MARRIED_ERROR)
        }

        if (profileKey === 'Education' && !profileVal.match(/^School$|^College$|^Graduate$/)) {
          valid = false
          logger.error(EDUCATION_ERROR)
        }

        if (profileKey === 'Age' && profileVal != null) {
          if (isConvertibleToNumber(profileVal)) {
            profileObj.Age = +profileVal
          } else {
            valid = false
            logger.error(AGE_ERROR)
          }
        }
        // dob will come in like this - $dt_19470815 or dateObject
        if (profileKey === 'DOB') {
          if (((!(/^\$D_/).test(profileVal) || (profileVal + '').length !== 11)) && !isDateObject(profileVal)) {
            valid = false
            logger.error(DOB_ERROR)
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
              logger.error(PHONE_FORMAT_ERROR + '. Removed.')
            }
          } else {
            valid = false
            logger.error(PHONE_FORMAT_ERROR + '. Removed.')
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

export const processFBUserObj = (user) => {
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

export const processGPlusUserObj = (user, { logger }) => {
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
  logger.debug('gplus usr profile ' + JSON.stringify(profileData))

  return profileData
}

export const addToLocalProfileMap = (profileObj, override) => {
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

export const closeIframe = (campaignId, divIdIgnored, currentSessionId) => {
  if (campaignId != null && campaignId !== '-1') {
    if (StorageManager._isLocalStorageSupported()) {
      const campaignObj = getCampaignObject()

      let sessionCampaignObj = campaignObj[currentSessionId]
      if (sessionCampaignObj == null) {
        sessionCampaignObj = {}
        campaignObj[currentSessionId] = sessionCampaignObj
      }
      sessionCampaignObj[campaignId] = 'dnd'
      saveCampaignObject(campaignObj)
    }
  }
  if ($ct.campaignDivMap != null) {
    const divId = $ct.campaignDivMap[campaignId]
    if (divId != null) {
      document.getElementById(divId).style.display = 'none'
      if (divId === 'intentPreview') {
        if (document.getElementById('intentOpacityDiv') != null) {
          document.getElementById('intentOpacityDiv').style.display = 'none'
        }
      }
    }
  }
}

export const arp = (jsonMap) => {
  // For unregister calls dont set arp in LS
  if (jsonMap.skipResARP != null && jsonMap.skipResARP) {
    console.debug('Update ARP Request rejected', jsonMap)
    return null
  }

  const isOULARP = !!((jsonMap[IS_OUL] != null && jsonMap[IS_OUL] === true))

  if (StorageManager._isLocalStorageSupported()) {
    try {
      let arpFromStorage = StorageManager.readFromLSorCookie(ARP_COOKIE)
      if (arpFromStorage == null || isOULARP) {
        arpFromStorage = {}
      }

      for (const key in jsonMap) {
        if (jsonMap.hasOwnProperty(key)) {
          if (jsonMap[key] === -1) {
            delete arpFromStorage[key]
          } else {
            arpFromStorage[key] = jsonMap[key]
          }
        }
      }
      StorageManager.saveToLSorCookie(ARP_COOKIE, arpFromStorage)
    } catch (e) {
      console.error('Unable to parse ARP JSON: ' + e)
    }
  }
}
