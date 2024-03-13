
/**
 * Cookie object within browser
 * @typedef {Object} cookie
 * @property {(name?: string) => Promise<string>} get
 * @property {(cookieOrName: string, value?: string) => Promise<string>} set
 */

/**
 * Storage object within browser
 * @typedef {Object} Storage
 * @property {() => Promise<void>} clear
 * @property {(key: string) => Promise<string>} getItem
 * @property {(index: number) => Promise<string>} key
 * @property {() => Promise<number>} length
 * @property {(key: string) => Promise<void>} removeItem
 * @property {(key: string, value: any) => Promise<void>} setItem
 */

/**
 * Location object within document
 * @typedef {Object} Location
 * @property {string} hash
 * @property {string} host
 * @property {string} hostname
 * @property {string} href
 * @property {string} origin
 * @property {string} pathname
 * @property {string} port
 * @property {string} protocol
 * @property {string} search
 */

/**
 * Document Object within browser
 * @typedef {Object} Document
 * @property {string} referrer
 * @property {Location} location
 */

/**
 * Browser object from shopify
 * @typedef {Object} browser
 * @property {cookie} cookie
 * @property {Storage} localStorage
 * @property {Storage} sessionStorage
 * @property {Document} document
 */

import Account from './modules/account'
import DeviceManager from './modules/device'
import SessionManager from './modules/session'
import RequestManager from './modules/request'
import EventHandler from './modules/event'
import UserLoginHandler from './modules/userLogin'
import ModeManager from './modules/mode'
import { Logger, logLevels } from './modules/logger'
import { SCOOKIE_PREFIX } from './util/constants'
import { StorageManager, $ct } from './util/storage'
import { addToURL, getHostName } from './util/url'
import { compressData } from './util/encoder'
import { clevertapApi } from './modules/api'

/**
 * The new class for shopify.
 * We export this as it is and initialize it on the shopify app pixel
 *
 * @example
 * const clevertap = new ClevertapShopify({ browser, accountId, region, targetDomain });
 * @class ClevertapShopify
 */
class ClevertapShopify {
  /**
   * The Account object containing information about the id and region
   */
  #account

  /**
   * The Logger object
   */
  #logger

  /**
   * The Device Manger Object. Stores information about the guid
   */
  #device

  /**
   * The Session Object.
   */
  #session

  /**
   * The Request Object
   */
  #request

  constructor ({ browser, accountId, region }) {
    ModeManager.browser = browser
    ModeManager.mode = 'SHOPIFY'
    this.#logger = new Logger(logLevels.DEBUG)
    this.#account = new Account({ id: accountId }, region)
    this.#device = new DeviceManager({ logger: this.#logger })
    this.#session = new SessionManager({
      logger: this.#logger,
      isPersonalisationActive: () => false
    })
    this.#request = new RequestManager({
      logger: this.#logger,
      account: this.#account,
      device: this.#device,
      session: this.#session,
      isPersonalisationActive: () => false
    })
    this.event = new EventHandler({
      logger: this.#logger,
      request: this.#request,
      isPersonalisationActive: () => false
    })
    this.onUserLogin = new UserLoginHandler({
      request: this.#request,
      account: this.#account,
      session: this.#session,
      logger: this.#logger,
      device: this.#device
    })
    clevertapApi.setPrivateProperties({
      logger: this.#logger,
      request: this.#request,
      session: this.#session,
      device: this.#device
    })
  }

  async init () {
    this.#device.gcookie = await this.#device.getGuid()
    // @todo implement AsyncStorageManager
    await StorageManager.removeCookieAsync('WZRK_P', getHostName())
    if (!this.#account.id) {
      return false
    }
    this.#session.cookieName = SCOOKIE_PREFIX + '_' + this.#account.id

    // @todo make a decision whether we want to directly send privacy as true
    await this.pageChanged()
  }

  async pageChanged () {
    const currentLocation = ModeManager.browser.document.location.href
    // -- update page count
    const obj = await this.#session.getSessionCookieObject()
    let pgCount = (typeof obj.p === 'undefined') ? 0 : obj.p
    obj.p = ++pgCount
    await this.#session.setSessionCookieObject(obj)

    let data = {}
    data = await this.#request.addSystemDataToObject(data, undefined)
    data.cpg = currentLocation

    let pageLoadUrl = this.#account.dataPostURL
    let { protocol } = ModeManager.browser.document.location
    protocol = protocol.replace(':', '')
    data.af = { protocol }

    pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page')
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), this.#logger))

    await this.#request.addFlags(data)

    await this.#request.saveAndFireRequest(pageLoadUrl, $ct.blockRequest)
  }
}

export default ClevertapShopify
