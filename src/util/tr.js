import {
  addToLocalProfileMap,
  arp,
  getCampaignObject,
  saveCampaignObject,
  closeIframe
} from './clevertap'

import {
  CAMP_COOKIE_NAME,
  DISPLAY,
  GLOBAL,
  EV_COOKIE
} from './constants'

import {
  getNow,
  getToday
} from './datetime'

import {
  compressToBase64
} from './encoder'

import { StorageManager, $ct } from './storage'
import RequestDispatcher from './requestDispatcher'

const _tr = (msg, {
  device,
  session,
  request,
  logger
}) => {
  const _device = device
  const _session = session
  const _request = request
  const _logger = logger
  let _wizCounter = 0

  const doCampHouseKeeping = (targetingMsgJson) => {
    const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
    const today = getToday()

    const incrCount = (obj, campaignId, excludeFromFreqCaps) => {
      let currentCount = 0
      let totalCount = 0
      if (obj[campaignId] != null) {
        currentCount = obj[campaignId]
      }
      currentCount++
      if (obj.tc != null) {
        totalCount = obj.tc
      }
      // if exclude from caps then dont add to total counts
      if (excludeFromFreqCaps < 0) {
        totalCount++
      }

      obj.tc = totalCount
      obj[campaignId] = currentCount
    }

    if (StorageManager._isLocalStorageSupported()) {
      delete sessionStorage[CAMP_COOKIE_NAME]
      const campObj = getCampaignObject()

      // global session limit. default is 1
      if (targetingMsgJson[DISPLAY].wmc == null) {
        targetingMsgJson[DISPLAY].wmc = 1
      }

      var excludeFromFreqCaps = -1
      let campaignSessionLimit = -1
      let campaignDailyLimit = -1
      let campaignTotalLimit = -1
      let totalDailyLimit = -1
      let totalSessionLimit = -1

      if (targetingMsgJson[DISPLAY].efc != null) {
        excludeFromFreqCaps = parseInt(targetingMsgJson[DISPLAY].efc, 10)
      }
      if (targetingMsgJson[DISPLAY].mdc != null) {
        campaignSessionLimit = parseInt(targetingMsgJson[DISPLAY].mdc, 10)
      }
      if (targetingMsgJson[DISPLAY].tdc != null) {
        campaignDailyLimit = parseInt(targetingMsgJson[DISPLAY].tdc, 10)
      }
      if (targetingMsgJson[DISPLAY].tlc != null) {
        campaignTotalLimit = parseInt(targetingMsgJson[DISPLAY].tlc, 10)
      }
      if (targetingMsgJson[DISPLAY].wmp != null) {
        totalDailyLimit = parseInt(targetingMsgJson[DISPLAY].wmp, 10)
      }
      if (targetingMsgJson[DISPLAY].wmc != null) {
        totalSessionLimit = parseInt(targetingMsgJson[DISPLAY].wmc, 10)
      }

      // session level capping
      let sessionObj = campObj[_session.sessionId]
      if (sessionObj) {
        const campaignSessionCount = sessionObj[campaignId]
        const totalSessionCount = sessionObj.tc
        // dnd
        if (campaignSessionCount === 'dnd') {
          return false
        }

        // session
        if (totalSessionLimit > 0 && totalSessionCount >= totalSessionLimit && excludeFromFreqCaps < 0) {
          return false
        }
        // campaign session
        if (campaignSessionLimit > 0 && campaignSessionCount >= campaignSessionLimit) {
          return false
        }
      } else {
        sessionObj = {}
        campObj[_session.sessionId] = sessionObj
      }

      // daily level capping
      var dailyObj = campObj[today]
      if (dailyObj != null) {
        const campaignDailyCount = dailyObj[campaignId]
        const totalDailyCount = dailyObj.tc
        // daily
        if (totalDailyLimit > 0 && totalDailyCount >= totalDailyLimit && excludeFromFreqCaps < 0) {
          return false
        }
        // campaign daily
        if (campaignDailyLimit > 0 && campaignDailyCount >= campaignDailyLimit) {
          return false
        }
      } else {
        dailyObj = {}
        campObj[today] = dailyObj
      }

      var globalObj = campObj[GLOBAL]
      if (globalObj != null) {
        const campaignTotalCount = globalObj[campaignId]
        // campaign total
        if (campaignTotalLimit > 0 && campaignTotalCount >= campaignTotalLimit) {
          return false
        }
      } else {
        globalObj = {}
        campObj[GLOBAL] = globalObj
      }
    }
    // delay
    if (targetingMsgJson[DISPLAY].delay != null && targetingMsgJson[DISPLAY].delay > 0) {
      const delay = targetingMsgJson[DISPLAY].delay
      targetingMsgJson[DISPLAY].delay = 0
      setTimeout(_tr, delay * 1000, msg, {
        device: _device,
        session: _session,
        request: _request,
        logger: _logger
      })
      return false
    }
    const sessionObj = _session.getSessionCookieObject()

    incrCount(sessionObj, campaignId, excludeFromFreqCaps)
    incrCount(dailyObj, campaignId, excludeFromFreqCaps)
    incrCount(globalObj, campaignId, excludeFromFreqCaps)

    // get ride of stale sessions and day entries
    const newCampObj = {}
    newCampObj[_session.sessionId] = sessionObj
    newCampObj[today] = dailyObj
    newCampObj[GLOBAL] = globalObj
    saveCampaignObject(newCampObj)
  }

  const getCookieParams = () => {
    const gcookie = _device.getGuid()
    const scookieObj = _session.getSessionCookieObject()
    return '&t=wc&d=' + encodeURIComponent(compressToBase64(gcookie + '|' + scookieObj.p + '|' + scookieObj.s))
  }

  const setupClickEvent = (onClick, targetingMsgJson, contentDiv, divId, isLegacy) => {
    if (onClick !== '' && onClick != null) {
      let ctaElement
      let jsCTAElements
      if (isLegacy) {
        ctaElement = contentDiv
      } else {
        jsCTAElements = contentDiv.getElementsByClassName('jsCT_CTA')
        if (jsCTAElements != null && jsCTAElements.length === 1) {
          ctaElement = jsCTAElements[0]
        }
      }
      const jsFunc = targetingMsgJson.display.jsFunc
      const isPreview = targetingMsgJson.display.preview
      if (isPreview == null) {
        onClick += getCookieParams()
      }

      if (ctaElement != null) {
        ctaElement.onclick = () => {
          // invoke js function call
          if (jsFunc != null) {
            // track notification clicked event
            if (isPreview == null) {
              RequestDispatcher.fireRequest(onClick)
            }
            invokeExternalJs(jsFunc, targetingMsgJson)
            // close iframe. using -1 for no campaignId
            closeIframe('-1', divId, _session.sessionId)
            return
          }
          // pass on the gcookie|page|scookieId for capturing the click event
          if (targetingMsgJson.display.window === '1') {
            window.open(onClick, '_blank')
          } else {
            window.location = onClick
          }
        }
      }
    }
  }

  const invokeExternalJs = (jsFunc, targetingMsgJson) => {
    const func = window.parent[jsFunc]
    if (typeof func === 'function') {
      if (targetingMsgJson.display.kv != null) {
        func(targetingMsgJson.display.kv)
      } else {
        func()
      }
    }
  }

  const setupClickUrl = (onClick, targetingMsgJson, contentDiv, divId, isLegacy) => {
    incrementImpression(targetingMsgJson)
    setupClickEvent(onClick, targetingMsgJson, contentDiv, divId, isLegacy)
  }

  const incrementImpression = (targetingMsgJson) => {
    const data = {}
    data.type = 'event'
    data.evtName = 'Notification Viewed'
    data.evtData = { wzrk_id: targetingMsgJson.wzrk_id }
    _request.processEvent(data)
  }

  const renderFooterNotification = (targetingMsgJson) => {
    const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
    const displayObj = targetingMsgJson.display

    if (displayObj.layout === 1) {
      return showExitIntent(undefined, targetingMsgJson)
    }
    if (doCampHouseKeeping(targetingMsgJson) === false) {
      return
    }

    const divId = 'wizParDiv' + displayObj.layout

    if (document.getElementById(divId) != null) {
      return
    }
    $ct.campaignDivMap[campaignId] = divId
    const isBanner = displayObj.layout === 2
    const msgDiv = document.createElement('div')
    msgDiv.id = divId
    const viewHeight = window.innerHeight
    const viewWidth = window.innerWidth
    let legacy = false

    if (!isBanner) {
      const marginBottom = viewHeight * 5 / 100
      var contentHeight = 10
      let right = viewWidth * 5 / 100
      let bottomPosition = contentHeight + marginBottom
      let width = viewWidth * 30 / 100 + 20
      let widthPerct = 'width:30%;'
      // for small devices  - mobile phones
      if ((/mobile/i.test(navigator.userAgent) || (/mini/i.test(navigator.userAgent))) && /iPad/i.test(navigator.userAgent) === false) {
        width = viewWidth * 85 / 100 + 20
        right = viewWidth * 5 / 100
        bottomPosition = viewHeight * 5 / 100
        widthPerct = 'width:80%;'
        // medium devices - tablets
      } else if ('ontouchstart' in window || (/tablet/i.test(navigator.userAgent))) {
        width = viewWidth * 50 / 100 + 20
        right = viewWidth * 5 / 100
        bottomPosition = viewHeight * 5 / 100
        widthPerct = 'width:50%;'
      }
      // legacy footer notif
      if (displayObj.proto == null) {
        legacy = true
        msgDiv.setAttribute('style', 'display:block;overflow:hidden; bottom:' + bottomPosition + 'px !important;width:' + width + 'px !important;right:' + right + 'px !important;position:fixed;z-index:2147483647;')
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

    let html
    // direct html
    if (targetingMsgJson.msgContent.type === 1) {
      html = targetingMsgJson.msgContent.html
      html = html.replace('##campaignId##', campaignId)
    } else {
      const css = '' +
          '<style type="text/css">' +
          'body{margin:0;padding:0;}' +
          '#contentDiv.wzrk{overflow:hidden;padding:0;text-align:center;' + pointerCss + '}' +
          '#contentDiv.wzrk td{padding:15px 10px;}' +
          '.wzrkPPtitle{font-weight: bold;font-size: 16px;font-family:arial;padding-bottom:10px;word-break: break-word;}' +
          '.wzrkPPdscr{font-size: 14px;font-family:arial;line-height:16px;word-break: break-word;display:inline-block;}' +
          '.PL15{padding-left:15px;}' +
          '.wzrkPPwarp{margin:20px 20px 0 5px;padding:0px;border-radius: ' + borderRadius + 'px;box-shadow: 1px 1px 5px #888888;}' +
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
      if (targetingMsgJson.msgContent.imageUrl != null && targetingMsgJson.msgContent.imageUrl !== '') {
        imageTd = "<td class='imgTd' style='background-color:" + leftTd + "'><img src='" + targetingMsgJson.msgContent.imageUrl + "' height='60' width='60'></td>"
      }
      const onClickStr = 'parent.$WZRK_WR.closeIframe(' + campaignId + ",'" + divId + "');"
      const title = "<div class='wzrkPPwarp' style='color:" + textColor + ';background-color:' + bgColor + ";'>" +
          "<a href='javascript:void(0);' onclick=" + onClickStr + " class='wzrkClose' style='background-color:" + btnBg + ';color:' + btColor + "'>&times;</a>" +
          "<div id='contentDiv' class='wzrk'>" +
          "<table cellpadding='0' cellspacing='0' border='0'>" +
          // "<tr><td colspan='2'></td></tr>"+
          '<tr>' + imageTd + "<td style='vertical-align:top;'>" +
          "<div class='wzrkPPtitle' style='color:" + textColor + "'>" + titleText + '</div>'
      const body = "<div class='wzrkPPdscr' style='color:" + textColor + "'>" + descriptionText + '<div></td></tr></table></div>'
      html = css + title + body
    }

    iframe.setAttribute('style', 'z-index: 2147483647; display:block; width: 100% !important; border:0px !important; border-color:none !important;')
    msgDiv.appendChild(iframe)
    const ifrm = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument
    const doc = ifrm.document

    doc.open()
    doc.write(html)
    doc.close()

    const adjustIFrameHeight = () => {
      // adjust iframe and body height of html inside correctly
      contentHeight = document.getElementById('wiz-iframe').contentDocument.getElementById('contentDiv').scrollHeight
      if (displayObj['custom-editor'] !== true && !isBanner) {
        contentHeight += 25
      }
      document.getElementById('wiz-iframe').contentDocument.body.style.margin = '0px'
      document.getElementById('wiz-iframe').style.height = contentHeight + 'px'
    }

    const ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('safari') !== -1) {
      if (ua.indexOf('chrome') > -1) {
        iframe.onload = () => {
          adjustIFrameHeight()
          const contentDiv = document.getElementById('wiz-iframe').contentDocument.getElementById('contentDiv')
          setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, legacy)
        }
      } else {
        let inDoc = iframe.contentDocument || iframe.contentWindow
        if (inDoc.document) inDoc = inDoc.document
        // safari iphone 7+ needs this.
        adjustIFrameHeight()
        const _timer = setInterval(() => {
          if (inDoc.readyState === 'complete') {
            clearInterval(_timer)
            // adjust iframe and body height of html inside correctly
            adjustIFrameHeight()
            const contentDiv = document.getElementById('wiz-iframe').contentDocument.getElementById('contentDiv')
            setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, legacy)
          }
        }, 10)
      }
    } else {
      iframe.onload = () => {
        // adjust iframe and body height of html inside correctly
        adjustIFrameHeight()
        const contentDiv = document.getElementById('wiz-iframe').contentDocument.getElementById('contentDiv')
        setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, legacy)
      }
    }
  }

  let _callBackCalled = false

  const showFooterNotification = (targetingMsgJson) => {
    let onClick = targetingMsgJson.display.onClick
    // TODO: Needs wizrocket as a global variable
    if (window.clevertap.hasOwnProperty('notificationCallback') &&
        typeof window.clevertap.notificationCallback !== 'undefined' &&
        typeof window.clevertap.notificationCallback === 'function') {
      const notificationCallback = window.clevertap.notificationCallback
      if (!_callBackCalled) {
        const inaObj = {}
        inaObj.msgContent = targetingMsgJson.msgContent
        inaObj.msgId = targetingMsgJson.wzrk_id
        if (targetingMsgJson.display.kv != null) {
          inaObj.kv = targetingMsgJson.display.kv
        }
        window.clevertap.raiseNotificationClicked = () => {
          if (onClick !== '' && onClick != null) {
            const jsFunc = targetingMsgJson.display.jsFunc
            onClick += getCookieParams()

            // invoke js function call
            if (jsFunc != null) {
              // track notification clicked event
              RequestDispatcher.fireRequest(onClick)
              invokeExternalJs(jsFunc, targetingMsgJson)
              return
            }
            // pass on the gcookie|page|scookieId for capturing the click event
            if (targetingMsgJson.display.window === '1') {
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
      renderFooterNotification(targetingMsgJson)
    }
  }
  let exitintentObj
  const showExitIntent = (event, targetObj) => {
    let targetingMsgJson
    if (event != null && event.clientY > 0) {
      return
    }
    if (targetObj == null) {
      targetingMsgJson = exitintentObj
    } else {
      targetingMsgJson = targetObj
    }

    if (document.getElementById('intentPreview') != null) {
      return
    }
    // dont show exit intent on tablet/mobile - only on desktop
    if (targetingMsgJson.display.layout == null &&
        ((/mobile/i.test(navigator.userAgent)) || (/mini/i.test(navigator.userAgent)) || (/iPad/i.test(navigator.userAgent)) ||
            ('ontouchstart' in window) || (/tablet/i.test(navigator.userAgent)))) {
      return
    }

    const campaignId = targetingMsgJson.wzrk_id.split('_')[0]
    if (doCampHouseKeeping(targetingMsgJson) === false) {
      return
    }

    $ct.campaignDivMap[campaignId] = 'intentPreview'
    let legacy = false
    const opacityDiv = document.createElement('div')
    opacityDiv.id = 'intentOpacityDiv'
    opacityDiv.setAttribute('style', 'position: fixed;top: 0;bottom: 0;left: 0;width: 100%;height: 100%;z-index: 2147483646;background: rgba(0,0,0,0.7);')
    document.body.appendChild(opacityDiv)

    const msgDiv = document.createElement('div')
    msgDiv.id = 'intentPreview'

    if (targetingMsgJson.display.proto == null) {
      legacy = true
      msgDiv.setAttribute('style', 'display:block;overflow:hidden;top:55% !important;left:50% !important;position:fixed;z-index:2147483647;width:600px !important;height:600px !important;margin:-300px 0 0 -300px !important;')
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
    let html
    // direct html
    if (targetingMsgJson.msgContent.type === 1) {
      html = targetingMsgJson.msgContent.html
      html = html.replace('##campaignId##', campaignId)
    } else {
      const css = '' +
          '<style type="text/css">' +
          'body{margin:0;padding:0;}' +
          '#contentDiv.wzrk{overflow:hidden;padding:0 0 20px 0;text-align:center;' + pointerCss + '}' +
          '#contentDiv.wzrk td{padding:15px 10px;}' +
          '.wzrkPPtitle{font-weight: bold;font-size: 24px;font-family:arial;word-break: break-word;padding-top:20px;}' +
          '.wzrkPPdscr{font-size: 14px;font-family:arial;line-height:16px;word-break: break-word;display:inline-block;padding:20px 20px 0 20px;line-height:20px;}' +
          '.PL15{padding-left:15px;}' +
          '.wzrkPPwarp{margin:20px 20px 0 5px;padding:0px;border-radius: ' + borderRadius + 'px;box-shadow: 1px 1px 5px #888888;}' +
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
      if (targetingMsgJson.msgContent.ctaText != null && targetingMsgJson.msgContent.ctaText !== '') {
        ctaText = "<div class='button'><a href='#'>" + targetingMsgJson.msgContent.ctaText + '</a></div>'
      }

      let imageTd = ''
      if (targetingMsgJson.msgContent.imageUrl != null && targetingMsgJson.msgContent.imageUrl !== '') {
        imageTd = "<div style='padding-top:20px;'><img src='" + targetingMsgJson.msgContent.imageUrl + "' width='500' alt=" + titleText + ' /></div>'
      }
      const onClickStr = 'parent.$WZRK_WR.closeIframe(' + campaignId + ",'intentPreview');"
      const title = "<div class='wzrkPPwarp' style='color:" + textColor + ';background-color:' + bgColor + ";'>" +
          "<a href='javascript:void(0);' onclick=" + onClickStr + " class='wzrkClose' style='background-color:" + btnBg + ';color:' + btColor + "'>&times;</a>" +
          "<div id='contentDiv' class='wzrk'>" +
          "<div class='wzrkPPtitle' style='color:" + textColor + "'>" + titleText + '</div>'
      const body = "<div class='wzrkPPdscr' style='color:" + textColor + "'>" + descriptionText + '</div>' + imageTd + ctaText +
          '</div></div>'
      html = css + title + body
    }
    iframe.setAttribute('style', 'z-index: 2147483647; display:block; height: 100% !important; width: 100% !important;min-height:80px !important;border:0px !important; border-color:none !important;')
    msgDiv.appendChild(iframe)
    const ifrm = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument
    const doc = ifrm.document

    doc.open()
    doc.write(html)
    doc.close()

    const contentDiv = document.getElementById('wiz-iframe-intent').contentDocument.getElementById('contentDiv')
    setupClickUrl(onClick, targetingMsgJson, contentDiv, 'intentPreview', legacy)
  }

  if (!document.body) {
    if (_wizCounter < 6) {
      _wizCounter++
      setTimeout(_tr, 1000, msg, {
        device: _device,
        session: _session,
        request: _request,
        logger: _logger
      })
    }
    return
  }
  if (msg.inapp_notifs != null) {
    for (let index = 0; index < msg.inapp_notifs.length; index++) {
      const targetNotif = msg.inapp_notifs[index]
      if (targetNotif.display.wtarget_type == null || targetNotif.display.wtarget_type === 0) {
        showFooterNotification(targetNotif)
      } else if (targetNotif.display.wtarget_type === 1) { // if display['wtarget_type']==1 then exit intent
        exitintentObj = targetNotif
        window.document.body.onmouseleave = showExitIntent
      }
    }
  }

  const mergeEventMap = (newEvtMap) => {
    if ($ct.globalEventsMap == null) {
      $ct.globalEventsMap = StorageManager.readFromLSorCookie(EV_COOKIE)
      if ($ct.globalEventsMap == null) {
        $ct.globalEventsMap = newEvtMap
        return
      }
    }
    for (const key in newEvtMap) {
      if (newEvtMap.hasOwnProperty(key)) {
        const oldEvtObj = $ct.globalEventsMap[key]
        const newEvtObj = newEvtMap[key]
        if ($ct.globalEventsMap[key] != null) {
          if (newEvtObj[0] != null && newEvtObj[0] > oldEvtObj[0]) {
            $ct.globalEventsMap[key] = newEvtObj
          }
        } else {
          $ct.globalEventsMap[key] = newEvtObj
        }
      }
    }
  }

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
      if (msg.inapp_stale != null) {
        const campObj = getCampaignObject()
        const globalObj = campObj.global
        if (globalObj != null) {
          for (const idx in msg.inapp_stale) {
            if (msg.inapp_stale.hasOwnProperty(idx)) {
              delete globalObj[msg.inapp_stale[idx]]
            }
          }
        }
        saveCampaignObject(campObj)
      }
    } catch (e) {
      _logger.error('Unable to persist evrp/arp: ' + e)
    }
  }
}

export default _tr
