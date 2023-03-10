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

      const resizeCallback = this.updateImageAndContainerWidth()
      this.popup.addEventListener('load', resizeCallback)
      window.addEventListener('resize', resizeCallback)

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

    initialWindowWidth = 0
    initialImgWidth = 0

    // TODO - Add comments
    updateImageAndContainerWidth () {
      return () => {
        // setting initial width to calculate scale ratio later
        if (!this.initialWindowWidth) {
          this.initialWindowWidth = window.innerWidth
          this.initialImgWidth = this.popup.width
        }

        // get scaled width
        const width = this.getRenderedImageWidth()

        // set style properties with scaled
        this.popup.style.setProperty('width', `${width}px`)
        this.container.style.setProperty('width', `${width}px`)
        this.container.style.setProperty('height', 'auto')
        this.popup.style.setProperty('visibility', 'visible')
        this.closeIcon.style.setProperty('visibility', 'visible')
        document.getElementById('wzrkImageOnlyDiv').style.visibility = 'visible'
      }
    }

    getRenderedImageWidth () {
      const ratio = window.innerWidth / this.initialWindowWidth
      return this.initialImgWidth * ratio
    }
}
