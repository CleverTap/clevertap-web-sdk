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
  GCOOKIE_NAME,
  IS_OUL,
  categoryLongKey,
  CAMP_COOKIE_G
} from './constants'
import {
  GENDER_ERROR,
  EMPLOYED_ERROR,
  MARRIED_ERROR,
  EDUCATION_ERROR,
  AGE_ERROR,
  DOB_ERROR,
  PHONE_FORMAT_ERROR,
  ENUM_FORMAT_ERROR
} from './messages'
import {
  getToday,
  convertToWZRKDate,
  setDate,
  getNow
} from './datetime'
import {
  isObject,
  isDateObject,
  isConvertibleToNumber,
  isObjectEmpty,
  isString,
  isNumber,
  isValueValid
} from './datatypes'

import { addToURL, getURLParams } from './url'
import { compressData } from './encoder'
import RequestDispatcher from './requestDispatcher'

export const getCampaignObject = () => {
  let finalcampObj = {}
  if (StorageManager._isLocalStorageSupported()) {
    let campObj = StorageManager.read(CAMP_COOKIE_NAME)
    if (campObj != null) {
      campObj = JSON.parse(decodeURIComponent(campObj).replace(singleQuoteRegex, '\"'))
      if (campObj.hasOwnProperty('global')) {
        finalcampObj.wp = campObj
      } else {
        finalcampObj = campObj
      }
    } else {
      finalcampObj = {}
    }
  }
  return finalcampObj
}

export const saveCampaignObject = (campaignObj) => {
  if (StorageManager._isLocalStorageSupported()) {
    const newObj = { ...getCampaignObject(), ...campaignObj }
    const campObj = JSON.stringify(newObj)
    StorageManager.save(CAMP_COOKIE_NAME, encodeURIComponent(campObj))
    // Update the CAMP_COOKIE_G to be in sync with CAMP_COOKIE_NAME
    setCampaignObjectForGuid()
  }
}

// set Campaign Object against the guid, with daily count and total count details
export const setCampaignObjectForGuid = () => {
  if (StorageManager._isLocalStorageSupported()) {
    let guid = StorageManager.read(GCOOKIE_NAME)
    if (isValueValid(guid)) {
      try {
        guid = JSON.parse(decodeURIComponent(StorageManager.read(GCOOKIE_NAME)))
        const guidCampObj = StorageManager.read(CAMP_COOKIE_G) ? JSON.parse(decodeURIComponent(StorageManager.read(CAMP_COOKIE_G))) : {}
        if (guid && StorageManager._isLocalStorageSupported()) {
          var finalCampObj = {}
          var campObj = getCampaignObject()
          Object.keys(campObj).forEach(key => {
            const campKeyObj = (Object.keys(guidCampObj).length && guidCampObj[guid][key]) ? guidCampObj[guid][key] : {}
            const globalObj = campObj[key].global
            const today = getToday()
            const dailyObj = campObj[key][today]
            if (typeof globalObj !== 'undefined') {
              const campaignIdArray = Object.keys(globalObj)
              for (const index in campaignIdArray) {
                let resultObj = []
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
                  resultObj = [campaignId, dailyC, totalC]
                  campKeyObj[campaignId] = resultObj
                }
              }
            }
            finalCampObj = { ...finalCampObj, [key]: campKeyObj }
          })
          guidCampObj[guid] = finalCampObj
          StorageManager.save(CAMP_COOKIE_G, encodeURIComponent(JSON.stringify(guidCampObj)))
        }
      } catch (e) {
        console.error('Invalid clevertap Id ' + e)
      }
    }
  }
}
export const getCampaignObjForLc = () => {
  // before preparing data to send to LC , check if the entry for the guid is already there in CAMP_COOKIE_G
  const guid = JSON.parse(decodeURIComponent(StorageManager.read(GCOOKIE_NAME)))

  let campObj = {}
  if (StorageManager._isLocalStorageSupported()) {
    let resultObj = {}
    campObj = getCampaignObject()
    const resultObjWP = (StorageManager.read(CAMP_COOKIE_G) && JSON.parse(decodeURIComponent(StorageManager.read(CAMP_COOKIE_G)))[guid].wp) ? Object.values(JSON.parse(decodeURIComponent(StorageManager.read(CAMP_COOKIE_G)))[guid].wp) : []
    const resultObjWI = (StorageManager.read(CAMP_COOKIE_G) && JSON.parse(decodeURIComponent(StorageManager.read(CAMP_COOKIE_G)))[guid].wi) ? Object.values(JSON.parse(decodeURIComponent(StorageManager.read(CAMP_COOKIE_G)))[guid].wi) : []
    const today = getToday()
    let todayCwp = 0
    let todayCwi = 0
    if (campObj.wp && campObj.wp[today] && campObj.wp[today].tc !== 'undefined') {
      todayCwp = campObj.wp[today].tc
    }
    if (campObj.wi && campObj.wi[today] && campObj.wi[today].tc !== 'undefined') {
      todayCwi = campObj.wi[today].tc
    }
    resultObj = {
      wmp: todayCwp,
      wimp: todayCwi,
      tlc: resultObjWP,
      witlc: resultObjWI
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
  if (StorageManager._isLocalStorageSupported()) {
    if ($ct.globalProfileMap == null) {
      $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE)
      if ($ct.globalProfileMap == null) {
        $ct.globalProfileMap = {}
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
        if ($ct.globalProfileMap.hasOwnProperty(prop) && !override) {
          continue
        }
        $ct.globalProfileMap[prop] = profileObj[prop]
      }
    }
    if ($ct.globalProfileMap._custom != null) {
      delete $ct.globalProfileMap._custom
    }
    StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap)
  }
}

export const closeIframe = (campaignId, divIdIgnored, currentSessionId) => {
  if (campaignId != null && campaignId !== '-1') {
    if (StorageManager._isLocalStorageSupported()) {
      const campaignObj = getCampaignObject()

      let sessionCampaignObj = campaignObj.wp[currentSessionId]
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

export const getWrappedLink = (link, targetId, type, request, account, logger) => {
  let data = {}
  data.sendTo = link
  data.targetId = targetId
  data.epoch = getNow()

  if (type != null) {
    data.type = type
  } else {
    data.type = 'view'
  }

  data = request.addSystemDataToObject(data, undefined)
  return addToURL(account.recorderURL, 'd', compressData(JSON.stringify(data), logger))
}

export const getMessageTemplate = () => {
  return `<div class="notice-message">
    <a href="[RECORDER_HREF]" class="box">
      <div class="avatar"><span class="fa [ICON] fa-4x fa-fw"></span></div>
      <div class="info">
        <div class="title">[TITLE]</div>
        <div class="clearfix"></div>
        <div class="text">[TEXT]</div>
      </div>
      <div class="clearfix"></div>
    </a>
  </div>
  <div class="clearfix"></div>`
}

export const getMessageHeadTemplate = () => {
  return `<head>
    <base target="_parent" />
    <link rel="stylesheet" href="http://static.clevertap.com/fa/font-awesome.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    [STYLE]
    </style>
  </head>`
}

export const setEnum = (enumVal, logger) => {
  if (isString(enumVal) || isNumber(enumVal)) {
    return '$E_' + enumVal
  }
  logger.error(ENUM_FORMAT_ERROR)
}
export const handleEmailSubscription = (subscription, reEncoded, fetchGroups, account, logger) => {
  const urlParamsAsIs = getURLParams(location.href) // can't use url_params as it is in lowercase above
  const encodedEmailId = urlParamsAsIs.e
  const encodedProfileProps = urlParamsAsIs.p

  if (typeof encodedEmailId !== 'undefined') {
    const data = {}
    data.id = account.id // accountId
    data.unsubGroups = $ct.unsubGroups // unsubscribe groups

    if ($ct.updatedCategoryLong) {
      data[categoryLongKey] = $ct.updatedCategoryLong
    }

    let url = account.emailURL
    if (fetchGroups) {
      url = addToURL(url, 'fetchGroups', fetchGroups)
    }
    if (reEncoded) {
      url = addToURL(url, 'encoded', reEncoded)
    }
    url = addToURL(url, 'e', encodedEmailId)
    url = addToURL(url, 'd', compressData(JSON.stringify(data), logger))
    if (encodedProfileProps) {
      url = addToURL(url, 'p', encodedProfileProps)
    }

    if (subscription !== '-1') {
      url = addToURL(url, 'sub', subscription)
    }
    RequestDispatcher.fireRequest(url)
  }
}
