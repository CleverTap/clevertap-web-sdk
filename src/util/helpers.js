export const isChrome = () => {
  return navigator.userAgent.indexOf('Chrome') !== -1 || navigator.userAgent.indexOf('CriOS') !== -1
}

export const isFirefox = () => {
  return navigator.userAgent.indexOf('Firefox') !== -1 || navigator.userAgent.indexOf('FxiOS') !== -1
}

export const isSafari = () => {
  return navigator.userAgent.indexOf('Safari') !== -1
}
