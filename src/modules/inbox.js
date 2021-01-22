import { INBOX_COOKIE_NAME } from '../util/constants'
import { isObjectEmpty, mergeObjects } from '../util/datatypes'
import { StorageManager } from '../util/storage'
import { relativeDateString } from '../util/datetime'

// TODO: update the default button specs.
const defaultInboxProps = {
  background: '#ffffff',
  tags: [],
  position: 'bottom-right',
  boxShadow: '0 0 8px 4px rgba(0,0,0,.16)',
  button: {
    color: '#000000',
    background: '#ffffff',
    iconUrl: 'https://eu1.dashboard.clevertap.com/images/svg/notification-bell.svg'
  },
  header: {
    color: '#000000',
    background: '#ffffff',
    text: 'Notification Center'
  },
  tab: {
    background: '#ffffff',
    color: '#000000aa',
    activeColor: '#000000'
  },
  badge: {
    color: '#ffffff',
    background: '#ff0000'
  }
}

export default class InboxHandler extends Array {
  #oldValues
  #logger
  #isInitialised = false
  #buttonElement
  #divElement
  #isOpen = false
  #unreadCount = 0
  #badgeElement
  #containerElement
  #tag = ''
  #request
  #elementDeleted = false

  get _unreadCount () {
    return this.#unreadCount
  }

  set _unreadCount (value) {
    this.#unreadCount = value
    if (this.#badgeElement) {
      this.#badgeElement.style.display = value > 0 ? 'inline-block' : 'none'
      this.#badgeElement.innerText = value
    }
  }

  constructor ({ logger, request }, values) {
    super()
    this.#logger = logger
    this.#request = request
    this.#oldValues = values
  }

  get #open () {
    return this.#isOpen
  }

  set #open (value) {
    if (this.#divElement) {
      this.#displayInboxMessages()
      this.#divElement.style.display = value ? 'block' : 'none'
    }
    this.#isOpen = value
  }

  push (...displayArgs) {
    this.#setupInbox(displayArgs)
    return 0
  }

  #getInboxMessageObj () {
    let inboxMessageObj = StorageManager.readFromLSorCookie(INBOX_COOKIE_NAME)
    if (!inboxMessageObj) {
      inboxMessageObj = {}
    }
    return inboxMessageObj
  }

  getAllInboxMessages () {
    const inboxMessageObj = this.#getInboxMessageObj()
    const inboxMessages = Object.values(inboxMessageObj)
    return inboxMessages
  }

  getInboxMessageCount () {
    return this.getAllInboxMessages().length
  }

  getUnreadInboxMessages () {
    const inboxMessages = this.getAllInboxMessages()
    return inboxMessages.filter(inbox => !inbox.read)
  }

  getInboxMessageUnreadCount () {
    return this.getUnreadInboxMessages().length
  }

  getInboxMessageForId (inboxId) {
    const inboxMessageObj = this.#getInboxMessageObj()
    return inboxMessageObj[inboxId]
  }

  deleteInboxMessage (inboxId) {
    StorageManager.removeInboxMessagesInLS([inboxId])
  }

  markReadInboxMessage (inboxId) {
    const inboxMessageObj = this.#getInboxMessageObj()
    inboxMessageObj[inboxId].read = true
    StorageManager.updateInboxMessagesInLS(inboxMessageObj)
  }

  pushInboxNotificationViewedEvent (inboxId) {
    const inboxMessageObj = this.#getInboxMessageObj()
    const inbox = inboxMessageObj[inboxId]
    if (inbox) {
      this.#request.incrementImpression(inbox)
    }
  }

  pushInboxNotificationClickedEvent () {
    // TODO: this is yet to be finalised
  }

  _processOldValues () {
    if (this.#oldValues) {
      this.#setupInbox(this.#oldValues)
    }
    this.#oldValues = null
  }

  #setupInbox (displayArgs) {
    if (displayArgs.length > 0 && typeof displayArgs[0] === 'object' && !this.#isInitialised) {
      this.#fetchInboxMessages()
      const inboxProps = mergeObjects(defaultInboxProps, displayArgs[0])
      const selectorId = inboxProps.selector
      this.#buttonElement = document.getElementById(selectorId)
      if (!this.#buttonElement) {
        this.#buttonElement = this.#createButton(inboxProps)
      }
      this.#divElement = this.#createInboxDiv(inboxProps)
      this.#isInitialised = true

      document.body.addEventListener('click', (e) => {
        if (this.#divElement.contains(e.target) || this.#elementDeleted) {
          this.#elementDeleted = false
          return
        }
        if (this.#buttonElement.contains(e.target)) {
          this.#open = !this.#open
          return
        }
        this.#open = false
      })
    }
  }

  #fetchInboxMessages () {
    let inboxMessagesObj = StorageManager.readFromLSorCookie(INBOX_COOKIE_NAME)
    if (!inboxMessagesObj) {
      inboxMessagesObj = {}
    }
    let inboxMessages = Object.values(inboxMessagesObj)
    this._unreadCount = inboxMessages.filter(msg => !msg.read).length

    inboxMessages = inboxMessages.sort((a, b) => b.date - a.date)

    return inboxMessages.filter((inbox) => {
      return inbox.msg && (!this.#tag || (inbox.msg.tags && inbox.msg.tags.some(t => t.toLowerCase() === this.#tag.toLowerCase())))
    })
  }

  #createButton (inboxProps) {
    const buttonProps = inboxProps.button
    const buttonElement = document.createElement('div')
    let buttonCssText = 'box-sizing: border-box; position: fixed; width: 60px; height: 60px; border-radius: 50%; z-index: 2147483640 !important; cursor: pointer;'
    buttonCssText += ` color: ${buttonProps.color}; background-color: ${buttonProps.background}; box-shadow: ${inboxProps.boxShadow}; -webkit-box-shadow: ${inboxProps.boxShadow};`
    if (buttonProps.iconUrl) {
      buttonCssText += ` background-image: url(${buttonProps.iconUrl}); background-repeat: no-repeat; background-position: center;`
    }
    switch (inboxProps.position) {
      case 'top-right':
        buttonCssText += ' top: 30px; right: 30px;'
        break
      case 'top-left':
        buttonCssText += ' top: 30px; left: 30px;'
        break
      case 'bottom-left':
        buttonCssText += ' bottom: 30px; left: 30px;'
        break
      case 'bottom-right':
      default:
        buttonCssText += ' bottom: 30px; right: 30px;'
    }
    buttonElement.style.cssText = buttonCssText

    if (!this.#badgeElement) {
      this.#badgeElement = document.createElement('span')
    }
    this.#badgeElement.innerText = this._unreadCount

    let badgeCss = 'box-sizing: border-box; position: absolute; top: 0px; right: 2px; padding: 2px; border-radius: 9px; min-width: 18px; font-size: 12px; height: 18px; text-align: center;'
    badgeCss += ` color: ${inboxProps.badge.color}; background-color: ${inboxProps.badge.background}; display: ${this._unreadCount > 0 ? 'inline-block' : 'none'};`
    this.#badgeElement.style.cssText = badgeCss

    buttonElement.appendChild(this.#badgeElement)

    return document.body.appendChild(buttonElement)
  }

  #createInboxDiv (inboxProps) {
    const inboxDiv = document.createElement('div')
    const hasTags = inboxProps.tags.length > 0
    inboxDiv.appendChild(this.#createHeader(inboxProps.header, hasTags))
    if (hasTags) {
      inboxDiv.appendChild(this.#createTags(inboxProps))
    }
    let inboxDivCss = 'display: none; position: fixed; width: 375px; max-width: 80%; box-sizing: border-box; border-radius: 4px; z-index: 2147483647 !important;'
    inboxDivCss += ` background-color: ${inboxProps.background}; box-shadow: ${inboxProps.boxShadow}; -webkit-box-shadow: ${inboxProps.boxShadow};`
    switch (inboxProps.position) {
      case 'top-right':
        inboxDivCss += ' top: 100px; right: 30px;'
        break
      case 'top-left':
        inboxDivCss += ' top: 100px; left: 30px;'
        break
      case 'bottom-left':
        inboxDivCss += ' bottom: 100px; left: 30px;'
        break
      case 'bottom-right':
      default:
        inboxDivCss += ' bottom: 100px; right: 30px;'
    }
    inboxDiv.style.cssText = inboxDivCss

    this.#containerElement = document.createElement('div')
    let containerCss = 'box-sizing: border-box; width: 100%; min-height: 200px; max-height: calc(100vh - 230px); max-height: -webkit-calc(100vh - 230px); overflow: auto; position: relative; z-indx: 0;'
    containerCss += ` background-color: ${inboxProps.background}`
    this.#containerElement.style.cssText = containerCss

    inboxDiv.appendChild(this.#containerElement)

    return document.body.appendChild(inboxDiv)
  }

  #createHeader (headerProps, hasTags) {
    const header = document.createElement('div')
    header.innerText = headerProps.text
    let headerCss = 'box-sizing: border-box; width: 100%; min-height: 40px; position: relative; padding: 16px 12px; font-size: 18px; border-radius: 4px 4px 0px 0px; position: relative; z-index: 1;'
    headerCss += ` color: ${headerProps.color}; background-color: ${headerProps.background};`
    if (!hasTags) {
      headerCss += ' box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 1px; -webkit-box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 1px;'
    }
    header.style.cssText = headerCss

    const close = document.createElement('div')
    close.innerText = 'x'
    close.style.cssText = 'font-size: 20px; font-family: sans-serif; position: absolute; right: 12px; top: 14px; cursor: pointer; opacity: 0.5;'

    close.addEventListener('click', () => {
      this.#open = false
    })

    header.appendChild(close)
    return header
  }

  #createTags (inboxProps) {
    const tagContainer = document.createElement('div')
    let tagContainerCss = 'box-sizing: border-box; width: 100%; box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 1px; -webkit-box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 1px; padding: 0px 12px; position: relative; z-index: 1;'
    tagContainerCss += ` background-color: ${inboxProps.tab.background}; color: ${inboxProps.tab.color}`
    tagContainer.style.cssText = tagContainerCss
    const tags = ['All', ...inboxProps.tags]
    const tagElements = []
    for (const tag of tags) {
      const tagElement = document.createElement('div')
      let tagCss = 'display: inline-block; position: relative; padding: 6px; border-bottom: 2px solid transparent; cursor: pointer;'
      tagCss += `background-color: ${inboxProps.tab.background}; color: ${inboxProps.tab.color}`
      tagElement.style.cssText = tagCss
      tagElement.innerText = tag
      tagElement.addEventListener('click', (e) => {
        const activeTagName = e.target.innerText.trim()
        this.#updateActiveTag(tagElements, activeTagName, inboxProps.tab)
      })
      tagElements.push(tagElement)
      tagContainer.appendChild(tagElement)
    }

    tagElements[0].click()

    return tagContainer
  }

  #updateActiveTag (tags, activeTagName, tabProps) {
    for (const tag of tags) {
      if (tag.innerText.trim() === activeTagName) {
        tag.style.color = tabProps.activeColor
        tag.style.borderBottomColor = tabProps.activeColor
      } else {
        tag.style.color = tabProps.color
        tag.style.borderBottomColor = 'transparent'
      }
    }
    this.#tag = activeTagName === 'All' ? '' : activeTagName
    this.#displayInboxMessages()
  }

  #displayInboxMessages () {
    if (!this.#containerElement) {
      // inbox has not been initalised yet
      return
    }
    this.#containerElement.textContent = ''

    const inboxMessages = this.#fetchInboxMessages()

    const bulkActionContainer = document.createElement('div')
    bulkActionContainer.style.cssText = 'box-sizing: border-box; width: 100%; text-align: right; color: #63698F; font-size: 12px; padding: 16px 16px 0px;'

    const bulkActionEnabled = !!inboxMessages.length
    const clearAll = document.createElement('span')
    clearAll.innerText = 'Clear all'
    clearAll.style.cursor = bulkActionEnabled ? 'pointer' : 'default'
    clearAll.style.marginLeft = '12px'

    const readAll = document.createElement('span')
    readAll.innerText = 'Mark all as read'
    readAll.style.cursor = bulkActionEnabled ? 'pointer' : 'default'

    if (bulkActionEnabled) {
      clearAll.onclick = () => {
        const ids = inboxMessages.map(inbox => inbox._id)
        StorageManager.removeInboxMessagesInLS(ids)
        this.#displayInboxMessages()
        this.#elementDeleted = true
      }

      readAll.onclick = () => {
        for (const inbox of inboxMessages) {
          if (!inbox.read) {
            const readBadge = document.getElementById(inbox._id).querySelector('div[data-read-badge]')
            if (readBadge) {
              readBadge.click()
            }
          }
        }
      }
    }

    bulkActionContainer.appendChild(readAll)
    bulkActionContainer.appendChild(clearAll)

    this.#containerElement.appendChild(bulkActionContainer)

    if (inboxMessages.length) {
      let unviewed = false
      for (const inbox of inboxMessages) {
        const msgObj = inbox.msg
        if (!msgObj) {
          continue
        }
        const messageDiv = document.createElement('div')
        messageDiv.id = inbox._id
        messageDiv.setAttribute('data-wzrk_id', inbox.wzrk_id)
        let messageContainerCss = 'box-sizing: border-box; margin: 12px 0px 0px; width: 100%;'
        messageContainerCss += ` background-color: ${msgObj.bg};`
        messageDiv.style.cssText = messageContainerCss

        // In future this could be conditional based on message type
        this.#createIconMessage(messageDiv, inbox)

        this.#containerElement.appendChild(messageDiv)

        if (!inbox.viewed) {
          unviewed = true
          inbox.viewed = true
          this.#request.incrementImpression(inbox)
        }
      }

      // updates viewed
      if (unviewed) {
        StorageManager.updateInboxMessagesInLS(inboxMessages)
      }
    } else {
      const emptyMessageDiv = document.createElement('div')
      const emptyMessageTitle = document.createElement('div')
      emptyMessageTitle.style.cssText = 'font-size: 18px;'
      emptyMessageTitle.innerText = 'No notifications right now'
      const emptyMessageContent = document.createElement('div')
      emptyMessageContent.style.cssText = 'font-size: 14px;'
      const tabbedMessage = this.#tag ? `${this.#tag} notifications will appear here` : 'All your notifications will appear here'
      emptyMessageContent.innerText = tabbedMessage
      emptyMessageDiv.appendChild(emptyMessageTitle)
      emptyMessageDiv.appendChild(emptyMessageContent)
      emptyMessageDiv.style.cssText = 'text-align: center; position: absolute; top: calc(50% - 16px); width: 100%; box-sizing: border-box;'

      this.#containerElement.appendChild(emptyMessageDiv)
    }
  }

  #createIconMessage (container, inboxObj) {
    const msgObj = inboxObj.msg
    const content = msgObj.content && msgObj.content[0]
    if (!content) {
      return
    }
    const firstDiv = document.createElement('div')
    firstDiv.style.cssText = 'box-sizing: border-box; width: 100%; padding: 16px 16px 12px 16px; position: relative;'
    let hasIcon = false
    if (content.icon && content.icon.url) {
      hasIcon = true
      const icon = document.createElement('img')
      icon.src = content.icon.url
      icon.style.cssText = 'width: 32px; height: 32px; display: inline-block; margin-right: 12px;'
      firstDiv.appendChild(icon)
    }
    const contentDiv = document.createElement('div')
    contentDiv.style.cssText = `box-sizing: border-box; width: calc(100% - ${hasIcon ? '81px' : '37px'}); display: inline-block; vertical-align: top;`
    const titleDiv = document.createElement('div')
    titleDiv.innerText = content.title.text
    titleDiv.style.cssText = `font-size: 14px; color: ${content.title.color};`
    contentDiv.appendChild(titleDiv)
    const messageDiv = document.createElement('div')
    messageDiv.innerText = content.message.text
    messageDiv.style.cssText = `font-size: 12px; color: ${content.message.color};`
    contentDiv.appendChild(messageDiv)
    firstDiv.appendChild(contentDiv)

    const clear = document.createElement('div')
    clear.innerText = 'x'
    clear.style.cssText = 'display: inline-block; font-family: sans-serif; color: #63698F; font-size: 16px; margin-right: 8px; width: 16px; box-sizing: border-box; cursor: pointer; position: absolute; top: 16px; text-align: center;'
    firstDiv.appendChild(clear)

    clear.onclick = () => {
      this.#containerElement.removeChild(container)
      this.#elementDeleted = true

      StorageManager.removeInboxMessagesInLS([inboxObj._id])
      this.#displayInboxMessages()
    }

    const readBadge = document.createElement('div')
    readBadge.setAttribute('data-read-badge', true)
    let isRead = !!inboxObj.read
    readBadge.style.cssText = `display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${isRead ? '#D0D2E1' : '#126BFF'}; cursor: pointer; position: absolute; top: 20px; right: 16px;`
    firstDiv.appendChild(readBadge)

    readBadge.onclick = () => {
      isRead = !isRead
      readBadge.style.backgroundColor = isRead ? '#D0D2E1' : '#126BFF'
      inboxObj.read = isRead
      this._unreadCount += isRead ? -1 : 1
      StorageManager.updateInboxMessagesInLS([inboxObj])
    }
    container.appendChild(firstDiv)

    let hasMedia = false
    if (content.media && content.media.url) {
      const media = document.createElement('img')
      media.src = content.media.url
      media.style.cssText = 'box-sizing: border-box; width: 100%; height: auto;'
      container.appendChild(media)
      hasMedia = true
    }

    const dateContainer = document.createElement('div')
    const relativeDate = relativeDateString(inboxObj.date)
    dateContainer.innerText = relativeDate
    dateContainer.style.cssText = `box-sizing: border-box; width: 100%; text-align: right; padding: ${hasMedia ? '12px' : '0px'} 16px 16px 16px; color: #63698F; font-size: 12px;`
    container.appendChild(dateContainer)

    if (content.action && content.action.hasLinks && content.action.links && content.action.links.length) {
      const actionContainer = document.createElement('div')
      actionContainer.style.cssText = 'box-sizing: border-box; width: 100%;'
      const totalLinks = content.action.links.length
      for (const link of content.action.links) {
        this.#createActionButton(link, totalLinks, actionContainer)
      }
      container.appendChild(actionContainer)
    }
  }

  #createActionButton (link, totalCount, container) {
    const action = document.createElement('div')
    const width = 100 / totalCount
    action.innerText = link.text
    action.style.cssText = `box-sizing: border-box; display: inline-block; width: ${width}%; color: ${link.color}; background-color: ${link.bg}; text-align: center; padding: 8px; font-size: 14px; cursor: pointer; position: relative;`
    action.onclick = () => {
      // TODO: click tracking
      if (link.type === 'copy' && link.copyText?.text) {
        const input = document.createElement('input')
        input.type = 'text'
        input.style.cssText = 'width: 1px; height: 1px;'
        input.value = link.copyText.text
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        window.getSelection().removeAllRanges()
        document.body.removeChild(input)

        const copiedTextInfo = document.createElement('div')
        copiedTextInfo.style.cssText = 'position: absolute; top: -20px; left: calc(50% - 60px); width: 120px; z-index: 2147483647; background-color: #4e5a67bd; color: #fff; font-size: 14px; padding: 8px; border-radius: 8px;'
        copiedTextInfo.innerText = 'Copied to clipboard'
        action.appendChild(copiedTextInfo)
        setTimeout(() => {
          action.removeChild(copiedTextInfo)
        }, 3000)
      } else if (link.type === 'url' && link.url?.web?.text) {
        const url = link.url.web.text
        window.location = url
      } else if (link.type === 'kv' && !isObjectEmpty(link.kv)) {
        const event = new CustomEvent('ClevertapInboxActionEvent', {
          detail: link.kv
        })
        document.dispatchEvent(event)
      }
    }
    container.appendChild(action)
  }
}
