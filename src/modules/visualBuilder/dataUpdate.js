export const updateFormData = (element, formStyle, payload, isPreview = false) => {
  if (formStyle !== undefined) {
    // Update the element style
    if (formStyle.style !== undefined) {
      Object.keys(formStyle.style).forEach((property) => {
        element.style.setProperty(property, formStyle.style[property])
      })
    }

    // Update underline for element
    if (formStyle.underline !== undefined) {
      const curTextDecoration = element.style.textDecoration
      if (formStyle.underline) {
        element.style.textDecoration = `${curTextDecoration} underline`.trim()
      } else {
        element.style.textDecoration = curTextDecoration.replace('underline', '').trim()
      }
    }

    // Update element text
    if (formStyle.text !== undefined) {
      element.innerText = isPreview ? formStyle.text.text : formStyle.text
    }

    // Handle element onClick
    if (formStyle.clickDetails !== undefined) {
      const url = formStyle.clickDetails.clickUrl
      element.onclick = formStyle.clickDetails.newTab
        ? () => {
          if (!isPreview) {
            window.clevertap.raiseNotificationClicked(payload)
          }
          window.open(url, '_blank').focus()
        }
        : () => {
          if (!isPreview) {
            window.clevertap.raiseNotificationClicked(payload)
          }
          window.location.href = url
        }
    }

    // Set the image source
    if (formStyle.imgURL !== undefined && element.tagName.toLowerCase() === 'img') {
      element.src = formStyle.imgURL
    }
  }
}

export const updateElementCSS = (element) => {
  // Handle elementCss
  if (element.elementCSS !== undefined) {
    const style = document.createElement('style')
    style.innerHTML = element.elementCSS
    document.head.appendChild(style)
  }
}
