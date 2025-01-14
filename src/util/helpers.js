export const isChrome = () => {
  const ua = navigator.userAgent
  return ua.includes('Chrome') || ua.includes('CriOS')
}

export const isFirefox = () => {
  const ua = navigator.userAgent
  return ua.includes('Firefox') || ua.includes('FxiOS')
}

export const isSafari = () => {
  const ua = navigator.userAgent
  // Ignoring the False Positive of Safari on iOS devices because it gives Safari in all Browsers
  return ua.includes('Safari') &&
         !ua.includes('CriOS') &&
         !ua.includes('FxiOS') &&
         !ua.includes('Chrome') &&
         !ua.includes('Firefox')
}
