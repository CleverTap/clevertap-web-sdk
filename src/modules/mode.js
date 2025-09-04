/**
 * The Mode Class. This class stores information about the mode
 * of the SDK. There are two modes in which SDK runs
 * 1. SHOPIFY
 * 2. WEB
 * This also keeps track of the browser object from shopify
 * @class
 */
class ModeManager {
  /**
   * @type {('SHOPIFY' | 'WEB')} mode
   */
  #mode

  /**
   * @type {import('../clevertapShopify').browser} browser
   */
  #browser

  set mode (mode) {
    this.#mode = mode
  }

  get mode () {
    return this.#mode
  }

  set browser (browser) {
    this.#browser = browser
  }

  get browser () {
    return this.#browser
  }
}

/**
 * Exporting this class as a singleton so that it can be imported in other classes as well
 */
const mode = new ModeManager()
export default mode
