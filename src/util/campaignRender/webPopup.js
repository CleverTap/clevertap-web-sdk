export const renderPopUpImageOnly = (targetingMsgJson, _session) => {
  const divId = 'wzrkImageOnlyDiv'
  const popupImageOnly = document.createElement('ct-web-popup-imageonly')
  popupImageOnly.session = _session
  popupImageOnly.target = targetingMsgJson
  const containerEl = document.getElementById(divId)
  containerEl.innerHTML = ''
  containerEl.style.visibility = 'hidden'
  containerEl.appendChild(popupImageOnly)
}
