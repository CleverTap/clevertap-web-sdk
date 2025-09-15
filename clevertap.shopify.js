var clevertapShopify = (function () {
  'use strict';

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

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

  var TARGET_DOMAIN = 'clevertap-prod.com';
  var TARGET_PROTOCOL = 'https:';
  var DEFAULT_REGION = 'eu1';

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


  var mode = new ModeManager();

  var _accountId = _classPrivateFieldLooseKey("accountId");

  var _region = _classPrivateFieldLooseKey("region");

  var _targetDomain = _classPrivateFieldLooseKey("targetDomain");

  var _dcSdkversion = _classPrivateFieldLooseKey("dcSdkversion");

  var _token = _classPrivateFieldLooseKey("token");

  class Account {
    constructor() {
      var {
        id
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var region = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var targetDomain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : TARGET_DOMAIN;
      var token = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
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
      Object.defineProperty(this, _token, {
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

      if (token) {
        this.token = token;
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

    get token() {
      return _classPrivateFieldLooseBase(this, _token)[_token];
    }

    set token(token) {
      _classPrivateFieldLooseBase(this, _token)[_token] = token;
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
        return 'shopifyAppPixel';
      }

      return 'a';
    }

    get dataPostPEURL() {
      return "".concat(TARGET_PROTOCOL, "//").concat(this.finalTargetDomain, "/defineVars");
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

  var unsupportedKeyCharRegex = new RegExp('^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$', 'g');
  var unsupportedValueCharRegex = new RegExp("^\\s+|\'|\"|\\\\|\\s+$", 'g');
  var singleQuoteRegex = new RegExp('\'', 'g');
  var CLEAR = 'clear';
  var CHARGED_ID = 'Charged ID';
  var CHARGEDID_COOKIE_NAME = 'WZRK_CHARGED_ID';
  var GCOOKIE_NAME = 'WZRK_G';
  var KCOOKIE_NAME = 'WZRK_K';
  var CAMP_COOKIE_NAME = 'WZRK_CAMP';
  var CAMP_COOKIE_G = 'WZRK_CAMP_G'; // cookie for storing campaign details against guid

  var SCOOKIE_PREFIX = 'WZRK_S';
  var SCOOKIE_EXP_TIME_IN_SECS = 60 * 20; // 20 mins

  var EV_COOKIE = 'WZRK_EV';
  var META_COOKIE = 'WZRK_META';
  var PR_COOKIE = 'WZRK_PR';
  var ACCOUNT_ID = 'WZRK_ACCOUNT_ID';
  var ARP_COOKIE = 'WZRK_ARP';
  var LCOOKIE_NAME = 'WZRK_L';
  var SHOPIFY_DEBUG = 'WZRK_LOG_LEVEL';
  var WEBPUSH_LS_KEY = 'WZRK_WPR';
  var OPTOUT_COOKIE_ENDSWITH = ':OO';
  var USEIP_KEY = 'useIP';
  var LRU_CACHE = 'WZRK_X';
  var LRU_CACHE_SIZE = 100;
  var IS_OUL = 'isOUL';
  var EVT_PUSH = 'push';
  var COOKIE_EXPIRY = 86400 * 365; // 1 Year in seconds

  var MAX_TRIES = 200; // API tries
  var NOTIFICATION_VIEWED = 'Notification Viewed';
  var NOTIFICATION_CLICKED = 'Notification Clicked';
  var FIRE_PUSH_UNREGISTERED = 'WZRK_FPU';
  var PUSH_SUBSCRIPTION_DATA = 'WZRK_PSD'; // PUSH SUBSCRIPTION DATA FOR REGISTER/UNREGISTER TOKEN
  var PUSH_DELAY_MS = 1000;
  var MAX_DELAY_FREQUENCY = 1000 * 60 * 10;
  var WZRK_FETCH = 'wzrk_fetch';
  var BLOCK_REQUEST_COOKIE = 'WZRK_BLOCK'; // Flag key for optional sub-domain profile isolation

  var ISOLATE_COOKIE = 'WZRK_ISOLATE_SD';
  var SYSTEM_EVENTS = ['Stayed', 'UTM Visited', 'App Launched', 'Notification Sent', NOTIFICATION_VIEWED, NOTIFICATION_CLICKED];

  var isString = input => {
    return typeof input === 'string' || input instanceof String;
  };
  var isObject = input => {
    // TODO: refine
    return Object.prototype.toString.call(input) === '[object Object]';
  };
  var isDateObject = input => {
    return typeof input === 'object' && input instanceof Date;
  };
  var isObjectEmpty = obj => {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return true;
  };
  var isConvertibleToNumber = n => {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
  var isNumber = n => {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n) && typeof n === 'number';
  };
  var isValueValid = value => {
    if (value === null || value === undefined || value === 'undefined') {
      return false;
    }

    return true;
  };
  var removeUnsupportedChars = (o, logger) => {
    // keys can't be greater than 1024 chars, values can't be greater than 1024 chars
    if (typeof o === 'object') {
      for (var key in o) {
        if (o.hasOwnProperty(key)) {
          var sanitizedVal = removeUnsupportedChars(o[key], logger);
          var sanitizedKey = void 0;
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
      var val;

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
  var sanitize = (input, regex) => {
    return input.replace(regex, '');
  };

  class ShopifyStorageManager {
    /**
     * saves to localStorage
     * @param {string} key
     * @param {*} value
     * @returns {Promise<boolean>} true if the value is saved
     */
    static saveAsync(key, value) {
      return _asyncToGenerator(function* () {
        if (!key || !value) {
          return false;
        }

        try {
          yield mode.browser.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          return true;
        } catch (e) {
          return false;
        }
      })();
    }
    /**
     * reads from localStorage
     * @param {string} key
     * @returns {Promise<string | null>}
     */


    static readAsync(key) {
      return _asyncToGenerator(function* () {
        if (!key) {
          return false;
        }

        var data = null;

        try {
          data = yield mode.browser.localStorage.getItem(key);
        } catch (e) {}

        if (data != null) {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }

        return data;
      })();
    }
    /**
     * removes item from localStorage
     * @param {string} key
     * @returns {Promise<boolean>}
     */


    static removeAsync(key) {
      return _asyncToGenerator(function* () {
        if (!key) {
          return false;
        }

        try {
          yield mode.browser.localStorage.removeItem(key);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }
    /**
     * creates a cookie and sets it in the browser
     * @param {string} name
     * @param {string} value
     * @param {strings} seconds
     * @param {*} domain
     * @returns {Promise<boolean>} true if the cookie was created, false if it is not created
     */


    static createCookieAsync(name, value, seconds, domain) {
      return _asyncToGenerator(function* () {
        var expires = '';
        var domainStr = '';

        if (seconds) {
          var date = new Date();
          date.setTime(date.getTime() + seconds * 1000);
          expires = '; expires=' + date.toGMTString();
        }

        if (domain) {
          domainStr = '; domain=' + domain;
        }

        value = encodeURIComponent(value);

        try {
          yield mode.browser.cookie.set(name, value + expires + domainStr + '; path=/');
          return true;
        } catch (e) {
          return false;
        }
      })();
    }
    /**
     * reads the cookie in the browser
     * @param {string} name
     * @returns {Promise<string | null>} cookie
     */


    static readCookieAsync(name) {
      return _asyncToGenerator(function* () {
        var cookie;

        try {
          cookie = yield mode.browser.cookie.get(name);
        } catch (e) {
          cookie = null;
        }

        if (cookie === '') {
          return null;
        }

        return decodeURIComponent(cookie);
      })();
    }
    /**
     * removes the cookie
     * @param {string} name
     * @param {string} domain
     * @returns {Promise<boolean>}
     */


    static removeCookieAsync(name, domain) {
      return _asyncToGenerator(function* () {
        var cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        if (domain) {
          cookieStr = cookieStr + ' domain=' + domain + '; path=/';
        }

        try {
          yield mode.browser.cookie.set(cookieStr);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }

  }

  var addToURL = (url, k, v) => {
    return url + '&' + k + '=' + encodeURIComponent(v);
  };
  var getHostName = () => {
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

      var data = null;

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
      var cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      if (domain) {
        cookieStr = cookieStr + ' domain=' + domain + '; path=/';
      }

      document.cookie = cookieStr;
    }

    static createCookie(name, value, seconds, domain) {
      var expires = '';
      var domainStr = '';

      if (seconds) {
        var date = new Date();
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
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');

      for (var idx = 0; idx < ca.length; idx++) {
        var c = ca[idx];

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

    static saveToLSorCookie(property, value) {
      var _this = this;

      return _asyncToGenerator(function* () {
        if (value == null) {
          return;
        }

        try {
          if (_this._isLocalStorageSupported()) {
            yield _this.addData('localStorage', property, encodeURIComponent(JSON.stringify(value)));
          } else {
            if (property === GCOOKIE_NAME) {
              yield _this.addData('cookie', property, encodeURIComponent(value), 0, getHostName());
            } else {
              yield _this.addData('cookie', property, encodeURIComponent(JSON.stringify(value)), 0, getHostName());
            }
          }

          $ct.globalCache[property] = value;
        } catch (e) {}
      })();
    }

    static readFromLSorCookie(property) {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var data;

        if ($ct.globalCache.hasOwnProperty(property)) {
          return $ct.globalCache[property];
        }

        if (_this2._isLocalStorageSupported()) {
          data = yield _this2.retrieveData('localStorage', property);
        } else {
          data = yield _this2.retrieveData('cookie', property);
        }

        if (data !== null && data !== undefined && !(typeof data.trim === 'function' && data.trim() === '')) {
          var value;

          try {
            value = JSON.parse(decodeURIComponent(data));
          } catch (err) {
            value = decodeURIComponent(data);
          }

          $ct.globalCache[property] = value;
          return value;
        }
      })();
    }

    static createBroadCookie(name, value, seconds, domain) {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        /* -------------------------------------------------------------
         * Sub-domain isolation: when the global flag is set, skip the
         * broad-domain logic and write a cookie scoped to the current
         * host only.  Also remove any legacy broad-domain copy so that
         * the host-level cookie has precedence.
         * ----------------------------------------------------------- */
        var isolate = !!(yield _this3.retrieveData('localStorage', ISOLATE_COOKIE));

        if (isolate) {
          // remove any legacy broad-domain cookie
          if ($ct.broadDomain) {
            yield _this3.deleteData('cookie', name, $ct.broadDomain);
          } // write host-scoped cookie and stop


          yield _this3.addData('cookie', name, value, seconds, domain);
          return;
        } // sets cookie on the base domain. e.g. if domain is baz.foo.bar.com, set cookie on ".bar.com"
        // To update an existing "broad domain" cookie, we need to know what domain it was actually set on.
        // since a retrieved cookie never tells which domain it was set on, we need to set another test cookie
        // to find out which "broadest" domain the cookie was set on. Then delete the test cookie, and use that domain
        // for updating the actual cookie.
        // This if condition is redundant. Domain will never be not defined.
        // even if it is undefined we directly pass it in the else.


        if (domain) {
          var broadDomain = $ct.broadDomain;

          if (broadDomain == null) {
            // if we don't know the broadDomain yet, then find out
            var domainParts = domain.split('.');
            var testBroadDomain = '';

            for (var idx = domainParts.length - 1; idx >= 0; idx--) {
              if (idx === 0) {
                testBroadDomain = domainParts[idx] + testBroadDomain;
              } else {
                testBroadDomain = '.' + domainParts[idx] + testBroadDomain;
              } // only needed if the cookie already exists and needs to be updated. See note above.


              if (yield _this3.retrieveData('cookie', name)) {
                // no guarantee that browser will delete cookie, hence create short lived cookies
                var testCookieName = 'test_' + name + idx;
                yield _this3.addData('cookie', testCookieName, value, 10, testBroadDomain); // self-destruct after 10 seconds

                var testCookie = yield _this3.retrieveData('cookie', testCookieName);

                if (!testCookie) {
                  // if test cookie not set, then the actual cookie wouldn't have been set on this domain either.
                  continue;
                } else {
                  // else if cookie set, then delete the test and the original cookie
                  yield _this3.deleteData('cookie', testCookieName, testBroadDomain);
                }
              }

              yield _this3.addData('cookie', name, value, seconds, testBroadDomain);
              var tempCookie = yield _this3.retrieveData('cookie', name); // eslint-disable-next-line eqeqeq

              if (tempCookie == value) {
                broadDomain = testBroadDomain;
                $ct.broadDomain = broadDomain;
                break;
              }
            }
          } else {
            yield _this3.addData('cookie', name, value, seconds, broadDomain);
          }
        } else {
          yield _this3.addData('cookie', name, value, seconds, domain);
        }
      })();
    }

    static getMetaProp(property) {
      var _this4 = this;

      return _asyncToGenerator(function* () {
        var metaObj = yield _this4.readFromLSorCookie(META_COOKIE);

        if (metaObj != null) {
          return metaObj[property];
        }
      })();
    }

    static setMetaProp(property, value) {
      var _this5 = this;

      return _asyncToGenerator(function* () {
        if (_this5._isLocalStorageSupported()) {
          var wzrkMetaObj = yield _this5.readFromLSorCookie(META_COOKIE);

          if (wzrkMetaObj == null) {
            wzrkMetaObj = {};
          }

          if (value === undefined) {
            delete wzrkMetaObj[property];
          } else {
            wzrkMetaObj[property] = value;
          }

          yield _this5.saveToLSorCookie(META_COOKIE, wzrkMetaObj);
        }
      })();
    }

    static getAndClearMetaProp(property) {
      var _this6 = this;

      return _asyncToGenerator(function* () {
        var value = yield _this6.getMetaProp(property);
        yield _this6.setMetaProp(property, undefined);
        return value;
      })();
    }

    static setInstantDeleteFlagInK() {
      var _this7 = this;

      return _asyncToGenerator(function* () {
        var k = yield _this7.readFromLSorCookie(KCOOKIE_NAME);

        if (k == null) {
          k = {};
        }

        k.flag = true;
        yield _this7.saveToLSorCookie(KCOOKIE_NAME, k);
      })();
    }

    static backupEvent(data, reqNo, logger) {
      var _this8 = this;

      return _asyncToGenerator(function* () {
        var backupArr = yield _this8.readFromLSorCookie(LCOOKIE_NAME);

        if (typeof backupArr === 'undefined') {
          backupArr = {};
        }

        backupArr[reqNo] = {
          q: data
        };
        yield _this8.saveToLSorCookie(LCOOKIE_NAME, backupArr);
        logger.debug("stored in ".concat(LCOOKIE_NAME, " reqNo : ").concat(reqNo, " -> ").concat(data));
      })();
    } // Add new method for OUL tracking


    static markBackupAsOUL(reqNo) {
      // Store OUL request numbers in a separate meta property
      var oulRequests = this.getMetaProp('OUL_REQUESTS') || [];

      if (!oulRequests.includes(reqNo)) {
        oulRequests.push(reqNo);
        this.setMetaProp('OUL_REQUESTS', oulRequests);
      }
    }

    static isBackupOUL(reqNo) {
      var oulRequests = this.getMetaProp('OUL_REQUESTS') || [];
      return oulRequests.includes(reqNo);
    }

    static removeBackup(respNo, logger) {
      var _this9 = this;

      return _asyncToGenerator(function* () {
        var backupMap = yield _this9.readFromLSorCookie(LCOOKIE_NAME);

        if (typeof backupMap !== 'undefined' && backupMap !== null && typeof backupMap[respNo] !== 'undefined') {
          logger.debug("del event: ".concat(respNo, " data-> ").concat(backupMap[respNo].q));
          delete backupMap[respNo];
          yield _this9.saveToLSorCookie(LCOOKIE_NAME, backupMap);
        }
      })();
    }
    /**
     * A helper method to get data from either cookies or local storage.
     * This also checks the mode of the SDK and decides which methods to call
     * @param {('cookie' | 'localStorage')} type
     * @param {string} name
     * @returns {Promise<any>} cookieOrLocalStorageValue
     */


    static retrieveData(type, name) {
      var _this10 = this;

      return _asyncToGenerator(function* () {
        var cookieOrLocalStorageValue;

        switch (type) {
          case 'cookie':
            {
              if (mode.mode === 'WEB') {
                cookieOrLocalStorageValue = _this10.readCookie(name);
              } else {
                cookieOrLocalStorageValue = yield _this10.readCookieAsync(name);
              }

              break;
            }

          case 'localStorage':
            {
              if (mode.mode === 'WEB') {
                cookieOrLocalStorageValue = _this10.read(name);
              } else {
                cookieOrLocalStorageValue = yield _this10.readAsync(name);
              }

              break;
            }
        }

        return cookieOrLocalStorageValue;
      })();
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


    static addData(type, name, value, seconds, domain) {
      var _this11 = this;

      return _asyncToGenerator(function* () {
        switch (type) {
          case 'cookie':
            {
              if (mode.mode === 'WEB') {
                _this11.createCookie(name, value, seconds, domain);
              } else {
                yield _this11.createCookieAsync(name, value, seconds, domain);
              }

              break;
            }

          case 'localStorage':
            {
              if (mode.mode === 'WEB') {
                _this11.save(name, value);
              } else {
                yield _this11.saveAsync(name, value);
              }

              break;
            }
        }
      })();
    }
    /**
     * A helper method to get data from either cookies or local storage.
     * This also checks the mode of the SDK and decides which methods to call
     * @param {('cookie' | 'localStorage')} type
     * @param {string} name
     * @returns {Promise<any>} cookieOrLocalStorageValue
     */


    static deleteData(type, name, domain) {
      var _this12 = this;

      return _asyncToGenerator(function* () {
        switch (type) {
          case 'cookie':
            {
              if (mode.mode === 'WEB') {
                _this12.removeCookie(name);
              } else {
                yield _this12.removeCookieAsync(name, domain);
              }

              break;
            }

          case 'localStorage':
            {
              if (mode.mode === 'WEB') {
                _this12.remove(name);
              } else {
                yield _this12.removeAsync(name);
              }

              break;
            }
        }
      })();
    }

  }
  var $ct = {
    globalCache: {
      gcookie: null,
      REQ_N: 0,
      RESP_N: 0
    },
    LRU_CACHE: null,
    globalProfileMap: undefined,
    globalEventsMap: undefined,

    // Initialize blockRequest from storage
    get blockRequest() {
      var value = StorageManager.readFromLSorCookie(BLOCK_REQUEST_COOKIE);
      return value === true;
    },

    set blockRequest(value) {
      StorageManager.saveToLSorCookie(BLOCK_REQUEST_COOKIE, value);
    },

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
    dismissSpamControl: true,
    globalUnsubscribe: true,
    flutterVersion: null,
    variableStore: {},
    pushConfig: null,
    delayEvents: false,
    intervalArray: [] // domain: window.location.hostname, url -> getHostName()
    // gcookie: -> device

  };

  var _logger$6 = _classPrivateFieldLooseKey("logger");

  class DeviceManager {
    constructor(_ref) {
      var {
        logger,
        customId
      } = _ref;
      Object.defineProperty(this, _logger$6, {
        writable: true,
        value: void 0
      });
      this.gcookie = void 0;
      _classPrivateFieldLooseBase(this, _logger$6)[_logger$6] = logger;
      this.gcookie = this.getGuid() || customId;
    }

    getGuid() {
      var _this = this;

      return _asyncToGenerator(function* () {
        var guid = null;

        if (isValueValid(_this.gcookie)) {
          return _this.gcookie;
        }

        if (StorageManager._isLocalStorageSupported()) {
          var value = yield StorageManager.retrieveData('localStorage', GCOOKIE_NAME);

          if (isValueValid(value)) {
            try {
              guid = JSON.parse(decodeURIComponent(value));
            } catch (e) {
              _classPrivateFieldLooseBase(_this, _logger$6)[_logger$6].debug('Cannot parse Gcookie from localstorage - must be encoded ' + value); // assumming guids are of size 32. supporting both formats.
              // guid can have encodedURIComponent or be without it.
              // 1.56e4078ed15749928c042479ec2b4d47 - breaks on JSON.parse(decodeURIComponent())
              // 2.%2256e4078ed15749928c042479ec2b4d47%22


              if (value.length === 32) {
                guid = value;
                yield StorageManager.saveToLSorCookie(GCOOKIE_NAME, value);
              } else {
                _classPrivateFieldLooseBase(_this, _logger$6)[_logger$6].error('Illegal guid ' + value);
              }
            } // Persist to cookie storage if not present there.


            if (isValueValid(guid)) {
              yield StorageManager.createBroadCookie(GCOOKIE_NAME, guid, COOKIE_EXPIRY, getHostName());
            }
          }
        }

        if (!isValueValid(guid)) {
          guid = yield StorageManager.retrieveData('cookie', GCOOKIE_NAME);

          if (isValueValid(guid) && (guid.indexOf('%') === 0 || guid.indexOf('\'') === 0 || guid.indexOf('"') === 0)) {
            guid = null;
          }

          if (isValueValid(guid)) {
            yield StorageManager.saveToLSorCookie(GCOOKIE_NAME, guid);
          }
        }

        return guid;
      })();
    }

  }

  var getToday = () => {
    var today = new Date();
    return today.getFullYear() + '' + today.getMonth() + '' + today.getDay();
  };
  var getNow = () => {
    return Math.floor(new Date().getTime() / 1000);
  };
  var convertToWZRKDate = dateObj => {
    return '$D_' + Math.round(dateObj.getTime() / 1000);
  };
  var setDate = dt => {
    // expecting  yyyymmdd format either as a number or a string
    if (isDateValid(dt)) {
      return '$D_' + dt;
    }
  };
  var isDateValid = date => {
    var matches = /^(\d{4})(\d{2})(\d{2})$/.exec(date);
    if (matches == null) return false;
    var d = matches[3];
    var m = matches[2] - 1;
    var y = matches[1];
    var composedDate = new Date(y, m, d); // eslint-disable-next-line eqeqeq

    return composedDate.getDate() == d && composedDate.getMonth() == m && composedDate.getFullYear() == y;
  };

  var _logger$5 = _classPrivateFieldLooseKey("logger");

  var _sessionId = _classPrivateFieldLooseKey("sessionId");

  var _isPersonalisationActive$2 = _classPrivateFieldLooseKey("isPersonalisationActive");

  class SessionManager {
    // SCOOKIE_NAME
    constructor(_ref) {
      var {
        logger,
        isPersonalisationActive
      } = _ref;
      Object.defineProperty(this, _logger$5, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _sessionId, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isPersonalisationActive$2, {
        writable: true,
        value: void 0
      });
      this.cookieName = void 0;
      this.scookieObj = void 0;
      this.sessionId = StorageManager.getMetaProp('cs');
      _classPrivateFieldLooseBase(this, _logger$5)[_logger$5] = logger;
      _classPrivateFieldLooseBase(this, _isPersonalisationActive$2)[_isPersonalisationActive$2] = isPersonalisationActive;
    }

    get sessionId() {
      return _classPrivateFieldLooseBase(this, _sessionId)[_sessionId];
    }

    set sessionId(sessionId) {
      _classPrivateFieldLooseBase(this, _sessionId)[_sessionId] = sessionId;
    }

    getSessionCookieObject() {
      var _this = this;

      return _asyncToGenerator(function* () {
        var scookieStr = yield StorageManager.retrieveData('cookie', _this.cookieName);
        var obj = {};

        if (scookieStr != null) {
          // converting back single quotes to double for JSON parsing - http://www.iandevlin.com/blog/2012/04/html5/cookies-json-localstorage-and-opera
          scookieStr = scookieStr.replace(singleQuoteRegex, '"');
          obj = JSON.parse(scookieStr);

          if (!isObject(obj)) {
            obj = {};
          } else {
            if (typeof obj.t !== 'undefined') {
              // check time elapsed since last request
              var lastTime = obj.t;
              var now = getNow();

              if (now - lastTime > SCOOKIE_EXP_TIME_IN_SECS + 60) {
                // adding 60 seconds to compensate for in-journey requests
                // ideally the cookie should've died after SCOOKIE_EXP_TIME_IN_SECS but it's still around as we can read
                // hence we shouldn't use it.
                obj = {};
              }
            }
          }
        }

        _this.scookieObj = obj;
        return obj;
      })();
    }

    setSessionCookieObject(obj) {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var objStr = JSON.stringify(obj);
        yield StorageManager.createBroadCookie(_this2.cookieName, objStr, SCOOKIE_EXP_TIME_IN_SECS, getHostName());
      })();
    }

    manageSession(session) {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        // first time. check if current session id in localstorage is same
        // if not same then prev = current and current = this new session
        if (typeof _this3.sessionId === 'undefined' || _this3.sessionId !== session) {
          var currentSessionInLS = StorageManager.getMetaProp('cs'); // if sessionId in meta is undefined - set current to both

          if (typeof currentSessionInLS === 'undefined') {
            yield StorageManager.setMetaProp('ps', session);
            yield StorageManager.setMetaProp('cs', session);
            yield StorageManager.setMetaProp('sc', 1);
          } else if (currentSessionInLS !== session) {
            // not same as session in local storage. new session
            yield StorageManager.setMetaProp('ps', currentSessionInLS);
            yield StorageManager.setMetaProp('cs', session);
            var sessionCount = StorageManager.getMetaProp('sc');

            if (typeof sessionCount === 'undefined') {
              sessionCount = 0;
            }

            yield StorageManager.setMetaProp('sc', sessionCount + 1);
          }

          _this3.sessionId = session;
        }
      })();
    }

    getTimeElapsed() {
      var _this4 = this;

      return _asyncToGenerator(function* () {
        if (!_classPrivateFieldLooseBase(_this4, _isPersonalisationActive$2)[_isPersonalisationActive$2]()) {
          return;
        }

        if (_this4.scookieObj != null) {
          // TODO: check logic?
          _this4.scookieObj = yield _this4.getSessionCookieObject();
        }

        var sessionStart = _this4.scookieObj.s;

        if (sessionStart != null) {
          var ts = getNow();
          return Math.floor(ts - sessionStart);
        }
      })();
    }

    getPageCount() {
      var _this5 = this;

      return _asyncToGenerator(function* () {
        if (!_classPrivateFieldLooseBase(_this5, _isPersonalisationActive$2)[_isPersonalisationActive$2]()) {
          return;
        }

        if (_this5.scookieObj != null) {
          // TODO: check logic
          _this5.scookieObj = yield _this5.getSessionCookieObject();
        }

        return _this5.scookieObj.p;
      })();
    }

  }

  /* eslint-disable */
  var compressData = (dataObject, logger) => {
    logger && typeof logger.debug === 'function' && logger.debug('dobj:' + dataObject);
    return compressToBase64(dataObject);
  };
  var compress = uncompressed => {
    if (uncompressed == null) return '';
    var i,
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
  var getKeyStr = () => {
    var key = '';
    var i = 0;

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

  var _keyStr = getKeyStr();
  var compressToBase64 = input => {
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
    }

    init() {
      var _this = this;

      return _asyncToGenerator(function* () {
        var lruCache = yield StorageManager.readFromLSorCookie(LRU_CACHE);

        if (lruCache) {
          var tempLruCache = {};
          _classPrivateFieldLooseBase(_this, _keyOrder)[_keyOrder] = [];
          lruCache = lruCache.cache;

          for (var entry in lruCache) {
            if (lruCache.hasOwnProperty(entry)) {
              tempLruCache[lruCache[entry][0]] = lruCache[entry][1];

              _classPrivateFieldLooseBase(_this, _keyOrder)[_keyOrder].push(lruCache[entry][0]);
            }
          }

          _this.cache = tempLruCache;
        } else {
          _this.cache = {};
          _classPrivateFieldLooseBase(_this, _keyOrder)[_keyOrder] = [];
        }
      })();
    }

    get(key) {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var item = _this2.cache[key];

        if (item) {
          _this2.cache = _classPrivateFieldLooseBase(_this2, _deleteFromObject)[_deleteFromObject](key, _this2.cache);
          _this2.cache[key] = item;

          _classPrivateFieldLooseBase(_this2, _keyOrder)[_keyOrder].push(key);
        }

        yield _this2.saveCacheToLS(_this2.cache);
        return item;
      })();
    }

    set(key, value) {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        var item = _this3.cache[key];

        var allKeys = _classPrivateFieldLooseBase(_this3, _keyOrder)[_keyOrder];

        if (item != null) {
          _this3.cache = _classPrivateFieldLooseBase(_this3, _deleteFromObject)[_deleteFromObject](key, _this3.cache);
        } else if (allKeys.length === _this3.max) {
          _this3.cache = _classPrivateFieldLooseBase(_this3, _deleteFromObject)[_deleteFromObject](allKeys[0], _this3.cache);
        }

        _this3.cache[key] = value;

        if (_classPrivateFieldLooseBase(_this3, _keyOrder)[_keyOrder][_classPrivateFieldLooseBase(_this3, _keyOrder)[_keyOrder] - 1] !== key) {
          _classPrivateFieldLooseBase(_this3, _keyOrder)[_keyOrder].push(key);
        }

        yield _this3.saveCacheToLS(_this3.cache);
      })();
    }

    saveCacheToLS(cache) {
      var _this4 = this;

      return _asyncToGenerator(function* () {
        var objToArray = [];

        var allKeys = _classPrivateFieldLooseBase(_this4, _keyOrder)[_keyOrder];

        for (var index in allKeys) {
          if (allKeys.hasOwnProperty(index)) {
            var temp = [];
            temp.push(allKeys[index]);
            temp.push(cache[allKeys[index]]);
            objToArray.push(temp);
          }
        }

        yield StorageManager.saveToLSorCookie(LRU_CACHE, {
          cache: objToArray
        });
      })();
    }

    getKey(value) {
      if (value === null) {
        return null;
      }

      var allKeys = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder];

      for (var index in allKeys) {
        if (allKeys.hasOwnProperty(index)) {
          if (this.cache[allKeys[index]] === value) {
            return allKeys[index];
          }
        }
      }

      return null;
    }

    getSecondLastKey() {
      var keysArr = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder];

      if (keysArr != null && keysArr.length > 1) {
        return keysArr[keysArr.length - 2];
      }

      return -1;
    }

    getLastKey() {
      var keysLength = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder].length;

      if (keysLength) {
        return _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder][keysLength - 1];
      }
    }

  }

  var _deleteFromObject2 = function _deleteFromObject2(key, obj) {
    var allKeys = JSON.parse(JSON.stringify(_classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder]));
    var newCache = {};
    var indexToDelete;

    for (var index in allKeys) {
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

  var globalWindow = new GlobalWindow();

  var _logger$4 = _classPrivateFieldLooseKey("logger");

  var _request$3 = _classPrivateFieldLooseKey("request");

  var _device$3 = _classPrivateFieldLooseKey("device");

  var _session$3 = _classPrivateFieldLooseKey("session");

  class CleverTapAPI {
    constructor(props) {
      Object.defineProperty(this, _logger$4, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _request$3, {
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
      this.setPrivateProperties(props);
    }

    setPrivateProperties(_ref) {
      var {
        logger,
        request,
        device,
        session
      } = _ref;
      _classPrivateFieldLooseBase(this, _logger$4)[_logger$4] = logger;
      _classPrivateFieldLooseBase(this, _request$3)[_request$3] = request;
      _classPrivateFieldLooseBase(this, _device$3)[_device$3] = device;
      _classPrivateFieldLooseBase(this, _session$3)[_session$3] = session;
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


    s(global, session, resume, respNumber, optOutResponse) {
      var _this = this;

      return _asyncToGenerator(function* () {
        var oulReq = false;
        var newGuid = false; // for a scenario when OUL request is true from client side
        // but resume is returned as false from server end
        // we maintan a OulReqN var in the window object
        // and compare with respNumber to determine the response of an OUL request

        if (globalWindow.isOULInProgress) {
          if (resume || respNumber !== 'undefined' && Number(respNumber) === globalWindow.oulReqN) {
            globalWindow.isOULInProgress = false;
            oulReq = true;
          }
        } // call back function used to store global and session ids for the user


        if (typeof respNumber === 'undefined') {
          respNumber = 0;
        }

        yield StorageManager.removeBackup(Number(respNumber), _classPrivateFieldLooseBase(_this, _logger$4)[_logger$4]);

        if (Number(respNumber) > $ct.globalCache.REQ_N) {
          // request for some other user so ignore
          return;
        }

        if (!isValueValid(_classPrivateFieldLooseBase(_this, _device$3)[_device$3].gcookie)) {
          if (global) {
            newGuid = true;
          }
        }

        if (!isValueValid(_classPrivateFieldLooseBase(_this, _device$3)[_device$3].gcookie) || resume || typeof optOutResponse === 'boolean') {
          var sessionObj = yield _classPrivateFieldLooseBase(_this, _session$3)[_session$3].getSessionCookieObject();
          /*  If the received session is less than the session in the cookie,
              then don't update guid as it will be response for old request
          */

          if (globalWindow.isOULInProgress || sessionObj.s && session < sessionObj.s) {
            return;
          }

          _classPrivateFieldLooseBase(_this, _logger$4)[_logger$4].debug("Cookie was ".concat(_classPrivateFieldLooseBase(_this, _device$3)[_device$3].gcookie, " set to ").concat(global));

          _classPrivateFieldLooseBase(_this, _device$3)[_device$3].gcookie = global;

          if (!isValueValid(_classPrivateFieldLooseBase(_this, _device$3)[_device$3].gcookie)) {
            // clear useIP meta prop
            yield StorageManager.getAndClearMetaProp(USEIP_KEY);
          }

          if (global && StorageManager._isLocalStorageSupported()) {
            if ($ct.LRU_CACHE == null) {
              $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE);
              yield $ct.LRU_CACHE.init();
            }

            var kIdFromLS = yield StorageManager.readFromLSorCookie(KCOOKIE_NAME);
            var guidFromLRUCache;

            if (kIdFromLS != null && kIdFromLS.id) {
              guidFromLRUCache = $ct.LRU_CACHE.cache[kIdFromLS.id];

              if (resume) {
                if (!guidFromLRUCache) {
                  yield StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, true); // replace login identity in OUL request
                  // with the gcookie returned in exchange

                  $ct.LRU_CACHE.set(kIdFromLS.id, global);
                }
              }
            }

            yield StorageManager.saveToLSorCookie(GCOOKIE_NAME, global); // lastk provides the guid

            var lastK = $ct.LRU_CACHE.getSecondLastKey();

            if ((yield StorageManager.readFromLSorCookie(FIRE_PUSH_UNREGISTERED)) && lastK !== -1) {
              var lastGUID = $ct.LRU_CACHE.cache[lastK]; // fire the request directly via fireRequest to unregister the token
              // then other requests with the updated guid should follow

              _classPrivateFieldLooseBase(_this, _request$3)[_request$3].unregisterTokenForGuid(lastGUID);
            }
          }

          yield StorageManager.createBroadCookie(GCOOKIE_NAME, global, COOKIE_EXPIRY, getHostName());
          yield StorageManager.saveToLSorCookie(GCOOKIE_NAME, global);
        }

        if (StorageManager._isLocalStorageSupported()) {
          yield _classPrivateFieldLooseBase(_this, _session$3)[_session$3].manageSession(session);
        } // session cookie


        var obj = yield _classPrivateFieldLooseBase(_this, _session$3)[_session$3].getSessionCookieObject(); // for the race-condition where two responses come back with different session ids. don't write the older session id.

        if (typeof obj.s === 'undefined' || obj.s <= session) {
          obj.s = session;
          obj.t = getNow(); // time of last response from server

          _classPrivateFieldLooseBase(_this, _session$3)[_session$3].setSessionCookieObject(obj);
        } // set blockRequest to false only if the device has a valid gcookie


        if (isValueValid(_classPrivateFieldLooseBase(_this, _device$3)[_device$3].gcookie)) {
          $ct.blockRequest = false;
        } // only process the backup events after an OUL request or a new guid is recieved


        if ((oulReq || newGuid) && !_classPrivateFieldLooseBase(_this, _request$3)[_request$3].processingBackup) {
          _classPrivateFieldLooseBase(_this, _request$3)[_request$3].processBackupEvents();
        }

        $ct.globalCache.RESP_N = Number(respNumber);
      })();
    }

  }
  var clevertapApi = new CleverTapAPI({
    logger: '',
    request: '',
    device: '',
    session: ''
  });

  var DATA_NOT_SENT_TEXT = 'This property has been ignored.';
  var CLEVERTAP_ERROR_PREFIX = 'CleverTap error:'; // Formerly wzrk_error_txt
  var EVENT_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Event structure not valid. ").concat(DATA_NOT_SENT_TEXT);
  var GENDER_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Gender value should one of the following: m,f,o,u,male,female,unknown,others (case insensitive). ").concat(DATA_NOT_SENT_TEXT);
  var EMPLOYED_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Employed value should be either Y or N. ").concat(DATA_NOT_SENT_TEXT);
  var MARRIED_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Married value should be either Y or N. ").concat(DATA_NOT_SENT_TEXT);
  var EDUCATION_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Education value should be either School, College or Graduate. ").concat(DATA_NOT_SENT_TEXT);
  var AGE_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Age value should be a number. ").concat(DATA_NOT_SENT_TEXT);
  var DOB_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " DOB value should be a Date Object");
  var PHONE_FORMAT_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Phone number should be formatted as +[country code][number]");

  var getCampaignObject = () => {
    var finalcampObj = {};

    if (StorageManager._isLocalStorageSupported()) {
      var campObj = StorageManager.read(CAMP_COOKIE_NAME);

      if (campObj != null) {
        campObj = JSON.parse(decodeURIComponent(campObj).replace(singleQuoteRegex, '\"'));
        finalcampObj = campObj;
      } else {
        finalcampObj = {};
      }
    }

    return finalcampObj;
  }; // Save Camp here
  var getCampaignObjForLc = () => {
    // before preparing data to send to LC , check if the entry for the guid is already there in CAMP_COOKIE_G
    var guid = JSON.parse(decodeURIComponent(StorageManager.read(GCOOKIE_NAME)));
    var campObj = {};

    if (StorageManager._isLocalStorageSupported()) {
      var _campObj$wsc, _campObj, _campObj$wfc, _campObj2, _campObj$woc, _campObj3, _campObj$wndsc, _campObj4, _campObj$wndfc, _campObj5, _campObj$wndoc, _campObj6;

      var resultObj = {};
      campObj = getCampaignObject();
      var storageValue = StorageManager.read(CAMP_COOKIE_G);
      var decodedValue = storageValue ? decodeURIComponent(storageValue) : null;
      var parsedValue = decodedValue ? JSON.parse(decodedValue) : null;
      var resultObjWI = !!guid && storageValue !== undefined && storageValue !== null && parsedValue && parsedValue[guid] && parsedValue[guid].wi ? Object.values(parsedValue[guid].wi) : [];
      var webPopupDeliveryPreferenceDeatils = {
        wsc: (_campObj$wsc = (_campObj = campObj) === null || _campObj === void 0 ? void 0 : _campObj.wsc) !== null && _campObj$wsc !== void 0 ? _campObj$wsc : 0,
        wfc: (_campObj$wfc = (_campObj2 = campObj) === null || _campObj2 === void 0 ? void 0 : _campObj2.wfc) !== null && _campObj$wfc !== void 0 ? _campObj$wfc : {},
        woc: (_campObj$woc = (_campObj3 = campObj) === null || _campObj3 === void 0 ? void 0 : _campObj3.woc) !== null && _campObj$woc !== void 0 ? _campObj$woc : {}
      };
      var webNativeDisplayDeliveryPreferenceDeatils = {
        wndsc: (_campObj$wndsc = (_campObj4 = campObj) === null || _campObj4 === void 0 ? void 0 : _campObj4.wndsc) !== null && _campObj$wndsc !== void 0 ? _campObj$wndsc : 0,
        wndfc: (_campObj$wndfc = (_campObj5 = campObj) === null || _campObj5 === void 0 ? void 0 : _campObj5.wndfc) !== null && _campObj$wndfc !== void 0 ? _campObj$wndfc : {},
        wndoc: (_campObj$wndoc = (_campObj6 = campObj) === null || _campObj6 === void 0 ? void 0 : _campObj6.wndoc) !== null && _campObj$wndoc !== void 0 ? _campObj$wndoc : {}
      };
      var today = getToday(); // let todayCwp = 0

      var todayCwi = 0;

      if (campObj.wi && campObj.wi[today] && campObj.wi[today].tc !== 'undefined') {
        todayCwi = campObj.wi[today].tc;
      } // CAMP Is generated here


      resultObj = _objectSpread2(_objectSpread2({
        wimp: todayCwi,
        witlc: resultObjWI
      }, webPopupDeliveryPreferenceDeatils), webNativeDisplayDeliveryPreferenceDeatils);
      return resultObj;
    }
  };
  var isProfileValid = (profileObj, _ref) => {
    var {
      logger
    } = _ref;
    var valid = false;

    if (isObject(profileObj)) {
      for (var profileKey in profileObj) {
        if (profileObj.hasOwnProperty(profileKey)) {
          valid = true;
          var profileVal = profileObj[profileKey];

          if (profileVal == null) {
            delete profileObj[profileKey];
            continue;
          }

          if (profileKey === 'Gender' && !profileVal.match(/\b(?:[mM](?:ale)?|[fF](?:emale)?|[oO](?:thers)?|[uU](?:nknown)?)\b/)) {
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
  var processFBUserObj = user => {
    var profileData = {};
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

    var getHighestEducation = function getHighestEducation(eduArr) {
      if (eduArr != null) {
        var college = '';
        var highschool = '';

        for (var i = 0; i < eduArr.length; i++) {
          var _edu = eduArr[i];

          if (_edu.type != null) {
            var type = _edu.type;

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

    var edu = getHighestEducation(user.education);

    if (edu != null) {
      profileData.Education = edu;
    }

    var work = user.work != null ? user.work.length : 0;

    if (work > 0) {
      profileData.Employed = 'Y';
    } else {
      profileData.Employed = 'N';
    }

    if (user.email != null) {
      profileData.Email = user.email;
    }

    if (user.birthday != null) {
      var mmddyy = user.birthday.split('/'); // comes in as "08/15/1947"

      profileData.DOB = setDate(mmddyy[2] + mmddyy[0] + mmddyy[1]);
    }

    return profileData;
  };
  var processGPlusUserObj = (user, _ref2) => {
    var {
      logger
    } = _ref2;
    var profileData = {};

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
      for (var emailIdx = 0; emailIdx < user.emails.length; emailIdx++) {
        var emailObj = user.emails[emailIdx];

        if (emailObj.type === 'account') {
          profileData.Email = emailObj.value;
        }
      }
    }

    if (user.organizations != null) {
      profileData.Employed = 'N';

      for (var i = 0; i < user.organizations.length; i++) {
        var orgObj = user.organizations[i];

        if (orgObj.type === 'work') {
          profileData.Employed = 'Y';
        }
      }
    }

    if (user.birthday != null) {
      var yyyymmdd = user.birthday.split('-'); // comes in as "1976-07-27"

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
  var addToLocalProfileMap = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* (profileObj, override) {
      if (StorageManager._isLocalStorageSupported()) {
        if ($ct.globalProfileMap == null) {
          $ct.globalProfileMap = yield StorageManager.readFromLSorCookie(PR_COOKIE);

          if ($ct.globalProfileMap == null) {
            $ct.globalProfileMap = {};
          }
        } // Move props from custom bucket to outside.


        if (profileObj._custom != null) {
          var keys = profileObj._custom;

          for (var key in keys) {
            if (keys.hasOwnProperty(key)) {
              profileObj[key] = keys[key];
            }
          }

          delete profileObj._custom;
        }

        for (var prop in profileObj) {
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

        yield StorageManager.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap);
      }
    });

    return function addToLocalProfileMap(_x, _x2) {
      return _ref3.apply(this, arguments);
    };
  }();
  var arp = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(function* (jsonMap) {
      // For unregister calls dont set arp in LS
      if (jsonMap.skipResARP != null && jsonMap.skipResARP) {
        console.debug('Update ARP Request rejected', jsonMap);
        return null;
      }

      var isOULARP = jsonMap[IS_OUL] === true;

      if (StorageManager._isLocalStorageSupported()) {
        // Update arp only if it is null or an oul request
        try {
          var arpFromStorage = yield StorageManager.readFromLSorCookie(ARP_COOKIE);

          if (arpFromStorage == null || isOULARP) {
            arpFromStorage = {};

            for (var key in jsonMap) {
              if (jsonMap.hasOwnProperty(key)) {
                if (jsonMap[key] === -1) {
                  delete arpFromStorage[key];
                } else {
                  arpFromStorage[key] = jsonMap[key];
                }
              }
            }

            yield StorageManager.saveToLSorCookie(ARP_COOKIE, arpFromStorage);
          }
        } catch (e) {
          console.error('Unable to parse ARP JSON: ' + e);
        }
      }
    });

    return function arp(_x3) {
      return _ref4.apply(this, arguments);
    };
  }();

  var _fireRequest = _classPrivateFieldLooseKey("fireRequest");

  var _dropRequestDueToOptOut = _classPrivateFieldLooseKey("dropRequestDueToOptOut");

  var _addUseIPToRequest = _classPrivateFieldLooseKey("addUseIPToRequest");

  var _addARPToRequest = _classPrivateFieldLooseKey("addARPToRequest");

  class RequestDispatcher {
    constructor() {
      this.networkRetryCount = 0;
      this.minDelayFrequency = 0;
    }

    /**
     *
     * @param {string} url
     * @param {*} skipARP
     * @param {boolean} sendOULFlag
     */
    static fireRequest(url, skipARP, sendOULFlag, evtName, body) {
      var _this = this;

      return _asyncToGenerator(function* () {
        yield _classPrivateFieldLooseBase(_this, _fireRequest)[_fireRequest](url, 1, skipARP, sendOULFlag, evtName, body);
      })();
    }

    getDelayFrequency() {
      this.logger.debug('Network retry #' + this.networkRetryCount); // Retry with delay as 1s for first 10 retries

      if (this.networkRetryCount < 10) {
        this.logger.debug(this.account.id, 'Failure count is ' + this.networkRetryCount + '. Setting delay frequency to 1s');
        this.minDelayFrequency = PUSH_DELAY_MS; // Reset minimum delay to 1s

        return this.minDelayFrequency;
      }

      if (this.account.region == null) {
        // Retry with delay as 1s if region is null in case of eu1
        this.logger.debug(this.account.id, 'Setting delay frequency to 1s');
        return PUSH_DELAY_MS;
      } else {
        // Retry with delay as minimum delay frequency and add random number of seconds to scatter traffic
        var randomDelay = (Math.floor(Math.random() * 10) + 1) * 1000;
        this.minDelayFrequency += randomDelay;

        if (this.minDelayFrequency < MAX_DELAY_FREQUENCY) {
          this.logger.debug(this.account.id, 'Setting delay frequency to ' + this.minDelayFrequency);
          return this.minDelayFrequency;
        } else {
          this.minDelayFrequency = PUSH_DELAY_MS;
        }

        this.logger.debug(this.account.id, 'Setting delay frequency to ' + this.minDelayFrequency);
        return this.minDelayFrequency;
      }
    }

  }

  var _addARPToRequest2 = /*#__PURE__*/function () {
    var _addARPToRequest3 = _asyncToGenerator(function* (url, skipResARP) {
      if (skipResARP === true) {
        var _arp = {};
        _arp.skipResARP = true;
        return addToURL(url, 'arp', compressData(JSON.stringify(_arp), this.logger));
      }

      var arpValue = yield StorageManager.readFromLSorCookie(ARP_COOKIE);

      if (typeof arpValue !== 'undefined' && arpValue !== null) {
        return addToURL(url, 'arp', compressData(JSON.stringify(arpValue), this.logger));
      }

      return url;
    });

    function _addARPToRequest2(_x, _x2) {
      return _addARPToRequest3.apply(this, arguments);
    }

    return _addARPToRequest2;
  }();

  var _addUseIPToRequest2 = /*#__PURE__*/function () {
    var _addUseIPToRequest3 = _asyncToGenerator(function* (pageLoadUrl) {
      var useIP = yield StorageManager.getMetaProp(USEIP_KEY);

      if (typeof useIP !== 'boolean') {
        useIP = false;
      }

      return addToURL(pageLoadUrl, USEIP_KEY, useIP ? 'true' : 'false');
    });

    function _addUseIPToRequest2(_x3) {
      return _addUseIPToRequest3.apply(this, arguments);
    }

    return _addUseIPToRequest2;
  }();

  var _dropRequestDueToOptOut2 = function _dropRequestDueToOptOut2() {
    if ($ct.isOptInRequest || !isValueValid(this.device.gcookie) || !isString(this.device.gcookie)) {
      $ct.isOptInRequest = false;
      return false;
    }

    return this.device.gcookie.slice(-3) === OPTOUT_COOKIE_ENDSWITH;
  };

  var _fireRequest2 = /*#__PURE__*/function () {
    var _fireRequest3 = _asyncToGenerator(function* (url, tries, skipARP, sendOULFlag, evtName, body) {
      var _this2 = this;

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


      if (evtName && evtName === WZRK_FETCH) {
        // New retry mechanism
        if (!isValueValid(this.device.gcookie) && $ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1) {
          setTimeout(() => {
            this.logger.debug("retrying fire request for url: ".concat(url, ", tries: ").concat(this.networkRetryCount));

            _classPrivateFieldLooseBase(this, _fireRequest)[_fireRequest](url, undefined, skipARP, sendOULFlag);
          }, this.getDelayFrequency());
        }
      } else {
        if (!isValueValid(this.device.gcookie) && $ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1 && tries < MAX_TRIES) {
          // if ongoing First Request is in progress, initiate retry
          setTimeout( /*#__PURE__*/_asyncToGenerator(function* () {
            _this2.logger.debug("retrying fire request for url: ".concat(url, ", tries: ").concat(tries));

            yield _classPrivateFieldLooseBase(_this2, _fireRequest)[_fireRequest](url, tries + 1, skipARP, sendOULFlag);
          }), 50);
          return;
        } // set isOULInProgress to true
        // when sendOULFlag is set to true


        if (!sendOULFlag) {
          if (isValueValid(this.device.gcookie)) {
            // add gcookie to url
            url = addToURL(url, 'gc', this.device.gcookie);
          }

          url = yield _classPrivateFieldLooseBase(this, _addARPToRequest)[_addARPToRequest](url, skipARP);
        } else {
          globalWindow.isOULInProgress = true;
        }

        url = addToURL(url, 'tries', tries); // Add tries to URL

        if (typeof window !== 'undefined') {
          var _window$location$orig, _window, _window$location, _window2, _window2$location;

          url = addToURL(url, 'origin', (_window$location$orig = (_window = window) === null || _window === void 0 ? void 0 : (_window$location = _window.location) === null || _window$location === void 0 ? void 0 : _window$location.origin) !== null && _window$location$orig !== void 0 ? _window$location$orig : (_window2 = window) === null || _window2 === void 0 ? void 0 : (_window2$location = _window2.location) === null || _window2$location === void 0 ? void 0 : _window2$location.href); // Add origin to URL
        }

        url = yield _classPrivateFieldLooseBase(this, _addUseIPToRequest)[_addUseIPToRequest](url);
        url = addToURL(url, 'r', new Date().getTime()); // add epoch to beat caching of the URL

        if (url.indexOf('chrome-extension:') !== -1) {
          url = url.replace('chrome-extension:', 'https:');
        }

        if (mode.mode === 'WEB') {
          var _window$clevertap, _window$wizrocket;

          // TODO: Figure out a better way to handle plugin check
          if (((_window$clevertap = window.clevertap) === null || _window$clevertap === void 0 ? void 0 : _window$clevertap.hasOwnProperty('plugin')) || ((_window$wizrocket = window.wizrocket) === null || _window$wizrocket === void 0 ? void 0 : _window$wizrocket.hasOwnProperty('plugin'))) {
            // used to add plugin name in request parameter
            var plugin = window.clevertap.plugin || window.wizrocket.plugin;
            url = addToURL(url, 'ct_pl', plugin);
          } // TODO: Try using Function constructor instead of appending script.


          var ctCbScripts = document.getElementsByClassName('ct-jp-cb');

          while (ctCbScripts[0] && ctCbScripts[0].parentNode) {
            ctCbScripts[0].parentNode.removeChild(ctCbScripts[0]);
          }

          var s = document.createElement('script');
          s.setAttribute('type', 'text/javascript');
          s.setAttribute('src', url);
          s.setAttribute('class', 'ct-jp-cb');
          s.setAttribute('rel', 'nofollow');
          s.async = true;
          document.getElementsByTagName('head')[0].appendChild(s);
        } else {
          var fetchOptions = body ? {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'Content-Type': 'text/plain'
            },
            body
          } : {
            headers: {
              accept: 'application/json'
            }
          };
          fetch(url, fetchOptions).then(res => res.json()).then( /*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(function* (response) {
              if (response.arp) {
                yield arp(response.arp);
              }

              if (response.meta) {
                yield clevertapApi.s(response.meta.g, // cookie
                response.meta.sid, // session id
                response.meta.rf, // resume
                response.meta.rn // response number for backup manager
                );
              }
            });

            return function (_x10) {
              return _ref2.apply(this, arguments);
            };
          }());
        }

        this.logger.debug('req snt -> url: ' + url);
      }
    });

    function _fireRequest2(_x4, _x5, _x6, _x7, _x8, _x9) {
      return _fireRequest3.apply(this, arguments);
    }

    return _fireRequest2;
  }();

  RequestDispatcher.logger = void 0;
  RequestDispatcher.device = void 0;
  RequestDispatcher.mode = void 0;
  RequestDispatcher.api = void 0;
  RequestDispatcher.account = void 0;
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

  var seqNo = 0;
  var requestTime = 0;

  var _logger$3 = _classPrivateFieldLooseKey("logger");

  var _account$2 = _classPrivateFieldLooseKey("account");

  var _device$2 = _classPrivateFieldLooseKey("device");

  var _session$2 = _classPrivateFieldLooseKey("session");

  var _isPersonalisationActive$1 = _classPrivateFieldLooseKey("isPersonalisationActive");

  var _clearCookie = _classPrivateFieldLooseKey("clearCookie");

  var _getNextAvailableReqN = _classPrivateFieldLooseKey("getNextAvailableReqN");

  var _addToLocalEventMap = _classPrivateFieldLooseKey("addToLocalEventMap");

  class RequestManager {
    constructor(_ref) {
      var {
        logger,
        account,
        device,
        session,
        isPersonalisationActive
      } = _ref;
      Object.defineProperty(this, _addToLocalEventMap, {
        value: _addToLocalEventMap2
      });
      Object.defineProperty(this, _getNextAvailableReqN, {
        value: _getNextAvailableReqN2
      });
      Object.defineProperty(this, _logger$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _account$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _device$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _session$2, {
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
      _classPrivateFieldLooseBase(this, _account$2)[_account$2] = account;
      _classPrivateFieldLooseBase(this, _device$2)[_device$2] = device;
      _classPrivateFieldLooseBase(this, _session$2)[_session$2] = session;
      _classPrivateFieldLooseBase(this, _isPersonalisationActive$1)[_isPersonalisationActive$1] = isPersonalisationActive;
      RequestDispatcher.logger = logger;
      RequestDispatcher.device = device;
      RequestDispatcher.account = account;
    }
    /**
    * Unified backup processing method
    * @param {boolean} oulOnly - If true, process only OUL requests. If false, process all non-fired requests.
    */


    processBackupEvents() {
      var oulOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var backupMap = StorageManager.readFromLSorCookie(LCOOKIE_NAME);

      if (typeof backupMap === 'undefined' || backupMap === null) {
        return;
      }

      this.processingBackup = true;

      for (var idx in backupMap) {
        if (backupMap.hasOwnProperty(idx)) {
          var backupEvent = backupMap[idx];

          if (typeof backupEvent.fired !== 'undefined') {
            continue;
          }

          var isOULRequest = StorageManager.isBackupOUL(parseInt(idx));
          var shouldProcess = oulOnly ? isOULRequest : true;

          if (shouldProcess) {
            _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].debug("Processing ".concat(isOULRequest ? 'OUL' : 'regular', " backup event : ").concat(backupEvent.q));

            if (typeof backupEvent.q !== 'undefined') {
              var session = JSON.parse(StorageManager.readCookie(SCOOKIE_PREFIX + '_' + _classPrivateFieldLooseBase(this, _account$2)[_account$2].id));

              if (session === null || session === void 0 ? void 0 : session.s) {
                backupEvent.q = backupEvent.q + '&s=' + session.s;
              }

              RequestDispatcher.fireRequest(backupEvent.q);
            }

            backupEvent.fired = true;
          }
        }
      }

      StorageManager.saveToLSorCookie(LCOOKIE_NAME, backupMap);
      this.processingBackup = false;
    }

    addSystemDataToObject(dataObject, ignoreTrim) {
      var _this = this;

      return _asyncToGenerator(function* () {
        // ignore trim for chrome notifications; undefined everywhere else
        if (typeof ignoreTrim === 'undefined') {
          dataObject = removeUnsupportedChars(dataObject, _classPrivateFieldLooseBase(_this, _logger$3)[_logger$3]);
        }

        if (!isObjectEmpty(_classPrivateFieldLooseBase(_this, _logger$3)[_logger$3].wzrkError)) {
          dataObject.wzrk_error = _classPrivateFieldLooseBase(_this, _logger$3)[_logger$3].wzrkError;
          _classPrivateFieldLooseBase(_this, _logger$3)[_logger$3].wzrkError = {};
        }

        dataObject.id = _classPrivateFieldLooseBase(_this, _account$2)[_account$2].id;

        if (isValueValid(_classPrivateFieldLooseBase(_this, _device$2)[_device$2].gcookie)) {
          dataObject.g = _classPrivateFieldLooseBase(_this, _device$2)[_device$2].gcookie;
        }

        var obj = yield _classPrivateFieldLooseBase(_this, _session$2)[_session$2].getSessionCookieObject();
        dataObject.s = obj.s; // session cookie

        dataObject.pg = typeof obj.p === 'undefined' ? 1 : obj.p; // Page count

        if (typeof sessionStorage === 'object') {
          if (sessionStorage.hasOwnProperty('WZRK_D')) {
            dataObject.debug = true;
          }
        }

        return dataObject;
      })();
    }

    addSystemDataToProfileObject(dataObject, ignoreTrim) {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var _sessionStorage;

        if (!isObjectEmpty(_classPrivateFieldLooseBase(_this2, _logger$3)[_logger$3].wzrkError)) {
          dataObject.wzrk_error = _classPrivateFieldLooseBase(_this2, _logger$3)[_logger$3].wzrkError;
          _classPrivateFieldLooseBase(_this2, _logger$3)[_logger$3].wzrkError = {};
        }

        dataObject.id = _classPrivateFieldLooseBase(_this2, _account$2)[_account$2].id;

        if (isValueValid(_classPrivateFieldLooseBase(_this2, _device$2)[_device$2].gcookie)) {
          dataObject.g = _classPrivateFieldLooseBase(_this2, _device$2)[_device$2].gcookie;
        }

        var obj = yield _classPrivateFieldLooseBase(_this2, _session$2)[_session$2].getSessionCookieObject();
        dataObject.s = obj.s; // session cookie

        dataObject.pg = typeof obj.p === 'undefined' ? 1 : obj.p; // Page count

        if ((_sessionStorage = sessionStorage) === null || _sessionStorage === void 0 ? void 0 : _sessionStorage.hasOwnProperty('WZRK_D')) {
          dataObject.debug = true;
        }

        return dataObject;
      })();
    }

    addFlags(data) {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        // check if cookie should be cleared.
        _classPrivateFieldLooseBase(_this3, _clearCookie)[_clearCookie] = yield StorageManager.getAndClearMetaProp(CLEAR);

        if (_classPrivateFieldLooseBase(_this3, _clearCookie)[_clearCookie] !== undefined && _classPrivateFieldLooseBase(_this3, _clearCookie)[_clearCookie]) {
          data.rc = true;

          _classPrivateFieldLooseBase(_this3, _logger$3)[_logger$3].debug('reset cookie sent in request and cleared from meta for future requests.');
        }

        if (_classPrivateFieldLooseBase(_this3, _isPersonalisationActive$1)[_isPersonalisationActive$1]()) {
          var lastSyncTime = yield StorageManager.getMetaProp('lsTime');
          var expirySeconds = yield StorageManager.getMetaProp('exTs'); // dsync not found in local storage - get data from server

          if (typeof lastSyncTime === 'undefined' || typeof expirySeconds === 'undefined') {
            data.dsync = true;
            return;
          }

          var now = getNow(); // last sync time has expired - get fresh data from server

          if (lastSyncTime + expirySeconds < now) {
            data.dsync = true;
          }
        }
      })();
    }

    // saves url to backup cache and fires the request

    /**
     *
     * @param {string} url
     * @param {boolean} override whether the request can go through or not
     * @param {Boolean} sendOULFlag - true in case of a On User Login request
     */
    saveAndFireRequest(url, override, sendOULFlag, evtName, body) {
      var _this4 = this;

      return _asyncToGenerator(function* () {
        var now = getNow(); // Get the next available request number that doesn't conflict with existing backups

        var nextReqN = yield _classPrivateFieldLooseBase(_this4, _getNextAvailableReqN)[_getNextAvailableReqN]();
        $ct.globalCache.REQ_N = nextReqN;
        url = addToURL(url, 'rn', nextReqN);
        var data = url + '&i=' + now + '&sn=' + seqNo; // TODO: Enable this
        // and an OUL request is not in progress
        // then process the request as it is
        // else block the request
        // note - $ct.blockRequest should ideally be used for override

        if ((!override || _classPrivateFieldLooseBase(_this4, _clearCookie)[_clearCookie] !== undefined && _classPrivateFieldLooseBase(_this4, _clearCookie)[_clearCookie]) && !globalWindow.isOULInProgress) {
          if (now === requestTime) {
            seqNo++;
          } else {
            requestTime = now;
            seqNo = 0;
          }

          globalWindow.oulReqN = $ct.globalCache.REQ_N;
          yield RequestDispatcher.fireRequest(data, false, sendOULFlag, evtName, body);
        } else {
          _classPrivateFieldLooseBase(_this4, _logger$3)[_logger$3].debug("Not fired due to override - ".concat($ct.blockRequest, " or clearCookie - ").concat(_classPrivateFieldLooseBase(_this4, _clearCookie)[_clearCookie], " or OUL request in progress - ").concat(globalWindow.isOULInProgress));
        }
      })();
    }

    unregisterTokenForGuid(givenGUID) {
      var _this5 = this;

      return _asyncToGenerator(function* () {
        var payload = yield StorageManager.readFromLSorCookie(PUSH_SUBSCRIPTION_DATA); // Send unregister event only when token is available

        if (payload) {
          var data = {};
          data.type = 'data';

          if (isValueValid(givenGUID)) {
            data.g = givenGUID;
          }

          data.action = 'unregister';
          data.id = _classPrivateFieldLooseBase(_this5, _account$2)[_account$2].id;
          var obj = yield _classPrivateFieldLooseBase(_this5, _session$2)[_session$2].getSessionCookieObject();
          data.s = obj.s; // session cookie

          var compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(_this5, _logger$3)[_logger$3]);

          var pageLoadUrl = _classPrivateFieldLooseBase(_this5, _account$2)[_account$2].dataPostURL;

          pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data');
          pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData);
          yield RequestDispatcher.fireRequest(pageLoadUrl, true);
          yield StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false);
        } // REGISTER TOKEN


        yield _this5.registerToken(payload);
      })();
    }

    registerToken(payload) {
      var _this6 = this;

      return _asyncToGenerator(function* () {
        if (!payload) return; // add gcookie etc to the payload

        payload = yield _this6.addSystemDataToObject(payload, true);
        payload = JSON.stringify(payload);

        var pageLoadUrl = _classPrivateFieldLooseBase(_this6, _account$2)[_account$2].dataPostURL;

        pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data');
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(payload, _classPrivateFieldLooseBase(_this6, _logger$3)[_logger$3]));
        yield RequestDispatcher.fireRequest(pageLoadUrl); // set in localstorage

        StorageManager.addData('localStorage', WEBPUSH_LS_KEY, 'ok');
      })();
    }

    processEvent(data) {
      var _this7 = this;

      return _asyncToGenerator(function* () {
        var coreEvent = _objectSpread2({}, data);

        if (data.hasOwnProperty('evtData')) {
          coreEvent.evtData = {
            data: JSON.parse(JSON.stringify(data.evtData))
          };
          delete data.evtData;
        }

        yield _classPrivateFieldLooseBase(_this7, _addToLocalEventMap)[_addToLocalEventMap](coreEvent.evtName);
        coreEvent = yield _this7.addSystemDataToObject(coreEvent, undefined);

        _this7.addFlags(coreEvent);

        if (mode.mode === 'WEB') {
          data[CAMP_COOKIE_NAME] = getCampaignObjForLc();
        }

        var eventWithoutData = _objectSpread2({}, coreEvent);

        delete eventWithoutData.evtData;
        var compressedSystemData = compressData(JSON.stringify(eventWithoutData), _classPrivateFieldLooseBase(_this7, _logger$3)[_logger$3]);
        var compressedCoreEvent = compressData(JSON.stringify(coreEvent), _classPrivateFieldLooseBase(_this7, _logger$3)[_logger$3]);

        var pageLoadUrl = _classPrivateFieldLooseBase(_this7, _account$2)[_account$2].dataPostURL;

        pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH);
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedSystemData);
        yield _this7.saveAndFireRequest(pageLoadUrl, $ct.blockRequest, false, data.evtName, compressedCoreEvent);
      })();
    }

    post(url, body) {
      return fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      }).then(response => {
        if (response.ok) {
          return response.json();
        }

        throw response;
      }).then(data => {
        _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].debug('Sync data successful', data);

        return data;
      }).catch(e => {
        _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].debug('Error in syncing variables', e);

        throw e;
      });
    }

  }

  var _getNextAvailableReqN2 = /*#__PURE__*/function () {
    var _getNextAvailableReqN3 = _asyncToGenerator(function* () {
      // Read existing backup data to check for conflicts
      var backupMap = yield StorageManager.readFromLSorCookie(LCOOKIE_NAME); // Start from the current REQ_N + 1

      var candidateReqN = $ct.globalCache.REQ_N + 1; // If no backup data exists, use the candidate

      if (!backupMap || typeof backupMap !== 'object') {
        return candidateReqN;
      } // Keep incrementing until we find a request number that doesn't exist in backup


      while (backupMap.hasOwnProperty(candidateReqN.toString())) {
        candidateReqN++;

        _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].debug("Request number ".concat(candidateReqN - 1, " already exists in backup, trying ").concat(candidateReqN));
      }

      _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].debug("Using request number: ".concat(candidateReqN));

      return candidateReqN;
    });

    function _getNextAvailableReqN2() {
      return _getNextAvailableReqN3.apply(this, arguments);
    }

    return _getNextAvailableReqN2;
  }();

  var _addToLocalEventMap2 = /*#__PURE__*/function () {
    var _addToLocalEventMap3 = _asyncToGenerator(function* (evtName) {
      if (StorageManager._isLocalStorageSupported()) {
        if (typeof $ct.globalEventsMap === 'undefined') {
          $ct.globalEventsMap = yield StorageManager.readFromLSorCookie(EV_COOKIE);

          if (typeof $ct.globalEventsMap === 'undefined') {
            $ct.globalEventsMap = {};
          }
        }

        var nowTs = getNow();
        var evtDetail = $ct.globalEventsMap[evtName];

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
        yield StorageManager.saveToLSorCookie(EV_COOKIE, $ct.globalEventsMap);
      }
    });

    function _addToLocalEventMap2(_x) {
      return _addToLocalEventMap3.apply(this, arguments);
    }

    return _addToLocalEventMap2;
  }();

  var _globalChargedId;

  var isEventStructureFlat = eventObj => {
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
  var isChargedEventStructureValid = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (chargedObj, logger) {
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
          var chargedId = chargedObj[CHARGED_ID] + ''; // casting chargedId to string

          if (typeof _globalChargedId === 'undefined') {
            _globalChargedId = yield StorageManager.readFromLSorCookie(CHARGEDID_COOKIE_NAME);
          }

          if (typeof _globalChargedId !== 'undefined' && _globalChargedId.trim() === chargedId.trim()) {
            // drop event- duplicate charged id
            logger.error('Duplicate charged Id - Dropped' + chargedObj);
            return false;
          }

          _globalChargedId = chargedId;
          yield StorageManager.saveToLSorCookie(CHARGEDID_COOKIE_NAME, chargedId);
        }

        return true;
      } // if object (chargedObject)


      return false;
    });

    return function isChargedEventStructureValid(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  var _logger$2 = _classPrivateFieldLooseKey("logger");

  var _oldValues$1 = _classPrivateFieldLooseKey("oldValues");

  var _request$2 = _classPrivateFieldLooseKey("request");

  var _isPersonalisationActive = _classPrivateFieldLooseKey("isPersonalisationActive");

  var _processEventArray = _classPrivateFieldLooseKey("processEventArray");

  class EventHandler extends Array {
    constructor(_ref, values) {
      var {
        logger,
        request,
        isPersonalisationActive
      } = _ref;
      super();
      Object.defineProperty(this, _processEventArray, {
        value: _processEventArray2
      });
      Object.defineProperty(this, _logger$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _oldValues$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _request$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isPersonalisationActive, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _logger$2)[_logger$2] = logger;
      _classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1] = values;
      _classPrivateFieldLooseBase(this, _request$2)[_request$2] = request;
      _classPrivateFieldLooseBase(this, _isPersonalisationActive)[_isPersonalisationActive] = isPersonalisationActive;
    }

    push() {
      if (StorageManager.readFromLSorCookie(ACCOUNT_ID)) {
        for (var _len = arguments.length, eventsArr = new Array(_len), _key = 0; _key < _len; _key++) {
          eventsArr[_key] = arguments[_key];
        }

        _classPrivateFieldLooseBase(this, _processEventArray)[_processEventArray](eventsArr);

        return 0;
      } else {
        _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].error('Account ID is not set');
      }
    }

    _processOldValues() {
      if (_classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1]) {
        _classPrivateFieldLooseBase(this, _processEventArray)[_processEventArray](_classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1]);
      }

      _classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1] = null;
    }

    getDetails(evtName) {
      if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive)[_isPersonalisationActive]()) {
        return;
      }

      if (typeof $ct.globalEventsMap === 'undefined') {
        $ct.globalEventsMap = StorageManager.readFromLSorCookie(EV_COOKIE);
      }

      if (typeof $ct.globalEventsMap === 'undefined') {
        return;
      }

      var evtObj = $ct.globalEventsMap[evtName];
      var respObj = {};

      if (typeof evtObj !== 'undefined') {
        respObj.firstTime = new Date(evtObj[1] * 1000);
        respObj.lastTime = new Date(evtObj[2] * 1000);
        respObj.count = evtObj[0];
        return respObj;
      }
    }

  }

  var _processEventArray2 = /*#__PURE__*/function () {
    var _processEventArray3 = _asyncToGenerator(function* (eventsArr) {
      if (Array.isArray(eventsArr)) {
        while (eventsArr.length > 0) {
          var eventName = eventsArr.shift();

          if (!isString(eventName)) {
            _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].error(EVENT_ERROR);

            continue;
          }

          if (eventName.length > 1024) {
            eventName = eventName.substring(0, 1024);

            _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].reportError(510, eventName + '... length exceeded 1024 chars. Trimmed.');
          }

          if (SYSTEM_EVENTS.includes(eventName)) {
            _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].reportError(513, eventName + ' is a restricted system event. It cannot be used as an event name.');

            continue;
          }

          var data = {};
          data.type = 'event';
          data.evtName = sanitize(eventName, unsupportedKeyCharRegex);

          if (eventsArr.length !== 0) {
            var eventObj = eventsArr.shift();

            if (!isObject(eventObj)) {
              // put it back if it is not an object
              eventsArr.unshift(eventObj);
            } else {
              // check Charged Event vs. other events.
              if (eventName === 'Charged') {
                var isValid = yield isChargedEventStructureValid(eventObj, _classPrivateFieldLooseBase(this, _logger$2)[_logger$2]);

                if (!isValid) {
                  _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].reportError(511, 'Charged event structure invalid. Not sent.');

                  continue;
                }
              } else {
                // For WEB mode we enforce flat structure; Shopify allows nested objects
                if (mode.mode !== 'SHOPIFY' && !isEventStructureFlat(eventObj)) {
                  _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].reportError(512, eventName + ' event structure invalid. Not sent.');

                  continue;
                }
              }

              data.evtData = eventObj;
            }
          }

          yield _classPrivateFieldLooseBase(this, _request$2)[_request$2].processEvent(data);
        }
      }
    });

    function _processEventArray2(_x) {
      return _processEventArray3.apply(this, arguments);
    }

    return _processEventArray2;
  }();

  var _request$1 = _classPrivateFieldLooseKey("request");

  var _logger$1 = _classPrivateFieldLooseKey("logger");

  var _account$1 = _classPrivateFieldLooseKey("account");

  var _session$1 = _classPrivateFieldLooseKey("session");

  var _oldValues = _classPrivateFieldLooseKey("oldValues");

  var _device$1 = _classPrivateFieldLooseKey("device");

  var _processOUL = _classPrivateFieldLooseKey("processOUL");

  var _handleCookieFromCache = _classPrivateFieldLooseKey("handleCookieFromCache");

  var _deleteUser = _classPrivateFieldLooseKey("deleteUser");

  var _processLoginArray = _classPrivateFieldLooseKey("processLoginArray");

  class UserLoginHandler extends Array {
    constructor(_ref, values) {
      var {
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
      Object.defineProperty(this, _request$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _account$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _session$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _oldValues, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _device$1, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _request$1)[_request$1] = request;
      _classPrivateFieldLooseBase(this, _account$1)[_account$1] = account;
      _classPrivateFieldLooseBase(this, _session$1)[_session$1] = session;
      _classPrivateFieldLooseBase(this, _logger$1)[_logger$1] = logger;
      _classPrivateFieldLooseBase(this, _oldValues)[_oldValues] = values;
      _classPrivateFieldLooseBase(this, _device$1)[_device$1] = device;
    } // On User Login


    clear() {
      var _this = this;

      return _asyncToGenerator(function* () {
        _classPrivateFieldLooseBase(_this, _logger$1)[_logger$1].debug('clear called. Reset flag has been set.');

        yield _classPrivateFieldLooseBase(_this, _deleteUser)[_deleteUser]();
        yield StorageManager.setMetaProp(CLEAR, true);
      })();
    }

    push() {
      var _arguments = arguments,
          _this2 = this;

      return _asyncToGenerator(function* () {
        for (var _len = _arguments.length, profilesArr = new Array(_len), _key = 0; _key < _len; _key++) {
          profilesArr[_key] = _arguments[_key];
        }

        yield _classPrivateFieldLooseBase(_this2, _processLoginArray)[_processLoginArray](profilesArr);
        return 0;
      })();
    }

    _processOldValues() {
      if (_classPrivateFieldLooseBase(this, _oldValues)[_oldValues]) {
        _classPrivateFieldLooseBase(this, _processLoginArray)[_processLoginArray](_classPrivateFieldLooseBase(this, _oldValues)[_oldValues]);
      }

      _classPrivateFieldLooseBase(this, _oldValues)[_oldValues] = null;
    }

  }

  var _processOUL2 = /*#__PURE__*/function () {
    var _processOUL3 = _asyncToGenerator(function* (profileArr) {
      var _this3 = this;

      var sendOULFlag = true;
      yield StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag);

      var addToK = /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator(function* (ids) {
          var k = yield StorageManager.readFromLSorCookie(KCOOKIE_NAME);
          var g = yield StorageManager.readFromLSorCookie(GCOOKIE_NAME);
          var kId;

          if (k == null) {
            k = {};
            kId = ids;
          } else {
            /* check if already exists */
            kId = k.id;
            var anonymousUser = false;
            var foundInCache = false;

            if (kId == null) {
              kId = ids[0];
              anonymousUser = true;
            }

            if ($ct.LRU_CACHE == null && StorageManager._isLocalStorageSupported()) {
              $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE);
              yield $ct.LRU_CACHE.init();
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
              for (var idx in ids) {
                if (ids.hasOwnProperty(idx)) {
                  var id = ids[idx];

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
                yield _classPrivateFieldLooseBase(_this3, _handleCookieFromCache)[_handleCookieFromCache]();
              } else {
                sendOULFlag = false;
                yield StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag);
              }

              var gFromCache = yield $ct.LRU_CACHE.get(kId);
              yield $ct.LRU_CACHE.set(kId, gFromCache);
              yield StorageManager.saveToLSorCookie(GCOOKIE_NAME, gFromCache);
              _classPrivateFieldLooseBase(_this3, _device$1)[_device$1].gcookie = gFromCache;
              var lastK = $ct.LRU_CACHE.getSecondLastKey();

              if ((yield StorageManager.readFromLSorCookie(FIRE_PUSH_UNREGISTERED)) && lastK !== -1) {
                // CACHED OLD USER FOUND. TRANSFER PUSH TOKEN TO THIS USER
                var lastGUID = $ct.LRU_CACHE.cache[lastK];
                yield _classPrivateFieldLooseBase(_this3, _request$1)[_request$1].unregisterTokenForGuid(lastGUID);
              }
            } else {
              if (!anonymousUser) {
                yield _this3.clear();
              } else {
                if (g != null) {
                  _classPrivateFieldLooseBase(_this3, _device$1)[_device$1].gcookie = g;
                  yield StorageManager.saveToLSorCookie(GCOOKIE_NAME, g);
                  sendOULFlag = false;
                }
              }

              yield StorageManager.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false);
              kId = ids[0];
            }
          }

          k.id = kId;
          yield StorageManager.saveToLSorCookie(KCOOKIE_NAME, k);
        });

        return function addToK(_x2) {
          return _ref2.apply(this, arguments);
        };
      }();

      if (Array.isArray(profileArr) && profileArr.length > 0) {
        for (var index in profileArr) {
          if (profileArr.hasOwnProperty(index)) {
            var outerObj = profileArr[index];
            var data = {};
            var profileObj = void 0;

            if (outerObj.Site != null) {
              // organic data from the site
              profileObj = outerObj.Site;

              if (isObjectEmpty(profileObj) || !isProfileValid(profileObj, {
                logger: _classPrivateFieldLooseBase(this, _logger$1)[_logger$1]
              })) {
                return;
              }
            } else if (outerObj.Facebook != null) {
              // fb connect data
              var FbProfileObj = outerObj.Facebook; // make sure that the object contains any data at all

              if (!isObjectEmpty(FbProfileObj) && !FbProfileObj.error) {
                profileObj = processFBUserObj(FbProfileObj);
              }
            } else if (outerObj['Google Plus'] != null) {
              var GPlusProfileObj = outerObj['Google Plus'];

              if (isObjectEmpty(GPlusProfileObj) && !GPlusProfileObj.error) {
                profileObj = processGPlusUserObj(GPlusProfileObj, {
                  logger: _classPrivateFieldLooseBase(this, _logger$1)[_logger$1]
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
              var ids = [];

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
                  yield addToK(ids);
                }
              }

              yield addToLocalProfileMap(profileObj, true);
              data = yield _classPrivateFieldLooseBase(this, _request$1)[_request$1].addSystemDataToObject(data, undefined);
              yield _classPrivateFieldLooseBase(this, _request$1)[_request$1].addFlags(data); // Adding 'isOUL' flag in true for OUL cases which.
              // This flag tells LC to create a new arp object.
              // Also we will receive the same flag in response arp which tells to delete existing arp object.

              if (sendOULFlag) {
                data[IS_OUL] = true;
              }

              var compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$1)[_logger$1]);

              var pageLoadUrl = _classPrivateFieldLooseBase(this, _account$1)[_account$1].dataPostURL;

              pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH);
              pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData); // Whenever sendOULFlag is true then dont send arp and gcookie (guid in memory in the request)
              // Also when this flag is set we will get another flag from LC in arp which tells us to delete arp
              // stored in the cache and replace it with the response arp.

              yield _classPrivateFieldLooseBase(this, _request$1)[_request$1].saveAndFireRequest(pageLoadUrl, $ct.blockRequest, sendOULFlag);
            }
          }
        }
      }
    });

    function _processOUL2(_x) {
      return _processOUL3.apply(this, arguments);
    }

    return _processOUL2;
  }();

  var _handleCookieFromCache2 = /*#__PURE__*/function () {
    var _handleCookieFromCache3 = _asyncToGenerator(function* () {
      $ct.blockRequest = false;
      console.debug('Block request is false');

      if (StorageManager._isLocalStorageSupported()) {
        [PR_COOKIE, EV_COOKIE, META_COOKIE, ARP_COOKIE, CAMP_COOKIE_NAME, CHARGEDID_COOKIE_NAME].forEach( /*#__PURE__*/function () {
          var _ref3 = _asyncToGenerator(function* (cookie) {
            yield StorageManager.deleteData('localStorage', cookie);
          });

          return function (_x3) {
            return _ref3.apply(this, arguments);
          };
        }());
      }

      yield StorageManager.deleteData('cookie', CAMP_COOKIE_NAME, getHostName());
      yield StorageManager.deleteData('cookie', _classPrivateFieldLooseBase(this, _session$1)[_session$1].cookieName, $ct.broadDomain);
      yield StorageManager.deleteData('cookie', ARP_COOKIE, $ct.broadDomain);
      yield _classPrivateFieldLooseBase(this, _session$1)[_session$1].setSessionCookieObject('');
    });

    function _handleCookieFromCache2() {
      return _handleCookieFromCache3.apply(this, arguments);
    }

    return _handleCookieFromCache2;
  }();

  var _deleteUser2 = /*#__PURE__*/function () {
    var _deleteUser3 = _asyncToGenerator(function* () {
      $ct.blockRequest = true;

      _classPrivateFieldLooseBase(this, _logger$1)[_logger$1].debug('Block request is true');

      $ct.globalCache = {
        gcookie: null,
        REQ_N: 0,
        RESP_N: 0
      };

      if (StorageManager._isLocalStorageSupported()) {
        [GCOOKIE_NAME, KCOOKIE_NAME, PR_COOKIE, EV_COOKIE, META_COOKIE, ARP_COOKIE, CAMP_COOKIE_NAME, CHARGEDID_COOKIE_NAME].forEach( /*#__PURE__*/function () {
          var _ref4 = _asyncToGenerator(function* (cookie) {
            yield StorageManager.deleteData('localStorage', cookie);
          });

          return function (_x4) {
            return _ref4.apply(this, arguments);
          };
        }());
      }

      yield StorageManager.retrieveData('cookie', GCOOKIE_NAME, $ct.broadDomain);
      yield StorageManager.retrieveData('cookie', CAMP_COOKIE_NAME, getHostName());
      yield StorageManager.retrieveData('cookie', KCOOKIE_NAME, getHostName());
      yield StorageManager.retrieveData('cookie', _classPrivateFieldLooseBase(this, _session$1)[_session$1].cookieName, $ct.broadDomain);
      yield StorageManager.retrieveData('cookie', ARP_COOKIE, $ct.broadDomain);
      _classPrivateFieldLooseBase(this, _device$1)[_device$1].gcookie = null;
      yield _classPrivateFieldLooseBase(this, _session$1)[_session$1].setSessionCookieObject('');
    });

    function _deleteUser2() {
      return _deleteUser3.apply(this, arguments);
    }

    return _deleteUser2;
  }();

  var _processLoginArray2 = /*#__PURE__*/function () {
    var _processLoginArray3 = _asyncToGenerator(function* (loginArr) {
      if (Array.isArray(loginArr) && loginArr.length > 0) {
        var profileObj = loginArr.pop();
        var processProfile = profileObj != null && isObject(profileObj) && (profileObj.Site != null && Object.keys(profileObj.Site).length > 0 || profileObj.Facebook != null && Object.keys(profileObj.Facebook).length > 0 || profileObj['Google Plus'] != null && Object.keys(profileObj['Google Plus']).length > 0);

        if (processProfile) {
          yield StorageManager.setInstantDeleteFlagInK();

          try {
            yield _classPrivateFieldLooseBase(this, _processOUL)[_processOUL]([profileObj]);
          } catch (e) {
            _classPrivateFieldLooseBase(this, _logger$1)[_logger$1].debug(e);
          }
        } else {
          _classPrivateFieldLooseBase(this, _logger$1)[_logger$1].error('Profile object is in incorrect format');
        }
      }
    });

    function _processLoginArray2(_x5) {
      return _processLoginArray3.apply(this, arguments);
    }

    return _processLoginArray2;
  }();

  var logLevels = {
    DISABLE: 0,
    ERROR: 1,
    INFO: 2,
    DEBUG: 3,
    DEBUG_PE: 4
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

      // Singleton pattern - return existing instance if it exists
      if (Logger.instance) {
        return Logger.instance;
      }

      _classPrivateFieldLooseBase(this, _logLevel)[_logLevel] = logLevel == null ? logLevels.INFO : logLevel;
      this.wzrkError = {};
      Logger.instance = this;
    } // Static method for explicit singleton access


    static getInstance(logLevel) {
      if (!Logger.instance) {
        Logger.instance = new Logger(logLevel);
      }

      return Logger.instance;
    }

    get logLevelValue() {
      return this.logLevel;
    }

    set logLevelValue(logLevel) {
      this.logLevel = logLevel;
    }

    error(message) {
      if (this.logLevelValue >= logLevels.ERROR) {
        _classPrivateFieldLooseBase(this, _log)[_log]('error', message);
      }
    }

    info(message) {
      if (this.logLevelValue >= logLevels.INFO) {
        _classPrivateFieldLooseBase(this, _log)[_log]('log', message);
      }
    }

    debug(message) {
      if (this.logLevelValue >= logLevels.DEBUG || _classPrivateFieldLooseBase(this, _isLegacyDebug)[_isLegacyDebug]) {
        _classPrivateFieldLooseBase(this, _log)[_log]('debug', message);
      }
    }

    debugShopify(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'web';

      if (this.logLevelValue >= logLevels.DEBUG || _classPrivateFieldLooseBase(this, _isLegacyDebug)[_isLegacyDebug]) {
        _classPrivateFieldLooseBase(this, _log)[_log]('debug', message, type);
      }
    }

    debugPE(message) {
      if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.DEBUG_PE) {
        _classPrivateFieldLooseBase(this, _log)[_log]('debug_pe', message);
      }
    }

    reportError(code, description) {
      this.wzrkError.c = code;
      this.wzrkError.d = description;
      this.error("".concat(CLEVERTAP_ERROR_PREFIX, " ").concat(code, ": ").concat(description));
    }

  }

  var _log2 = function _log2(level, message) {
    var eventType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'web';

    try {
      var ts = new Date().getTime();

      if (eventType === 'shopify_standard_event') {
        console.log("CleverTap [".concat(ts, "]: "));
        console.log(JSON.parse(message));
      } else {
        console.log("CleverTap [".concat(ts, "]: ").concat(message));
      }
    } catch (e) {}
  };

  var _get_isLegacyDebug = function _get_isLegacyDebug() {
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

  var _account = _classPrivateFieldLooseKey("account");

  var _logger = _classPrivateFieldLooseKey("logger");

  var _device = _classPrivateFieldLooseKey("device");

  var _session = _classPrivateFieldLooseKey("session");

  var _request = _classPrivateFieldLooseKey("request");

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
      var {
        browser,
        accountId,
        region,
        targetDomain
      } = _ref;
      Object.defineProperty(this, _account, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger, {
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
      Object.defineProperty(this, _request, {
        writable: true,
        value: void 0
      });
      mode.browser = browser;
      mode.mode = 'SHOPIFY';
      _classPrivateFieldLooseBase(this, _logger)[_logger] = new Logger(logLevels.INFO);
      _classPrivateFieldLooseBase(this, _account)[_account] = new Account({
        id: accountId
      }, region, targetDomain);
      _classPrivateFieldLooseBase(this, _device)[_device] = new DeviceManager({
        logger: _classPrivateFieldLooseBase(this, _logger)[_logger]
      });
      _classPrivateFieldLooseBase(this, _session)[_session] = new SessionManager({
        logger: _classPrivateFieldLooseBase(this, _logger)[_logger],
        isPersonalisationActive: () => false
      });
      _classPrivateFieldLooseBase(this, _request)[_request] = new RequestManager({
        logger: _classPrivateFieldLooseBase(this, _logger)[_logger],
        account: _classPrivateFieldLooseBase(this, _account)[_account],
        device: _classPrivateFieldLooseBase(this, _device)[_device],
        session: _classPrivateFieldLooseBase(this, _session)[_session],
        isPersonalisationActive: () => false
      });
      this.event = new EventHandler({
        logger: _classPrivateFieldLooseBase(this, _logger)[_logger],
        request: _classPrivateFieldLooseBase(this, _request)[_request],
        isPersonalisationActive: () => false
      });
      this.onUserLogin = new UserLoginHandler({
        request: _classPrivateFieldLooseBase(this, _request)[_request],
        account: _classPrivateFieldLooseBase(this, _account)[_account],
        session: _classPrivateFieldLooseBase(this, _session)[_session],
        logger: _classPrivateFieldLooseBase(this, _logger)[_logger],
        device: _classPrivateFieldLooseBase(this, _device)[_device]
      });
      clevertapApi.setPrivateProperties({
        logger: _classPrivateFieldLooseBase(this, _logger)[_logger],
        request: _classPrivateFieldLooseBase(this, _request)[_request],
        session: _classPrivateFieldLooseBase(this, _session)[_session],
        device: _classPrivateFieldLooseBase(this, _device)[_device]
      });
    }

    init() {
      var _this = this;

      return _asyncToGenerator(function* () {
        _classPrivateFieldLooseBase(_this, _logger)[_logger].debug('init called');

        _classPrivateFieldLooseBase(_this, _device)[_device].gcookie = yield _classPrivateFieldLooseBase(_this, _device)[_device].getGuid(); // @todo implement AsyncStorageManager

        yield StorageManager.removeCookieAsync('WZRK_P', getHostName());

        if (!_classPrivateFieldLooseBase(_this, _account)[_account].id) {
          return false;
        }

        _classPrivateFieldLooseBase(_this, _session)[_session].cookieName = SCOOKIE_PREFIX + '_' + _classPrivateFieldLooseBase(_this, _account)[_account].id; // get log level from localStorage

        var logLevel = yield StorageManager.retrieveData('localStorage', SHOPIFY_DEBUG);

        if (logLevel) {
          _classPrivateFieldLooseBase(_this, _logger)[_logger].logLevelValue = logLevel;
        } // @todo make a decision whether we want to directly send privacy as true
        // await this.pageChanged()

      })();
    }
    /**
     * A helper method to log shopify events
     * @param {Object} event
     * @param {('shopify_standard_event' | 'web')} type
     */


    logShopifyEvents(event, type) {
      _classPrivateFieldLooseBase(this, _logger)[_logger].debugShopify(event, type);
    }

    pageChanged() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var currentLocation = mode.browser.document.location.href; // -- update page count

        var obj = yield _classPrivateFieldLooseBase(_this2, _session)[_session].getSessionCookieObject();
        var pgCount = typeof obj.p === 'undefined' ? 0 : obj.p;
        obj.p = ++pgCount;
        yield _classPrivateFieldLooseBase(_this2, _session)[_session].setSessionCookieObject(obj);
        var data = {};
        data = yield _classPrivateFieldLooseBase(_this2, _request)[_request].addSystemDataToObject(data, undefined);
        data.cpg = currentLocation;

        var pageLoadUrl = _classPrivateFieldLooseBase(_this2, _account)[_account].dataPostURL;

        var {
          protocol
        } = mode.browser.document.location;
        protocol = protocol.replace(':', '');
        data.af = {
          protocol
        };
        pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page');
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), _classPrivateFieldLooseBase(_this2, _logger)[_logger]));
        yield _classPrivateFieldLooseBase(_this2, _request)[_request].addFlags(data);
        yield _classPrivateFieldLooseBase(_this2, _request)[_request].saveAndFireRequest(pageLoadUrl, $ct.blockRequest);
      })();
    }

  }

  return ClevertapShopify;

})();
