import { renderPopUpImageOnly } from '../campaignRender/webPopup.js'
import {
  addDeliveryPreferenceDetails,
  addToLocalProfileMap,
  arp,
  getCampaignObject,
  saveCampaignObject
} from '../clevertap.js'

import {
  CAMP_COOKIE_NAME,
  DISPLAY,
  GLOBAL,
  EV_COOKIE,
  NOTIFICATION_CLICKED,
  WZRK_PREFIX,
  WZRK_ID,
  WEB_NATIVE_TEMPLATES,
  CAMPAIGN_TYPES
} from '../constants.js'

import { getNow, getToday } from '../datetime.js'

import { StorageManager, $ct } from '../storage.js'
import RequestDispatcher from '../requestDispatcher.js'
import { CTWebPopupImageOnly } from '../web-popupImageonly/popupImageonly.js'
import {
  checkAndRegisterWebInboxElements,
  initializeWebInbox,
  processWebInboxSettings,
  hasWebInboxSettingsInLS,
  processInboxNotifs
} from '../../modules/web-inbox/helper.js'
import { renderVisualBuilder } from '../../modules/visualBuilder/pageBuilder.js'
import {
  handleKVpairCampaign,
  renderPersonalisationBanner,
  renderPersonalisationCarousel,
  renderCustomHtml,
  handleJson
} from '../campaignRender/nativeDisplay.js'
import {
  appendScriptForCustomEvent,
  deliveryPreferenceUtils,
  getCookieParams,
  incrementImpression,
  invokeExternalJs,
  mergeEventMap,
  setupClickEvent,
  staleDataUpdate,
  webNativeDisplayCampaignUtils
} from '../campaignRender/utilities.js'
import { CampaignContext } from './campaignContext.js'
import _tr from '../tr.js'

export const commonCampaignUtils = {
  doCampHouseKeeping (targetingMsgJson, logger) {
    // Extracts campaign ID from wzrk_id (e.g., "123_456" -> "123")
    const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
    // Gets current date for daily capping
    const today = getToday()

    if (
      deliveryPreferenceUtils.isCampaignAddedToDND(campaignId) &&
      !$ct.dismissSpamControl
    ) {
      return false
    }

    // Helper function to increment campaign counters (session, daily, total)
    const incrCount = (obj, campaignId, excludeFromFreqCaps) => {
      let currentCount = 0
      let totalCount = 0
      if (obj[campaignId] != null) {
        // Current count for this campaign
        currentCount = obj[campaignId]
      }
      currentCount++
      if (obj.tc != null) {
        // Total count across all campaigns
        totalCount = obj.tc
      }
      // If campaign is excluded from frequency caps, don't increment total count
      if (excludeFromFreqCaps < 0) {
        totalCount++
      }

      obj.tc = totalCount
      obj[campaignId] = currentCount
    }

    if (StorageManager._isLocalStorageSupported()) {
      // Clears old session storage for campaigns
      delete sessionStorage[CAMP_COOKIE_NAME]
      var campTypeObj = {}
      // Retrieves stored campaign data from local storage
      const campObj = getCampaignObject()
      // Determines campaign type (web inbox or web popup) and fetches corresponding data
      if (
        targetingMsgJson.display.wtarget_type === 3 &&
        campObj.hasOwnProperty('wi')
      ) {
        // Web inbox campaigns
        campTypeObj = campObj.wi
      } else if (
        (targetingMsgJson.display.wtarget_type === 0 ||
          targetingMsgJson.display.wtarget_type === 1) &&
        campObj.hasOwnProperty('wp')
      ) {
        // Web popup campaigns
        // campTypeObj = campObj.wp
      } else {
        campTypeObj = {}
      }
      if (campObj.hasOwnProperty('global')) {
        // Merges global data if present
        // campTypeObj.wp = campObj
      }
      // Sets default global session limits if not specified
      if (targetingMsgJson[DISPLAY].wmc == null) {
        // Default web popup session limit
        targetingMsgJson[DISPLAY].wmc = 1
      }

      // Sets default global session limit for web inbox if not specified
      if (targetingMsgJson[DISPLAY].wimc == null) {
        // Default web inbox session limit
        targetingMsgJson[DISPLAY].wimc = 1
      }

      // Variables to store campaign frequency capping settings
      var excludeFromFreqCaps = -1 // efc - Exclude from frequency caps (-1 means not excluded)
      let campaignSessionLimit = -1 // mdc - Once per session
      let campaignDailyLimit = -1 // tdc - Once per day
      let campaignTotalLimit = -1 // tlc - Once per user for the duration of campaign
      let totalDailyLimit = -1
      let totalSessionLimit = -1 // wmc - Web Popup Global Session Limit
      let totalInboxSessionLimit = -1 // wimc - Web Inbox Global Session Limit

      // Parses frequency capping settings from the message
      if (targetingMsgJson[DISPLAY].efc != null) {
        // exclude from frequency cap
        excludeFromFreqCaps = parseInt(targetingMsgJson[DISPLAY].efc, 10)
      }
      if (targetingMsgJson[DISPLAY].mdc != null) {
        // Campaign Session Limit
        campaignSessionLimit = parseInt(targetingMsgJson[DISPLAY].mdc, 10)
      }
      if (targetingMsgJson[DISPLAY].tdc != null) {
        // No of web popups in a day per campaign
        campaignDailyLimit = parseInt(targetingMsgJson[DISPLAY].tdc, 10)
      }
      if (targetingMsgJson[DISPLAY].tlc != null) {
        // Total lifetime count
        campaignTotalLimit = parseInt(targetingMsgJson[DISPLAY].tlc, 10)
      }
      if (targetingMsgJson[DISPLAY].wmp != null) {
        // No of campaigns per day
        totalDailyLimit = parseInt(targetingMsgJson[DISPLAY].wmp, 10)
      }
      if (targetingMsgJson[DISPLAY].wmc != null) {
        // No of campaigns per session
        totalSessionLimit = parseInt(targetingMsgJson[DISPLAY].wmc, 10)
      }

      if (targetingMsgJson[DISPLAY].wimc != null) {
        // No of inbox campaigns per session
        totalInboxSessionLimit = parseInt(targetingMsgJson[DISPLAY].wimc, 10)
      }
      // Session-level capping: Checks if campaign exceeds session limits
      var sessionObj = campTypeObj[CampaignContext.session.sessionId]
      if (sessionObj) {
        const campaignSessionCount = sessionObj[campaignId]
        const totalSessionCount = sessionObj.tc
        // For web inbox campaigns
        if (targetingMsgJson[DISPLAY].wtarget_type === 3) {
          // Inbox session limit check
          if (
            totalInboxSessionLimit > 0 &&
            totalSessionCount >= totalInboxSessionLimit &&
            excludeFromFreqCaps < 0
          ) {
            return false
          }
        } else {
          // Web popup session limit check
          if (
            totalSessionLimit > 0 &&
            totalSessionCount >= totalSessionLimit &&
            excludeFromFreqCaps < 0
          ) {
            return false
          }
        }

        // Campaign-specific session limit check
        if (
          campaignSessionLimit > 0 &&
          campaignSessionCount >= campaignSessionLimit
        ) {
          return false
        }
      } else {
        // Initializes session object if not present
        sessionObj = {}
        campTypeObj[CampaignContext.session.sessionId] = sessionObj
      }

      // Daily-level capping: Checks if campaign exceeds daily limits
      var dailyObj = campTypeObj[today]
      if (dailyObj != null) {
        const campaignDailyCount = dailyObj[campaignId]
        const totalDailyCount = dailyObj.tc
        // Total daily limit check
        if (
          totalDailyLimit > 0 &&
          totalDailyCount >= totalDailyLimit &&
          excludeFromFreqCaps < 0
        ) {
          return false
        }
        // Campaign-specific daily limit check
        if (
          campaignDailyLimit > 0 &&
          campaignDailyCount >= campaignDailyLimit
        ) {
          return false
        }
      } else {
        // Initializes daily object if not present
        dailyObj = {}
        campTypeObj[today] = dailyObj
      }

      // Global-level capping: Checks lifetime limit for the campaign
      var globalObj = campTypeObj[GLOBAL]
      if (globalObj != null) {
        const campaignTotalCount = globalObj[campaignId]
        // Campaign lifetime limit check
        if (
          campaignTotalLimit > 0 &&
          campaignTotalCount >= campaignTotalLimit
        ) {
          return false
        }
      } else {
        // Initializes global object if not present
        globalObj = {}
        campTypeObj[GLOBAL] = globalObj
      }
    }
    // Handles delay in displaying the campaign
    const displayObj = targetingMsgJson.display
    if (displayObj.delay != null && displayObj.delay > 0) {
      const delay = displayObj.delay
      // Resets delay to prevent re-triggering
      displayObj.delay = 0
      setTimeout(_tr, delay * 1000, CampaignContext.msg, {
        device: CampaignContext.device,
        session: CampaignContext.session,
        request: CampaignContext.request,
        logger: logger
      })
      // Delays execution, skips immediate rendering
      return false
    }

    // Increments counters for session, daily, and global objects
    incrCount(sessionObj, campaignId, excludeFromFreqCaps)
    incrCount(dailyObj, campaignId, excludeFromFreqCaps)
    incrCount(globalObj, campaignId, excludeFromFreqCaps)

    // Determines storage key based on campaign type (web popup or inbox)
    let campKey
    if (targetingMsgJson[DISPLAY].wtarget_type === 3) {
      campKey = 'wi'
    }
    if (campKey === 'wi') {
      // Updates campaign object with new counts and saves to storage
      const newCampObj = {}
      newCampObj[CampaignContext.session.sessionId] = sessionObj
      newCampObj[today] = dailyObj
      newCampObj[GLOBAL] = globalObj
      // Save CAMP to localstorage here
      saveCampaignObject({ [campKey]: newCampObj })
    } else {
      /* For Web Native Display and Web Popup */
      addDeliveryPreferenceDetails(targetingMsgJson, logger)
    }
  },

  // Sets up click tracking and impression increment for a campaign
  setupClickUrl (onClick, targetingMsgJson, contentDiv, divId, isLegacy) {
    // Records an impression
    incrementImpression(targetingMsgJson, CampaignContext.request)
    // Sets up click event listener
    setupClickEvent(
      onClick,
      targetingMsgJson,
      contentDiv,
      divId,
      isLegacy,
      CampaignContext.device,
      CampaignContext.session
    )
  },

  // Handles rendering of image-only popup campaigns
  handleImageOnlyPopup (targetingMsgJson) {
    const divId = 'wzrkImageOnlyDiv'
    // Skips if frequency limits are exceeded
    if (houseKeepingUtils.doCampHouseKeeping(targetingMsgJson) === false) {
      return
    }
    // Removes existing popup if spam control is active
    if ($ct.dismissSpamControl && document.getElementById(divId) != null) {
      const element = document.getElementById(divId)
      element.remove()
    }
    // Prevents coexistence with other popups (e.g., exit intent)
    if (
      document.getElementById(divId) != null ||
      document.getElementById('intentPreview') != null
    ) {
      return
    }
    const msgDiv = document.createElement('div')
    msgDiv.id = divId
    document.body.appendChild(msgDiv)
    // Registers custom element for image-only popup if not already defined
    if (customElements.get('ct-web-popup-imageonly') === undefined) {
      customElements.define('ct-web-popup-imageonly', CTWebPopupImageOnly)
    }
    // Renders the popup
    return renderPopUpImageOnly(targetingMsgJson, CampaignContext.session)
  },

  // Checks if a campaign is already rendered in an iframe
  isExistingCampaign (campaignId) {
    const testIframe =
      document.getElementById('wiz-iframe-intent') ||
      document.getElementById('wiz-iframe')
    if (testIframe) {
      const iframeDocument =
        testIframe.contentDocument || testIframe.contentWindow.document
      return iframeDocument.documentElement.innerHTML.includes(campaignId)
    }
    return false
  },

  // Creates and renders campaign templates (e.g., exit intent, banners, popups)
  createTemplate (targetingMsgJson, isExitIntent, wtq) {
    const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
    const displayObj = targetingMsgJson.display

    // Handles specific layout types
    if (displayObj.layout === 1) {
      // Handling Web Exit Intent
      return houseKeepingUtils.showExitIntent(undefined, targetingMsgJson, wtq)
    }
    if (displayObj.layout === 3) {
      // Handling Web Popup Image Only
      houseKeepingUtils.handleImageOnlyPopup(targetingMsgJson)
      return
    }

    // Skips if frequency limits are exceeded
    if (houseKeepingUtils.doCampHouseKeeping(targetingMsgJson) === false) {
      return
    }

    const divId = 'wizParDiv' + displayObj.layout
    const opacityDivId = 'intentOpacityDiv' + displayObj.layout

    // Removes existing elements if spam control is active
    if ($ct.dismissSpamControl && document.getElementById(divId) != null) {
      const element = document.getElementById(divId)
      const opacityElement = document.getElementById(opacityDivId)
      if (element) {
        element.remove()
      }
      if (opacityElement) {
        opacityElement.remove()
      }
    }
    // Skips if campaign is already rendered
    if (houseKeepingUtils.isExistingCampaign(campaignId)) return

    if (document.getElementById(divId) != null) {
      // Skips if div already exists
      return
    }

    // Maps campaign ID to div ID
    $ct.campaignDivMap[campaignId] = divId
    const isBanner = displayObj.layout === 2
    // Adds opacity layer for exit intent campaigns
    if (isExitIntent) {
      const opacityDiv = document.createElement('div')
      opacityDiv.id = opacityDivId
      const opacity = targetingMsgJson.display.opacity || 0.7
      const rgbaColor = `rgba(0,0,0,${opacity})`
      opacityDiv.setAttribute(
        'style',
        `position: fixed;top: 0;bottom: 0;left: 0;width: 100%;height: 100%;z-index: 2147483646;background: ${rgbaColor};`
      )
      document.body.appendChild(opacityDiv)
    }
    const msgDiv = document.createElement('div')
    msgDiv.id = divId
    const viewHeight = window.innerHeight
    const viewWidth = window.innerWidth
    let legacy = false
    // Sets styling based on device type and layout
    if (!isBanner) {
      const marginBottom = (viewHeight * 5) / 100
      var contentHeight = 10
      let right = (viewWidth * 5) / 100
      let bottomPosition = contentHeight + marginBottom
      let width = (viewWidth * 30) / 100 + 20
      let widthPerct = 'width:30%;'
      // Adjusts for mobile devices
      if (
        (/mobile/i.test(navigator.userAgent) ||
          /mini/i.test(navigator.userAgent)) &&
        /iPad/i.test(navigator.userAgent) === false
      ) {
        width = (viewWidth * 85) / 100 + 20
        right = (viewWidth * 5) / 100
        bottomPosition = (viewHeight * 5) / 100
        widthPerct = 'width:80%;'
        // Adjusts for tablets
      } else if (
        'ontouchstart' in window ||
        /tablet/i.test(navigator.userAgent)
      ) {
        width = (viewWidth * 50) / 100 + 20
        right = (viewWidth * 5) / 100
        bottomPosition = (viewHeight * 5) / 100
        widthPerct = 'width:50%;'
      }
      // Applies legacy styling if proto is absent
      if (displayObj.proto == null) {
        legacy = true
        msgDiv.setAttribute(
          'style',
          'display:block;overflow:hidden; bottom:' +
            bottomPosition +
            'px !important;width:' +
            width +
            'px !important;right:' +
            right +
            'px !important;position:fixed;z-index:2147483647;'
        )
      } else {
        msgDiv.setAttribute('style', widthPerct + displayObj.iFrameStyle)
      }
    } else {
      msgDiv.setAttribute('style', displayObj.iFrameStyle)
    }
    document.body.appendChild(msgDiv)
    const iframe = document.createElement('iframe')

    const borderRadius = displayObj.br === false ? '0' : '8'

    iframe.frameborder = '0px'
    iframe.marginheight = '0px'
    iframe.marginwidth = '0px'
    iframe.scrolling = 'no'
    iframe.id = 'wiz-iframe'
    const onClick = targetingMsgJson.display.onClick
    let pointerCss = ''
    if (onClick !== '' && onClick != null) {
      pointerCss = 'cursor:pointer;'
    }
    if (displayObj.preview) {
      iframe.sandbox =
        'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin'
    }

    let html
    // Direct HTML content
    if (targetingMsgJson.msgContent.type === 1) {
      html = targetingMsgJson.msgContent.html
      html = html.replace(/##campaignId##/g, campaignId)
      html = html.replace(/##campaignId_batchId##/g, targetingMsgJson.wzrk_id)
    } else {
      // Generated HTML with styling
      const css =
        '' +
        '<style type="text/css">' +
        'body{margin:0;padding:0;}' +
        '#contentDiv.wzrk{overflow:hidden;padding:0;text-align:center;' +
        pointerCss +
        '}' +
        '#contentDiv.wzrk td{padding:15px 10px;}' +
        '.wzrkPPtitle{font-weight: bold;font-size: 16px;font-family:arial;padding-bottom:10px;word-break: break-word;}' +
        '.wzrkPPdscr{font-size: 14px;font-family:arial;line-height:16px;word-break: break-word;display:inline-block;}' +
        '.PL15{padding-left:15px;}' +
        '.wzrkPPwarp{margin:20px 20px 0 5px;padding:0px;border-radius: ' +
        borderRadius +
        'px;box-shadow: 1px 1px 5px #888888;}' +
        'a.wzrkClose{cursor:pointer;position: absolute;top: 11px;right: 11px;z-index: 2147483647;font-size:19px;font-family:arial;font-weight:bold;text-decoration: none;width: 25px;/*height: 25px;*/text-align: center; -webkit-appearance: none; line-height: 25px;' +
        'background: #353535;border: #fff 2px solid;border-radius: 100%;box-shadow: #777 2px 2px 2px;color:#fff;}' +
        'a:hover.wzrkClose{background-color:#d1914a !important;color:#fff !important; -webkit-appearance: none;}' +
        'td{vertical-align:top;}' +
        'td.imgTd{border-top-left-radius:8px;border-bottom-left-radius:8px;}' +
        '</style>'

      let bgColor, textColor, btnBg, leftTd, btColor
      if (targetingMsgJson.display.theme === 'dark') {
        bgColor = '#2d2d2e'
        textColor = '#eaeaea'
        btnBg = '#353535'
        leftTd = '#353535'
        btColor = '#ffffff'
      } else {
        bgColor = '#ffffff'
        textColor = '#000000'
        leftTd = '#f4f4f4'
        btnBg = '#a5a6a6'
        btColor = '#ffffff'
      }
      const titleText = targetingMsgJson.msgContent.title
      const descriptionText = targetingMsgJson.msgContent.description
      let imageTd = ''
      if (
        targetingMsgJson.msgContent.imageUrl != null &&
        targetingMsgJson.msgContent.imageUrl !== ''
      ) {
        imageTd =
          "<td class='imgTd' style='background-color:" +
          leftTd +
          "'><img src='" +
          targetingMsgJson.msgContent.imageUrl +
          "' height='60' width='60'></td>"
      }
      const onClickStr =
        'parent.$WZRK_WR.closeIframe(' + campaignId + ",'" + divId + "');"
      const title =
        "<div class='wzrkPPwarp' style='color:" +
        textColor +
        ';background-color:' +
        bgColor +
        ";'>" +
        "<a href='javascript:void(0);' onclick=" +
        onClickStr +
        " class='wzrkClose' style='background-color:" +
        btnBg +
        ';color:' +
        btColor +
        "'>&times;</a>" +
        "<div id='contentDiv' class='wzrk'>" +
        "<table cellpadding='0' cellspacing='0' border='0'>" +
        // "<tr><td colspan='2'></td></tr>"+
        '<tr>' +
        imageTd +
        "<td style='vertical-align:top;'>" +
        "<div class='wzrkPPtitle' style='color:" +
        textColor +
        "'>" +
        titleText +
        '</div>'
      const body =
        "<div class='wzrkPPdscr' style='color:" +
        textColor +
        "'>" +
        descriptionText +
        '<div></td></tr></table></div>'
      html = css + title + body
    }

    iframe.setAttribute(
      'style',
      'color-scheme: none; z-index: 2147483647; display:block; width: 100% !important; border:0px !important; border-color:none !important;'
    )
    msgDiv.appendChild(iframe)

    // Dispatches event to signal campaign rendering
    const closeCampaign = new Event('CT_campaign_rendered')
    document.dispatchEvent(closeCampaign)

    if (displayObj['custom-editor']) {
      // Adds custom event scripts if needed
      html = appendScriptForCustomEvent(targetingMsgJson, html)
    }
    iframe.srcdoc = html

    // Adjusts iframe height based on content
    const adjustIFrameHeight = () => {
      // Gets scroll height of content div inside iframe
      contentHeight = document
        .getElementById('wiz-iframe')
        .contentDocument.getElementById('contentDiv').scrollHeight
      if (displayObj['custom-editor'] !== true && !isBanner) {
        contentHeight += 25
      }
      document.getElementById('wiz-iframe').contentDocument.body.style.margin =
        '0px'
      document.getElementById('wiz-iframe').style.height = contentHeight + 'px'
    }

    const ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('safari') !== -1) {
      if (ua.indexOf('chrome') > -1) {
        iframe.onload = () => {
          adjustIFrameHeight()
          const contentDiv = document
            .getElementById('wiz-iframe')
            .contentDocument.getElementById('contentDiv')
          houseKeepingUtils.setupClickUrl(
            onClick,
            targetingMsgJson,
            contentDiv,
            divId,
            legacy
          )
        }
      } else {
        let inDoc = iframe.contentDocument || iframe.contentWindow
        if (inDoc.document) inDoc = inDoc.document
        // safari iphone 7+ needs this.
        const _timer = setInterval(() => {
          if (inDoc.readyState === 'complete') {
            clearInterval(_timer)
            // adjust iframe and body height of html inside correctly
            adjustIFrameHeight()
            const contentDiv = document
              .getElementById('wiz-iframe')
              .contentDocument.getElementById('contentDiv')
            houseKeepingUtils.setupClickUrl(
              onClick,
              targetingMsgJson,
              contentDiv,
              divId,
              legacy
            )
          }
        }, 300)
      }
    } else {
      iframe.onload = () => {
        // adjust iframe and body height of html inside correctly
        adjustIFrameHeight()
        const contentDiv = document
          .getElementById('wiz-iframe')
          .contentDocument.getElementById('contentDiv')
        houseKeepingUtils.setupClickUrl(
          onClick,
          targetingMsgJson,
          contentDiv,
          divId,
          legacy
        )
      }
    }
  },

  // Renders footer notification
  renderFooterNotification (targetingMsgJson, exitintentObj) {
    houseKeepingUtils.createTemplate(targetingMsgJson, false)
  },

  // Displays footer notification with callback handling
  showFooterNotification (targetingMsgJson, _callBackCalled, exitintentObj) {
    let onClick = targetingMsgJson.display.onClick
    const displayObj = targetingMsgJson.display

    // Checks for custom notification callback from CleverTap
    if (
      window.clevertap.hasOwnProperty('notificationCallback') &&
      typeof window.clevertap.notificationCallback !== 'undefined' &&
      typeof window.clevertap.notificationCallback === 'function'
    ) {
      const notificationCallback = window.clevertap.notificationCallback

      if (!_callBackCalled) {
        const inaObj = {}
        inaObj.msgContent = targetingMsgJson.msgContent
        inaObj.msgId = targetingMsgJson.wzrk_id
        if (targetingMsgJson.wzrk_pivot) {
          inaObj.pivotId = targetingMsgJson.wzrk_pivot
        }
        if (targetingMsgJson.display.kv != null) {
          inaObj.kv = targetingMsgJson.display.kv
        }

        window.clevertap.raiseNotificationClicked = () => {
          if (onClick !== '' && onClick != null) {
            const jsFunc = targetingMsgJson.display.jsFunc
            onClick += getCookieParams(
              CampaignContext.device,
              CampaignContext.session
            )

            // Invokes JS function or redirects based on click action
            if (jsFunc != null) {
              // Tracks notification clicked event
              RequestDispatcher.fireRequest(onClick)
              invokeExternalJs(jsFunc, targetingMsgJson)
              return
            }
            // Opens link in new tab or redirects current page
            if (targetingMsgJson.display.window === 1) {
              window.open(onClick, '_blank')
            } else {
              window.location = onClick
            }
          }
        }
        window.clevertap.raiseNotificationViewed = () => {
          incrementImpression(targetingMsgJson)
        }
        notificationCallback(inaObj)
        _callBackCalled = true
      }
    } else {
      window.clevertap.popupCurrentWzrkId = targetingMsgJson.wzrk_id

      // Handles delivery triggers (inactivity, scroll, exit intent, delay)
      if (displayObj.deliveryTrigger) {
        if (displayObj.deliveryTrigger.inactive) {
          houseKeepingUtils.triggerByInactivity(targetingMsgJson)
        }
        if (displayObj.deliveryTrigger.scroll) {
          houseKeepingUtils.triggerByScroll(targetingMsgJson)
        }
        if (displayObj.deliveryTrigger.isExitIntent) {
          exitintentObj = targetingMsgJson
          window.document.body.onmouseleave = houseKeepingUtils.showExitIntent
        }
        const delay =
          displayObj.delay || displayObj.deliveryTrigger.deliveryDelayed
        if (delay != null && delay > 0) {
          setTimeout(() => {
            houseKeepingUtils.renderFooterNotification(
              targetingMsgJson,
              exitintentObj
            )
          }, delay * 1000)
        }
      } else {
        houseKeepingUtils.renderFooterNotification(
          targetingMsgJson,
          exitintentObj
        )
      }

      // Handles popup-specific callbacks
      if (
        window.clevertap.hasOwnProperty('popupCallbacks') &&
        typeof window.clevertap.popupCallbacks !== 'undefined' &&
        typeof window.clevertap.popupCallbacks[targetingMsgJson.wzrk_id] ===
          'function'
      ) {
        const popupCallback =
          window.clevertap.popupCallbacks[targetingMsgJson.wzrk_id]

        const inaObj = {}
        inaObj.msgContent = targetingMsgJson.msgContent
        inaObj.msgId = targetingMsgJson.wzrk_id

        if (targetingMsgJson.wzrk_pivot) {
          inaObj.pivotId = targetingMsgJson.wzrk_pivot
        }

        var msgCTkv = []
        for (var wzrkPrefixKey in targetingMsgJson) {
          // Adds WZRK prefix key-value pairs to callback data
          if (
            wzrkPrefixKey.startsWith(WZRK_PREFIX) &&
            wzrkPrefixKey !== WZRK_ID
          ) {
            const wzrkJson = {
              [wzrkPrefixKey]: targetingMsgJson[wzrkPrefixKey]
            }
            msgCTkv.push(wzrkJson)
          }
        }

        if (msgCTkv.length > 0) {
          inaObj.msgCTkv = msgCTkv
        }
        if (targetingMsgJson.display.kv != null) {
          inaObj.kv = targetingMsgJson.display.kv
        }

        // Public API to record clicked event
        window.clevertap.raisePopupNotificationClicked = (notificationData) => {
          if (!notificationData || !notificationData.msgId) {
            return
          }

          const eventData = {}
          eventData.type = 'event'
          eventData.evtName = NOTIFICATION_CLICKED
          eventData.evtData = { [WZRK_ID]: notificationData.msgId }
          if (targetingMsgJson.wzrk_pivot) {
            eventData.evtData = {
              ...eventData.evtData,
              wzrk_pivot: notificationData.pivotId
            }
          }

          // Adds WZRK prefix key-value pairs to event data
          if (notificationData.msgCTkv) {
            for (var wzrkPrefixObj of notificationData.msgCTkv) {
              eventData.evtData = { ...eventData.evtData, ...wzrkPrefixObj }
            }
          }

          CampaignContext.request.processEvent(eventData)
        }
        popupCallback(inaObj)
      }
    }
  },

  // Triggers campaign based on user inactivity
  triggerByInactivity (targetNotif) {
    const IDLE_TIME_THRESHOLD =
      targetNotif.display.deliveryTrigger.inactive * 1000 // Convert to milliseconds
    let idleTimer
    const events = [
      'mousemove',
      'keypress',
      'scroll',
      'mousedown',
      'touchmove',
      'click'
    ]
    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        houseKeepingUtils.renderFooterNotification(targetNotif)
        removeEventListeners()
      }, IDLE_TIME_THRESHOLD)
    }
    const eventHandler = () => {
      resetIdleTimer()
    }
    const setupEventListeners = () => {
      events.forEach((eventType) =>
        window.addEventListener(eventType, eventHandler, { passive: true })
      )
    }
    const removeEventListeners = () => {
      events.forEach((eventType) =>
        window.removeEventListener(eventType, eventHandler)
      )
    }
    setupEventListeners()
    resetIdleTimer()
    // Returns cleanup function
    return removeEventListeners
  },

  // Triggers campaign based on scroll percentage
  triggerByScroll (targetNotif) {
    const calculateScrollPercentage = () => {
      const { scrollHeight, clientHeight, scrollTop } =
        document.documentElement
      return (scrollTop / (scrollHeight - clientHeight)) * 100
    }
    const scrollListener = () => {
      const scrollPercentage = calculateScrollPercentage()
      if (scrollPercentage >= targetNotif.display.deliveryTrigger.scroll) {
        houseKeepingUtils.renderFooterNotification(targetNotif)
        window.removeEventListener('scroll', throttledScrollListener)
      }
    }
    const throttle = (func, limit) => {
      let inThrottle = false
      return function (...args) {
        const context = this
        if (!inThrottle) {
          func.apply(context, args)
          inThrottle = true
          setTimeout(() => {
            inThrottle = false
          }, limit)
        }
      }
    }
    const throttledScrollListener = throttle(scrollListener, 200)
    window.addEventListener('scroll', throttledScrollListener, {
      passive: true
    })
    // Returns cleanup function
    return () => window.removeEventListener('scroll', throttledScrollListener)
  },

  // Handles exit intent campaigns (triggered when mouse leaves window)
  showExitIntent (event, targetObj, wtq, exitintentObj) {
    // Only triggers when mouse moves upward out of window
    if (event?.clientY > 0) return
    const targetingMsgJson = targetObj || exitintentObj

    const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
    const layout = targetingMsgJson.display.layout
    // Skips if campaign is already rendered
    if (houseKeepingUtils.isExistingCampaign(campaignId)) return

    if (
      targetingMsgJson.display.wtarget_type === 0 &&
      (layout === 0 || layout === 2 || layout === 3)
    ) {
      houseKeepingUtils.createTemplate(targetingMsgJson, true)
      return
    }
    // Skips if frequency limits are exceeded
    if (houseKeepingUtils.doCampHouseKeeping(targetingMsgJson) === false) {
      return
    }

    // Removes existing exit intent elements if spam control is active
    if ($ct.dismissSpamControl && targetingMsgJson.display.wtarget_type === 0) {
      const intentPreview = document.getElementById('intentPreview')
      const intentOpacityDiv = document.getElementById('intentOpacityDiv')
      if (intentPreview && intentOpacityDiv) {
        intentPreview.remove()
        intentOpacityDiv.remove()
      }
    }
    // Prevents coexistence with other popups
    if (
      document.getElementById('intentPreview') != null ||
      document.getElementById('wzrkImageOnlyDiv') != null
    ) {
      return
    }
    // Skips exit intent on mobile/tablet devices
    if (
      targetingMsgJson.display.layout == null &&
      (/mobile/i.test(navigator.userAgent) ||
        /mini/i.test(navigator.userAgent) ||
        /iPad/i.test(navigator.userAgent) ||
        'ontouchstart' in window ||
        /tablet/i.test(navigator.userAgent))
    ) {
      return
    }

    $ct.campaignDivMap[campaignId] = 'intentPreview'
    let legacy = false
    const opacityDiv = document.createElement('div')
    opacityDiv.id = 'intentOpacityDiv'
    const opacity = targetingMsgJson.display.opacity || 0.7
    const rgbaColor = `rgba(0,0,0,${opacity})`
    opacityDiv.setAttribute(
      'style',
      `position: fixed;top: 0;bottom: 0;left: 0;width: 100%;height: 100%;z-index: 2147483646;background: ${rgbaColor};`
    )
    document.body.appendChild(opacityDiv)

    const msgDiv = document.createElement('div')
    msgDiv.id = 'intentPreview'

    if (targetingMsgJson.display.proto == null) {
      legacy = true
      msgDiv.setAttribute(
        'style',
        'display:block;overflow:hidden;top:55% !important;left:50% !important;position:fixed;z-index:2147483647;width:600px !important;height:600px !important;margin:-300px 0 0 -300px !important;'
      )
    } else {
      msgDiv.setAttribute('style', targetingMsgJson.display.iFrameStyle)
    }
    document.body.appendChild(msgDiv)
    const iframe = document.createElement('iframe')
    const borderRadius = targetingMsgJson.display.br === false ? '0' : '8'
    iframe.frameborder = '0px'
    iframe.marginheight = '0px'
    iframe.marginwidth = '0px'
    iframe.scrolling = 'no'
    iframe.id = 'wiz-iframe-intent'
    const onClick = targetingMsgJson.display.onClick
    let pointerCss = ''
    if (onClick !== '' && onClick != null) {
      pointerCss = 'cursor:pointer;'
    }
    if (
      targetingMsgJson.display.preview &&
      targetingMsgJson.display['custom-editor']
    ) {
      iframe.sandbox =
        'allow-scripts allow-popups allow-popups-to-escape-sandbox'
    }
    let html
    // Direct HTML content
    if (targetingMsgJson.msgContent.type === 1) {
      html = targetingMsgJson.msgContent.html
      html = html.replace(/##campaignId##/g, campaignId)
      html = html.replace(/##campaignId_batchId##/g, targetingMsgJson.wzrk_id)
    } else {
      // Generated HTML with styling
      const css =
        '' +
        '<style type="text/css">' +
        'body{margin:0;padding:0;}' +
        '#contentDiv.wzrk{overflow:hidden;padding:0 0 20px 0;text-align:center;' +
        pointerCss +
        '}' +
        '#contentDiv.wzrk td{padding:15px 10px;}' +
        '.wzrkPPtitle{font-weight: bold;font-size: 24px;font-family:arial;word-break: break-word;padding-top:20px;}' +
        '.wzrkPPdscr{font-size: 14px;font-family:arial;line-height:16px;word-break: break-word;display:inline-block;padding:20px 20px 0 20px;line-height:20px;}' +
        '.PL15{padding-left:15px;}' +
        '.wzrkPPwarp{margin:20px 20px 0 5px;padding:0px;border-radius: ' +
        borderRadius +
        'px;box-shadow: 1px 1px 5px #888888;}' +
        'a.wzrkClose{cursor:pointer;position: absolute;top: 11px;right: 11px;z-index: 2147483647;font-size:19px;font-family:arial;font-weight:bold;text-decoration: none;width: 25px;/*height: 25px;*/text-align: center; -webkit-appearance: none; line-height: 25px;' +
        'background: #353535;border: #fff 2px solid;border-radius: 100%;box-shadow: #777 2px 2px 2px;color:#fff;}' +
        'a:hover.wzrkClose{background-color:#d1914a !important;color:#fff !important; -webkit-appearance: none;}' +
        '#contentDiv .button{padding-top:20px;}' +
        '#contentDiv .button a{font-size: 14px;font-weight:bold;font-family:arial;text-align:center;display:inline-block;text-decoration:none;padding:0 30px;height:40px;line-height:40px;background:#ea693b;color:#fff;border-radius:4px;-webkit-border-radius:4px;-moz-border-radius:4px;}' +
        '</style>'

      let bgColor, textColor, btnBg, btColor
      if (targetingMsgJson.display.theme === 'dark') {
        bgColor = '#2d2d2e'
        textColor = '#eaeaea'
        btnBg = '#353535'
        btColor = '#ffffff'
      } else {
        bgColor = '#ffffff'
        textColor = '#000000'
        btnBg = '#a5a6a6'
        btColor = '#ffffff'
      }
      const titleText = targetingMsgJson.msgContent.title
      const descriptionText = targetingMsgJson.msgContent.description
      let ctaText = ''
      if (
        targetingMsgJson.msgContent.ctaText != null &&
        targetingMsgJson.msgContent.ctaText !== ''
      ) {
        ctaText =
          "<div class='button'><a href='#'>" +
          targetingMsgJson.msgContent.ctaText +
          '</a></div>'
      }

      let imageTd = ''
      if (
        targetingMsgJson.msgContent.imageUrl != null &&
        targetingMsgJson.msgContent.imageUrl !== ''
      ) {
        imageTd =
          "<div style='padding-top:20px;'><img src='" +
          targetingMsgJson.msgContent.imageUrl +
          "' width='500' alt=" +
          titleText +
          ' /></div>'
      }
      const onClickStr =
        'parent.$WZRK_WR.closeIframe(' + campaignId + ",'intentPreview');"
      const title =
        "<div class='wzrkPPwarp' style='color:" +
        textColor +
        ';background-color:' +
        bgColor +
        ";'>" +
        "<a href='javascript:void(0);' onclick=" +
        onClickStr +
        " class='wzrkClose' style='background-color:" +
        btnBg +
        ';color:' +
        btColor +
        "'>&times;</a>" +
        "<div id='contentDiv' class='wzrk'>" +
        "<div class='wzrkPPtitle' style='color:" +
        textColor +
        "'>" +
        titleText +
        '</div>'
      const body =
        "<div class='wzrkPPdscr' style='color:" +
        textColor +
        "'>" +
        descriptionText +
        '</div>' +
        imageTd +
        ctaText +
        '</div></div>'
      html = css + title + body
    }
    iframe.setAttribute(
      'style',
      'color-scheme: none; z-index: 2147483647; display:block; height: 100% !important; width: 100% !important;min-height:80px !important;border:0px !important; border-color:none !important;'
    )
    msgDiv.appendChild(iframe)

    // Dispatches event for interstitial/exit intent close
    const closeCampaign = new Event('CT_campaign_rendered')
    document.dispatchEvent(closeCampaign)

    if (targetingMsgJson.display['custom-editor']) {
      html = appendScriptForCustomEvent(targetingMsgJson, html)
    }
    iframe.srcdoc = html

    iframe.onload = () => {
      const contentDiv = document
        .getElementById('wiz-iframe-intent')
        .contentDocument.getElementById('contentDiv')
      houseKeepingUtils.setupClickUrl(
        onClick,
        targetingMsgJson,
        contentDiv,
        'intentPreview',
        legacy
      )
    }
  },

  // Processes native display campaigns (e.g., banners, carousels)
  processNativeDisplayArr (arrInAppNotifs) {
    Object.keys(arrInAppNotifs).map((key) => {
      var elementId, id
      if (arrInAppNotifs[key].display.divId) {
        elementId = arrInAppNotifs[key].display.divId
        id = document.getElementById(elementId)
      } else {
        elementId = arrInAppNotifs[key].display.divSelector
        id = document.querySelector(elementId)
      }
      if (id !== null) {
        arrInAppNotifs[key].msgContent.type === 2
          ? renderPersonalisationBanner(arrInAppNotifs[key])
          : renderPersonalisationCarousel(arrInAppNotifs[key])
        // Removes processed campaign
        delete arrInAppNotifs[key]
      }
    })
  },

  // Adds listener to process native displays after page load
  addLoadListener (arrInAppNotifs) {
    window.addEventListener('load', () => {
      let count = 0
      if (count < 20) {
        const t = setInterval(() => {
          houseKeepingUtils.processNativeDisplayArr(arrInAppNotifs)
          if (Object.keys(arrInAppNotifs).length === 0 || count === 20) {
            clearInterval(t)
            arrInAppNotifs = {}
          }
          count++
        }, 500)
      }
    })
  },

  // Processes web inbox notifications
  handleInboxNotifications (msg) {
    if (msg.inbox_preview) {
      processInboxNotifs(msg)
      return
    }
    if (msg.inbox_notifs) {
      const msgArr = []
      for (let index = 0; index < msg.inbox_notifs.length; index++) {
        if (
          houseKeepingUtils.doCampHouseKeeping(msg.inbox_notifs[index]) !==
          false
        ) {
          msgArr.push(msg.inbox_notifs[index])
        }
      }
      processInboxNotifs(msgArr)
    }
  },

  processCampaigns (msg, _callBackCalled, exitintentObj, logger) {
    const arrInAppNotifs = {}

    const sortedCampaigns =
      webNativeDisplayCampaignUtils.sortCampaignsByPriority(msg.inapp_notifs)

    const executedTargets = {
      nodes: [],
      customEvents: []
    }

    for (let index = 0; index < sortedCampaigns.length; index++) {
      const targetNotif = sortedCampaigns[index]

      if (
        targetNotif.display.wtarget_type ===
          CAMPAIGN_TYPES.FOOTER_NOTIFICATION ||
        targetNotif.display.wtarget_type ===
          CAMPAIGN_TYPES.FOOTER_NOTIFICATION_2
      ) {
        houseKeepingUtils.showFooterNotification(
          targetNotif,
          _callBackCalled,
          exitintentObj
        )
      } else if (
        targetNotif.display.wtarget_type === CAMPAIGN_TYPES.EXIT_INTENT
      ) {
        // if display['wtarget_type']==1 then exit intent
        exitintentObj = targetNotif
        window.document.body.onmouseleave = houseKeepingUtils.showExitIntent
      } else if (
        targetNotif.display.wtarget_type === CAMPAIGN_TYPES.WEB_NATIVE_DISPLAY
      ) {
        // if display['wtarget_type']==2 then web native display
        // Skips duplicate custom event campaigns
        if (
          webNativeDisplayCampaignUtils.doesCampaignPushCustomEvent(
            targetNotif
          ) &&
          executedTargets.customEvents.length > 0 &&
          webNativeDisplayCampaignUtils.shouldCurrentCustomEventCampaignBeSkipped(
            targetNotif,
            executedTargets
          )
        ) {
          logger.debug(
            'Custom Event Campaign Skipped with id :: ' + targetNotif?.wzrk_id
          )
          continue
        }

        // Skips duplicate DOM node campaigns
        if (
          webNativeDisplayCampaignUtils.doesCampaignMutateDOMNode(
            targetNotif
          ) &&
          executedTargets.nodes.some((node) =>
            webNativeDisplayCampaignUtils
              .getCampaignNodes(targetNotif)
              ?.includes(node)
          )
        ) {
          logger.debug(
            'DOM Campaign Skipped with id :: ' + targetNotif?.wzrk_id
          )
          continue
        }

        // Tracks executed custom events
        if (
          webNativeDisplayCampaignUtils.doesCampaignPushCustomEvent(targetNotif)
        ) {
          /*
              This basically stores the CustomEvents with their type that we will push so that
              the next time we receive a CustomEvent with the same type we can skip it
            */

          const eventTopic =
            targetNotif.msgContent.type === WEB_NATIVE_TEMPLATES.KV_PAIR
              ? targetNotif.display.kv.topic
              : null
          executedTargets.customEvents.push({
            customEventType: targetNotif.msgContent.type,
            eventTopic
          })
        } else if (
          webNativeDisplayCampaignUtils.doesCampaignMutateDOMNode(targetNotif)
        ) {
          // Tracks executed DOM nodes
          const nodes =
            webNativeDisplayCampaignUtils.getCampaignNodes(targetNotif)
          executedTargets.nodes.push(...nodes)
        }

        // Handles different native display types
        if (targetNotif.msgContent.type === WEB_NATIVE_TEMPLATES.KV_PAIR) {
          handleKVpairCampaign(targetNotif)
        } else if (
          targetNotif.msgContent.type === WEB_NATIVE_TEMPLATES.BANNER ||
          targetNotif.msgContent.type === WEB_NATIVE_TEMPLATES.CAROUSEL
        ) {
          // Check for banner and carousel
          const element = targetNotif.display.divId
            ? document.getElementById(targetNotif.display.divId)
            : document.querySelector(targetNotif.display.divSelector)
          if (element !== null) {
            targetNotif.msgContent.type === WEB_NATIVE_TEMPLATES.BANNER
              ? renderPersonalisationBanner(targetNotif)
              : renderPersonalisationCarousel(targetNotif)
          } else {
            // Adds to array for later processing if element not found
            arrInAppNotifs[targetNotif.wzrk_id.split('_')[0]] = targetNotif
          }
        } else if (
          targetNotif.msgContent.type === WEB_NATIVE_TEMPLATES.VISUAL_BUILDER
        ) {
          renderVisualBuilder(targetNotif, false)
        } else if (
          targetNotif.msgContent.type === WEB_NATIVE_TEMPLATES.CUSTOM_HTML
        ) {
          renderCustomHtml(targetNotif, logger)
        } else if (targetNotif.msgContent.type === WEB_NATIVE_TEMPLATES.JSON) {
          handleJson(targetNotif, false)
        } else {
          houseKeepingUtils.showFooterNotification(
            targetNotif,
            _callBackCalled,
            exitintentObj
          )
        }
      }
    }
    // Processes banner or carousel campaign array
    if (Object.keys(arrInAppNotifs).length) {
      if (document.readyState === 'complete') {
        houseKeepingUtils.processNativeDisplayArr(arrInAppNotifs)
      } else {
        houseKeepingUtils.addLoadListener(arrInAppNotifs)
      }
    }
  },

  handleWebInbox (msg, logger) {
    if (hasWebInboxSettingsInLS()) {
      checkAndRegisterWebInboxElements()
    }
    if ($ct.inbox === null) {
      msg.webInboxSetting && processWebInboxSettings(msg.webInboxSetting)
      initializeWebInbox(logger)
        .then(() => {
          houseKeepingUtils.handleInboxNotifications(msg)
        })
        .catch((e) => {})
    } else {
      houseKeepingUtils.handleInboxNotifications(msg)
    }
  },

  persistsEventsAndProfileData (msg, logger) {
    // Persists events and profile data to local storage
    if (StorageManager._isLocalStorageSupported()) {
      try {
        if (msg.evpr != null) {
          const eventsMap = msg.evpr.events
          const profileMap = msg.evpr.profile
          const syncExpiry = msg.evpr.expires_in
          const now = getNow()
          StorageManager.setMetaProp('lsTime', now)
          StorageManager.setMetaProp('exTs', syncExpiry)
          mergeEventMap(eventsMap)
          StorageManager.saveToLSorCookie(EV_COOKIE, $ct.globalEventsMap)
          if ($ct.globalProfileMap == null) {
            addToLocalProfileMap(profileMap, true)
          } else {
            addToLocalProfileMap(profileMap, false)
          }
        }
        if (msg.arp != null) {
          arp(msg.arp)
        }
        if (msg.inapp_stale != null && msg.inapp_stale.length > 0) {
          // Updates stale web popup data
          staleDataUpdate(msg.inapp_stale, 'wp')
        }
        if (msg.inbox_stale != null && msg.inbox_stale.length > 0) {
          // Updates stale web inbox data
          staleDataUpdate(msg.inbox_stale, 'wi')
        }
      } catch (e) {
        logger.error('Unable to persist evrp/arp: ' + e)
      }
    }
  },

  handleVariables (msg) {
    // Merges variables into storage
    if (msg.vars) {
      $ct.variableStore.mergeVariables(msg.vars)
    }
  }
}
