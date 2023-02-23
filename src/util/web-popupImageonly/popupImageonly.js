export class CTWebPopupImageOnly extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

    _target = null
    shadow = null
    popup = null
    container = null

    get target () {
      return this._target || ''
    }

    set target (val) {
      if (this._target === null) {
        this._target = val
        this.renderImageOnlyPopup()
      }
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

    // TODO - handle resize coz there can be a scenario where the user changes the orientation b/w portrait and landscape
    renderImageOnlyPopup () {
      this.shadow.innerHTML = this.getImageOnlyPopupContent()
      this.popup = this.shadowRoot.getElementById('imageOnlyPopup')
      this.container = this.shadowRoot.getElementById('container')
      this.closeIcon = this.shadowRoot.getElementById('close')

      this.popup.addEventListener('load', this.updateImageAndContainerWidth())

      this.closeIcon.addEventListener('click', () => {
        document.getElementById('wzrkImageOnlyDiv').style.display = 'none'
        this.remove()
      })

      window.clevertap.renderNotificationViewed({ msgId: this.msgId, pivotId: this.pivotId })

      if (this.onClickUrl) {
        this.popup.addEventListener('click', () => {
          this.target.display.window ? window.open(this.onClickUrl, '_blank') : window.parent.location.href = this.onClickUrl
          window.clevertap.renderNotificationClicked({ msgId: this.msgId, pivotId: this.pivotId })
        })
      }
    }

    getImageOnlyPopupContent () {
      return `
        ${this.target.msgContent.css}
        ${this.target.msgContent.html}
      `
    }

    // TODO - Add comments
    updateImageAndContainerWidth () {
      return () => {
        const width = this.getRenderedImageWidth(this.popup)
        this.popup.style.setProperty('width', `${width}px`)
        this.container.style.setProperty('width', `${width}px`)
        this.container.style.setProperty('height', 'auto')
        this.popup.style.setProperty('visibility', 'visible')
        this.closeIcon.style.setProperty('visibility', 'visible')
      }
    }

    getRenderedImageWidth (img) {
      const ratio = img.naturalWidth / img.naturalHeight
      return img.height * ratio
    }
}
