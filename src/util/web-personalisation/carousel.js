import { CTWebPersonalisationBanner } from './banner'
export class CTWebPersonalisationCarousel extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    if (customElements.get('ct-web-personalisation-banner') === undefined) {
      customElements.define('ct-web-personalisation-banner', CTWebPersonalisationBanner)
    }
  }

  _target = null
  _carousel = null
  shadow = null
  slides = 0
  previouslySelectedItem = -1
  selectedItem = 1
  autoSlide = null
  stopAutoSlideTimeout = null

  get target () {
    return this._target || ''
  }

  set target (val) {
    if (this._target === null) {
      this._target = val
      this.renderCarousel()
    }
  }

  get details () {
    return this.target.display.details
  }

  get display () {
    return this.target.display
  }

  renderCarousel () {
    this.slides = this.details.length
    this.shadow.innerHTML = this.getStyles()
    const carousel = this.getCarouselContent()
    if (this.display.showNavBtns) {
      carousel.insertAdjacentHTML('beforeend', this.display.navBtnsHtml)
    }
    if (this.display.showNavArrows) {
      carousel.insertAdjacentHTML('beforeend', this.display.leftNavArrowHtml)
      carousel.insertAdjacentHTML('beforeend', this.display.rightNavArrowHtml)
    }
    this._carousel = carousel
    this.shadow.appendChild(carousel)
    this.setupClick()
    this.updateSelectedItem()
    // TODO: enable conditionally
    this.startAutoSlide()
    this.setupOnHover()
    window.clevertap.renderNotificationViewed({ msgId: this.target.wzrk_id, pivotId: this.target.wzrk_pivot })
  }

  setupClick () {
    this._carousel.addEventListener('click', (event) => {
      const eventID = event.target.id
      if (eventID.startsWith('carousel__button')) {
        const selected = +eventID.split('-')[1]
        if (selected !== this.selectedItem) {
          this.previouslySelectedItem = this.selectedItem
          this.selectedItem = selected
          this.updateSelectedItem()
          this.startAutoSlide()
        }
      } else if (eventID.startsWith('carousel__arrow')) {
        eventID.endsWith('right') ? this.goToNext() : this.goToPrev()
        this.startAutoSlide()
      } else if (eventID.indexOf('-') > -1) {
        const item = +eventID.split('-')[1]
        const index = item - 1
        if (window.parent.clevertap) {
          // console.log('Raise notification clicked event for ', item)
          window.clevertap.renderNotificationClicked({ msgId: this.target.wzrk_id, pivotId: this.target.wzrk_pivot, wzrk_slideNo: item })
        }
        const url = this.details[index].onClick
        if (url !== '') {
          this.details[index].window ? window.open(url, '_blank') : window.location.href = url
        }
      }
    })
  }

  setupOnHover () {
    this._carousel.addEventListener('mouseenter', (event) => {
      this.stopAutoSlideTimeout = setTimeout(() => {
        this.autoSlide = clearInterval(this.autoSlide)
      }, 500)
    })

    this._carousel.addEventListener('mouseleave', (event) => {
      clearTimeout(this.stopAutoSlideTimeout)
      if (this.autoSlide === undefined) {
        this.startAutoSlide()
      }
    })
  }

  getCarouselContent () {
    const carousel = document.createElement('div')
    carousel.setAttribute('class', 'carousel')

    this.details.forEach((detail, i) => {
      const banner = document.createElement('ct-web-personalisation-banner')
      banner.classList.add('carousel__item')
      banner.trackClick = false
      banner.setAttribute('id', `carousel__item-${i + 1}`)
      banner.details = detail
      carousel.appendChild(banner)
    })

    return carousel
  }

  getStyles () {
    return `
      <style>
      .carousel {
        position: relative;
      }

      .carousel__item {
        background-color: grey;
        display: none;
        background-repeat: no-repeat;
        background-size: cover;
      }

      .carousel__item img {
        height: ${this.target && this.target.display && this.target.display.divHeight ? this.target.display.divHeight : 'auto'};
        width: 100%;
        transition: 2s;
      }

      .carousel__item--selected {
        display: block;
      }
      ${this.display.navBtnsCss}
      ${this.display.navArrowsCss}
      </style>
  `
  }

  updateSelectedItem () {
    if (this.previouslySelectedItem !== -1) {
      const prevItem = this.shadow.getElementById(`carousel__item-${this.previouslySelectedItem}`)
      const prevButton = this.shadow.getElementById(`carousel__button-${this.previouslySelectedItem}`)
      prevItem.classList.remove('carousel__item--selected')
      prevButton.classList.remove('carousel__button--selected')
    }
    const item = this.shadow.getElementById(`carousel__item-${this.selectedItem}`)
    const button = this.shadow.getElementById(`carousel__button-${this.selectedItem}`)
    item.classList.add('carousel__item--selected')
    button.classList.add('carousel__button--selected')
  }

  startAutoSlide () {
    clearInterval(this.autoSlide)
    this.autoSlide = setInterval(() => {
      this.goToNext()
    }, this.display.sliderTime ? this.display.sliderTime * 1000 : 3000)
  }

  goToNext () {
    this.goTo(this.selectedItem, (this.selectedItem + 1) % this.slides)
  }

  goToPrev () {
    this.goTo(this.selectedItem, this.selectedItem - 1)
  }

  goTo (prev, cur) {
    this.previouslySelectedItem = prev
    this.selectedItem = cur
    if (cur === 0) {
      this.selectedItem = this.slides
    }
    this.updateSelectedItem()
  }
}
