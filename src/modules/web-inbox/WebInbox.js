import { Message } from './Message'

import { inboxContainerStyles } from './inboxStyles'
import { getInboxMessagesFromLS, saveInboxMessagesToLS, getConfigurationFromLS } from './storeUtilities'
import { getInboxPosition, determineTimeStampText } from './helper'

export class Inbox extends HTMLElement {
  constructor (logger) {
    super()
    this.logger = logger
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  noConfigFound = false

  isInboxOpen = false
  categories = []
  selectedCategory = null
  messagesToBeAdded = []
  unviewedMessages = {}
  unviewedCounter = 0

  // dom references
  inboxSelector = null
  inbox = null
  emptyInboxMsg = null
  inboxCard = null
  unviewedBadge = null
  observer = null

  get incomingMessages () {
    return []
  }

  set incomingMessages (msgs = []) {
    if (msgs.length > 0 && this.inbox !== null) {
      this.updateInboxMessagesInLS(msgs)
    }
  }

  connectedCallback () {
    this.init()
  }

  init () {
    this.config = getConfigurationFromLS()
    this.inboxSelector = document.getElementById(this.config.inboxSelector)
    if (this.inboxSelector === null || Object.keys(this.config).length === 0) {
      return
    }

    this.addUnviewedBadge()
    this.createinbox()

    document.removeEventListener('click', this.addClickListenerOnDocument)
    // check if this works when the selector changes
    document.addEventListener('click', this.addClickListenerOnDocument)

    this.shadow.innerHTML = this.getInboxStyles()
    this.shadow.appendChild(this.inbox)
  }

  addMsgsToInboxFromLS () {
    const messages = this.fetchUnexpiredInboxMessages()
    this.messagesToBeAdded = []
    Object.keys(messages).forEach((m) => {
      this.messagesToBeAdded.push(m)
      if (!messages[m].viewed) {
        this.unviewedMessages[m] = messages[m]
        this.unviewedCounter++
      }
    })
    this.buildUIForMessages(messages)
    this.updateUnviewedBadgeCounter(this.unviewedCounter)
  }

  fetchUnexpiredInboxMessages () {
    let messages = getInboxMessagesFromLS(this.WEB_INBOX)
    const now = Math.floor(Date.now() / 1000)
    for (const msg in messages) {
      if (messages[msg].wzrk_ttl && messages[msg].wzrk_ttl > 0 && messages[msg].wzrk_ttl < now) {
        const el = this.shadowRoot.getElementById(messages[msg].id)
        el && el.remove()
        delete messages[msg]
        // TODO: if the deleted message was unread, decrement the unread count
      }
    }

    messages = Object.values(messages).sort((a, b) => b.date - a.date).reduce((acc, m) => { acc[m.id] = m; return acc }, {})
    saveInboxMessagesToLS(messages)
    return messages
  }

  updateInboxMessagesInLS (msgs = []) {
    let inboxMsgs = this.fetchUnexpiredInboxMessages()
    if (!inboxMsgs) {
      inboxMsgs = {}
    }
    const date = Date.now()
    const incomingMsgs = []
    msgs.forEach((m, i) => {
      const key = `${m.wzrk_id.split('_')[0]}_${Date.now()}`
      m.id = key
      // doing this to preserve the order of the messages
      m.date = date - i
      m.read = 0
      m.viewed = 0
      inboxMsgs[key] = m
      incomingMsgs.push(key)
      this.unviewedMessages[key] = m
      this.unviewedCounter++
    })
    this.messagesToBeAdded = [...incomingMsgs, ...this.messagesToBeAdded]
    saveInboxMessagesToLS(inboxMsgs)

    this.updateUnviewedBadgeCounter(this.unviewedCounter)

    if (this.isInboxOpen) {
      this.buildUIForMessages(inboxMsgs)
    }
  }

  createEl (type, id) {
    const _el = document.createElement(type)
    _el.setAttribute('id', id)
    return _el
  }

  addUnviewedBadge () {
    this.unviewedBadge = this.createEl('div', 'unviewedBadge')
    this.unviewedBadge.style.cssText = 'display: none; position: absolute; height: 16px; width: 26px; border-radius: 8px; background-color: #e357a9; font-size: 12px; color: #fffcff; font-weight: bold; align-items: center; justify-content: center;'
    document.body.appendChild(this.unviewedBadge)
    this.updateUnviewedBadgePosition()

    // called when user switches b/w portrait and landscape mode
    window.addEventListener('resize', () => {
      this.updateUnviewedBadgePosition()
    })
  }

  updateUnviewedBadgePosition () {
    const { top, right } = this.inboxSelector.getBoundingClientRect()
    this.unviewedBadge.style.top = `${top - 8}px`
    this.unviewedBadge.style.left = `${right - 8}px`
  }

  createinbox () {
    // does not show up when we do hard refresh
    this.inbox = this.createEl('div', 'inbox')
    const panel = this.createEl('div', 'panel')

    const panelTitle = this.createEl('div', 'panelTitle')
    panelTitle.innerText = this.config.title

    const closeIcon = this.createEl('div', 'closeInbox')
    closeIcon.innerHTML = '&times'
    closeIcon.addEventListener('click', () => { this.toggleInbox() })

    panel.appendChild(panelTitle)
    panel.appendChild(closeIcon)
    this.inbox.appendChild(panel)
    if (this.config.categories.length) {
      const categories = this.createCategories()
      this.inbox.appendChild(categories)
    }
    this.inboxCard = this.createEl('div', 'inboxCard')
    this.inbox.appendChild(this.inboxCard)

    this.emptyInboxMsg = this.createEl('div', 'emptyInboxMsg')
    this.inboxCard.appendChild(this.emptyInboxMsg)

    this.categories.length && this.categories[0].click()

    // For notification viewed
    const options = {
      root: this.inboxCard,
      rootMargin: '0px',
      threshold: 0.5
    }
    this.observer = new IntersectionObserver((entries, observer) => { this.raiseViewedEvent(entries, observer) }, options)

    this.addMsgsToInboxFromLS()
  }

  createCategories () {
    const categoriesWrapper = this.createEl('div', 'categoriesWrapper')
    const _categories = ['All', ...this.config.categories]
    _categories.forEach((c, i) => {
      const category = this.createEl('div', `category-${i}`)
      category.innerText = c
      category.addEventListener('click', () => {
        this.updateActiveCategory(c)
      })
      this.categories.push(category)
      categoriesWrapper.appendChild(category)
    })
    return categoriesWrapper
  }

  updateActiveCategory (activeCategory) {
    this.selectedCategory = activeCategory
    const tabColor = this.config.styles.categories.tabColor
    this.inboxCard.scrollTop = 0
    let counter = 0
    this.categories.forEach((c) => {
      c.style.backgroundColor = c.innerText.trim() === activeCategory ? tabColor : `${tabColor}4d`
    })
    this.inboxCard.childNodes.forEach(c => {
      if (c.getAttribute('id') !== 'emptyInboxMsg') {
        c.style.display = (this.selectedCategory === 'All' || c.getAttribute('category') === this.selectedCategory) ? 'block' : 'none'
        if (c.style.display === 'block') {
          counter++
        }
      }
    })
    if (counter === 0) {
      this.emptyInboxMsg.innerHTML = `${activeCategory} messages will be displayed here.`
      this.emptyInboxMsg.style.display = 'block'
    } else {
      this.emptyInboxMsg.style.display = 'none'
    }
  }

  buildUIForMessages (messages) {
    if (!messages) {
      messages = this.fetchUnexpiredInboxMessages()
    }

    this.updateTSForRenderedMsgs()
    this.inboxCard.scrollTop = 0
    const firstChild = this.inboxCard.firstChild
    this.messagesToBeAdded.forEach((m) => {
      // it can so happen that the message has expired by the time one opens the inbox
      if (messages[m]) {
        const item = new Message(this.config, messages[m])
        item.setAttribute('id', messages[m].id)
        item.setAttribute('category', messages[m].tags[0])
        item.setAttribute('pivot', messages[m].wzrk_pivot)
        item.style.display = (this.selectedCategory === 'All' || messages[m].category === this.selectedCategory) ? 'block' : 'none'
        this.inboxCard.insertBefore(item, firstChild)
        this.observer.observe(item)
      }
    })
    this.messagesToBeAdded = []
    const hasMessages = this.inboxCard.querySelectorAll('inbox-message').length
    this.emptyInboxMsg.style.display = hasMessages ? 'none' : 'block'
  }

  addClickListenerOnDocument = (() => {
    return (e) => {
      if (e.composedPath().includes(this.inbox)) {
        const path = e.path.filter((p) => (p.id && p.id.startsWith('button-')) || p.tagName === 'INBOX-MESSAGE')
        if (path.length) {
          const el = path[path.length - 1]
          this.updateMessageInLS(el.message.id, { ...el.message, read: 1 })
          el.shadow.getElementById('unreadMarker').style.display = 'none'
          el.raiseClickedEvent(path)
        }
        return
      }
      if (this.inboxSelector.contains(e.target)) {
        this.toggleInbox(e)
        return
      }
      if (this.isInboxOpen) {
        this.toggleInbox()
      }
    }
  })()

  raiseViewedEvent (entries, observer) {
    if (this.isInboxOpen && this.messagesToBeAdded.length === 0) {
      entries.forEach((e) => {
        if (e.boundingClientRect.top < e.rootBounds.bottom && e.boundingClientRect.top >= e.rootBounds.top && this.unviewedMessages.hasOwnProperty(e.target.id)) {
          window.clevertap.renderNotificationViewed({ msgId: e.target.campaignId, pivotId: e.target.pivotId })
          e.target.message.viewed = 1
          this.unviewedCounter--
          // is this really needed
          Promise.resolve().then(() => { this.updateMessageInLS(e.target.id, { ...e.target.message, viewed: 1 }) })
          this.updateUnviewedBadgeCounter(this.unviewedCounter)
          delete this.unviewedMessages[e.target.id]
        }
      })
    }
  }

  updateMessageInLS (key, value) {
    const messages = getInboxMessagesFromLS(this.WEB_INBOX)
    messages[key] = value
    saveInboxMessagesToLS(messages)
  }

  toggleInbox (e) {
    this.isInboxOpen = !this.isInboxOpen
    if (this.isInboxOpen) {
      this.inboxCard.scrollTop = 0
      this.buildUIForMessages()
      this.inbox.style.display = 'block'
      const { xPos, yPos } = getInboxPosition(e.pageX, e.pageY, 392)
      this.inbox.style.top = yPos + 'px'
      this.inbox.style.left = xPos + 'px'
    } else {
      this.inbox.style.display = 'none'
    }
  }

  updateUnviewedBadgeCounter (count) {
    this.unviewedBadge.innerText = count > 9 ? '9+' : count
    this.unviewedBadge.style.display = count ? 'flex' : 'none'
  }

  updateTSForRenderedMsgs () {
    this.inboxCard.querySelectorAll('inbox-message').forEach((m) => {
      const ts = m.id.split('_')[1]
      m.shadow.getElementById('timeStamp').firstChild.innerHTML = determineTimeStampText(ts)
    })
  }

  getInboxStyles () {
    return inboxContainerStyles(
      this.config.styles.header.backgroundColor,
      this.config.styles.header.titleColor,
      this.config.styles.header.closeIconColor,
      this.config.styles.categories.tabColor,
      this.config.styles.categories.titleColor
    )
  }
}
