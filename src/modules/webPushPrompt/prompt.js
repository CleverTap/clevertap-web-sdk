import { getBellIconStyles, getBoxPromptStyles } from './promptStyles.js'
import { isObject } from '../../util/datatypes.js'
import { WEBPUSH_CONFIG, VAPID_MIGRATION_PROMPT_SHOWN, NEW_SOFT_PROMPT_SELCTOR_ID } from '../../util/constants.js'
import { StorageManager, $ct } from '../../util/storage.js'
import NotificationHandler from '../notification.js'
import { BELL_BASE64, PROMPT_BELL_BASE64 } from './promptConstants.js'
import { isSafari } from '../../util/helpers.js'

let appServerKey = null
let swPath = '/clevertap_sw.js'
let notificationHandler = null
let logger = null
let account = null
let request = null
let displayArgs = null
let fcmPublicKey = null

export const setNotificationHandlerValues = (notificationValues = {}) => {
  logger = notificationValues.logger
  account = notificationValues.account
  request = notificationValues.request
  displayArgs = notificationValues.displayArgs
  fcmPublicKey = notificationValues.fcmPublicKey
}

export const processWebPushConfig = (webPushConfig, logger, request) => {
  const _pushConfig = StorageManager.readFromLSorCookie(WEBPUSH_CONFIG) || {}

  const updatePushConfig = () => {
    $ct.pushConfig = webPushConfig
    StorageManager.saveToLSorCookie(WEBPUSH_CONFIG, webPushConfig)
  }

  if (webPushConfig.isPreview) {
    updatePushConfig()
    enablePush({ logger, request })
  } else if (JSON.stringify(_pushConfig) !== JSON.stringify(webPushConfig)) {
    updatePushConfig()
    try {
      StorageManager.saveToLSorCookie('webPushConfigResponseReceived', true)
      const isNotificationPushCalled = StorageManager.readFromLSorCookie('isNotificationPushCallDeferred')
      if (isNotificationPushCalled) {
        processSoftPrompt()
      }
    } catch (error) {
      logger.error('Failed to process web push config:', error)
      // Fallback: Attempt to process soft prompt anyway
      processSoftPrompt()
    }
  }
}

export const processSoftPrompt = () => {
  const webPushConfig = StorageManager.readFromLSorCookie(WEBPUSH_CONFIG) || {}
  notificationHandler = new NotificationHandler({ logger, session: {}, request, account })

  if (!(Object.keys(webPushConfig).length > 0)) {
    notificationHandler.setApplicationServerKey(appServerKey)
    notificationHandler.setupWebPush(displayArgs)
    return
  }
  const { showBox, showBellIcon, boxType } = webPushConfig

  const { serviceWorkerPath, skipDialog, okCallback, subscriptionCallback, rejectCallback, apnsWebPushId, apnsWebPushServiceUrl } = parseDisplayArgs(displayArgs)
  const isSoftPromptNew = showBellIcon || (showBox && boxType === 'new')

  if (isSoftPromptNew) {
    const enablePushParams = {
      serviceWorkerPath,
      skipDialog,
      okCallback,
      subscriptionCallback,
      rejectCallback,
      logger,
      request,
      account,
      fcmPublicKey,
      apnsWebPushId,
      apnsWebPushServiceUrl
    }
    enablePush(enablePushParams)
  }

  if (showBox && boxType === 'old') {
    notificationHandler.setApplicationServerKey(appServerKey)
    notificationHandler.setupWebPush(displayArgs)
  }
  StorageManager.saveToLSorCookie('isNotificationPushCallDeferred', false)
  StorageManager.saveToLSorCookie('applicationServerKeyReceived', false)
}

export const parseDisplayArgs = (displayArgs) => {
  if (displayArgs.length === 1 && isObject(displayArgs[0])) {
    const { serviceWorkerPath, skipDialog, okCallback, subscriptionCallback, rejectCallback, apnsWebPushServiceUrl, apnsWebPushId } = displayArgs[0]
    return { serviceWorkerPath, skipDialog, okCallback, subscriptionCallback, rejectCallback, apnsWebPushServiceUrl, apnsWebPushId }
  }

  return {
    serviceWorkerPath: undefined,
    skipDialog: displayArgs[5],
    okCallback: undefined,
    subscriptionCallback: undefined,
    rejectCallback: undefined,
    apnsWebPushServiceUrl: undefined,
    apnsWebPushId: undefined
  }
}

export const enablePush = (enablePushParams) => {
  const {
    serviceWorkerPath: customSwPath, okCallback, subscriptionCallback, rejectCallback,
    logger, fcmPublicKey, apnsWebPushId, apnsWebPushServiceUrl
  } = enablePushParams
  let { skipDialog } = enablePushParams
  const _pushConfig = StorageManager.readFromLSorCookie(WEBPUSH_CONFIG) || {}
  $ct.pushConfig = _pushConfig
  if (!$ct.pushConfig) {
    logger.error('Web Push config data not present')
    return
  }

  if (customSwPath) { swPath = customSwPath }

  if (skipDialog === null) {
    skipDialog = false
  }

  // notificationHandler = new NotificationHandler({ logger, session: {}, request, account })
  if (skipDialog) {
    notificationHandler.setApplicationServerKey(appServerKey)
    notificationHandler.setUpWebPushNotifications(subscriptionCallback, swPath, apnsWebPushId, apnsWebPushServiceUrl)
    return
  }

  const { showBox, boxType, showBellIcon, isPreview } = $ct.pushConfig

  if (isPreview) {
    if ($ct.pushConfig.boxConfig) createNotificationBox($ct.pushConfig, fcmPublicKey)
    if ($ct.pushConfig.bellIconConfig) createBellIcon($ct.pushConfig)
  } else {
    if (showBox && boxType === 'new') createNotificationBox($ct.pushConfig, fcmPublicKey, okCallback, subscriptionCallback, rejectCallback, apnsWebPushId, apnsWebPushServiceUrl)
    if (showBellIcon) createBellIcon($ct.pushConfig, subscriptionCallback, apnsWebPushId, apnsWebPushServiceUrl)
  }
}

const createElementWithAttributes = (tag, attributes = {}) => {
  const element = document.createElement(tag)
  Object.entries(attributes).forEach(([key, value]) => {
    element[key] = value
  })
  return element
}

export const createNotificationBox = (configData, fcmPublicKey, okCallback, subscriptionCallback, rejectCallback, apnsWebPushId, apnsWebPushServiceUrl) => {
  if (document.getElementById(NEW_SOFT_PROMPT_SELCTOR_ID)) return

  const { boxConfig: { content, style } } = configData

  // Create the wrapper div
  const wrapper = createElementWithAttributes('div', { id: NEW_SOFT_PROMPT_SELCTOR_ID })
  const overlayDiv = createElementWithAttributes('div', { id: 'pnOverlay' })
  const pnCard = createElementWithAttributes('div', { id: 'pnCard' })

  const iconTitleDescWrapper = createElementWithAttributes('div', { id: 'iconTitleDescWrapper' })
  const iconContainer = createElementWithAttributes('img', {
    id: 'iconContainer',
    src: content.icon.type === 'default' ? `data:image/svg+xml;base64,${PROMPT_BELL_BASE64}` : content.icon.url
  })

  iconTitleDescWrapper.appendChild(iconContainer)

  const titleDescWrapper = createElementWithAttributes('div', { id: 'titleDescWrapper' })
  titleDescWrapper.appendChild(createElementWithAttributes('div', { id: 'title', textContent: content.title }))
  titleDescWrapper.appendChild(createElementWithAttributes('div', { id: 'description', textContent: content.description }))

  iconTitleDescWrapper.appendChild(titleDescWrapper)

  const buttonsContainer = createElementWithAttributes('div', { id: 'buttonsContainer' })

  const primaryButton = createElementWithAttributes('button', {
    id: 'primaryButton',
    textContent: content.buttons.primaryButtonText
  })
  const secondaryButton = createElementWithAttributes('button', {
    id: 'secondaryButton',
    textContent: content.buttons.secondaryButtonText
  })
  buttonsContainer.appendChild(secondaryButton)
  buttonsContainer.appendChild(primaryButton)

  pnCard.appendChild(iconTitleDescWrapper)
  pnCard.appendChild(buttonsContainer)

  // Apply styles
  const styleElement = createElementWithAttributes('style', { textContent: getBoxPromptStyles(style) })

  wrapper.appendChild(styleElement)
  wrapper.appendChild(pnCard)
  wrapper.appendChild(overlayDiv)

  setElementPosition(pnCard, style.card.position)

  if (!configData.isPreview) {
    if ('Notification' in window && Notification !== null) {
      if (Notification.permission === 'granted') {
        notificationHandler.setApplicationServerKey(appServerKey)
        notificationHandler.setUpWebPushNotifications(subscriptionCallback, swPath, apnsWebPushId, apnsWebPushServiceUrl)
        return
      } else if (Notification.permission === 'denied') {
        return
      }
    }
  }

  const now = new Date().getTime() / 1000
  const lastNotifTime = StorageManager.getMetaProp('webpush_last_notif_time')
  const popupFrequency = content.popupFrequency || 7 // number of days
  const shouldShowNotification = !lastNotifTime || now - lastNotifTime >= popupFrequency * 24 * 60 * 60

  if (shouldShowNotification) {
    document.body.appendChild(wrapper)
    if (!configData.isPreview) {
      StorageManager.setMetaProp('webpush_last_notif_time', now)
      addEventListeners(wrapper, okCallback, subscriptionCallback, rejectCallback, apnsWebPushId, apnsWebPushServiceUrl)
      if (isSafari() && 'PushManager' in window && fcmPublicKey != null) {
        StorageManager.setMetaProp(VAPID_MIGRATION_PROMPT_SHOWN, true)
      }
    }
  } else {
    if (isSafari()) {
      // This is for migration case for safari from apns to vapid, show popup even when timer is not expired.
      const vapidSupportedAndNotMigrated = ('PushManager' in window) && !StorageManager.getMetaProp(VAPID_MIGRATION_PROMPT_SHOWN) && fcmPublicKey !== null
      if (vapidSupportedAndNotMigrated) {
        document.body.appendChild(wrapper)
        if (!configData.isPreview) {
          addEventListeners(wrapper, okCallback, subscriptionCallback, rejectCallback, apnsWebPushId, apnsWebPushServiceUrl)
          StorageManager.setMetaProp('webpush_last_notif_time', now)
          StorageManager.setMetaProp(VAPID_MIGRATION_PROMPT_SHOWN, true)
        }
      }
    }
  }
}

export const createBellIcon = (configData, subscriptionCallback, apnsWebPushId, apnsWebPushServiceUrl) => {
  if (document.getElementById('bell_wrapper') || Notification.permission === 'granted') return

  const { bellIconConfig: { content, style } } = configData

  const bellWrapper = createElementWithAttributes('div', { id: 'bell_wrapper' })
  const bellIcon = createElementWithAttributes('img', {
    id: 'bell_icon',
    src: content.icon.type === 'default' ? `data:image/svg+xml;base64,${BELL_BASE64}` : content.icon.url
  })

  // For playing gif
  const gifModal = createElementWithAttributes('div', { id: 'gif_modal', style: 'display: none;' })
  const gifImage = createElementWithAttributes('img', {
    id: 'gif_image',
    src: 'https://d2r1yp2w7bby2u.cloudfront.net/js/permission_grant.gif'
  })
  const closeModal = createElementWithAttributes('div', { id: 'close_modal', innerHTML: '&times;' })

  gifModal.appendChild(gifImage)
  gifModal.appendChild(closeModal)

  bellWrapper.appendChild(bellIcon)
  bellWrapper.appendChild(gifModal)
  if (content.hoverText.enabled) {
    const tooltip = createElementWithAttributes('div', {
      id: 'bell_tooltip',
      textContent: content.hoverText.text
    })
    bellWrapper.appendChild(tooltip)
  }

  setElementPosition(bellWrapper, style.card.position)
  // Apply styles
  const styleElement = createElementWithAttributes('style', { textContent: getBellIconStyles(style) })

  document.head.appendChild(styleElement)
  document.body.appendChild(bellWrapper)

  if (!configData.isPreview) {
    addBellEventListeners(bellWrapper, subscriptionCallback, apnsWebPushId, apnsWebPushServiceUrl)
  }
  return bellWrapper
}

export const setServerKey = (serverKey) => {
  appServerKey = serverKey
}

export const addEventListeners = (wrapper, okCallback, subscriptionCallback, rejectCallback, apnsWebPushId, apnsWebPushServiceUrl) => {
  const primaryButton = wrapper.querySelector('#primaryButton')
  const secondaryButton = wrapper.querySelector('#secondaryButton')

  const removeWrapper = () => wrapper.parentNode?.removeChild(wrapper)

  primaryButton.addEventListener('click', () => {
    removeWrapper()
    notificationHandler.setApplicationServerKey(appServerKey)
    notificationHandler.setUpWebPushNotifications(subscriptionCallback, swPath, apnsWebPushId, apnsWebPushServiceUrl)
    if (typeof okCallback === 'function') {
      okCallback()
    }
  })

  secondaryButton.addEventListener('click', () => {
    removeWrapper()
    if (typeof rejectCallback === 'function') {
      rejectCallback()
    }
  })
}

export const addBellEventListeners = (bellWrapper, subscriptionCallback, apnsWebPushId, apnsWebPushServiceUrl) => {
  const bellIcon = bellWrapper.querySelector('#bell_icon')
  bellIcon.addEventListener('click', () => {
    if (Notification.permission === 'denied') {
      toggleGifModal(bellWrapper)
    } else {
      notificationHandler.setApplicationServerKey(appServerKey)
      notificationHandler.setUpWebPushNotifications(subscriptionCallback, swPath, apnsWebPushId, apnsWebPushServiceUrl)
      if (Notification.permission === 'granted') {
        bellWrapper.remove()
      }
    }
  })
  bellIcon.addEventListener('mouseenter', () => displayTooltip(bellWrapper))
  bellIcon.addEventListener('mouseleave', () => clearTooltip(bellWrapper))
  bellWrapper.querySelector('#close_modal').addEventListener('click', () => toggleGifModal(bellWrapper))
}

export const setElementPosition = (element, position) => {
  Object.assign(element.style, {
    inset: 'auto',
    transform: 'none'
  })

  const positions = {
    'Top Right': { inset: '16px 16px auto auto' },
    'Top Left': { inset: '16px auto auto 16px' },
    'Bottom Right': { inset: 'auto 16px 16px auto' },
    'Bottom Left': { inset: 'auto auto 16px 16px' },
    Center: { inset: '50%', transform: 'translate(-50%, -50%)' },
    Top: { inset: '16px auto auto 50%', transform: 'translateX(-50%)' },
    Bottom: { inset: 'auto auto 16px 50%', transform: 'translateX(-50%)' }
  }

  Object.assign(element.style, positions[position] || positions['top-right'])
}

const displayTooltip = (bellWrapper) => {
  const gifModal = bellWrapper.querySelector('#gif_modal')
  if (gifModal.style.display === 'flex') {
    return
  }
  const tooltip = bellWrapper.querySelector('#bell_tooltip')
  if (tooltip) {
    tooltip.style.display = 'flex'
  }

  const bellIcon = bellWrapper.querySelector('#bell_icon')
  const bellRect = bellIcon.getBoundingClientRect()
  var midX = window.innerWidth / 2
  var midY = window.innerHeight / 2
  bellWrapper.style['flex-direction'] = bellRect.y > midY ? 'column-reverse' : 'column'
  bellWrapper.style['align-items'] = bellRect.x > midX ? 'flex-end' : 'flex-start'
}

const clearTooltip = (bellWrapper) => {
  const tooltip = bellWrapper.querySelector('#bell_tooltip')
  if (tooltip) {
    tooltip.style.display = 'none'
  }
}

const toggleGifModal = (bellWrapper) => {
  clearTooltip(bellWrapper)
  const gifModal = bellWrapper.querySelector('#gif_modal')
  gifModal.style.display = gifModal.style.display === 'none' ? 'flex' : 'none'
}
