export const getURLParams = (url) => {
  const urlParams = {}
  const idx = url.indexOf('?')

  if (idx > 1) {
    const uri = url.substring(idx + 1)
    let match
    const pl = /\+/g // Regex for replacing addition symbol with a space
    const search = /([^&=]+)=?([^&]*)/g
    const decode = function (s) {
      let replacement = s.replace(pl, ' ')
      try {
        replacement = decodeURIComponent(replacement)
      } catch (e) {
        // eat
      }
      return replacement
    }
    match = search.exec(uri)
    while (match) {
      urlParams[decode(match[1])] = decode(match[2])
      match = search.exec(uri)
    }
  }
  return urlParams
}

export const getDomain = (url) => {
  if (url === '') return ''
  var a = document.createElement('a')
  a.href = url
  return a.hostname
}

export const addToURL = (url, k, v) => {
  return url + '&' + k + '=' + encodeURIComponent(v)
}
