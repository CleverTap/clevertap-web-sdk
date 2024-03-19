import ModeManager from './mode'

/**
 * A utility class which contains just getters and setters
 * for certain properties defined on window.
 * @class
 */
class GlobalWindow {
  #isOULInProgress
  #oulReqN

  get isOULInProgress () {
    if (ModeManager.mode === 'WEB') {
      return window.isOULInProgress
    }
    return this.#isOULInProgress
  }

  set isOULInProgress (value) {
    if (ModeManager.mode === 'WEB') {
      window.isOULInProgress = value
      return
    }
    this.#isOULInProgress = value
  }

  get oulReqN () {
    if (ModeManager.mode === 'WEB') {
      return window.oulReqN
    }
    return this.#oulReqN
  }

  set oulReqN (value) {
    if (ModeManager.mode === 'WEB') {
      window.oulReqN = value
      return
    }
    this.#oulReqN = value
  }
}

const globalWindow = new GlobalWindow()
export default globalWindow
