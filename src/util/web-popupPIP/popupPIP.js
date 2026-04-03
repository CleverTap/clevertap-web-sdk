import {
  getCampaignObject,
  saveCampaignObject
} from '../clevertap'
import {
  PIP_COLLAPSE_ICON_SVG,
  PIP_PAUSE_ICON_SVG,
  PIP_UNMUTE_ICON_SVG
} from '../constants'
import { StorageManager } from '../storage'
import {
  PIP_ANCHOR_FLEX,
  PIP_DRAG_CONTROL_SELECTOR,
  PIP_EXPAND_RUNTIME_CSS,
  getPipOnClickAction,
  runPipClickAction as executePipClickAction
} from './pipPopupUtils'

export class CTWebPopupPIP extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  getShadowRoot () {
    return this.shadow
  }

    _target = null
    _session = null
    shadow = null
    popup = null
    container = null
    mediaDesktop = null
    mediaMobile = null
    resizeObserver = null
    _revealFallbackTimer = undefined
    _pipDragAbort = null
    /** @type {HTMLElement | null} */
    pipOverlay = null
    _pipDragPointerId = null
    playControlBtn = null
    expandControlBtn = null
    muteControlBtn = null
    _pipExpanded = false
    _pipPlaySvgFromTemplate = ''
    _pipExpandSvgFromTemplate = ''
    _pipMuteSvgFromTemplate = ''

    get target () {
      return this._target || ''
    }

    set target (val) {
      if (this._target === null) {
        this._target = val
        this.renderPIPPopup()
      }
    }

    get session () {
      return this._session || ''
    }

    set session (val) {
      this._session = val
    }

    get msgId () {
      return this.target.wzrk_id
    }

    get pivotId () {
      return this.target.wzrk_pivot
    }

    get desktopAltText () {
      return this.target.display.desktopAlt || this.target.display?.media?.alt_text
    }

    get mobileAltText () {
      return this.target.display.mobileALt ||
        this.target.display?.mobile?.media?.alt_text ||
        this.target.display?.media?.alt_text
    }

    /** Desktop vs mobile PIP config and media use a 480px breakpoint. */
    isWideViewport () {
      return window.innerWidth > 480
    }

    getActiveMedia () {
      return this.isWideViewport() ? this.mediaDesktop : this.mediaMobile
    }

    getPipDisplayConfig () {
      const d = this.target.display
      return this.isWideViewport() ? (d.pip || {}) : (d.mobile?.pip || d.pip || {})
    }

    /** @param {(v: HTMLVideoElement) => void} fn */
    forEachVideo (fn) {
      if (this.mediaDesktop) fn(this.mediaDesktop)
      if (this.mediaMobile) fn(this.mediaMobile)
    }

    applyPopupTitle (popup) {
      if (!popup) return
      const title = this.isWideViewport()
        ? (this.desktopAltText || '')
        : (this.mobileAltText || '')
      popup.setAttribute('title', title)
    }

    getPipFallbackWidthPx () {
      const pip = this.getPipDisplayConfig()
      const pct = typeof pip.width === 'number' ? pip.width : 40
      return (window.innerWidth * pct) / 100
    }

    isPipDragEnabled () {
      return this.getPipDisplayConfig().controls?.drag === true
    }

    isPipPlayPauseEnabled () {
      return this.getPipDisplayConfig().controls?.playPause !== false
    }

    isPipExpandCollapseEnabled () {
      return this.getPipDisplayConfig().controls?.expandCollapse !== false
    }

    isPipMuteEnabled () {
      return this.getPipDisplayConfig().controls?.mute !== false
    }

    closePipTemplate () {
      if (!this.container) return
      const campaignId = this.target.wzrk_id.split('_')[0]
      if (this.resizeObserver) {
        this.resizeObserver.unobserve(this.container)
      }
      if (this._revealFallbackTimer !== undefined) {
        clearTimeout(this._revealFallbackTimer)
        this._revealFallbackTimer = undefined
      }
      if (this._pipDragAbort) {
        this._pipDragAbort.abort()
        this._pipDragAbort = null
      }
      this._pipDragPointerId = null
      const host = document.getElementById('wizPIPDiv')
      if (host) {
        host.style.display = 'none'
      }
      this.remove()
      if (campaignId != null && campaignId !== '-1') {
        if (StorageManager._isLocalStorageSupported()) {
          const campaignObj = getCampaignObject()

          campaignObj.dnd = [...new Set([
            ...(campaignObj.dnd ?? []),
            campaignId
          ])]
          saveCampaignObject(campaignObj)
        }
      }
    }

    runPipClickAction () {
      executePipClickAction({
        pipConfig: this.getPipDisplayConfig(),
        display: this.target.display,
        targetingMsgJson: this.target,
        preview: this.target.display.preview,
        closeTemplate: () => this.closePipTemplate()
      })
    }

    setupPipClickAction () {
      const action = getPipOnClickAction(this.getPipDisplayConfig())
      if (!action || !this.container) return

      this.container.addEventListener('click', (e) => {
        if (e.target.closest(PIP_DRAG_CONTROL_SELECTOR)) return
        this.runPipClickAction()
      })
    }

    capturePipTemplateControlSvgs () {
      const pairs = [
        [this.playControlBtn, '_pipPlaySvgFromTemplate'],
        [this.expandControlBtn, '_pipExpandSvgFromTemplate'],
        [this.muteControlBtn, '_pipMuteSvgFromTemplate']
      ]
      for (let i = 0; i < pairs.length; i++) {
        const el = pairs[i][0]
        const prop = pairs[i][1]
        const svg = el?.querySelector('svg')
        if (svg) this[prop] = svg.innerHTML
      }
    }

    updatePipExpandButtonIcon () {
      if (!this.expandControlBtn) return
      const svg = this.expandControlBtn.querySelector('svg')
      if (!svg) return
      svg.innerHTML = this._pipExpanded
        ? PIP_COLLAPSE_ICON_SVG
        : (this._pipExpandSvgFromTemplate || '')
      this.expandControlBtn.setAttribute('aria-label', this._pipExpanded ? 'Collapse' : 'Expand')
      this.expandControlBtn.setAttribute('aria-expanded', this._pipExpanded ? 'true' : 'false')
    }

    setPipExpanded (expanded) {
      const overlay = this.pipOverlay || this.shadowRoot?.querySelector('.ct-pip-overlay')
      if (!overlay || !this.container) return
      this._pipExpanded = expanded
      if (expanded) {
        overlay.classList.add('ct-pip--expanded')
        this.container.style.width = ''
        this.container.style.height = ''
        this.forEachVideo((v) => {
          v.style.width = ''
          v.style.height = ''
          v.style.setProperty('object-fit', 'contain')
        })
      } else {
        overlay.classList.remove('ct-pip--expanded')
        this.forEachVideo((v) => {
          v.style.removeProperty('object-fit')
          v.style.width = ''
          v.style.height = ''
        })
        this.handleResize(this.getActiveMedia(), this.container)
      }
      this.updatePipExpandButtonIcon()
    }

    syncPipPlayButtonIcon () {
      if (!this.isPipPlayPauseEnabled()) return
      const video = this.getActiveMedia()
      if (video && this.playControlBtn) {
        this.updatePipPlayButtonIcon(video)
      }
    }

    updatePipPlayButtonIcon (video) {
      if (!this.playControlBtn) return
      const svg = this.playControlBtn.querySelector('svg')
      if (!svg) return
      const paused = video.paused
      svg.innerHTML = paused
        ? (this._pipPlaySvgFromTemplate || '')
        : PIP_PAUSE_ICON_SVG
      this.playControlBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause')
    }

    setupPipPlayPauseToggle () {
      if (!this.isPipPlayPauseEnabled() || !this.playControlBtn) return

      const onPlayOrPause = () => this.syncPipPlayButtonIcon()
      this.forEachVideo((video) => {
        video.addEventListener('play', onPlayOrPause)
        video.addEventListener('pause', onPlayOrPause)
      })

      this.playControlBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const video = this.getActiveMedia()
        if (!video) return
        if (video.paused) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      })

      this.syncPipPlayButtonIcon()
    }

    syncPipMuteButtonIcon () {
      if (!this.isPipMuteEnabled()) return
      const video = this.getActiveMedia()
      if (video && this.muteControlBtn) {
        this.updatePipMuteButtonIcon(video)
      }
    }

    updatePipMuteButtonIcon (video) {
      if (!this.muteControlBtn) return
      const svg = this.muteControlBtn.querySelector('svg')
      if (!svg) return
      svg.innerHTML = video.muted
        ? PIP_UNMUTE_ICON_SVG
        : (this._pipMuteSvgFromTemplate || '')
      this.muteControlBtn.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute')
      this.muteControlBtn.setAttribute('aria-pressed', video.muted ? 'true' : 'false')
    }

    applyPipMutedToAllVideos (muted) {
      this.forEachVideo((v) => {
        v.muted = muted
      })
    }

    setupPipMuteToggle () {
      if (!this.isPipMuteEnabled() || !this.muteControlBtn) return

      const onVolumeChange = () => this.syncPipMuteButtonIcon()
      this.forEachVideo((video) => {
        video.addEventListener('volumechange', onVolumeChange)
      })

      this.muteControlBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const video = this.getActiveMedia()
        if (!video) return
        this.applyPipMutedToAllVideos(!video.muted)
        this.syncPipMuteButtonIcon()
      })

      this.syncPipMuteButtonIcon()
    }

    setupPipExpandCollapse () {
      if (!this.isPipExpandCollapseEnabled() || !this.expandControlBtn || !this.pipOverlay) {
        return
      }
      this.expandControlBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.setPipExpanded(!this._pipExpanded)
      })
      this.updatePipExpandButtonIcon()
    }

    snapPipContainerToAnchor () {
      if (this._pipExpanded) return
      const overlay = this.pipOverlay || this.shadowRoot?.querySelector('.ct-pip-overlay')
      if (!overlay || !this.container) return

      const rect = this.container.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const iw = window.innerWidth
      const ih = window.innerHeight
      const pip = this.getPipDisplayConfig()
      const mv = pip.margins?.vertical ?? 5
      const mh = pip.margins?.horizontal ?? 5
      const marginPxV = (ih * mv) / 100
      const marginPxH = (iw * mh) / 100
      const w = rect.width
      const h = rect.height

      const anchors = [
        { key: 'center', x: iw / 2, y: ih / 2 },
        { key: 'top-right', x: iw - marginPxH - w / 2, y: marginPxV + h / 2 },
        { key: 'top-left', x: marginPxH + w / 2, y: marginPxV + h / 2 },
        { key: 'bottom-right', x: iw - marginPxH - w / 2, y: ih - marginPxV - h / 2 },
        { key: 'bottom-left', x: marginPxH + w / 2, y: ih - marginPxV - h / 2 },
        { key: 'top', x: iw / 2, y: marginPxV + h / 2 },
        { key: 'bottom', x: iw / 2, y: ih - marginPxV - h / 2 },
        { key: 'left', x: marginPxH + w / 2, y: ih / 2 },
        { key: 'right', x: iw - marginPxH - w / 2, y: ih / 2 }
      ]

      const bestKey = anchors.reduce(
        (acc, a) => {
          const dx = cx - a.x
          const dy = cy - a.y
          const d = dx * dx + dy * dy
          return d < acc.dist ? { key: a.key, dist: d } : acc
        },
        { key: 'center', dist: Infinity }
      ).key

      const flex = PIP_ANCHOR_FLEX[bestKey]
      overlay.style.setProperty('align-items', flex.alignItems)
      overlay.style.setProperty('justify-content', flex.justifyContent)

      this.container.style.position = ''
      this.container.style.left = ''
      this.container.style.top = ''
      this.container.style.right = ''
      this.container.style.bottom = ''
      this.container.style.margin = ''
    }

    setupPipDrag () {
      if (!this.isPipDragEnabled() || !this.container) return
      this.pipOverlay = this.shadowRoot.querySelector('.ct-pip-overlay')
      if (!this.pipOverlay) return

      this.container.style.touchAction = 'none'
      if (this._pipDragAbort) {
        this._pipDragAbort.abort()
      }
      this._pipDragAbort = new AbortController()
      const { signal } = this._pipDragAbort

      let dragOffsetX = 0
      let dragOffsetY = 0

      const onPointerDown = (e) => {
        if (this._pipExpanded) return
        if (e.pointerType === 'mouse' && e.button !== 0) return
        if (e.target.closest(PIP_DRAG_CONTROL_SELECTOR)) return

        this._pipDragPointerId = e.pointerId
        const r = this.container.getBoundingClientRect()
        dragOffsetX = e.clientX - r.left
        dragOffsetY = e.clientY - r.top
        try {
          this.container.setPointerCapture(e.pointerId)
        } catch (_err) {
          this._pipDragPointerId = null
          return
        }

        this.container.style.position = 'fixed'
        this.container.style.left = `${r.left}px`
        this.container.style.top = `${r.top}px`
        this.container.style.right = 'auto'
        this.container.style.bottom = 'auto'
        this.container.style.margin = '0'
      }

      const onPointerMove = (e) => {
        if (this._pipDragPointerId == null || e.pointerId !== this._pipDragPointerId) {
          return
        }
        let left = e.clientX - dragOffsetX
        let top = e.clientY - dragOffsetY
        const cw = this.container.offsetWidth
        const ch = this.container.offsetHeight
        left = Math.max(0, Math.min(left, window.innerWidth - cw))
        top = Math.max(0, Math.min(top, window.innerHeight - ch))
        this.container.style.left = `${left}px`
        this.container.style.top = `${top}px`
      }

      const endDrag = (e) => {
        if (this._pipDragPointerId == null || e.pointerId !== this._pipDragPointerId) {
          return
        }
        try {
          this.container.releasePointerCapture(e.pointerId)
        } catch (_err) {}
        this._pipDragPointerId = null
        this.snapPipContainerToAnchor()
      }

      this.container.addEventListener('pointerdown', onPointerDown, { signal })
      this.container.addEventListener('pointermove', onPointerMove, { signal })
      this.container.addEventListener('pointerup', endDrag, { signal })
      this.container.addEventListener('pointercancel', endDrag, { signal })
    }

    renderPIPPopup () {
      this._pipExpanded = false
      this.shadow.innerHTML = this.getPIPPopupContent()
      const expandStyle = document.createElement('style')
      expandStyle.textContent = PIP_EXPAND_RUNTIME_CSS
      this.shadow.appendChild(expandStyle)
      this.mediaDesktop = this.shadowRoot.querySelector('.ct-pip-media--desktop')
      this.mediaMobile = this.shadowRoot.querySelector('.ct-pip-media--mobile')
      this.popup = this.getActiveMedia()
      this.container = this.shadowRoot.getElementById('ct-pip-container')
      this.closeIcon = this.shadowRoot.getElementById('ct-pip-close')
      this.playControlBtn = this.shadowRoot.getElementById('ct-pip-play')
      this.expandControlBtn = this.shadowRoot.getElementById('ct-pip-expand')
      this.muteControlBtn = this.shadowRoot.getElementById('ct-pip-mute')
      this.pipOverlay = this.shadowRoot.querySelector('.ct-pip-overlay')

      if (!this.container) {
        return
      }

      this.container.setAttribute('role', 'dialog')
      this.container.setAttribute('aria-modal', 'true')

      this.capturePipTemplateControlSvgs()

      const tryReveal = () => this.revealPIPContent(false)
      const forceReveal = () => this.revealPIPContent(true)
      this.forEachVideo((video) => {
        video.addEventListener('loadeddata', tryReveal, { once: true })
        video.addEventListener('error', forceReveal, { once: true })
      })
      tryReveal()

      this._revealFallbackTimer = window.setTimeout(forceReveal, 2500)

      this.resizeObserver = new ResizeObserver(() =>
        this.handleResize(this.getActiveMedia(), this.container))
      this.resizeObserver.observe(this.container)

      if (this.closeIcon) {
        this.closeIcon.addEventListener('click', () => this.closePipTemplate())
      }

      if (!this.target.display.preview) {
        window.clevertap.renderNotificationViewed({
          msgId: this.msgId,
          pivotId: this.pivotId
        })
      }

      this.setupPipPlayPauseToggle()
      this.setupPipMuteToggle()
      this.setupPipExpandCollapse()
      this.setupPipDrag()
      this.setupPipClickAction()
    }

    handleResize (popup, container) {
      this.popup = popup
      if (this._pipExpanded) {
        if (!popup) return
        this.applyPopupTitle(popup)
        this.syncPipPlayButtonIcon()
        this.syncPipMuteButtonIcon()
        return
      }
      let width = this.getRenderedVideoWidth(popup)
      if (popup && container && width <= 0) {
        width = this.getPipFallbackWidthPx()
      }
      if (popup && container && width > 0) {
        container.style.setProperty('width', `${width}px`)
      }
      if (!popup) return
      this.applyPopupTitle(popup)
      this.syncPipPlayButtonIcon()
      this.syncPipMuteButtonIcon()
    }

    getPIPPopupContent () {
      return `
        ${this.target.msgContent.css}
        ${this.target.msgContent.html}
      `
    }

    revealPIPContent (force) {
      if (!this.container) return
      this.popup = this.getActiveMedia()
      const hasRenderableMedia = !!(this.mediaDesktop || this.mediaMobile)
      const activeReady = this.popup &&
        this.popup.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      if (hasRenderableMedia && !activeReady && !force) {
        return
      }
      if (this.popup && hasRenderableMedia) {
        let width = this.getRenderedVideoWidth(this.popup)
        if (width <= 0) {
          width = this.getPipFallbackWidthPx()
        }
        if (width > 0) {
          this.popup.style.setProperty('width', `${width}px`)
          this.container.style.setProperty('width', `${width}px`)
        }
      }
      this.container.style.setProperty('height', 'auto')
      if (this.popup) {
        this.popup.style.setProperty('visibility', 'visible')
      }
      if (this.closeIcon) {
        this.closeIcon.style.setProperty('visibility', 'visible')
      }
      const host = document.getElementById('wizPIPDiv')
      if (host) {
        host.style.visibility = 'visible'
      }
    }

    getRenderedVideoWidth (video) {
      if (!video || !video.videoWidth || !video.videoHeight) {
        return 0
      }
      const ratio = video.videoWidth / video.videoHeight
      const h = video.clientHeight || video.offsetHeight
      if (!h || h < 1) {
        return this.getPipFallbackWidthPx()
      }
      return h * ratio
    }
}
