const ctSelector = {}
const currSelectorValues = {
  color: '#000000',
  fontFamily: 'Arial, sans-serif',
  text: ''
}
let currSelector = ''

function rgbToHex (r, g, b) {
  // Ensure values are within valid range (0-255)
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))

  // Convert decimal to hex
  const hexR = r.toString(16).padStart(2, '0')
  const hexG = g.toString(16).padStart(2, '0')
  const hexB = b.toString(16).padStart(2, '0')

  // Concatenate the hex values
  const hexColor = `#${hexR}${hexG}${hexB}`

  return hexColor
}

export const initialiseCTBuilder = () => {
  const ctBuilderHeader = document.createElement('div')
  ctBuilderHeader.innerHTML = `
    <div class="ct-builder-header" id="ct-builder-header">
      <span class="heading">CT Visual Builder</span>
      <input type="text" value="URL" id="url_input"/>
      <button class="save" id="ct_builder_url_change">Change</button>
      <button class="save" id="ct_builder_save">Save</button>
    </div>
    <style>
      .ct-builder-header {
        height: 50px;
        width: 100vw;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        margin-bottom: 30px;
      }
      .ct-builder-header .heading {
        color: black;
        font-size: 20px;
        font-weight: 600;
      }
      .ct-builder-header .save {
        height: 30px;
        width: 60px;
        background-color: #87d312;
        border: none;
      }
      #colorFontForm {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        height: 100px;
        width: 300px;
        color: black;
        padding: 30px;
      }
      #content-iframe {
        width: 100%;
        height: 100vh;
        overflow: auto;
      }
    </style>
  `
  document.body.innerHTML = ''
  const iframeContainer = document.createElement('div')
  iframeContainer.id = 'iframe-container'
  const iframe = document.createElement('iframe')
  iframe.id = 'content-iframe'
  iframe.sandbox = 'allow-same-origin allow-scripts'
  document.body.appendChild(ctBuilderHeader)
  document.body.appendChild(iframeContainer)
  iframeContainer.appendChild(iframe)
  iframe.src = window.location.href.split('?')[0]
  iframe.onload = function () {
    const iframeWindow = iframe.contentWindow ?? (iframe.contentDocument?.document ?? iframe.contentDocument)
    const doc = iframeWindow.document
    doc.body.addEventListener('click', function (e) {
      if (!document.getElementById('colorFontForm').contains(event.target) && !document.getElementById('ct-builder-header').contains(event.target)) {
        const el = e.target
        const selector = generateUniqueSelector(el, '', doc)
        console.log('selector', selector)
        if (selector) {
          currSelectorValues.color = '#000000'
          const rgbValues = el.style.color.match(/\d+/g)
          if (rgbValues && rgbValues.length === 3) {
            currSelectorValues.color = rgbToHex(Number(rgbValues[0]), Number(rgbValues[1]), Number(rgbValues[2]))
          }
          currSelectorValues.fontFamily = el.style.fontFamily
          currSelectorValues.text = el.textContent
          ctSelector[selector] = ''
          currSelector = selector
          document.getElementById('colorFontForm').style.display = 'block'
          document.getElementById('color').value = currSelectorValues.color
          document.getElementById('font-family').value = currSelectorValues.fontFamily
          document.getElementById('el-text').value = currSelectorValues.text
        }
      }
    })
  }
  createAndAddForm()
  document.getElementById('ct_builder_save').addEventListener('click', saveRes)
  document.getElementById('ct_builder_url_change').addEventListener('click', changeURL)
  document.getElementById('colorFontForm').addEventListener('submit', function (event) {
    event.preventDefault()
    const selectedColor = document.getElementById('color').value
    const selectedFont = document.getElementById('font-family').value
    const selectedText = document.getElementById('el-text').value
    document.getElementById('colorFontForm').style.display = 'none'
    // Create the inline style string
    const inlineStyle = { color: selectedColor, 'font-family': selectedFont, text: selectedText }
    ctSelector[currSelector] = inlineStyle
    updateUI()
  })
}

function updateUI () {
  const iframe = document.querySelector('#content-iframe')
  const e = iframe.contentWindow.document.body.querySelector(currSelector)
  e.style.color = ctSelector[currSelector].color
  e.style.fontFamily = ctSelector[currSelector]['font-family']
  e.textContent = ctSelector[currSelector].text
}

function generateUniqueSelector (element, childSelector = '', doc = document) {
  const tag = element.tagName.toLowerCase()
  const classes = Array.from(element.classList).join('.')
  let selector = ''
  if (tag) {
    selector = tag
    if (classes) {
      selector += `.${classes}`
    }
    const uniqueElement = doc.querySelectorAll(selector)
    if (uniqueElement.length === 1) {
      return selector
    }
  } else {
    return null
  }
  if (element.parentNode) {
    const siblings = Array.from(element.parentNode.children)
    const index = siblings.indexOf(element) + 1
    if (index > 0) {
      selector += `:nth-child(${index})`
    }
  }
  if (childSelector !== '') {
    selector += ` > ${childSelector}`
  }
  const uniqueElement = doc.querySelectorAll(selector)
  if (uniqueElement.length === 1) {
    return selector
  }
  if (element.parentNode && element.parentNode !== doc.body) {
    return generateUniqueSelector(element.parentNode, selector, doc)
  }
  return selector
}

function createAndAddForm () {
  const f = `<form id="colorFontForm" action="#" method="post">
        <label for="el-text">Text</label>
        <input type="text" id="el-text" name="el-text">
        <br><br>
        <label for="color">Select Color:</label>
        <input type="color" id="color" name="color" required>
        <br><br>

        <label for="font-family">Select Font Family:</label>
        <select id="font-family" name="font-family" required>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Courier New, monospace">Courier New</option>
            <!-- Add more font family options as needed -->
        </select>
        <br><br>
        <input type="submit" value="Submit">
    </form>`
  const wr = document.createElement('div')
  wr.innerHTML = f
  document.body.appendChild(wr)
}

function saveRes () {
  console.log(ctSelector)
}

function changeURL () {
  document.getElementById('content-iframe').src = document.getElementById('url_input').value
}
