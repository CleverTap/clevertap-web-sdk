export class CTWebPersonalisationBanner extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  _details = null
  shadow = null

  get details () {
    return this._details || ''
  }

  set details (val) {
    if (this._details === null) {
      this._details = val
      this.renderBanner()
    }
  }

  renderBanner () {
    this.shadow.innerHTML = this.getBannerContent()
    if (this.trackClick !== false) {
      this.addEventListener('click', () => {
        const onClickUrl = this.details.onClick
        if (onClickUrl) {
          this.details.window ? window.open(onClickUrl, '_blank') : window.parent.location.href = onClickUrl
        }
        window.clevertap.renderNotificationClicked({ msgId: this.msgId, pivotId: this.pivotId })
      })
    }
    window.clevertap.renderNotificationViewed({ msgId: this.msgId, pivotId: this.pivotId })
  }

  getBannerContent () {
    return `
      <style type="text/css">
        .banner {
          position: relative;
          cursor: pointer;
        }
        img {
          height: auto;
          width: 100%;
        }
        .wrapper:is(.left, .right, .center) {
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: auto;
          top: 0;
        }
        ${this.details.css ? this.details.css : ''}
      </style>
      <div class="banner">
        <picture>
          <source media="(min-width:480px)" srcset="${this.details.desktopImageURL}">
          <source srcset="${this.details.mobileImageURL}">
          <img src="${this.details.desktopImageURL}" alt="Please upload a picture" style="width:100%;">
        </picture>
        ${this.details.html ? this.details.html : ''}
      </div>
    `
  }
}
