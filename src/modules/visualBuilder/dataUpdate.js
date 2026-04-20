export const updateFormData = (element, formStyle, payload, isPreview = false) => {
  if (formStyle !== undefined) {
    // Update the element style
    if (formStyle.style !== undefined) {
      Object.keys(formStyle.style).forEach((property) => {
        // Normalize property name (convert camelCase to kebab-case if needed)
        const normalizedProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
        const value = formStyle.style[property]

        // Use !important for display and visibility properties to ensure hide/show logic works
        // even when there are conflicting CSS rules with !important
        if (normalizedProperty === 'display' || normalizedProperty === 'visibility') {
          element.style.setProperty(normalizedProperty, value, 'important')
        } else {
          element.style.setProperty(normalizedProperty, value)
        }
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

    // Handle both img and picture elements
    const tagName = element.tagName.toLowerCase()
    if (tagName === 'img' || tagName === 'picture') {
      // For picture elements, get the nested img element; for img elements, use directly
      const imgElement = tagName === 'picture'
        ? element.querySelector('img')
        : element

      if (imgElement) {
        // Set the image source
        if (formStyle.imgURL !== undefined) {
          imgElement.src = formStyle.imgURL
        }

        // Set or remove srcset attribute
        if (formStyle.imgSrcset !== undefined) {
          if (formStyle.imgSrcset) {
            // Non-empty string: set the srcset attribute
            imgElement.setAttribute('srcset', formStyle.imgSrcset)
          } else {
            // Empty string: remove the srcset attribute
            imgElement.removeAttribute('srcset')
          }
        }

        // Set or remove sizes attribute
        if (formStyle.imgSizes !== undefined) {
          if (formStyle.imgSizes) {
            // Non-empty string: set the sizes attribute
            imgElement.setAttribute('sizes', formStyle.imgSizes)
          } else {
            // Empty string: remove the sizes attribute
            imgElement.removeAttribute('sizes')
          }
        }
      }
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
