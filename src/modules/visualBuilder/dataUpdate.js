export const updateFormData = (selector, formStyle) => {
  const element = document.querySelector(selector)

  if (formStyle.styles !== undefined) {
    element.style = formStyle.styles
  }
  // if (formStyle.italics !== undefined) {
  //   element.style.fontStyle = formStyle.italics ? 'italic' : 'normal'
  // }

  // if (formStyle.underline !== undefined) {
  //   const curTextDecoration = element.style.textDecoration;
  //   if (formStyle.underline) {
  //     element.style.textDecoration = `${curTextDecoration} underline`.trim();
  //   } else {
  //     element.style.textDecoration = curTextDecoration.replace('underline', '').trim();
  //   }
  // }

  // if (formStyle['text-align']) {
  //   element.style.textAlign = formStyle['text-align']
  // }

  // Handle element onClick
  if (formStyle.clickDetails) {
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
    document.head.appendChild(style)
  }
}
