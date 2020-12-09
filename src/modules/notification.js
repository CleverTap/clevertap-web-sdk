import { StorageManager, $ct } from '../util/storage'
import { isObject } from '../util/datatypes'
import RequestDispatcher from '../util/requestDispatcher'
import {
  closeIframe,
  addToLocalProfileMap,
  arp,
  getCampaignObject,
  saveCampaignObject
} from '../util/clevertap'
import {
  CAMP_COOKIE_NAME,
  DISPLAY,
  GLOBAL,
  EV_COOKIE,
  WEBPUSH_LS_KEY
} from '../util/constants'
import {
  compressToBase64,
  compressData,
  urlBase64ToUint8Array
} from '../util/encoder'
import {
  getNow,
  getToday
} from '../util/datetime'
import { addToURL } from '../util/url'

export default class NotificationHandler extends Array {
  #oldValues
  #logger
  #session
  #device
  #request
  #account
  #wizAlertJSPath
  #wizCounter
  #fcmPublicKey

  constructor ({
    logger,
    session,
    device,
    request,
    account
  }, values) {
    super()
    this.#wizAlertJSPath = 'https://d2r1yp2w7bby2u.cloudfront.net/js/wzrk_dialog.min.js'
    this.#wizCounter = 0
    this.#fcmPublicKey = null
    this.#oldValues = values
    this.#logger = logger
    this.#session = session
    this.#device = device
    this.#request = request
    this.#account = account
  }

  push (...displayArgs) {
    this.#setUpWebPush(displayArgs)
    return 0
  }

  _processOldValues () {
    if (this.#oldValues) {
      this.#setUpWebPush(this.#oldValues)
    }
    this.#oldValues = null
  }

  #setUpWebPush (displayArgs) {
    if ($ct.webPushEnabled && displayArgs.length > 0) {
      this.#handleNotificationRegistration(displayArgs)
    } else if ($ct.webPushEnabled == null && displayArgs.length > 0) {
      $ct.notifApi.notifEnabledFromApi = true
      $ct.notifApi.displayArgs = displayArgs.slice()
    } else if ($ct.webPushEnabled === false && displayArgs.length > 0) {
      this.#logger.error('Make sure push notifications are fully enabled and integrated')
    }
  }

  #setUpWebPushNotifications (subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsServiceUrl) {
    if (navigator.userAgent.indexOf('Chrome') !== -1 || navigator.userAgent.indexOf('Firefox') !== -1) {
      this.#setUpChromeFirefoxNotifications(subscriptionCallback, serviceWorkerPath)
    } else if (navigator.userAgent.indexOf('Safari') !== -1) {
      this.#setUpSafariNotifications(subscriptionCallback, apnsWebPushId, apnsServiceUrl)
    }
  }

  #setApplicationServerKey (applicationServerKey) {
    this.#fcmPublicKey = applicationServerKey
  }

  #setUpSafariNotifications (subscriptionCallback, apnsWebPushId, apnsServiceUrl) {
    // ensure that proper arguments are passed
    if (typeof apnsWebPushId === 'undefined') {
      this.#logger.error('Ensure that APNS Web Push ID is supplied')
    }
    if (typeof apnsServiceUrl === 'undefined') {
      this.#logger.error('Ensure that APNS Web Push service path is supplied')
    }
    if ('safari' in window && 'pushNotification' in window.safari) {
      window.safari.pushNotification.requestPermission(
        apnsServiceUrl,
        apnsWebPushId, {}, (subscription) => {
          if (subscription.permission === 'granted') {
            const subscriptionData = JSON.parse(JSON.stringify(subscription))
            subscriptionData.endpoint = subscription.deviceToken
            subscriptionData.browser = 'Safari'

            let payload = subscriptionData
            payload = this.#request.addSystemDataToObject(payload, true)
            payload = JSON.stringify(payload)
            let pageLoadUrl = this.#account.dataPostURL
            pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data')
            pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(payload))
            RequestDispatcher.fireRequest(pageLoadUrl)
            // set in localstorage
            StorageManager.save(WEBPUSH_LS_KEY, 'ok')
            this.#logger.info('Safari Web Push registered. Device Token: ' + subscription.deviceToken)
          } else if (subscription.permission === 'denied') {
            this.#logger.info('Error subscribing to Safari web push')
          }
        })
    }
  }

  #setUpChromeFirefoxNotifications (subscriptionCallback, serviceWorkerPath) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(serviceWorkerPath).then(() => {
        return navigator.serviceWorker.ready
      }).then((serviceWorkerRegistration) => {
        const subscribeObj = { userVisibleOnly: true }

        if (this.#fcmPublicKey != null) {
          subscribeObj.applicationServerKey = urlBase64ToUint8Array(this.#fcmPublicKey)
        }

        serviceWorkerRegistration.pushManager.subscribe(subscribeObj)
          .then((subscription) => {
            this.#logger.info('Service Worker registered. Endpoint: ' + subscription.endpoint)

            // convert the subscription keys to strings; this sets it up nicely for pushing to LC
            const subscriptionData = JSON.parse(JSON.stringify(subscription))

            // remove the common chrome/firefox endpoint at the beginning of the token
            if (navigator.userAgent.indexOf('Chrome') !== -1) {
              subscriptionData.endpoint = subscriptionData.endpoint.split('/').pop()
              subscriptionData.browser = 'Chrome'
            } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
              subscriptionData.endpoint = subscriptionData.endpoint.split('/').pop()
              subscriptionData.browser = 'Firefox'
            }
            // var shouldSendToken = typeof sessionObj['p'] === STRING_CONSTANTS.UNDEFINED || sessionObj['p'] === 1
            //     || sessionObj['p'] === 2 || sessionObj['p'] === 3 || sessionObj['p'] === 4 || sessionObj['p'] === 5;
            const shouldSendToken = true
            if (shouldSendToken) {
              let payload = subscriptionData
              payload = this.#request.addSystemDataToObject(payload, true)
              payload = JSON.stringify(payload)
              let pageLoadUrl = this.#account.dataPostURL
              pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data')
              pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(payload))
              RequestDispatcher.fireRequest(pageLoadUrl)
              // set in localstorage
              StorageManager.save(WEBPUSH_LS_KEY, 'ok')
            }

            if (typeof subscriptionCallback !== 'undefined' && typeof subscriptionCallback === 'function') {
              subscriptionCallback()
            }
          }).catch((error) => {
            this.#logger.error('Error subscribing: ' + error)
            // unsubscribe from webpush if error
            serviceWorkerRegistration.pushManager.getSubscription().then((subscription) => {
              if (subscription !== null) {
                subscription.unsubscribe().then((successful) => {
                // You've successfully unsubscribed
                  this.#logger.info('Unsubscription successful')
                }).catch((e) => {
                // Unsubscription failed
                  this.#logger.error('Error unsubscribing: ' + e)
                })
              }
            })
          })
      }).catch((err) => {
        this.#logger.error('error registering service worker: ' + err)
      })
    }
  }

  #addWizAlertJS () {
    const scriptTag = document.createElement('script')
    scriptTag.setAttribute('type', 'text/javascript')
    scriptTag.setAttribute('id', 'wzrk-alert-js')
    scriptTag.setAttribute('src', this.#wizAlertJSPath)

    // add the script tag to the end of the body
    document.getElementsByTagName('body')[0].appendChild(scriptTag)

    return scriptTag
  }

  #removeWizAlertJS () {
    const scriptTag = document.getElementById('wzrk-alert-js')
    scriptTag.parentNode.removeChild(scriptTag)
  }

  #handleNotificationRegistration (displayArgs) {
    // make sure everything is specified
    let titleText
    let bodyText
    let okButtonText
    let rejectButtonText
    let okButtonColor
    let skipDialog
    let askAgainTimeInSeconds
    let okCallback
    let rejectCallback
    let subscriptionCallback
    let hidePoweredByCT
    let serviceWorkerPath
    let httpsPopupPath
    let httpsIframePath
    let apnsWebPushId
    let apnsWebPushServiceUrl

    if (displayArgs.length === 1) {
      if (isObject(displayArgs[0])) {
        const notifObj = displayArgs[0]
        titleText = notifObj.titleText
        bodyText = notifObj.bodyText
        okButtonText = notifObj.okButtonText
        rejectButtonText = notifObj.rejectButtonText
        okButtonColor = notifObj.okButtonColor
        skipDialog = notifObj.skipDialog
        askAgainTimeInSeconds = notifObj.askAgainTimeInSeconds
        okCallback = notifObj.okCallback
        rejectCallback = notifObj.rejectCallback
        subscriptionCallback = notifObj.subscriptionCallback
        hidePoweredByCT = notifObj.hidePoweredByCT
        serviceWorkerPath = notifObj.serviceWorkerPath
        httpsPopupPath = notifObj.httpsPopupPath
        httpsIframePath = notifObj.httpsIframePath
        apnsWebPushId = notifObj.apnsWebPushId
        apnsWebPushServiceUrl = notifObj.apnsWebPushServiceUrl
      }
    } else {
      titleText = displayArgs[0]
      bodyText = displayArgs[1]
      okButtonText = displayArgs[2]
      rejectButtonText = displayArgs[3]
      okButtonColor = displayArgs[4]
      skipDialog = displayArgs[5]
      askAgainTimeInSeconds = displayArgs[6]
    }

    if (skipDialog == null) {
      skipDialog = false
    }

    if (hidePoweredByCT == null) {
      hidePoweredByCT = false
    }

    if (serviceWorkerPath == null) {
      serviceWorkerPath = '/clevertap_sw.js'
    }

    // ensure that the browser supports notifications
    if (typeof navigator.serviceWorker === 'undefined') {
      return
    }

    const isHTTP = httpsPopupPath != null && httpsIframePath != null

    // make sure the site is on https for chrome notifications
    if (window.location.protocol !== 'https:' && document.location.hostname !== 'localhost' && !isHTTP) {
      this.#logger.error('Make sure you are https or localhost to register for notifications')
      return
    }

    // right now, we only support Chrome V50 & higher & Firefox
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      const chromeAgent = navigator.userAgent.match(/Chrome\/(\d+)/)
      if (chromeAgent == null || parseInt(chromeAgent[1], 10) < 50) { return }
    } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
      const firefoxAgent = navigator.userAgent.match(/Firefox\/(\d+)/)
      if (firefoxAgent == null || parseInt(firefoxAgent[1], 10) < 50) { return }
    } else if (navigator.userAgent.indexOf('Safari') !== -1) {
      const safariAgent = navigator.userAgent.match(/Safari\/(\d+)/)
      if (safariAgent == null || parseInt(safariAgent[1], 10) < 50) { return }
    } else {
      return
    }

    // we check for the cookie in setUpChromeNotifications() the tokens may have changed

    if (!isHTTP) {
      if (Notification == null) {
        return
      }
      // handle migrations from other services -> chrome notifications may have already been asked for before
      if (Notification.permission === 'granted') {
        // skip the dialog and register
        this.#setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl)
        return
      } else if (Notification.permission === 'denied') {
        // we've lost this profile :'(
        return
      }

      if (skipDialog) {
        this.#setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl)
        return
      }
    }

    // make sure the right parameters are passed
    if (!titleText || !bodyText || !okButtonText || !rejectButtonText) {
      this.#logger.error('Missing input parameters; please specify title, body, ok button and cancel button text')
      return
    }

    // make sure okButtonColor is formatted properly
    if (okButtonColor == null || !okButtonColor.match(/^#[a-f\d]{6}$/i)) {
      okButtonColor = '#f28046' // default color for positive button
    }

    // make sure the user isn't asked for notifications more than askAgainTimeInSeconds
    const now = new Date().getTime() / 1000
    if ((StorageManager.getMetaProp('notif_last_time')) == null) {
      StorageManager.setMetaProp('notif_last_time', now)
    } else {
      if (askAgainTimeInSeconds == null) {
        // 7 days by default
        askAgainTimeInSeconds = 7 * 24 * 60 * 60
      }

      if (now - StorageManager.getMetaProp('notif_last_time') < askAgainTimeInSeconds) {
        return
      } else {
        // continue asking
        StorageManager.setMetaProp('notif_last_time', now)
      }
    }

    if (isHTTP) {
      // add the https iframe
      const httpsIframe = document.createElement('iframe')
      httpsIframe.setAttribute('style', 'display:none;')
      httpsIframe.setAttribute('src', httpsIframePath)
      document.body.appendChild(httpsIframe)
      window.addEventListener('message', (event) => {
        if (event.data != null) {
          let obj = {}
          try {
            obj = JSON.parse(event.data)
          } catch (e) {
            // not a call from our iframe
            return
          }
          if (obj.state != null) {
            if (obj.from === 'ct' && obj.state === 'not') {
              this.#addWizAlertJS().onload = () => {
                // create our wizrocket popup
                window.wzrkPermissionPopup.wizAlert({
                  title: titleText,
                  body: bodyText,
                  confirmButtonText: okButtonText,
                  confirmButtonColor: okButtonColor,
                  rejectButtonText: rejectButtonText,
                  hidePoweredByCT: hidePoweredByCT
                }, (enabled) => { // callback function
                  if (enabled) {
                    // the user accepted on the dialog box
                    if (typeof okCallback === 'function') {
                      okCallback()
                    }
                    // redirect to popup.html
                    window.open(httpsPopupPath)
                  } else {
                    if (typeof rejectCallback === 'function') {
                      rejectCallback()
                    }
                  }
                  this.#removeWizAlertJS()
                })
              }
            }
          }
        }
      }, false)
    } else {
      this.#addWizAlertJS().onload = () => {
        // create our wizrocket popup
        window.wzrkPermissionPopup.wizAlert({
          title: titleText,
          body: bodyText,
          confirmButtonText: okButtonText,
          confirmButtonColor: okButtonColor,
          rejectButtonText: rejectButtonText,
          hidePoweredByCT: hidePoweredByCT
        }, (enabled) => { // callback function
          if (enabled) {
            // the user accepted on the dialog box
            if (typeof okCallback === 'function') {
              okCallback()
            }
            this.#setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl)
          } else {
            if (typeof rejectCallback === 'function') {
              rejectCallback()
            }
          }
          this.#removeWizAlertJS()
        })
      }
    }
  }

  _closeIframe (campaignId, divIdIgnored) {
    closeIframe(campaignId, divIdIgnored, this.#session.sessionId)
  }

  _tr (msg) {
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
        let sessionObj = campObj[this.#session.sessionId]
        if (sessionObj != null) {
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
          campObj[this.#session.sessionId] = sessionObj
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
        setTimeout(this.tr, delay * 1000, msg)
        return false
      }
      const sessionObj = this.#session.getSessionCookieObject()

      incrCount(sessionObj, campaignId, excludeFromFreqCaps)
      incrCount(dailyObj, campaignId, excludeFromFreqCaps)
      incrCount(globalObj, campaignId, excludeFromFreqCaps)

      // get ride of stale sessions and day entries
      const newCampObj = {}
      newCampObj[this.#session.sessionId] = sessionObj
      newCampObj[today] = dailyObj
      newCampObj[GLOBAL] = globalObj
      saveCampaignObject(newCampObj)
    }

    const getCookieParams = () => {
      const gcookie = this.#device.getGuid()
      const scookieObj = this.#session.getSessionCookieObject()
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
              this._closeIframe('-1', divId)
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
      this.#request.processEvent(data)
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
      if (window.wizrocket.hasOwnProperty('notificationCallback') &&
          typeof window.wizrocket.notificationCallback !== 'undefined' &&
          typeof window.wizrocket.notificationCallback === 'function') {
        const notificationCallback = window.wizrocket.notificationCallback
        if (!_callBackCalled) {
          const inaObj = {}
          inaObj.msgContent = targetingMsgJson.msgContent
          inaObj.msgId = targetingMsgJson.wzrk_id
          if (targetingMsgJson.display.kv != null) {
            inaObj.kv = targetingMsgJson.display.kv
          }
          window.wizrocket.raiseNotificationClicked = () => {
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
          window.wizrocket.raiseNotificationViewed = () => {
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
      if (this.#wizCounter < 6) {
        this.#wizCounter++
        setTimeout(this.tr, 1000, msg)
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
        this.#logger.error('Unable to persist evrp/arp: ' + e)
      }
    }
  }

  _enableWebPush (enabled, applicationServerKey) {
    $ct.webPushEnabled = enabled
    if (applicationServerKey != null) {
      this.#setApplicationServerKey(applicationServerKey)
    }
    if ($ct.webPushEnabled && $ct.notifApi.notifEnabledFromApi) {
      this.#handleNotificationRegistration($ct.notifApi.displayArgs)
    } else if (!$ct.webPushEnabled && $ct.notifApi.notifEnabledFromApi) {
      this.#logger.error('Ensure that web push notifications are fully enabled and integrated before requesting them')
    }
  }
}
