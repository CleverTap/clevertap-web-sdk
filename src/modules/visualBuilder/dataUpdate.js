export const updateFormData = (element, formStyle, isPreview) => {
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
    console.log(formStyle.text)
    element.innerText = isPreview ? formStyle.text.text : formStyle.text.replacements
  }

  // Handle element onClick
  if (formStyle.clickDetails !== undefined) {
    const url = formStyle.clickDetails.clickUrl
    element.onclick = formStyle.clickDetails.newTab
      ? () => window.open(url, '_blank').focus()
      : () => { window.location.href = url }
  }

  // Set the image source
  if (formStyle.imgURL !== undefined && element.tagName.toLowerCase() === 'img') {
    element.src = formStyle.imgURL
  }

  // Handle elementCss
  if (formStyle.elementCss !== undefined) {
    const style = document.createElement('style')
    style.innerHTML = formStyle.elementCss
    document.head.appendChild(style)
  }
}
