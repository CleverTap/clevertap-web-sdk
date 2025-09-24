// tvNavigation.js - Universal TV Navigation Singleton for all TV platforms
import { ENABLE_TV_CONTROLS } from '../util/constants'
import { StorageManager } from '../util/storage'

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
    const enableTVControls = StorageManager.readFromLSorCookie(ENABLE_TV_CONTROLS) ?? false
    if (!enableTVControls) {
      this.logger.debug('TV Navigation disabled')
      return
    }

    // Prevent double initialization
    if (this.isEnabled) {
      this.logger.debug('TV Navigation already initialized')
      return
    }

    this.isEnabled = true
    this.setupPlatformSpecificKeys()
    this.setupKeyHandler()
    this.findFocusableElements()
    this.addFocusStyles()

    // Focus first element if available
    if (this.focusableElements.length > 0) {
      this.focusElement(0)
    }

    this.logger.debug(`CleverTap TV Navigation initialized for ${this.platform} with ${this.focusableElements.length} elements`)
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
    // Remove existing handler if any to prevent duplicates
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler, { capture: true })
    }

    // Create bound handler
    this.keyHandler = (event) => {
      if (!this.isEnabled) return
      this.handleKeyPress(event)
    }

    document.addEventListener('keydown', this.keyHandler, { capture: true, passive: false })
  }

  // Handle key press events - Universal TV platform support
  handleKeyPress (event) {
    // Check for regular iframe popup
    const activePopup = document.querySelector('iframe[id^="wiz-iframe"]') ||
                       document.querySelector('iframe[id="wiz-iframe-intent"]')

    // Check for shadow DOM popup
    const shadowPopupElement = document.querySelector('ct-web-popup-imageonly') ||
                           document.querySelector('#wzrkImageOnlyDiv ct-web-popup-imageonly') ||
                           document.querySelector('#wzrkImageOnlyDiv[style*="visible"]')

    if (activePopup) {
      // Handle iframe popup
      this.forwardToIframe(event, activePopup)
      return
    }

    if (shadowPopupElement) {
      // Check if the popup is actually visible
      const parentDiv = document.getElementById('wzrkImageOnlyDiv')
      const isVisible = parentDiv && (!parentDiv.style.display || parentDiv.style.display !== 'none')

      if (isVisible) {
        this.handleShadowDOMNavigation(event, shadowPopupElement)
        return
      }
    }

    // Handle main page navigation
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
      const style = document.createElement('style')
      style.textContent = `
        .ct-tv-focused {
          outline: 3px solid #00ff00 !important;
          outline-offset: 2px !important;
          transition: all 0.2s ease !important;
        }
      `
      shadowRoot.appendChild(style)

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

  // Add TV focus styles
  addFocusStyles () {
    if (document.getElementById('ct-tv-styles')) return

    const style = document.createElement('style')
    style.id = 'ct-tv-styles'
    style.textContent = `
      .ct-tv-focused {
        outline: 3px solid #00ff00 !important;
        outline-offset: 2px !important;
        color: white !important;
        transform: scale(1.05) !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.8) !important;
        z-index: 9999 !important;
        position: relative !important;
      }
      
      .ct-tv-focused:focus {
        outline: 3px solid #00ff00 !important;
      }
    `
    document.head.appendChild(style)
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
      } : null
    }
  }
}

// Static property to hold singleton instance
TVNavigation.instance = null

export default TVNavigation
