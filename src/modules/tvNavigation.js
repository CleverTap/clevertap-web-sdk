// tvNavigation.js - Universal TV Navigation Singleton for all TV platforms
import { $ct } from '../util/storage'

// Shared focus style for TV navigation
const TV_FOCUS_STYLE = '.ct-tv-focused { outline: 3px solid #00ff00 !important; outline-offset: -2px !important; }'

class TVNavigation {
  constructor (logger) {
    if (TVNavigation.instance) {
      return TVNavigation.instance
    }

    this.logger = logger
    this.isEnabled = false
    this.currentMenu = null
    this.focusableElements = []
    this.currentFocusIndex = 0
    this.shadowNavigation = null
    this.inboxNav = null // Web Inbox navigation state

    // Universal TV key mappings (standard across all platforms)
    this.keyMappings = {
      up: 38,
      down: 40,
      left: 37,
      right: 39,
      enter: 13,
      back: 10009, // Tizen back key
      exit: 10182, // Tizen exit key
      webosBack: 461, // webOS back key
      webosExit: 27 // webOS exit key (ESC)
    }

    // Detect TV platform
    this.platform = this.detectTVPlatform()
    this.logger.debug('TV Platform detected:', this.platform)

    // Store singleton instance
    TVNavigation.instance = this
  }

  // Static method to get singleton instance
  static getInstance (logger) {
    if (!TVNavigation.instance) {
      TVNavigation.instance = new TVNavigation(logger)
    }
    return TVNavigation.instance
  }

  // Update logger if needed (useful when getting existing instance)
  setLogger (logger) {
    this.logger = logger
  }

  // Detect which TV platform we're running on
  detectTVPlatform () {
    if (typeof window.tizen !== 'undefined') {
      return 'tizen'
    }
    if (typeof window.webOS !== 'undefined') {
      return 'webos'
    }
    if (typeof window.Samsung !== 'undefined') {
      return 'samsung'
    }
    if (typeof window.androidTV !== 'undefined') {
      return 'androidtv'
    }
    if (navigator.userAgent.includes('SMART-TV') || navigator.userAgent.includes('SmartTV')) {
      return 'smarttv'
    }
    return 'browser'
  }

  // Initialize TV navigation system
  init () {
    if (this.isEnabled) return

    this.isEnabled = true
    this.setupPlatformSpecificKeys()
    this.setupKeyHandler()
    this.addFocusStyles()

    const initElements = () => {
      this.findFocusableElements()
      if (this.focusableElements.length > 0) {
        this.focusElement(0)
      }
      this.logger.debug(`TV Navigation initialized: ${this.focusableElements.length} elements`)
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initElements)
    } else {
      setTimeout(initElements, 100)
    }
  }

  // Setup platform-specific key registrations
  setupPlatformSpecificKeys () {
    try {
      switch (this.platform) {
        case 'tizen':
          // Register Tizen TV keys
          if (window.tizen && window.tizen.tvinputdevice) {
            window.tizen.tvinputdevice.registerKey('ColorF0Red')
            window.tizen.tvinputdevice.registerKey('ColorF1Green')
            window.tizen.tvinputdevice.registerKey('ColorF2Yellow')
            window.tizen.tvinputdevice.registerKey('ColorF3Blue')
            this.logger.debug('Tizen TV keys registered')
          }
          break

        case 'webos':
          // webOS key setup if needed
          this.logger.debug('webOS TV keys ready')
          break

        case 'samsung':
          // Samsung Smart TV key setup
          this.logger.debug('Samsung TV keys ready')
          break

        default:
          this.logger.debug('Generic TV key setup')
      }
    } catch (error) {
      this.logger.debug('Could not register platform-specific keys:', error.message)
    }
  }

  // Find all focusable elements on the page
  findFocusableElements () {
    this.focusableElements = Array.from(document.querySelectorAll(
      'button, [role="button"], input[type="button"], input[type="submit"], ' +
      'a[href], select, textarea, input:not([type="hidden"]):not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"]), [data-list-item]'
    )).filter(element => {
      const style = window.getComputedStyle(element)
      return style.display !== 'none' &&
             style.visibility !== 'hidden' &&
             element.offsetParent !== null
    })
  }

  // Setup global key handler
  setupKeyHandler () {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler, { capture: true })
    }

    this.keyHandler = (event) => {
      if (!this.isEnabled) return
      this.handleKeyPress(event)
    }

    document.addEventListener('keydown', this.keyHandler, { capture: true, passive: false })
  }

  // Handle key press events - Universal TV platform support
  handleKeyPress (event) {
    // Priority 1: Web Inbox (if open)
    try {
      if ($ct && $ct.inbox && $ct.inbox.isInboxOpen) {
        this.handleInboxNavigation(event)
        return
      }
    } catch (e) {
      // Inbox not available, continue with other handlers
    }

    // Priority 2: iframe popup
    const activePopup = document.querySelector('iframe[id^="wiz-iframe"]') ||
                       document.querySelector('iframe[id="wiz-iframe-intent"]')
    if (activePopup) {
      this.forwardToIframe(event, activePopup)
      return
    }

    // Priority 3: Shadow DOM popup
    const shadowPopupElement = document.querySelector('ct-web-popup-imageonly') ||
                           document.querySelector('#wzrkImageOnlyDiv ct-web-popup-imageonly') ||
                           document.querySelector('#wzrkImageOnlyDiv[style*="visible"]')
    if (shadowPopupElement) {
      const parentDiv = document.getElementById('wzrkImageOnlyDiv')
      const isVisible = parentDiv && (!parentDiv.style.display || parentDiv.style.display !== 'none')
      if (isVisible) {
        this.handleShadowDOMNavigation(event, shadowPopupElement)
        return
      }
    }

    // Default: Main page navigation
    this.handleMainPageNavigation(event)
  }

  // Forward key events to iframe
  forwardToIframe (event, activePopup) {
    // Remove any main page focus
    if (this.focusableElements[this.currentFocusIndex]) {
      this.focusableElements[this.currentFocusIndex].classList.remove('ct-tv-focused')
    }

    this.logger.debug('Forwarding key event to popup iframe:', event.keyCode)

    // Forward the key event to the iframe
    try {
      const iframeWindow = activePopup.contentWindow
      const forwardedEvent = new KeyboardEvent('keydown', {
        keyCode: event.keyCode,
        which: event.keyCode,
        bubbles: true,
        cancelable: true
      })
      iframeWindow.document.dispatchEvent(forwardedEvent)
    } catch (error) {
      this.logger.error('Could not forward event to iframe:', error)
    }

    // Prevent main page from handling the key
    event.preventDefault()
    event.stopPropagation()
  }

  // Handle shadow DOM navigation
  handleShadowDOMNavigation (event, shadowPopupElement) {
    // Remove any main page focus
    if (this.focusableElements[this.currentFocusIndex]) {
      this.focusableElements[this.currentFocusIndex].classList.remove('ct-tv-focused')
    }

    // Initialize shadow DOM navigation if not done
    if (!this.shadowNavigation) {
      this.initShadowNavigation(shadowPopupElement)
    }

    event.preventDefault()
    event.stopPropagation()

    switch (event.keyCode) {
      case this.keyMappings.up:
      case this.keyMappings.left:
        this.navigateShadow('prev')
        break
      case this.keyMappings.down:
      case this.keyMappings.right:
        this.navigateShadow('next')
        break
      case this.keyMappings.enter:
        this.activateShadow()
        break
      case this.keyMappings.back:
      case this.keyMappings.exit:
      case this.keyMappings.webosBack:
      case this.keyMappings.webosExit:
        this.closeShadowPopup()
        break
    }
  }

  // Initialize shadow DOM navigation
  initShadowNavigation (shadowPopupElement) {
    try {
      // Try multiple ways to access shadow root
      let shadowRoot = null

      if (shadowPopupElement.getShadowRoot) {
        this.logger.debug('Using getShadowRoot method')
        shadowRoot = shadowPopupElement.getShadowRoot()
      } else if (shadowPopupElement.shadowRoot) {
        this.logger.debug('Using shadowRoot property')
        shadowRoot = shadowPopupElement.shadowRoot
      } else if (shadowPopupElement.shadow) {
        this.logger.debug('Using shadow property')
        shadowRoot = shadowPopupElement.shadow
      }

      if (!shadowRoot) {
        // Alternative: look for the element with shadow root
        const ctElement = document.querySelector('ct-web-popup-imageonly')
        this.logger.debug('Alternative ct-element:', ctElement)

        if (ctElement && ctElement.shadowRoot) {
          shadowRoot = ctElement.shadowRoot
          this.logger.debug('Found shadow root via alternative method')
        }
      }

      if (!shadowRoot) {
        this.logger.debug('Still no shadow root found')
        return
      }

      this.shadowNavigation = {
        focusableElements: [],
        currentFocusIndex: 0,
        shadowRoot: shadowRoot
      }

      // Find focusable elements in shadow DOM
      this.shadowNavigation.focusableElements = Array.from(
        shadowRoot.querySelectorAll('button, [role="button"], .close, img[src], [tabindex]:not([tabindex="-1"])')
      ).filter(el => {
        const style = window.getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })

      // Add TV focus styles to shadow DOM
      this.injectFocusStyle(shadowRoot, 'ct-tv-shadow-styles')

      // Focus first element
      if (this.shadowNavigation.focusableElements.length > 0) {
        this.focusShadowElement(0)
      }
    } catch (error) {
      this.logger.error('Could not initialize shadow DOM navigation:', error)
    }
  }

  // Navigate within shadow DOM
  navigateShadow (direction) {
    if (!this.shadowNavigation || this.shadowNavigation.focusableElements.length === 0) return

    let newIndex = this.shadowNavigation.currentFocusIndex

    if (direction === 'prev') {
      newIndex = Math.max(0, this.shadowNavigation.currentFocusIndex - 1)
    } else if (direction === 'next') {
      newIndex = Math.min(this.shadowNavigation.focusableElements.length - 1, this.shadowNavigation.currentFocusIndex + 1)
    }

    if (newIndex !== this.shadowNavigation.currentFocusIndex) {
      this.focusShadowElement(newIndex)
    }
  }

  // Focus element in shadow DOM
  focusShadowElement (index) {
    if (!this.shadowNavigation) return

    // Remove focus from current element
    if (this.shadowNavigation.focusableElements[this.shadowNavigation.currentFocusIndex]) {
      this.shadowNavigation.focusableElements[this.shadowNavigation.currentFocusIndex].classList.remove('ct-tv-focused')
    }

    // Focus new element
    this.shadowNavigation.currentFocusIndex = index
    const element = this.shadowNavigation.focusableElements[this.shadowNavigation.currentFocusIndex]

    if (element) {
      element.classList.add('ct-tv-focused')
      this.logger.debug('Shadow DOM focused:', element.tagName, element.className)
    }
  }

  // Activate element in shadow DOM
  activateShadow () {
    if (!this.shadowNavigation) return

    const element = this.shadowNavigation.focusableElements[this.shadowNavigation.currentFocusIndex]
    if (element) {
      element.click()
    }
  }

  // Close shadow DOM popup
  closeShadowPopup () {
    if (!this.shadowNavigation) return

    const closeBtn = this.shadowNavigation.shadowRoot.querySelector('.close')
    if (closeBtn) {
      closeBtn.click()
    }

    // Clean up shadow navigation
    this.shadowNavigation = null
  }

  // ==================== Web Inbox Navigation ====================

  handleInboxNavigation (event) {
    // Clear main page focus
    if (this.focusableElements[this.currentFocusIndex]) {
      this.focusableElements[this.currentFocusIndex].classList.remove('ct-tv-focused')
    }

    // Initialize if needed
    if (!this.inboxNav) {
      this.initInboxNavigation()
    }

    event.preventDefault()
    event.stopPropagation()

    const { up, down, left, right, enter, back, exit, webosBack, webosExit } = this.keyMappings

    switch (event.keyCode) {
      case up: this.navigateInbox(-1, 'vertical'); break
      case down: this.navigateInbox(1, 'vertical'); break
      case left: this.navigateInbox(-1, 'horizontal'); break
      case right: this.navigateInbox(1, 'horizontal'); break
      case enter: this.activateInboxElement(); break
      case back:
      case exit:
      case webosBack:
      case webosExit: this.closeInbox(); break
    }
  }

  initInboxNavigation () {
    const inbox = $ct.inbox
    if (!inbox?.shadowRoot) {
      this.logger.debug('Web Inbox shadow root not found')
      return
    }

    this.inboxNav = {
      shadowRoot: inbox.shadowRoot,
      elements: [],
      index: 0
    }

    this.refreshInboxElements()
    this.injectInboxStyles()

    if (this.inboxNav.elements.length > 0) {
      this.focusInboxElement(0)
    }

    this.logger.debug(`Web Inbox navigation initialized: ${this.inboxNav.elements.length} elements`)
  }

  refreshInboxElements () {
    if (!this.inboxNav) return

    const sr = this.inboxNav.shadowRoot
    const elements = []

    // 1. Close button
    const closeBtn = sr.getElementById('closeInbox')
    if (closeBtn) {
      elements.push({ el: closeBtn, type: 'close' })
    }

    // 2. Category tabs
    const catWrapper = sr.getElementById('categoriesWrapper')
    if (catWrapper) {
      catWrapper.querySelectorAll('[id^="category-"]').forEach(cat => {
        if (this.isVisible(cat)) {
          elements.push({ el: cat, type: 'category' })
        }
      })
    }

    // 3. Messages
    const inboxCard = sr.getElementById('inboxCard')
    if (inboxCard) {
      inboxCard.querySelectorAll('ct-inbox-message').forEach(msg => {
        if (this.isVisible(msg)) {
          elements.push({ el: msg, type: 'message' })
          this.injectMessageStyles(msg)
        }
      })
    }

    this.inboxNav.elements = elements
  }

  navigateInbox (delta, axis) {
    if (!this.inboxNav) return

    this.refreshInboxElements()
    const { elements, index } = this.inboxNav
    if (elements.length === 0) return

    const current = elements[index]
    let newIndex = index

    if (axis === 'vertical') {
      // Simple up/down movement
      newIndex = Math.max(0, Math.min(elements.length - 1, index + delta))
    } else {
      // Horizontal: move within same type only (categories)
      if (current?.type === 'category') {
        for (let i = index + delta; i >= 0 && i < elements.length; i += delta) {
          if (elements[i].type === 'category') {
            newIndex = i
            break
          }
        }
      }
    }

    if (newIndex !== index) {
      this.focusInboxElement(newIndex)
    }
  }

  focusInboxElement (index) {
    if (!this.inboxNav) return

    const { elements } = this.inboxNav
    if (index < 0 || index >= elements.length) return

    // Remove previous focus
    const prev = elements[this.inboxNav.index]
    if (prev && prev.el) {
      prev.el.classList.remove('ct-tv-focused')
    }

    // Apply new focus
    this.inboxNav.index = index
    const curr = elements[index]
    if (curr?.el) {
      curr.el.classList.add('ct-tv-focused')
      curr.el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      this.logger.debug(`Inbox focus: ${curr.type}`, curr.el.id || '')
    }
  }

  activateInboxElement () {
    if (!this.inboxNav) return

    const item = this.inboxNav.elements[this.inboxNav.index]
    if (!item?.el) return

    this.logger.debug('Inbox activate:', item.type)
    const inbox = $ct.inbox

    switch (item.type) {
      case 'close':
        this.closeInbox()
        break

      case 'category':
        if (inbox) {
          inbox.prevCategoryRef = inbox.selectedCategoryRef
          inbox.selectedCategoryRef = item.el
          inbox.updateActiveCategory(item.el.innerText)
          // Refresh after category change
          setTimeout(() => {
            this.refreshInboxElements()
            this.injectInboxStyles()
            // Re-focus same category
            const catIdx = this.inboxNav.elements.findIndex(e => e.el === item.el)
            this.focusInboxElement(catIdx >= 0 ? catIdx : 0)
          }, 100)
        }
        break

      case 'message':
        if (item.el.raiseClickedEvent) {
          item.el.raiseClickedEvent(item.el, false)
        }
        break
    }
  }

  closeInbox () {
    this.logger.debug('Closing Web Inbox')

    if ($ct && $ct.inbox && $ct.inbox.isInboxOpen) {
      $ct.inbox.toggleInbox()
    }

    // Cleanup
    if (this.inboxNav) {
      const currentEl = this.inboxNav.elements[this.inboxNav.index]
      if (currentEl && currentEl.el) {
        currentEl.el.classList.remove('ct-tv-focused')
      }
      this.inboxNav = null
    }

    // Restore main page focus
    if (this.focusableElements.length > 0) {
      this.focusElement(this.currentFocusIndex)
    }
  }

  injectInboxStyles () {
    if (!this.inboxNav?.shadowRoot) return
    this.injectFocusStyle(this.inboxNav.shadowRoot, 'ct-tv-inbox-styles')
  }

  injectMessageStyles (msgEl) {
    if (!msgEl?.shadowRoot) return
    this.injectFocusStyle(msgEl.shadowRoot, 'ct-tv-msg-styles')
  }

  isVisible (el) {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  }

  // ==================== End Web Inbox Navigation ====================

  // Handle main page navigation
  handleMainPageNavigation (event) {
    if (this.focusableElements.length === 0) {
      this.findFocusableElements()
      return
    }

    // Define which keys to handle based on platform
    const navigationKeys = [
      this.keyMappings.up, this.keyMappings.down,
      this.keyMappings.left, this.keyMappings.right,
      this.keyMappings.enter
    ]

    const backKeys = [
      this.keyMappings.back, // Tizen back
      this.keyMappings.exit, // Tizen exit
      this.keyMappings.webosBack, // webOS back
      this.keyMappings.webosExit // webOS exit/ESC
    ]

    // Prevent default behavior for TV keys
    if (navigationKeys.includes(event.keyCode) || backKeys.includes(event.keyCode)) {
      event.preventDefault()
      event.stopPropagation()
    }

    switch (event.keyCode) {
      case this.keyMappings.up:
      case this.keyMappings.left:
        this.navigate('prev')
        break
      case this.keyMappings.down:
      case this.keyMappings.right:
        this.navigate('next')
        break
      case this.keyMappings.enter:
        this.activate()
        break
      case this.keyMappings.back:
      case this.keyMappings.exit:
      case this.keyMappings.webosBack:
      case this.keyMappings.webosExit:
        this.handleExit()
        break
      default:
        // Log unhandled keys for debugging
        this.logger.debug('Unhandled key code:', event.keyCode)
    }
  }

  // Navigate between elements
  navigate (direction) {
    if (this.focusableElements.length === 0) return

    let newIndex = this.currentFocusIndex

    if (direction === 'prev') {
      newIndex = Math.max(0, this.currentFocusIndex - 1)
    } else if (direction === 'next') {
      newIndex = Math.min(this.focusableElements.length - 1, this.currentFocusIndex + 1)
    }

    if (newIndex !== this.currentFocusIndex) {
      this.focusElement(newIndex)
    }
  }

  // Focus specific element
  focusElement (index) {
    if (index < 0 || index >= this.focusableElements.length) return

    // Remove focus from current element
    if (this.focusableElements[this.currentFocusIndex]) {
      this.focusableElements[this.currentFocusIndex].classList.remove('ct-tv-focused')
      this.focusableElements[this.currentFocusIndex].blur()
    }

    // Focus new element
    this.currentFocusIndex = index
    const element = this.focusableElements[this.currentFocusIndex]

    if (element) {
      element.classList.add('ct-tv-focused')
      element.focus()
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })

      this.logger.debug('TV Navigation focused:', element.tagName, element.textContent || element.id)
    }
  }

  // Activate current element
  activate () {
    const element = this.focusableElements[this.currentFocusIndex]

    if (element) {
      if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        element.click()
      } else if (element.tagName === 'INPUT') {
        if (element.type === 'button' || element.type === 'submit') {
          element.click()
        } else {
          element.focus()
          this.logger.debug('TV Navigation: Text input focused, virtual keyboard should appear')
        }
      }
    }
  }

  // Handle exit functionality - Universal TV platform support
  handleExit () {
    this.logger.debug('TV Navigation: Exit requested')

    try {
      // Tizen TV
      if (typeof window.tizen !== 'undefined' && window.tizen.application) {
        window.tizen.application.getCurrentApplication().exit()
        return
      }

      // LG webOS
      if (typeof window.webOS !== 'undefined' && window.webOS.platformBack) {
        window.webOS.platformBack()
        return
      }

      // Samsung Legacy
      if (typeof window.Samsung !== 'undefined' && window.Samsung.Application) {
        window.Samsung.Application.exit()
        return
      }

      // Android TV
      if (typeof window.androidTV !== 'undefined' && window.androidTV.exit) {
        window.androidTV.exit()
        return
      }

      // Generic/Browser fallback
      this.logger.debug('No TV platform API available - using browser fallback')
      if (typeof window.close === 'function') {
        window.close()
      } else {
        this.logger.debug('Cannot exit - no exit method available')
      }
    } catch (error) {
      this.logger.error('Exit error:', error)
    }
  }

  // Add TV focus styles to main document
  addFocusStyles () {
    this.injectFocusStyle(document.head, 'ct-tv-styles')
  }

  // Helper to inject focus styles into a root element (document.head or shadowRoot)
  injectFocusStyle (root, styleId) {
    if (!root || root.getElementById?.(styleId) || root.querySelector?.(`#${styleId}`)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = TV_FOCUS_STYLE
    root.appendChild(style)
  }

  // Refresh focusable elements (call when DOM changes)
  refresh () {
    this.findFocusableElements()

    // Ensure current focus is still valid
    if (this.currentFocusIndex >= this.focusableElements.length) {
      this.currentFocusIndex = Math.max(0, this.focusableElements.length - 1)
    }

    if (this.focusableElements.length > 0) {
      this.focusElement(this.currentFocusIndex)
    }
  }

  // Enable TV navigation
  enable () {
    this.isEnabled = true
    this.logger.debug('TV Navigation enabled')
  }

  // Disable TV navigation
  disable () {
    this.isEnabled = false
    // Remove focus styling
    if (this.focusableElements[this.currentFocusIndex]) {
      this.focusableElements[this.currentFocusIndex].classList.remove('ct-tv-focused')
    }
    this.logger.debug('TV Navigation disabled')
  }

  // Clean up - remove event listeners
  destroy () {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler, { capture: true })
      this.keyHandler = null
    }
    this.isEnabled = false
    this.shadowNavigation = null
    this.inboxNav = null
    TVNavigation.instance = null
  }

  // Get current state
  getState () {
    return {
      isEnabled: this.isEnabled,
      currentFocusIndex: this.currentFocusIndex,
      totalElements: this.focusableElements.length,
      platform: this.platform,
      shadowNavigation: this.shadowNavigation ? {
        currentFocusIndex: this.shadowNavigation.currentFocusIndex,
        totalElements: this.shadowNavigation.focusableElements.length
      } : null,
      inboxNavigation: this.inboxNav ? {
        currentIndex: this.inboxNav.index,
        totalElements: this.inboxNav.elements.length
      } : null
    }
  }
}

// Static property to hold singleton instance
TVNavigation.instance = null

export default TVNavigation
