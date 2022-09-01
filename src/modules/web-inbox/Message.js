import { messageStyles } from './inboxStyles'
import { determineTimeStampText } from './helper'
export class Message extends HTMLElement {
  constructor (config, message) {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.config = config
    this.message = message
    this.renderMessage(message)
  }

  wrapper = null

  get pivotId () {
    return this.message.wzrk_pivot
  }

  get campaignId () {
    return this.message.wzrk_id
  }

  createEl (type, id) {
    const _el = document.createElement(type)
    _el.setAttribute('id', id)
    return _el
  }

  renderMessage (msg) {
    this.wrapper = this.createEl('div', 'messageWrapper')

    switch (msg.templateType) {
      case 'text-only':
      case 'text-with-icon':
      case 'text-with-icon-and-image': {
        const message = this.prepareBasicMessage(msg.msg[0])
        this.wrapper.appendChild(message)
      }
    }

    const timeStamp = this.createEl('div', 'timeStamp')
    timeStamp.innerHTML = `<span>${determineTimeStampText(msg.id.split('_')[1])}<span>`
    if (!msg.read) {
      const unreadMarker = this.createEl('span', 'unreadMarker')
      timeStamp.appendChild(unreadMarker)
    }

    this.wrapper.appendChild(timeStamp)

    this.shadow.innerHTML = this.getMessageStyles()
    this.shadow.appendChild(this.wrapper)
  }

  // make it generic to handle carousel too in the future
  prepareBasicMessage (msg) {
    const message = this.createEl('div', 'message')

    if (msg.imageUrl) {
      const imageContainer = this.addImage(msg.imageUrl, 'mainImg')
      message.appendChild(imageContainer)
    }
    const iconTitleDescWrapper = this.createEl('div', 'iconTitleDescWrapper')
    if (msg.iconUrl) {
      const iconContainer = this.addImage(msg.iconUrl, 'iconImg')
      iconTitleDescWrapper.appendChild(iconContainer)
    }
    const titleDescWrapper = this.createEl('div', 'titleDescWrapper')
    if (msg.title) {
      const title = this.createEl('div', 'title')
      title.innerText = msg.title
      titleDescWrapper.appendChild(title)
    }
    if (msg.description) {
      const description = this.createEl('div', 'description')
      description.innerText = msg.description
      titleDescWrapper.appendChild(description)
    }
    if (msg.title || msg.description) {
      iconTitleDescWrapper.appendChild(titleDescWrapper)
    }

    if (msg.iconUrl || msg.title || msg.description) {
      message.appendChild(iconTitleDescWrapper)
    }
    if (msg.buttons && msg.buttons.length) {
      const buttonsContainer = this.addButtons(msg.buttons)
      message.appendChild(buttonsContainer)
    }
    return message
  }

  addButtons (buttons = []) {
    const buttonsContainer = this.createEl('div', 'buttonsContainer')
    buttons.forEach((b, i) => {
      const button = this.createEl('button', `button-${i}`)
      button.innerText = b.text
      if (i === 1) {
        button.style.cssText += 'margin-left: 2px;'
      }
      buttonsContainer.appendChild(button)
    })
    return buttonsContainer
  }

  addImage (url, type) {
    const imageContainer = this.createEl('div', `${type}Container`)
    const image = this.createEl('img', type)
    image.setAttribute('src', url)
    image.setAttribute('loading', 'lazy')
    imageContainer.appendChild(image)
    return imageContainer
  }

  getMessageStyles () {
    return messageStyles(
      this.config.styles.cards.backgroundColor,
      this.config.styles.cards.borderColor,
      this.config.styles.cards.titleColor,
      this.config.styles.cards.descriptionColor,
      this.config.styles.cards.buttonColor,
      this.config.styles.cards.buttonTextColor
    )
  }

  // can be formatted
  raiseClickedEvent (path) {
    switch (this.message.templateType) {
      case 'text-only':
      case 'text-with-icon':
      case 'text-with-icon-and-image': {
        this.raiseClickedForBasicTemplates(path)
      }
    }
  }

  raiseClickedForBasicTemplates (path) {
    const msg = this.message.msg[0]
    const payload = { msgId: this.campaignId, pivotId: this.pivotId }
    if (path[0].tagName === 'BUTTON') {
      const id = path[0].id.split('-')[1]
      const button = msg.buttons[id]
      payload.wzrk_c2a = button.text
      if (button.action === 'url') {
        button.openUrlInNewTab ? window.open(button.url, '_blank') : (window.location = button.url)
      } else if (button.action === 'copy') {
        // copy to clipboard logic here
      }
    } else if (path[0].tagName === 'INBOX-MESSAGE' && msg.onClickUrl) {
      msg.openUrlInNewTab ? window.open(msg.onClickUrl, '_blank') : (window.location = msg.onClickUrl)
    }
    window.clevertap.renderNotificationClicked(payload)
  }
}
