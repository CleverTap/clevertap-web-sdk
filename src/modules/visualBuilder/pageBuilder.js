const ctSelector = {}
const currSelectorValues = {
  color: '#000000',
  fontFamily: 'Arial, sans-serif',
  text: '',
  replacements: '',
  fontSize: 0,
  margin: '',
  padding: ''
}
let currSelector = ''
let profileProps
let eventProps
let container
let lastRange = null
const winRef = window.opener
let doc = document
let curURL = window.location.href

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
  var regex = /^(.*\.dashboard\.clevertap\.com.*)|localhost/
  function normalizeURL (url) {
    return url.replace(/\/+$/, '')
  }
  window.addEventListener('message', (event) => {
    if (regex.test(normalizeURL(event.origin)) && event.data.evtProps) {
      eventProps = event.data.evtProps
      profileProps = event.data.profile
      console.log('personalisation data', eventProps, profileProps)
    }
  }, false)
  winRef.postMessage('Builder Initialised', document.referrer)
  document.addEventListener('DOMContentLoaded', onContentLoad)
}

function onContentLoad () {
  const ctBuilderHeader = document.createElement('div')
  ctBuilderHeader.innerHTML = `
    <div class="ct-builder-header" id="ct-builder-header">
      <span class="heading">CT Visual Builder</span>
      <button class="save" id="ct_builder_save">Save</button>
      <button class="save" id="ct_builder_inter">Interactive</button>
      <button class="save" id="ct_builder_build">Builder</button>      
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
  container.appendChild(iframeContainer)
  iframeContainer.appendChild(iframe)
  iframe.src = window.location.href.split('?')[0]
  createAndAddFormTextV2()
  iframe.onload = () => onIframeLoad(iframe)
  document.getElementById('ct_builder_save').addEventListener('click', saveRes)
  document.getElementById('ct_builder_inter').addEventListener('click', () => makeInteractive(iframe))
  document.getElementById('ct_builder_build').addEventListener('click', () => onIframeLoad(iframe))
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
  ctSelector[curURL][currSelector] = inlineStyle
  printContent()
  updateUI()
}

function updateUI () {
  const iframe = document.querySelector('#content-iframe')
  const e = iframe.contentWindow.document.body.querySelector(currSelector)
  e.style.color = ctSelector[curURL][currSelector].color
  e.style.fontFamily = ctSelector[curURL][currSelector]['font-family']
  e.textContent = ctSelector[curURL][currSelector].text
}

function onIframeLoad (iframe) {
  const iframeWindow = iframe.contentWindow ?? (iframe.contentDocument?.document ?? iframe.contentDocument)
  doc = iframeWindow.document
  doc.body.addEventListener('click', addBuilder, true)
  doc.body.addEventListener('mouseover', addOutline)
  doc.body.addEventListener('mouseout', removeOutline)
  curURL = iframeWindow.location.href
}

function addBuilder (e) {
  e.preventDefault()
  e.stopPropagation()
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
      ctSelector[curURL] = {}
      ctSelector[curURL][selector] = ''
      currSelector = selector
      document.getElementById('text-color').value = currSelectorValues.color
      document.getElementById('font-family').value = currSelectorValues.fontFamily
      document.getElementById('el-text').innerText = currSelectorValues.text
      document.getElementById('popup').style.display = 'block'
    }
  }
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
      height: 200px;
    }
    #left {
      width: 30%;
    }
    #right {
      flex-grow: 1;
      height: 200px;
      overflow: scroll;
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
    .replacement {
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
    prepareList(profileProps, 0)
  })

  document.getElementById('closePers').addEventListener('click', closePersForm)

  document.getElementById('colorFontForm').addEventListener('submit', handleFormSumbmission)

  document.getElementById('right').addEventListener('click', (e) => {
    const id = e.target.parentElement.getAttribute('id')
    const token = e.target.parentElement.getAttribute('token')
    const type = e.target.parentElement.getAttribute('_type')
    const _t = parseInt(type) ? `@Event - ${id} | default: "` : `@Profile - ${id} | default: "`
    if (id && token && type) {
      const replacement = document.createElement('span')
      replacement.classList.add('replacement')
      replacement.setAttribute('contentEditable', false)
      replacement.setAttribute('token', token)
      replacement.appendChild(document.createTextNode(_t))
      const replacementDefault = document.createElement('span')
      replacementDefault.classList.add('replacement-default')
      replacementDefault.setAttribute('contentEditable', true)
      replacement.appendChild(replacementDefault)
      replacement.appendChild(document.createTextNode('"'))
      if (lastRange) {
        lastRange.insertNode(replacement)
        closePersForm(e)
      }
    }
  })

  document.getElementById('prof').addEventListener('click', e => {
    leftClicked(e, 0)
  })

  document.getElementById('eve').addEventListener('click', e => {
    leftClicked(e, 1)
  })

  document.getElementById('el-text').addEventListener('keydown', keyCheck)
}

function saveRes () {
  // const winRef = window.opener
  winRef.postMessage(ctSelector, '*')
  window.close()
}

function createEl (type, id, token, _type) {
  const _el = document.createElement(type)
  _el.setAttribute('id', id)
  _el.setAttribute('token', token)
  _el.setAttribute('_type', _type)
  return _el
}

function prepareList (items, type) {
  document.getElementById('right').innerHTML = ''
  items.forEach(i => {
    const _el = createEl('div', i.name, i.token, type)
    _el.innerHTML = `${i.name} <span class="list-highlight">${type ? 'Event' : '@Profile'} - ${i.name} | default: ""</span>`
    document.getElementById('right').appendChild(_el)
    document.getElementById('right').appendChild(_el)
  })
}

function closePersForm (e) {
  e.preventDefault()
  document.getElementById('persform').style.display = 'none'
}

document.addEventListener('selectionchange', handleSelectionChange)

function handleSelectionChange () {
  if (document.activeElement !== document.getElementById('el-text')) {
    return
  }
  const selection = window.getSelection()
  if (selection) {
    lastRange = selection.getRangeAt(0)
  }
}

function keyCheck (event) {
  var KeyID = event.keyCode
  switch (KeyID) {
    case 8: {
      const selection = lastRange
      if (selection.collapsed) {
        if (selection.commonAncestorContainer.nodeName !== '#text') {
          const elToDelete = selection.commonAncestorContainer.childNodes[selection.startOffset - 1]
          if (elToDelete) {
            selection.commonAncestorContainer.removeChild(elToDelete)
            // hack - event.preventDefault() does not work correctly
            lastRange.insertNode(document.createTextNode('.'))
          }
        }
      }
    }
      break
    case 46:
      console.log('delete')
      break
    default:
      break
  }
}

function leftClicked (el, v) {
  const p = document.getElementById('prof')
  const ev = document.getElementById('eve')
  if (v) {
    ev.classList.add('sel')
    p.classList.remove('sel')
  } else {
    p.classList.add('sel')
    ev.classList.remove('sel')
  }
  const i = v ? eventProps : profileProps
  prepareList(i, v)
}

function printContent () {
  let res = ''
  document.getElementById('el-text').childNodes.forEach((n, i) => {
    if (n.nodeName === '#text') {
      res += n.nodeValue
    } else if (n.classList.contains('replacement')) {
      const def = n.children[0].innerText
      res = res + '$replacement$' + n.getAttribute('token') + '[' + def + ']$/replacement$'
    }
  })
  ctSelector[curURL][currSelector].replacements = res
}

function makeInteractive (iframe) {
  const iframeWindow = iframe.contentWindow ?? (iframe.contentDocument?.document ?? iframe.contentDocument)
  doc = iframeWindow.document
  doc.body.removeEventListener('click', addBuilder, true)
  doc.body.removeEventListener('mouseover', addOutline)
  doc.body.removeEventListener('mouseout', removeOutline)
}

function addOutline (event) {
  event.target.style.outline = '2px solid red'
}

function removeOutline (event) {
  event.target.style.outline = 'none'
}
