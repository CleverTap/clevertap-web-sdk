export const today = () => {
  const today = new Date()
  return today.getFullYear() + '' + today.getMonth() + '' + today.getDay()
}

export const now = () => {
  return Math.floor((new Date()).getTime() / 1000)
}

export default {
  today,
  now
}
