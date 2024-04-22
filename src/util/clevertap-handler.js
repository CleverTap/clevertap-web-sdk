// clevertap-handler.js

const ctEventhandler = (html) => {
  const ctScript = `
      var clevertap = {
        event: {
          push: (eventName) => {
            window.parent.postMessage({
              action: 'Event',
              value: eventName
            },'*');
          }
        },
        profile: {
          push: (eventName) => {
            window.parent.postMessage({
              action: 'Profile',
              value: eventName
            },'*');
          }
        },
        onUserLogin: {
          push: (eventName) => {
            window.parent.postMessage({
              action: 'OUL',
              value: eventName
            },'*');
          }
        },
        closeBoxPopUp: () => {
          window.parent.postMessage({
            action: 'closeBoxPopUp',
            value: 'closeBoxPopUp'
          },'*');
        },
        closeBannerPopUp: () => {
          window.parent.postMessage({
            action: 'closeBannerPopUp',
            value: 'closeBannerPopUp'
          },'*');
        },
        closeInterstitialPopUp: () => {
          window.parent.postMessage({
            action: 'closeInterstitialPopUp',
            value: 'closeInterstitialPopUp'
          },'*');
        }
      }
    `
  const insertPosition = html.indexOf('<script>')
  html = [html.slice(0, insertPosition + '<script>'.length), ctScript, html.slice(insertPosition + '<script>'.length)].join('')
  return html
}

export default ctEventhandler
