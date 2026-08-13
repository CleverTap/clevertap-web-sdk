const decode = function (s) {
  let replacement = s.replace(/\+/g, ' ') // Regex for replacing addition symbol with a space
  try {
    replacement = decodeURIComponent(replacement)
  } catch (e) {
    // eat
  }
  return replacement
}

export const getURLParams = (url) => {
  const urlParams = {}
  const idx = url.indexOf('?')

  if (idx > 1) {
    const uri = url.substring(idx + 1)
    let match
    const search = /([^&=]+)=?([^&]*)/g
    match = search.exec(uri)
    while (match) {
      urlParams[decode(match[1])] = decode(match[2])
      match = search.exec(uri)
    }
  }
  return urlParams
}

export const getURLParam = (url, param) => {
  if (url === '' || param === '') return ''
  const paramPrefix = url.includes(`?${param}=`) ? `?${param}=` : `&${param}=`
  if (!url.includes(paramPrefix)) return ''
  const paramValue = url.split(paramPrefix)[1].split('&')[0]
  return decode(paramValue)
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

export const getHostName = () => {
  return window.location.hostname
}
