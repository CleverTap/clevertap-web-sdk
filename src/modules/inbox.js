import { mergeObjects } from '../util/datatypes'

// TODO: update the default button specs.
const defaultInboxProps = {
  background: '#ffffff',
  tags: [],
  position: 'bottom-right',
  boxShadow: '0 0 8px 4px rgba(0,0,0,.16)',
  button: {
    color: '#000000',
    background: '#ffffff',
    iconUrl: 'https://eu1.dashboard.clevertap.com/images/svg/notification-bell.svg'
  },
  header: {
    color: '#000000',
    background: '#ffffff',
    text: 'Notification Center'
  },
  tab: {
    background: '#ffffff',
    color: '#000000aa',
    activeColor: '#000000'
  }
}

export default class InboxHandler extends Array {
  #oldValues
  #logger
  #isInitialised = false
  #buttonElement
  #divElement
  #isOpen = false

  constructor ({ logger }, values) {
    super()
    this.#logger = logger
    this.#oldValues = values
  }

  get #open () {
    return this.#isOpen
  }

  set #open (value) {
    if (this.#divElement) {
      this.#divElement.style.display = value ? 'block' : 'none'
    }
    this.#isOpen = value
  }

  push (...displayArgs) {
    this.#setupInbox(displayArgs)
    return 0
  }

  _processOldValues () {
    if (this.#oldValues) {
      this.#setupInbox(this.#oldValues)
    }
    this.#oldValues = null
  }

  #setupInbox (displayArgs) {
    if (displayArgs.length > 0 && typeof displayArgs[0] === 'object' && !this.#isInitialised) {
      const inboxProps = mergeObjects(defaultInboxProps, displayArgs[0])
      const selectorId = inboxProps.selector
      this.#buttonElement = document.getElementById(selectorId)
      if (!this.#buttonElement) {
        this.#buttonElement = this.#createButton(inboxProps)
      }
      this.#divElement = this.#createInboxDiv(inboxProps)
      this.#isInitialised = true

      document.body.addEventListener('click', (e) => {
        if (this.#divElement.contains(e.target)) {
          return
        }
        if (this.#buttonElement.contains(e.target)) {
          this.#open = !this.#open
          return
        }
        this.#open = false
      })
    }
  }

  #createButton (inboxProps) {
    const buttonProps = inboxProps.button
    const buttonElement = document.createElement('div')
    let buttonCssText = 'position: fixed; width: 60px; height: 60px; border-radius: 50%; z-index: 2147483640 !important; cursor: pointer;'
    buttonCssText += ` color: ${buttonProps.color}; background-color: ${buttonProps.background}; box-shadow: ${inboxProps.boxShadow}; -webkit-box-shadow: ${inboxProps.boxShadow};`
    if (buttonProps.iconUrl) {
      buttonCssText += ` background-image: url(${buttonProps.iconUrl}); background-repeat: no-repeat; background-position: center;`
    }
    switch (inboxProps.position) {
      case 'top-right':
        buttonCssText += ' top: 30px; right: 30px;'
        break
      case 'top-left':
        buttonCssText += ' top: 30px; left: 30px;'
        break
      case 'bottom-left':
        buttonCssText += ' bottom: 30px; left: 30px;'
        break
      case 'bottom-right':
      default:
        buttonCssText += ' bottom: 30px; right: 30px;'
    }
    buttonElement.style.cssText = buttonCssText

    return document.body.appendChild(buttonElement)
  }

  #createInboxDiv (inboxProps) {
    const inboxDiv = document.createElement('div')
    const hasTags = inboxProps.tags.length > 0
    inboxDiv.appendChild(this.#createHeader(inboxProps.header, hasTags))
    if (hasTags) {
      inboxDiv.appendChild(this.#createTags(inboxProps))
    }
    let inboxDivCss = 'display: none; position: fixed; width: 375px; max-width: 80%; min-height: 300px; max-height: calc(100vh - 120px); max-height: -webkit-calc(100% - 120px); box-sizing: border-box; border-radius: 4px; z-index: 2147483647 !important;'
    inboxDivCss += ` background-color: ${inboxProps.background}; box-shadow: ${inboxProps.boxShadow}; -webkit-box-shadow: ${inboxProps.boxShadow};`
    switch (inboxProps.position) {
      case 'top-right':
        inboxDivCss += ' top: 100px; right: 30px;'
        break
      case 'top-left':
        inboxDivCss += ' top: 100px; left: 30px;'
        break
      case 'bottom-left':
        inboxDivCss += ' bottom: 100px; left: 30px;'
        break
      case 'bottom-right':
      default:
        inboxDivCss += ' bottom: 100px; right: 30px;'
    }
    inboxDiv.style.cssText = inboxDivCss

    return document.body.appendChild(inboxDiv)
  }

  #createHeader (headerProps, hasTags) {
    const header = document.createElement('div')
    header.innerText = headerProps.text
    let headerCss = 'box-sizing: border-box; width: 100%; min-height: 40px; position: relative; padding: 16px 12px; font-size: 18px; border-radius: 4px 4px 0px 0px;'
    headerCss += ` color: ${headerProps.color}; background-color: ${headerProps.background};`
    if (!hasTags) {
      headerCss += ' box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 1px; -webkit-box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 1px;'
    }
    header.style.cssText = headerCss

    const close = document.createElement('div')
    close.innerText = 'x'
    close.style.cssText = 'font-size: 20px; font-family: sans-serif; position: absolute; right: 12px; top: 14px; cursor: pointer; opacity: 0.5;'

    close.addEventListener('click', () => {
      this.#open = false
    })

    header.appendChild(close)
    return header
  }

  #createTags (inboxProps) {
    const tagContainer = document.createElement('div')
    let tagContainerCss = 'box-sizing: border-box; width: 100%; box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 1px; -webkit-box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 1px; padding: 0px 12px;'
    tagContainerCss += ` background-color: ${inboxProps.tab.background}; color: ${inboxProps.tab.color}`
    tagContainer.style.cssText = tagContainerCss
    const tags = ['All', ...inboxProps.tags]
    const tagElements = []
    for (const tag of tags) {
      const tagElement = document.createElement('div')
      let tagCss = 'display: inline-block; position: relative; padding: 6px; border-bottom: 2px solid transparent; cursor: pointer;'
      tagCss += `background-color: ${inboxProps.tab.background}; color: ${inboxProps.tab.color}`
      tagElement.style.cssText = tagCss
      tagElement.innerText = tag
      tagElement.addEventListener('click', (e) => {
        const activeTagName = e.target.innerText.trim()
        this.#updateActiveTag(tagElements, activeTagName, inboxProps.tab)
      })
      tagElements.push(tagElement)
      tagContainer.appendChild(tagElement)
    }

    tagElements[0].click()

    return tagContainer
  }

  #updateActiveTag (tags, activeTagName, tabProps) {
    for (const tag of tags) {
      if (tag.innerText.trim() === activeTagName) {
        tag.style.color = tabProps.activeColor
        tag.style.borderBottomColor = tabProps.activeColor
      } else {
        tag.style.color = tabProps.color
        tag.style.borderBottomColor = 'transparent'
      }
    }
  }
}
