import {
  getCampaignObject,
  saveCampaignObject
} from '../clevertap'
import { StorageManager } from '../storage'

const PIP_DRAG_CONTROL_SELECTOR =
  '#ct-pip-close, #ct-pip-expand, #ct-pip-play, #ct-pip-mute'

const PIP_PLAY_ICON_SVG = '<path d="M6 14.5007V5.50073C6 5.11831 6.41183 4.87746 6.74513 5.06494L14.7451 9.56494C15.085 9.75609 15.085 10.2454 14.7451 10.4365L6.74513 14.9365C6.41183 15.124 6 14.8831 6 14.5007ZM13.48 10.0007L7 6.35573V13.6447L13.48 10.0007Z" fill="currentColor"></path>'

const PIP_PAUSE_ICON_SVG = '<path d="M7 5h2v10H7V5zm4 0h2v10h-2V5z" fill="currentColor"></path>'

/** Nearest anchor id -> flex placement on `.ct-pip-overlay` (row: justify = horizontal, align = vertical). */
const PIP_ANCHOR_FLEX = {
  center: { alignItems: 'center', justifyContent: 'center' },
  'top-right': { alignItems: 'flex-start', justifyContent: 'flex-end' },
  'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start' },
  'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
  'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
  top: { alignItems: 'flex-start', justifyContent: 'center' },
  bottom: { alignItems: 'flex-end', justifyContent: 'center' },
  left: { alignItems: 'center', justifyContent: 'flex-start' },
  right: { alignItems: 'center', justifyContent: 'flex-end' }
}

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

    getActiveMedia () {
      if (window.innerWidth > 480) {
        return this.mediaDesktop
      }
      return this.mediaMobile
    }

    getPipDisplayConfig () {
      const d = this.target.display
      if (window.innerWidth > 480) {
        return d.pip || {}
      }
      return d.mobile?.pip || d.pip || {}
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
      svg.innerHTML = paused ? PIP_PLAY_ICON_SVG : PIP_PAUSE_ICON_SVG
      this.playControlBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause')
    }

    setupPipPlayPauseToggle () {
      if (!this.isPipPlayPauseEnabled() || !this.playControlBtn) return

      const onPlayOrPause = () => this.syncPipPlayButtonIcon()
      ;[this.mediaDesktop, this.mediaMobile].forEach((video) => {
        if (!video) return
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

    snapPipContainerToAnchor () {
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

      let bestKey = 'center'
      let bestDist = Infinity
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i]
        const dx = cx - a.x
        const dy = cy - a.y
        const d = dx * dx + dy * dy
        if (d < bestDist) {
          bestDist = d
          bestKey = a.key
        }
      }

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
      this.shadow.innerHTML = this.getPIPPopupContent()
      this.mediaDesktop = this.shadowRoot.querySelector('.ct-pip-media--desktop')
      this.mediaMobile = this.shadowRoot.querySelector('.ct-pip-media--mobile')
      this.popup = this.getActiveMedia()
      this.container = this.shadowRoot.getElementById('ct-pip-container')
      this.closeIcon = this.shadowRoot.getElementById('ct-pip-close')
      this.playControlBtn = this.shadowRoot.getElementById('ct-pip-play')

      if (!this.container) {
        return
      }

      this.container.setAttribute('role', 'dialog')
      this.container.setAttribute('aria-modal', 'true')

      const tryReveal = () => this.revealPIPContent(false)
      const forceReveal = () => this.revealPIPContent(true)
      ;[this.mediaDesktop, this.mediaMobile].forEach((video) => {
        if (!video) return
        video.addEventListener('loadeddata', tryReveal, { once: true })
        video.addEventListener('error', forceReveal, { once: true })
      })
      tryReveal()

      this._revealFallbackTimer = window.setTimeout(forceReveal, 2500)

      this.resizeObserver = new ResizeObserver(() =>
        this.handleResize(this.getActiveMedia(), this.container))
      this.resizeObserver.observe(this.container)

      const closeFn = () => {
        const campaignId = this.target.wzrk_id.split('_')[0]
        this.resizeObserver.unobserve(this.container)
        if (this._revealFallbackTimer !== undefined) {
          clearTimeout(this._revealFallbackTimer)
          this._revealFallbackTimer = undefined
        }
        if (this._pipDragAbort) {
          this._pipDragAbort.abort()
          this._pipDragAbort = null
        }
        this._pipDragPointerId = null
        document.getElementById('wizPIPDiv').style.display = 'none'
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

      if (this.closeIcon) {
        this.closeIcon.addEventListener('click', closeFn)
      }

      if (!this.target.display.preview) {
        window.clevertap.renderNotificationViewed({
          msgId: this.msgId,
          pivotId: this.pivotId
        })
      }

      this.setupPipPlayPauseToggle()
      this.setupPipDrag()
    }

    handleResize (popup, container) {
      this.popup = popup
      let width = this.getRenderedVideoWidth(popup)
      if (popup && container && width <= 0) {
        width = this.getPipFallbackWidthPx()
      }
      if (popup && container && width > 0) {
        container.style.setProperty('width', `${width}px`)
      }
      if (!popup) return
      if (window.innerWidth > 480) {
        popup.setAttribute('title', this.desktopAltText || '')
      } else {
        popup.setAttribute('title', this.mobileAltText || '')
      }
      this.syncPipPlayButtonIcon()
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
