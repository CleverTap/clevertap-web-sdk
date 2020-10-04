export const getToday = () => {
  const today = new Date()
  return today.getFullYear() + '' + today.getMonth() + '' + today.getDay()
}

export const getNow = () => {
  return Math.floor((new Date()).getTime() / 1000)
}

export const convertToWZRKDate = (dateObj) => {
  return ('$D_' + Math.round(dateObj.getTime() / 1000))
}

export const setDate = (dt) => {
  //expecting  yyyymmdd format either as a number or a string
  if (isDateValid(dt)) {
    return '$D_' + dt
  }
}

export const isDateValid = (date) => {
  let matches = /^(\d{4})(\d{2})(\d{2})$/.exec(date)
  if (matches == null) return false
  let d = matches[3]
  let m = matches[2] - 1
  let y = matches[1]
  let composedDate = new Date(y, m, d)
  return composedDate.getDate() == d &&
      composedDate.getMonth() == m &&
      composedDate.getFullYear() == y
}
