var clevertapShopify = (function () {
  'use strict';

  var id = 0;

  function _classPrivateFieldLooseKey(name) {
    return "__private_" + id++ + "_" + name;
  }

  function _classPrivateFieldLooseBase(receiver, privateKey) {
    if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
      throw new TypeError("attempted to use private field on non-instance");
    }

    return receiver;
  }

  const TARGET_DOMAIN = 'clevertap-prod.com';
  const TARGET_PROTOCOL = 'https:';
  const DEFAULT_REGION = 'eu1';

  var _mode = _classPrivateFieldLooseKey("mode");

  var _browser = _classPrivateFieldLooseKey("browser");

  /**
   * The Mode Class. This class stores information about the mode
   * of the SDK. There are two modes in which SDK runs
   * 1. SHOPIFY
   * 2. WEB
   * This also keeps track of the browser object from shopify
   * @class
   */
  class ModeManager {
    constructor() {
      Object.defineProperty(this, _mode, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _browser, {
        writable: true,
        value: void 0
      });
    }

    set mode(mode) {
      _classPrivateFieldLooseBase(this, _mode)[_mode] = mode;
    }

    get mode() {
      return _classPrivateFieldLooseBase(this, _mode)[_mode];
    }

    set browser(browser) {
      _classPrivateFieldLooseBase(this, _browser)[_browser] = browser;
    }

    get browser() {
      return _classPrivateFieldLooseBase(this, _browser)[_browser];
    }

  }
  /**
   * Exporting this class as a singleton so that it can be imported in other classes as well
   */


  const mode = new ModeManager();

  var _accountId = _classPrivateFieldLooseKey("accountId");

  var _region = _classPrivateFieldLooseKey("region");

  var _targetDomain = _classPrivateFieldLooseKey("targetDomain");

  var _dcSdkversion = _classPrivateFieldLooseKey("dcSdkversion");

  class Account {
    constructor() {
      let {
        id
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      let region = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      let targetDomain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : TARGET_DOMAIN;
      Object.defineProperty(this, _accountId, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _region, {
        writable: true,
        value: ''
      });
      Object.defineProperty(this, _targetDomain, {
        writable: true,
        value: TARGET_DOMAIN
      });
      Object.defineProperty(this, _dcSdkversion, {
        writable: true,
        value: ''
      });
      this.id = id;

      if (region) {
        this.region = region;
      }

      if (targetDomain) {
        this.targetDomain = targetDomain;
      }
    }

    get id() {
      return _classPrivateFieldLooseBase(this, _accountId)[_accountId];
    }

    set id(accountId) {
      _classPrivateFieldLooseBase(this, _accountId)[_accountId] = accountId;
    }

    get region() {
      return _classPrivateFieldLooseBase(this, _region)[_region];
    }

    set region(region) {
      _classPrivateFieldLooseBase(this, _region)[_region] = region;
    }

    get dcSDKVersion() {
      return _classPrivateFieldLooseBase(this, _dcSdkversion)[_dcSdkversion];
    }

    set dcSDKVersion(dcSDKVersion) {
      _classPrivateFieldLooseBase(this, _dcSdkversion)[_dcSdkversion] = dcSDKVersion;
    }

    get targetDomain() {
      return _classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain];
    }

    set targetDomain(targetDomain) {
      _classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain] = targetDomain;
    }

    get finalTargetDomain() {
      if (this.region) {
        return "".concat(this.region, ".").concat(this.targetDomain);
      } else {
        if (this.targetDomain === TARGET_DOMAIN) {
          return "".concat(DEFAULT_REGION, ".").concat(this.targetDomain);
        }

        return this.targetDomain;
      }
    }

    get endpoint() {
      if (mode.mode === 'SHOPIFY') {
        return '/shopify';
      }

      return '/a';
    }

    get dataPostURL() {
      return "".concat(TARGET_PROTOCOL, "//").concat(this.finalTargetDomain, "/").concat(this.endpoint, "?t=96");
    }

    get recorderURL() {
      return "".concat(TARGET_PROTOCOL, "//").concat(this.finalTargetDomain, "/r?r=1");
    }

    get emailURL() {
      return "".concat(TARGET_PROTOCOL, "//").concat(this.finalTargetDomain, "/e?r=1");
    }

  }

  const unsupportedKeyCharRegex = new RegExp('^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$', 'g');
  const unsupportedValueCharRegex = new RegExp("^\\s+|\'|\"|\\\\|\\s+$", 'g');
  const singleQuoteRegex = new RegExp('\'', 'g');
  const CLEAR = 'clear';
  const CHARGED_ID = 'Charged ID';
  const CHARGEDID_COOKIE_NAME = 'WZRK_CHARGED_ID';
  const GCOOKIE_NAME = 'WZRK_G';
  const KCOOKIE_NAME = 'WZRK_K';
  const CAMP_COOKIE_NAME = 'WZRK_CAMP';
  const CAMP_COOKIE_G = 'WZRK_CAMP_G'; // cookie for storing campaign details against guid

  const SCOOKIE_PREFIX = 'WZRK_S';
  const SCOOKIE_EXP_TIME_IN_SECS = 60 * 20; // 20 mins

  const EV_COOKIE = 'WZRK_EV';
  const META_COOKIE = 'WZRK_META';
  const PR_COOKIE = 'WZRK_PR';
  const ARP_COOKIE = 'WZRK_ARP';
  const LCOOKIE_NAME = 'WZRK_L';
  const WEBPUSH_LS_KEY = 'WZRK_WPR';
  const OPTOUT_COOKIE_ENDSWITH = ':OO';
  const USEIP_KEY = 'useIP';
  const LRU_CACHE = 'WZRK_X';
  const LRU_CACHE_SIZE = 100;
  const IS_OUL = 'isOUL';
  const EVT_PUSH = 'push';
  const COOKIE_EXPIRY = 86400 * 365; // 1 Year in seconds

  const MAX_TRIES = 200; // API tries
  const NOTIFICATION_VIEWED = 'Notification Viewed';
  const NOTIFICATION_CLICKED = 'Notification Clicked';
  const FIRE_PUSH_UNREGISTERED = 'WZRK_FPU';
  const PUSH_SUBSCRIPTION_DATA = 'WZRK_PSD'; // PUSH SUBSCRIPTION DATA FOR REGISTER/UNREGISTER TOKEN
  const SYSTEM_EVENTS = ['Stayed', 'UTM Visited', 'App Launched', 'Notification Sent', NOTIFICATION_VIEWED, NOTIFICATION_CLICKED];

  const isString = input => {
    return typeof input === 'string' || input instanceof String;
  };
  const isObject = input => {
    // TODO: refine
    return Object.prototype.toString.call(input) === '[object Object]';
  };
  const isDateObject = input => {
    return typeof input === 'object' && input instanceof Date;
  };
  const isObjectEmpty = obj => {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return true;
  };
  const isConvertibleToNumber = n => {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
  const isNumber = n => {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n) && typeof n === 'number';
  };
  const isValueValid = value => {
    if (value === null || value === undefined || value === 'undefined') {
      return false;
    }

    return true;
  };
  const removeUnsupportedChars = (o, logger) => {
    // keys can't be greater than 1024 chars, values can't be greater than 1024 chars
    if (typeof o === 'object') {
      for (const key in o) {
        if (o.hasOwnProperty(key)) {
          const sanitizedVal = removeUnsupportedChars(o[key], logger);
          let sanitizedKey;
          sanitizedKey = sanitize(key, unsupportedKeyCharRegex);

          if (sanitizedKey.length > 1024) {
            sanitizedKey = sanitizedKey.substring(0, 1024);
            logger.reportError(520, sanitizedKey + '... length exceeded 1024 chars. Trimmed.');
          }

          delete o[key];
          o[sanitizedKey] = sanitizedVal;
        }
      }
    } else {
      let val;

      if (isString(o)) {
        val = sanitize(o, unsupportedValueCharRegex);

        if (val.length > 1024) {
          val = val.substring(0, 1024);
          logger.reportError(521, val + '... length exceeded 1024 chars. Trimmed.');
        }
      } else {
        val = o;
      }

      return val;
    }

    return o;
  };
  const sanitize = (input, regex) => {
    return input.replace(regex, '');
  };

  class ShopifyStorageManager {
    /**
     * saves to localStorage
     * @param {string} key
     * @param {*} value
     * @returns {Promise<boolean>} true if the value is saved
     */
    static async saveAsync(key, value) {
      if (!key || !value) {
        return false;
      }

      try {
        await mode.browser.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    }
    /**
     * reads from localStorage
     * @param {string} key
     * @returns {Promise<string | null>}
     */


    static async readAsync(key) {
      if (!key) {
        return false;
      }

      let data;

      try {
        data = await mode.browser.localStorage.getItem(key);
        data = JSON.parse(data);
      } catch (e) {
        data = null;
      }

      return data;
    }
    /**
     * removes item from localStorage
     * @param {string} key
     * @returns {Promise<boolean>}
     */


    static async removeAsync(key) {
      if (!key) {
        return false;
      }

      try {
        await mode.browser.localStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    }
    /**
     * creates a cookie and sets it in the browser
     * @param {string} name
     * @param {string} value
     * @param {strings} seconds
     * @param {*} domain
     * @returns {Promise<boolean>} true if the cookie was created, false if it is not created
     */


    static async createCookieAsync(name, value, seconds, domain) {
      let expires = '';
      let domainStr = '';

      if (seconds) {
        const date = new Date();
        date.setTime(date.getTime() + seconds * 1000);
        expires = '; expires=' + date.toGMTString();
      }

      if (domain) {
        domainStr = '; domain=' + domain;
      }

      value = encodeURIComponent(value);

      try {
        await mode.browser.cookie.set(name, value + expires + domainStr + '; path=/');
        return true;
      } catch (e) {
        return false;
      }
    }
    /**
     * reads the cookie in the browser
     * @param {string} name
     * @returns {Promise<string | null>} cookie
     */


    static async readCookieAsync(name) {
      let cookie;

      try {
        cookie = await mode.browser.cookie.get(name);
      } catch (e) {
        cookie = null;
      }

      if (cookie === '') {
        return null;
      }

      return cookie;
    }
    /**
     * removes the cookie
     * @param {string} name
     * @param {string} domain
     * @returns {Promise<boolean>}
     */


    static async removeCookieAsync(name, domain) {
      let cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      if (domain) {
        cookieStr = cookieStr + ' domain=' + domain + '; path=/';
      }

      try {
        await mode.browser.cookie.set(cookieStr);
        return true;
      } catch (e) {
        return false;
      }
    }

  }

  const addToURL = (url, k, v) => {
    return url + '&' + k + '=' + encodeURIComponent(v);
  };
  const getHostName = () => {
    if (mode.mode === 'SHOPIFY') {
      return mode.browser.document.location.hostname;
    }

    return window.location.hostname;
  };

  class StorageManager extends ShopifyStorageManager {
    static save(key, value) {
      if (!key || !value) {
        return false;
      }

      if (this._isLocalStorageSupported()) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        return true;
      }
    }

    static read(key) {
      if (!key) {
        return false;
      }

      let data = null;

      if (this._isLocalStorageSupported()) {
        data = localStorage.getItem(key);
      }

      if (data != null) {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }

      return data;
    }

    static remove(key) {
      if (!key) {
        return false;
      }

      if (this._isLocalStorageSupported()) {
        localStorage.removeItem(key);
        return true;
      }
    }

    static removeCookie(name, domain) {
      let cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      if (domain) {
        cookieStr = cookieStr + ' domain=' + domain + '; path=/';
      }

      document.cookie = cookieStr;
    }

    static createCookie(name, value, seconds, domain) {
      let expires = '';
      let domainStr = '';

      if (seconds) {
        const date = new Date();
        date.setTime(date.getTime() + seconds * 1000);
        expires = '; expires=' + date.toGMTString();
      }

      if (domain) {
        domainStr = '; domain=' + domain;
      }

      value = encodeURIComponent(value);
      document.cookie = name + '=' + value + expires + domainStr + '; path=/';
    }

    static readCookie(name) {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');

      for (let idx = 0; idx < ca.length; idx++) {
        let c = ca[idx];

        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        } // eslint-disable-next-line eqeqeq


        if (c.indexOf(nameEQ) == 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }

      return null;
    }

    static _isLocalStorageSupported() {
      if (mode.mode === 'SHOPIFY') return true;
      return 'localStorage' in window && window.localStorage !== null && typeof window.localStorage.setItem === 'function';
    }

    static async saveToLSorCookie(property, value) {
      if (value == null) {
        return;
      }

      try {
        if (this._isLocalStorageSupported()) {
          await this.addData('localStorage', property, encodeURIComponent(JSON.stringify(value)));
        } else {
          if (property === GCOOKIE_NAME) {
            await this.addData('cookie', property, encodeURIComponent(value), 0, getHostName());
          } else {
            await this.addData('cookie', property, encodeURIComponent(JSON.stringify(value)), 0, getHostName());
          }
        }

        $ct.globalCache[property] = value;
      } catch (e) {}
    }

    static async readFromLSorCookie(property) {
      let data;

      if ($ct.globalCache.hasOwnProperty(property)) {
        return $ct.globalCache[property];
      }

      if (this._isLocalStorageSupported()) {
        data = await this.retrieveData('localStorage', property);
      } else {
        data = await this.retrieveData('cookie', property);
      }

      if (data !== null && data !== undefined && !(typeof data.trim === 'function' && data.trim() === '')) {
        let value;

        try {
          value = JSON.parse(decodeURIComponent(data));
        } catch (err) {
          value = decodeURIComponent(data);
        }

        $ct.globalCache[property] = value;
        return value;
      }
    }

    static async createBroadCookie(name, value, seconds, domain) {
      // sets cookie on the base domain. e.g. if domain is baz.foo.bar.com, set cookie on ".bar.com"
      // To update an existing "broad domain" cookie, we need to know what domain it was actually set on.
      // since a retrieved cookie never tells which domain it was set on, we need to set another test cookie
      // to find out which "broadest" domain the cookie was set on. Then delete the test cookie, and use that domain
      // for updating the actual cookie.
      // This if condition is redundant. Domain will never be not defined.
      // even if it is undefined we directly pass it in the else.
      if (domain) {
        let broadDomain = $ct.broadDomain;

        if (broadDomain == null) {
          // if we don't know the broadDomain yet, then find out
          const domainParts = domain.split('.');
          let testBroadDomain = '';

          for (let idx = domainParts.length - 1; idx >= 0; idx--) {
            if (idx === 0) {
              testBroadDomain = domainParts[idx] + testBroadDomain;
            } else {
              testBroadDomain = '.' + domainParts[idx] + testBroadDomain;
            } // only needed if the cookie already exists and needs to be updated. See note above.


            if (await this.retrieveData('cookie', name)) {
              // no guarantee that browser will delete cookie, hence create short lived cookies
              var testCookieName = 'test_' + name + idx;
              await this.addData('cookie', testCookieName, value, 10, testBroadDomain); // self-destruct after 10 seconds

              if (await !this.retrieveData('cookie', testCookieName)) {
                // if test cookie not set, then the actual cookie wouldn't have been set on this domain either.
                continue;
              } else {
                // else if cookie set, then delete the test and the original cookie
                await this.deleteData('cookie', testCookieName, testBroadDomain);
              }
            }

            await this.addData('cookie', name, value, seconds, testBroadDomain);
            const tempCookie = await this.retrieveData('cookie', name); // eslint-disable-next-line eqeqeq

            if (tempCookie == value) {
              broadDomain = testBroadDomain;
              $ct.broadDomain = broadDomain;
              break;
            }
          }
        } else {
          await this.addData('cookie', name, value, seconds, broadDomain);
        }
      } else {
        await this.addData('cookie', name, value, seconds, domain);
      }
    }

    static async getMetaProp(property) {
      const metaObj = await this.readFromLSorCookie(META_COOKIE);

      if (metaObj != null) {
        return metaObj[property];
      }
    }

    static async setMetaProp(property, value) {
      if (this._isLocalStorageSupported()) {
        let wzrkMetaObj = await this.readFromLSorCookie(META_COOKIE);

        if (wzrkMetaObj == null) {
          wzrkMetaObj = {};
        }

        if (value === undefined) {
          delete wzrkMetaObj[property];
        } else {
          wzrkMetaObj[property] = value;
        }

        await this.saveToLSorCookie(META_COOKIE, wzrkMetaObj);
      }
    }

    static async getAndClearMetaProp(property) {
      const value = await this.getMetaProp(property);
      await this.setMetaProp(property, undefined);
      return value;
    }

    static async setInstantDeleteFlagInK() {
      let k = await this.readFromLSorCookie(KCOOKIE_NAME);

      if (k == null) {
        k = {};
      }

      k.flag = true;
      await this.saveToLSorCookie(KCOOKIE_NAME, k);
    }

    static async backupEvent(data, reqNo, logger) {
      let backupArr = await this.readFromLSorCookie(LCOOKIE_NAME);

      if (typeof backupArr === 'undefined') {
        backupArr = {};
      }

      backupArr[reqNo] = {
        q: data
      };
      await this.saveToLSorCookie(LCOOKIE_NAME, backupArr);
      logger.debug("stored in ".concat(LCOOKIE_NAME, " reqNo : ").concat(reqNo, " -> ").concat(data));
    }

    static async removeBackup(respNo, logger) {
      const backupMap = await this.readFromLSorCookie(LCOOKIE_NAME);

      if (typeof backupMap !== 'undefined' && backupMap !== null && typeof backupMap[respNo] !== 'undefined') {
        logger.debug("del event: ".concat(respNo, " data-> ").concat(backupMap[respNo].q));
        delete backupMap[respNo];
        await this.saveToLSorCookie(LCOOKIE_NAME, backupMap);
      }
    }
    /**
     * A helper method to get data from either cookies or local storage.
     * This also checks the mode of the SDK and decides which methods to call
     * @param {('cookie' | 'localStorage')} type
     * @param {string} name
     * @returns {Promise<any>} cookieOrLocalStorageValue
     */


    static async retrieveData(type, name) {
      let cookieOrLocalStorageValue;

      switch (type) {
        case 'cookie':
          {
            if (mode.mode === 'WEB') {
              cookieOrLocalStorageValue = this.readCookie(name);
            } else {
              cookieOrLocalStorageValue = await this.readCookieAsync(name);
            }

            break;
          }

        case 'localStorage':
          {
            if (mode.mode === 'WEB') {
              cookieOrLocalStorageValue = this.read(name);
            } else {
              cookieOrLocalStorageValue = await this.readAsync(name);
            }

            break;
          }
      }

      return cookieOrLocalStorageValue;
    }
    /**
     * A helper method to add data to either cookies or local storage.
     * This also checks the mode of the SDK and decides which methods to call
     * @param {('cookie' | 'localStorage')} type
     * @param {string} name
     * @param {string} value
     * @param {string} seconds
     * @param {string} domain
     * @returns {Promise<any>} saved
     */


    static async addData(type, name, value, seconds, domain) {
      switch (type) {
        case 'cookie':
          {
            if (mode.mode === 'WEB') {
              this.createCookie(name, value, seconds, domain);
            } else {
              await this.readCookieAsync(name, value, seconds, domain);
            }

            break;
          }

        case 'localStorage':
          {
            if (mode.mode === 'WEB') {
              this.save(name, value);
            } else {
              await this.saveAsync(name, value);
            }

            break;
          }
      }
    }
    /**
     * A helper method to get data from either cookies or local storage.
     * This also checks the mode of the SDK and decides which methods to call
     * @param {('cookie' | 'localStorage')} type
     * @param {string} name
     * @returns {Promise<any>} cookieOrLocalStorageValue
     */


    static async deleteData(type, name, domain) {
      switch (type) {
        case 'cookie':
          {
            if (mode.mode === 'WEB') {
              this.removeCookie(name);
            } else {
              await this.removeCookieAsync(name, domain);
            }

            break;
          }

        case 'localStorage':
          {
            if (mode.mode === 'WEB') {
              this.remove(name);
            } else {
              await this.removeAsync(name);
            }

            break;
          }
      }
    }

  }
  const $ct = {
    globalCache: {
      gcookie: null,
      REQ_N: 0,
      RESP_N: 0
    },
    LRU_CACHE: null,
    globalProfileMap: undefined,
    globalEventsMap: undefined,
    blockRequest: false,
    isOptInRequest: false,
    broadDomain: null,
    webPushEnabled: null,
    campaignDivMap: {},
    currentSessionId: null,
    wiz_counter: 0,
    // to keep track of number of times we load the body
    notifApi: {
      notifEnabledFromApi: false
    },
    // helper variable to handle race condition and check when notifications were called
    unsubGroups: [],
    updatedCategoryLong: null,
    inbox: null,
    isPrivacyArrPushed: false,
    privacyArray: [],
    offline: false,
    location: null,
    dismissSpamControl: false,
    globalUnsubscribe: true,
    flutterVersion: null // domain: window.location.hostname, url -> getHostName()
    // gcookie: -> device

  };

  var _logger = _classPrivateFieldLooseKey("logger");

  class DeviceManager {
    constructor(_ref) {
      let {
        logger
      } = _ref;
      Object.defineProperty(this, _logger, {
        writable: true,
        value: void 0
      });
      this.gcookie = void 0;
      _classPrivateFieldLooseBase(this, _logger)[_logger] = logger;
    }

    async getGuid() {
      let guid = null;

      if (isValueValid(this.gcookie)) {
        return this.gcookie;
      }

      if (StorageManager._isLocalStorageSupported()) {
        const value = await StorageManager.retrieveData('localStorage', GCOOKIE_NAME);

        if (isValueValid(value)) {
          try {
            guid = JSON.parse(decodeURIComponent(value));
          } catch (e) {
            _classPrivateFieldLooseBase(this, _logger)[_logger].debug('Cannot parse Gcookie from localstorage - must be encoded ' + value); // assumming guids are of size 32. supporting both formats.
            // guid can have encodedURIComponent or be without it.
            // 1.56e4078ed15749928c042479ec2b4d47 - breaks on JSON.parse(decodeURIComponent())
            // 2.%2256e4078ed15749928c042479ec2b4d47%22


            if (value.length === 32) {
              guid = value;
              await StorageManager.saveToLSorCookie(GCOOKIE_NAME, value);
            } else {
              _classPrivateFieldLooseBase(this, _logger)[_logger].error('Illegal guid ' + value);
            }
          } // Persist to cookie storage if not present there.


          if (isValueValid(guid)) {
            await StorageManager.createBroadCookie(GCOOKIE_NAME, guid, COOKIE_EXPIRY, getHostName());
          }
        }
      }

      if (!isValueValid(guid)) {
        guid = await StorageManager.retrieveData('cookie', GCOOKIE_NAME);

        if (isValueValid(guid) && (guid.indexOf('%') === 0 || guid.indexOf('\'') === 0 || guid.indexOf('"') === 0)) {
          guid = null;
        }

        if (isValueValid(guid)) {
          await StorageManager.saveToLSorCookie(GCOOKIE_NAME, guid);
        }
      }

      return guid;
    }

  }

  const getToday = () => {
    const today = new Date();
    return today.getFullYear() + '' + today.getMonth() + '' + today.getDay();
  };
  const getNow = () => {
    return Math.floor(new Date().getTime() / 1000);
  };
  const convertToWZRKDate = dateObj => {
    return '$D_' + Math.round(dateObj.getTime() / 1000);
  };
  const setDate = dt => {
    // expecting  yyyymmdd format either as a number or a string
    if (isDateValid(dt)) {
      return '$D_' + dt;
    }
  };
  const isDateValid = date => {
    const matches = /^(\d{4})(\d{2})(\d{2})$/.exec(date);
    if (matches == null) return false;
    const d = matches[3];
    const m = matches[2] - 1;
    const y = matches[1];
    const composedDate = new Date(y, m, d); // eslint-disable-next-line eqeqeq

    return composedDate.getDate() == d && composedDate.getMonth() == m && composedDate.getFullYear() == y;
  };

  var _logger$1 = _classPrivateFieldLooseKey("logger");

  var _sessionId = _classPrivateFieldLooseKey("sessionId");

  var _isPersonalisationActive = _classPrivateFieldLooseKey("isPersonalisationActive");

  class SessionManager {
    // SCOOKIE_NAME
    constructor(_ref) {
      let {
        logger,
        isPersonalisationActive
      } = _ref;
      Object.defineProperty(this, _logger$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _sessionId, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isPersonalisationActive, {
        writable: true,
        value: void 0
      });
      this.cookieName = void 0;
      this.scookieObj = void 0;
      this.sessionId = StorageManager.getMetaProp('cs');
      _classPrivateFieldLooseBase(this, _logger$1)[_logger$1] = logger;
      _classPrivateFieldLooseBase(this, _isPersonalisationActive)[_isPersonalisationActive] = isPersonalisationActive;
    }

    get sessionId() {
      return _classPrivateFieldLooseBase(this, _sessionId)[_sessionId];
    }

    set sessionId(sessionId) {
      _classPrivateFieldLooseBase(this, _sessionId)[_sessionId] = sessionId;
    }

    async getSessionCookieObject() {
      let scookieStr = await StorageManager.retrieveData('cookie', this.cookieName);
      let obj = {};

      if (scookieStr != null) {
        // converting back single quotes to double for JSON parsing - http://www.iandevlin.com/blog/2012/04/html5/cookies-json-localstorage-and-opera
        scookieStr = scookieStr.replace(singleQuoteRegex, '"');
        obj = JSON.parse(scookieStr);

        if (!isObject(obj)) {
          obj = {};
        } else {
          if (typeof obj.t !== 'undefined') {
            // check time elapsed since last request
            const lastTime = obj.t;
            const now = getNow();

            if (now - lastTime > SCOOKIE_EXP_TIME_IN_SECS + 60) {
              // adding 60 seconds to compensate for in-journey requests
              // ideally the cookie should've died after SCOOKIE_EXP_TIME_IN_SECS but it's still around as we can read
              // hence we shouldn't use it.
              obj = {};
            }
          }
        }
      }

      this.scookieObj = obj;
      return obj;
    }

    async setSessionCookieObject(obj) {
      const objStr = JSON.stringify(obj);
      await StorageManager.createBroadCookie(this.cookieName, objStr, SCOOKIE_EXP_TIME_IN_SECS, getHostName());
    }

    manageSession(session) {
      // first time. check if current session id in localstorage is same
      // if not same then prev = current and current = this new session
      if (typeof this.sessionId === 'undefined' || this.sessionId !== session) {
        const currentSessionInLS = StorageManager.getMetaProp('cs'); // if sessionId in meta is undefined - set current to both

        if (typeof currentSessionInLS === 'undefined') {
          StorageManager.setMetaProp('ps', session);
          StorageManager.setMetaProp('cs', session);
          StorageManager.setMetaProp('sc', 1);
        } else if (currentSessionInLS !== session) {
          // not same as session in local storage. new session
          StorageManager.setMetaProp('ps', currentSessionInLS);
          StorageManager.setMetaProp('cs', session);
          let sessionCount = StorageManager.getMetaProp('sc');

          if (typeof sessionCount === 'undefined') {
            sessionCount = 0;
          }

          StorageManager.setMetaProp('sc', sessionCount + 1);
        }

        this.sessionId = session;
      }
    }

    getTimeElapsed() {
      if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive)[_isPersonalisationActive]()) {
        return;
      }

      if (this.scookieObj != null) {
        // TODO: check logic?
        this.scookieObj = this.getSessionCookieObject();
      }

      const sessionStart = this.scookieObj.s;

      if (sessionStart != null) {
        const ts = getNow();
        return Math.floor(ts - sessionStart);
      }
    }

    getPageCount() {
      if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive)[_isPersonalisationActive]()) {
        return;
      }

      if (this.scookieObj != null) {
        // TODO: check logic
        this.scookieObj = this.getSessionCookieObject();
      }

      return this.scookieObj.p;
    }

  }

  /* eslint-disable */
  const compressData = (dataObject, logger) => {
    logger && typeof logger.debug === 'function' && logger.debug('dobj:' + dataObject);
    return compressToBase64(dataObject);
  };
  const compress = uncompressed => {
    if (uncompressed == null) return '';
    let i,
        value,
        context_dictionary = {},
        context_dictionaryToCreate = {},
        context_c = '',
        context_wc = '',
        context_w = '',
        context_enlargeIn = 2,
        // Compensate for the first entry which should not count
    context_dictSize = 3,
        context_numBits = 2,
        context_data_string = '',
        context_data_val = 0,
        context_data_position = 0,
        ii,
        f = String.fromCharCode;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);

      if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;

      if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = context_data_val << 1;

              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }

            value = context_w.charCodeAt(0);

            for (i = 0; i < 8; i++) {
              context_data_val = context_data_val << 1 | value & 1;

              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }

              value = value >> 1;
            }
          } else {
            value = 1;

            for (i = 0; i < context_numBits; i++) {
              context_data_val = context_data_val << 1 | value;

              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }

              value = 0;
            }

            value = context_w.charCodeAt(0);

            for (i = 0; i < 16; i++) {
              context_data_val = context_data_val << 1 | value & 1;

              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }

              value = value >> 1;
            }
          }

          context_enlargeIn--;

          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }

          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];

          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value & 1;

            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += f(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }

            value = value >> 1;
          }
        }

        context_enlargeIn--;

        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        } // Add wc to the dictionary.


        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    } // Output the code for w.


    if (context_w !== '') {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1;

            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += f(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }

          value = context_w.charCodeAt(0);

          for (i = 0; i < 8; i++) {
            context_data_val = context_data_val << 1 | value & 1;

            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += f(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }

            value = value >> 1;
          }
        } else {
          value = 1;

          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value;

            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += f(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }

            value = 0;
          }

          value = context_w.charCodeAt(0);

          for (i = 0; i < 16; i++) {
            context_data_val = context_data_val << 1 | value & 1;

            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += f(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }

            value = value >> 1;
          }
        }

        context_enlargeIn--;

        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }

        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];

        for (i = 0; i < context_numBits; i++) {
          context_data_val = context_data_val << 1 | value & 1;

          if (context_data_position == 15) {
            context_data_position = 0;
            context_data_string += f(context_data_val);
            context_data_val = 0;
          } else {
            context_data_position++;
          }

          value = value >> 1;
        }
      }

      context_enlargeIn--;

      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    } // Mark the end of the stream


    value = 2;

    for (i = 0; i < context_numBits; i++) {
      context_data_val = context_data_val << 1 | value & 1;

      if (context_data_position == 15) {
        context_data_position = 0;
        context_data_string += f(context_data_val);
        context_data_val = 0;
      } else {
        context_data_position++;
      }

      value = value >> 1;
    } // Flush the last char


    while (true) {
      context_data_val = context_data_val << 1;

      if (context_data_position == 15) {
        context_data_string += f(context_data_val);
        break;
      } else context_data_position++;
    }

    return context_data_string;
  };
  const getKeyStr = () => {
    let key = '';
    let i = 0;

    for (i = 0; i <= 25; i++) {
      key = key + String.fromCharCode(i + 65);
    }

    for (i = 0; i <= 25; i++) {
      key = key + String.fromCharCode(i + 97);
    }

    for (i = 0; i < 10; i++) {
      key = key + i;
    }

    return key + '+/=';
  };

  const _keyStr = getKeyStr();
  const compressToBase64 = input => {
    if (input == null) return '';
    var output = '';
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = compress(input);

    while (i < input.length * 2) {
      if (i % 2 == 0) {
        chr1 = input.charCodeAt(i / 2) >> 8;
        chr2 = input.charCodeAt(i / 2) & 255;
        if (i / 2 + 1 < input.length) chr3 = input.charCodeAt(i / 2 + 1) >> 8;else chr3 = NaN;
      } else {
        chr1 = input.charCodeAt((i - 1) / 2) & 255;

        if ((i + 1) / 2 < input.length) {
          chr2 = input.charCodeAt((i + 1) / 2) >> 8;
          chr3 = input.charCodeAt((i + 1) / 2) & 255;
        } else chr2 = chr3 = NaN;
      }

      i += 3;
      enc1 = chr1 >> 2;
      enc2 = (chr1 & 3) << 4 | chr2 >> 4;
      enc3 = (chr2 & 15) << 2 | chr3 >> 6;
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }

    return output;
  };

  var _keyOrder = _classPrivateFieldLooseKey("keyOrder");

  var _deleteFromObject = _classPrivateFieldLooseKey("deleteFromObject");

  class LRUCache {
    constructor(max) {
      Object.defineProperty(this, _deleteFromObject, {
        value: _deleteFromObject2
      });
      Object.defineProperty(this, _keyOrder, {
        writable: true,
        value: void 0
      });
      this.max = max;
      let lruCache = StorageManager.readFromLSorCookie(LRU_CACHE);

      if (lruCache) {
        const tempLruCache = {};
        _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder] = [];
        lruCache = lruCache.cache;

        for (const entry in lruCache) {
          if (lruCache.hasOwnProperty(entry)) {
            tempLruCache[lruCache[entry][0]] = lruCache[entry][1];

            _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder].push(lruCache[entry][0]);
          }
        }

        this.cache = tempLruCache;
      } else {
        this.cache = {};
        _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder] = [];
      }
    }

    get(key) {
      const item = this.cache[key];

      if (item) {
        this.cache = _classPrivateFieldLooseBase(this, _deleteFromObject)[_deleteFromObject](key, this.cache);
        this.cache[key] = item;

        _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder].push(key);
      }

      this.saveCacheToLS(this.cache);
      return item;
    }

    set(key, value) {
      const item = this.cache[key];

      const allKeys = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder];

      if (item != null) {
        this.cache = _classPrivateFieldLooseBase(this, _deleteFromObject)[_deleteFromObject](key, this.cache);
      } else if (allKeys.length === this.max) {
        this.cache = _classPrivateFieldLooseBase(this, _deleteFromObject)[_deleteFromObject](allKeys[0], this.cache);
      }

      this.cache[key] = value;

      if (_classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder][_classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder] - 1] !== key) {
        _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder].push(key);
      }

      this.saveCacheToLS(this.cache);
    }

    saveCacheToLS(cache) {
      const objToArray = [];

      const allKeys = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder];

      for (const index in allKeys) {
        if (allKeys.hasOwnProperty(index)) {
          const temp = [];
          temp.push(allKeys[index]);
          temp.push(cache[allKeys[index]]);
          objToArray.push(temp);
        }
      }

      StorageManager.saveToLSorCookie(LRU_CACHE, {
        cache: objToArray
      });
    }

    getKey(value) {
      if (value === null) {
        return null;
      }

      const allKeys = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder];

      for (const index in allKeys) {
        if (allKeys.hasOwnProperty(index)) {
          if (this.cache[allKeys[index]] === value) {
            return allKeys[index];
          }
        }
      }

      return null;
    }

    getSecondLastKey() {
      const keysArr = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder];

      if (keysArr != null && keysArr.length > 1) {
        return keysArr[keysArr.length - 2];
      }

      return -1;
    }

    getLastKey() {
      const keysLength = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder].length;

      if (keysLength) {
        return _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder][keysLength - 1];
      }
    }

  }

  var _deleteFromObject2 = function _deleteFromObject2(key, obj) {
    const allKeys = JSON.parse(JSON.stringify(_classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder]));
    const newCache = {};
    let indexToDelete;

    for (const index in allKeys) {
      if (allKeys.hasOwnProperty(index)) {
        if (allKeys[index] !== key) {
          newCache[allKeys[index]] = obj[allKeys[index]];
        } else {
          indexToDelete = index;
        }
      }
    }

    allKeys.splice(indexToDelete, 1);
    _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder] = JSON.parse(JSON.stringify(allKeys));
    return newCache;
  };

  /**
   * A utility class which contains just getters and setters
   * for certain properties defined on window.
   * @class
   */

  var _isOULInProgress = _classPrivateFieldLooseKey("isOULInProgress");

  var _oulReqN = _classPrivateFieldLooseKey("oulReqN");

  class GlobalWindow {
    constructor() {
      Object.defineProperty(this, _isOULInProgress, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _oulReqN, {
        writable: true,
        value: void 0
      });
    }

    get isOULInProgress() {
      if (mode.mode === 'WEB') {
        return window.isOULInProgress;
      }

      return _classPrivateFieldLooseBase(this, _isOULInProgress)[_isOULInProgress];
    }

    set isOULInProgress(value) {
      if (mode.mode === 'WEB') {
        window.isOULInProgress = value;
        return;
      }

      _classPrivateFieldLooseBase(this, _isOULInProgress)[_isOULInProgress] = value;
    }

    get oulReqN() {
      if (mode.mode === 'WEB') {
        return window.oulReqN;
      }

      return _classPrivateFieldLooseBase(this, _oulReqN)[_oulReqN];
    }

    set oulReqN(value) {
      if (mode.mode === 'WEB') {
        window.oulReqN = value;
        return;
      }

      _classPrivateFieldLooseBase(this, _oulReqN)[_oulReqN] = value;
    }

  }

  const globalWindow = new GlobalWindow();

  var _logger$2 = _classPrivateFieldLooseKey("logger");

  var _request = _classPrivateFieldLooseKey("request");

  var _device = _classPrivateFieldLooseKey("device");

  var _session = _classPrivateFieldLooseKey("session");

  class CleverTapAPI {
    constructor(props) {
      Object.defineProperty(this, _logger$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _request, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _device, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _session, {
        writable: true,
        value: void 0
      });
      this.setPrivateProperties(props);
    }

    setPrivateProperties(_ref) {
      let {
        logger,
        request,
        device,
        session
      } = _ref;
      _classPrivateFieldLooseBase(this, _logger$2)[_logger$2] = logger;
      _classPrivateFieldLooseBase(this, _request)[_request] = request;
      _classPrivateFieldLooseBase(this, _device)[_device] = device;
      _classPrivateFieldLooseBase(this, _session)[_session] = session;
    }
    /**
     *
     * @param {string} global gcookie
     * @param {string} session
     * @param {boolean} resume sent true in case of an OUL request from client side, which is returned as it is by server
     * @param {number} respNumber the index of the request in backupmanager
     * @param {boolean} optOutResponse
     * @returns
     */


    async s(global, session, resume, respNumber, optOutResponse) {
      let oulReq = false;
      let newGuid = false; // for a scenario when OUL request is true from client side
      // but resume is returned as false from server end
      // we maintan a OulReqN var in the window object
      // and compare with respNumber to determine the response of an OUL request

      if (globalWindow.isOULInProgress) {
        if (resume || respNumber !== 'undefined' && respNumber === globalWindow.oulReqN) {
          globalWindow.isOULInProgress = false;
          oulReq = true;
        }
      } // call back function used to store global and session ids for the user


      if (typeof respNumber === 'undefined') {
        respNumber = 0;
      }

      await StorageManager.removeBackup(respNumber, _classPrivateFieldLooseBase(this, _logger$2)[_logger$2]);

      if (respNumber > $ct.globalCache.REQ_N) {
        // request for some other user so ignore
        return;
      }

      if (!isValueValid(_classPrivateFieldLooseBase(this, _device)[_device].gcookie)) {
        if (global) {
          newGuid = true;
        }
      }

      if (!isValueValid(_classPrivateFieldLooseBase(this, _device)[_device].gcookie) || resume || typeof optOutResponse === 'boolean') {
        const sessionObj = _classPrivateFieldLooseBase(this, _session)[_session].getSessionCookieObject();
        /*  If the received session is less than the session in the cookie,
            then don't update guid as it will be response for old request
        */


        if (globalWindow.isOULInProgress || sessionObj.s && session < sessionObj.s) {
          return;
        }

        _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].debug("Cookie was ".concat(_classPrivateFieldLooseBase(this, _device)[_device].gcookie, " set to ").concat(global));

        _classPrivateFieldLooseBase(this, _device)[_device].gcookie = global;

        if (!isValueValid(_classPrivateFieldLooseBase(this, _device)[_device].gcookie)) {
          // clear useIP meta prop
          await StorageManager.getAndClearMetaProp(USEIP_KEY);
        }

        if (global && StorageManager._isLocalStorageSupported()) {
          if ($ct.LRU_CACHE == null) {
            $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE);
          }

          const kIdFromLS = await StorageManager.readFromLSorCookie(KCOOKIE_NAME);
          let guidFromLRUCache;

          if (kIdFromLS != null && kIdFromLS.id) {
            guidFromLRUCache = $ct.LRU_CACHE.cache[kIdFromLS.id];

            if (resume) {
              if (!guidFromLRUCache) {
                await StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, true); // replace login identity in OUL request
                // with the gcookie returned in exchange

                $ct.LRU_CACHE.set(kIdFromLS.id, global);
              }
            }
          }

          await StorageManager.saveToLSorCookie(GCOOKIE_NAME, global); // lastk provides the guid

          const lastK = $ct.LRU_CACHE.getSecondLastKey();

          if ((await StorageManager.readFromLSorCookie(FIRE_PUSH_UNREGISTERED)) && lastK !== -1) {
            const lastGUID = $ct.LRU_CACHE.cache[lastK]; // fire the request directly via fireRequest to unregister the token
            // then other requests with the updated guid should follow

            _classPrivateFieldLooseBase(this, _request)[_request].unregisterTokenForGuid(lastGUID);
          }
        }

        await StorageManager.createBroadCookie(GCOOKIE_NAME, global, COOKIE_EXPIRY, window.location.hostname);
        await StorageManager.saveToLSorCookie(GCOOKIE_NAME, global);
      }

      if (StorageManager._isLocalStorageSupported()) {
        _classPrivateFieldLooseBase(this, _session)[_session].manageSession(session);
      } // session cookie


      const obj = _classPrivateFieldLooseBase(this, _session)[_session].getSessionCookieObject(); // for the race-condition where two responses come back with different session ids. don't write the older session id.


      if (typeof obj.s === 'undefined' || obj.s <= session) {
        obj.s = session;
        obj.t = getNow(); // time of last response from server

        _classPrivateFieldLooseBase(this, _session)[_session].setSessionCookieObject(obj);
      } // set blockRequest to false only if the device has a valid gcookie


      if (isValueValid(_classPrivateFieldLooseBase(this, _device)[_device].gcookie)) {
        $ct.blockRequest = false;
      } // only process the backup events after an OUL request or a new guid is recieved


      if ((oulReq || newGuid) && !_classPrivateFieldLooseBase(this, _request)[_request].processingBackup) {
        _classPrivateFieldLooseBase(this, _request)[_request].processBackupEvents();
      }

      $ct.globalCache.RESP_N = respNumber;
    }

  }
  const clevertapApi = new CleverTapAPI({
    logger: '',
    request: '',
    device: '',
    session: ''
  });

  const DATA_NOT_SENT_TEXT = 'This property has been ignored.';
  const CLEVERTAP_ERROR_PREFIX = 'CleverTap error:'; // Formerly wzrk_error_txt
  const EVENT_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Event structure not valid. ").concat(DATA_NOT_SENT_TEXT);
  const GENDER_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Gender value should be either M or F. ").concat(DATA_NOT_SENT_TEXT);
  const EMPLOYED_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Employed value should be either Y or N. ").concat(DATA_NOT_SENT_TEXT);
  const MARRIED_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Married value should be either Y or N. ").concat(DATA_NOT_SENT_TEXT);
  const EDUCATION_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Education value should be either School, College or Graduate. ").concat(DATA_NOT_SENT_TEXT);
  const AGE_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Age value should be a number. ").concat(DATA_NOT_SENT_TEXT);
  const DOB_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " DOB value should be a Date Object");
  const PHONE_FORMAT_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Phone number should be formatted as +[country code][number]");

  // CleverTap specific utilities
  const getCampaignObject = () => {
    let finalcampObj = {};

    if (StorageManager._isLocalStorageSupported()) {
      let campObj = StorageManager.read(CAMP_COOKIE_NAME);

      if (campObj != null) {
        campObj = JSON.parse(decodeURIComponent(campObj).replace(singleQuoteRegex, '\"'));

        if (campObj.hasOwnProperty('global')) {
          finalcampObj.wp = campObj;
        } else {
          finalcampObj = campObj;
        }
      } else {
        finalcampObj = {};
      }
    }

    return finalcampObj;
  };
  const getCampaignObjForLc = () => {
    // before preparing data to send to LC , check if the entry for the guid is already there in CAMP_COOKIE_G
    const guid = JSON.parse(decodeURIComponent(StorageManager.read(GCOOKIE_NAME)));
    let campObj = {};

    if (StorageManager._isLocalStorageSupported()) {
      let resultObj = {};
      campObj = getCampaignObject();
      const storageValue = StorageManager.read(CAMP_COOKIE_G);
      const decodedValue = storageValue ? decodeURIComponent(storageValue) : null;
      const parsedValue = decodedValue ? JSON.parse(decodedValue) : null;
      const resultObjWP = !!guid && storageValue !== undefined && storageValue !== null && parsedValue && parsedValue[guid] && parsedValue[guid].wp ? Object.values(parsedValue[guid].wp) : [];
      const resultObjWI = !!guid && storageValue !== undefined && storageValue !== null && parsedValue && parsedValue[guid] && parsedValue[guid].wi ? Object.values(parsedValue[guid].wi) : [];
      const today = getToday();
      let todayCwp = 0;
      let todayCwi = 0;

      if (campObj.wp && campObj.wp[today] && campObj.wp[today].tc !== 'undefined') {
        todayCwp = campObj.wp[today].tc;
      }

      if (campObj.wi && campObj.wi[today] && campObj.wi[today].tc !== 'undefined') {
        todayCwi = campObj.wi[today].tc;
      }

      resultObj = {
        wmp: todayCwp,
        wimp: todayCwi,
        tlc: resultObjWP,
        witlc: resultObjWI
      };
      return resultObj;
    }
  };
  const isProfileValid = (profileObj, _ref) => {
    let {
      logger
    } = _ref;
    let valid = false;

    if (isObject(profileObj)) {
      for (const profileKey in profileObj) {
        if (profileObj.hasOwnProperty(profileKey)) {
          valid = true;
          let profileVal = profileObj[profileKey];

          if (profileVal == null) {
            delete profileObj[profileKey];
            continue;
          }

          if (profileKey === 'Gender' && !profileVal.match(/^M$|^F$/)) {
            valid = false;
            logger.error(GENDER_ERROR);
          }

          if (profileKey === 'Employed' && !profileVal.match(/^Y$|^N$/)) {
            valid = false;
            logger.error(EMPLOYED_ERROR);
          }

          if (profileKey === 'Married' && !profileVal.match(/^Y$|^N$/)) {
            valid = false;
            logger.error(MARRIED_ERROR);
          }

          if (profileKey === 'Education' && !profileVal.match(/^School$|^College$|^Graduate$/)) {
            valid = false;
            logger.error(EDUCATION_ERROR);
          }

          if (profileKey === 'Age' && profileVal != null) {
            if (isConvertibleToNumber(profileVal)) {
              profileObj.Age = +profileVal;
            } else {
              valid = false;
              logger.error(AGE_ERROR);
            }
          } // dob will come in like this - $dt_19470815 or dateObject


          if (profileKey === 'DOB') {
            if ((!/^\$D_/.test(profileVal) || (profileVal + '').length !== 11) && !isDateObject(profileVal)) {
              valid = false;
              logger.error(DOB_ERROR);
            }

            if (isDateObject(profileVal)) {
              profileObj[profileKey] = convertToWZRKDate(profileVal);
            }
          } else if (isDateObject(profileVal)) {
            profileObj[profileKey] = convertToWZRKDate(profileVal);
          }

          if (profileKey === 'Phone' && !isObjectEmpty(profileVal)) {
            if (profileVal.length > 8 && profileVal.charAt(0) === '+') {
              // valid phone number
              profileVal = profileVal.substring(1, profileVal.length);

              if (isConvertibleToNumber(profileVal)) {
                profileObj.Phone = +profileVal;
              } else {
                valid = false;
                logger.error(PHONE_FORMAT_ERROR + '. Removed.');
              }
            } else {
              valid = false;
              logger.error(PHONE_FORMAT_ERROR + '. Removed.');
            }
          }

          if (!valid) {
            delete profileObj[profileKey];
          }
        }
      }
    }

    return valid;
  };
  const processFBUserObj = user => {
    const profileData = {};
    profileData.Name = user.name;

    if (user.id != null) {
      profileData.FBID = user.id + '';
    } // Feb 2014 - FB announced over 58 gender options, hence we specifically look for male or female. Rest we don't care.


    if (user.gender === 'male') {
      profileData.Gender = 'M';
    } else if (user.gender === 'female') {
      profileData.Gender = 'F';
    } else {
      profileData.Gender = 'O';
    }

    const getHighestEducation = function (eduArr) {
      if (eduArr != null) {
        let college = '';
        let highschool = '';

        for (let i = 0; i < eduArr.length; i++) {
          const edu = eduArr[i];

          if (edu.type != null) {
            const type = edu.type;

            if (type === 'Graduate School') {
              return 'Graduate';
            } else if (type === 'College') {
              college = '1';
            } else if (type === 'High School') {
              highschool = '1';
            }
          }
        }

        if (college === '1') {
          return 'College';
        } else if (highschool === '1') {
          return 'School';
        }
      }
    };

    if (user.relationship_status != null) {
      profileData.Married = 'N';

      if (user.relationship_status === 'Married') {
        profileData.Married = 'Y';
      }
    }

    const edu = getHighestEducation(user.education);

    if (edu != null) {
      profileData.Education = edu;
    }

    const work = user.work != null ? user.work.length : 0;

    if (work > 0) {
      profileData.Employed = 'Y';
    } else {
      profileData.Employed = 'N';
    }

    if (user.email != null) {
      profileData.Email = user.email;
    }

    if (user.birthday != null) {
      const mmddyy = user.birthday.split('/'); // comes in as "08/15/1947"

      profileData.DOB = setDate(mmddyy[2] + mmddyy[0] + mmddyy[1]);
    }

    return profileData;
  };
  const processGPlusUserObj = (user, _ref2) => {
    let {
      logger
    } = _ref2;
    const profileData = {};

    if (user.displayName != null) {
      profileData.Name = user.displayName;
    }

    if (user.id != null) {
      profileData.GPID = user.id + '';
    }

    if (user.gender != null) {
      if (user.gender === 'male') {
        profileData.Gender = 'M';
      } else if (user.gender === 'female') {
        profileData.Gender = 'F';
      } else if (user.gender === 'other') {
        profileData.Gender = 'O';
      }
    }

    if (user.image != null) {
      if (user.image.isDefault === false) {
        profileData.Photo = user.image.url.split('?sz')[0];
      }
    }

    if (user.emails != null) {
      for (let emailIdx = 0; emailIdx < user.emails.length; emailIdx++) {
        const emailObj = user.emails[emailIdx];

        if (emailObj.type === 'account') {
          profileData.Email = emailObj.value;
        }
      }
    }

    if (user.organizations != null) {
      profileData.Employed = 'N';

      for (let i = 0; i < user.organizations.length; i++) {
        const orgObj = user.organizations[i];

        if (orgObj.type === 'work') {
          profileData.Employed = 'Y';
        }
      }
    }

    if (user.birthday != null) {
      const yyyymmdd = user.birthday.split('-'); // comes in as "1976-07-27"

      profileData.DOB = setDate(yyyymmdd[0] + yyyymmdd[1] + yyyymmdd[2]);
    }

    if (user.relationshipStatus != null) {
      profileData.Married = 'N';

      if (user.relationshipStatus === 'married') {
        profileData.Married = 'Y';
      }
    }

    logger.debug('gplus usr profile ' + JSON.stringify(profileData));
    return profileData;
  };
  const addToLocalProfileMap = async (profileObj, override) => {
    if (StorageManager._isLocalStorageSupported()) {
      if ($ct.globalProfileMap == null) {
        $ct.globalProfileMap = await StorageManager.readFromLSorCookie(PR_COOKIE);

        if ($ct.globalProfileMap == null) {
          $ct.globalProfileMap = {};
        }
      } // Move props from custom bucket to outside.


      if (profileObj._custom != null) {
        const keys = profileObj._custom;

        for (const key in keys) {
          if (keys.hasOwnProperty(key)) {
            profileObj[key] = keys[key];
          }
        }

        delete profileObj._custom;
      }

      for (const prop in profileObj) {
        if (profileObj.hasOwnProperty(prop)) {
          if ($ct.globalProfileMap.hasOwnProperty(prop) && !override) {
            continue;
          }

          $ct.globalProfileMap[prop] = profileObj[prop];
        }
      }

      if ($ct.globalProfileMap._custom != null) {
        delete $ct.globalProfileMap._custom;
      }

      await StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap);
    }
  };
  const arp = async jsonMap => {
    // For unregister calls dont set arp in LS
    if (jsonMap.skipResARP != null && jsonMap.skipResARP) {
      console.debug('Update ARP Request rejected', jsonMap);
      return null;
    }

    const isOULARP = jsonMap[IS_OUL] === true;

    if (StorageManager._isLocalStorageSupported()) {
      // Update arp only if it is null or an oul request
      try {
        let arpFromStorage = await StorageManager.readFromLSorCookie(ARP_COOKIE);

        if (arpFromStorage == null || isOULARP) {
          arpFromStorage = {};

          for (const key in jsonMap) {
            if (jsonMap.hasOwnProperty(key)) {
              if (jsonMap[key] === -1) {
                delete arpFromStorage[key];
              } else {
                arpFromStorage[key] = jsonMap[key];
              }
            }
          }

          await StorageManager.saveToLSorCookie(ARP_COOKIE, arpFromStorage);
        }
      } catch (e) {
        console.error('Unable to parse ARP JSON: ' + e);
      }
    }
  };

  var _fireRequest = _classPrivateFieldLooseKey("fireRequest");

  var _dropRequestDueToOptOut = _classPrivateFieldLooseKey("dropRequestDueToOptOut");

  var _addUseIPToRequest = _classPrivateFieldLooseKey("addUseIPToRequest");

  var _addARPToRequest = _classPrivateFieldLooseKey("addARPToRequest");

  class RequestDispatcher {
    // ANCHOR - Requests get fired from here

    /**
     * processes the response of fired events and calls relevant methods
     * @param {object} response
     */
    static async processResponse(response) {
      if (response.arp) {
        await arp(response.arp);
      }

      if (response.meta) {
        await clevertapApi.s(response.meta.g, // cookie
        response.meta.sid, // session id
        response.meta.rf, // resume
        response.meta.rn // response number for backup manager
        );
      }
    }
    /**
     *
     * @param {string} url
     * @param {*} skipARP
     * @param {boolean} sendOULFlag
     */


    static async fireRequest(url, skipARP, sendOULFlag) {
      await _classPrivateFieldLooseBase(this, _fireRequest)[_fireRequest](url, 1, skipARP, sendOULFlag);
    }

  }

  var _addARPToRequest2 = async function _addARPToRequest2(url, skipResARP) {
    if (skipResARP === true) {
      const _arp = {};
      _arp.skipResARP = true;
      return addToURL(url, 'arp', compressData(JSON.stringify(_arp), this.logger));
    }

    const arpValue = await StorageManager.readFromLSorCookie(ARP_COOKIE);

    if (typeof arpValue !== 'undefined' && arpValue !== null) {
      return addToURL(url, 'arp', compressData(JSON.stringify(arpValue), this.logger));
    }

    return url;
  };

  var _addUseIPToRequest2 = async function _addUseIPToRequest2(pageLoadUrl) {
    var useIP = await StorageManager.getMetaProp(USEIP_KEY);

    if (typeof useIP !== 'boolean') {
      useIP = false;
    }

    return addToURL(pageLoadUrl, USEIP_KEY, useIP ? 'true' : 'false');
  };

  var _dropRequestDueToOptOut2 = function _dropRequestDueToOptOut2() {
    if ($ct.isOptInRequest || !isValueValid(this.device.gcookie) || !isString(this.device.gcookie)) {
      $ct.isOptInRequest = false;
      return false;
    }

    return this.device.gcookie.slice(-3) === OPTOUT_COOKIE_ENDSWITH;
  };

  var _fireRequest2 = async function _fireRequest2(url, tries, skipARP, sendOULFlag) {
    if (_classPrivateFieldLooseBase(this, _dropRequestDueToOptOut)[_dropRequestDueToOptOut]()) {
      this.logger.debug('req dropped due to optout cookie: ' + this.device.gcookie);
      return;
    } // set a request in progress
    // so that if gcookie is not present, no other request can be made asynchronusly


    if (!isValueValid(this.device.gcookie)) {
      $ct.blockRequest = true;
    }
    /**
     * if the gcookie is null
     * and the request is not the first request
     * and the tries are less than max tries
     * keep retrying
     */


    if (!isValueValid(this.device.gcookie) && $ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1 && tries < MAX_TRIES) {
      // if ongoing First Request is in progress, initiate retry
      setTimeout(async () => {
        this.logger.debug("retrying fire request for url: ".concat(url, ", tries: ").concat(tries));
        await _classPrivateFieldLooseBase(this, _fireRequest)[_fireRequest](url, tries + 1, skipARP, sendOULFlag);
      }, 50);
      return;
    } // set isOULInProgress to true
    // when sendOULFlag is set to true


    if (!sendOULFlag) {
      if (isValueValid(this.device.gcookie)) {
        // add gcookie to url
        url = addToURL(url, 'gc', this.device.gcookie);
      }

      url = await _classPrivateFieldLooseBase(this, _addARPToRequest)[_addARPToRequest](url, skipARP);
    } else {
      globalWindow.isOULInProgress = true;
    }

    url = addToURL(url, 'tries', tries); // Add tries to URL

    url = await _classPrivateFieldLooseBase(this, _addUseIPToRequest)[_addUseIPToRequest](url);
    url = addToURL(url, 'r', new Date().getTime()); // add epoch to beat caching of the URL

    if (url.indexOf('chrome-extension:') !== -1) {
      url = url.replace('chrome-extension:', 'https:');
    }

    if (mode.mode === 'WEB') {
      var _window$clevertap, _window$wizrocket;

      // TODO: Figure out a better way to handle plugin check
      if (((_window$clevertap = window.clevertap) === null || _window$clevertap === void 0 ? void 0 : _window$clevertap.hasOwnProperty('plugin')) || ((_window$wizrocket = window.wizrocket) === null || _window$wizrocket === void 0 ? void 0 : _window$wizrocket.hasOwnProperty('plugin'))) {
        // used to add plugin name in request parameter
        const plugin = window.clevertap.plugin || window.wizrocket.plugin;
        url = addToURL(url, 'ct_pl', plugin);
      } // TODO: Try using Function constructor instead of appending script.


      var ctCbScripts = document.getElementsByClassName('ct-jp-cb');

      while (ctCbScripts[0] && ctCbScripts[0].parentNode) {
        ctCbScripts[0].parentNode.removeChild(ctCbScripts[0]);
      }

      const s = document.createElement('script');
      s.setAttribute('type', 'text/javascript');
      s.setAttribute('src', url);
      s.setAttribute('class', 'ct-jp-cb');
      s.setAttribute('rel', 'nofollow');
      s.async = true;
      document.getElementsByTagName('head')[0].appendChild(s);
    } else {
      fetch(url).then(res => res.json()).then(this.processResponse);
    }

    this.logger.debug('req snt -> url: ' + url);
  };

  RequestDispatcher.logger = void 0;
  RequestDispatcher.device = void 0;
  RequestDispatcher.mode = void 0;
  RequestDispatcher.api = void 0;
  Object.defineProperty(RequestDispatcher, _fireRequest, {
    value: _fireRequest2
  });
  Object.defineProperty(RequestDispatcher, _dropRequestDueToOptOut, {
    value: _dropRequestDueToOptOut2
  });
  Object.defineProperty(RequestDispatcher, _addUseIPToRequest, {
    value: _addUseIPToRequest2
  });
  Object.defineProperty(RequestDispatcher, _addARPToRequest, {
    value: _addARPToRequest2
  });

  let seqNo = 0;
  let requestTime = 0;

  var _logger$3 = _classPrivateFieldLooseKey("logger");

  var _account = _classPrivateFieldLooseKey("account");

  var _device$1 = _classPrivateFieldLooseKey("device");

  var _session$1 = _classPrivateFieldLooseKey("session");

  var _isPersonalisationActive$1 = _classPrivateFieldLooseKey("isPersonalisationActive");

  var _clearCookie = _classPrivateFieldLooseKey("clearCookie");

  var _addToLocalEventMap = _classPrivateFieldLooseKey("addToLocalEventMap");

  class RequestManager {
    constructor(_ref) {
      let {
        logger,
        account,
        device,
        session,
        isPersonalisationActive
      } = _ref;
      Object.defineProperty(this, _addToLocalEventMap, {
        value: _addToLocalEventMap2
      });
      Object.defineProperty(this, _logger$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _account, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _device$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _session$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isPersonalisationActive$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _clearCookie, {
        writable: true,
        value: false
      });
      this.processingBackup = false;
      _classPrivateFieldLooseBase(this, _logger$3)[_logger$3] = logger;
      _classPrivateFieldLooseBase(this, _account)[_account] = account;
      _classPrivateFieldLooseBase(this, _device$1)[_device$1] = device;
      _classPrivateFieldLooseBase(this, _session$1)[_session$1] = session;
      _classPrivateFieldLooseBase(this, _isPersonalisationActive$1)[_isPersonalisationActive$1] = isPersonalisationActive;
      RequestDispatcher.logger = logger;
      RequestDispatcher.device = device;
    }

    processBackupEvents() {
      const backupMap = StorageManager.readFromLSorCookie(LCOOKIE_NAME);

      if (typeof backupMap === 'undefined' || backupMap === null) {
        return;
      }

      this.processingBackup = true;

      for (const idx in backupMap) {
        if (backupMap.hasOwnProperty(idx)) {
          const backupEvent = backupMap[idx];

          if (typeof backupEvent.fired === 'undefined') {
            _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].debug('Processing backup event : ' + backupEvent.q);

            if (typeof backupEvent.q !== 'undefined') {
              RequestDispatcher.fireRequest(backupEvent.q);
            }

            backupEvent.fired = true;
          }
        }
      }

      StorageManager.saveToLSorCookie(LCOOKIE_NAME, backupMap);
      this.processingBackup = false;
    }

    async addSystemDataToObject(dataObject, ignoreTrim) {
      // ignore trim for chrome notifications; undefined everywhere else
      if (typeof ignoreTrim === 'undefined') {
        dataObject = removeUnsupportedChars(dataObject, _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]);
      }

      if (!isObjectEmpty(_classPrivateFieldLooseBase(this, _logger$3)[_logger$3].wzrkError)) {
        dataObject.wzrk_error = _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].wzrkError;
        _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].wzrkError = {};
      }

      dataObject.id = _classPrivateFieldLooseBase(this, _account)[_account].id;

      if (isValueValid(_classPrivateFieldLooseBase(this, _device$1)[_device$1].gcookie)) {
        dataObject.g = _classPrivateFieldLooseBase(this, _device$1)[_device$1].gcookie;
      }

      const obj = await _classPrivateFieldLooseBase(this, _session$1)[_session$1].getSessionCookieObject();
      dataObject.s = obj.s; // session cookie

      dataObject.pg = typeof obj.p === 'undefined' ? 1 : obj.p; // Page count

      if (typeof sessionStorage === 'object') {
        if (sessionStorage.hasOwnProperty('WZRK_D')) {
          dataObject.debug = true;
        }
      }

      return dataObject;
    }

    async addSystemDataToProfileObject(dataObject, ignoreTrim) {
      var _sessionStorage;

      if (!isObjectEmpty(_classPrivateFieldLooseBase(this, _logger$3)[_logger$3].wzrkError)) {
        dataObject.wzrk_error = _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].wzrkError;
        _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].wzrkError = {};
      }

      dataObject.id = _classPrivateFieldLooseBase(this, _account)[_account].id;

      if (isValueValid(_classPrivateFieldLooseBase(this, _device$1)[_device$1].gcookie)) {
        dataObject.g = _classPrivateFieldLooseBase(this, _device$1)[_device$1].gcookie;
      }

      const obj = await _classPrivateFieldLooseBase(this, _session$1)[_session$1].getSessionCookieObject();
      dataObject.s = obj.s; // session cookie

      dataObject.pg = typeof obj.p === 'undefined' ? 1 : obj.p; // Page count

      if ((_sessionStorage = sessionStorage) === null || _sessionStorage === void 0 ? void 0 : _sessionStorage.hasOwnProperty('WZRK_D')) {
        dataObject.debug = true;
      }

      return dataObject;
    }

    async addFlags(data) {
      // check if cookie should be cleared.
      _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] = await StorageManager.getAndClearMetaProp(CLEAR);

      if (_classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] !== undefined && _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie]) {
        data.rc = true;

        _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].debug('reset cookie sent in request and cleared from meta for future requests.');
      }

      if (_classPrivateFieldLooseBase(this, _isPersonalisationActive$1)[_isPersonalisationActive$1]()) {
        const lastSyncTime = await StorageManager.getMetaProp('lsTime');
        const expirySeconds = await StorageManager.getMetaProp('exTs'); // dsync not found in local storage - get data from server

        if (typeof lastSyncTime === 'undefined' || typeof expirySeconds === 'undefined') {
          data.dsync = true;
          return;
        }

        const now = getNow(); // last sync time has expired - get fresh data from server

        if (lastSyncTime + expirySeconds < now) {
          data.dsync = true;
        }
      }
    } // saves url to backup cache and fires the request

    /**
     *
     * @param {string} url
     * @param {boolean} override whether the request can go through or not
     * @param {Boolean} sendOULFlag - true in case of a On User Login request
     */


    async saveAndFireRequest(url, override, sendOULFlag) {
      const now = getNow();
      url = addToURL(url, 'rn', ++$ct.globalCache.REQ_N);
      const data = url + '&i=' + now + '&sn=' + seqNo; // TODO: Enable this
      // and an OUL request is not in progress
      // then process the request as it is
      // else block the request
      // note - $ct.blockRequest should ideally be used for override

      if ((!override || _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] !== undefined && _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie]) && !globalWindow.isOULInProgress) {
        if (now === requestTime) {
          seqNo++;
        } else {
          requestTime = now;
          seqNo = 0;
        }

        globalWindow.oulReqN = $ct.globalCache.REQ_N;
        await RequestDispatcher.fireRequest(data, false, sendOULFlag);
      } else {
        _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].debug("Not fired due to override - ".concat($ct.blockRequest, " or clearCookie - ").concat(_classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie], " or OUL request in progress - ").concat(globalWindow.isOULInProgress));
      }
    }

    async unregisterTokenForGuid(givenGUID) {
      const payload = await StorageManager.readFromLSorCookie(PUSH_SUBSCRIPTION_DATA); // Send unregister event only when token is available

      if (payload) {
        const data = {};
        data.type = 'data';

        if (isValueValid(givenGUID)) {
          data.g = givenGUID;
        }

        data.action = 'unregister';
        data.id = _classPrivateFieldLooseBase(this, _account)[_account].id;
        const obj = await _classPrivateFieldLooseBase(this, _session$1)[_session$1].getSessionCookieObject();
        data.s = obj.s; // session cookie

        const compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]);

        let pageLoadUrl = _classPrivateFieldLooseBase(this, _account)[_account].dataPostURL;

        pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data');
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData);
        await RequestDispatcher.fireRequest(pageLoadUrl, true);
        await StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false);
      } // REGISTER TOKEN


      await this.registerToken(payload);
    }

    async registerToken(payload) {
      if (!payload) return; // add gcookie etc to the payload

      payload = await this.addSystemDataToObject(payload, true);
      payload = JSON.stringify(payload);

      let pageLoadUrl = _classPrivateFieldLooseBase(this, _account)[_account].dataPostURL;

      pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data');
      pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(payload, _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]));
      await RequestDispatcher.fireRequest(pageLoadUrl); // set in localstorage

      StorageManager.addData('localStorage', WEBPUSH_LS_KEY, 'ok');
    }

    async processEvent(data) {
      await _classPrivateFieldLooseBase(this, _addToLocalEventMap)[_addToLocalEventMap](data.evtName);
      data = this.addSystemDataToObject(data, undefined);
      this.addFlags(data);
      data[CAMP_COOKIE_NAME] = getCampaignObjForLc();
      const compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]);

      let pageLoadUrl = _classPrivateFieldLooseBase(this, _account)[_account].dataPostURL;

      pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH);
      pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData);
      await this.saveAndFireRequest(pageLoadUrl, $ct.blockRequest);
    }

  }

  var _addToLocalEventMap2 = async function _addToLocalEventMap2(evtName) {
    if (StorageManager._isLocalStorageSupported()) {
      if (typeof $ct.globalEventsMap === 'undefined') {
        $ct.globalEventsMap = await StorageManager.readFromLSorCookie(EV_COOKIE);

        if (typeof $ct.globalEventsMap === 'undefined') {
          $ct.globalEventsMap = {};
        }
      }

      const nowTs = getNow();
      let evtDetail = $ct.globalEventsMap[evtName];

      if (typeof evtDetail !== 'undefined') {
        evtDetail[2] = nowTs;
        evtDetail[0]++;
      } else {
        evtDetail = [];
        evtDetail.push(1);
        evtDetail.push(nowTs);
        evtDetail.push(nowTs);
      }

      $ct.globalEventsMap[evtName] = evtDetail;
      await StorageManager.saveToLSorCookie(EV_COOKIE, $ct.globalEventsMap);
    }
  };

  let _globalChargedId;

  const isEventStructureFlat = eventObj => {
    // Events cannot have nested structure or Arrays
    if (isObject(eventObj)) {
      for (var key in eventObj) {
        if (eventObj.hasOwnProperty(key)) {
          if (isObject(eventObj[key]) || Array.isArray(eventObj[key])) {
            return false;
          } else if (isDateObject(eventObj[key])) {
            eventObj[key] = convertToWZRKDate(eventObj[key]);
          }
        }
      }

      return true;
    }

    return false;
  };
  const isChargedEventStructureValid = async (chargedObj, logger) => {
    if (isObject(chargedObj)) {
      for (var key in chargedObj) {
        if (chargedObj.hasOwnProperty(key)) {
          if (key === 'Items') {
            if (!Array.isArray(chargedObj[key])) {
              return false;
            }

            if (chargedObj[key].length > 50) {
              logger.reportError(522, 'Charged Items exceed 50 limit. Actual count: ' + chargedObj[key].length);
            }

            for (var itemKey in chargedObj[key]) {
              if (chargedObj[key].hasOwnProperty(itemKey)) {
                // since default array implementation could be overridden - e.g. Teabox site
                if (!isObject(chargedObj[key][itemKey]) || !isEventStructureFlat(chargedObj[key][itemKey])) {
                  return false;
                }
              }
            }
          } else {
            if (isObject(chargedObj[key]) || Array.isArray(chargedObj[key])) {
              return false;
            } else if (isDateObject(chargedObj[key])) {
              chargedObj[key] = convertToWZRKDate(chargedObj[key]);
            }
          }
        }
      }

      if (isString(chargedObj[CHARGED_ID]) || isNumber(chargedObj[CHARGED_ID])) {
        // save charged Id
        const chargedId = chargedObj[CHARGED_ID] + ''; // casting chargedId to string

        if (typeof _globalChargedId === 'undefined') {
          _globalChargedId = await StorageManager.readFromLSorCookie(CHARGEDID_COOKIE_NAME);
        }

        if (typeof _globalChargedId !== 'undefined' && _globalChargedId.trim() === chargedId.trim()) {
          // drop event- duplicate charged id
          logger.error('Duplicate charged Id - Dropped' + chargedObj);
          return false;
        }

        _globalChargedId = chargedId;
        await StorageManager.saveToLSorCookie(CHARGEDID_COOKIE_NAME, chargedId);
      }

      return true;
    } // if object (chargedObject)


    return false;
  };

  var _logger$4 = _classPrivateFieldLooseKey("logger");

  var _oldValues = _classPrivateFieldLooseKey("oldValues");

  var _request$1 = _classPrivateFieldLooseKey("request");

  var _isPersonalisationActive$2 = _classPrivateFieldLooseKey("isPersonalisationActive");

  var _processEventArray = _classPrivateFieldLooseKey("processEventArray");

  class EventHandler extends Array {
    constructor(_ref, values) {
      let {
        logger,
        request,
        isPersonalisationActive
      } = _ref;
      super();
      Object.defineProperty(this, _processEventArray, {
        value: _processEventArray2
      });
      Object.defineProperty(this, _logger$4, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _oldValues, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _request$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isPersonalisationActive$2, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _logger$4)[_logger$4] = logger;
      _classPrivateFieldLooseBase(this, _oldValues)[_oldValues] = values;
      _classPrivateFieldLooseBase(this, _request$1)[_request$1] = request;
      _classPrivateFieldLooseBase(this, _isPersonalisationActive$2)[_isPersonalisationActive$2] = isPersonalisationActive;
    }

    async push() {
      for (var _len = arguments.length, eventsArr = new Array(_len), _key = 0; _key < _len; _key++) {
        eventsArr[_key] = arguments[_key];
      }

      await _classPrivateFieldLooseBase(this, _processEventArray)[_processEventArray](eventsArr);
      return 0;
    }

    _processOldValues() {
      if (_classPrivateFieldLooseBase(this, _oldValues)[_oldValues]) {
        _classPrivateFieldLooseBase(this, _processEventArray)[_processEventArray](_classPrivateFieldLooseBase(this, _oldValues)[_oldValues]);
      }

      _classPrivateFieldLooseBase(this, _oldValues)[_oldValues] = null;
    }

    getDetails(evtName) {
      if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive$2)[_isPersonalisationActive$2]()) {
        return;
      }

      if (typeof $ct.globalEventsMap === 'undefined') {
        $ct.globalEventsMap = StorageManager.readFromLSorCookie(EV_COOKIE);
      }

      if (typeof $ct.globalEventsMap === 'undefined') {
        return;
      }

      const evtObj = $ct.globalEventsMap[evtName];
      const respObj = {};

      if (typeof evtObj !== 'undefined') {
        respObj.firstTime = new Date(evtObj[1] * 1000);
        respObj.lastTime = new Date(evtObj[2] * 1000);
        respObj.count = evtObj[0];
        return respObj;
      }
    }

  }

  var _processEventArray2 = async function _processEventArray2(eventsArr) {
    if (Array.isArray(eventsArr)) {
      while (eventsArr.length > 0) {
        var eventName = eventsArr.shift();

        if (!isString(eventName)) {
          _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].error(EVENT_ERROR);

          continue;
        }

        if (eventName.length > 1024) {
          eventName = eventName.substring(0, 1024);

          _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].reportError(510, eventName + '... length exceeded 1024 chars. Trimmed.');
        }

        if (SYSTEM_EVENTS.includes(eventName)) {
          _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].reportError(513, eventName + ' is a restricted system event. It cannot be used as an event name.');

          continue;
        }

        const data = {};
        data.type = 'event';
        data.evtName = sanitize(eventName, unsupportedKeyCharRegex);

        if (eventsArr.length !== 0) {
          const eventObj = eventsArr.shift();

          if (!isObject(eventObj)) {
            // put it back if it is not an object
            eventsArr.unshift(eventObj);
          } else {
            // check Charged Event vs. other events.
            if (eventName === 'Charged') {
              const isValid = await isChargedEventStructureValid(eventObj, _classPrivateFieldLooseBase(this, _logger$4)[_logger$4]);

              if (!isValid) {
                _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].reportError(511, 'Charged event structure invalid. Not sent.');

                continue;
              }
            } else {
              if (!isEventStructureFlat(eventObj)) {
                _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].reportError(512, eventName + ' event structure invalid. Not sent.');

                continue;
              }
            }

            data.evtData = eventObj;
          }
        }

        await _classPrivateFieldLooseBase(this, _request$1)[_request$1].processEvent(data);
      }
    }
  };

  var _request$2 = _classPrivateFieldLooseKey("request");

  var _logger$5 = _classPrivateFieldLooseKey("logger");

  var _account$1 = _classPrivateFieldLooseKey("account");

  var _session$2 = _classPrivateFieldLooseKey("session");

  var _oldValues$1 = _classPrivateFieldLooseKey("oldValues");

  var _device$2 = _classPrivateFieldLooseKey("device");

  var _processOUL = _classPrivateFieldLooseKey("processOUL");

  var _handleCookieFromCache = _classPrivateFieldLooseKey("handleCookieFromCache");

  var _deleteUser = _classPrivateFieldLooseKey("deleteUser");

  var _processLoginArray = _classPrivateFieldLooseKey("processLoginArray");

  class UserLoginHandler extends Array {
    constructor(_ref, values) {
      let {
        request,
        account,
        session,
        logger,
        device
      } = _ref;
      super();
      Object.defineProperty(this, _processLoginArray, {
        value: _processLoginArray2
      });
      Object.defineProperty(this, _deleteUser, {
        value: _deleteUser2
      });
      Object.defineProperty(this, _handleCookieFromCache, {
        value: _handleCookieFromCache2
      });
      Object.defineProperty(this, _processOUL, {
        value: _processOUL2
      });
      Object.defineProperty(this, _request$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger$5, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _account$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _session$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _oldValues$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _device$2, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _request$2)[_request$2] = request;
      _classPrivateFieldLooseBase(this, _account$1)[_account$1] = account;
      _classPrivateFieldLooseBase(this, _session$2)[_session$2] = session;
      _classPrivateFieldLooseBase(this, _logger$5)[_logger$5] = logger;
      _classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1] = values;
      _classPrivateFieldLooseBase(this, _device$2)[_device$2] = device;
    } // On User Login


    async clear() {
      _classPrivateFieldLooseBase(this, _logger$5)[_logger$5].debug('clear called. Reset flag has been set.');

      await _classPrivateFieldLooseBase(this, _deleteUser)[_deleteUser]();
      await StorageManager.setMetaProp(CLEAR, true);
    }

    async push() {
      for (var _len = arguments.length, profilesArr = new Array(_len), _key = 0; _key < _len; _key++) {
        profilesArr[_key] = arguments[_key];
      }

      await _classPrivateFieldLooseBase(this, _processLoginArray)[_processLoginArray](profilesArr);
      return 0;
    }

    _processOldValues() {
      if (_classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1]) {
        _classPrivateFieldLooseBase(this, _processLoginArray)[_processLoginArray](_classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1]);
      }

      _classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1] = null;
    }

  }

  var _processOUL2 = async function _processOUL2(profileArr) {
    let sendOULFlag = true;
    await StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag);

    const addToK = async ids => {
      let k = await StorageManager.readFromLSorCookie(KCOOKIE_NAME);
      const g = await StorageManager.readFromLSorCookie(GCOOKIE_NAME);
      let kId;

      if (k == null) {
        k = {};
        kId = ids;
      } else {
        /* check if already exists */
        kId = k.id;
        let anonymousUser = false;
        let foundInCache = false;

        if (kId == null) {
          kId = ids[0];
          anonymousUser = true;
        }

        if ($ct.LRU_CACHE == null && StorageManager._isLocalStorageSupported()) {
          $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE);
        }

        if (anonymousUser) {
          if (g != null) {
            // if have gcookie
            $ct.LRU_CACHE.set(kId, g);
            $ct.blockRequest = false;
          }
        } else {
          // check if the id is present in the cache
          // set foundInCache to true
          for (const idx in ids) {
            if (ids.hasOwnProperty(idx)) {
              const id = ids[idx];

              if ($ct.LRU_CACHE.cache[id]) {
                kId = id;
                foundInCache = true;
                break;
              }
            }
          }
        }

        if (foundInCache) {
          if (kId !== $ct.LRU_CACHE.getLastKey()) {
            // New User found
            // remove the entire cache
            await _classPrivateFieldLooseBase(this, _handleCookieFromCache)[_handleCookieFromCache]();
          } else {
            sendOULFlag = false;
            await StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag);
          }

          const gFromCache = $ct.LRU_CACHE.get(kId);
          $ct.LRU_CACHE.set(kId, gFromCache);
          await StorageManager.saveToLSorCookie(GCOOKIE_NAME, gFromCache);
          _classPrivateFieldLooseBase(this, _device$2)[_device$2].gcookie = gFromCache;
          const lastK = $ct.LRU_CACHE.getSecondLastKey();

          if ((await StorageManager.readFromLSorCookie(FIRE_PUSH_UNREGISTERED)) && lastK !== -1) {
            // CACHED OLD USER FOUND. TRANSFER PUSH TOKEN TO THIS USER
            const lastGUID = $ct.LRU_CACHE.cache[lastK];
            await _classPrivateFieldLooseBase(this, _request$2)[_request$2].unregisterTokenForGuid(lastGUID);
          }
        } else {
          if (!anonymousUser) {
            this.clear();
          } else {
            if (g != null) {
              _classPrivateFieldLooseBase(this, _device$2)[_device$2].gcookie = g;
              await StorageManager.saveToLSorCookie(GCOOKIE_NAME, g);
              sendOULFlag = false;
            }
          }

          await StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false);
          kId = ids[0];
        }
      }

      k.id = kId;
      await StorageManager.saveToLSorCookie(KCOOKIE_NAME, k);
    };

    if (Array.isArray(profileArr) && profileArr.length > 0) {
      for (const index in profileArr) {
        if (profileArr.hasOwnProperty(index)) {
          const outerObj = profileArr[index];
          let data = {};
          let profileObj;

          if (outerObj.Site != null) {
            // organic data from the site
            profileObj = outerObj.Site;

            if (isObjectEmpty(profileObj) || !isProfileValid(profileObj, {
              logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
            })) {
              return;
            }
          } else if (outerObj.Facebook != null) {
            // fb connect data
            const FbProfileObj = outerObj.Facebook; // make sure that the object contains any data at all

            if (!isObjectEmpty(FbProfileObj) && !FbProfileObj.error) {
              profileObj = processFBUserObj(FbProfileObj);
            }
          } else if (outerObj['Google Plus'] != null) {
            const GPlusProfileObj = outerObj['Google Plus'];

            if (isObjectEmpty(GPlusProfileObj) && !GPlusProfileObj.error) {
              profileObj = processGPlusUserObj(GPlusProfileObj, {
                logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
              });
            }
          }

          if (profileObj != null && !isObjectEmpty(profileObj)) {
            // profile got set from above
            data.type = 'profile';

            if (profileObj.tz == null) {
              // try to auto capture user timezone if not present
              profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
            }

            data.profile = profileObj;
            const ids = [];

            if (StorageManager._isLocalStorageSupported()) {
              if (profileObj.Identity) {
                ids.push(profileObj.Identity);
              }

              if (profileObj.Email) {
                ids.push(profileObj.Email);
              }

              if (profileObj.GPID) {
                ids.push('GP:' + profileObj.GPID);
              }

              if (profileObj.FBID) {
                ids.push('FB:' + profileObj.FBID);
              }

              if (ids.length > 0) {
                await addToK(ids);
              }
            }

            await addToLocalProfileMap(profileObj, true);
            data = await _classPrivateFieldLooseBase(this, _request$2)[_request$2].addSystemDataToObject(data, undefined);

            _classPrivateFieldLooseBase(this, _request$2)[_request$2].addFlags(data); // Adding 'isOUL' flag in true for OUL cases which.
            // This flag tells LC to create a new arp object.
            // Also we will receive the same flag in response arp which tells to delete existing arp object.


            if (sendOULFlag) {
              data[IS_OUL] = true;
            }

            const compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]);

            let pageLoadUrl = _classPrivateFieldLooseBase(this, _account$1)[_account$1].dataPostURL;

            pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH);
            pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData); // Whenever sendOULFlag is true then dont send arp and gcookie (guid in memory in the request)
            // Also when this flag is set we will get another flag from LC in arp which tells us to delete arp
            // stored in the cache and replace it with the response arp.

            await _classPrivateFieldLooseBase(this, _request$2)[_request$2].saveAndFireRequest(pageLoadUrl, $ct.blockRequest, sendOULFlag);
          }
        }
      }
    }
  };

  var _handleCookieFromCache2 = async function _handleCookieFromCache2() {
    $ct.blockRequest = false;
    console.debug('Block request is false');

    if (StorageManager._isLocalStorageSupported()) {
      [PR_COOKIE, EV_COOKIE, META_COOKIE, ARP_COOKIE, CAMP_COOKIE_NAME, CHARGEDID_COOKIE_NAME].forEach(async cookie => {
        await StorageManager.deleteData('localStorage', cookie);
      });
    }

    await StorageManager.deleteData('cookie', CAMP_COOKIE_NAME, getHostName());
    await StorageManager.deleteData('cookie', _classPrivateFieldLooseBase(this, _session$2)[_session$2].cookieName, $ct.broadDomain);
    await StorageManager.deleteData('cookie', ARP_COOKIE, $ct.broadDomain);
    await _classPrivateFieldLooseBase(this, _session$2)[_session$2].setSessionCookieObject('');
  };

  var _deleteUser2 = async function _deleteUser2() {
    $ct.blockRequest = true;

    _classPrivateFieldLooseBase(this, _logger$5)[_logger$5].debug('Block request is true');

    $ct.globalCache = {
      gcookie: null,
      REQ_N: 0,
      RESP_N: 0
    };

    if (StorageManager._isLocalStorageSupported()) {
      [GCOOKIE_NAME, KCOOKIE_NAME, PR_COOKIE, EV_COOKIE, META_COOKIE, ARP_COOKIE, CAMP_COOKIE_NAME, CHARGEDID_COOKIE_NAME].forEach(async cookie => {
        await StorageManager.deleteData('localStorage', cookie);
      });
    }

    await StorageManager.retrieveData('cookie', GCOOKIE_NAME, $ct.broadDomain);
    await StorageManager.retrieveData('cookie', CAMP_COOKIE_NAME, getHostName());
    await StorageManager.retrieveData('cookie', KCOOKIE_NAME, getHostName());
    await StorageManager.retrieveData('cookie', _classPrivateFieldLooseBase(this, _session$2)[_session$2].cookieName, $ct.broadDomain);
    await StorageManager.retrieveData('cookie', ARP_COOKIE, $ct.broadDomain);
    _classPrivateFieldLooseBase(this, _device$2)[_device$2].gcookie = null;
    await _classPrivateFieldLooseBase(this, _session$2)[_session$2].setSessionCookieObject('');
  };

  var _processLoginArray2 = async function _processLoginArray2(loginArr) {
    if (Array.isArray(loginArr) && loginArr.length > 0) {
      const profileObj = loginArr.pop();
      const processProfile = profileObj != null && isObject(profileObj) && (profileObj.Site != null && Object.keys(profileObj.Site).length > 0 || profileObj.Facebook != null && Object.keys(profileObj.Facebook).length > 0 || profileObj['Google Plus'] != null && Object.keys(profileObj['Google Plus']).length > 0);

      if (processProfile) {
        await StorageManager.setInstantDeleteFlagInK();

        try {
          await _classPrivateFieldLooseBase(this, _processOUL)[_processOUL]([profileObj]);
        } catch (e) {
          _classPrivateFieldLooseBase(this, _logger$5)[_logger$5].debug(e);
        }
      } else {
        _classPrivateFieldLooseBase(this, _logger$5)[_logger$5].error('Profile object is in incorrect format');
      }
    }
  };

  const logLevels = {
    DISABLE: 0,
    ERROR: 1,
    INFO: 2,
    DEBUG: 3
  };

  var _logLevel = _classPrivateFieldLooseKey("logLevel");

  var _log = _classPrivateFieldLooseKey("log");

  var _isLegacyDebug = _classPrivateFieldLooseKey("isLegacyDebug");

  class Logger {
    constructor(logLevel) {
      Object.defineProperty(this, _isLegacyDebug, {
        get: _get_isLegacyDebug,
        set: void 0
      });
      Object.defineProperty(this, _log, {
        value: _log2
      });
      Object.defineProperty(this, _logLevel, {
        writable: true,
        value: void 0
      });
      this.wzrkError = {};
      _classPrivateFieldLooseBase(this, _logLevel)[_logLevel] = logLevel == null ? logLevel : logLevels.INFO;
      this.wzrkError = {};
    }

    get logLevel() {
      return _classPrivateFieldLooseBase(this, _logLevel)[_logLevel];
    }

    set logLevel(logLevel) {
      _classPrivateFieldLooseBase(this, _logLevel)[_logLevel] = logLevel;
    }

    error(message) {
      if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.ERROR) {
        _classPrivateFieldLooseBase(this, _log)[_log]('error', message);
      }
    }

    info(message) {
      if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.INFO) {
        _classPrivateFieldLooseBase(this, _log)[_log]('log', message);
      }
    }

    debug(message) {
      if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.DEBUG || _classPrivateFieldLooseBase(this, _isLegacyDebug)[_isLegacyDebug]) {
        _classPrivateFieldLooseBase(this, _log)[_log]('debug', message);
      }
    }

    reportError(code, description) {
      this.wzrkError.c = code;
      this.wzrkError.d = description;
      this.error("".concat(CLEVERTAP_ERROR_PREFIX, " ").concat(code, ": ").concat(description));
    }

  }

  var _log2 = function _log2(level, message) {
    try {
      const ts = new Date().getTime();
      console[level]("CleverTap [".concat(ts, "]: ").concat(message));
    } catch (e) {}
  };

  var _get_isLegacyDebug = function () {
    return typeof sessionStorage !== 'undefined' && sessionStorage.WZRK_D === '';
  };

  /**
   * The new class for shopify.
   * We export this as it is and initialize it on the shopify app pixel
   *
   * @example
   * const clevertap = new ClevertapShopify({ browser, accountId, region, targetDomain });
   * @class ClevertapShopify
   */

  var _account$2 = _classPrivateFieldLooseKey("account");

  var _logger$6 = _classPrivateFieldLooseKey("logger");

  var _device$3 = _classPrivateFieldLooseKey("device");

  var _session$3 = _classPrivateFieldLooseKey("session");

  var _request$3 = _classPrivateFieldLooseKey("request");

  class ClevertapShopify {
    /**
     * The Account object containing information about the id and region
     */

    /**
     * The Logger object
     */

    /**
     * The Device Manger Object. Stores information about the guid
     */

    /**
     * The Session Object.
     */

    /**
     * The Request Object
     */
    constructor(_ref) {
      let {
        browser,
        accountId,
        region
      } = _ref;
      Object.defineProperty(this, _account$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger$6, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _device$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _session$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _request$3, {
        writable: true,
        value: void 0
      });
      mode.browser = browser;
      mode.mode = 'SHOPIFY';
      _classPrivateFieldLooseBase(this, _logger$6)[_logger$6] = new Logger(logLevels.INFO);
      _classPrivateFieldLooseBase(this, _account$2)[_account$2] = new Account({
        id: accountId
      }, region);
      _classPrivateFieldLooseBase(this, _device$3)[_device$3] = new DeviceManager({
        logger: _classPrivateFieldLooseBase(this, _logger$6)[_logger$6]
      });
      _classPrivateFieldLooseBase(this, _session$3)[_session$3] = new SessionManager({
        logger: _classPrivateFieldLooseBase(this, _logger$6)[_logger$6],
        isPersonalisationActive: () => false
      });
      _classPrivateFieldLooseBase(this, _request$3)[_request$3] = new RequestManager({
        logger: _classPrivateFieldLooseBase(this, _logger$6)[_logger$6],
        account: _classPrivateFieldLooseBase(this, _account$2)[_account$2],
        device: _classPrivateFieldLooseBase(this, _device$3)[_device$3],
        session: _classPrivateFieldLooseBase(this, _session$3)[_session$3],
        isPersonalisationActive: () => false
      });
      this.event = new EventHandler({
        logger: _classPrivateFieldLooseBase(this, _logger$6)[_logger$6],
        request: _classPrivateFieldLooseBase(this, _request$3)[_request$3],
        isPersonalisationActive: () => false
      });
      this.onUserLogin = new UserLoginHandler({
        request: _classPrivateFieldLooseBase(this, _request$3)[_request$3],
        account: _classPrivateFieldLooseBase(this, _account$2)[_account$2],
        session: _classPrivateFieldLooseBase(this, _session$3)[_session$3],
        logger: _classPrivateFieldLooseBase(this, _logger$6)[_logger$6],
        device: _classPrivateFieldLooseBase(this, _device$3)[_device$3]
      });
      clevertapApi.setPrivateProperties({
        logger: _classPrivateFieldLooseBase(this, _logger$6)[_logger$6],
        request: _classPrivateFieldLooseBase(this, _request$3)[_request$3],
        session: _classPrivateFieldLooseBase(this, _session$3)[_session$3],
        device: _classPrivateFieldLooseBase(this, _device$3)[_device$3]
      });
    }

    async init() {
      _classPrivateFieldLooseBase(this, _device$3)[_device$3].gcookie = await _classPrivateFieldLooseBase(this, _device$3)[_device$3].getGuid(); // @todo implement AsyncStorageManager

      await StorageManager.removeCookieAsync('WZRK_P', getHostName());

      if (!_classPrivateFieldLooseBase(this, _account$2)[_account$2].id) {
        return false;
      }

      _classPrivateFieldLooseBase(this, _session$3)[_session$3].cookieName = SCOOKIE_PREFIX + '_' + _classPrivateFieldLooseBase(this, _account$2)[_account$2].id; // @todo make a decision whether we want to directly send privacy as true

      await this.pageChanged();
    }

    async pageChanged() {
      const currentLocation = mode.browser.document.location.href; // -- update page count

      const obj = await _classPrivateFieldLooseBase(this, _session$3)[_session$3].getSessionCookieObject();
      let pgCount = typeof obj.p === 'undefined' ? 0 : obj.p;
      obj.p = ++pgCount;
      await _classPrivateFieldLooseBase(this, _session$3)[_session$3].setSessionCookieObject(obj);
      let data = {};
      data = await _classPrivateFieldLooseBase(this, _request$3)[_request$3].addSystemDataToObject(data, undefined);
      data.cpg = currentLocation;

      let pageLoadUrl = _classPrivateFieldLooseBase(this, _account$2)[_account$2].dataPostURL;

      let {
        protocol
      } = mode.browser.document.location;
      protocol = protocol.replace(':', '');
      data.af = {
        protocol
      };
      pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page');
      pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$6)[_logger$6]));
      await _classPrivateFieldLooseBase(this, _request$3)[_request$3].addFlags(data);
      await _classPrivateFieldLooseBase(this, _request$3)[_request$3].saveAndFireRequest(pageLoadUrl, $ct.blockRequest);
    }

  }

  return ClevertapShopify;

}());
