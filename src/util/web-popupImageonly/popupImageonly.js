import {
  getCampaignObject,
  saveCampaignObject
} from '../clevertap'
import { StorageManager } from '../storage'
import { ACTION_TYPES } from '../constants'

export class CTWebPopupImageOnly extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

    _target = null
    _session = null
    shadow = null
    popup = null
    container = null
    resizeObserver = null

    get target () {
      return this._target || ''
    }

    set target (val) {
      if (this._target === null) {
        this._target = val
        this.renderImageOnlyPopup()
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

    get onClickUrl () {
      return this.target.display.onClickUrl
    }

    get onClickAction () {
      return this.target.display.onClickAction
    }

    renderImageOnlyPopup () {
      this.shadow.innerHTML = this.getImageOnlyPopupContent()
      this.popup = this.shadowRoot.getElementById('imageOnlyPopup')
      this.container = this.shadowRoot.getElementById('container')
      this.closeIcon = this.shadowRoot.getElementById('close')

      this.popup.addEventListener('load', this.updateImageAndContainerWidth())
      this.resizeObserver = new ResizeObserver(() => this.handleResize(this.popup, this.container))
      this.resizeObserver.observe(this.popup)

      this.closeIcon.addEventListener('click', () => {
        this.removeImgOnlyPopup(this.target)
      })

      window.clevertap.renderNotificationViewed({ msgId: this.msgId, pivotId: this.pivotId })

      if (this.onClickUrl) {
        this.popup.addEventListener('click', () => {
          this.handlePopupClick(this.target)
        })
      }
    }

    handleResize (popup, container) {
      const width = this.getRenderedImageWidth(popup)
      container.style.setProperty('width', `${width}px`)
    }

    getImageOnlyPopupContent () {
      return `
        ${this.target.msgContent.css}
        ${this.target.msgContent.html}
      `
    }

    updateImageAndContainerWidth () {
      return () => {
        const width = this.getRenderedImageWidth(this.popup)
        this.popup.style.setProperty('width', `${width}px`)
        this.container.style.setProperty('width', `${width}px`)
        this.container.style.setProperty('height', 'auto')
        this.container.style.setProperty('position', 'fixed')
        this.popup.style.setProperty('visibility', 'visible')
        this.closeIcon.style.setProperty('visibility', 'visible')
        document.getElementById('wzrkImageOnlyDiv').style.visibility = 'visible'
      }
    }

    getRenderedImageWidth (img) {
      const ratio = img.naturalWidth / img.naturalHeight
      return img.height * ratio
    }

    handlePopupClick (targetMsg) {
      if (!targetMsg.display.preview) {
        window.clevertap.renderNotificationClicked({
          msgId: this.msgId,
          pivotId: this.pivotId
        })
      }
      switch (this.onClickAction) {
        case ACTION_TYPES.OPEN_LINK_AND_CLOSE:
          targetMsg.display.window ? window.open(this.onClickUrl, '_blank') : window.parent.location.href = this.onClickUrl
          this.removeImgOnlyPopup(targetMsg)
          break
        case ACTION_TYPES.PUSH_PROMPT:
          window.clevertap.notifications.push({
            skipDialog: true
          })
          targetMsg.display.window ? window.open(this.onClickUrl, '_blank') : window.parent.location.href = this.onClickUrl
          this.removeImgOnlyPopup(targetMsg)
          break
        case ACTION_TYPES.OPEN_LINK:
        default:
          targetMsg.display.window ? window.open(this.onClickUrl, '_blank') : window.parent.location.href = this.onClickUrl
          this.removeImgOnlyPopup(targetMsg, false)
      }
    }

    removeImgOnlyPopup (targetMsg, closePopup = true) {
      const campaignId = targetMsg.wzrk_id.split('_')[0]
      const currentSessionId = this.session.sessionId
      if (closePopup) {
        this.resizeObserver.unobserve(this.popup)
        document.getElementById('wzrkImageOnlyDiv').style.display = 'none'
        this.remove()
      }
      if (campaignId != null && campaignId !== '-1') {
        if (StorageManager._isLocalStorageSupported()) {
          const campaignObj = getCampaignObject()

          let sessionCampaignObj = campaignObj.wp[currentSessionId]
          if (sessionCampaignObj == null) {
            sessionCampaignObj = {}
            campaignObj[currentSessionId] = sessionCampaignObj
          }
          sessionCampaignObj[campaignId] = 'dnd'
          saveCampaignObject(campaignObj)
        }
      }
    }
}
