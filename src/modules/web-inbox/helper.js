import { StorageManager, $ct } from '../../util/storage'
import { Inbox } from './WebInbox'
import { Message } from './Message'
import { WEBINBOX_CONFIG } from '../../util/constants'

export const processWebInboxSettings = (webInboxSetting, isPreview = false) => {
  const _settings = StorageManager.readFromLSorCookie(WEBINBOX_CONFIG) || {}
  if (isPreview) {
    $ct.inbox.inboxConfigForPreview = webInboxSetting
    $ct.inbox.isPreview = true
    $ct.inbox && $ct.inbox.init()
  } else if (JSON.stringify(_settings) !== JSON.stringify(webInboxSetting)) {
    StorageManager.saveToLSorCookie(WEBINBOX_CONFIG, webInboxSetting)
    $ct.inbox && $ct.inbox.init()
  }
}

export const processInboxNotifs = (msg) => {
  if (msg.inbox_preview) {
    $ct.inbox.incomingMessagesForPreview = msg.inbox_notifs
  } else {
    $ct.inbox.incomingMessages = msg.inbox_notifs
  }
}

export const processWebInboxResponse = (msg) => {
  if (msg.webInboxSetting) {
    processWebInboxSettings(msg.webInboxSetting, msg.inbox_preview)
  }
  if (msg.inbox_notifs != null) {
    processInboxNotifs(msg)
  }
}

export const addWebInbox = (logger) => {
  checkAndRegisterWebInboxElements()
  $ct.inbox = new Inbox({ logger })
  document.body.appendChild($ct.inbox)
}

export const initializeWebInbox = (logger) => {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      addWebInbox(logger)
      resolve()
    } else {
      window.addEventListener('load', () => {
        /**
         * We need this null check here because $ct.inbox could be initialised via init method too on document load.
         * In that case we don't need to call addWebInbox method
         */
        if ($ct.inbox === null) {
          addWebInbox(logger)
        }
        resolve()
      })
    }
  })
}

export const checkAndRegisterWebInboxElements = () => {
  if (customElements.get('ct-web-inbox') === undefined) {
    customElements.define('ct-web-inbox', Inbox)
    customElements.define('ct-inbox-message', Message)
  }
}

// TODO - add more comments?
export const getInboxPosition = (e, inboxHeight, inboxWidth) => {
  const horizontalScroll = document.scrollingElement.scrollLeft
  const verticalScroll = document.scrollingElement.scrollTop
  const windowWidth = window.innerWidth + horizontalScroll
  const windowHeight = window.innerHeight + verticalScroll
  const selectorRect = e.target.getBoundingClientRect()
  const selectorX = selectorRect.x + horizontalScroll
  const selectorY = selectorRect.y + verticalScroll
  const selectorLeft = selectorRect.left + horizontalScroll
  const selectorRight = selectorRect.right + horizontalScroll
  const selectorTop = selectorRect.top + verticalScroll
  const selectorBottom = selectorRect.bottom + verticalScroll
  const selectorHeight = selectorRect.height
  const selectorWidth = selectorRect.width
  const selectorCenter = {
    x: selectorX + (selectorWidth / 2),
    y: selectorY + (selectorHeight / 2)
  }
  const halfOfInboxHeight = (inboxHeight / 2)
  const halfOfInboxWidth = (inboxWidth / 2)
  let inboxOnSide = false

  let xPos, yPos

  const padding = 16

  /**
   * y co-ordinates:
   * Try to push the card downwards
   * if that's not possible, push it upwards
   * if that too is not possible, then the card will be placed on the side. Add some padding.
   *
   * x co-ordinates:
   * If the card is on the side,
   *    try to place it to the right. If it's not possible,
   *    place it to the left
   * If the card is either on top/ bottom, set the x co-ordinate such that the selector center and the inbox card center become the same
   * Now,
   *  if the left of the inbox card is < 0,
   *    try to get the left aligned to the selectorLeft.
   *    if that's not possible, simply set left to 0
   *  if the right of the inbox card > windowWidth,
   *    try to get the right of rhe inbox card aligned with the selectorRight
   *    if that's not possible, simply set the inbox right to the window Right
   */
  if (selectorBottom + inboxHeight <= windowHeight) { // try to place the card down
    const availableHeight = windowHeight - (selectorBottom + inboxHeight)
    yPos = availableHeight >= padding ? selectorBottom + padding : selectorBottom + availableHeight
  } else if (selectorTop - inboxHeight >= verticalScroll) { // try to place the card up
    const availableHeight = selectorTop - inboxHeight
    yPos = availableHeight >= padding ? selectorTop - inboxHeight - padding : selectorTop - inboxHeight - availableHeight
  } else {
    inboxOnSide = true
    yPos = selectorCenter.y - halfOfInboxHeight // with this the y co-ordinate of the selector center and the inbox card center become the same
    if (yPos < verticalScroll) {
      yPos = verticalScroll
    } else if (yPos + inboxHeight > windowHeight) {
      yPos = windowHeight - inboxHeight
    }
  }

  if (inboxOnSide) {
    // See if we can place the card to the right of the selector
    const inboxRight = selectorRight + inboxWidth
    if (inboxRight <= windowWidth) {
      const availableWidth = inboxRight + padding <= windowWidth ? padding : windowWidth - inboxRight
      xPos = selectorRight + availableWidth
    } else {
      const inboxLeft = selectorLeft - inboxWidth
      const availableWidth = inboxLeft - padding >= horizontalScroll ? padding : inboxLeft - horizontalScroll
      xPos = inboxLeft - availableWidth
    }
  } else {
    xPos = selectorCenter.x - halfOfInboxWidth
    if (xPos < horizontalScroll) {
      if (selectorLeft + inboxWidth <= windowWidth) {
        xPos = selectorLeft
      } else {
        xPos = horizontalScroll
      }
    } else if (xPos + inboxWidth > windowWidth) {
      if (selectorRight - inboxWidth >= horizontalScroll) {
        xPos = selectorRight - inboxWidth
      } else {
        xPos = windowWidth - inboxWidth
      }
    }
  }

  return { xPos, yPos }
}

export const determineTimeStampText = (ts) => {
  const now = Date.now()
  let diff = Math.floor((now - ts) / 60000)
  if (diff < 5) {
    return 'Just now'
  }
  if (diff < 60) {
    return `${diff} minute${diff > 1 ? 's' : ''} ago`
  }
  diff = Math.floor(diff / 60)
  if (diff < 24) {
    return `${diff} hour${diff > 1 ? 's' : ''} ago`
  }
  diff = Math.floor(diff / 24)
  return `${diff} day${diff > 1 ? 's' : ''} ago`
}

export const hasWebInboxSettingsInLS = () => {
  return Object.keys(StorageManager.readFromLSorCookie(WEBINBOX_CONFIG) || {}).length > 0
}

export const arrowSvg = `<svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0.258435 9.74751C-0.0478584 9.44825 -0.081891 8.98373 0.156337 8.64775L0.258435 8.52836L3.87106 5L0.258435 1.47164C-0.0478588 1.17239 -0.0818914 0.707867 0.156337 0.371887L0.258435 0.252494C0.564728 -0.0467585 1.04018 -0.0800085 1.38407 0.152743L1.50627 0.252494L5.74156 4.39042C6.04786 4.68968 6.08189 5.1542 5.84366 5.49018L5.74156 5.60957L1.50627 9.74751C1.16169 10.0842 0.603015 10.0842 0.258435 9.74751Z" fill="#63698F"/>
</svg>
`
export const greenTickSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8ZM9.6839 5.93602C9.97083 5.55698 10.503 5.48833 10.8725 5.78269C11.2135 6.0544 11.2968 6.54044 11.0819 6.91173L11.0219 7.00198L8.09831 10.864C7.80581 11.2504 7.26654 11.3086 6.90323 11.0122L6.82822 10.9433L5.04597 9.10191C4.71635 8.76136 4.71826 8.21117 5.05023 7.87303C5.35666 7.5609 5.83722 7.53855 6.16859 7.80482L6.24814 7.87739L7.35133 9.01717L9.6839 5.93602Z" fill="#03A387"/>
</svg>
`
