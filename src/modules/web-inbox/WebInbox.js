import { StorageManager, $ct } from '../../util/storage'
import { Message } from './Message'
import { inboxContainerStyles, messageStyles } from './inboxStyles'
import { getInboxPosition, determineTimeStampText, arrowSvg } from './helper'
import { WEBINBOX, WEBINBOX_CONFIG } from '../../util/constants'

export class Inbox extends HTMLElement {
  constructor (logger) {
    super()
    this.logger = logger
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  isInboxOpen = false
  selectedCategory = null
  unviewedMessages = {}
  unviewedCounter = 0
  isPreview = false

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
    if (msgs.length > 0) {
      this.isPreview = true
      this.unviewedCounter = 0
      msgs.forEach((m) => {
        m.id = `${m.wzrk_id.split('_')[0]}_${Date.now()}`
        this.unviewedMessages[m.id] = m
        this.unviewedCounter++
      })
      this.buildUIForMessages(msgs)
      this.updateUnviewedBadgeCounter()
    }
  }

  connectedCallback () {
    this.init()
  }

  init () {
    this.config = StorageManager.readFromLSorCookie(WEBINBOX_CONFIG) || {}
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
      // TODO - verify this
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
    const msgIds = Object.keys(messages)
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
    let messages = StorageManager.readFromLSorCookie(WEBINBOX) || {}
    const now = Math.floor(Date.now() / 1000)
    for (const msg in messages) {
      if (messages[msg].wzrk_ttl && messages[msg].wzrk_ttl > 0 && messages[msg].wzrk_ttl < now) {
        if (deleteMsgsFromUI) {
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

    messages = Object.values(messages).sort((a, b) => b.date - a.date).reduce((acc, m) => { acc[m.id] = m; return acc }, {})
    StorageManager.saveToLSorCookie(WEBINBOX, messages)
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
      m.read = 0
      m.viewed = 0
      inboxMsgs[key] = m
      incomingMsgs[key] = m
      this.unviewedMessages[key] = m
      this.unviewedCounter++
    })
    StorageManager.saveToLSorCookie(WEBINBOX, inboxMsgs)
    this.updateUnviewedBadgeCounter()
    this.buildUIForMessages(incomingMsgs)
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
    const { top, right } = this.inboxSelector.getBoundingClientRect()
    this.unviewedBadge.style.top = `${top - 8}px`
    this.unviewedBadge.style.left = `${right - 8}px`
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
    const firstChild = this.inboxCard.firstChild
    for (const m in messages) {
      const item = new Message(this.config, messages[m])
      item.setAttribute('id', messages[m].id)
      item.setAttribute('category', messages[m].tags[0])
      item.setAttribute('pivot', messages[m].wzrk_pivot)
      item.setAttribute('part', 'inbox-message')
      item.style.display = (this.selectedCategory === 'All' || messages[m].category === this.selectedCategory) ? 'block' : 'none'
      this.inboxCard.insertBefore(item, firstChild)
      this.observer.observe(item)
    }

    const hasMessages = this.inboxCard.querySelectorAll('inbox-message[style*="display: block"]').length
    this.emptyInboxMsg.style.display = hasMessages ? 'none' : 'block'
  }

  /**
   * Adds a click listener on the document. For every click we check
   * 1. if the click has happenned within the inbox
   *    - on close button, we close the inbox
   *    - on any of the category, we set that as the activeCategory
   *    - on any of the message, we mark that msg as read and raise notification clicked event. To identify the clicks on a button, we have p.id.startsWith('button-')
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
          } else if (!this.isPreview) {
            const _path = path.filter((p) => p.id?.startsWith('button-') || p.tagName === 'INBOX-MESSAGE')
            if (_path.length) {
              const messageEl = _path[_path.length - 1]
              if (!messageEl.message.read) {
                this.updateMessageInLS(messageEl.message.id, { ...messageEl.message, read: 1 })
                messageEl.shadow.getElementById('unreadMarker').style.display = 'none'
              }
              messageEl.raiseClickedEvent(_path[0])
            }
          }
        }
      } else if (this.inboxSelector.contains(e.target) || this.isInboxOpen) {
        this.toggleInbox(e)
      }
    }
  })()

  /**
   * This function will be called every time when a message comes into the inbox viewport and it's visibility increases to 50% or drops below 50%
   * If a msg is 50% visible in the UI, we need to mark the message as viewed in LS and raise notification viewed event
   */
  handleMessageViewed (entries) {
    const raiseViewedEvent = !this.isPreview
    if (this.isInboxOpen) {
      entries.forEach((e) => {
        if (e.isIntersecting && this.unviewedMessages.hasOwnProperty(e.target.id)) {
          e.target.message.viewed = 1
          if (raiseViewedEvent) {
            window.clevertap.renderNotificationViewed({ msgId: e.target.campaignId, pivotId: e.target.pivotId })
            this.updateMessageInLS(e.target.id, { ...e.target.message, viewed: 1 })
          }
          this.unviewedCounter--
          this.updateUnviewedBadgeCounter()
          delete this.unviewedMessages[e.target.id]
        }
      })
    }
  }

  updateMessageInLS (key, value) {
    const messages = StorageManager.readFromLSorCookie(WEBINBOX) || {}
    messages[key] = value
    StorageManager.saveToLSorCookie(WEBINBOX, messages)
  }

  // create a separte fn fro refactoring
  toggleInbox (e) {
    this.isInboxOpen = !this.isInboxOpen
    if (this.isInboxOpen) {
      this.inboxCard.scrollTop = 0
      !this.isPreview && this.deleteExpiredAndGetUnexpiredMsgs()
      this.inbox.style.display = 'block'
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
      const res = getInboxPosition(e, this.inbox.clientHeight, this.inbox.clientHeight)
      const xPos = res.xPos
      const yPos = res.yPos
      this.inbox.style.top = yPos + 'px'
      this.inbox.style.left = xPos + 'px'
    }
  }

  /**
   * Updates the UI with the number of unviewed messages
   * If there are more than 9 unviewed messages, we show the count as 9+
   */
  updateUnviewedBadgeCounter () {
    if (this.unviewedBadge !== null) {
      this.unviewedBadge.innerText = this.unviewedCounter > 9 ? '9+' : this.unviewedCounter
      this.unviewedBadge.style.display = this.unviewedCounter > 0 ? 'flex' : 'none'
    }
  }

  updateTSForRenderedMsgs () {
    this.inboxCard.querySelectorAll('inbox-message').forEach((m) => {
      const ts = m.id.split('_')[1]
      m.shadow.getElementById('timeStamp').firstChild.innerText = determineTimeStampText(ts)
    })
  }

  getInboxStyles () {
    const styles = {
      panelBackgroundColor: this.config.styles.panelBackgroundColor,
      panelBorderColor: this.config.styles.panelBorderColor,
      headerBackgroundColor: this.config.styles.header.backgroundColor,
      headerTitleColor: this.config.styles.header.titleColor,
      closeIconColor: this.config.styles.header.closeIconColor,
      categoriesTabColor: this.config.styles.categories.tabColor,
      categoriesTitleColor: this.config.styles.categories.titleColor,
      selectedCategoryTabColor: this.config.styles.categories.selectedTab.tabColor,
      selectedCategoryTitleColor: this.config.styles.categories.selectedTab.titleColor
    }
    if (this.config.styles.categories.borderColor) {
      styles.categoriesBorderColor = this.config.styles.categories.borderColor
    }
    if (this.config.styles.categories.selectedTab.borderColor) {
      styles.selectedCategoryBorderColor = this.config.styles.categories.selectedTab.borderColor
    }

    const inboxStyles = inboxContainerStyles(styles)

    const msgStyles = messageStyles({
      backgroundColor: this.config.styles.cards.backgroundColor,
      borderColor: this.config.styles.cards.borderColor,
      titleColor: this.config.styles.cards.titleColor,
      descriptionColor: this.config.styles.cards.descriptionColor,
      buttonColor: this.config.styles.cards.buttonColor,
      buttonTextColor: this.config.styles.cards.buttonTextColor
    })
    return inboxStyles + msgStyles
  }
}
