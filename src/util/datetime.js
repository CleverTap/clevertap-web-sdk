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
  // expecting  yyyymmdd format either as a number or a string
  if (isDateValid(dt)) {
    return '$D_' + dt
  }
}

export const isDateValid = (date) => {
  const matches = /^(\d{4})(\d{2})(\d{2})$/.exec(date)
  if (matches == null) return false
  const d = matches[3]
  const m = matches[2] - 1
  const y = matches[1]
  const composedDate = new Date(y, m, d)
  // eslint-disable-next-line eqeqeq
  return composedDate.getDate() == d && composedDate.getMonth() == m && composedDate.getFullYear() == y
}

export const relativeDateString = (ts) => {
  const now = getNow()
  let diff = Math.floor((now - ts) / 60)
  if (diff < 5) {
    return 'Just now'
  }
  if (diff < 60) {
    return `${diff} minutes ago`
  }
  diff = Math.floor(diff / 60)
  if (diff < 24) {
    return `${diff} hours ago`
  }
  diff = Math.floor(diff / 24)
  return `${diff} days ago`
}
