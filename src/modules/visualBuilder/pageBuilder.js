export const initialiseCTBuilder = () => {
  const overlayPath = 'https://kkyusuftk-clevertap.s3.amazonaws.com/sampleIndex.js'

  addOverlayScript(overlayPath).onload = async function () {
    try {
      const module = await import(overlayPath)
      const { default: isEven } = module

      console.log(isEven(4))
      console.log(isEven(5))
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
}

function addOverlayScript (overlayPath) {
  const scriptTag = document.createElement('script')
  scriptTag.setAttribute('type', 'text/javascript')
  scriptTag.setAttribute('id', 'wzrk-alert-js')
  scriptTag.setAttribute('src', overlayPath)
  document.getElementsByTagName('body')[0].appendChild(scriptTag)
  return scriptTag
}
