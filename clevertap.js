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

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;

    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
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

  var TARGET_DOMAIN = 'clevertap-prod.com';
  var TARGET_PROTOCOL = 'https:';
  var DEFAULT_REGION = 'eu1';

  var _accountId = _classPrivateFieldLooseKey("accountId");

  var _region = _classPrivateFieldLooseKey("region");

  var _targetDomain = _classPrivateFieldLooseKey("targetDomain");

  var _dcSdkversion = _classPrivateFieldLooseKey("dcSdkversion");

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
      key: "dcSDKVersion",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _dcSdkversion)[_dcSdkversion];
      },
      set: function set(dcSDKVersion) {
        _classPrivateFieldLooseBase(this, _dcSdkversion)[_dcSdkversion] = dcSDKVersion;
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
        } else {
          if (this.targetDomain === TARGET_DOMAIN) {
            return "".concat(DEFAULT_REGION, ".").concat(this.targetDomain);
          }

          return this.targetDomain;
        }
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

  var EV_COOKIE = 'WZRK_EV';
  var META_COOKIE = 'WZRK_META';
  var PR_COOKIE = 'WZRK_PR';
  var ARP_COOKIE = 'WZRK_ARP';
  var LCOOKIE_NAME = 'WZRK_L';
  var GLOBAL = 'global';
  var DISPLAY = 'display';
  var WEBPUSH_LS_KEY = 'WZRK_WPR';
  var OPTOUT_KEY = 'optOut';
  var CT_OPTOUT_KEY = 'ct_optout';
  var OPTOUT_COOKIE_ENDSWITH = ':OO';
  var USEIP_KEY = 'useIP';
  var LRU_CACHE = 'WZRK_X';
  var LRU_CACHE_SIZE = 100;
  var IS_OUL = 'isOUL';
  var EVT_PUSH = 'push';
  var EVT_PING = 'ping';
  var COOKIE_EXPIRY = 86400 * 365 * 10; // 10 Years in seconds

  var MAX_TRIES = 50; // API tries

  var FIRST_PING_FREQ_IN_MILLIS = 2 * 60 * 1000; // 2 mins

  var CONTINUOUS_PING_FREQ_IN_MILLIS = 5 * 60 * 1000; // 5 mins

  var GROUP_SUBSCRIPTION_REQUEST_ID = '2';
  var categoryLongKey = 'cUsY';
  var WZRK_PREFIX = 'wzrk_';
  var WZRK_ID = 'wzrk_id';
  var NOTIFICATION_VIEWED = 'Notification Viewed';
  var NOTIFICATION_CLICKED = 'Notification Clicked';
  var FIRE_PUSH_UNREGISTERED = 'WZRK_FPU';
  var PUSH_SUBSCRIPTION_DATA = 'WZRK_PSD'; // PUSH SUBSCRIPTION DATA FOR REGISTER/UNREGISTER TOKEN

  var SYSTEM_EVENTS = ['Stayed', 'UTM Visited', 'App Launched', 'Notification Sent', NOTIFICATION_VIEWED, NOTIFICATION_CLICKED];

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
  var isConvertibleToNumber = function isConvertibleToNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
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
  var sanitize = function sanitize(input, regex) {
    return input.replace(regex, '');
  };

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
  var setDate = function setDate(dt) {
    // expecting  yyyymmdd format either as a number or a string
    if (isDateValid(dt)) {
      return '$D_' + dt;
    }
  };
  var isDateValid = function isDateValid(date) {
    var matches = /^(\d{4})(\d{2})(\d{2})$/.exec(date);
    if (matches == null) return false;
    var d = matches[3];
    var m = matches[2] - 1;
    var y = matches[1];
    var composedDate = new Date(y, m, d); // eslint-disable-next-line eqeqeq

    return composedDate.getDate() == d && composedDate.getMonth() == m && composedDate.getFullYear() == y;
  };

  var StorageManager$1 = /*#__PURE__*/function () {
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
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
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

          $ct.globalCache[property] = value;
        } catch (e) {}
      }
    }, {
      key: "readFromLSorCookie",
      value: function readFromLSorCookie(property) {
        var data;

        if ($ct.globalCache.hasOwnProperty(property)) {
          return $ct.globalCache[property];
        }

        if (this._isLocalStorageSupported()) {
          data = this.read(property);
        } else {
          data = this.readCookie(property);
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
                $ct.broadDomain = broadDomain;
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
    }, {
      key: "backupEvent",
      value: function backupEvent(data, reqNo, logger) {
        var backupArr = this.readFromLSorCookie(LCOOKIE_NAME);

        if (typeof backupArr === 'undefined') {
          backupArr = {};
        }

        backupArr[reqNo] = {
          q: data
        };
        this.saveToLSorCookie(LCOOKIE_NAME, backupArr);
        logger.debug("stored in ".concat(LCOOKIE_NAME, " reqNo : ").concat(reqNo, " -> ").concat(data));
      }
    }, {
      key: "removeBackup",
      value: function removeBackup(respNo, logger) {
        var backupMap = this.readFromLSorCookie(LCOOKIE_NAME);

        if (typeof backupMap !== 'undefined' && backupMap !== null && typeof backupMap[respNo] !== 'undefined') {
          logger.debug("del event: ".concat(respNo, " data-> ").concat(backupMap[respNo].q));
          delete backupMap[respNo];
          this.saveToLSorCookie(LCOOKIE_NAME, backupMap);
        }
      }
    }]);

    return StorageManager;
  }();
  var $ct = {
    globalCache: {
      gcookie: null,
      REQ_N: 0,
      RESP_N: 0
    },
    LRU_cache: null,
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
    updatedCategoryLong: null // domain: window.location.hostname, url -> getHostName()
    // gcookie: -> device

  };

  var _keyOrder = _classPrivateFieldLooseKey("keyOrder");

  var _deleteFromObject = _classPrivateFieldLooseKey("deleteFromObject");

  var LRUCache = /*#__PURE__*/function () {
    function LRUCache(max) {
      _classCallCheck(this, LRUCache);

      Object.defineProperty(this, _deleteFromObject, {
        value: _deleteFromObject2
      });
      Object.defineProperty(this, _keyOrder, {
        writable: true,
        value: void 0
      });
      this.max = max;
      var lruCache = StorageManager$1.readFromLSorCookie(LRU_CACHE);

      if (lruCache) {
        var tempLruCache = {};
        _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder] = [];
        lruCache = lruCache.cache;

        for (var entry in lruCache) {
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

    _createClass(LRUCache, [{
      key: "get",
      value: function get(key) {
        var item = this.cache[key];

        if (item) {
          this.cache = _classPrivateFieldLooseBase(this, _deleteFromObject)[_deleteFromObject](key, this.cache);
          this.cache[key] = item;

          _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder].push(key);
        }

        this.saveCacheToLS(this.cache);
        return item;
      }
    }, {
      key: "set",
      value: function set(key, value) {
        var item = this.cache[key];

        var allKeys = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder];

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
    }, {
      key: "saveCacheToLS",
      value: function saveCacheToLS(cache) {
        var objToArray = [];

        var allKeys = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder];

        for (var index in allKeys) {
          if (allKeys.hasOwnProperty(index)) {
            var temp = [];
            temp.push(allKeys[index]);
            temp.push(cache[allKeys[index]]);
            objToArray.push(temp);
          }
        }

        StorageManager$1.saveToLSorCookie(LRU_CACHE, {
          cache: objToArray
        });
      }
    }, {
      key: "getKey",
      value: function getKey(value) {
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
    }, {
      key: "getSecondLastKey",
      value: function getSecondLastKey() {
        var keysArr = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder];

        if (keysArr != null && keysArr.length > 1) {
          return keysArr[keysArr.length - 2];
        }

        return -1;
      }
    }, {
      key: "getLastKey",
      value: function getLastKey() {
        var keysLength = _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder].length;

        if (keysLength) {
          return _classPrivateFieldLooseBase(this, _keyOrder)[_keyOrder][keysLength - 1];
        }
      }
    }]);

    return LRUCache;
  }();

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

  var _logger = _classPrivateFieldLooseKey("logger");

  var _request = _classPrivateFieldLooseKey("request");

  var _device = _classPrivateFieldLooseKey("device");

  var _session = _classPrivateFieldLooseKey("session");

  var CleverTapAPI = /*#__PURE__*/function () {
    function CleverTapAPI(_ref) {
      var logger = _ref.logger,
          request = _ref.request,
          device = _ref.device,
          session = _ref.session;

      _classCallCheck(this, CleverTapAPI);

      Object.defineProperty(this, _logger, {
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
      _classPrivateFieldLooseBase(this, _logger)[_logger] = logger;
      _classPrivateFieldLooseBase(this, _request)[_request] = request;
      _classPrivateFieldLooseBase(this, _device)[_device] = device;
      _classPrivateFieldLooseBase(this, _session)[_session] = session;
    }

    _createClass(CleverTapAPI, [{
      key: "s",
      value: function s(global, session, resume, respNumber, optOutResponse) {
        // call back function used to store global and session ids for the user
        if (typeof respNumber === 'undefined') {
          respNumber = 0;
        }

        StorageManager$1.removeBackup(respNumber, _classPrivateFieldLooseBase(this, _logger)[_logger]);

        if (respNumber > $ct.globalCache.REQ_N) {
          // request for some other user so ignore
          return;
        }

        if (!isValueValid(_classPrivateFieldLooseBase(this, _device)[_device].gcookie) || resume || typeof optOutResponse === 'boolean') {
          if (!isValueValid(_classPrivateFieldLooseBase(this, _device)[_device].gcookie)) {
            // clear useIP meta prop
            StorageManager$1.getAndClearMetaProp(USEIP_KEY);
          }

          _classPrivateFieldLooseBase(this, _logger)[_logger].debug("Cookie was ".concat(_classPrivateFieldLooseBase(this, _device)[_device].gcookie, " set to ").concat(global));

          _classPrivateFieldLooseBase(this, _device)[_device].gcookie = global;

          if (global && StorageManager$1._isLocalStorageSupported()) {
            if ($ct.LRU_CACHE == null) {
              $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE);
            }

            var kIdFromLS = StorageManager$1.readFromLSorCookie(KCOOKIE_NAME);

            if (kIdFromLS != null && kIdFromLS.id && resume) {
              var guidFromLRUCache = $ct.LRU_CACHE.cache[kIdFromLS.id];

              if (!guidFromLRUCache) {
                StorageManager$1.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, true);
                $ct.LRU_CACHE.set(kIdFromLS.id, global);
              }
            }

            StorageManager$1.saveToLSorCookie(GCOOKIE_NAME, global);
            var lastK = $ct.LRU_CACHE.getSecondLastKey();

            if (StorageManager$1.readFromLSorCookie(FIRE_PUSH_UNREGISTERED) && lastK !== -1) {
              var lastGUID = $ct.LRU_CACHE.cache[lastK];

              _classPrivateFieldLooseBase(this, _request)[_request].unregisterTokenForGuid(lastGUID);
            }
          }

          StorageManager$1.createBroadCookie(GCOOKIE_NAME, global, COOKIE_EXPIRY, window.location.hostname);
          StorageManager$1.saveToLSorCookie(GCOOKIE_NAME, global);
        }

        if (resume) {
          $ct.blockRequest = false;

          _classPrivateFieldLooseBase(this, _logger)[_logger].debug('Resumed requests');
        }

        if (StorageManager$1._isLocalStorageSupported()) {
          _classPrivateFieldLooseBase(this, _session)[_session].manageSession(session);
        } // session cookie


        var obj = _classPrivateFieldLooseBase(this, _session)[_session].getSessionCookieObject(); // for the race-condition where two responses come back with different session ids. don't write the older session id.


        if (typeof obj.s === 'undefined' || obj.s <= session) {
          obj.s = session;
          obj.t = getNow(); // time of last response from server

          _classPrivateFieldLooseBase(this, _session)[_session].setSessionCookieObject(obj);
        }

        if (resume && !_classPrivateFieldLooseBase(this, _request)[_request].processingBackup) {
          _classPrivateFieldLooseBase(this, _request)[_request].processBackupEvents();
        }

        $ct.globalCache.RESP_N = respNumber;
      }
    }]);

    return CleverTapAPI;
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

        if (StorageManager$1._isLocalStorageSupported()) {
          var value = StorageManager$1.read(GCOOKIE_NAME);

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
                StorageManager$1.saveToLSorCookie(GCOOKIE_NAME, value);
              } else {
                _classPrivateFieldLooseBase(this, _logger$1)[_logger$1].error('Illegal guid ' + value);
              }
            } // Persist to cookie storage if not present there.


            if (isValueValid(guid)) {
              StorageManager$1.createBroadCookie(GCOOKIE_NAME, guid, COOKIE_EXPIRY, window.location.hostname);
            }
          }
        }

        if (!isValueValid(guid)) {
          guid = StorageManager$1.readCookie(GCOOKIE_NAME);

          if (isValueValid(guid) && (guid.indexOf('%') === 0 || guid.indexOf('\'') === 0 || guid.indexOf('"') === 0)) {
            guid = null;
          }

          if (isValueValid(guid)) {
            StorageManager$1.saveToLSorCookie(GCOOKIE_NAME, guid);
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
  var GENDER_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Gender value should be either M or F. ").concat(DATA_NOT_SENT_TEXT);
  var EMPLOYED_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Employed value should be either Y or N. ").concat(DATA_NOT_SENT_TEXT);
  var MARRIED_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Married value should be either Y or N. ").concat(DATA_NOT_SENT_TEXT);
  var EDUCATION_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Education value should be either School, College or Graduate. ").concat(DATA_NOT_SENT_TEXT);
  var AGE_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Age value should be a number. ").concat(DATA_NOT_SENT_TEXT);
  var DOB_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " DOB value should be a Date Object");
  var ENUM_FORMAT_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " setEnum(value). value should be a string or a number");
  var PHONE_FORMAT_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Phone number should be formatted as +[country code][number]");

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
          _globalChargedId = StorageManager$1.readFromLSorCookie(CHARGEDID_COOKIE_NAME);
        }

        if (typeof _globalChargedId !== 'undefined' && _globalChargedId.trim() === chargedId.trim()) {
          // drop event- duplicate charged id
          logger.error('Duplicate charged Id - Dropped' + chargedObj);
          return false;
        }

        _globalChargedId = chargedId;
        StorageManager$1.saveToLSorCookie(CHARGEDID_COOKIE_NAME, chargedId);
      }

      return true;
    } // if object (chargedObject)


    return false;
  };

  var _logger$2 = _classPrivateFieldLooseKey("logger");

  var _oldValues = _classPrivateFieldLooseKey("oldValues");

  var _request$1 = _classPrivateFieldLooseKey("request");

  var _isPersonalisationActive = _classPrivateFieldLooseKey("isPersonalisationActive");

  var _processEventArray = _classPrivateFieldLooseKey("processEventArray");

  var EventHandler = /*#__PURE__*/function (_Array) {
    _inherits(EventHandler, _Array);

    var _super = _createSuper(EventHandler);

    function EventHandler(_ref, values) {
      var _this;

      var logger = _ref.logger,
          request = _ref.request,
          isPersonalisationActive = _ref.isPersonalisationActive;

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
      Object.defineProperty(_assertThisInitialized(_this), _request$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _isPersonalisationActive, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _logger$2)[_logger$2] = logger;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _oldValues)[_oldValues] = values;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _request$1)[_request$1] = request;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _isPersonalisationActive)[_isPersonalisationActive] = isPersonalisationActive;
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
      key: "_processOldValues",
      value: function _processOldValues() {
        if (_classPrivateFieldLooseBase(this, _oldValues)[_oldValues]) {
          _classPrivateFieldLooseBase(this, _processEventArray)[_processEventArray](_classPrivateFieldLooseBase(this, _oldValues)[_oldValues]);
        }

        _classPrivateFieldLooseBase(this, _oldValues)[_oldValues] = null;
      }
    }, {
      key: "getDetails",
      value: function getDetails(evtName) {
        if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive)[_isPersonalisationActive]()) {
          return;
        }

        if (typeof $ct.globalEventsMap === 'undefined') {
          $ct.globalEventsMap = StorageManager$1.readFromLSorCookie(EV_COOKIE);
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
        }

        _classPrivateFieldLooseBase(this, _request$1)[_request$1].processEvent(data);
      }
    }
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
  var getHostName = function getHostName() {
    return window.location.hostname;
  };

  /* eslint-disable */
  var urlBase64ToUint8Array = function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var processedData = [];

    for (var i = 0; i < rawData.length; i++) {
      processedData.push(rawData.charCodeAt(i));
    }

    return new Uint8Array(processedData);
  };
  var compressData = function compressData(dataObject, logger) {
    logger && typeof logger.debug === 'function' && logger.debug('dobj:' + dataObject);
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

  var _fireRequest = _classPrivateFieldLooseKey("fireRequest");

  var _dropRequestDueToOptOut = _classPrivateFieldLooseKey("dropRequestDueToOptOut");

  var _addUseIPToRequest = _classPrivateFieldLooseKey("addUseIPToRequest");

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
      return addToURL(url, 'arp', compressData(JSON.stringify(_arp), this.logger));
    }

    if (StorageManager$1._isLocalStorageSupported() && typeof localStorage.getItem(ARP_COOKIE) !== 'undefined' && localStorage.getItem(ARP_COOKIE) !== null) {
      return addToURL(url, 'arp', compressData(JSON.stringify(StorageManager$1.readFromLSorCookie(ARP_COOKIE)), this.logger));
    }

    return url;
  };

  var _addUseIPToRequest2 = function _addUseIPToRequest2(pageLoadUrl) {
    var useIP = StorageManager$1.getMetaProp(USEIP_KEY);

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

  var _fireRequest2 = function _fireRequest2(url, tries, skipARP, sendOULFlag) {
    var _this = this,
        _window$clevertap,
        _window$wizrocket;

    if (_classPrivateFieldLooseBase(this, _dropRequestDueToOptOut)[_dropRequestDueToOptOut]()) {
      this.logger.debug('req dropped due to optout cookie: ' + this.device.gcookie);
      return;
    }

    if (!isValueValid(this.device.gcookie) && $ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1 && tries < MAX_TRIES) {
      setTimeout(function () {
        _this.logger.debug("retrying fire request for url: ".concat(url, ", tries: ").concat(tries));

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

    url = _classPrivateFieldLooseBase(this, _addUseIPToRequest)[_addUseIPToRequest](url);
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


    var ctCbScripts = document.getElementsByClassName('ct-jp-cb');

    while (ctCbScripts[0]) {
      ctCbScripts[0].parentNode.removeChild(ctCbScripts[0]);
    }

    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', url);
    s.setAttribute('class', 'ct-jp-cb');
    s.setAttribute('rel', 'nofollow');
    s.async = true;
    document.getElementsByTagName('head')[0].appendChild(s);
    this.logger.debug('req snt -> url: ' + url);
  };

  RequestDispatcher.logger = void 0;
  RequestDispatcher.device = void 0;
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

  // CleverTap specific utilities
  var getCampaignObject = function getCampaignObject() {
    var campObj = {};

    if (StorageManager$1._isLocalStorageSupported()) {
      campObj = StorageManager$1.read(CAMP_COOKIE_NAME);

      if (campObj != null) {
        campObj = JSON.parse(decodeURIComponent(campObj).replace(singleQuoteRegex, '\"'));
      } else {
        campObj = {};
      }
    }

    return campObj;
  };
  var saveCampaignObject = function saveCampaignObject(campaignObj) {
    if (StorageManager$1._isLocalStorageSupported()) {
      var campObj = JSON.stringify(campaignObj);
      StorageManager$1.save(CAMP_COOKIE_NAME, encodeURIComponent(campObj));
    }
  };
  var getCampaignObjForLc = function getCampaignObjForLc() {
    var campObj = {};

    if (StorageManager$1._isLocalStorageSupported()) {
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
  var isProfileValid = function isProfileValid(profileObj, _ref) {
    var logger = _ref.logger;
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
  var processFBUserObj = function processFBUserObj(user) {
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
  var processGPlusUserObj = function processGPlusUserObj(user, _ref2) {
    var logger = _ref2.logger;
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
  var addToLocalProfileMap = function addToLocalProfileMap(profileObj, override) {
    if (StorageManager$1._isLocalStorageSupported()) {
      if ($ct.globalProfileMap == null) {
        $ct.globalProfileMap = StorageManager$1.readFromLSorCookie(PR_COOKIE);

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

      StorageManager$1.saveToLSorCookie(PR_COOKIE, $ct.globalProfileMap);
    }
  };
  var closeIframe = function closeIframe(campaignId, divIdIgnored, currentSessionId) {
    if (campaignId != null && campaignId !== '-1') {
      if (StorageManager$1._isLocalStorageSupported()) {
        var campaignObj = getCampaignObject();
        var sessionCampaignObj = campaignObj[currentSessionId];

        if (sessionCampaignObj == null) {
          sessionCampaignObj = {};
          campaignObj[currentSessionId] = sessionCampaignObj;
        }

        sessionCampaignObj[campaignId] = 'dnd';
        saveCampaignObject(campaignObj);
      }
    }

    if ($ct.campaignDivMap != null) {
      var divId = $ct.campaignDivMap[campaignId];

      if (divId != null) {
        document.getElementById(divId).style.display = 'none';

        if (divId === 'intentPreview') {
          if (document.getElementById('intentOpacityDiv') != null) {
            document.getElementById('intentOpacityDiv').style.display = 'none';
          }
        }
      }
    }
  };
  var arp = function arp(jsonMap) {
    // For unregister calls dont set arp in LS
    if (jsonMap.skipResARP != null && jsonMap.skipResARP) {
      console.debug('Update ARP Request rejected', jsonMap);
      return null;
    }

    var isOULARP = !!(jsonMap[IS_OUL] != null && jsonMap[IS_OUL] === true);

    if (StorageManager$1._isLocalStorageSupported()) {
      try {
        var arpFromStorage = StorageManager$1.readFromLSorCookie(ARP_COOKIE);

        if (arpFromStorage == null || isOULARP) {
          arpFromStorage = {};
        }

        for (var key in jsonMap) {
          if (jsonMap.hasOwnProperty(key)) {
            if (jsonMap[key] === -1) {
              delete arpFromStorage[key];
            } else {
              arpFromStorage[key] = jsonMap[key];
            }
          }
        }

        StorageManager$1.saveToLSorCookie(ARP_COOKIE, arpFromStorage);
      } catch (e) {
        console.error('Unable to parse ARP JSON: ' + e);
      }
    }
  };
  var setEnum = function setEnum(enumVal, logger) {
    if (isString(enumVal) || isNumber(enumVal)) {
      return '$E_' + enumVal;
    }

    logger.error(ENUM_FORMAT_ERROR);
  };
  var handleEmailSubscription = function handleEmailSubscription(subscription, reEncoded, fetchGroups, account, logger) {
    var urlParamsAsIs = getURLParams(location.href); // can't use url_params as it is in lowercase above

    var encodedEmailId = urlParamsAsIs.e;
    var encodedProfileProps = urlParamsAsIs.p;

    if (typeof encodedEmailId !== 'undefined') {
      var data = {};
      data.id = account.id; // accountId

      data.unsubGroups = $ct.unsubGroups; // unsubscribe groups

      if ($ct.updatedCategoryLong) {
        data[categoryLongKey] = $ct.updatedCategoryLong;
      }

      var url = account.emailURL;

      if (fetchGroups) {
        url = addToURL(url, 'fetchGroups', fetchGroups);
      }

      if (reEncoded) {
        url = addToURL(url, 'encoded', reEncoded);
      }

      url = addToURL(url, 'e', encodedEmailId);
      url = addToURL(url, 'd', compressData(JSON.stringify(data), logger));

      if (encodedProfileProps) {
        url = addToURL(url, 'p', encodedProfileProps);
      }

      if (subscription !== '-1') {
        url = addToURL(url, 'sub', subscription);
      }

      RequestDispatcher.fireRequest(url);
    }
  };

  var _logger$3 = _classPrivateFieldLooseKey("logger");

  var _request$2 = _classPrivateFieldLooseKey("request");

  var _account = _classPrivateFieldLooseKey("account");

  var _oldValues$1 = _classPrivateFieldLooseKey("oldValues");

  var _isPersonalisationActive$1 = _classPrivateFieldLooseKey("isPersonalisationActive");

  var _processProfileArray = _classPrivateFieldLooseKey("processProfileArray");

  var ProfileHandler = /*#__PURE__*/function (_Array) {
    _inherits(ProfileHandler, _Array);

    var _super = _createSuper(ProfileHandler);

    function ProfileHandler(_ref, values) {
      var _this;

      var logger = _ref.logger,
          request = _ref.request,
          account = _ref.account,
          isPersonalisationActive = _ref.isPersonalisationActive;

      _classCallCheck(this, ProfileHandler);

      _this = _super.call(this);
      Object.defineProperty(_assertThisInitialized(_this), _processProfileArray, {
        value: _processProfileArray2
      });
      Object.defineProperty(_assertThisInitialized(_this), _logger$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _request$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _account, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _oldValues$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _isPersonalisationActive$1, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _logger$3)[_logger$3] = logger;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _request$2)[_request$2] = request;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _account)[_account] = account;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _oldValues$1)[_oldValues$1] = values;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _isPersonalisationActive$1)[_isPersonalisationActive$1] = isPersonalisationActive;
      return _this;
    }

    _createClass(ProfileHandler, [{
      key: "push",
      value: function push() {
        for (var _len = arguments.length, profilesArr = new Array(_len), _key = 0; _key < _len; _key++) {
          profilesArr[_key] = arguments[_key];
        }

        _classPrivateFieldLooseBase(this, _processProfileArray)[_processProfileArray](profilesArr);

        return 0;
      }
    }, {
      key: "_processOldValues",
      value: function _processOldValues() {
        if (_classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1]) {
          _classPrivateFieldLooseBase(this, _processProfileArray)[_processProfileArray](_classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1]);
        }

        _classPrivateFieldLooseBase(this, _oldValues$1)[_oldValues$1] = null;
      }
    }, {
      key: "getAttribute",
      value: function getAttribute(propName) {
        if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive$1)[_isPersonalisationActive$1]()) {
          return;
        }

        if ($ct.globalProfileMap == null) {
          $ct.globalProfileMap = StorageManager.readFromLSorCookie(PR_COOKIE);
        }

        if ($ct.globalProfileMap != null) {
          return $ct.globalProfileMap[propName];
        }
      }
    }]);

    return ProfileHandler;
  }( /*#__PURE__*/_wrapNativeSuper(Array));

  var _processProfileArray2 = function _processProfileArray2(profileArr) {
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
              logger: _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]
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

            if (!isObjectEmpty(GPlusProfileObj) && !GPlusProfileObj.error) {
              profileObj = processGPlusUserObj(GPlusProfileObj, {
                logger: _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]
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
            addToLocalProfileMap(profileObj, true);
            data = _classPrivateFieldLooseBase(this, _request$2)[_request$2].addSystemDataToObject(data, undefined);

            _classPrivateFieldLooseBase(this, _request$2)[_request$2].addFlags(data);

            var compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]);

            var pageLoadUrl = _classPrivateFieldLooseBase(this, _account)[_account].dataPostURL;

            pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH);
            pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData);

            _classPrivateFieldLooseBase(this, _request$2)[_request$2].saveAndFireRequest(pageLoadUrl, $ct.blockRequeust);
          }
        }
      }
    }
  };

  var _request$3 = _classPrivateFieldLooseKey("request");

  var _logger$4 = _classPrivateFieldLooseKey("logger");

  var _account$1 = _classPrivateFieldLooseKey("account");

  var _session$1 = _classPrivateFieldLooseKey("session");

  var _oldValues$2 = _classPrivateFieldLooseKey("oldValues");

  var _device$1 = _classPrivateFieldLooseKey("device");

  var _processOUL = _classPrivateFieldLooseKey("processOUL");

  var _handleCookieFromCache = _classPrivateFieldLooseKey("handleCookieFromCache");

  var _deleteUser = _classPrivateFieldLooseKey("deleteUser");

  var _processLoginArray = _classPrivateFieldLooseKey("processLoginArray");

  var UserLoginHandler = /*#__PURE__*/function (_Array) {
    _inherits(UserLoginHandler, _Array);

    var _super = _createSuper(UserLoginHandler);

    function UserLoginHandler(_ref, values) {
      var _this;

      var request = _ref.request,
          account = _ref.account,
          session = _ref.session,
          logger = _ref.logger,
          device = _ref.device;

      _classCallCheck(this, UserLoginHandler);

      _this = _super.call(this);
      Object.defineProperty(_assertThisInitialized(_this), _processLoginArray, {
        value: _processLoginArray2
      });
      Object.defineProperty(_assertThisInitialized(_this), _deleteUser, {
        value: _deleteUser2
      });
      Object.defineProperty(_assertThisInitialized(_this), _handleCookieFromCache, {
        value: _handleCookieFromCache2
      });
      Object.defineProperty(_assertThisInitialized(_this), _processOUL, {
        value: _processOUL2
      });
      Object.defineProperty(_assertThisInitialized(_this), _request$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _logger$4, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _account$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _session$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _oldValues$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _device$1, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _request$3)[_request$3] = request;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _account$1)[_account$1] = account;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _session$1)[_session$1] = session;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _logger$4)[_logger$4] = logger;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _oldValues$2)[_oldValues$2] = values;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _device$1)[_device$1] = device;
      return _this;
    }

    _createClass(UserLoginHandler, [{
      key: "clear",
      value: function clear() {
        _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].debug('clear called. Reset flag has been set.');

        _classPrivateFieldLooseBase(this, _deleteUser)[_deleteUser]();

        StorageManager$1.setMetaProp(CLEAR, true);
      }
    }, {
      key: "push",
      value: function push() {
        for (var _len = arguments.length, profilesArr = new Array(_len), _key = 0; _key < _len; _key++) {
          profilesArr[_key] = arguments[_key];
        }

        _classPrivateFieldLooseBase(this, _processLoginArray)[_processLoginArray](profilesArr);

        return 0;
      }
    }, {
      key: "_processOldValues",
      value: function _processOldValues() {
        if (_classPrivateFieldLooseBase(this, _oldValues$2)[_oldValues$2]) {
          _classPrivateFieldLooseBase(this, _processLoginArray)[_processLoginArray](_classPrivateFieldLooseBase(this, _oldValues$2)[_oldValues$2]);
        }

        _classPrivateFieldLooseBase(this, _oldValues$2)[_oldValues$2] = null;
      }
    }]);

    return UserLoginHandler;
  }( /*#__PURE__*/_wrapNativeSuper(Array));

  var _processOUL2 = function _processOUL2(profileArr) {
    var _this2 = this;

    var sendOULFlag = true;
    StorageManager$1.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag);

    var addToK = function addToK(ids) {
      var k = StorageManager$1.readFromLSorCookie(KCOOKIE_NAME);
      var g = StorageManager$1.readFromLSorCookie(GCOOKIE_NAME);
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

        if ($ct.LRU_CACHE == null && StorageManager$1._isLocalStorageSupported()) {
          $ct.LRU_CACHE = new LRUCache(LRU_CACHE_SIZE);
        }

        if (anonymousUser) {
          if (g != null) {
            $ct.LRU_CACHE.set(kId, g);
            $ct.blockRequeust = false;
          }
        } else {
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
            _classPrivateFieldLooseBase(_this2, _handleCookieFromCache)[_handleCookieFromCache]();
          } else {
            sendOULFlag = false;
            StorageManager$1.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, sendOULFlag);
          }

          var gFromCache = $ct.LRU_CACHE.get(kId);
          $ct.LRU_CACHE.set(kId, gFromCache);
          StorageManager$1.saveToLSorCookie(GCOOKIE_NAME, gFromCache);
          _classPrivateFieldLooseBase(_this2, _device$1)[_device$1].gcookie = gFromCache;
          var lastK = $ct.LRU_CACHE.getSecondLastKey();

          if (StorageManager$1.readFromLSorCookie(FIRE_PUSH_UNREGISTERED) && lastK !== -1) {
            // CACHED OLD USER FOUND. TRANSFER PUSH TOKEN TO THIS USER
            var lastGUID = $ct.LRU_CACHE.cache[lastK];

            _classPrivateFieldLooseBase(_this2, _request$3)[_request$3].unregisterTokenForGuid(lastGUID);
          }
        } else {
          if (!anonymousUser) {
            _this2.clear();
          } else {
            if (g != null) {
              _classPrivateFieldLooseBase(_this2, _device$1)[_device$1].gcookie = g;
              StorageManager$1.saveToLSorCookie(GCOOKIE_NAME, g);
              sendOULFlag = false;
            }
          }

          StorageManager$1.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false);
          kId = ids[0];
        }
      }

      k.id = kId;
      StorageManager$1.saveToLSorCookie(KCOOKIE_NAME, k);
    };

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
              logger: _classPrivateFieldLooseBase(this, _logger$4)[_logger$4]
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
                logger: _classPrivateFieldLooseBase(this, _logger$4)[_logger$4]
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

            if (StorageManager$1._isLocalStorageSupported()) {
              if (profileObj.Identity != null) {
                ids.push(profileObj.Identity);
              }

              if (profileObj.Email != null) {
                ids.push(profileObj.Email);
              }

              if (profileObj.GPID != null) {
                ids.push('GP:' + profileObj.GPID);
              }

              if (profileObj.FBID != null) {
                ids.push('FB:' + profileObj.FBID);
              }

              if (ids.length > 0) {
                addToK(ids);
              }
            }

            addToLocalProfileMap(profileObj, true);
            data = _classPrivateFieldLooseBase(this, _request$3)[_request$3].addSystemDataToObject(data, undefined);

            _classPrivateFieldLooseBase(this, _request$3)[_request$3].addFlags(data); // Adding 'isOUL' flag in true for OUL cases which.
            // This flag tells LC to create a new arp object.
            // Also we will receive the same flag in response arp which tells to delete existing arp object.


            if (sendOULFlag) {
              data[IS_OUL] = true;
            }

            var compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$4)[_logger$4]);

            var pageLoadUrl = _classPrivateFieldLooseBase(this, _account$1)[_account$1].dataPostURL;

            pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH);
            pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData); // Whenever sendOULFlag is true then dont send arp and gcookie (guid in memory in the request)
            // Also when this flag is set we will get another flag from LC in arp which tells us to delete arp
            // stored in the cache and replace it with the response arp.

            _classPrivateFieldLooseBase(this, _request$3)[_request$3].saveAndFireRequest(pageLoadUrl, $ct.blockRequeust, sendOULFlag);
          }
        }
      }
    }
  };

  var _handleCookieFromCache2 = function _handleCookieFromCache2() {
    $ct.blockRequeust = false;
    console.debug('Block request is false');

    if (StorageManager$1._isLocalStorageSupported()) {
      delete localStorage[PR_COOKIE];
      delete localStorage[EV_COOKIE];
      delete localStorage[META_COOKIE];
      delete localStorage[ARP_COOKIE];
      delete localStorage[CAMP_COOKIE_NAME];
      delete localStorage[CHARGEDID_COOKIE_NAME];
    }

    StorageManager$1.removeCookie(CAMP_COOKIE_NAME, getHostName());
    StorageManager$1.removeCookie(_classPrivateFieldLooseBase(this, _session$1)[_session$1].cookieName, $ct.broadDomain);
    StorageManager$1.removeCookie(ARP_COOKIE, $ct.broadDomain);

    _classPrivateFieldLooseBase(this, _session$1)[_session$1].setSessionCookieObject('');
  };

  var _deleteUser2 = function _deleteUser2() {
    $ct.blockRequeust = true;

    _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].debug('Block request is true');

    $ct.globalCache = {};

    if (StorageManager$1._isLocalStorageSupported()) {
      delete localStorage[GCOOKIE_NAME];
      delete localStorage[KCOOKIE_NAME];
      delete localStorage[PR_COOKIE];
      delete localStorage[EV_COOKIE];
      delete localStorage[META_COOKIE];
      delete localStorage[ARP_COOKIE];
      delete localStorage[CAMP_COOKIE_NAME];
      delete localStorage[CHARGEDID_COOKIE_NAME];
    }

    StorageManager$1.removeCookie(GCOOKIE_NAME, $ct.broadDomain);
    StorageManager$1.removeCookie(CAMP_COOKIE_NAME, getHostName());
    StorageManager$1.removeCookie(KCOOKIE_NAME, getHostName());
    StorageManager$1.removeCookie(_classPrivateFieldLooseBase(this, _session$1)[_session$1].cookieName, $ct.broadDomain);
    StorageManager$1.removeCookie(ARP_COOKIE, $ct.broadDomain);
    _classPrivateFieldLooseBase(this, _device$1)[_device$1].gcookie = null;

    _classPrivateFieldLooseBase(this, _session$1)[_session$1].setSessionCookieObject('');
  };

  var _processLoginArray2 = function _processLoginArray2(loginArr) {
    if (Array.isArray(loginArr) && loginArr.length > 0) {
      var profileObj = loginArr.pop();
      var processProfile = profileObj != null && isObject(profileObj) && (profileObj.Site != null && Object.keys(profileObj.Site).length > 0 || profileObj.Facebook != null && Object.keys(profileObj.Facebook).length > 0 || profileObj['Google Plus'] != null && Object.keys(profileObj['Google Plus']).length > 0);

      if (processProfile) {
        StorageManager$1.setInstantDeleteFlagInK();

        try {
          _classPrivateFieldLooseBase(this, _processOUL)[_processOUL]([profileObj]);
        } catch (e) {
          _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].debug(e);
        }
      } else {
        _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].error('Profile object is in incorrect format');
      }
    }
  };

  var _tr = function _tr(msg, _ref) {
    var device = _ref.device,
        session = _ref.session,
        request = _ref.request,
        logger = _ref.logger;
    var _device = device;
    var _session = session;
    var _request = request;
    var _logger = logger;
    var _wizCounter = 0; // Campaign House keeping

    var doCampHouseKeeping = function doCampHouseKeeping(targetingMsgJson) {
      var campaignId = targetingMsgJson.wzrk_id.split('_')[0];
      var today = getToday();

      var incrCount = function incrCount(obj, campaignId, excludeFromFreqCaps) {
        var currentCount = 0;
        var totalCount = 0;

        if (obj[campaignId] != null) {
          currentCount = obj[campaignId];
        }

        currentCount++;

        if (obj.tc != null) {
          totalCount = obj.tc;
        } // if exclude from caps then dont add to total counts


        if (excludeFromFreqCaps < 0) {
          totalCount++;
        }

        obj.tc = totalCount;
        obj[campaignId] = currentCount;
      };

      if (StorageManager$1._isLocalStorageSupported()) {
        delete sessionStorage[CAMP_COOKIE_NAME];
        var campObj = getCampaignObject(); // global session limit. default is 1

        if (targetingMsgJson[DISPLAY].wmc == null) {
          targetingMsgJson[DISPLAY].wmc = 1;
        }

        var excludeFromFreqCaps = -1;
        var campaignSessionLimit = -1;
        var campaignDailyLimit = -1;
        var campaignTotalLimit = -1;
        var totalDailyLimit = -1;
        var totalSessionLimit = -1;

        if (targetingMsgJson[DISPLAY].efc != null) {
          excludeFromFreqCaps = parseInt(targetingMsgJson[DISPLAY].efc, 10);
        }

        if (targetingMsgJson[DISPLAY].mdc != null) {
          campaignSessionLimit = parseInt(targetingMsgJson[DISPLAY].mdc, 10);
        }

        if (targetingMsgJson[DISPLAY].tdc != null) {
          campaignDailyLimit = parseInt(targetingMsgJson[DISPLAY].tdc, 10);
        }

        if (targetingMsgJson[DISPLAY].tlc != null) {
          campaignTotalLimit = parseInt(targetingMsgJson[DISPLAY].tlc, 10);
        }

        if (targetingMsgJson[DISPLAY].wmp != null) {
          totalDailyLimit = parseInt(targetingMsgJson[DISPLAY].wmp, 10);
        }

        if (targetingMsgJson[DISPLAY].wmc != null) {
          totalSessionLimit = parseInt(targetingMsgJson[DISPLAY].wmc, 10);
        } // session level capping


        var _sessionObj = campObj[_session.sessionId];

        if (_sessionObj) {
          var campaignSessionCount = _sessionObj[campaignId];
          var totalSessionCount = _sessionObj.tc; // dnd

          if (campaignSessionCount === 'dnd') {
            return false;
          } // session


          if (totalSessionLimit > 0 && totalSessionCount >= totalSessionLimit && excludeFromFreqCaps < 0) {
            return false;
          } // campaign session


          if (campaignSessionLimit > 0 && campaignSessionCount >= campaignSessionLimit) {
            return false;
          }
        } else {
          _sessionObj = {};
          campObj[_session.sessionId] = _sessionObj;
        } // daily level capping


        var dailyObj = campObj[today];

        if (dailyObj != null) {
          var campaignDailyCount = dailyObj[campaignId];
          var totalDailyCount = dailyObj.tc; // daily

          if (totalDailyLimit > 0 && totalDailyCount >= totalDailyLimit && excludeFromFreqCaps < 0) {
            return false;
          } // campaign daily


          if (campaignDailyLimit > 0 && campaignDailyCount >= campaignDailyLimit) {
            return false;
          }
        } else {
          dailyObj = {};
          campObj[today] = dailyObj;
        }

        var globalObj = campObj[GLOBAL];

        if (globalObj != null) {
          var campaignTotalCount = globalObj[campaignId]; // campaign total

          if (campaignTotalLimit > 0 && campaignTotalCount >= campaignTotalLimit) {
            return false;
          }
        } else {
          globalObj = {};
          campObj[GLOBAL] = globalObj;
        }
      } // delay


      if (targetingMsgJson[DISPLAY].delay != null && targetingMsgJson[DISPLAY].delay > 0) {
        var delay = targetingMsgJson[DISPLAY].delay;
        targetingMsgJson[DISPLAY].delay = 0;
        setTimeout(_tr, delay * 1000, msg, {
          device: _device,
          session: _session,
          request: _request,
          logger: _logger
        });
        return false;
      }

      var sessionObj = _session.getSessionCookieObject();

      incrCount(sessionObj, campaignId, excludeFromFreqCaps);
      incrCount(dailyObj, campaignId, excludeFromFreqCaps);
      incrCount(globalObj, campaignId, excludeFromFreqCaps); // get ride of stale sessions and day entries

      var newCampObj = {};
      newCampObj[_session.sessionId] = sessionObj;
      newCampObj[today] = dailyObj;
      newCampObj[GLOBAL] = globalObj;
      saveCampaignObject(newCampObj);
    };

    var getCookieParams = function getCookieParams() {
      var gcookie = _device.getGuid();

      var scookieObj = _session.getSessionCookieObject();

      return '&t=wc&d=' + encodeURIComponent(compressToBase64(gcookie + '|' + scookieObj.p + '|' + scookieObj.s));
    };

    var setupClickEvent = function setupClickEvent(onClick, targetingMsgJson, contentDiv, divId, isLegacy) {
      if (onClick !== '' && onClick != null) {
        var ctaElement;
        var jsCTAElements;

        if (isLegacy) {
          ctaElement = contentDiv;
        } else if (contentDiv !== null) {
          jsCTAElements = contentDiv.getElementsByClassName('jsCT_CTA');

          if (jsCTAElements != null && jsCTAElements.length === 1) {
            ctaElement = jsCTAElements[0];
          }
        }

        var jsFunc = targetingMsgJson.display.jsFunc;
        var isPreview = targetingMsgJson.display.preview;

        if (isPreview == null) {
          onClick += getCookieParams();
        }

        if (ctaElement != null) {
          ctaElement.onclick = function () {
            // invoke js function call
            if (jsFunc != null) {
              // track notification clicked event
              if (isPreview == null) {
                RequestDispatcher.fireRequest(onClick);
              }

              invokeExternalJs(jsFunc, targetingMsgJson); // close iframe. using -1 for no campaignId

              closeIframe('-1', divId, _session.sessionId);
              return;
            } // pass on the gcookie|page|scookieId for capturing the click event


            if (targetingMsgJson.display.window === 1) {
              window.open(onClick, '_blank');
            } else {
              window.location = onClick;
            }
          };
        }
      }
    };

    var invokeExternalJs = function invokeExternalJs(jsFunc, targetingMsgJson) {
      var func = window.parent[jsFunc];

      if (typeof func === 'function') {
        if (targetingMsgJson.display.kv != null) {
          func(targetingMsgJson.display.kv);
        } else {
          func();
        }
      }
    };

    var setupClickUrl = function setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, isLegacy) {
      incrementImpression(targetingMsgJson);
      setupClickEvent(onClick, targetingMsgJson, contentDiv, divId, isLegacy);
    };

    var incrementImpression = function incrementImpression(targetingMsgJson) {
      var data = {};
      data.type = 'event';
      data.evtName = NOTIFICATION_VIEWED;
      data.evtData = _defineProperty({}, WZRK_ID, targetingMsgJson.wzrk_id);

      _request.processEvent(data);
    };

    var renderPersonalisationBanner = function renderPersonalisationBanner(targetingMsgJson) {
      var divId = targetingMsgJson.display.divId;

      if (document.getElementById(divId) == null) {
        return;
      }

      var onClick = targetingMsgJson.display.onClick;
      var iframe = document.createElement('iframe');
      iframe.frameborder = '0px';
      iframe.marginheight = '0px';
      iframe.marginwidth = '0px';
      iframe.id = 'wiz-iframe';
      var html = targetingMsgJson.msgContent.html;
      iframe.setAttribute('style', targetingMsgJson.display.iFrameStyle);
      document.getElementById(divId).appendChild(iframe);
      var ifrm = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.document ? iframe.contentDocument.document : iframe.contentDocument;
      var doc = ifrm.document;
      doc.open();
      doc.write(html);
      doc.close();
      var contentDiv = document.getElementById('wiz-iframe').contentDocument.getElementById('contentDiv');
      setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, false);
    };

    var renderFooterNotification = function renderFooterNotification(targetingMsgJson) {
      var campaignId = targetingMsgJson.wzrk_id.split('_')[0];
      var displayObj = targetingMsgJson.display;

      if (displayObj.wtarget_type === 2) {
        // Logic for kv pair data
        if (targetingMsgJson.msgContent.type === 1) {
          var inaObj = {};
          inaObj.msgId = targetingMsgJson.wzrk_id;

          if (targetingMsgJson.wzrk_pivot) {
            inaObj.pivotId = targetingMsgJson.wzrk_pivot;
          }

          if (targetingMsgJson.msgContent.kv != null) {
            inaObj.kv = targetingMsgJson.msgContent.kv;
          }

          var kvPairsEvent = new CustomEvent('CT_web_personalization', {
            detail: inaObj
          });
          document.dispatchEvent(kvPairsEvent);
          return;
        } // Logic for personalisation banner / carousel


        if (targetingMsgJson.msgContent.type === 2 || targetingMsgJson.msgContent.type === 3) {
          return renderPersonalisationBanner(targetingMsgJson);
        }
      }

      if (displayObj.layout === 1) {
        return showExitIntent(undefined, targetingMsgJson);
      }

      if (doCampHouseKeeping(targetingMsgJson) === false) {
        return;
      }

      var divId = 'wizParDiv' + displayObj.layout;

      if (document.getElementById(divId) != null) {
        return;
      }

      $ct.campaignDivMap[campaignId] = divId;
      var isBanner = displayObj.layout === 2;
      var msgDiv = document.createElement('div');
      msgDiv.id = divId;
      var viewHeight = window.innerHeight;
      var viewWidth = window.innerWidth;
      var legacy = false;

      if (!isBanner) {
        var marginBottom = viewHeight * 5 / 100;
        var contentHeight = 10;
        var right = viewWidth * 5 / 100;
        var bottomPosition = contentHeight + marginBottom;
        var width = viewWidth * 30 / 100 + 20;
        var widthPerct = 'width:30%;'; // for small devices  - mobile phones

        if ((/mobile/i.test(navigator.userAgent) || /mini/i.test(navigator.userAgent)) && /iPad/i.test(navigator.userAgent) === false) {
          width = viewWidth * 85 / 100 + 20;
          right = viewWidth * 5 / 100;
          bottomPosition = viewHeight * 5 / 100;
          widthPerct = 'width:80%;'; // medium devices - tablets
        } else if ('ontouchstart' in window || /tablet/i.test(navigator.userAgent)) {
          width = viewWidth * 50 / 100 + 20;
          right = viewWidth * 5 / 100;
          bottomPosition = viewHeight * 5 / 100;
          widthPerct = 'width:50%;';
        } // legacy footer notif


        if (displayObj.proto == null) {
          legacy = true;
          msgDiv.setAttribute('style', 'display:block;overflow:hidden; bottom:' + bottomPosition + 'px !important;width:' + width + 'px !important;right:' + right + 'px !important;position:fixed;z-index:2147483647;');
        } else {
          msgDiv.setAttribute('style', widthPerct + displayObj.iFrameStyle);
        }
      } else {
        msgDiv.setAttribute('style', displayObj.iFrameStyle);
      }

      document.body.appendChild(msgDiv);
      var iframe = document.createElement('iframe');
      var borderRadius = displayObj.br === false ? '0' : '8';
      iframe.frameborder = '0px';
      iframe.marginheight = '0px';
      iframe.marginwidth = '0px';
      iframe.scrolling = 'no';
      iframe.id = 'wiz-iframe';
      var onClick = targetingMsgJson.display.onClick;
      var pointerCss = '';

      if (onClick !== '' && onClick != null) {
        pointerCss = 'cursor:pointer;';
      }

      var html; // direct html

      if (targetingMsgJson.msgContent.type === 1) {
        html = targetingMsgJson.msgContent.html;
        html = html.replace(/##campaignId##/g, campaignId);
      } else {
        var css = '' + '<style type="text/css">' + 'body{margin:0;padding:0;}' + '#contentDiv.wzrk{overflow:hidden;padding:0;text-align:center;' + pointerCss + '}' + '#contentDiv.wzrk td{padding:15px 10px;}' + '.wzrkPPtitle{font-weight: bold;font-size: 16px;font-family:arial;padding-bottom:10px;word-break: break-word;}' + '.wzrkPPdscr{font-size: 14px;font-family:arial;line-height:16px;word-break: break-word;display:inline-block;}' + '.PL15{padding-left:15px;}' + '.wzrkPPwarp{margin:20px 20px 0 5px;padding:0px;border-radius: ' + borderRadius + 'px;box-shadow: 1px 1px 5px #888888;}' + 'a.wzrkClose{cursor:pointer;position: absolute;top: 11px;right: 11px;z-index: 2147483647;font-size:19px;font-family:arial;font-weight:bold;text-decoration: none;width: 25px;/*height: 25px;*/text-align: center; -webkit-appearance: none; line-height: 25px;' + 'background: #353535;border: #fff 2px solid;border-radius: 100%;box-shadow: #777 2px 2px 2px;color:#fff;}' + 'a:hover.wzrkClose{background-color:#d1914a !important;color:#fff !important; -webkit-appearance: none;}' + 'td{vertical-align:top;}' + 'td.imgTd{border-top-left-radius:8px;border-bottom-left-radius:8px;}' + '</style>';
        var bgColor, textColor, btnBg, leftTd, btColor;

        if (targetingMsgJson.display.theme === 'dark') {
          bgColor = '#2d2d2e';
          textColor = '#eaeaea';
          btnBg = '#353535';
          leftTd = '#353535';
          btColor = '#ffffff';
        } else {
          bgColor = '#ffffff';
          textColor = '#000000';
          leftTd = '#f4f4f4';
          btnBg = '#a5a6a6';
          btColor = '#ffffff';
        }

        var titleText = targetingMsgJson.msgContent.title;
        var descriptionText = targetingMsgJson.msgContent.description;
        var imageTd = '';

        if (targetingMsgJson.msgContent.imageUrl != null && targetingMsgJson.msgContent.imageUrl !== '') {
          imageTd = "<td class='imgTd' style='background-color:" + leftTd + "'><img src='" + targetingMsgJson.msgContent.imageUrl + "' height='60' width='60'></td>";
        }

        var onClickStr = 'parent.$WZRK_WR.closeIframe(' + campaignId + ",'" + divId + "');";
        var title = "<div class='wzrkPPwarp' style='color:" + textColor + ';background-color:' + bgColor + ";'>" + "<a href='javascript:void(0);' onclick=" + onClickStr + " class='wzrkClose' style='background-color:" + btnBg + ';color:' + btColor + "'>&times;</a>" + "<div id='contentDiv' class='wzrk'>" + "<table cellpadding='0' cellspacing='0' border='0'>" + // "<tr><td colspan='2'></td></tr>"+
        '<tr>' + imageTd + "<td style='vertical-align:top;'>" + "<div class='wzrkPPtitle' style='color:" + textColor + "'>" + titleText + '</div>';
        var body = "<div class='wzrkPPdscr' style='color:" + textColor + "'>" + descriptionText + '<div></td></tr></table></div>';
        html = css + title + body;
      }

      iframe.setAttribute('style', 'z-index: 2147483647; display:block; width: 100% !important; border:0px !important; border-color:none !important;');
      msgDiv.appendChild(iframe);
      var ifrm = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.document ? iframe.contentDocument.document : iframe.contentDocument;
      var doc = ifrm.document;
      doc.open();
      doc.write(html);
      doc.close();

      var adjustIFrameHeight = function adjustIFrameHeight() {
        // adjust iframe and body height of html inside correctly
        contentHeight = document.getElementById('wiz-iframe').contentDocument.getElementById('contentDiv').scrollHeight;

        if (displayObj['custom-editor'] !== true && !isBanner) {
          contentHeight += 25;
        }

        document.getElementById('wiz-iframe').contentDocument.body.style.margin = '0px';
        document.getElementById('wiz-iframe').style.height = contentHeight + 'px';
      };

      var ua = navigator.userAgent.toLowerCase();

      if (ua.indexOf('safari') !== -1) {
        if (ua.indexOf('chrome') > -1) {
          iframe.onload = function () {
            adjustIFrameHeight();
            var contentDiv = document.getElementById('wiz-iframe').contentDocument.getElementById('contentDiv');
            setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, legacy);
          };
        } else {
          var inDoc = iframe.contentDocument || iframe.contentWindow;
          if (inDoc.document) inDoc = inDoc.document; // safari iphone 7+ needs this.

          adjustIFrameHeight();

          var _timer = setInterval(function () {
            if (inDoc.readyState === 'complete') {
              clearInterval(_timer); // adjust iframe and body height of html inside correctly

              adjustIFrameHeight();
              var contentDiv = document.getElementById('wiz-iframe').contentDocument.getElementById('contentDiv');
              setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, legacy);
            }
          }, 10);
        }
      } else {
        iframe.onload = function () {
          // adjust iframe and body height of html inside correctly
          adjustIFrameHeight();
          var contentDiv = document.getElementById('wiz-iframe').contentDocument.getElementById('contentDiv');
          setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, legacy);
        };
      }
    };

    var _callBackCalled = false;

    var showFooterNotification = function showFooterNotification(targetingMsgJson) {
      var onClick = targetingMsgJson.display.onClick; // TODO: Needs wizrocket as a global variable

      if (window.clevertap.hasOwnProperty('notificationCallback') && typeof window.clevertap.notificationCallback !== 'undefined' && typeof window.clevertap.notificationCallback === 'function') {
        var notificationCallback = window.clevertap.notificationCallback;

        if (!_callBackCalled) {
          var inaObj = {};
          inaObj.msgContent = targetingMsgJson.msgContent;
          inaObj.msgId = targetingMsgJson.wzrk_id;

          if (targetingMsgJson.wzrk_pivot) {
            inaObj.pivotId = targetingMsgJson.wzrk_pivot;
          }

          if (targetingMsgJson.display.kv != null) {
            inaObj.kv = targetingMsgJson.display.kv;
          }

          window.clevertap.raiseNotificationClicked = function () {
            if (onClick !== '' && onClick != null) {
              var jsFunc = targetingMsgJson.display.jsFunc;
              onClick += getCookieParams(); // invoke js function call

              if (jsFunc != null) {
                // track notification clicked event
                RequestDispatcher.fireRequest(onClick);
                invokeExternalJs(jsFunc, targetingMsgJson);
                return;
              } // pass on the gcookie|page|scookieId for capturing the click event


              if (targetingMsgJson.display.window === 1) {
                window.open(onClick, '_blank');
              } else {
                window.location = onClick;
              }
            }
          };

          window.clevertap.raiseNotificationViewed = function () {
            incrementImpression(targetingMsgJson);
          };

          notificationCallback(inaObj);
          _callBackCalled = true;
        }
      } else {
        window.clevertap.popupCurrentWzrkId = targetingMsgJson.wzrk_id;
        renderFooterNotification(targetingMsgJson);

        if (window.clevertap.hasOwnProperty('popupCallbacks') && typeof window.clevertap.popupCallbacks !== 'undefined' && typeof window.clevertap.popupCallbacks[targetingMsgJson.wzrk_id] === 'function') {
          var popupCallback = window.clevertap.popupCallbacks[targetingMsgJson.wzrk_id];
          var _inaObj = {};
          _inaObj.msgContent = targetingMsgJson.msgContent;
          _inaObj.msgId = targetingMsgJson.wzrk_id;

          if (targetingMsgJson.wzrk_pivot) {
            _inaObj.pivotId = targetingMsgJson.wzrk_pivot;
          }

          var msgCTkv = [];

          for (var wzrkPrefixKey in targetingMsgJson) {
            // ADD WZRK PREFIX KEY VALUE PAIRS
            if (wzrkPrefixKey.startsWith(WZRK_PREFIX) && wzrkPrefixKey !== WZRK_ID) {
              var wzrkJson = _defineProperty({}, wzrkPrefixKey, targetingMsgJson[wzrkPrefixKey]);

              msgCTkv.push(wzrkJson);
            }
          }

          if (msgCTkv.length > 0) {
            _inaObj.msgCTkv = msgCTkv;
          }

          if (targetingMsgJson.display.kv != null) {
            _inaObj.kv = targetingMsgJson.display.kv;
          } // PUBLIC API TO RECORD CLICKED EVENT


          window.clevertap.raisePopupNotificationClicked = function (notificationData) {
            if (!notificationData || !notificationData.msgId) {
              return;
            }

            var eventData = {};
            eventData.type = 'event';
            eventData.evtName = NOTIFICATION_CLICKED;
            eventData.evtData = _defineProperty({}, WZRK_ID, notificationData.msgId);

            if (targetingMsgJson.wzrk_pivot) {
              eventData.evtData = _objectSpread2(_objectSpread2({}, eventData.evtData), {}, {
                wzrk_pivot: notificationData.pivotId
              });
            } // WZRK PREFIX KEY VALUE PAIRS


            if (notificationData.msgCTkv) {
              var _iterator = _createForOfIteratorHelper(notificationData.msgCTkv),
                  _step;

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var wzrkPrefixObj = _step.value;
                  eventData.evtData = _objectSpread2(_objectSpread2({}, eventData.evtData), wzrkPrefixObj);
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            }

            _request.processEvent(eventData);
          };

          popupCallback(_inaObj);
        }
      }
    };

    var exitintentObj;

    var showExitIntent = function showExitIntent(event, targetObj) {
      var targetingMsgJson;

      if (event != null && event.clientY > 0) {
        return;
      }

      if (targetObj == null) {
        targetingMsgJson = exitintentObj;
      } else {
        targetingMsgJson = targetObj;
      }

      if (document.getElementById('intentPreview') != null) {
        return;
      } // dont show exit intent on tablet/mobile - only on desktop


      if (targetingMsgJson.display.layout == null && (/mobile/i.test(navigator.userAgent) || /mini/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent) || 'ontouchstart' in window || /tablet/i.test(navigator.userAgent))) {
        return;
      }

      var campaignId = targetingMsgJson.wzrk_id.split('_')[0];

      if (doCampHouseKeeping(targetingMsgJson) === false) {
        return;
      }

      $ct.campaignDivMap[campaignId] = 'intentPreview';
      var legacy = false;
      var opacityDiv = document.createElement('div');
      opacityDiv.id = 'intentOpacityDiv';
      opacityDiv.setAttribute('style', 'position: fixed;top: 0;bottom: 0;left: 0;width: 100%;height: 100%;z-index: 2147483646;background: rgba(0,0,0,0.7);');
      document.body.appendChild(opacityDiv);
      var msgDiv = document.createElement('div');
      msgDiv.id = 'intentPreview';

      if (targetingMsgJson.display.proto == null) {
        legacy = true;
        msgDiv.setAttribute('style', 'display:block;overflow:hidden;top:55% !important;left:50% !important;position:fixed;z-index:2147483647;width:600px !important;height:600px !important;margin:-300px 0 0 -300px !important;');
      } else {
        msgDiv.setAttribute('style', targetingMsgJson.display.iFrameStyle);
      }

      document.body.appendChild(msgDiv);
      var iframe = document.createElement('iframe');
      var borderRadius = targetingMsgJson.display.br === false ? '0' : '8';
      iframe.frameborder = '0px';
      iframe.marginheight = '0px';
      iframe.marginwidth = '0px';
      iframe.scrolling = 'no';
      iframe.id = 'wiz-iframe-intent';
      var onClick = targetingMsgJson.display.onClick;
      var pointerCss = '';

      if (onClick !== '' && onClick != null) {
        pointerCss = 'cursor:pointer;';
      }

      var html; // direct html

      if (targetingMsgJson.msgContent.type === 1) {
        html = targetingMsgJson.msgContent.html;
        html = html.replace(/##campaignId##/g, campaignId);
      } else {
        var css = '' + '<style type="text/css">' + 'body{margin:0;padding:0;}' + '#contentDiv.wzrk{overflow:hidden;padding:0 0 20px 0;text-align:center;' + pointerCss + '}' + '#contentDiv.wzrk td{padding:15px 10px;}' + '.wzrkPPtitle{font-weight: bold;font-size: 24px;font-family:arial;word-break: break-word;padding-top:20px;}' + '.wzrkPPdscr{font-size: 14px;font-family:arial;line-height:16px;word-break: break-word;display:inline-block;padding:20px 20px 0 20px;line-height:20px;}' + '.PL15{padding-left:15px;}' + '.wzrkPPwarp{margin:20px 20px 0 5px;padding:0px;border-radius: ' + borderRadius + 'px;box-shadow: 1px 1px 5px #888888;}' + 'a.wzrkClose{cursor:pointer;position: absolute;top: 11px;right: 11px;z-index: 2147483647;font-size:19px;font-family:arial;font-weight:bold;text-decoration: none;width: 25px;/*height: 25px;*/text-align: center; -webkit-appearance: none; line-height: 25px;' + 'background: #353535;border: #fff 2px solid;border-radius: 100%;box-shadow: #777 2px 2px 2px;color:#fff;}' + 'a:hover.wzrkClose{background-color:#d1914a !important;color:#fff !important; -webkit-appearance: none;}' + '#contentDiv .button{padding-top:20px;}' + '#contentDiv .button a{font-size: 14px;font-weight:bold;font-family:arial;text-align:center;display:inline-block;text-decoration:none;padding:0 30px;height:40px;line-height:40px;background:#ea693b;color:#fff;border-radius:4px;-webkit-border-radius:4px;-moz-border-radius:4px;}' + '</style>';
        var bgColor, textColor, btnBg, btColor;

        if (targetingMsgJson.display.theme === 'dark') {
          bgColor = '#2d2d2e';
          textColor = '#eaeaea';
          btnBg = '#353535';
          btColor = '#ffffff';
        } else {
          bgColor = '#ffffff';
          textColor = '#000000';
          btnBg = '#a5a6a6';
          btColor = '#ffffff';
        }

        var titleText = targetingMsgJson.msgContent.title;
        var descriptionText = targetingMsgJson.msgContent.description;
        var ctaText = '';

        if (targetingMsgJson.msgContent.ctaText != null && targetingMsgJson.msgContent.ctaText !== '') {
          ctaText = "<div class='button'><a href='#'>" + targetingMsgJson.msgContent.ctaText + '</a></div>';
        }

        var imageTd = '';

        if (targetingMsgJson.msgContent.imageUrl != null && targetingMsgJson.msgContent.imageUrl !== '') {
          imageTd = "<div style='padding-top:20px;'><img src='" + targetingMsgJson.msgContent.imageUrl + "' width='500' alt=" + titleText + ' /></div>';
        }

        var onClickStr = 'parent.$WZRK_WR.closeIframe(' + campaignId + ",'intentPreview');";
        var title = "<div class='wzrkPPwarp' style='color:" + textColor + ';background-color:' + bgColor + ";'>" + "<a href='javascript:void(0);' onclick=" + onClickStr + " class='wzrkClose' style='background-color:" + btnBg + ';color:' + btColor + "'>&times;</a>" + "<div id='contentDiv' class='wzrk'>" + "<div class='wzrkPPtitle' style='color:" + textColor + "'>" + titleText + '</div>';
        var body = "<div class='wzrkPPdscr' style='color:" + textColor + "'>" + descriptionText + '</div>' + imageTd + ctaText + '</div></div>';
        html = css + title + body;
      }

      iframe.setAttribute('style', 'z-index: 2147483647; display:block; height: 100% !important; width: 100% !important;min-height:80px !important;border:0px !important; border-color:none !important;');
      msgDiv.appendChild(iframe);
      var ifrm = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.document ? iframe.contentDocument.document : iframe.contentDocument;
      var doc = ifrm.document;
      doc.open();
      doc.write(html);
      doc.close();
      var contentDiv = document.getElementById('wiz-iframe-intent').contentDocument.getElementById('contentDiv');
      setupClickUrl(onClick, targetingMsgJson, contentDiv, 'intentPreview', legacy);
    };

    if (!document.body) {
      if (_wizCounter < 6) {
        _wizCounter++;
        setTimeout(_tr, 1000, msg, {
          device: _device,
          session: _session,
          request: _request,
          logger: _logger
        });
      }

      return;
    }

    if (msg.inapp_notifs != null) {
      for (var index = 0; index < msg.inapp_notifs.length; index++) {
        var targetNotif = msg.inapp_notifs[index];

        if (targetNotif.display.wtarget_type == null || targetNotif.display.wtarget_type === 0 || targetNotif.display.wtarget_type === 2) {
          showFooterNotification(targetNotif);
        } else if (targetNotif.display.wtarget_type === 1) {
          // if display['wtarget_type']==1 then exit intent
          exitintentObj = targetNotif;
          window.document.body.onmouseleave = showExitIntent;
        }
      }
    }

    var mergeEventMap = function mergeEventMap(newEvtMap) {
      if ($ct.globalEventsMap == null) {
        $ct.globalEventsMap = StorageManager$1.readFromLSorCookie(EV_COOKIE);

        if ($ct.globalEventsMap == null) {
          $ct.globalEventsMap = newEvtMap;
          return;
        }
      }

      for (var key in newEvtMap) {
        if (newEvtMap.hasOwnProperty(key)) {
          var oldEvtObj = $ct.globalEventsMap[key];
          var newEvtObj = newEvtMap[key];

          if ($ct.globalEventsMap[key] != null) {
            if (newEvtObj[0] != null && newEvtObj[0] > oldEvtObj[0]) {
              $ct.globalEventsMap[key] = newEvtObj;
            }
          } else {
            $ct.globalEventsMap[key] = newEvtObj;
          }
        }
      }
    };

    if (StorageManager$1._isLocalStorageSupported()) {
      try {
        if (msg.evpr != null) {
          var eventsMap = msg.evpr.events;
          var profileMap = msg.evpr.profile;
          var syncExpiry = msg.evpr.expires_in;
          var now = getNow();
          StorageManager$1.setMetaProp('lsTime', now);
          StorageManager$1.setMetaProp('exTs', syncExpiry);
          mergeEventMap(eventsMap);
          StorageManager$1.saveToLSorCookie(EV_COOKIE, $ct.globalEventsMap);

          if ($ct.globalProfileMap == null) {
            addToLocalProfileMap(profileMap, true);
          } else {
            addToLocalProfileMap(profileMap, false);
          }
        }

        if (msg.arp != null) {
          arp(msg.arp);
        }

        if (msg.inapp_stale != null) {
          var campObj = getCampaignObject();
          var globalObj = campObj.global;

          if (globalObj != null) {
            for (var idx in msg.inapp_stale) {
              if (msg.inapp_stale.hasOwnProperty(idx)) {
                delete globalObj[msg.inapp_stale[idx]];
              }
            }
          }

          saveCampaignObject(campObj);
        }
      } catch (e) {
        _logger.error('Unable to persist evrp/arp: ' + e);
      }
    }
  };

  var _isPersonalisationActive$2 = _classPrivateFieldLooseKey("isPersonalisationActive");

  var User = /*#__PURE__*/function () {
    function User(_ref) {
      var isPersonalisationActive = _ref.isPersonalisationActive;

      _classCallCheck(this, User);

      Object.defineProperty(this, _isPersonalisationActive$2, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _isPersonalisationActive$2)[_isPersonalisationActive$2] = isPersonalisationActive;
    }

    _createClass(User, [{
      key: "getTotalVisits",
      value: function getTotalVisits() {
        if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive$2)[_isPersonalisationActive$2]()) {
          return;
        }

        var visitCount = StorageManager$1.getMetaProp('sc');

        if (visitCount == null) {
          visitCount = 1;
        }

        return visitCount;
      }
    }, {
      key: "getLastVisit",
      value: function getLastVisit() {
        if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive$2)[_isPersonalisationActive$2]()) {
          return;
        }

        var prevSession = StorageManager$1.getMetaProp('ps');

        if (prevSession != null) {
          return new Date(prevSession * 1000);
        }
      }
    }]);

    return User;
  }();

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

  var _logger$5 = _classPrivateFieldLooseKey("logger");

  var _sessionId = _classPrivateFieldLooseKey("sessionId");

  var _isPersonalisationActive$3 = _classPrivateFieldLooseKey("isPersonalisationActive");

  var SessionManager = /*#__PURE__*/function () {
    // SCOOKIE_NAME
    function SessionManager(_ref) {
      var logger = _ref.logger,
          isPersonalisationActive = _ref.isPersonalisationActive;

      _classCallCheck(this, SessionManager);

      Object.defineProperty(this, _logger$5, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _sessionId, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isPersonalisationActive$3, {
        writable: true,
        value: void 0
      });
      this.cookieName = void 0;
      this.scookieObj = void 0;
      this.sessionId = StorageManager$1.getMetaProp('cs');
      _classPrivateFieldLooseBase(this, _logger$5)[_logger$5] = logger;
      _classPrivateFieldLooseBase(this, _isPersonalisationActive$3)[_isPersonalisationActive$3] = isPersonalisationActive;
    }

    _createClass(SessionManager, [{
      key: "getSessionCookieObject",
      value: function getSessionCookieObject() {
        var scookieStr = StorageManager$1.readCookie(this.cookieName);
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
        StorageManager$1.createBroadCookie(this.cookieName, objStr, SCOOKIE_EXP_TIME_IN_SECS, getHostName());
      }
    }, {
      key: "manageSession",
      value: function manageSession(session) {
        // first time. check if current session id in localstorage is same
        // if not same then prev = current and current = this new session
        if (typeof this.sessionId === 'undefined' || this.sessionId !== session) {
          var currentSessionInLS = StorageManager$1.getMetaProp('cs'); // if sessionId in meta is undefined - set current to both

          if (typeof currentSessionInLS === 'undefined') {
            StorageManager$1.setMetaProp('ps', session);
            StorageManager$1.setMetaProp('cs', session);
            StorageManager$1.setMetaProp('sc', 1);
          } else if (currentSessionInLS !== session) {
            // not same as session in local storage. new session
            StorageManager$1.setMetaProp('ps', currentSessionInLS);
            StorageManager$1.setMetaProp('cs', session);
            var sessionCount = StorageManager$1.getMetaProp('sc');

            if (typeof sessionCount === 'undefined') {
              sessionCount = 0;
            }

            StorageManager$1.setMetaProp('sc', sessionCount + 1);
          }

          this.sessionId = session;
        }
      }
    }, {
      key: "getTimeElapsed",
      value: function getTimeElapsed() {
        if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive$3)[_isPersonalisationActive$3]()) {
          return;
        }

        if (this.scookieObj != null) {
          // TODO: check logic?
          this.scookieObj = this.getSessionCookieObject();
        }

        var sessionStart = this.scookieObj.s;

        if (sessionStart != null) {
          var ts = getNow();
          return Math.floor(ts - sessionStart);
        }
      }
    }, {
      key: "getPageCount",
      value: function getPageCount() {
        if (!_classPrivateFieldLooseBase(this, _isPersonalisationActive$3)[_isPersonalisationActive$3]()) {
          return;
        }

        if (this.scookieObj != null) {
          // TODO: check logic
          this.scookieObj = this.getSessionCookieObject();
        }

        return this.scookieObj.p;
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

  var seqNo = 0;
  var requestTime = 0;

  var _logger$6 = _classPrivateFieldLooseKey("logger");

  var _account$2 = _classPrivateFieldLooseKey("account");

  var _device$2 = _classPrivateFieldLooseKey("device");

  var _session$2 = _classPrivateFieldLooseKey("session");

  var _isPersonalisationActive$4 = _classPrivateFieldLooseKey("isPersonalisationActive");

  var _clearCookie = _classPrivateFieldLooseKey("clearCookie");

  var _addToLocalEventMap = _classPrivateFieldLooseKey("addToLocalEventMap");

  var RequestManager = /*#__PURE__*/function () {
    function RequestManager(_ref) {
      var logger = _ref.logger,
          account = _ref.account,
          device = _ref.device,
          session = _ref.session,
          isPersonalisationActive = _ref.isPersonalisationActive;

      _classCallCheck(this, RequestManager);

      Object.defineProperty(this, _addToLocalEventMap, {
        value: _addToLocalEventMap2
      });
      Object.defineProperty(this, _logger$6, {
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
      Object.defineProperty(this, _isPersonalisationActive$4, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _clearCookie, {
        writable: true,
        value: false
      });
      this.processingBackup = false;
      _classPrivateFieldLooseBase(this, _logger$6)[_logger$6] = logger;
      _classPrivateFieldLooseBase(this, _account$2)[_account$2] = account;
      _classPrivateFieldLooseBase(this, _device$2)[_device$2] = device;
      _classPrivateFieldLooseBase(this, _session$2)[_session$2] = session;
      _classPrivateFieldLooseBase(this, _isPersonalisationActive$4)[_isPersonalisationActive$4] = isPersonalisationActive;
      RequestDispatcher.logger = logger;
      RequestDispatcher.device = device;
    }

    _createClass(RequestManager, [{
      key: "processBackupEvents",
      value: function processBackupEvents() {
        var backupMap = StorageManager$1.readFromLSorCookie(LCOOKIE_NAME);

        if (typeof backupMap === 'undefined' || backupMap === null) {
          return;
        }

        this.processingBackup = true;

        for (var idx in backupMap) {
          if (backupMap.hasOwnProperty(idx)) {
            var backupEvent = backupMap[idx];

            if (typeof backupEvent.fired === 'undefined') {
              _classPrivateFieldLooseBase(this, _logger$6)[_logger$6].debug('Processing backup event : ' + backupEvent.q);

              if (typeof backupEvent.q !== 'undefined') {
                RequestDispatcher.fireRequest(backupEvent.q);
              }

              backupEvent.fired = true;
            }
          }
        }

        StorageManager$1.saveToLSorCookie(LCOOKIE_NAME, backupMap);
        this.processingBackup = false;
      }
    }, {
      key: "addSystemDataToObject",
      value: function addSystemDataToObject(dataObject, ignoreTrim) {
        // ignore trim for chrome notifications; undefined everywhere else
        if (typeof ignoreTrim === 'undefined') {
          dataObject = removeUnsupportedChars(dataObject, _classPrivateFieldLooseBase(this, _logger$6)[_logger$6]);
        }

        if (!isObjectEmpty(_classPrivateFieldLooseBase(this, _logger$6)[_logger$6].wzrkError)) {
          dataObject.wzrk_error = _classPrivateFieldLooseBase(this, _logger$6)[_logger$6].wzrkError;
          _classPrivateFieldLooseBase(this, _logger$6)[_logger$6].wzrkError = {};
        }

        dataObject.id = _classPrivateFieldLooseBase(this, _account$2)[_account$2].id;

        if (isValueValid(_classPrivateFieldLooseBase(this, _device$2)[_device$2].gcookie)) {
          dataObject.g = _classPrivateFieldLooseBase(this, _device$2)[_device$2].gcookie;
        }

        var obj = _classPrivateFieldLooseBase(this, _session$2)[_session$2].getSessionCookieObject();

        dataObject.s = obj.s; // session cookie

        dataObject.pg = typeof obj.p === 'undefined' ? 1 : obj.p; // Page count

        return dataObject;
      }
    }, {
      key: "addFlags",
      value: function addFlags(data) {
        // check if cookie should be cleared.
        _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] = StorageManager$1.getAndClearMetaProp(CLEAR);

        if (_classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] !== undefined && _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie]) {
          data.rc = true;

          _classPrivateFieldLooseBase(this, _logger$6)[_logger$6].debug('reset cookie sent in request and cleared from meta for future requests.');
        }

        if (_classPrivateFieldLooseBase(this, _isPersonalisationActive$4)[_isPersonalisationActive$4]()) {
          var lastSyncTime = StorageManager$1.getMetaProp('lsTime');
          var expirySeconds = StorageManager$1.getMetaProp('exTs'); // dsync not found in local storage - get data from server

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
        url = addToURL(url, 'rn', ++$ct.globalCache.REQ_N);
        var data = url + '&i=' + now + '&sn=' + seqNo;
        StorageManager$1.backupEvent(data, $ct.globalCache.REQ_N, _classPrivateFieldLooseBase(this, _logger$6)[_logger$6]);

        if (!$ct.blockRequest || override || _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] !== undefined && _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie]) {
          if (now === requestTime) {
            seqNo++;
          } else {
            requestTime = now;
            seqNo = 0;
          }

          RequestDispatcher.fireRequest(data, false, sendOULFlag);
        } else {
          _classPrivateFieldLooseBase(this, _logger$6)[_logger$6].debug("Not fired due to block request - ".concat($ct.blockRequest, " or clearCookie - ").concat(_classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie]));
        }
      }
    }, {
      key: "unregisterTokenForGuid",
      value: function unregisterTokenForGuid(givenGUID) {
        var data = {};
        data.type = 'data';

        if (isValueValid(givenGUID)) {
          data.g = givenGUID;
        }

        data.action = 'unregister';
        data.id = _classPrivateFieldLooseBase(this, _account$2)[_account$2].id;

        var obj = _classPrivateFieldLooseBase(this, _session$2)[_session$2].getSessionCookieObject();

        data.s = obj.s; // session cookie

        var compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$6)[_logger$6]);

        var pageLoadUrl = _classPrivateFieldLooseBase(this, _account$2)[_account$2].dataPostURL;

        pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data');
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData);
        StorageManager$1.saveToLSorCookie(FIRE_PUSH_UNREGISTERED, false);
        RequestDispatcher.fireRequest(pageLoadUrl, true); // REGISTER TOKEN

        var payload = StorageManager$1.readFromLSorCookie(PUSH_SUBSCRIPTION_DATA);
        this.registerToken(payload);
      }
    }, {
      key: "registerToken",
      value: function registerToken(payload) {
        if (!payload) return;
        payload = this.addSystemDataToObject(payload, true);
        payload = JSON.stringify(payload);

        var pageLoadUrl = _classPrivateFieldLooseBase(this, _account$2)[_account$2].dataPostURL;

        pageLoadUrl = addToURL(pageLoadUrl, 'type', 'data');
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(payload, _classPrivateFieldLooseBase(this, _logger$6)[_logger$6]));
        RequestDispatcher.fireRequest(pageLoadUrl); // set in localstorage

        StorageManager$1.save(WEBPUSH_LS_KEY, 'ok');
      }
    }, {
      key: "processEvent",
      value: function processEvent(data) {
        _classPrivateFieldLooseBase(this, _addToLocalEventMap)[_addToLocalEventMap](data.evtName);

        data = this.addSystemDataToObject(data, undefined);
        this.addFlags(data);
        data[CAMP_COOKIE_NAME] = getCampaignObjForLc();
        var compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$6)[_logger$6]);

        var pageLoadUrl = _classPrivateFieldLooseBase(this, _account$2)[_account$2].dataPostURL;

        pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH);
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData);
        this.saveAndFireRequest(pageLoadUrl, false);
      }
    }]);

    return RequestManager;
  }();

  var _addToLocalEventMap2 = function _addToLocalEventMap2(evtName) {
    if (StorageManager$1._isLocalStorageSupported()) {
      if (typeof $ct.globalEventsMap === 'undefined') {
        $ct.globalEventsMap = StorageManager$1.readFromLSorCookie(EV_COOKIE);

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
      StorageManager$1.saveToLSorCookie(EV_COOKIE, $ct.globalEventsMap);
    }
  };

  var _request$4 = _classPrivateFieldLooseKey("request");

  var _account$3 = _classPrivateFieldLooseKey("account");

  var _oldValues$3 = _classPrivateFieldLooseKey("oldValues");

  var _logger$7 = _classPrivateFieldLooseKey("logger");

  var _processPrivacyArray = _classPrivateFieldLooseKey("processPrivacyArray");

  var Privacy = /*#__PURE__*/function (_Array) {
    _inherits(Privacy, _Array);

    var _super = _createSuper(Privacy);

    function Privacy(_ref, values) {
      var _this;

      var request = _ref.request,
          account = _ref.account,
          logger = _ref.logger;

      _classCallCheck(this, Privacy);

      _this = _super.call(this);
      Object.defineProperty(_assertThisInitialized(_this), _processPrivacyArray, {
        value: _processPrivacyArray2
      });
      Object.defineProperty(_assertThisInitialized(_this), _request$4, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _account$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _oldValues$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _logger$7, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _logger$7)[_logger$7] = logger;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _request$4)[_request$4] = request;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _account$3)[_account$3] = account;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _oldValues$3)[_oldValues$3] = values;
      return _this;
    }

    _createClass(Privacy, [{
      key: "push",
      value: function push() {
        for (var _len = arguments.length, privacyArr = new Array(_len), _key = 0; _key < _len; _key++) {
          privacyArr[_key] = arguments[_key];
        }

        _classPrivateFieldLooseBase(this, _processPrivacyArray)[_processPrivacyArray](privacyArr);

        return 0;
      }
    }, {
      key: "_processOldValues",
      value: function _processOldValues() {
        if (_classPrivateFieldLooseBase(this, _oldValues$3)[_oldValues$3]) {
          _classPrivateFieldLooseBase(this, _processPrivacyArray)[_processPrivacyArray](_classPrivateFieldLooseBase(this, _oldValues$3)[_oldValues$3]);
        }

        _classPrivateFieldLooseBase(this, _oldValues$3)[_oldValues$3] = null;
      }
    }]);

    return Privacy;
  }( /*#__PURE__*/_wrapNativeSuper(Array));

  var _processPrivacyArray2 = function _processPrivacyArray2(privacyArr) {
    if (Array.isArray(privacyArr) && privacyArr.length > 0) {
      var privacyObj = privacyArr[0];
      var data = {};
      var profileObj = {};
      var optOut = false;

      if (privacyObj.hasOwnProperty(OPTOUT_KEY)) {
        optOut = privacyObj[OPTOUT_KEY];

        if (typeof optOut === 'boolean') {
          profileObj[CT_OPTOUT_KEY] = optOut; // should be true when user wants to opt in

          $ct.isOptInRequest = !optOut;
        }
      }

      if (privacyObj.hasOwnProperty(USEIP_KEY)) {
        var useIP = privacyObj[USEIP_KEY];
        var shouldUseIP = typeof useIP === 'boolean' ? useIP : false;
        StorageManager$1.setMetaProp(USEIP_KEY, shouldUseIP);
      }

      if (!isObjectEmpty(profileObj)) {
        data.type = 'profile';
        data.profile = profileObj;
        data = _classPrivateFieldLooseBase(this, _request$4)[_request$4].addSystemDataToObject(data, undefined);
        var compressedData = compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$7)[_logger$7]);

        var pageLoadUrl = _classPrivateFieldLooseBase(this, _account$3)[_account$3].dataPostURL;

        pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PUSH);
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressedData);
        pageLoadUrl = addToURL(pageLoadUrl, OPTOUT_KEY, optOut ? 'true' : 'false');

        _classPrivateFieldLooseBase(this, _request$4)[_request$4].saveAndFireRequest(pageLoadUrl, $ct.blockRequeust);
      }
    }
  };

  var _oldValues$4 = _classPrivateFieldLooseKey("oldValues");

  var _logger$8 = _classPrivateFieldLooseKey("logger");

  var _request$5 = _classPrivateFieldLooseKey("request");

  var _account$4 = _classPrivateFieldLooseKey("account");

  var _wizAlertJSPath = _classPrivateFieldLooseKey("wizAlertJSPath");

  var _fcmPublicKey = _classPrivateFieldLooseKey("fcmPublicKey");

  var _setUpWebPush = _classPrivateFieldLooseKey("setUpWebPush");

  var _setUpWebPushNotifications = _classPrivateFieldLooseKey("setUpWebPushNotifications");

  var _setApplicationServerKey = _classPrivateFieldLooseKey("setApplicationServerKey");

  var _setUpSafariNotifications = _classPrivateFieldLooseKey("setUpSafariNotifications");

  var _setUpChromeFirefoxNotifications = _classPrivateFieldLooseKey("setUpChromeFirefoxNotifications");

  var _addWizAlertJS = _classPrivateFieldLooseKey("addWizAlertJS");

  var _removeWizAlertJS = _classPrivateFieldLooseKey("removeWizAlertJS");

  var _handleNotificationRegistration = _classPrivateFieldLooseKey("handleNotificationRegistration");

  var NotificationHandler = /*#__PURE__*/function (_Array) {
    _inherits(NotificationHandler, _Array);

    var _super = _createSuper(NotificationHandler);

    function NotificationHandler(_ref, values) {
      var _this;

      var logger = _ref.logger,
          session = _ref.session,
          request = _ref.request,
          account = _ref.account;

      _classCallCheck(this, NotificationHandler);

      _this = _super.call(this);
      Object.defineProperty(_assertThisInitialized(_this), _handleNotificationRegistration, {
        value: _handleNotificationRegistration2
      });
      Object.defineProperty(_assertThisInitialized(_this), _removeWizAlertJS, {
        value: _removeWizAlertJS2
      });
      Object.defineProperty(_assertThisInitialized(_this), _addWizAlertJS, {
        value: _addWizAlertJS2
      });
      Object.defineProperty(_assertThisInitialized(_this), _setUpChromeFirefoxNotifications, {
        value: _setUpChromeFirefoxNotifications2
      });
      Object.defineProperty(_assertThisInitialized(_this), _setUpSafariNotifications, {
        value: _setUpSafariNotifications2
      });
      Object.defineProperty(_assertThisInitialized(_this), _setApplicationServerKey, {
        value: _setApplicationServerKey2
      });
      Object.defineProperty(_assertThisInitialized(_this), _setUpWebPushNotifications, {
        value: _setUpWebPushNotifications2
      });
      Object.defineProperty(_assertThisInitialized(_this), _setUpWebPush, {
        value: _setUpWebPush2
      });
      Object.defineProperty(_assertThisInitialized(_this), _oldValues$4, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _logger$8, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _request$5, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _account$4, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _wizAlertJSPath, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this), _fcmPublicKey, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _wizAlertJSPath)[_wizAlertJSPath] = 'https://d2r1yp2w7bby2u.cloudfront.net/js/wzrk_dialog.min.js';
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _fcmPublicKey)[_fcmPublicKey] = null;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _oldValues$4)[_oldValues$4] = values;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _logger$8)[_logger$8] = logger;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _request$5)[_request$5] = request;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _account$4)[_account$4] = account;
      return _this;
    }

    _createClass(NotificationHandler, [{
      key: "push",
      value: function push() {
        for (var _len = arguments.length, displayArgs = new Array(_len), _key = 0; _key < _len; _key++) {
          displayArgs[_key] = arguments[_key];
        }

        _classPrivateFieldLooseBase(this, _setUpWebPush)[_setUpWebPush](displayArgs);

        return 0;
      }
    }, {
      key: "_processOldValues",
      value: function _processOldValues() {
        if (_classPrivateFieldLooseBase(this, _oldValues$4)[_oldValues$4]) {
          _classPrivateFieldLooseBase(this, _setUpWebPush)[_setUpWebPush](_classPrivateFieldLooseBase(this, _oldValues$4)[_oldValues$4]);
        }

        _classPrivateFieldLooseBase(this, _oldValues$4)[_oldValues$4] = null;
      }
    }, {
      key: "_enableWebPush",
      value: function _enableWebPush(enabled, applicationServerKey) {
        $ct.webPushEnabled = enabled;

        if (applicationServerKey != null) {
          _classPrivateFieldLooseBase(this, _setApplicationServerKey)[_setApplicationServerKey](applicationServerKey);
        }

        if ($ct.webPushEnabled && $ct.notifApi.notifEnabledFromApi) {
          _classPrivateFieldLooseBase(this, _handleNotificationRegistration)[_handleNotificationRegistration]($ct.notifApi.displayArgs);
        } else if (!$ct.webPushEnabled && $ct.notifApi.notifEnabledFromApi) {
          _classPrivateFieldLooseBase(this, _logger$8)[_logger$8].error('Ensure that web push notifications are fully enabled and integrated before requesting them');
        }
      }
    }]);

    return NotificationHandler;
  }( /*#__PURE__*/_wrapNativeSuper(Array));

  var _setUpWebPush2 = function _setUpWebPush2(displayArgs) {
    if ($ct.webPushEnabled && displayArgs.length > 0) {
      _classPrivateFieldLooseBase(this, _handleNotificationRegistration)[_handleNotificationRegistration](displayArgs);
    } else if ($ct.webPushEnabled == null && displayArgs.length > 0) {
      $ct.notifApi.notifEnabledFromApi = true;
      $ct.notifApi.displayArgs = displayArgs.slice();
    } else if ($ct.webPushEnabled === false && displayArgs.length > 0) {
      _classPrivateFieldLooseBase(this, _logger$8)[_logger$8].error('Make sure push notifications are fully enabled and integrated');
    }
  };

  var _setUpWebPushNotifications2 = function _setUpWebPushNotifications2(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsServiceUrl) {
    if (navigator.userAgent.indexOf('Chrome') !== -1 || navigator.userAgent.indexOf('Firefox') !== -1) {
      _classPrivateFieldLooseBase(this, _setUpChromeFirefoxNotifications)[_setUpChromeFirefoxNotifications](subscriptionCallback, serviceWorkerPath);
    } else if (navigator.userAgent.indexOf('Safari') !== -1) {
      _classPrivateFieldLooseBase(this, _setUpSafariNotifications)[_setUpSafariNotifications](subscriptionCallback, apnsWebPushId, apnsServiceUrl);
    }
  };

  var _setApplicationServerKey2 = function _setApplicationServerKey2(applicationServerKey) {
    _classPrivateFieldLooseBase(this, _fcmPublicKey)[_fcmPublicKey] = applicationServerKey;
  };

  var _setUpSafariNotifications2 = function _setUpSafariNotifications2(subscriptionCallback, apnsWebPushId, apnsServiceUrl) {
    var _this2 = this;

    // ensure that proper arguments are passed
    if (typeof apnsWebPushId === 'undefined') {
      _classPrivateFieldLooseBase(this, _logger$8)[_logger$8].error('Ensure that APNS Web Push ID is supplied');
    }

    if (typeof apnsServiceUrl === 'undefined') {
      _classPrivateFieldLooseBase(this, _logger$8)[_logger$8].error('Ensure that APNS Web Push service path is supplied');
    }

    if ('safari' in window && 'pushNotification' in window.safari) {
      window.safari.pushNotification.requestPermission(apnsServiceUrl, apnsWebPushId, {}, function (subscription) {
        if (subscription.permission === 'granted') {
          var subscriptionData = JSON.parse(JSON.stringify(subscription));
          subscriptionData.endpoint = subscription.deviceToken;
          subscriptionData.browser = 'Safari';
          StorageManager$1.saveToLSorCookie(PUSH_SUBSCRIPTION_DATA, subscriptionData);

          _classPrivateFieldLooseBase(_this2, _request$5)[_request$5].registerToken(subscriptionData);

          _classPrivateFieldLooseBase(_this2, _logger$8)[_logger$8].info('Safari Web Push registered. Device Token: ' + subscription.deviceToken);
        } else if (subscription.permission === 'denied') {
          _classPrivateFieldLooseBase(_this2, _logger$8)[_logger$8].info('Error subscribing to Safari web push');
        }
      });
    }
  };

  var _setUpChromeFirefoxNotifications2 = function _setUpChromeFirefoxNotifications2(subscriptionCallback, serviceWorkerPath) {
    var _this3 = this;

    var registrationScope = '';

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(serviceWorkerPath).then(function (registration) {
        if (typeof __wzrk_account_id !== 'undefined') {
          // eslint-disable-line
          // shopify accounts , since the service worker is not at root, serviceWorker.ready is never resolved.
          // hence add a timeout and hope serviceWroker is ready within that time.
          return new Promise(function (resolve) {
            return setTimeout(function () {
              return resolve(registration);
            }, 5000);
          });
        }

        registrationScope = registration.scope; // IF SERVICE WORKER IS AT ROOT, RETURN THE READY PROMISE
        // ELSE IF CHROME RETURN PROMISE AFTER 5 SECONDS
        // OR getRegistrations PROMISE IF ITS FIREFOX

        var rootDirRegex = /^(\.?)(\/?)([^/]*).js$/;
        var isServiceWorkerAtRoot = rootDirRegex.test(serviceWorkerPath);

        if (isServiceWorkerAtRoot) {
          return navigator.serviceWorker.ready;
        } else {
          if (navigator.userAgent.indexOf('Chrome') !== -1) {
            return new Promise(function (resolve) {
              return setTimeout(function () {
                return resolve(registration);
              }, 5000);
            });
          } else {
            return navigator.serviceWorker.getRegistrations();
          }
        }
      }).then(function (serviceWorkerRegistration) {
        // ITS AN ARRAY IN CASE OF FIREFOX, SO USE THE REGISTRATION WITH PROPER SCOPE
        if (navigator.userAgent.indexOf('Firefox') !== -1 && Array.isArray(serviceWorkerRegistration)) {
          serviceWorkerRegistration = serviceWorkerRegistration.filter(function (i) {
            return i.scope === registrationScope;
          })[0];
        }

        var subscribeObj = {
          userVisibleOnly: true
        };

        if (_classPrivateFieldLooseBase(_this3, _fcmPublicKey)[_fcmPublicKey] != null) {
          subscribeObj.applicationServerKey = urlBase64ToUint8Array(_classPrivateFieldLooseBase(_this3, _fcmPublicKey)[_fcmPublicKey]);
        }

        serviceWorkerRegistration.pushManager.subscribe(subscribeObj).then(function (subscription) {
          _classPrivateFieldLooseBase(_this3, _logger$8)[_logger$8].info('Service Worker registered. Endpoint: ' + subscription.endpoint); // convert the subscription keys to strings; this sets it up nicely for pushing to LC


          var subscriptionData = JSON.parse(JSON.stringify(subscription)); // remove the common chrome/firefox endpoint at the beginning of the token

          if (navigator.userAgent.indexOf('Chrome') !== -1) {
            subscriptionData.endpoint = subscriptionData.endpoint.split('/').pop();
            subscriptionData.browser = 'Chrome';
          } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
            subscriptionData.endpoint = subscriptionData.endpoint.split('/').pop();
            subscriptionData.browser = 'Firefox';
          }

          StorageManager$1.saveToLSorCookie(PUSH_SUBSCRIPTION_DATA, subscriptionData); // var shouldSendToken = typeof sessionObj['p'] === STRING_CONSTANTS.UNDEFINED || sessionObj['p'] === 1

          {
            _classPrivateFieldLooseBase(_this3, _request$5)[_request$5].registerToken(subscriptionData);
          }

          if (typeof subscriptionCallback !== 'undefined' && typeof subscriptionCallback === 'function') {
            subscriptionCallback();
          }
        }).catch(function (error) {
          _classPrivateFieldLooseBase(_this3, _logger$8)[_logger$8].error('Error subscribing: ' + error); // unsubscribe from webpush if error


          serviceWorkerRegistration.pushManager.getSubscription().then(function (subscription) {
            if (subscription !== null) {
              subscription.unsubscribe().then(function (successful) {
                // You've successfully unsubscribed
                _classPrivateFieldLooseBase(_this3, _logger$8)[_logger$8].info('Unsubscription successful');
              }).catch(function (e) {
                // Unsubscription failed
                _classPrivateFieldLooseBase(_this3, _logger$8)[_logger$8].error('Error unsubscribing: ' + e);
              });
            }
          });
        });
      }).catch(function (err) {
        _classPrivateFieldLooseBase(_this3, _logger$8)[_logger$8].error('error registering service worker: ' + err);
      });
    }
  };

  var _addWizAlertJS2 = function _addWizAlertJS2() {
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('id', 'wzrk-alert-js');
    scriptTag.setAttribute('src', _classPrivateFieldLooseBase(this, _wizAlertJSPath)[_wizAlertJSPath]); // add the script tag to the end of the body

    document.getElementsByTagName('body')[0].appendChild(scriptTag);
    return scriptTag;
  };

  var _removeWizAlertJS2 = function _removeWizAlertJS2() {
    var scriptTag = document.getElementById('wzrk-alert-js');
    scriptTag.parentNode.removeChild(scriptTag);
  };

  var _handleNotificationRegistration2 = function _handleNotificationRegistration2(displayArgs) {
    var _this4 = this;

    // make sure everything is specified
    var titleText;
    var bodyText;
    var okButtonText;
    var rejectButtonText;
    var okButtonColor;
    var skipDialog;
    var askAgainTimeInSeconds;
    var okCallback;
    var rejectCallback;
    var subscriptionCallback;
    var hidePoweredByCT;
    var serviceWorkerPath;
    var httpsPopupPath;
    var httpsIframePath;
    var apnsWebPushId;
    var apnsWebPushServiceUrl;

    if (displayArgs.length === 1) {
      if (isObject(displayArgs[0])) {
        var notifObj = displayArgs[0];
        titleText = notifObj.titleText;
        bodyText = notifObj.bodyText;
        okButtonText = notifObj.okButtonText;
        rejectButtonText = notifObj.rejectButtonText;
        okButtonColor = notifObj.okButtonColor;
        skipDialog = notifObj.skipDialog;
        askAgainTimeInSeconds = notifObj.askAgainTimeInSeconds;
        okCallback = notifObj.okCallback;
        rejectCallback = notifObj.rejectCallback;
        subscriptionCallback = notifObj.subscriptionCallback;
        hidePoweredByCT = notifObj.hidePoweredByCT;
        serviceWorkerPath = notifObj.serviceWorkerPath;
        httpsPopupPath = notifObj.httpsPopupPath;
        httpsIframePath = notifObj.httpsIframePath;
        apnsWebPushId = notifObj.apnsWebPushId;
        apnsWebPushServiceUrl = notifObj.apnsWebPushServiceUrl;
      }
    } else {
      titleText = displayArgs[0];
      bodyText = displayArgs[1];
      okButtonText = displayArgs[2];
      rejectButtonText = displayArgs[3];
      okButtonColor = displayArgs[4];
      skipDialog = displayArgs[5];
      askAgainTimeInSeconds = displayArgs[6];
    }

    if (skipDialog == null) {
      skipDialog = false;
    }

    if (hidePoweredByCT == null) {
      hidePoweredByCT = false;
    }

    if (serviceWorkerPath == null) {
      serviceWorkerPath = '/clevertap_sw.js';
    } // ensure that the browser supports notifications


    if (typeof navigator.serviceWorker === 'undefined') {
      return;
    }

    var isHTTP = httpsPopupPath != null && httpsIframePath != null; // make sure the site is on https for chrome notifications

    if (window.location.protocol !== 'https:' && document.location.hostname !== 'localhost' && !isHTTP) {
      _classPrivateFieldLooseBase(this, _logger$8)[_logger$8].error('Make sure you are https or localhost to register for notifications');

      return;
    } // right now, we only support Chrome V50 & higher & Firefox


    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      var chromeAgent = navigator.userAgent.match(/Chrome\/(\d+)/);

      if (chromeAgent == null || parseInt(chromeAgent[1], 10) < 50) {
        return;
      }
    } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
      var firefoxAgent = navigator.userAgent.match(/Firefox\/(\d+)/);

      if (firefoxAgent == null || parseInt(firefoxAgent[1], 10) < 50) {
        return;
      }
    } else if (navigator.userAgent.indexOf('Safari') !== -1) {
      var safariAgent = navigator.userAgent.match(/Safari\/(\d+)/);

      if (safariAgent == null || parseInt(safariAgent[1], 10) < 50) {
        return;
      }
    } else {
      return;
    } // we check for the cookie in setUpChromeNotifications() the tokens may have changed


    if (!isHTTP) {
      if (Notification == null) {
        return;
      } // handle migrations from other services -> chrome notifications may have already been asked for before


      if (Notification.permission === 'granted') {
        // skip the dialog and register
        _classPrivateFieldLooseBase(this, _setUpWebPushNotifications)[_setUpWebPushNotifications](subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl);

        return;
      } else if (Notification.permission === 'denied') {
        // we've lost this profile :'(
        return;
      }

      if (skipDialog) {
        _classPrivateFieldLooseBase(this, _setUpWebPushNotifications)[_setUpWebPushNotifications](subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl);

        return;
      }
    } // make sure the right parameters are passed


    if (!titleText || !bodyText || !okButtonText || !rejectButtonText) {
      _classPrivateFieldLooseBase(this, _logger$8)[_logger$8].error('Missing input parameters; please specify title, body, ok button and cancel button text');

      return;
    } // make sure okButtonColor is formatted properly


    if (okButtonColor == null || !okButtonColor.match(/^#[a-f\d]{6}$/i)) {
      okButtonColor = '#f28046'; // default color for positive button
    } // make sure the user isn't asked for notifications more than askAgainTimeInSeconds


    var now = new Date().getTime() / 1000;

    if (StorageManager$1.getMetaProp('notif_last_time') == null) {
      StorageManager$1.setMetaProp('notif_last_time', now);
    } else {
      if (askAgainTimeInSeconds == null) {
        // 7 days by default
        askAgainTimeInSeconds = 7 * 24 * 60 * 60;
      }

      if (now - StorageManager$1.getMetaProp('notif_last_time') < askAgainTimeInSeconds) {
        return;
      } else {
        // continue asking
        StorageManager$1.setMetaProp('notif_last_time', now);
      }
    }

    if (isHTTP) {
      // add the https iframe
      var httpsIframe = document.createElement('iframe');
      httpsIframe.setAttribute('style', 'display:none;');
      httpsIframe.setAttribute('src', httpsIframePath);
      document.body.appendChild(httpsIframe);
      window.addEventListener('message', function (event) {
        if (event.data != null) {
          var obj = {};

          try {
            obj = JSON.parse(event.data);
          } catch (e) {
            // not a call from our iframe
            return;
          }

          if (obj.state != null) {
            if (obj.from === 'ct' && obj.state === 'not') {
              _classPrivateFieldLooseBase(_this4, _addWizAlertJS)[_addWizAlertJS]().onload = function () {
                // create our wizrocket popup
                window.wzrkPermissionPopup.wizAlert({
                  title: titleText,
                  body: bodyText,
                  confirmButtonText: okButtonText,
                  confirmButtonColor: okButtonColor,
                  rejectButtonText: rejectButtonText,
                  hidePoweredByCT: hidePoweredByCT
                }, function (enabled) {
                  // callback function
                  if (enabled) {
                    // the user accepted on the dialog box
                    if (typeof okCallback === 'function') {
                      okCallback();
                    } // redirect to popup.html


                    window.open(httpsPopupPath);
                  } else {
                    if (typeof rejectCallback === 'function') {
                      rejectCallback();
                    }
                  }

                  _classPrivateFieldLooseBase(_this4, _removeWizAlertJS)[_removeWizAlertJS]();
                });
              };
            }
          }
        }
      }, false);
    } else {
      _classPrivateFieldLooseBase(this, _addWizAlertJS)[_addWizAlertJS]().onload = function () {
        // create our wizrocket popup
        window.wzrkPermissionPopup.wizAlert({
          title: titleText,
          body: bodyText,
          confirmButtonText: okButtonText,
          confirmButtonColor: okButtonColor,
          rejectButtonText: rejectButtonText,
          hidePoweredByCT: hidePoweredByCT
        }, function (enabled) {
          // callback function
          if (enabled) {
            // the user accepted on the dialog box
            if (typeof okCallback === 'function') {
              okCallback();
            }

            _classPrivateFieldLooseBase(_this4, _setUpWebPushNotifications)[_setUpWebPushNotifications](subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl);
          } else {
            if (typeof rejectCallback === 'function') {
              rejectCallback();
            }
          }

          _classPrivateFieldLooseBase(_this4, _removeWizAlertJS)[_removeWizAlertJS]();
        });
      };
    }
  };

  var _logger$9 = _classPrivateFieldLooseKey("logger");

  var _api = _classPrivateFieldLooseKey("api");

  var _onloadcalled = _classPrivateFieldLooseKey("onloadcalled");

  var _device$3 = _classPrivateFieldLooseKey("device");

  var _session$3 = _classPrivateFieldLooseKey("session");

  var _account$5 = _classPrivateFieldLooseKey("account");

  var _request$6 = _classPrivateFieldLooseKey("request");

  var _isSpa = _classPrivateFieldLooseKey("isSpa");

  var _previousUrl = _classPrivateFieldLooseKey("previousUrl");

  var _boundCheckPageChanged = _classPrivateFieldLooseKey("boundCheckPageChanged");

  var _processOldValues = _classPrivateFieldLooseKey("processOldValues");

  var _checkPageChanged = _classPrivateFieldLooseKey("checkPageChanged");

  var _pingRequest = _classPrivateFieldLooseKey("pingRequest");

  var _isPingContinuous = _classPrivateFieldLooseKey("isPingContinuous");

  var _overrideDSyncFlag = _classPrivateFieldLooseKey("overrideDSyncFlag");

  var CleverTap = /*#__PURE__*/function () {
    _createClass(CleverTap, [{
      key: "spa",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _isSpa)[_isSpa];
      },
      set: function set(value) {
        var isSpa = value === true;

        if (_classPrivateFieldLooseBase(this, _isSpa)[_isSpa] !== isSpa && _classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] === 1) {
          // if clevertap.spa is changed after init has been called then update the click listeners
          if (isSpa) {
            document.addEventListener('click', _classPrivateFieldLooseBase(this, _boundCheckPageChanged)[_boundCheckPageChanged]);
          } else {
            document.removeEventListener('click', _classPrivateFieldLooseBase(this, _boundCheckPageChanged)[_boundCheckPageChanged]);
          }
        }

        _classPrivateFieldLooseBase(this, _isSpa)[_isSpa] = isSpa;
      }
    }]);

    function CleverTap() {
      var _clevertap$account,
          _clevertap$account2,
          _clevertap$account3,
          _this = this,
          _clevertap$account4;

      var clevertap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, CleverTap);

      Object.defineProperty(this, _overrideDSyncFlag, {
        value: _overrideDSyncFlag2
      });
      Object.defineProperty(this, _isPingContinuous, {
        value: _isPingContinuous2
      });
      Object.defineProperty(this, _pingRequest, {
        value: _pingRequest2
      });
      Object.defineProperty(this, _checkPageChanged, {
        value: _checkPageChanged2
      });
      Object.defineProperty(this, _processOldValues, {
        value: _processOldValues2
      });
      Object.defineProperty(this, _logger$9, {
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
      Object.defineProperty(this, _device$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _session$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _account$5, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _request$6, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isSpa, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _previousUrl, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _boundCheckPageChanged, {
        writable: true,
        value: _classPrivateFieldLooseBase(this, _checkPageChanged)[_checkPageChanged].bind(this)
      });
      this.enablePersonalization = void 0;
      this.popupCallbacks = {};
      this.popupCurrentWzrkId = '';
      _classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] = 0;
      this._isPersonalisationActive = this._isPersonalisationActive.bind(this);

      this.raiseNotificationClicked = function () {};

      _classPrivateFieldLooseBase(this, _logger$9)[_logger$9] = new Logger(logLevels.INFO);
      _classPrivateFieldLooseBase(this, _account$5)[_account$5] = new Account((_clevertap$account = clevertap.account) === null || _clevertap$account === void 0 ? void 0 : _clevertap$account[0], clevertap.region || ((_clevertap$account2 = clevertap.account) === null || _clevertap$account2 === void 0 ? void 0 : _clevertap$account2[1]), clevertap.targetDomain || ((_clevertap$account3 = clevertap.account) === null || _clevertap$account3 === void 0 ? void 0 : _clevertap$account3[2]));
      _classPrivateFieldLooseBase(this, _device$3)[_device$3] = new DeviceManager({
        logger: _classPrivateFieldLooseBase(this, _logger$9)[_logger$9]
      });
      _classPrivateFieldLooseBase(this, _session$3)[_session$3] = new SessionManager({
        logger: _classPrivateFieldLooseBase(this, _logger$9)[_logger$9],
        isPersonalisationActive: this._isPersonalisationActive
      });
      _classPrivateFieldLooseBase(this, _request$6)[_request$6] = new RequestManager({
        logger: _classPrivateFieldLooseBase(this, _logger$9)[_logger$9],
        account: _classPrivateFieldLooseBase(this, _account$5)[_account$5],
        device: _classPrivateFieldLooseBase(this, _device$3)[_device$3],
        session: _classPrivateFieldLooseBase(this, _session$3)[_session$3],
        isPersonalisationActive: this._isPersonalisationActive
      });
      this.enablePersonalization = clevertap.enablePersonalization || false;
      this.event = new EventHandler({
        logger: _classPrivateFieldLooseBase(this, _logger$9)[_logger$9],
        request: _classPrivateFieldLooseBase(this, _request$6)[_request$6],
        isPersonalisationActive: this._isPersonalisationActive
      }, clevertap.event);
      this.profile = new ProfileHandler({
        logger: _classPrivateFieldLooseBase(this, _logger$9)[_logger$9],
        request: _classPrivateFieldLooseBase(this, _request$6)[_request$6],
        account: _classPrivateFieldLooseBase(this, _account$5)[_account$5],
        isPersonalisationActive: this._isPersonalisationActive
      }, clevertap.profile);
      this.onUserLogin = new UserLoginHandler({
        request: _classPrivateFieldLooseBase(this, _request$6)[_request$6],
        account: _classPrivateFieldLooseBase(this, _account$5)[_account$5],
        session: _classPrivateFieldLooseBase(this, _session$3)[_session$3],
        logger: _classPrivateFieldLooseBase(this, _logger$9)[_logger$9],
        device: _classPrivateFieldLooseBase(this, _device$3)[_device$3]
      }, clevertap.onUserLogin);
      this.privacy = new Privacy({
        request: _classPrivateFieldLooseBase(this, _request$6)[_request$6],
        account: _classPrivateFieldLooseBase(this, _account$5)[_account$5],
        logger: _classPrivateFieldLooseBase(this, _logger$9)[_logger$9]
      }, clevertap.privacy);
      this.notifications = new NotificationHandler({
        logger: _classPrivateFieldLooseBase(this, _logger$9)[_logger$9],
        request: _classPrivateFieldLooseBase(this, _request$6)[_request$6],
        account: _classPrivateFieldLooseBase(this, _account$5)[_account$5]
      }, clevertap.notifications);
      _classPrivateFieldLooseBase(this, _api)[_api] = new CleverTapAPI({
        logger: _classPrivateFieldLooseBase(this, _logger$9)[_logger$9],
        request: _classPrivateFieldLooseBase(this, _request$6)[_request$6],
        device: _classPrivateFieldLooseBase(this, _device$3)[_device$3],
        session: _classPrivateFieldLooseBase(this, _session$3)[_session$3]
      });
      this.spa = clevertap.spa;
      this.user = new User({
        isPersonalisationActive: this._isPersonalisationActive
      });
      this.session = {
        getTimeElapsed: function getTimeElapsed() {
          return _classPrivateFieldLooseBase(_this, _session$3)[_session$3].getTimeElapsed();
        },
        getPageCount: function getPageCount() {
          return _classPrivateFieldLooseBase(_this, _session$3)[_session$3].getPageCount();
        }
      };

      this.logout = function () {
        _classPrivateFieldLooseBase(_this, _logger$9)[_logger$9].debug('logout called');

        StorageManager$1.setInstantDeleteFlagInK();
      };

      this.clear = function () {
        _this.onUserLogin.clear();
      };

      this.getCleverTapID = function () {
        return _classPrivateFieldLooseBase(_this, _device$3)[_device$3].getGuid();
      }; // method for notification viewed


      this.renderNotificationViewed = function (detail) {
        processNotificationEvent(NOTIFICATION_VIEWED, detail);
      }; // method for notification clicked


      this.renderNotificationClicked = function (detail) {
        processNotificationEvent(NOTIFICATION_CLICKED, detail);
      };

      var processNotificationEvent = function processNotificationEvent(eventName, eventDetail) {
        if (!eventDetail || !eventDetail.msgId) {
          return;
        }

        var data = {};
        data.type = 'event';
        data.evtName = eventName;
        data.evtData = _defineProperty({}, WZRK_ID, eventDetail.msgId);

        if (eventDetail.pivotId) {
          data.evtData = _objectSpread2(_objectSpread2({}, data.evtData), {}, {
            wzrk_pivot: eventDetail.pivotId
          });
        }

        if (eventDetail.kv && eventDetail.kv !== null && eventDetail.kv !== undefined) {
          for (var key in eventDetail.kv) {
            if (key.startsWith(WZRK_PREFIX)) {
              data.evtData = _objectSpread2(_objectSpread2({}, data.evtData), {}, _defineProperty({}, key, eventDetail.kv[key]));
            }
          }
        }

        _classPrivateFieldLooseBase(_this, _request$6)[_request$6].processEvent(data);
      };

      this.getAccountID = function () {
        return _classPrivateFieldLooseBase(_this, _account$5)[_account$5].id;
      };

      this.getDCDomain = function () {
        return _classPrivateFieldLooseBase(_this, _account$5)[_account$5].finalTargetDomain;
      }; // Set the Direct Call sdk version and fire request


      this.setDCSDKVersion = function (ver) {
        _classPrivateFieldLooseBase(_this, _account$5)[_account$5].dcSDKVersion = ver;
        var data = {};
        data.af = {
          dcv: 'dc-sdk-v' + _classPrivateFieldLooseBase(_this, _account$5)[_account$5].dcSDKVersion
        };

        var pageLoadUrl = _classPrivateFieldLooseBase(_this, _account$5)[_account$5].dataPostURL;

        pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page');
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), _classPrivateFieldLooseBase(_this, _logger$9)[_logger$9]));
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), _classPrivateFieldLooseBase(_this, _logger$9)[_logger$9]));

        _classPrivateFieldLooseBase(_this, _request$6)[_request$6].saveAndFireRequest(pageLoadUrl, false);
      };

      this.setLogLevel = function (l) {
        _classPrivateFieldLooseBase(_this, _logger$9)[_logger$9].logLevel = Number(l);
      };

      var _handleEmailSubscription = function _handleEmailSubscription(subscription, reEncoded, fetchGroups) {
        handleEmailSubscription(subscription, reEncoded, fetchGroups, _classPrivateFieldLooseBase(_this, _account$5)[_account$5], _classPrivateFieldLooseBase(_this, _logger$9)[_logger$9]);
      };

      var api = _classPrivateFieldLooseBase(this, _api)[_api];

      api.logout = this.logout;
      api.clear = this.clear;

      api.closeIframe = function (campaignId, divIdIgnored) {
        closeIframe(campaignId, divIdIgnored, _classPrivateFieldLooseBase(_this, _session$3)[_session$3].sessionId);
      };

      api.enableWebPush = function (enabled, applicationServerKey) {
        _this.notifications._enableWebPush(enabled, applicationServerKey);
      };

      api.tr = function (msg) {
        _tr(msg, {
          device: _classPrivateFieldLooseBase(_this, _device$3)[_device$3],
          session: _classPrivateFieldLooseBase(_this, _session$3)[_session$3],
          request: _classPrivateFieldLooseBase(_this, _request$6)[_request$6],
          logger: _classPrivateFieldLooseBase(_this, _logger$9)[_logger$9]
        });
      };

      api.setEnum = function (enumVal) {
        setEnum(enumVal, _classPrivateFieldLooseBase(_this, _logger$9)[_logger$9]);
      };

      api.is_onloadcalled = function () {
        return _classPrivateFieldLooseBase(_this, _onloadcalled)[_onloadcalled] === 1;
      };

      api.subEmail = function (reEncoded) {
        _handleEmailSubscription('1', reEncoded);
      };

      api.getEmail = function (reEncoded, withGroups) {
        _handleEmailSubscription('-1', reEncoded, withGroups);
      };

      api.unSubEmail = function (reEncoded) {
        _handleEmailSubscription('0', reEncoded);
      };

      api.unsubEmailGroups = function (reEncoded) {
        $ct.unsubGroups = [];
        var elements = document.getElementsByClassName('ct-unsub-group-input-item');

        for (var i = 0; i < elements.length; i++) {
          var element = elements[i];

          if (element.name) {
            var data = {
              name: element.name,
              isUnsubscribed: element.checked
            };
            $ct.unsubGroups.push(data);
          }
        }

        _handleEmailSubscription(GROUP_SUBSCRIPTION_REQUEST_ID, reEncoded);
      };

      api.setSubscriptionGroups = function (value) {
        $ct.unsubGroups = value;
      };

      api.getSubscriptionGroups = function () {
        return $ct.unsubGroups;
      };

      api.changeSubscriptionGroups = function (reEncoded, updatedGroups) {
        api.setSubscriptionGroups(updatedGroups);

        _handleEmailSubscription(GROUP_SUBSCRIPTION_REQUEST_ID, reEncoded);
      };

      api.setUpdatedCategoryLong = function (profile) {
        if (profile[categoryLongKey]) {
          $ct.updatedCategoryLong = profile[categoryLongKey];
        }
      };

      window.$CLTP_WR = window.$WZRK_WR = api;

      if ((_clevertap$account4 = clevertap.account) === null || _clevertap$account4 === void 0 ? void 0 : _clevertap$account4[0].id) {
        // The accountId is present so can init with empty values.
        // Needed to maintain backward compatability with legacy implementations.
        // Npm imports/require will need to call init explictly with accountId
        this.init();
      }
    }

    _createClass(CleverTap, [{
      key: "init",
      value: function init(accountId, region, targetDomain) {
        if (_classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] === 1) {
          // already initailsed
          return;
        }

        StorageManager$1.removeCookie('WZRK_P', window.location.hostname);

        if (!_classPrivateFieldLooseBase(this, _account$5)[_account$5].id) {
          if (!accountId) {
            _classPrivateFieldLooseBase(this, _logger$9)[_logger$9].error(EMBED_ERROR);

            return;
          }

          _classPrivateFieldLooseBase(this, _account$5)[_account$5].id = accountId;
        }

        _classPrivateFieldLooseBase(this, _session$3)[_session$3].cookieName = SCOOKIE_PREFIX + '_' + _classPrivateFieldLooseBase(this, _account$5)[_account$5].id;

        if (region) {
          _classPrivateFieldLooseBase(this, _account$5)[_account$5].region = region;
        }

        if (targetDomain) {
          _classPrivateFieldLooseBase(this, _account$5)[_account$5].targetDomain = targetDomain;
        }

        var currLocation = location.href;
        var urlParams = getURLParams(currLocation.toLowerCase()); // eslint-disable-next-line eqeqeq

        if (typeof urlParams.e !== 'undefined' && urlParams.wzrk_ex == '0') {
          return;
        }

        _classPrivateFieldLooseBase(this, _request$6)[_request$6].processBackupEvents();

        _classPrivateFieldLooseBase(this, _processOldValues)[_processOldValues]();

        this.pageChanged();

        if (_classPrivateFieldLooseBase(this, _isSpa)[_isSpa]) {
          // listen to click on the document and check if URL has changed.
          document.addEventListener('click', _classPrivateFieldLooseBase(this, _boundCheckPageChanged)[_boundCheckPageChanged]);
        } else {
          // remove existing click listeners if any
          document.removeEventListener('click', _classPrivateFieldLooseBase(this, _boundCheckPageChanged)[_boundCheckPageChanged]);
        }

        _classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] = 1;
      }
    }, {
      key: "pageChanged",
      value: function pageChanged() {
        var _this2 = this;

        var currLocation = window.location.href;
        var urlParams = getURLParams(currLocation.toLowerCase()); // -- update page count

        var obj = _classPrivateFieldLooseBase(this, _session$3)[_session$3].getSessionCookieObject();

        var pgCount = typeof obj.p === 'undefined' ? 0 : obj.p;
        obj.p = ++pgCount;

        _classPrivateFieldLooseBase(this, _session$3)[_session$3].setSessionCookieObject(obj); // -- update page count


        var data = {};
        var referrerDomain = getDomain(document.referrer);

        if (window.location.hostname !== referrerDomain) {
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

        data = _classPrivateFieldLooseBase(this, _request$6)[_request$6].addSystemDataToObject(data, undefined);
        data.cpg = currLocation;
        data[CAMP_COOKIE_NAME] = getCampaignObjForLc();

        var pageLoadUrl = _classPrivateFieldLooseBase(this, _account$5)[_account$5].dataPostURL;

        _classPrivateFieldLooseBase(this, _request$6)[_request$6].addFlags(data); // send dsync flag when page = 1


        if (parseInt(data.pg) === 1) {
          _classPrivateFieldLooseBase(this, _overrideDSyncFlag)[_overrideDSyncFlag](data);
        }

        data.af = {
          lib: 'web-sdk-v1.1.2'
        };
        pageLoadUrl = addToURL(pageLoadUrl, 'type', 'page');
        pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$9)[_logger$9]));

        _classPrivateFieldLooseBase(this, _request$6)[_request$6].saveAndFireRequest(pageLoadUrl, false);

        _classPrivateFieldLooseBase(this, _previousUrl)[_previousUrl] = currLocation;
        setTimeout(function () {
          if (pgCount <= 3) {
            // send ping for up to 3 pages
            _classPrivateFieldLooseBase(_this2, _pingRequest)[_pingRequest]();
          }

          if (_classPrivateFieldLooseBase(_this2, _isPingContinuous)[_isPingContinuous]()) {
            setInterval(function () {
              _classPrivateFieldLooseBase(_this2, _pingRequest)[_pingRequest]();
            }, CONTINUOUS_PING_FREQ_IN_MILLIS);
          }
        }, FIRST_PING_FREQ_IN_MILLIS);
      }
    }, {
      key: "_isPersonalisationActive",
      value: function _isPersonalisationActive() {
        return StorageManager$1._isLocalStorageSupported() && this.enablePersonalization;
      }
    }, {
      key: "popupCallback",
      // eslint-disable-next-line accessor-pairs
      set: function set(callback) {
        this.popupCallbacks[this.popupCurrentWzrkId] = callback;
      }
    }]);

    return CleverTap;
  }();

  var _processOldValues2 = function _processOldValues2() {
    this.onUserLogin._processOldValues();

    this.privacy._processOldValues();

    this.event._processOldValues();

    this.profile._processOldValues();

    this.notifications._processOldValues();
  };

  var _checkPageChanged2 = function _checkPageChanged2() {
    if (_classPrivateFieldLooseBase(this, _previousUrl)[_previousUrl] !== location.href) {
      this.pageChanged();
    }
  };

  var _pingRequest2 = function _pingRequest2() {
    var pageLoadUrl = _classPrivateFieldLooseBase(this, _account$5)[_account$5].dataPostURL;

    var data = {};
    data = _classPrivateFieldLooseBase(this, _request$6)[_request$6].addSystemDataToObject(data, undefined);
    pageLoadUrl = addToURL(pageLoadUrl, 'type', EVT_PING);
    pageLoadUrl = addToURL(pageLoadUrl, 'd', compressData(JSON.stringify(data), _classPrivateFieldLooseBase(this, _logger$9)[_logger$9]));

    _classPrivateFieldLooseBase(this, _request$6)[_request$6].saveAndFireRequest(pageLoadUrl, false);
  };

  var _isPingContinuous2 = function _isPingContinuous2() {
    return typeof window.wzrk_d !== 'undefined' && window.wzrk_d.ping === 'continuous';
  };

  var _overrideDSyncFlag2 = function _overrideDSyncFlag2(data) {
    if (this._isPersonalisationActive()) {
      data.dsync = true;
    }
  };

  var clevertap = new CleverTap(window.clevertap);
  window.clevertap = window.wizrocket = clevertap;

  return clevertap;

})));
//# sourceMappingURL=clevertap.js.map
