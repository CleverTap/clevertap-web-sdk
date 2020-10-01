export const getURLParams = (url) => {
  let urlParams = {}
  let idx = url.indexOf('?')

  if (idx > 1) {

    let uri = url.substring(idx + 1)
    let match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
          let replacement = s.replace(pl, " ")
          try {
            replacement = decodeURIComponent(replacement)
          } catch (e) {
            //eat
          }
          return replacement
        }

    while (match = search.exec(uri)) {
      urlParams[decode(match[1])] = decode(match[2])
    }

  }
  return urlParams
}

export const getDomain = (url) => {
  if (url == '') return ''
  var a = document.createElement('a')
  a.href = url
  return a.hostname
}

export const addToURL = (url, k, v) => {
  return url + '&' + k + '=' + encodeURIComponent(v)
}
