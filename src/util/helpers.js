export const tcWrapper = function (f) {
  return function () {
    try {
      return f.apply(this, arguments)
    } catch (e) {}
  }
}
