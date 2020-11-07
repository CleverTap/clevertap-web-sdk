(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.clevertap = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
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

  var TARGET_DOMAIN = 'wzrkt.com';
  var TARGET_PROTOCOL = 'https:';

  var _accountId = _classPrivateFieldLooseKey("accountId");

  var _region = _classPrivateFieldLooseKey("region");

  var _targetDomain = _classPrivateFieldLooseKey("targetDomain");

  var Account = /*#__PURE__*/function () {
    function Account() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          id = _ref.id;

      var region = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var targetDomain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : TARGET_DOMAIN;

      _classCallCheck(this, Account);

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
      this.id = id;

      if (region) {
        this.region = region;
      }

      if (targetDomain) {
        this.targetDomain = targetDomain;
      }
    }

    _createClass(Account, [{
      key: "id",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _accountId)[_accountId];
      },
      set: function set(accountId) {
        _classPrivateFieldLooseBase(this, _accountId)[_accountId] = accountId;
      }
    }, {
      key: "region",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _region)[_region];
      },
      set: function set(region) {
        _classPrivateFieldLooseBase(this, _region)[_region] = region;
      }
    }, {
      key: "targetDomain",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain];
      },
      set: function set(targetDomain) {
        _classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain] = targetDomain;
      }
    }, {
      key: "finalTargetDomain",
      get: function get() {
        if (this.region) {
          return "".concat(this.region, ".").concat(this.targetDomain);
        }

        return this.targetDomain;
      }
    }, {
      key: "dataPostURL",
      get: function get() {
        return "".concat(TARGET_PROTOCOL, "//").concat(this.finalTargetDomain, "/a?t=96");
      }
    }, {
      key: "recorderURL",
      get: function get() {
        return "".concat(TARGET_PROTOCOL, "//").concat(this.finalTargetDomain, "/r?r=1");
      }
    }, {
      key: "emailURL",
      get: function get() {
        return "".concat(TARGET_PROTOCOL, "//").concat(this.finalTargetDomain, "/e?r=1");
      }
    }]);

    return Account;
  }();

  var _logger = _classPrivateFieldLooseKey("logger");

  // import { StorageManager } from "../util/storage"
  // import { isString } from '../util/datatypes'
  // import {
  //   OPTOUT_COOKIE_ENDSWITH,
  //   MAX_TRIES,
  //   ARP_COOKIE
  // } from '../util/constants'
  // import {
  //   addToURL
  // } from '../util/url'
  // import {
  //   compressData
  // } from '../util/encoder'
  // export class CleverTapAPI {
  //   #logger
  //   #event
  //   constructor ({
  //     logger
  //   }) {
  //     this.#logger = logger
  //   }
  //   dropRequestDueToOptOut () {
  //     if (!($ct.globalCache.gcookie) || isString($ct.globalCache.gcookie)) {
  //       $ct.globalCache.isOptInRequest = false
  //       return false
  //     }
  //     return $ct.globalCache.gcookie.slice(-3) === OPTOUT_COOKIE_ENDSWITH
  //   }
  //   addARPToRequest (url, skipResARP) {
  //     if(skipResARP != null && skipResARP === true) {
  //       var _arp = {}
  //       _arp['skipResARP'] = true
  //       return addToURL(url, 'arp', compressData(JSON.stringify(_arp)))
  //     }
  //     if (StorageManager._isLocalStorageSupported() && StorageManager.read(ARP_COOKIE) != null) {
  //       return addToURL(url, 'arp', compressData(JSON.stringify(StorageManager.readFromLSorCookie(ARP_COOKIE))))
  //     }
  //     return url
  //   };
  //   fireRequest (url, tries, skipARP, sendOULFlag) {
  //     if (dropRequestDueToOptOut()) {
  //       this.#logger.debug('req dropped due to optout cookie: ' + $ct.globalCache.gcookie)
  //       return
  //     }
  //     if (
  //         !($ct.globalCache.gcookie) &&
  //         $ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1 &&
  //         tries < MAX_TRIES
  //     ) {
  //       setTimeout(function () {
  //         fireRequest(url, tries + 1, skipARP, sendOULFlag)
  //       }, 50)
  //       return
  //     }
  //     if(!sendOULFlag) {
  //       if ($ct.globalCache.gcookie) {
  //         url = addToURL(url, 'gc', $ct.globalCache.gcookie) //add cookie to url
  //       }
  //       url = addARPToRequest(url, skipARP)
  //     }
  //     url = addToURL(url, 'r', new Date().getTime()) // add epoch to beat caching of the URL
  //     if (wizrocket.hasOwnProperty('plugin')) {
  //       //used to add plugin name in request parameter
  //       let plugin = wizrocket.plugin
  //       url = addToURL(url, 'ct_pl', plugin)
  //     }
  //     if (url.indexOf('chrome-extension:') != -1) {
  //       url = url.replace('chrome-extension:', 'https:')
  //     }
  //     let s = doc.createElement('script')
  //     s.setAttribute('type', 'text/javascript')
  //     s.setAttribute('src', url)
  //     s.setAttribute('rel', 'nofollow')
  //     s.async = true
  //     doc.getElementsByTagName('head')[0].appendChild(s)
  //     this.#logger.debug('req snt -> url: ' + url)
  //   }
  // }
  var CleverTapAPI = function CleverTapAPI(_ref) {
    var logger = _ref.logger;

    _classCallCheck(this, CleverTapAPI);

    Object.defineProperty(this, _logger, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldLooseBase(this, _logger)[_logger] = logger;
  };

  // CHARGEDID_COOKIE_NAME: 'WZRK_CHARGED_ID',
  // ECOOKIE_PREFIX: 'CT_E',
  // GCOOKIE_NAME: 'CT_G',
  // KCOOKIE_NAME: 'CT_K',
  // PCOOKIE_PREFIX: 'CT_P',
  // SEQCOOKIE_PREFIX: 'CT_SEQ',
  // SCOOKIE_PREFIX: 'CT_S',
  // EV_COOKIE: 'CT_EV',
  // PR_COOKIE: 'CT_PR',
  // ARP_COOKIE: 'CT_ARP',
  // UNDEFINED: 'undefined',
  // PING_FREQ_IN_MILLIS: (2 * 60 * 1000), // 2 mins
  // EVENT_TYPES: {
  //   EVENT: 'event',
  //   PROFILE: 'profile',
  //   PAGE: 'page',
  //   PING: 'ping',
  // },
  // IDENTITY_TYPES: {
  //   IDENTITY: 'Identity',
  //   EMAIL: 'Email',
  //   FBID: 'FBID',
  //   GPID: 'GPID',
  // },
  var unsupportedKeyCharRegex = new RegExp('^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$', 'g');
  var unsupportedValueCharRegex = new RegExp("^\\s+|\'|\"|\\\\|\\s+$", 'g');
  var singleQuoteRegex = new RegExp('\'', 'g');
  var CLEAR = 'clear';
  var CHARGED_ID = 'Charged ID';
  var CHARGEDID_COOKIE_NAME = 'WZRK_CHARGED_ID';
  var GCOOKIE_NAME = 'WZRK_G';
  var KCOOKIE_NAME = 'WZRK_K';
  var CAMP_COOKIE_NAME = 'WZRK_CAMP';
  var SCOOKIE_PREFIX = 'WZRK_S';
  var SCOOKIE_EXP_TIME_IN_SECS = 60 * 20; // 20 mins
  var META_COOKIE = 'WZRK_META';
  var ARP_COOKIE = 'WZRK_ARP';
  var LCOOKIE_NAME = 'WZRK_L';
  var OPTOUT_COOKIE_ENDSWITH = ':OO';
  var COOKIE_EXPIRY = 86400 * 365 * 10; // 10 Years in seconds

  var MAX_TRIES = 50; // API tries

  var SYSTEM_EVENTS = ['Stayed', 'UTM Visited', 'App Launched', 'Notification Sent', 'Notification Viewed', 'Notification Clicked'];

  var isString = function isString(input) {
    return typeof input === 'string' || input instanceof String;
  };
  var isObject = function isObject(input) {
    // TODO: refine
    return Object.prototype.toString.call(input) === '[object Object]';
  };
  var isDateObject = function isDateObject(input) {
    return _typeof(input) === 'object' && input instanceof Date;
  };
  var isObjectEmpty = function isObjectEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return true;
  };
  var isNumber = function isNumber(n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n) && typeof n === 'number';
  };
  var isValueValid = function isValueValid(value) {
    if (value === null || value === undefined || value === 'undefined') {
      return false;
    }

    return true;
  };
  var removeUnsupportedChars = function removeUnsupportedChars(o, logger) {
    // keys can't be greater than 1024 chars, values can't be greater than 1024 chars
    if (_typeof(o) === 'object') {
      for (var key in o) {
        if (o.hasOwnProperty(key)) {
          var sanitizedVal = removeUnsupportedChars(o[key], logger);
          var sanitizedKey = isString(key) ? sanitize(key, unsupportedKeyCharRegex) : key;

          if (isString(key)) {
            sanitizedKey = sanitize(key, unsupportedKeyCharRegex);

            if (sanitizedKey.length > 1024) {
              sanitizedKey = sanitizedKey.substring(0, 1024);
              logger.reportError(520, sanitizedKey + '... length exceeded 1024 chars. Trimmed.');
            }
          } else {
            sanitizedKey = key;
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
  var sanitize = function sanitize(input, regex) {
    return input.replace(regex, '');
  };

  var StorageManager = /*#__PURE__*/function () {
    function StorageManager() {
      _classCallCheck(this, StorageManager);
    }

    _createClass(StorageManager, null, [{
      key: "save",
      value: function save(key, value) {
        if (!key || !value) {
          return false;
        }

        if (this._isLocalStorageSupported()) {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        }
      }
    }, {
      key: "read",
      value: function read(key) {
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
    }, {
      key: "remove",
      value: function remove(key) {
        if (!key) {
          return false;
        }

        if (this._isLocalStorageSupported()) {
          localStorage.removeItem(key);
          return true;
        }
      }
    }, {
      key: "removeCookie",
      value: function removeCookie(name, domain) {
        var cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        if (domain) {
          cookieStr = cookieStr + ' domain=' + domain + '; path=/';
        }

        document.cookie = cookieStr;
      }
    }, {
      key: "createCookie",
      value: function createCookie(name, value, seconds, domain) {
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
    }, {
      key: "readCookie",
      value: function readCookie(name) {
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
    }, {
      key: "_isLocalStorageSupported",
      value: function _isLocalStorageSupported() {
        return 'localStorage' in window && window.localStorage !== null && typeof window.localStorage.setItem === 'function';
      }
    }, {
      key: "saveToLSorCookie",
      value: function saveToLSorCookie(property, value) {
        if (value == null) {
          return;
        }

        try {
          if (this._isLocalStorageSupported()) {
            this.save(property, encodeURIComponent(JSON.stringify(value)));
          } else {
            if (property === GCOOKIE_NAME) {
              this.createCookie(property, encodeURIComponent(value), 0, window.location.hostname);
            } else {
              this.createCookie(property, encodeURIComponent(JSON.stringify(value)), 0, window.location.hostname);
            }
          }

          window.$ct.globalCache[property] = value;
        } catch (e) {}
      }
    }, {
      key: "readFromLSorCookie",
      value: function readFromLSorCookie(property) {
        var data;

        if (window.$ct.globalCache.hasOwnProperty(property)) {
          return window.$ct.globalCache[property];
        }

        if (this._isLocalStorageSupported()) {
          data = this.read(property);
        } else {
          data = this.readCookie(property);
        }

        if (data != null && data.trim() !== '') {
          var value = JSON.parse(decodeURIComponent(data));
          window.$ct.globalCache[property] = value;
          return value;
        }
      }
    }, {
      key: "createBroadCookie",
      value: function createBroadCookie(name, value, seconds, domain) {
        // sets cookie on the base domain. e.g. if domain is baz.foo.bar.com, set cookie on ".bar.com"
        // To update an existing "broad domain" cookie, we need to know what domain it was actually set on.
        // since a retrieved cookie never tells which domain it was set on, we need to set another test cookie
        // to find out which "broadest" domain the cookie was set on. Then delete the test cookie, and use that domain
        // for updating the actual cookie.
        if (domain) {
          var broadDomain = window.$ct.broadDomain;

          if (broadDomain == null) {
            // if we don't know the broadDomain yet, then find out
            var domainParts = domain.split('.');
            var testBroadDomain = '';

            for (var idx = domainParts.length - 1; idx >= 0; idx--) {
              testBroadDomain = '.' + domainParts[idx] + testBroadDomain; // only needed if the cookie already exists and needs to be updated. See note above.

              if (this.readCookie(name)) {
                // no guarantee that browser will delete cookie, hence create short lived cookies
                var testCookieName = 'test_' + name + idx;
                this.createCookie(testCookieName, value, 10, testBroadDomain); // self-destruct after 10 seconds

                if (!this.readCookie(testCookieName)) {
                  // if test cookie not set, then the actual cookie wouldn't have been set on this domain either.
                  continue;
                } else {
                  // else if cookie set, then delete the test and the original cookie
                  this.removeCookie(testCookieName, testBroadDomain);
                }
              }

              this.createCookie(name, value, seconds, testBroadDomain);
              var tempCookie = this.readCookie(name); // eslint-disable-next-line eqeqeq

              if (tempCookie == value) {
                broadDomain = testBroadDomain;
                window.$ct.broadDomain = broadDomain;
                break;
              }
            }
          } else {
            this.createCookie(name, value, seconds, broadDomain);
          }
        } else {
          this.createCookie(name, value, seconds, domain);
        }
      }
    }, {
      key: "getMetaProp",
      value: function getMetaProp(property) {
        var metaObj = this.readFromLSorCookie(META_COOKIE);

        if (metaObj != null) {
          return metaObj[property];
        }
      }
    }, {
      key: "setMetaProp",
      value: function setMetaProp(property, value) {
        if (this._isLocalStorageSupported()) {
          var wzrkMetaObj = this.readFromLSorCookie(META_COOKIE);

          if (wzrkMetaObj == null) {
            wzrkMetaObj = {};
          }

          if (value === undefined) {
            delete wzrkMetaObj[property];
          } else {
            wzrkMetaObj[property] = value;
          }

          this.saveToLSorCookie(META_COOKIE, wzrkMetaObj);
        }
      }
    }, {
      key: "getAndClearMetaProp",
      value: function getAndClearMetaProp(property) {
        var value = this.getMetaProp(property);
        this.setMetaProp(property, undefined);
        return value;
      }
    }, {
      key: "setInstantDeleteFlagInK",
      value: function setInstantDeleteFlagInK() {
        var k = this.readFromLSorCookie(KCOOKIE_NAME);

        if (k == null) {
          k = {};
        }

        k.flag = true;
        this.saveToLSorCookie(KCOOKIE_NAME, k);
      }
    }]);

    return StorageManager;
  }();

  var _logger$1 = _classPrivateFieldLooseKey("logger");

  var DeviceManager = /*#__PURE__*/function () {
    function DeviceManager(_ref) {
      var logger = _ref.logger;

      _classCallCheck(this, DeviceManager);

      Object.defineProperty(this, _logger$1, {
        writable: true,
        value: void 0
      });
      this.gcookie = void 0;
      _classPrivateFieldLooseBase(this, _logger$1)[_logger$1] = logger;
      this.gcookie = this.getGuid();
    }

    _createClass(DeviceManager, [{
      key: "getGuid",
      value: function getGuid() {
        var guid = null;

        if (isValueValid(this.gcookie)) {
          return this.gcookie;
        }

        if (StorageManager._isLocalStorageSupported()) {
          var value = StorageManager.read(GCOOKIE_NAME);

          if (isValueValid(value)) {
            try {
              guid = JSON.parse(decodeURIComponent(value));
            } catch (e) {
              _classPrivateFieldLooseBase(this, _logger$1)[_logger$1].debug('Cannot parse Gcookie from localstorage - must be encoded ' + value); // assumming guids are of size 32. supporting both formats.
              // guid can have encodedURIComponent or be without it.
              // 1.56e4078ed15749928c042479ec2b4d47 - breaks on JSON.parse(decodeURIComponent())
              // 2.%2256e4078ed15749928c042479ec2b4d47%22


              if (value.length === 32) {
                guid = value;
                StorageManager.saveToLSorCookie(GCOOKIE_NAME, value);
              } else {
                _classPrivateFieldLooseBase(this, _logger$1)[_logger$1].error('Illegal guid ' + value);
              }
            } // Persist to cookie storage if not present there.


            if (isValueValid(guid)) {
              StorageManager.createBroadCookie(GCOOKIE_NAME, guid, COOKIE_EXPIRY, window.location.hostname);
            }
          }
        }

        if (!isValueValid(guid)) {
          guid = StorageManager.readCookie(GCOOKIE_NAME);

          if (isValueValid(guid) && (guid.indexOf('%') === 0 || guid.indexOf('\'') === 0 || guid.indexOf('"') === 0)) {
            guid = null;
          }

          if (isValueValid(guid)) {
            StorageManager.saveToLSorCookie(GCOOKIE_NAME, guid);
          }
        }

        return guid;
      }
    }]);

    return DeviceManager;
  }();

  var DATA_NOT_SENT_TEXT = 'This property has been ignored.';
  var CLEVERTAP_ERROR_PREFIX = 'CleverTap error:'; // Formerly wzrk_error_txt

  var EMBED_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Incorrect embed script.");
  var EVENT_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Event structure not valid. ").concat(DATA_NOT_SENT_TEXT);

  var getToday = function getToday() {
    var today = new Date();
    return today.getFullYear() + '' + today.getMonth() + '' + today.getDay();
  };
  var getNow = function getNow() {
    return Math.floor(new Date().getTime() / 1000);
  };
  var convertToWZRKDate = function convertToWZRKDate(dateObj) {
    return '$D_' + Math.round(dateObj.getTime() / 1000);
  };

  var _globalChargedId;

  var isEventStructureFlat = function isEventStructureFlat(eventObj) {
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
  var isChargedEventStructureValid = function isChargedEventStructureValid(chargedObj, logger) {
    if (isObject(chargedObj)) {
      for (var key in chargedObj) {
        if (chargedObj.hasOwnProperty(key)) {
          if (key === 'Items') {
            if (!Array.isArray(chargedObj[key])) {
              return false;
            }

            if (chargedObj[key].length > 16) {
              logger.reportError(522, 'Charged Items exceed 16 limit. Actual count: ' + chargedObj[key].length + '. Additional items will be dropped.');
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
          _globalChargedId = StorageManager.readFromLSorCookie(CHARGEDID_COOKIE_NAME);
        }

        if (typeof _globalChargedId !== 'undefined' && _globalChargedId.trim() === chargedId.trim()) {
          // drop event- duplicate charged id
          logger.error('Duplicate charged Id - Dropped' + chargedObj);
          return false;
        }

        _globalChargedId = chargedId;
        StorageManager.saveToLSorCookie(CHARGEDID_COOKIE_NAME, chargedId);
      }

      return true;
    } // if object (chargedObject)


    return false;
  };

  var _logger$2 = _classPrivateFieldLooseKey("logger");

  var _oldValues = _classPrivateFieldLooseKey("oldValues");

  var _processEventArray = _classPrivateFieldLooseKey("processEventArray");

  var EventHandler = /*#__PURE__*/function (_Array) {
    _inherits(EventHandler, _Array);

    var _super = _createSuper(EventHandler);

    function EventHandler(_ref, values) {
      var _this;

      var logger = _ref.logger;

      _classCallCheck(this, EventHandler);

      _this = _super.call(this);
      Object.defineProperty(_assertThisInitialized(_this), _processEventArray, {
        value: _processEventArray2
      });
      Object.defineProperty(_assertThisInitialized(_this), _logger$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _oldValues, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _logger$2)[_logger$2] = logger;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _oldValues)[_oldValues] = values;
      return _this;
    }

    _createClass(EventHandler, [{
      key: "push",
      value: function push() {
        for (var _len = arguments.length, eventsArr = new Array(_len), _key = 0; _key < _len; _key++) {
          eventsArr[_key] = arguments[_key];
        }

        _classPrivateFieldLooseBase(this, _processEventArray)[_processEventArray](eventsArr);

        return 0;
      }
    }, {
      key: "processOldValues",
      value: function processOldValues() {
        if (_classPrivateFieldLooseBase(this, _oldValues)[_oldValues]) {
          _classPrivateFieldLooseBase(this, _processEventArray)[_processEventArray](_classPrivateFieldLooseBase(this, _oldValues)[_oldValues]);
        }

        _classPrivateFieldLooseBase(this, _oldValues)[_oldValues] = null;
      }
    }]);

    return EventHandler;
  }( /*#__PURE__*/_wrapNativeSuper(Array));

  var _processEventArray2 = function _processEventArray2(eventsArr) {
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
              if (!isChargedEventStructureValid(eventObj, _classPrivateFieldLooseBase(this, _logger$2)[_logger$2])) {
                _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].reportError(511, 'Charged event structure invalid. Not sent.');

                continue;
              }
            } else {
              if (!isEventStructureFlat(eventObj)) {
                _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].reportError(512, eventName + ' event structure invalid. Not sent.');

                continue;
              }
            }

            data.evtData = eventObj;
          }
        } // TODO: processEvent call


        console.log('event data', data);
      }
    }
  };

  var logLevels = {
    DISABLE: 0,
    ERROR: 1,
    INFO: 2,
    DEBUG: 3
  };

  var _logLevel = _classPrivateFieldLooseKey("logLevel");

  var _log = _classPrivateFieldLooseKey("log");

  var _isLegacyDebug = _classPrivateFieldLooseKey("isLegacyDebug");

  var Logger = /*#__PURE__*/function () {
    function Logger(logLevel) {
      _classCallCheck(this, Logger);

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

    _createClass(Logger, [{
      key: "error",
      value: function error(message) {
        if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.ERROR) {
          _classPrivateFieldLooseBase(this, _log)[_log]('error', message);
        }
      }
    }, {
      key: "info",
      value: function info(message) {
        if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.INFO) {
          _classPrivateFieldLooseBase(this, _log)[_log]('log', message);
        }
      }
    }, {
      key: "debug",
      value: function debug(message) {
        if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.DEBUG || _classPrivateFieldLooseBase(this, _isLegacyDebug)[_isLegacyDebug]) {
          _classPrivateFieldLooseBase(this, _log)[_log]('debug', message);
        }
      }
    }, {
      key: "reportError",
      value: function reportError(code, description) {
        this.wzrkError.c = code;
        this.wzrkError.d = description;
        this.error("".concat(CLEVERTAP_ERROR_PREFIX, " ").concat(code, ": ").concat(description));
      }
    }, {
      key: "logLevel",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _logLevel)[_logLevel];
      },
      set: function set(logLevel) {
        _classPrivateFieldLooseBase(this, _logLevel)[_logLevel] = logLevel;
      }
    }]);

    return Logger;
  }();

  var _log2 = function _log2(level, message) {
    if (window.console) {
      try {
        var ts = new Date().getTime();
        console[level]("CleverTap [".concat(ts, "]: ").concat(message));
      } catch (e) {}
    }
  };

  var _get_isLegacyDebug = function _get_isLegacyDebug() {
    return typeof sessionStorage !== 'undefined' && sessionStorage.WZRK_D === '';
  };

  var _logger$3 = _classPrivateFieldLooseKey("logger");

  var _sessionId = _classPrivateFieldLooseKey("sessionId");

  var SessionManager = /*#__PURE__*/function () {
    function SessionManager(_ref) {
      var logger = _ref.logger;

      _classCallCheck(this, SessionManager);

      Object.defineProperty(this, _logger$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _sessionId, {
        writable: true,
        value: void 0
      });
      this.cookieName = void 0;
      this.scookieObj = void 0;
      this.sessionId = StorageManager.getMetaProp('cs');
      _classPrivateFieldLooseBase(this, _logger$3)[_logger$3] = logger;
    }

    _createClass(SessionManager, [{
      key: "getSessionCookieObject",
      value: function getSessionCookieObject() {
        var scookieStr = StorageManager.readCookie(this.cookieName);
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

        this.scookieObj = obj;
        return obj;
      }
    }, {
      key: "setSessionCookieObject",
      value: function setSessionCookieObject(obj) {
        var objStr = JSON.stringify(obj);
        StorageManager.createBroadCookie(this.cookieName, objStr, SCOOKIE_EXP_TIME_IN_SECS, window.location.hostname);
      }
    }, {
      key: "sessionId",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _sessionId)[_sessionId];
      },
      set: function set(sessionId) {
        _classPrivateFieldLooseBase(this, _sessionId)[_sessionId] = sessionId;
      }
    }]);

    return SessionManager;
  }();

  /* eslint-disable */
  var compressData = function compressData(dataObject) {
    // console.debug('dobj:' + dataObject);
    return compressToBase64(dataObject);
  };
  var compress = function compress(uncompressed) {
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
  var getKeyStr = function getKeyStr() {
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
  var compressToBase64 = function compressToBase64(input) {
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

  var getURLParams = function getURLParams(url) {
    var urlParams = {};
    var idx = url.indexOf('?');

    if (idx > 1) {
      var uri = url.substring(idx + 1);
      var match;
      var pl = /\+/g; // Regex for replacing addition symbol with a space

      var search = /([^&=]+)=?([^&]*)/g;

      var decode = function decode(s) {
        var replacement = s.replace(pl, ' ');

        try {
          replacement = decodeURIComponent(replacement);
        } catch (e) {// eat
        }

        return replacement;
      };

      match = search.exec(uri);

      while (match) {
        urlParams[decode(match[1])] = decode(match[2]);
        match = search.exec(uri);
      }
    }

    return urlParams;
  };
  var getDomain = function getDomain(url) {
    if (url === '') return '';
    var a = document.createElement('a');
    a.href = url;
    return a.hostname;
  };
  var addToURL = function addToURL(url, k, v) {
    return url + '&' + k + '=' + encodeURIComponent(v);
  };

  var _fireRequest = _classPrivateFieldLooseKey("fireRequest");

  var _dropRequestDueToOptOut = _classPrivateFieldLooseKey("dropRequestDueToOptOut");

  var _addARPToRequest = _classPrivateFieldLooseKey("addARPToRequest");

  var RequestDispatcher = /*#__PURE__*/function () {
    function RequestDispatcher() {
      _classCallCheck(this, RequestDispatcher);
    }

    _createClass(RequestDispatcher, null, [{
      key: "fireRequest",
      value: function fireRequest(url, skipARP, sendOULFlag) {
        _classPrivateFieldLooseBase(this, _fireRequest)[_fireRequest](url, 1, skipARP, sendOULFlag);
      }
    }]);

    return RequestDispatcher;
  }();

  var _addARPToRequest2 = function _addARPToRequest2(url, skipResARP) {
    if (skipResARP === true) {
      var _arp = {};
      _arp.skipResARP = true;
      return addToURL(url, 'arp', compressData(JSON.stringify(_arp)));
    }

    if (StorageManager._isLocalStorageSupported() && typeof localStorage.getItem(ARP_COOKIE) !== 'undefined') {
      return addToURL(url, 'arp', compressData(JSON.stringify(StorageManager.readFromLSorCookie(ARP_COOKIE))));
    }

    return url;
  };

  var _dropRequestDueToOptOut2 = function _dropRequestDueToOptOut2() {
    if (this.isOptInRequest || !isValueValid(this.device.gcookie) || !isString(this.device.gcookie)) {
      this.isOptInRequest = false;
      return false;
    }

    return this.device.gcookie.slice(-3) === OPTOUT_COOKIE_ENDSWITH;
  };

  var _fireRequest2 = function _fireRequest2(url, tries, skipARP, sendOULFlag) {
    var _this = this,
        _window$clevertap,
        _window$wizrocket;

    if (_classPrivateFieldLooseBase(this, _dropRequestDueToOptOut)[_dropRequestDueToOptOut]()) {
      this.logger.debug('req dropped due to optout cookie: ' + this.device.gcookie);
      return;
    }

    if (!isValueValid(this.device.gcookie) && window.$ct.globalCache.RESP_N < window.$ct.globalCache.REQ_N - 1 && tries < MAX_TRIES) {
      setTimeout(function () {
        _classPrivateFieldLooseBase(_this, _fireRequest)[_fireRequest](url, tries + 1, skipARP, sendOULFlag);
      }, 50);
      return;
    }

    if (!sendOULFlag) {
      if (isValueValid(this.device.gcookie)) {
        // add cookie to url
        url = addToURL(url, 'gc', this.device.gcookie);
      }

      url = _classPrivateFieldLooseBase(this, _addARPToRequest)[_addARPToRequest](url, skipARP);
    }

    url = addToURL(url, 'r', new Date().getTime()); // add epoch to beat caching of the URL
    // TODO: Figure out a better way to handle plugin check

    if (((_window$clevertap = window.clevertap) === null || _window$clevertap === void 0 ? void 0 : _window$clevertap.hasOwnProperty('plugin')) || ((_window$wizrocket = window.wizrocket) === null || _window$wizrocket === void 0 ? void 0 : _window$wizrocket.hasOwnProperty('plugin'))) {
      // used to add plugin name in request parameter
      var plugin = window.clevertap.plugin || window.wizrocket.plugin;
      url = addToURL(url, 'ct_pl', plugin);
    }

    if (url.indexOf('chrome-extension:') !== -1) {
      url = url.replace('chrome-extension:', 'https:');
    } // TODO: Try using Function constructor instead of appending script.


    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', url);
    s.setAttribute('rel', 'nofollow');
    s.async = true;
    document.getElementsByTagName('head')[0].appendChild(s);
    this.logger.debug('req snt -> url: ' + url);
  };

  RequestDispatcher.logger = void 0;
  RequestDispatcher.device = void 0;
  RequestDispatcher.isOptInRequest = false;
  Object.defineProperty(RequestDispatcher, _fireRequest, {
    value: _fireRequest2
  });
  Object.defineProperty(RequestDispatcher, _dropRequestDueToOptOut, {
    value: _dropRequestDueToOptOut2
  });
  Object.defineProperty(RequestDispatcher, _addARPToRequest, {
    value: _addARPToRequest2
  });

  var seqNo = 0;
  var requestTime = 0;

  var _logger$4 = _classPrivateFieldLooseKey("logger");

  var _account = _classPrivateFieldLooseKey("account");

  var _device = _classPrivateFieldLooseKey("device");

  var _session = _classPrivateFieldLooseKey("session");

  var _isPersonalisationActive = _classPrivateFieldLooseKey("isPersonalisationActive");

  var _clearCookie = _classPrivateFieldLooseKey("clearCookie");

  var _backupEvent = _classPrivateFieldLooseKey("backupEvent");

  var RequestManager = /*#__PURE__*/function () {
    function RequestManager(_ref) {
      var logger = _ref.logger,
          account = _ref.account,
          device = _ref.device,
          session = _ref.session,
          isPersonalisationActive = _ref.isPersonalisationActive;

      _classCallCheck(this, RequestManager);

      Object.defineProperty(this, _backupEvent, {
        value: _backupEvent2
      });
      Object.defineProperty(this, _logger$4, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _account, {
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
      Object.defineProperty(this, _isPersonalisationActive, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _clearCookie, {
        writable: true,
        value: false
      });
      this.processingBackup = false;
      _classPrivateFieldLooseBase(this, _logger$4)[_logger$4] = logger;
      _classPrivateFieldLooseBase(this, _account)[_account] = account;
      _classPrivateFieldLooseBase(this, _device)[_device] = device;
      _classPrivateFieldLooseBase(this, _session)[_session] = session;
      _classPrivateFieldLooseBase(this, _isPersonalisationActive)[_isPersonalisationActive] = isPersonalisationActive;
      RequestDispatcher.logger = logger;
      RequestDispatcher.device = device;
    }

    _createClass(RequestManager, [{
      key: "processBackupEvents",
      value: function processBackupEvents() {
        var backupMap = StorageManager.readFromLSorCookie(LCOOKIE_NAME);

        if (typeof backupMap === 'undefined' || backupMap === null) {
          return;
        }

        this.processingBackup = true;

        for (var idx in backupMap) {
          if (backupMap.hasOwnProperty(idx)) {
            var backupEvent = backupMap[idx];

            if (typeof backupEvent.fired === 'undefined') {
              _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].debug('Processing backup event : ' + backupEvent.q);

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
    }, {
      key: "addSystemDataToObject",
      value: function addSystemDataToObject(dataObject, ignoreTrim) {
        // ignore trim for chrome notifications; undefined everywhere else
        if (typeof ignoreTrim === 'undefined') {
          dataObject = removeUnsupportedChars(dataObject, _classPrivateFieldLooseBase(this, _logger$4)[_logger$4]);
        }

        if (!isObjectEmpty(_classPrivateFieldLooseBase(this, _logger$4)[_logger$4].wzrkError)) {
          dataObject.wzrk_error = _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].wzrkError;
          _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].wzrkError = {};
        }

        dataObject.id = _classPrivateFieldLooseBase(this, _account)[_account].id;

        if (isValueValid(_classPrivateFieldLooseBase(this, _device)[_device].gcookie)) {
          dataObject.g = _classPrivateFieldLooseBase(this, _device)[_device].gcookie;
        }

        var obj = _classPrivateFieldLooseBase(this, _session)[_session].getSessionCookieObject();

        dataObject.s = obj.s; // session cookie

        dataObject.pg = typeof obj.p === 'undefined' ? 1 : obj.p; // Page count

        return dataObject;
      }
    }, {
      key: "addFlags",
      value: function addFlags(data) {
        // check if cookie should be cleared.
        _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] = StorageManager.getAndClearMetaProp(CLEAR);

        if (_classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] !== undefined && _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie]) {
          data.rc = true;

          _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].debug('reset cookie sent in request and cleared from meta for future requests.');
        }

        if (_classPrivateFieldLooseBase(this, _isPersonalisationActive)[_isPersonalisationActive]()) {
          var lastSyncTime = StorageManager.getMetaProp('lsTime');
          var expirySeconds = StorageManager.getMetaProp('exTs'); // dsync not found in local storage - get data from server

          if (typeof lastSyncTime === 'undefined' || typeof expirySeconds === 'undefined') {
            data.dsync = true;
            return;
          }

          var now = getNow(); // last sync time has expired - get fresh data from server

          if (lastSyncTime + expirySeconds < now) {
            data.dsync = true;
          }
        }
      }
    }, {
      key: "saveAndFireRequest",
      value: function saveAndFireRequest(url, override, sendOULFlag) {
        var now = getNow();
        url = addToURL(url, 'rn', ++window.$ct.globalCache.REQ_N);
        var data = url + '&i=' + now + '&sn=' + seqNo;

        _classPrivateFieldLooseBase(this, _backupEvent)[_backupEvent](data, window.$ct.globalCache.REQ_N);

        if (!window.$ct.blockRequest || override || _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] !== undefined && _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie]) {
          if (now === requestTime) {
            seqNo++;
          } else {
            requestTime = now;
            seqNo = 0;
          }

          RequestDispatcher.fireRequest(data, false, sendOULFlag);
        } else {
          _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].debug("Not fired due to block request - ".concat(window.$ct.blockRequest, " or clearCookie - ").concat(_classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie]));
        }
      }
    }]);

    return RequestManager;
  }();

  var _backupEvent2 = function _backupEvent2(data, reqNo) {
    var backupArr = StorageManager.readFromLSorCookie(LCOOKIE_NAME);

    if (typeof backupArr === 'undefined') {
      backupArr = {};
    }

    backupArr[reqNo] = {
      q: data
    };
    StorageManager.saveToLSorCookie(LCOOKIE_NAME, backupArr);

    _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].debug("stored in ".concat(LCOOKIE_NAME, " reqNo : ").concat(reqNo, " -> ").concat(data));
  };

  // CleverTap specific utilities
  var getCampaignObject = function getCampaignObject() {
    var campObj = {};

    if (StorageManager._isLocalStorageSupported()) {
      campObj = StorageManager.read(CAMP_COOKIE_NAME);

      if (campObj != null) {
        campObj = JSON.parse(decodeURIComponent(campObj).replace(singleQuoteRegex, '\"'));
      } else {
        campObj = {};
      }
    }

    return campObj;
  };
  var getCampaignObjForLc = function getCampaignObjForLc() {
    var campObj = {};

    if (StorageManager._isLocalStorageSupported()) {
      campObj = getCampaignObject();
      var resultObj = [];
      var globalObj = campObj.global;
      var today = getToday();
      var dailyObj = campObj[today];

      if (typeof globalObj !== 'undefined') {
        var campaignIdArray = Object.keys(globalObj);

        for (var index in campaignIdArray) {
          if (campaignIdArray.hasOwnProperty(index)) {
            var dailyC = 0;
            var totalC = 0;
            var campaignId = campaignIdArray[index];

            if (campaignId === 'tc') {
              continue;
            }

            if (typeof dailyObj !== 'undefined' && typeof dailyObj[campaignId] !== 'undefined') {
              dailyC = dailyObj[campaignId];
            }

            if (typeof globalObj !== 'undefined' && typeof globalObj[campaignId] !== 'undefined') {
              totalC = globalObj[campaignId];
            }

            var element = [campaignId, dailyC, totalC];
            resultObj.push(element);
          }
        }
      }

      var todayC = 0;

      if (typeof dailyObj !== 'undefined' && typeof dailyObj.tc !== 'undefined') {
        todayC = dailyObj.tc;
      }

      resultObj = {
        wmp: todayC,
        tlc: resultObj
      };
      return resultObj;
    }
  };

  window.$ct = {
    globalCache: {
      gcookie: null,
      REQ_N: 0,
      RESP_N: 0
    },
    blockRequest: false
  };

  var _logger$5 = _classPrivateFieldLooseKey("logger");

  var _api = _classPrivateFieldLooseKey("api");

  var _onloadcalled = _classPrivateFieldLooseKey("onloadcalled");

  var _device$1 = _classPrivateFieldLooseKey("device");

  var _session$1 = _classPrivateFieldLooseKey("session");

  var _account$1 = _classPrivateFieldLooseKey("account");

  var _request = _classPrivateFieldLooseKey("request");

  var _processOldValues = _classPrivateFieldLooseKey("processOldValues");

  var _isPersonalisationActive$1 = _classPrivateFieldLooseKey("isPersonalisationActive");

  var _overrideDSyncFlag = _classPrivateFieldLooseKey("overrideDSyncFlag");

  var CleverTap = /*#__PURE__*/function () {
    function CleverTap() {
      var _clevertap$account;

      var clevertap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, CleverTap);

      Object.defineProperty(this, _overrideDSyncFlag, {
        value: _overrideDSyncFlag2
      });
      Object.defineProperty(this, _isPersonalisationActive$1, {
        value: _isPersonalisationActive2
      });
      Object.defineProperty(this, _processOldValues, {
        value: _processOldValues2
      });
      Object.defineProperty(this, _logger$5, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _api, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _onloadcalled, {
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
      Object.defineProperty(this, _account$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _request, {
        writable: true,
        value: void 0
      });
      this.enablePersonalization = void 0;
      _classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] = 0;
      _classPrivateFieldLooseBase(this, _logger$5)[_logger$5] = new Logger(logLevels.INFO);
      _classPrivateFieldLooseBase(this, _account$1)[_account$1] = new Account((_clevertap$account = clevertap.account) === null || _clevertap$account === void 0 ? void 0 : _clevertap$account[0], clevertap.region, clevertap.targetDomain);
      _classPrivateFieldLooseBase(this, _device$1)[_device$1] = new DeviceManager({
        logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
      });
      _classPrivateFieldLooseBase(this, _session$1)[_session$1] = new SessionManager({
        logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
      });
      _classPrivateFieldLooseBase(this, _request)[_request] = new RequestManager({
        logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5],
        account: _classPrivateFieldLooseBase(this, _account$1)[_account$1],
        device: _classPrivateFieldLooseBase(this, _device$1)[_device$1],
        session: _classPrivateFieldLooseBase(this, _session$1)[_session$1],
        isPersonalisationActive: _classPrivateFieldLooseBase(this, _isPersonalisationActive$1)[_isPersonalisationActive$1]
      });
      this.event = new EventHandler({
        logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
      }, clevertap.event);
      _classPrivateFieldLooseBase(this, _api)[_api] = new CleverTapAPI({
        logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
      });
      window.$WZRK_WR = _classPrivateFieldLooseBase(this, _api)[_api];
    }

    _createClass(CleverTap, [{
      key: "init",
      value: function init(accountId, region, targetDomain) {
        if (_classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] === 1) {
          // already initailsed
          return;
        }

        StorageManager.removeCookie('WZRK_P', window.location.hostname);

        if (!_classPrivateFieldLooseBase(this, _account$1)[_account$1].id) {
          if (!accountId) {
            _classPrivateFieldLooseBase(this, _logger$5)[_logger$5].error(EMBED_ERROR);

            return;
          }

          _classPrivateFieldLooseBase(this, _account$1)[_account$1].id = accountId;
        }

        _classPrivateFieldLooseBase(this, _session$1)[_session$1].cookieName = SCOOKIE_PREFIX + '_' + _classPrivateFieldLooseBase(this, _account$1)[_account$1].id;

        if (region) {
          _classPrivateFieldLooseBase(this, _account$1)[_account$1].region = region;
        }

        if (targetDomain) {
          _classPrivateFieldLooseBase(this, _account$1)[_account$1].targetDomain = targetDomain;
        }

        var currLocation = location.href;
        var urlParams = getURLParams(currLocation.toLowerCase()); // eslint-disable-next-line eqeqeq

        if (typeof urlParams.e !== 'undefined' && urlParams.wzrk_ex == '0') {
          return;
        }

        _classPrivateFieldLooseBase(this, _request)[_request].processBackupEvents();

        _classPrivateFieldLooseBase(this, _processOldValues)[_processOldValues]();

        this.pageChanged();
        _classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] = 1;
      }
    }, {
      key: "pageChanged",
      value: function pageChanged() {
        var currLocation = location.href;
        var urlParams = getURLParams(currLocation.toLowerCase()); // -- update page count

        var obj = _classPrivateFieldLooseBase(this, _session$1)[_session$1].getSessionCookieObject();

        var pgCount = typeof obj.p === 'undefined' ? 0 : obj.p;
        obj.p = ++pgCount;

        _classPrivateFieldLooseBase(this, _session$1)[_session$1].setSessionCookieObject(obj); // -- update page count


        var data = {};
        var referrerDomain = getDomain(document.referrer);

        if (location.hostname !== referrerDomain) {
          var maxLen = 120;

          if (referrerDomain !== '') {
            referrerDomain = referrerDomain.length > maxLen ? referrerDomain.substring(0, maxLen) : referrerDomain;
            data.referrer = referrerDomain;
          }

          var utmSource = urlParams.utm_source || urlParams.wzrk_source;

          if (typeof utmSource !== 'undefined') {
            utmSource = utmSource.length > maxLen ? utmSource.substring(0, maxLen) : utmSource;
            data.us = utmSource; // utm_source
          }

          var utmMedium = urlParams.utm_medium || urlParams.wzrk_medium;

          if (typeof utmMedium !== 'undefined') {
            utmMedium = utmMedium.length > maxLen ? utmMedium.substring(0, maxLen) : utmMedium;
            data.um = utmMedium; // utm_medium
          }

          var utmCampaign = urlParams.utm_campaign || urlParams.wzrk_campaign;

          if (typeof utmCampaign !== 'undefined') {
            utmCampaign = utmCampaign.length > maxLen ? utmCampaign.substring(0, maxLen) : utmCampaign;
            data.uc = utmCampaign; // utm_campaign
          } // also independently send wzrk_medium to the backend


          if (typeof urlParams.wzrk_medium !== 'undefined') {
            var wm = urlParams.wzrk_medium;

            if (wm.match(/^email$|^social$|^search$/)) {
              data.wm = wm; // wzrk_medium
            }
          }
        }

        data = _classPrivateFieldLooseBase(this, _request)[_request].addSystemDataToObject(data, undefined);
        data.cpg = currLocation;
        data[CAMP_COOKIE_NAME] = getCampaignObjForLc();

        var pageLoadUrl = _classPrivateFieldLooseBase(this, _account$1)[_account$1].dataPostURL;

        _classPrivateFieldLooseBase(this, _request)[_request].addFlags(data); // send dsync flag when page = 1


        if (parseInt(data.pg) === 1) {
          _classPrivateFieldLooseBase(this, _overrideDSyncFlag)[_overrideDSyncFlag](data);
        }

        pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page');
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data)));

        _classPrivateFieldLooseBase(this, _request)[_request].saveAndFireRequest(pageLoadUrl, false);
      }
    }]);

    return CleverTap;
  }();

  var _processOldValues2 = function _processOldValues2() {
    // TODO create classes old data handlers for OUL, Privacy, notifications
    this.event.processOldValues();
  };

  var _isPersonalisationActive2 = function _isPersonalisationActive2() {
    return StorageManager._isLocalStorageSupported() && this.enablePersonalization;
  };

  var _overrideDSyncFlag2 = function _overrideDSyncFlag2(data) {
    if (_classPrivateFieldLooseBase(this, _isPersonalisationActive$1)[_isPersonalisationActive$1]()) {
      data.dsync = true;
    }
  };

  var clevertap = new CleverTap(window.clevertap);
  clevertap.init();

  return clevertap;

})));
