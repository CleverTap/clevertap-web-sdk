// tvNavigation.js - Universal TV Navigation Module for all TV platforms
import { $ct } from '../util/storage'

class TVNavigation {
  constructor (logger) {
    this.logger = logger
    this.isEnabled = false
    this.currentMenu = null
    this.focusableElements = []
    this.currentFocusIndex = 0

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
    if (!$ct.enableTVNavigation) {
      this.logger.debug('TV Navigation disabled')
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
    document.addEventListener('keydown', (event) => {
      if (!this.isEnabled) return

      this.handleKeyPress(event)
    }, { capture: true, passive: false })
  }

  // Handle key press events - Universal TV platform support
  handleKeyPress (event) {
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
        background-color: #0078d4 !important;
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

  // Get current state
  getState () {
    return {
      isEnabled: this.isEnabled,
      currentFocusIndex: this.currentFocusIndex,
      totalElements: this.focusableElements.length,
      platform: this.platform
    }
  }
}

export default TVNavigation
