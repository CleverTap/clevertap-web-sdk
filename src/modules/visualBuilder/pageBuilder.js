const ctSelector = {}
const currSelectorValues = {
  color: '#000000',
  fontFamily: 'Arial, sans-serif',
  text: '',
  fontSize: 0,
  margin: '',
  padding: ''
}
let currSelector = ''
let profileProps
let eventName
let eventProps
let container

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
  const winRef = window.opener
  var regex = /^.*\.dashboard\.clevertap\.com.*/
  function normalizeURL (url) {
    return url.replace(/\/+$/, '')
  }
  window.addEventListener('message', (event) => {
    if (regex.test(normalizeURL(event.origin))) {
      eventProps = event.data.evtProps
      eventName = event.data.evtName
      profileProps = event.data.profile
      console.log('personalisation data', eventProps, eventName, profileProps)
    }
  }, false)
  winRef.postMessage('Builder Initialised', '*')
  const ctBuilderHeader = document.createElement('div')
  ctBuilderHeader.innerHTML = `
    <div class="ct-builder-header" id="ct-builder-header">
      <span class="heading">CT Visual Builder</span>
      <button class="save" id="ct_builder_save">Save</button>
    </div>
    <style>
    #iframe-container {
        margin: 0 auto;
        height: 100vh;
        display: block;
        box-shadow: 0 0.1em 1em 0 rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        overflow: hidden;
        transition: all 500ms;
        width: 100%;
    }
    #content-iframe {
        width: 100%;
        height: 100%;
        background-color: #fff;
        border: none;
        margin: 0;
      }
    </style>
  `
  document.body.innerHTML = ''
  document.body.appendChild(ctBuilderHeader)
  container = document.createElement('div')
  container.style.position = 'relative' // Ensure relative positioning for absolute positioning of form
  container.style.display = 'flex'
  document.body.appendChild(container)
  const iframeContainer = document.createElement('div')
  iframeContainer.id = 'iframe-container'
  const iframe = document.createElement('iframe')
  iframe.id = 'content-iframe'
  iframe.sandbox = 'allow-scripts'
  container.appendChild(iframeContainer)
  iframeContainer.appendChild(iframe)
  iframe.src = window.location.href.split('?')[0]
  createAndAddFormTextV2()
  iframe.onload = () => onIframeLoad(iframe)
  document.getElementById('ct_builder_save').addEventListener('click', saveRes)
}

function handleFormSumbmission (event) {
  event.preventDefault()
  const selectedColor = document.getElementById('text-color').value
  const selectedFont = document.getElementById('font-family').value
  const selectedText = document.getElementById('el-text').innerText
  const selectedSize = document.getElementById('font-size').value
  const margin = document.getElementById('margin').value
  const padding = document.getElementById('padding').value
  document.getElementById('popup').style.display = 'none'
  // Create the inline style string
  const inlineStyle = {
    color: selectedColor,
    'font-family': selectedFont,
    text: selectedText,
    fontSize: selectedSize,
    margin,
    padding
  }
  ctSelector[currSelector] = inlineStyle
  updateUI()
}

function updateUI () {
  const iframe = document.querySelector('#content-iframe')
  const e = iframe.contentWindow.document.body.querySelector(currSelector)
  e.style.color = ctSelector[currSelector].color
  e.style.fontFamily = ctSelector[currSelector]['font-family']
  e.textContent = ctSelector[currSelector].text
}

function onIframeLoad (iframe) {
  const iframeWindow = iframe.contentWindow ?? (iframe.contentDocument?.document ?? iframe.contentDocument)
  const doc = iframeWindow.document
  doc.body.addEventListener('click', function (e) {
    if (document.getElementById('popup').style.display !== 'block') {
      const el = e.target
      const selector = generateUniqueSelector(el, '', doc)
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
        document.getElementById('text-color').value = currSelectorValues.color
        document.getElementById('font-family').value = currSelectorValues.fontFamily
        document.getElementById('el-text').innerText = currSelectorValues.text
        document.getElementById('popup').style.display = 'block'
      }
    }
  })
  doc.body.addEventListener('mouseover', function (event) {
    event.target.style.outline = '2px solid red'
  })
  doc.body.addEventListener('mouseout', function (event) {
    event.target.style.outline = 'none'
  })
}

function generateUniqueSelector (element, childSelector = '', doc = document) {
  const tag = element.tagName.toLowerCase()
  const id = element.id
  if (id) {
    const uniqueID = doc.querySelectorAll(`#${id}`)
    if (uniqueID.length === 1) {
      return `#${id}`
    }
  }
  const classes = Array.from(element.classList).join('.')
  let selector = ''
  if (tag) {
    selector = tag
    if (id) {
      selector += `#${id}`
    }
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

function createAndAddFormTextV2 () {
  const wr = document.createElement('div')
  wr.id = 'popup'
  wr.innerHTML = `
      <button id="closeBtn">&times;</button>
      <form id="colorFontForm">
        <label for="el-text">Update Text:</label>
        <div>
            <div style="display: flex;width: 300px;height:150px;margin-bottom: 30px">
                <div id="el-text" contentEditable="true"></div>
                <button id="button1" style="height: 30px;">@</button>
            </div>
            <div id="persform">
                <div id="wrapper">
                    <div id="left">
                        <div id="prof" class="sel">Profile</div>
                        <div id="eve">Event</div>
                    </div>
                    <div id="right"></div>
                    <div id="closePers">&times;</div>
                </div>
            </div>
        </div>

        <label for="font-family">Font Family:</label>
        <select id="font-family" name="font-family">
          <option value="Arial, sans-serif">Arial</option>
          <option value="Helvetica, sans-serif">Helvetica</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Times New Roman, serif">Times New Roman</option>
          <option value="Courier New, monospace">Courier New</option>
        </select>

        <label for="font-size">Font Size:</label>
        <input type="text" id="font-size" name="font-size" placeholder="e.g., 16px">

        <label for="text-color">Text Color:</label>
        <input type="color" id="text-color" name="text-color">
        
        <label for="margin">All Margin:</label>
        <input type="text" id="margin" name="margin">
        
        <label for="padding">All Padding:</label>
        <input type="text" id="padding" name="padding">

        <input type="submit" value="Submit">
      </form>
  `

  const formStyles = `
  #popup {
    width: 400px;
    background-color: white;
    overflow: auto;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    display: none;
   }

    #closeBtn {
      position: absolute;
      top: 23px;
      right: 10px;
      cursor: pointer;
      background: none;
      border: none;
      font-size: 18px;
      color: #555;
    }

    #colorFontForm {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    #colorFontForm label {
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }

    #el-text,
    #font-family,
    #font-size,
    #text-color 
    #margin
    #padding {
      width: 100%;
      padding: 8px;
      margin-bottom: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    
    #el-text {
      overflow: auto;
    }
    

    #text-color {
      padding: 0;
      width: 20%;
    }

    #font-family {
      width: 100%;
    }

    #colorFontForm input[type="submit"] {
      margin-top: 16px;
      background-color: #4CAF50;
      color: #fff;
      padding: 10px;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      font-size: 16px;
    }
    #mainform {
  display: flex;
}

#content {
  width: 250px;
  border: 1px solid;
  padding: 4px;
}

#persform {
  display: none;
  height: auto;
  width: auto;
  max-width: 500px;
  background: pink;
}

#wrapper {
  display: flex;
}

#left {
  width: 30%;
}

#right {
  flex-grow: 1;
}

#left div {
  padding: 8px 12px;
}

#right div {
  padding: 5px 12px;
}

#close {
  width: 5%
}

.list-highlight {
  background: skyblue
}

.sel {
  background: lightgreen;
}

.replacement, .liquid {
  background: aqua;
}
  `

  const styleElement = document.createElement('style')
  styleElement.textContent = formStyles
  wr.appendChild(styleElement)

  container.appendChild(wr)

  const closeBtn = wr.querySelector('#closeBtn')

  closeBtn.addEventListener('click', () => {
    document.getElementById('popup').style.display = 'none'
  })

  document.getElementById('button1').addEventListener('click', (e) => {
    e.preventDefault()
    document.getElementById('persform').style.display = 'block'
    // setInboxPosition(e)
    // prepareList(profileProps, 0)
  })

  document.getElementById('colorFontForm').addEventListener('submit', handleFormSumbmission)
}

function saveRes () {
  const winRef = window.opener
  winRef.postMessage(ctSelector, '*')
  window.close()
}
