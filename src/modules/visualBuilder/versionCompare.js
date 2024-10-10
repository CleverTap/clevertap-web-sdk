
export const versionCompare = (currentVersion) => {
  const splitRequiredVersion = '1.9.2'.split('.')
  const splitCurrentVersion = currentVersion.split('.')

  let p1 = 0
  let isWebsiteVersionHigher = false

  while (p1 < splitRequiredVersion.length && !isWebsiteVersionHigher) {
    if (parseInt(splitRequiredVersion[p1]) < parseInt(splitCurrentVersion[p1])) {
      isWebsiteVersionHigher = true
    }
    p1++
  }

  return isWebsiteVersionHigher
}
