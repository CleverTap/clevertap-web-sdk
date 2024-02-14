import { determineTimeStampText, greenTickSvg } from './helper'
export class Message {
  constructor (config, message) {
    this.shadow = this.attachShadow({ mode: 'open' })
    this.config = config
    this.message = message
    this.renderMessage(message)
  }

  wrapper = null
  snackBar = null

  get pivotId () {
    return this.message.wzrk_pivot
  }

  get campaignId () {
    return this.message.wzrk_id
  }

  createEl (type, id, part) {
    const _el = document.createElement(type)
    _el.setAttribute('id', id)
    _el.setAttribute('part', part || id)
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
    if (!msg.viewed) {
      const unreadMarker = this.createEl('span', 'unreadMarker')
      timeStamp.appendChild(unreadMarker)
    }

    this.wrapper.appendChild(timeStamp)
    this.shadow.appendChild(this.wrapper)
  }

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
    let hasCopyAction = false
    buttons.forEach((b, i) => {
      const button = this.createEl('button', `button-${i}`, 'button')
      button.innerText = b.text
      if (i > 0) {
        button.style.cssText += 'margin-left: 2px;'
      }
      if (b.action === 'copy') {
        hasCopyAction = true
      }
      buttonsContainer.appendChild(button)
    })
    if (hasCopyAction) {
      this.addSnackbar(buttonsContainer)
    }
    return buttonsContainer
  }

  addSnackbar (buttonsContainer) {
    this.snackBar = this.createEl('div', `snackbar-${this.campaignId}`, 'snackbar')
    this.snackBar.innerHTML = greenTickSvg
    const clipboardMsg = this.createEl('span', `snackbar-msg-${this.campaignId}`, 'snackbar-msg')
    clipboardMsg.innerText = 'Copied to clipboard'
    this.snackBar.appendChild(clipboardMsg)
    buttonsContainer.appendChild(this.snackBar)
  }

  addImage (url, type) {
    const imageContainer = this.createEl('div', `${type}Container`)
    const image = this.createEl('img', type)
    image.setAttribute('src', url)
    // images will be fetched as and when the element comes into the viewport
    image.setAttribute('loading', 'lazy')
    imageContainer.appendChild(image)
    return imageContainer
  }

  raiseClickedEvent (path, isPreview) {
    switch (this.message.templateType) {
      case 'text-only':
      case 'text-with-icon':
      case 'text-with-icon-and-image': {
        this.raiseClickedForBasicTemplates(path, isPreview)
      }
    }
  }

  raiseClickedForBasicTemplates (path, isPreview) {
    const msg = this.message.msg[0]
    const payload = { msgId: this.campaignId, pivotId: this.pivotId }
    if (path.tagName === 'BUTTON') {
      const id = path.id.split('-')[1]
      const button = msg.buttons[id]
      payload.kv = {
        wzrk_c2a: button.text
      }
      if (button.action === 'url') {
        button.openUrlInNewTab ? window.open(button.url, '_blank') : (window.location = button.url)
      } else if (button.action === 'copy') {
        window.focus()
        navigator.clipboard.writeText(button.clipboardText)
        this.snackBar.style.setProperty('display', 'flex', 'important')
        setTimeout(() => {
          this.snackBar.style.setProperty('display', 'none', 'important')
        }, 2000)
      }
    } else if (path.tagName === 'CT-INBOX-MESSAGE' && msg.onClickUrl) {
      msg.openUrlInNewTab ? window.open(msg.onClickUrl, '_blank') : (window.location = msg.onClickUrl)
    }
    if (isPreview) {
      console.log('Notifiction clicked event will be raised at run time with payload ::', payload)
    } else {
      window.clevertap.renderNotificationClicked(payload)
    }
  }
}
