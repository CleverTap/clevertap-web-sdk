import { StorageManager, $ct } from '../../util/storage'
import { Message } from './Message'
import { inboxContainerStyles, messageStyles } from './inboxStyles'
import { getInboxPosition, determineTimeStampText, arrowSvg, getInboxMessages, saveInboxMessages } from './helper'
import { WEBINBOX_CONFIG, MAX_INBOX_MSG } from '../../util/constants'

export class Inbox extends HTMLElement {
  constructor (logger) {
    super()
    this.logger = logger
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  isInboxOpen = false
  isInboxFromFlutter = false
  selectedCategory = null
  unviewedMessages = {}
  unviewedCounter = 0
  isPreview = false
  inboxConfigForPreview = {}

  // dom references
  inboxSelector = null
  inbox = null
  emptyInboxMsg = null
  inboxCard = null
  unviewedBadge = null
  observer = null
  selectedCategoryRef = null

  get incomingMessages () {
    return []
  }

  set incomingMessages (msgs = []) {
    if (msgs.length > 0) {
      this.updateInboxMessages(msgs)
    }
  }

  get incomingMessagesForPreview () {
    return []
  }

  set incomingMessagesForPreview (msgs = []) {
    const previewMsgs = {}
    if (msgs.length > 0 && this.inbox) {
      this.isPreview = true
      this.unviewedCounter = 0
      msgs.forEach((m) => {
        const key = `${m.wzrk_id.split('_')[0]}_${Date.now()}`
        m.id = key
        previewMsgs[key] = m
        this.unviewedMessages[key] = m
        this.unviewedCounter++
      })
      this.buildUIForMessages(previewMsgs)
      this.updateUnviewedBadgeCounter()
    }
  }

  connectedCallback () {
    this.init()
  }

  init () {
    this.config = this.isPreview ? this.inboxConfigForPreview : StorageManager.readFromLSorCookie(WEBINBOX_CONFIG) || {}
    if (Object.keys(this.config).length === 0) {
      return
    }
    this.inboxSelector = document.getElementById(this.config.inboxSelector)
    if (this.inboxSelector === null) {
      return
    }

    if (this.config.styles.notificationsBadge) {
      this.addUnviewedBadge()
    } else if (this.unviewedBadge) {
      this.unviewedBadge.remove()
    }

    this.createinbox()

    /**
     * We need to remove the listener as there could be a scenario where init would be called when
     * we get updated web inbox settings from LC after the inbox has been initialised.
     * It can so happen that the inbox-selector would have changed.
     */
    document.removeEventListener('click', this.addClickListenerOnDocument)
    document.addEventListener('click', this.addClickListenerOnDocument)
    this.config.categories.length && this.updateActiveCategory(this.selectedCategoryRef.innerText)

    this.shadow.innerHTML = this.getInboxStyles()
    this.shadow.appendChild(this.inbox)
  }

  addMsgsToInboxFromLS () {
    const messages = this.deleteExpiredAndGetUnexpiredMsgs(false)
    const msgIds = messages ? Object.keys(messages) : []
    if (msgIds.length === 0) {
      return
    }
    msgIds.forEach((m) => {
      if (!messages[m].viewed) {
        this.unviewedMessages[m] = messages[m]
        this.unviewedCounter++
      }
    })
    this.buildUIForMessages(messages)
    this.updateUnviewedBadgeCounter()
  }

  /**
   * @param {*} deleteMsgsFromUI - If this param is true, then we'll have to check the UI and delete expired messages from the DOM
   * It'll be false when you are building the inbox layout for the very first time.
   *
   * This method reads the inbox messages from LS,
   * based on the deleteMsgsFromUI flag deletes the expired messages from UI and decrements the unviewed counter if the message was not viewed,
   * sorts the messages based on the date,
   * saves the unexpired messages to LS
   * and returns the sorted unexpired messages
   *
   * Scenarios when we encounter expired messages -
   * 1. building ui for the 1st time, no need to decrement the unviewed counter as the correct count will be set at the time of rendering
   * 2. UI is already built (deleteMsgsFromUI = true) and you open the inbox
   *    a. You'll find the expired msg in inbox
   *    b. You'll not find the expired msg in inbox.
   *       This happens when we receive new messages from LC, increment unviewed counter, save it in LS. (We build the UI only when the user opens inbox.)
   *  In both the above scenarios, we'll still have to decrement the unviewed counter if the message was not viewed.
   */
  deleteExpiredAndGetUnexpiredMsgs (deleteMsgsFromUI = true) {
    let messages = getInboxMessages()

    const now = Math.floor(Date.now() / 1000)
    for (const msg in messages) {
      if (messages[msg].wzrk_ttl && messages[msg].wzrk_ttl > 0 && messages[msg].wzrk_ttl < now) {
        if (deleteMsgsFromUI && this.inbox) {
          const el = this.shadowRoot.getElementById(messages[msg].id)
          el && el.remove()
          if (!messages[msg].viewed) {
            this.unviewedCounter--
            this.updateUnviewedBadgeCounter()
          }
        }
        delete messages[msg]
      }
    }
    if (messages && messages.length > 0) {
      messages = Object.values(messages).sort((a, b) => b.date - a.date).reduce((acc, m) => { acc[m.id] = m; return acc }, {})
    }
    saveInboxMessages(messages)
    return messages
  }

  updateInboxMessages (msgs = []) {
    const inboxMsgs = this.deleteExpiredAndGetUnexpiredMsgs()
    const date = Date.now()
    const incomingMsgs = {}
    msgs.forEach((m, i) => {
      const key = `${m.wzrk_id.split('_')[0]}_${Date.now()}`
      m.id = key
      // We are doing this to preserve the order of the messages
      m.date = date - i
      m.viewed = 0
      inboxMsgs[key] = m
      incomingMsgs[key] = m
      this.unviewedMessages[key] = m
      this.unviewedCounter++
    })
    saveInboxMessages(inboxMsgs)
    if (this.inbox) {
      this.buildUIForMessages(incomingMsgs)
      this.updateUnviewedBadgeCounter()
    }
  }

  createEl (type, id, part) {
    const _el = document.createElement(type)
    _el.setAttribute('id', id)
    _el.setAttribute('part', part || id)
    return _el
  }

  addUnviewedBadge () {
    if (!this.unviewedBadge) {
      this.unviewedBadge = this.createEl('div', 'unviewedBadge')
      // As this unviewedBadge element will be directly added to the DOM, we are defining inline styles
      this.unviewedBadge.style.cssText = `display: none; position: absolute; height: 16px; width: 26px; border-radius: 8px; background-color: ${this.config.styles.notificationsBadge.backgroundColor}; font-size: 12px; color: ${this.config.styles.notificationsBadge.textColor}; font-weight: bold; align-items: center; justify-content: center;`
      document.body.appendChild(this.unviewedBadge)
    }
    this.updateUnviewedBadgePosition()

    // called when user switches b/w portrait and landscape mode.
    window.addEventListener('resize', () => {
      this.updateUnviewedBadgePosition()
    })
  }

  updateUnviewedBadgePosition () {
    try {
      const inboxNode = document.getElementById(this.config.inboxSelector) || this.inboxSelector
      const { top, right } = inboxNode.getBoundingClientRect()
      this.unviewedBadge.style.top = `${top - 8}px`
      this.unviewedBadge.style.left = `${right - 8}px`
    } catch (error) {
      this.logger.debug('Error updating unviewed badge position:', error)
    }
  }

  createinbox () {
    this.inbox = this.createEl('div', 'inbox')
    const header = this.createEl('div', 'header')

    const headerTitle = this.createEl('div', 'headerTitle')
    headerTitle.innerText = this.config.title

    const closeIcon = this.createEl('div', 'closeInbox')
    closeIcon.innerHTML = '&times'

    header.appendChild(headerTitle)
    header.appendChild(closeIcon)
    this.inbox.appendChild(header)
    if (this.config.categories.length) {
      const categories = this.createCategories()
      this.inbox.appendChild(categories)
    }
    this.inboxCard = this.createEl('div', 'inboxCard')
    this.inbox.appendChild(this.inboxCard)

    this.emptyInboxMsg = this.createEl('div', 'emptyInboxMsg')
    this.emptyInboxMsg.innerText = 'All messages will be displayed here.'
    this.inboxCard.appendChild(this.emptyInboxMsg)

    // Intersection observer for notification viewed
    const options = {
      root: this.inboxCard,
      rootMargin: '0px',
      threshold: 0.5
    }
    this.observer = new IntersectionObserver((entries, observer) => { this.handleMessageViewed(entries) }, options)

    this.addMsgsToInboxFromLS()
  }

  createCategories () {
    const categoriesContainer = this.createEl('div', 'categoriesContainer')

    const leftArrow = this.createEl('div', 'leftArrow')
    leftArrow.innerHTML = arrowSvg
    leftArrow.children[0].style = 'transform: rotate(180deg)'
    leftArrow.addEventListener('click', () => {
      this.shadowRoot.getElementById('categoriesWrapper').scrollBy(-70, 0)
    })
    categoriesContainer.appendChild(leftArrow)

    const categoriesWrapper = this.createEl('div', 'categoriesWrapper')
    const _categories = ['All', ...this.config.categories]
    _categories.forEach((c, i) => {
      const category = this.createEl('div', `category-${i}`, 'category')
      category.innerText = c
      if (i === 0) {
        this.selectedCategoryRef = category
      }
      categoriesWrapper.appendChild(category)
    })
    categoriesContainer.appendChild(categoriesWrapper)

    const rightArrow = this.createEl('div', 'rightArrow')
    rightArrow.innerHTML = arrowSvg
    rightArrow.addEventListener('click', () => {
      this.shadowRoot.getElementById('categoriesWrapper').scrollBy(70, 0)
    })
    categoriesContainer.appendChild(rightArrow)

    const options = { root: categoriesContainer, threshold: 0.9 }
    const firstCategory = categoriesWrapper.children[0]
    const lastCategory = categoriesWrapper.children[this.config.categories.length]

    const firstCategoryObserver = new IntersectionObserver((e) => {
      this.categoryObserverCb(leftArrow, e[0].intersectionRatio >= 0.9)
    }, options)
    firstCategoryObserver.observe(firstCategory)

    const lastCategoryObserver = new IntersectionObserver((e) => {
      this.categoryObserverCb(rightArrow, e[0].intersectionRatio >= 0.9)
    }, options)
    lastCategoryObserver.observe(lastCategory)

    return categoriesContainer
  }

  categoryObserverCb (el, hide) {
    if (!el) {
      return
    }
    el.style.display = hide ? 'none' : 'flex'
  }

  updateActiveCategory (activeCategory) {
    this.selectedCategory = activeCategory

    this.inboxCard.scrollTop = 0
    let counter = 0

    this.prevCategoryRef && this.prevCategoryRef.setAttribute('selected', 'false')
    this.selectedCategoryRef.setAttribute('selected', 'true')

    this.inboxCard.childNodes.forEach(c => {
      if (c.getAttribute('id') !== 'emptyInboxMsg') {
        c.style.display = (this.selectedCategory === 'All' || c.getAttribute('category') === this.selectedCategory) ? 'block' : 'none'
        if (c.style.display === 'block') {
          counter++
        }
      }
    })
    if (counter === 0) {
      this.emptyInboxMsg.innerText = `${activeCategory} messages will be displayed here.`
      this.emptyInboxMsg.style.display = 'block'
    } else {
      this.emptyInboxMsg.style.display = 'none'
    }
  }

  buildUIForMessages (messages = {}) {
    !this.isPreview && this.updateTSForRenderedMsgs()
    this.inboxCard.scrollTop = 0
    const maxMsgsInInbox = this.config.maxMsgsInInbox ?? MAX_INBOX_MSG
    const firstChild = this.inboxCard.firstChild

    const sortedMsgs = Object.values(messages).sort((a, b) => b.date - a.date).map((m) => m.id)
    for (const m of sortedMsgs) {
      const item = new Message(this.config, messages[m])
      item.setAttribute('id', messages[m].id)
      item.setAttribute('pivot', messages[m].wzrk_pivot)
      item.setAttribute('part', 'ct-inbox-message')
      if (this.config.categories.length > 0) {
        item.setAttribute('category', messages[m].tags[0] || '')
        item.style.display = (this.selectedCategory === 'All' || messages[m].category === this.selectedCategory) ? 'block' : 'none'
      } else {
        item.style.display = 'block'
      }
      this.inboxCard.insertBefore(item, firstChild)
      this.observer.observe(item)
    }

    let msgTotalCount = this.inboxCard.querySelectorAll('ct-inbox-message').length
    while (msgTotalCount > maxMsgsInInbox) {
      const ctInboxMsgs = this.inboxCard.querySelectorAll('ct-inbox-message')
      if (ctInboxMsgs.length > 0) { ctInboxMsgs[ctInboxMsgs.length - 1].remove() }
      msgTotalCount--
    }
    const hasMessages = this.inboxCard.querySelectorAll('ct-inbox-message[style*="display: block"]').length
    this.emptyInboxMsg.style.display = hasMessages ? 'none' : 'block'
  }

  /**
   * Adds a click listener on the document. For every click we check
   * 1. if the click has happenned within the inbox
   *    - on close button, we close the inbox
   *    - on any of the category, we set that as the activeCategory
   *    - on any of the message, we mark raise notification clicked event. To identify the clicks on a button, we have p.id.startsWith('button-')
   * 2. if the user has clicked on the inboxSelector, we toggle inbox
   * 3. if the click is anywhere else on the UI and the inbox is open, we simply close it
   */

  addClickListenerOnDocument = (() => {
    return (e) => {
      if (e.composedPath().includes(this.inbox)) {
        // path is not supported on FF. So we fallback to e.composedPath
        const path = e.path || (e.composedPath && e.composedPath())
        if (path.length) {
          const id = path[0].id
          if (id === 'closeInbox') {
            this.toggleInbox()
          } else if (id.startsWith('category-')) {
            this.prevCategoryRef = this.selectedCategoryRef
            this.selectedCategoryRef = path[0]
            this.updateActiveCategory(path[0].innerText)
          } else {
            const _path = path.filter((p) => p.id?.startsWith('button-') || p.tagName === 'CT-INBOX-MESSAGE')
            if (_path.length) {
              const messageEl = _path[_path.length - 1]
              messageEl.raiseClickedEvent(_path[0], this.isPreview)
            }
          }
        }
      } else if (this.checkForWebInbox(e) || this.isInboxOpen) {
        if (this.isInboxFromFlutter) {
          this.isInboxFromFlutter = false
        } else {
          this.toggleInbox(e)
        }
      }
    }
  })()

  /**
   * Checks if the current event target is part of the stored inboxSelector or the inboxSelector in the document.
   *
   * @param {Event} e - The event object to check.
   * @returns {boolean} - Returns true if the event target is within the inboxSelector, otherwise false.
   */
  checkForWebInbox (e) {
    const config = StorageManager.readFromLSorCookie(WEBINBOX_CONFIG) || {}
    const inboxElement = document.getElementById(config.inboxSelector)

    return (
      this.inboxSelector?.contains(e.target) || inboxElement?.contains(e.target)
    )
  }

  /**
   * This function will be called every time when a message comes into the inbox viewport and it's visibility increases to 50% or drops below 50%
   * If a msg is 50% visible in the UI, we need to mark the message as viewed in LS and raise notification viewed event
   */
  handleMessageViewed (entries) {
    const raiseViewedEvent = !this.isPreview
    if (this.isInboxOpen) {
      entries.forEach((e) => {
        if (e.isIntersecting && this.unviewedMessages.hasOwnProperty(e.target.id) && e.target.message.viewed === 0) {
          e.target.message.viewed = 1
          if (raiseViewedEvent) {
            window.clevertap.renderNotificationViewed({ msgId: e.target.campaignId, pivotId: e.target.pivotId })
            this.updateMessageInLS(e.target.id, { ...e.target.message, viewed: 1 })
            setTimeout(() => {
              e.target.shadowRoot.getElementById('unreadMarker').style.display = 'none'
            }, 1000)
          } else {
            console.log('Notifiction viewed event will be raised at run time with payload ::', { msgId: e.target.campaignId, pivotId: e.target.pivotId })
          }
          this.unviewedCounter--
          this.updateUnviewedBadgeCounter()
          delete this.unviewedMessages[e.target.id]
        }
      })
    }
  }

  updateMessageInLS (key, value) {
    if (!this.isPreview) {
      const messages = getInboxMessages()
      messages[key] = value
      saveInboxMessages(messages)
    }
  }

  // create a separte fn fro refactoring
  toggleInbox (e) {
    this.isInboxOpen = !this.isInboxOpen
    this.isInboxFromFlutter = !!e?.rect
    if (this.isInboxOpen) {
      this.inboxCard.scrollTop = 0
      !this.isPreview && this.deleteExpiredAndGetUnexpiredMsgs()
      this.inbox.style.display = 'block'
      this.inbox.style.zIndex = '2147483647' // zIndex should be max for the inbox to be rendered on top of all elements
      if (this.config.categories.length) {
        this.selectedCategoryRef.setAttribute('selected', 'false')
        this.selectedCategoryRef = this.shadowRoot.getElementById('category-0')
        this.updateActiveCategory(this.selectedCategoryRef.innerText)
        this.shadowRoot.getElementById('categoriesWrapper').scrollLeft -= this.shadowRoot.getElementById('categoriesWrapper').scrollWidth
      }
      this.setInboxPosition(e)
    } else {
      this.inbox.style.display = 'none'
    }
  }

  setInboxPosition (e) {
    const windowWidth = window.outerWidth
    const customInboxStyles = getComputedStyle($ct.inbox)
    const top = customInboxStyles.getPropertyValue('--inbox-top')
    const bottom = customInboxStyles.getPropertyValue('--inbox-bottom')
    const left = customInboxStyles.getPropertyValue('--inbox-left')
    const right = customInboxStyles.getPropertyValue('--inbox-right')
    const hasPositionDefined = top || bottom || left || right
    if (windowWidth > 481 && !hasPositionDefined) {
      const res = getInboxPosition(e, this.inbox.clientHeight, this.inbox.clientWidth)
      const xPos = res.xPos
      const yPos = res.yPos
      this.inbox.style.top = yPos + 'px'
      this.inbox.style.left = xPos + 'px'
    }
  }

  /**
   * Updates the UI with the number of unviewed messages
   * If there are more than 9 unviewed messages, we show the count as 9+
   * Only show this badge if the current document has the inboxNode
   */

  setBadgeStyle = (msgCount) => {
    if (this.unviewedBadge !== null) {
      this.unviewedBadge.innerText = msgCount > 9 ? '9+' : msgCount
      const shouldShowUnviewedBadge = msgCount > 0 && document.getElementById(this.config.inboxSelector)
      this.unviewedBadge.style.display = shouldShowUnviewedBadge ? 'flex' : 'none'
    }
  }

  updateUnviewedBadgeCounter () {
    if (this.isPreview) {
      this.setBadgeStyle(this.unviewedCounter)
      return
    }
    let counter = 0
    this.inboxCard.querySelectorAll('ct-inbox-message').forEach((m) => {
      const messages = getInboxMessages()
      if (messages[m.id] && messages[m.id].viewed === 0) {
        counter++
      }
    })
    this.setBadgeStyle(counter)
  }

  updateTSForRenderedMsgs () {
    this.inboxCard.querySelectorAll('ct-inbox-message').forEach((m) => {
      const ts = m.id.split('_')[1]
      m.shadow.getElementById('timeStamp').firstChild.innerText = determineTimeStampText(ts)
    })
  }

  getInboxStyles () {
    const headerHeight = 36
    const categoriesHeight = this.config.categories.length ? 64 : 16

    const styles = {
      panelBackgroundColor: this.config.styles.panelBackgroundColor,
      panelBorderColor: this.config.styles.panelBorderColor,
      headerBackgroundColor: this.config.styles.header.backgroundColor,
      headerTitleColor: this.config.styles.header.titleColor,
      closeIconColor: this.config.styles.closeIconColor,
      categoriesTabColor: this.config.styles.categories.tabColor,
      categoriesTitleColor: this.config.styles.categories.titleColor,
      selectedCategoryTabColor: this.config.styles.categories.selectedTab.tabColor,
      selectedCategoryTitleColor: this.config.styles.categories.selectedTab.titleColor,
      headerCategoryHeight: headerHeight + categoriesHeight
    }
    if (this.config.styles.categories.borderColor) {
      styles.categoriesBorderColor = this.config.styles.categories.borderColor
    }
    if (this.config.styles.categories.selectedTab.borderColor) {
      styles.selectedCategoryBorderColor = this.config.styles.categories.selectedTab.borderColor
    }

    const inboxStyles = inboxContainerStyles(styles)

    const cardStyles = this.config.styles.cards
    const msgStyles = messageStyles({
      backgroundColor: cardStyles.backgroundColor,
      borderColor: cardStyles.borderColor,
      titleColor: cardStyles.titleColor,
      descriptionColor: cardStyles.descriptionColor,
      buttonColor: cardStyles.buttonColor,
      buttonTextColor: cardStyles.buttonTextColor,
      unreadMarkerColor: cardStyles.unreadMarkerColor
    })

    return inboxStyles + msgStyles
  }
}
