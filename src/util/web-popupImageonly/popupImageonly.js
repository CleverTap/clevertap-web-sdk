export class CTWebPopupImageOnly extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

    _target = null
    shadow = null
    popup = null

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

    renderImageOnlyPopup () {
      this.shadow.innerHTML = this.getImageOnlyPopupContent()
      this.popup = this.shadowRoot.getElementById('imageOnlyPopup')
      this.popup.addEventListener('load', this.updateImageWidth(this.popup, this.target.msgContent.border))
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

    /* We need to specify the width as 100% on the image tag, else it won't scale up although
    * there's room for scaling
    * this function is needed to remove the whitespaces present that gets introduced due to object-fit: contain
    * around the image
    * while adding border to images, in case it's landscape and it's max-width is set to 100%,
    * in some cases, the border overflows outside the vw
    * One fix would be to add box-sizing:border-box; but behaves weirdly while calculating the width
    * and the resulting image does not occupy the full width althoug there's room for scaling.
    * Same issue with portrait images wrt to height on mobile devices
    * Thus this hack
    */
    updateImageWidth (img, border) {
      return () => {
        const borderSize = border !== 'none' ? parseInt(border.split('px')[0]) : 0

        const { width, height } = this.getRenderedImageWidthAndHeight(img, 2 * borderSize)
        const _width = width ? `${width}px` : 'auto'
        const _height = height ? `${height}px` : 'auto'

        img.style.setProperty('width', _width)
        img.style.setProperty('height', _height)

        img.style.setProperty('border', border)
        img.style.setProperty('visibility', 'visible')
      }
    }

    getRenderedImageWidthAndHeight (img, borderSize) {
      const ratio = img.naturalWidth / img.naturalHeight
      if (window.innerHeight <= img.height + borderSize) {
        const width = (img.height - borderSize) * ratio
        return { width }
      } else if (window.innerWidth <= img.width + borderSize) {
        const height = (img.width - borderSize) / ratio
        return { height }
      } else {
        const width = img.height * ratio
        return { width }
      }
    }
}
