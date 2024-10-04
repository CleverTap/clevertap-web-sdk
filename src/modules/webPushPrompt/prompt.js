import { getBellIconStyles, getBoxPromptStyles } from './promptStyles.js'
import { WEBPUSH_CONFIG } from '../../util/constants.js'
import { StorageManager, $ct } from '../../util/storage.js'
import NotificationHandler from '../notification.js'

export const processWebPushConfig = (webPushConfig, logger, request) => {
  const _pushConfig = StorageManager.readFromLSorCookie(WEBPUSH_CONFIG) || {}
  if (webPushConfig.isPreview) {
    $ct.pushConfig = webPushConfig
    enablePush(logger, null, request)
  } else if (JSON.stringify(_pushConfig) !== JSON.stringify(webPushConfig)) {
    $ct.pushConfig = webPushConfig
    StorageManager.saveToLSorCookie(WEBPUSH_CONFIG, webPushConfig)
  }
}

export const enablePush = (logger, account, request) => {
  const _pushConfig = StorageManager.readFromLSorCookie(WEBPUSH_CONFIG) || {}
  $ct.pushConfig = _pushConfig
  if (!$ct.pushConfig) {
    logger.error('Web Push config data not present')
    return
  }

  const notificationHandler = new NotificationHandler({ logger, session: {}, request, account })
  const { showBox, boxType, showBellIcon } = $ct.pushConfig

  if ($ct.pushConfig.isPreview) {
    createNotificationBox($ct.pushConfig)
  }
  if (showBox && boxType === 'new') {
    createNotificationBox($ct.pushConfig, notificationHandler)
  }
  if (showBellIcon) {
    createBellIcon($ct.pushConfig, notificationHandler)
  }
}

const createElementWithAttributes = (tag, attributes = {}) => {
  const element = document.createElement(tag)
  Object.entries(attributes).forEach(([key, value]) => {
    element[key] = value
  })
  return element
}

export const createNotificationBox = (configData, notificationhandler) => {
  if (document.getElementById('pnWrapper')) return

  const { boxConfig } = configData
  const { content, style } = boxConfig

  // Create the wrapper div
  const wrapper = createElementWithAttributes('div', { id: 'pnWrapper' })
  const overlayDiv = createElementWithAttributes('div', { id: 'pnOverlay' })
  const pnCard = createElementWithAttributes('div', { id: 'pnCard' })

  const iconTitleDescWrapper = createElementWithAttributes('div', { id: 'iconTitleDescWrapper' })
  const iconContainer = createElementWithAttributes('div', { id: 'iconContainer' })
  const imgElement = createElementWithAttributes('img', {
    id: 'imgElement',
    src: content.icon.type === 'default' ? `data:image/svg+xml;base64,${promptBellBase64}` : content.icon.url
  })

  iconContainer.appendChild(imgElement)
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

  const now = new Date().getTime() / 1000
  const lastNotifTime = StorageManager.getMetaProp('webpush_last_notif_time')
  const popupFrequency = content.popupFrequency || 7 * 24 * 60 * 60

  if (!lastNotifTime || now - lastNotifTime >= popupFrequency * 24 * 60 * 60) {
    document.body.appendChild(wrapper)
    if (!configData.isPreview) { addEventListeners(wrapper, notificationhandler) }
  }
}

export const createBellIcon = (configData, notificationhandler) => {
  if (document.getElementById('bell_wrapper')) return

  if (Notification.permission === 'granted') {
    return
  }
  const { bellIconConfig } = configData
  const { content, style } = bellIconConfig

  const bellWrapper = createElementWithAttributes('div', { id: 'bell_wrapper' })
  const bellIcon = createElementWithAttributes('img', {
    id: 'bell_icon',
    src: content.icon.type === 'default' ? `data:image/svg+xml;base64,${bellBase64}` : content.icon.url
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

  setElementPosition(bellWrapper, bellIconConfig.style.card.position)
  // Apply styles
  const styleElement = createElementWithAttributes('style', { textContent: getBellIconStyles(style) })

  document.head.appendChild(styleElement)
  document.body.appendChild(bellWrapper)

  addBellEventListeners(bellWrapper, notificationhandler)
  return bellWrapper
}

let appServerKey = null
export const setServerKey = (serverKey) => {
  appServerKey = serverKey
}

export const addEventListeners = (wrapper, notificationhandler) => {
  const primaryButton = wrapper.querySelector('#primaryButton')
  const secondaryButton = wrapper.querySelector('#secondaryButton')

  const removeWrapper = () => wrapper.parentNode?.removeChild(wrapper)

  primaryButton.addEventListener('click', () => {
    removeWrapper()
    notificationhandler.setApplicationServerKey(appServerKey)
    notificationhandler.setUpWebPushNotifications(null, '/clevertap_sw.js', null, null)
  })

  secondaryButton.addEventListener('click', () => {
    const now = new Date().getTime() / 1000
    StorageManager.setMetaProp('webpush_last_notif_time', now)
    removeWrapper()
  })
}

export const addBellEventListeners = (bellWrapper, notificationhandler) => {
  const removeBellWrapper = () => bellWrapper.parentNode?.removeChild(bellWrapper)

  const bellIcon = bellWrapper.querySelector('#bell_icon')
  bellIcon.addEventListener('click', () => {
    if (Notification.permission === 'denied') {
      toggleGifModal(bellWrapper)
    } else {
      notificationhandler.setApplicationServerKey(appServerKey)
      notificationhandler.setUpWebPushNotifications(null, '/clevertap_sw.js', null, null)
      if (Notification.permission === 'granted') {
        console.log('Granted')
        removeBellWrapper()
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

export const bellBase64 = 'PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMi40OTYyIDUuMjQzOTVDMTIuODM5MSA1LjAzMzE3IDEzLjI4NDcgNS4xNDY4OSAxMy40OTczIDUuNDg4NjdDMTMuNzIyMyA1Ljg1MDE4IDEzLjYwMDIgNi4zMjUxOCAxMy4yMzggNi41NDkwMkM3LjM5Mzk5IDEwLjE2MDYgMy41IDE2LjYyNTcgMy41IDI0LjAwMDNDMy41IDM1LjMyMjEgMTIuNjc4MiA0NC41MDAzIDI0IDQ0LjUwMDNDMjguMDA1NSA0NC41MDAzIDMxLjc0MjYgNDMuMzUxNSAzNC45IDQxLjM2NTVDMzUuMjYwOCA0MS4xMzg1IDM1Ljc0MTYgNDEuMjM4NiAzNS45NjY4IDQxLjYwMDZDMzYuMTc5MiA0MS45NDE5IDM2LjA4NSA0Mi4zOTExIDM1Ljc0NTIgNDIuNjA2QzMyLjM0NjggNDQuNzU1OSAyOC4zMTg3IDQ2LjAwMDMgMjQgNDYuMDAwM0MxMS44NDk3IDQ2LjAwMDMgMiAzNi4xNTA1IDIgMjQuMDAwM0MyIDE2LjA2NjkgNi4xOTkyMSA5LjExNDMyIDEyLjQ5NjIgNS4yNDM5NVpNMzguOCAzOS45MDAzQzM4LjggNDAuMzk3MyAzOC4zOTcxIDQwLjgwMDMgMzcuOSA0MC44MDAzQzM3LjQwMjkgNDAuODAwMyAzNyA0MC4zOTczIDM3IDM5LjkwMDNDMzcgMzkuNDAzMiAzNy40MDI5IDM5LjAwMDMgMzcuOSAzOS4wMDAzQzM4LjM5NzEgMzkuMDAwMyAzOC44IDM5LjQwMzIgMzguOCAzOS45MDAzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yNCAxMkMyMi44OTU0IDEyIDIyIDEyLjg5NTQgMjIgMTRWMTQuMjUyQzE4LjU0OTUgMTUuMTQwMSAxNiAxOC4yNzIzIDE2IDIyVjI5LjVIMTUuNDc2OUMxNC42NjEyIDI5LjUgMTQgMzAuMTYxMiAxNCAzMC45NzY5VjMxLjAyMzFDMTQgMzEuODM4OCAxNC42NjEyIDMyLjUgMTUuNDc2OSAzMi41SDMyLjUyMzFDMzMuMzM4OCAzMi41IDM0IDMxLjgzODggMzQgMzEuMDIzMVYzMC45NzY5QzM0IDMwLjE2MTIgMzMuMzM4OCAyOS41IDMyLjUyMzEgMjkuNUgzMlYyMkMzMiAxOC4yNzIzIDI5LjQ1MDUgMTUuMTQwMSAyNiAxNC4yNTJWMTRDMjYgMTIuODk1NCAyNS4xMDQ2IDEyIDI0IDEyWk0yNiAzNFYzMy41SDIyVjM0QzIyIDM1LjEwNDYgMjIuODk1NCAzNiAyNCAzNkMyNS4xMDQ2IDM2IDI2IDM1LjEwNDYgMjYgMzRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
export const promptBellBase64 = 'PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiMwMEFFQjkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zMS45OTg2IDIwQzMwLjkxOTggMjAgMzAuMDQyOCAyMC44NzQ2IDMwLjA0MjggMjEuOTUzNEwzMC4wNDI5IDIxLjk3MzRDMjYuNTQzNCAyMi41NTM1IDIzLjg3NSAyNS41OTQzIDIzLjg3NSAyOS4yNTgyVjM4LjA5OTVIMjMuODczNUMyMy4wNTg5IDM4LjA5OTUgMjIuMzk4NCAzOC43NiAyMi4zOTg0IDM5LjU3NDZDMjIuMzk4NCA0MC4zODkzIDIzLjA1ODkgNDEuMDQ5NyAyMy44NzM1IDQxLjA0OTdIMjkuNzgxMlY0MS43ODQyQzI5Ljc4MTIgNDMuMDA3NyAzMC43NzMxIDQzLjk5OTYgMzEuOTk2NiA0My45OTk2QzMzLjIyMDIgNDMuOTk5NiAzNC4yMTIgNDMuMDA3NyAzNC4yMTIgNDEuNzg0MlY0MS4wNDk3SDQwLjEyMzNDNDAuOTM4IDQxLjA0OTcgNDEuNTk4NCA0MC4zODkzIDQxLjU5ODQgMzkuNTc0NkM0MS41OTg0IDM4Ljc2IDQwLjkzOCAzOC4wOTk1IDQwLjEyMzMgMzguMDk5NUg0MC4xMjEyVjI5LjI1ODJDNDAuMTIxMiAyNS41OTQ2IDM3LjQ1MzMgMjIuNTU0MiAzMy45NTQzIDIxLjk3MzZMMzMuOTU0NCAyMS45NTM0QzMzLjk1NDQgMjAuODc0NiAzMy4wNzc1IDIwIDMxLjk5ODYgMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCBvcGFjaXR5PSIwLjUiIHg9IjcuNSIgeT0iNy41IiB3aWR0aD0iNDkiIGhlaWdodD0iNDkiIHJ4PSIyNC41IiBzdHJva2U9IndoaXRlIi8+CjxyZWN0IG9wYWNpdHk9IjAuMyIgeD0iNC41IiB5PSI0LjUiIHdpZHRoPSI1NSIgaGVpZ2h0PSI1NSIgcng9IjI3LjUiIHN0cm9rZT0id2hpdGUiLz4KPHJlY3Qgb3BhY2l0eT0iMC44IiB4PSIxMC41IiB5PSIxMC41IiB3aWR0aD0iNDMiIGhlaWdodD0iNDMiIHJ4PSIyMS41IiBzdHJva2U9IndoaXRlIi8+Cjwvc3ZnPgo='
