import { StorageManager, $ct } from '../util/storage'
import { isObject } from '../util/datatypes'
import {
  PUSH_SUBSCRIPTION_DATA,
  VAPID_MIGRATION_PROMPT_SHOWN,
  NOTIF_LAST_TIME
} from '../util/constants'
import {
  urlBase64ToUint8Array
} from '../util/encoder'
import { enablePush } from './webPushPrompt/prompt'
import { isChrome, isFirefox, isSafari } from '../util/helpers'

export default class NotificationHandler extends Array {
  #oldValues
  #logger
  #request
  #account
  #wizAlertJSPath
  #fcmPublicKey

  constructor ({
    logger,
    session,
    request,
    account
  }, values) {
    super()
    this.#wizAlertJSPath = 'https://d2r1yp2w7bby2u.cloudfront.net/js/wzrk_dialog.min.js'
    this.#fcmPublicKey = null
    this.#oldValues = values
    this.#logger = logger
    this.#request = request
    this.#account = account
  }

  push (...displayArgs) {
    this.#setUpWebPush(displayArgs)
    return 0
  }

  enable (options = {}) {
    const { swPath, skipDialog } = options
    enablePush(this.#logger, this.#account, this.#request, swPath, skipDialog, this.#fcmPublicKey)
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

  setUpWebPushNotifications (subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsServiceUrl) {
    if (isChrome() || isFirefox()) {
      this.#setUpChromeFirefoxNotifications(subscriptionCallback, serviceWorkerPath)
    } else if (isSafari()) {
      this.#setUpSafariNotifications(subscriptionCallback, apnsWebPushId, apnsServiceUrl, serviceWorkerPath)
    }
  }

  setApplicationServerKey (applicationServerKey) {
    this.#fcmPublicKey = applicationServerKey
  }

  #isNativeWebPushSupported () {
    return 'PushManager' in window
  }

  #setUpSafariNotifications (subscriptionCallback, apnsWebPushId, apnsServiceUrl, serviceWorkerPath) {
    if (this.#isNativeWebPushSupported() && this.#fcmPublicKey != null) {
      StorageManager.setMetaProp(VAPID_MIGRATION_PROMPT_SHOWN, true)
      navigator.serviceWorker.register(serviceWorkerPath).then((registration) => {
        window.Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            const subscribeObj = {
              applicationServerKey: this.#fcmPublicKey,
              userVisibleOnly: true
            }
            this.#logger.info('Sub Obj' + JSON.stringify(subscribeObj))
            const subscribeForPush = () => {
              registration.pushManager.subscribe(subscribeObj).then((subscription) => {
                this.#logger.info('Service Worker registered. Endpoint: ' + subscription.endpoint)
                this.#logger.info('Service Data Sent: ' + JSON.stringify({
                  applicationServerKey: this.#fcmPublicKey,
                  userVisibleOnly: true
                }))
                this.#logger.info('Subscription Data Received: ' + JSON.stringify(subscription))

                const subscriptionData = JSON.parse(JSON.stringify(subscription))

                subscriptionData.endpoint = subscriptionData.endpoint.split('/').pop()
                StorageManager.saveToLSorCookie(PUSH_SUBSCRIPTION_DATA, subscriptionData)
                this.#request.registerToken(subscriptionData)

                if (typeof subscriptionCallback !== 'undefined' && typeof subscriptionCallback === 'function') {
                  subscriptionCallback()
                }
                const existingBellWrapper = document.getElementById('bell_wrapper')
                if (existingBellWrapper) {
                  existingBellWrapper.parentNode.removeChild(existingBellWrapper)
                }
              })
            }

            const serviceWorker = registration.installing || registration.waiting || registration.active
            if (serviceWorker && serviceWorker.state === 'activated') {
              // Already activated, proceed with subscription
              subscribeForPush()
            } else if (serviceWorker) {
              // Listen for state changes to handle activation
              serviceWorker.addEventListener('statechange', (event) => {
                if (event.target.state === 'activated') {
                  this.#logger.info('Service Worker activated. Proceeding with subscription.')
                  subscribeForPush()
                }
              })
            }
          }
        })
      })
    } else {
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
              this.#logger.info('Service Data Sent: ' + JSON.stringify({
                apnsServiceUrl,
                apnsWebPushId
              }))
              this.#logger.info('Subscription Data Received: ' + JSON.stringify(subscription))

              StorageManager.saveToLSorCookie(PUSH_SUBSCRIPTION_DATA, subscriptionData)

              this.#request.registerToken(subscriptionData)
              this.#logger.info('Safari Web Push registered. Device Token: ' + subscription.deviceToken)
            } else if (subscription.permission === 'denied') {
              this.#logger.info('Error subscribing to Safari web push')
            }
          })
      }
    }
  }

  /**
   * Sets up a service worker for WebPush(chrome/Firefox) push notifications and sends the data to LC
   */
  #setUpChromeFirefoxNotifications (subscriptionCallback, serviceWorkerPath) {
    let registrationScope = ''

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(serviceWorkerPath).then((registration) => {
        if (typeof __wzrk_account_id !== 'undefined') { // eslint-disable-line
          // shopify accounts , since the service worker is not at root, serviceWorker.ready is never resolved.
          // hence add a timeout and hope serviceWroker is ready within that time.
          return new Promise(resolve => setTimeout(() => resolve(registration), 5000))
        }
        registrationScope = registration.scope

        // IF SERVICE WORKER IS AT ROOT, RETURN THE READY PROMISE
        // ELSE IF CHROME RETURN PROMISE AFTER 5 SECONDS
        // OR getRegistrations PROMISE IF ITS FIREFOX
        const rootDirRegex = /^(\.?)(\/?)([^/]*).js$/
        const isServiceWorkerAtRoot = rootDirRegex.test(serviceWorkerPath)
        if (isServiceWorkerAtRoot) {
          return navigator.serviceWorker.ready
        } else {
          if (isChrome()) {
            return new Promise(resolve => setTimeout(() => resolve(registration), 5000))
          } else {
            return navigator.serviceWorker.getRegistrations()
          }
        }
      }).then((serviceWorkerRegistration) => {
        // ITS AN ARRAY IN CASE OF FIREFOX, SO USE THE REGISTRATION WITH PROPER SCOPE
        if (isFirefox() && Array.isArray(serviceWorkerRegistration)) {
          serviceWorkerRegistration = serviceWorkerRegistration.filter((i) => i.scope === registrationScope)[0]
        }
        const subscribeObj = { userVisibleOnly: true }

        if (this.#fcmPublicKey != null) {
          subscribeObj.applicationServerKey = urlBase64ToUint8Array(this.#fcmPublicKey)
        }

        serviceWorkerRegistration.pushManager.subscribe(subscribeObj)
          .then((subscription) => {
            this.#logger.info('Service Worker registered. Endpoint: ' + subscription.endpoint)
            this.#logger.debug('Service Data Sent: ' + JSON.stringify(subscribeObj))
            this.#logger.debug('Subscription Data Received: ' + JSON.stringify(subscription))

            // convert the subscription keys to strings; this sets it up nicely for pushing to LC
            const subscriptionData = JSON.parse(JSON.stringify(subscription))

            // remove the common chrome/firefox endpoint at the beginning of the token
            if (isChrome()) {
              subscriptionData.endpoint = subscriptionData.endpoint.split('/').pop()
              subscriptionData.browser = 'Chrome'
            } else if (isFirefox()) {
              subscriptionData.endpoint = subscriptionData.endpoint.split('/').pop()
              subscriptionData.browser = 'Firefox'
            }
            StorageManager.saveToLSorCookie(PUSH_SUBSCRIPTION_DATA, subscriptionData)
            this.#request.registerToken(subscriptionData)

            if (typeof subscriptionCallback !== 'undefined' && typeof subscriptionCallback === 'function') {
              subscriptionCallback()
            }
            const existingBellWrapper = document.getElementById('bell_wrapper')
            if (existingBellWrapper) {
              existingBellWrapper.parentNode.removeChild(existingBellWrapper)
            }
          }).catch((error) => {
            // unsubscribe from webpush if error
            serviceWorkerRegistration.pushManager.getSubscription().then((subscription) => {
              if (subscription !== null) {
                subscription.unsubscribe().then((successful) => {
                  // You've successfully unsubscribed
                  this.#logger.info('Unsubscription successful')
                  window.clevertap.notifications.push({
                    skipDialog: true
                  })
                }).catch((e) => {
                  // Unsubscription failed
                  this.#logger.error('Error unsubscribing: ' + e)
                })
              }
            })
            this.#logger.error('Error subscribing: ' + error)
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
    let serviceWorkerPath
    let httpsPopupPath
    let httpsIframePath
    let apnsWebPushId
    let apnsWebPushServiceUrl
    const vapidSupportedAndMigrated = isSafari() && ('PushManager' in window) && StorageManager.getMetaProp(VAPID_MIGRATION_PROMPT_SHOWN) && this.#fcmPublicKey !== null

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

    /*
       If it is chrome or firefox and the nativeWebPush is not supported then return
       For Safari the APNs route is open if nativeWebPush is not supported
    */
    if (isChrome() || isFirefox()) {
      if (!this.#isNativeWebPushSupported()) {
        this.#logger.error('Web Push Notification is not supported on this browser')
        return
      }
    }

    if (isSafari() && this.#fcmPublicKey !== null) {
      StorageManager.setMetaProp(VAPID_MIGRATION_PROMPT_SHOWN, true)
    }

    // we check for the cookie in setUpChromeNotifications() the tokens may have changed

    if (!isHTTP) {
      const hasNotification = 'Notification' in window
      if (!hasNotification || Notification == null) {
        this.#logger.error('Notification not supported on this Device or Browser')
        return
      }
      // handle migrations from other services -> chrome notifications may have already been asked for before
      if (Notification.permission === 'granted' && vapidSupportedAndMigrated) {
        // skip the dialog and register
        this.setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl)
        return
      } else if (Notification.permission === 'denied') {
        // we've lost this profile :'(
        return
      }

      if (skipDialog) {
        this.setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl)
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
    if ((StorageManager.getMetaProp(NOTIF_LAST_TIME)) == null) {
      StorageManager.setMetaProp(NOTIF_LAST_TIME, now)
    } else {
      if (askAgainTimeInSeconds == null) {
        // 7 days by default
        askAgainTimeInSeconds = 7 * 24 * 60 * 60
      }

      const notifLastTime = StorageManager.getMetaProp(NOTIF_LAST_TIME)
      if (now - notifLastTime < askAgainTimeInSeconds) {
        if (!isSafari()) {
          return
        }
        if (vapidSupportedAndMigrated) {
          return
        }
      } else {
        StorageManager.setMetaProp(NOTIF_LAST_TIME, now)
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
                  rejectButtonText: rejectButtonText
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
          rejectButtonText: rejectButtonText
        }, (enabled) => { // callback function
          if (enabled) {
            // the user accepted on the dialog box
            if (typeof okCallback === 'function') {
              okCallback()
            }
            this.setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl)
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

  _enableWebPush (enabled, applicationServerKey) {
    $ct.webPushEnabled = enabled
    if (applicationServerKey != null) {
      this.setApplicationServerKey(applicationServerKey)
    }
    if ($ct.webPushEnabled && $ct.notifApi.notifEnabledFromApi) {
      this.#handleNotificationRegistration($ct.notifApi.displayArgs)
    } else if (!$ct.webPushEnabled && $ct.notifApi.notifEnabledFromApi) {
      this.#logger.error('Ensure that web push notifications are fully enabled and integrated before requesting them')
    }
  }
}
