export const getInboxPosition = (x, y, cardWidth) => {
  const windowWidth = window.innerWidth - 16
  const windowHeight = window.innerHeight - 16
  const cardheight = 550

  let xPos = x
  let yPos = y + 16
  if ((x + (cardWidth / 2)) <= windowWidth) {
    xPos = x - (cardWidth / 2)
  } else {
    xPos = x - cardWidth
  }

  if ((y + cardheight) >= windowHeight) {
    yPos = windowHeight - cardheight - 32
  }
  if (xPos < 0) { xPos = x }
  return { xPos, yPos }
}

export const determineTimeStampText = (ts) => {
  const now = Date.now()
  let diff = Math.floor((now - ts) / 60000)
  if (diff < 5) {
    return 'Just now'
  }
  if (diff < 60) {
    return `${diff} minute${diff > 1 ? 's' : ''} ago`
  }
  diff = Math.floor(diff / 60)
  if (diff < 24) {
    return `${diff} hour${diff > 1 ? 's' : ''} ago`
  }
  diff = Math.floor(diff / 24)
  return `${diff} day${diff > 1 ? 's' : ''} ago`
}
