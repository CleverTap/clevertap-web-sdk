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

  // CHARGEDID_COOKIE_NAME: 'WZRK_CHARGED_ID',
  var CHARGED_ID = 'Charged ID';
  var CHARGEDID_COOKIE_NAME = 'WZRK_CHARGED_ID';
  var GCOOKIE_NAME = 'WZRK_G';
  var KCOOKIE_NAME = 'WZRK_K';
  var SCOOKIE_PREFIX = 'WZRK_S';
  var META_COOKIE = 'WZRK_META';
  var ARP_COOKIE = 'WZRK_ARP';
  var LCOOKIE_NAME = 'WZRK_L';
  var OPTOUT_COOKIE_ENDSWITH = ' =OO';
  var COOKIE_EXPIRY = 86400 * 365 * 10; // 10 Years in seconds

  var MAX_TRIES = 50; // API tries

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
        var nameEQ = name + '';
        var ca = document.cookie.split(';');

        for (var idx = 0; idx < ca.length; idx++) {
          var c = ca[idx];

          while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
          }

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
        if (val == null) {
          return;
        }

        try {
          if (this._isLocalStorageSupported) {
            this.save(property, JSON.stringify(value));
          } else {
            if (property === GCOOKIE_NAME) {
              this.createCookie(property, encodeURIComponent(value), 0, window.location.hostname);
            } else {
              wiz.createCookie(property, encodeURIComponent(JSON.stringify(value)), 0, window.location.hostname);
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

        if (data != null && data.trim() != '') {
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
              var tempCookie = this.readCookie(name);

              if (tempCookie == value) {
                broadDomain = testBroadDomain;
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

        k['flag'] = true;
        this.saveToLSorCookie(KCOOKIE_NAME, k);
      }
    }]);

    return StorageManager;
  }();

  var _accountID = _classPrivateFieldLooseKey("accountID");

  var _region = _classPrivateFieldLooseKey("region");

  var _appVersion = _classPrivateFieldLooseKey("appVersion");

  var _logger = _classPrivateFieldLooseKey("logger");

  var _targetDomain = _classPrivateFieldLooseKey("targetDomain");

  var _dataPostURL = _classPrivateFieldLooseKey("dataPostURL");

  var _recorderURL = _classPrivateFieldLooseKey("recorderURL");

  var _emailURL = _classPrivateFieldLooseKey("emailURL");

  var _personalizationActive = _classPrivateFieldLooseKey("personalizationActive");

  var Account = /*#__PURE__*/function () {
    function Account(_ref) {
      var logger = _ref.logger;

      _classCallCheck(this, Account);

      Object.defineProperty(this, _accountID, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _region, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _appVersion, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _targetDomain, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _dataPostURL, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _recorderURL, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _emailURL, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _personalizationActive, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _logger)[_logger] = logger;
      _classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain] = TARGET_DOMAIN;
      _classPrivateFieldLooseBase(this, _dataPostURL)[_dataPostURL] = "".concat(TARGET_PROTOCOL, "//").concat(_classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain], "/a?t=96");
      _classPrivateFieldLooseBase(this, _recorderURL)[_recorderURL] = "".concat(TARGET_PROTOCOL, "//").concat(_classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain], "/r?r=1");
      _classPrivateFieldLooseBase(this, _emailURL)[_emailURL] = "".concat(TARGET_PROTOCOL, "//").concat(_classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain], "/e?r=1");
    }

    _createClass(Account, [{
      key: "isPersonalizationActive",
      value: function isPersonalizationActive() {
        return StorageManager._isLocalStorageSupported() && _classPrivateFieldLooseBase(this, _personalizationActive)[_personalizationActive];
      }
    }, {
      key: "accountID",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _accountID)[_accountID];
      },
      set: function set(accountID) {
        // TODO: add some validation
        if (!_classPrivateFieldLooseBase(this, _accountID)[_accountID]) {
          _classPrivateFieldLooseBase(this, _accountID)[_accountID] = accountID;
        }
      }
    }, {
      key: "region",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _region)[_region];
      },
      set: function set(region) {
        // TODO: add some validation
        _classPrivateFieldLooseBase(this, _region)[_region] = region;
        _classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain] = "".concat(region, ".").concat(TARGET_DOMAIN);
        _classPrivateFieldLooseBase(this, _dataPostURL)[_dataPostURL] = "".concat(TARGET_PROTOCOL, "//").concat(_classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain], "/a?t=96");
        _classPrivateFieldLooseBase(this, _recorderURL)[_recorderURL] = "".concat(TARGET_PROTOCOL, "//").concat(_classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain], "/r?r=1");
        _classPrivateFieldLooseBase(this, _emailURL)[_emailURL] = "".concat(TARGET_PROTOCOL, "//").concat(_classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain], "/e?r=1");
      }
    }, {
      key: "appVersion",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _appVersion)[_appVersion];
      },
      set: function set(appVersion) {
        // TODO: add some validation
        _classPrivateFieldLooseBase(this, _appVersion)[_appVersion] = appVersion;
      }
    }, {
      key: "targetDomain",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _targetDomain)[_targetDomain];
      }
    }]);

    return Account;
  }();

  var DATA_NOT_SENT_TEXT = "This property has been ignored.";
  var INVALID_ACCOUNT = 'Invalid account ID';
  var CLEVERTAP_ERROR_PREFIX = 'CleverTap error:'; // Formerly wzrk_error_txt
  var EVENT_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Event structure not valid. ").concat(DATA_NOT_SENT_TEXT);
  var GENDER_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Gender value should be either M or F. ").concat(DATA_NOT_SENT_TEXT);
  var EMPLOYED_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Employed value should be either Y or N. ").concat(DATA_NOT_SENT_TEXT);
  var MARRIED_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Married value should be either Y or N. ").concat(DATA_NOT_SENT_TEXT);
  var EDUCATION_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Education value should be either School, College or Graduate. ").concat(DATA_NOT_SENT_TEXT);
  var AGE_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Age value should be a number. ").concat(DATA_NOT_SENT_TEXT);
  var DOB_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " DOB value should be a Date Object");
  var PHONE_FORMAT_ERROR = "".concat(CLEVERTAP_ERROR_PREFIX, " Phone number should be formatted as +[country code][number]");

  var logLevels = {
    DISABLE: 0,
    ERROR: 1,
    INFO: 2,
    DEBUG: 3
  };

  var _logLevel = _classPrivateFieldLooseKey("logLevel");

  var Logger = /*#__PURE__*/function () {
    function Logger(logLevel) {
      _classCallCheck(this, Logger);

      Object.defineProperty(this, _logLevel, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _logLevel)[_logLevel] = logLevel == null ? logLevel : logLevels.INFO;
    }

    _createClass(Logger, [{
      key: "error",
      value: function error(message) {
        if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.ERROR) {
          this._log('error', message);
        }
      }
    }, {
      key: "info",
      value: function info(message) {
        if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.INFO) {
          this._log('log', message);
        }
      }
    }, {
      key: "debug",
      value: function debug(message) {
        if (_classPrivateFieldLooseBase(this, _logLevel)[_logLevel] >= logLevels.DEBUG) {
          this._log('error', message);
        }
      }
    }, {
      key: "reportError",
      value: function reportError(code, description) {
        this.error("".concat(CLEVERTAP_ERROR_PREFIX, " ").concat(code, ": ").concat(description));
      }
    }, {
      key: "_log",
      value: function _log(level, message) {
        if (window.console) {
          try {
            var ts = new Date().getTime();
            console[level]("CleverTap [".concat(ts, "]: ").concat(message));
          } catch (e) {}
        }
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

  var getURLParams = function getURLParams(url) {
    var urlParams = {};
    var idx = url.indexOf('?');

    if (idx > 1) {
      var uri = url.substring(idx + 1);

      var match,
          pl = /\+/g,
          // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
          decode = function decode(s) {
        var replacement = s.replace(pl, " ");

        try {
          replacement = decodeURIComponent(replacement);
        } catch (e) {//eat
        }

        return replacement;
      };

      while (match = search.exec(uri)) {
        urlParams[decode(match[1])] = decode(match[2]);
      }
    }

    return urlParams;
  };
  var addToURL = function addToURL(url, k, v) {
    return url + '&' + k + '=' + encodeURIComponent(v);
  };

  var _guid = _classPrivateFieldLooseKey("guid");

  var _appID = _classPrivateFieldLooseKey("appID");

  var _logger$1 = _classPrivateFieldLooseKey("logger");

  var DeviceManager = /*#__PURE__*/function () {
    function DeviceManager(appID, loggerInstance) {
      _classCallCheck(this, DeviceManager);

      Object.defineProperty(this, _guid, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _appID, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger$1, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _appID)[_appID] = appID;
      _classPrivateFieldLooseBase(this, _logger$1)[_logger$1] = loggerInstance;
      _classPrivateFieldLooseBase(this, _guid)[_guid] = this.getGUID();
    }

    _createClass(DeviceManager, [{
      key: "getGUID",
      value: function getGUID() {
        var guid = null;

        if (_classPrivateFieldLooseBase(this, _guid)[_guid] != null) {
          return _classPrivateFieldLooseBase(this, _guid)[_guid];
        }

        var guidValue = StorageManager.read(GCOOKIE_NAME);

        if (guidValue != null) {
          try {
            guid = JSON.parse(decodeURIComponent(guidValue));
          } catch (e) {
            _classPrivateFieldLooseBase(this, _logger$1)[_logger$1].debug("Cannot parse Gcookie from localstorage - must be encoded  ".concat(value)); //assumming guids are of size 32. supporting both formats.
            // guid can have encodedURIComponent or be without it.
            // 1.56e4078ed15749928c042479ec2b4d47 - breaks on JSON.parse(decodeURIComponent())
            // 2.%2256e4078ed15749928c042479ec2b4d47%22


            if (guidValue.length === 32) {
              guid = guidValue;
              StorageManager.saveToLSorCookie(GCOOKIE_NAME, guidValue);
            } else {
              _classPrivateFieldLooseBase(this, _logger$1)[_logger$1].error("Illegal guid ".concat(guidValue));
            }
          } // Persist to cookie storage if not present there.


          if (wiz.isValueValid(guid)) {
            wiz.createBroadCookie(GCOOKIE_NAME, guid, COOKIE_EXPIRY, domain);
          }
        }

        if (guid == null) {
          guid = StorageManager.readCookie(GCOOKIE_NAME);

          if (guid != null && (guid.indexOf('%') === 0 || guid.indexOf('\'') === 0 || guid.indexOf('"') === 0)) {
            guid = null;
          }

          if (guid != null) {
            StorageManager.saveToLSorCookie(GCOOKIE_NAME, guid);
          }
        }

        return guid;
      }
    }]);

    return DeviceManager;
  }();

  var _SCOOKIE_NAME = _classPrivateFieldLooseKey("SCOOKIE_NAME");

  var _accountID$1 = _classPrivateFieldLooseKey("accountID");

  var _logger$2 = _classPrivateFieldLooseKey("logger");

  var SessionManager = /*#__PURE__*/function () {
    function SessionManager() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        accountID: accountID,
        logger: logger
      };

      _classCallCheck(this, SessionManager);

      Object.defineProperty(this, _SCOOKIE_NAME, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _accountID$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger$2, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _accountID$1)[_accountID$1] = params.accountID;
      _classPrivateFieldLooseBase(this, _SCOOKIE_NAME)[_SCOOKIE_NAME] = SCOOKIE_PREFIX + '_' + accountID;
      _classPrivateFieldLooseBase(this, _logger$2)[_logger$2] = params.logger;
    }

    _createClass(SessionManager, [{
      key: "logout",
      value: function logout() {
        _classPrivateFieldLooseBase(this, _logger$2)[_logger$2].debug('logout called');

        StorageManager.setInstantDeleteFlagInK();
      }
    }, {
      key: "SCOOKIE_NAME",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _SCOOKIE_NAME)[_SCOOKIE_NAME];
      },
      set: function set(accountID) {
        _classPrivateFieldLooseBase(this, _SCOOKIE_NAME)[_SCOOKIE_NAME] = SCOOKIE_PREFIX + '_' + accountID;
      }
    }]);

    return SessionManager;
  }();

  var isString = function isString(input) {
    return typeof input == 'string' || input instanceof String;
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
      if (obj.hasOwnProperty(prop)) return false;
    }

    return true;
  };
  var isConvertibleToNumber = function isConvertibleToNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
  var isNumber = function isNumber(n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n) && typeof n == 'number';
  };
  var sanitize = function sanitize(input, regex) {
    return input.replace(regex, '');
  };

  var convertToWZRKDate = function convertToWZRKDate(dateObj) {
    return '$D_' + Math.round(dateObj.getTime() / 1000);
  };

  var _api = _classPrivateFieldLooseKey("api");

  var _logger$3 = _classPrivateFieldLooseKey("logger");

  var _processingBackup = _classPrivateFieldLooseKey("processingBackup");

  var _isOptInRequest = _classPrivateFieldLooseKey("isOptInRequest");

  var EventHandler = /*#__PURE__*/function () {
    function EventHandler(_ref, cachedQueue) {
      var api = _ref.api,
          logger = _ref.logger;

      _classCallCheck(this, EventHandler);

      Object.defineProperty(this, _api, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _processingBackup, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isOptInRequest, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _api)[_api] = api;
      _classPrivateFieldLooseBase(this, _logger$3)[_logger$3] = logger;
      this.processingBackup = false;
      _classPrivateFieldLooseBase(this, _isOptInRequest)[_isOptInRequest] = false;
    }

    _createClass(EventHandler, [{
      key: "push",
      value: function push() {}
    }, {
      key: "processBackupEvents",
      value: function processBackupEvents() {
        var backupMap = StorageManager.readFromLSorCookie(LCOOKIE_NAME);

        if (backupMap == null) {
          return;
        }

        _classPrivateFieldLooseBase(this, _processingBackup)[_processingBackup] = true;

        for (var idx in backupMap) {
          if (backupMap.hasOwnProperty(idx)) {
            var backupEvent = backupMap[idx];

            if (backupEvent['fired'] == null) {
              _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].debug('Processing backup event : ' + backupEvent['q']);

              if (backupEvent['q'] != null) {
                _classPrivateFieldLooseBase(this, _api)[_api].fireRequest(backupEvent['q']);
              }

              backupEvent['fired'] = true;
            }
          }
        }

        StorageManager.saveToLSorCookie(LCOOKIE_NAME, backupMap);
        _classPrivateFieldLooseBase(this, _processingBackup)[_processingBackup] = false;
      }
    }, {
      key: "isEventStructureFlat",
      value: function isEventStructureFlat(eventObj) {
        // events can't have any nested structure or arrays
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
      }
    }, {
      key: "isChargedEventStructureValid",
      value: function isChargedEventStructureValid(chargedObj) {
        if (isObject(chargedObj)) {
          for (var key in chargedObj) {
            if (chargedObj.hasOwnProperty(key)) {
              if (key == 'Items') {
                if (!Array.isArray(chargedObj[key])) {
                  return false;
                }

                if (chargedObj[key].length > 16) {
                  _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].reportError(522, 'Charged Items exceed 16 limit. Actual count: ' + chargedObj[key].length + '. Additional items will be dropped.');
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
                //Items
                if (isObject(chargedObj[key]) || Array.isArray(chargedObj[key])) {
                  return false;
                } else if (isDateObject(chargedObj[key])) {
                  chargedObj[key] = convertToWZRKDate(chargedObj[key]);
                }
              }
            }
          } //save charged Id


          if (isString(chargedObj[CHARGED_ID]) || isNumber(chargedObj[CHARGED_ID])) {
            var chargedId = chargedObj[CHARGED_ID] + ''; //casting chargeedId to string

            if (globalChargedId == null) {
              globalChargedId = StorageManager.readFromLSorCookie(CHARGEDID_COOKIE_NAME);
            }

            if (globalChargedId != null && globalChargedId.trim() === chargedId.trim()) {
              //drop event- duplicate charged id
              _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error('Duplicate Charged Id - Dropped' + chargedObj);

              return false;
            }

            globalChargedId = chargedId;
            StorageManager.saveToLSorCookie(CHARGEDID_COOKIE_NAME, chargedId);
          }

          return true;
        } // if object (chargedObject)


        return false;
      }
    }, {
      key: "processEventArray",
      value: function processEventArray(eventArr) {
        if (Array.isArray(eventArr)) {
          /** looping since the events could be fired in quick succession, and we could end up
           with multiple pushes without getting a chance to process
           */
          while (eventArr.length > 0) {
            var eventName = eventArr.shift(); // take out name of the event

            if (!isString(eventName)) {
              _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(EVENT_ERROR);

              return;
            }

            if (eventName.length > 1024) {
              eventName = eventName.substring(0, 1024);

              _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].reportError(510, eventName + '... length exceeded 1024 chars. Trimmed.');
            }

            if (['Stayed', 'UTM Visited', 'App Launched', 'Notification Sent', 'Notification Viewed', 'Notification Clicked'].includes(eventName)) {
              _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].reportError(513, eventName + ' is a restricted system event. It cannot be used as an event name.');

              continue;
            }

            var data = {};
            data['type'] = 'event';
            data['evtName'] = sanitize(eventName, unsupportedKeyCharRegex);

            if (eventArr.length != 0) {
              var eventObj = eventArr.shift();

              if (!isObject(eventObj)) {
                eventArr.unshift(eventObj); // put it back if it is not an object
              } else {
                //check Charged Event vs. other events.
                if (eventName == 'Charged') {
                  if (!wiz.isChargedEventStructureValid(eventObj)) {
                    wiz.reportError(511, "Charged event structure invalid. Not sent.");
                    continue;
                  }
                } else {
                  if (!wiz.isEventStructureFlat(eventObj)) {
                    wiz.reportError(512, eventName + " event structure invalid. Not sent.");
                    continue;
                  }
                }

                data['evtData'] = eventObj;
              }
            }

            processEvent(data);
          }
        }
      }
    }, {
      key: "isProfileValid",
      value: function isProfileValid(profileObj) {
        if (isObject(profileObj)) {
          for (var profileKey in profileObj) {
            if (profileObj.hasOwnProperty(profileKey)) {
              var _valid = true;
              var profileVal = profileObj[profileKey];

              if (profileVal == null) {
                delete profileObj[profileKey];
                continue;
              }

              if (profileKey == 'Gender' && !profileVal.match(/^M$|^F$/)) {
                _valid = false;

                _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(GENDER_ERROR);
              }

              if (profileKey == 'Employed' && !profileVal.match(/^Y$|^N$/)) {
                _valid = false;

                _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(EMPLOYED_ERROR);
              }

              if (profileKey == 'Married' && !profileVal.match(/^Y$|^N$/)) {
                _valid = false;

                _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(MARRIED_ERROR);
              }

              if (profileKey == 'Education' && !profileVal.match(/^School$|^College$|^Graduate$/)) {
                _valid = false;

                _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(EDUCATION_ERROR);
              }

              if (profileKey == 'Age' && profileVal != null) {
                if (isConvertibleToNumber(profileVal)) {
                  profileObj['Age'] = +profileVal;
                } else {
                  _valid = false;

                  _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(AGE_ERROR);
                }
              } // dob will come in like this - $dt_19470815 or dateObject


              if (profileKey == 'DOB') {
                if ((!/^\$D_/.test(profileVal) || (profileVal + '').length != 11) && !isDateObject(profileVal)) {
                  _valid = false;

                  _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(DOB_ERROR);
                }

                if (isDateObject(profileVal)) {
                  profileObj[profileKey] = convertToWZRKDate(profileVal);
                }
              } else if (isDateObject(profileVal)) {
                profileObj[profileKey] = convertToWZRKDate(profileVal);
              }

              if (profileKey == 'Phone' && !isObjectEmpty(profileVal)) {
                if (profileVal.length > 8 && profileVal.charAt(0) == '+') {
                  // valid phone number
                  profileVal = profileVal.substring(1, profileVal.length);

                  if (isConvertibleToNumber(profileVal)) {
                    profileObj['Phone'] = +profileVal;
                  } else {
                    _valid = false;

                    _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(PHONE_FORMAT_ERROR + '. Removed.');
                  }
                } else {
                  _valid = false;

                  _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(PHONE_FORMAT_ERROR + '. Removed.');
                }
              }

              if (!_valid) {
                delete profileObj[profileKey];
              }
            }
          }
        }

        return valid;
      }
    }, {
      key: "processProfileArray",
      value: function processProfileArray(profileArr) {
        if (Array.isArray(profileArr) && profileArr.length > 0) {
          for (var index in profileArr) {
            if (profileArr.hasOwnProperty(index)) {
              var outerObj = profileArr[index];
              var data = {};
              var profileObj = void 0;

              if (outerObj['Site'] != null) {
                //organic data from the site
                profileObj = outerObj['Site'];

                if (isObjectEmpty(profileObj) || !this.isProfileValid(profileObj)) {
                  return;
                }
              } else if (outerObj['Facebook'] != null) {
                //fb connect data
                var FbProfileObj = outerObj['Facebook']; //make sure that the object contains any data at all

                if (!isObjectEmpty(FbProfileObj) && !FbProfileObj['error']) {
                  profileObj = wiz.processFBUserObj(FbProfileObj);
                }
              } else if (_typeof(outerObj['Google Plus']) != STRING_CONSTANTS.UNDEFINED) {
                var GPlusProfileObj = outerObj['Google Plus'];

                if (!wzrk_util.isObjectEmpty(GPlusProfileObj) && !GPlusProfileObj['error']) {
                  profileObj = wiz.processGPlusUserObj(GPlusProfileObj);
                }
              }

              if (_typeof(profileObj) != STRING_CONSTANTS.UNDEFINED && !wzrk_util.isObjectEmpty(profileObj)) {
                // profile got set from above
                data['type'] = "profile";

                if (_typeof(profileObj['tz']) === STRING_CONSTANTS.UNDEFINED) {
                  //try to auto capture user timezone if not present
                  profileObj['tz'] = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
                }

                data['profile'] = profileObj;
                wiz.addToLocalProfileMap(profileObj, true);
                data = wiz.addSystemDataToObject(data, undefined);
                wiz.addFlags(data);
                var compressedData = wiz.compressData(JSON.stringify(data));
                var pageLoadUrl = dataPostURL;
                pageLoadUrl = wiz.addToURL(pageLoadUrl, "type", EVT_PUSH);
                pageLoadUrl = wiz.addToURL(pageLoadUrl, "d", compressedData);
                wiz.saveAndFireRequest(pageLoadUrl, blockRequeust);
              }
            }
          }
        }
      }
    }, {
      key: "processFBUserObj",
      value: function processFBUserObj(user) {
        var profileData = {};
        profileData['Name'] = user['name'];

        if (user['id'] != null) {
          profileData['FBID'] = user['id'] + '';
        } // Feb 2014 - FB announced over 58 gender options, hence we specifically look for male or female.


        if (user['gender'] == 'male') {
          profileData['Gender'] = 'M';
        } else if (user['gender'] == 'female') {
          profileData['Gender'] = 'F';
        } else {
          profileData['Gender'] = 'O';
        }

        var getHighestEducation = function getHighestEducation(eduArr) {
          if (eduArr != null) {
            var college = '';
            var highschool = '';

            for (var i = 0; i < eduArr.length; i++) {
              var _edu = eduArr[i];

              if (_edu.type != null) {
                var type = _edu.type;

                if (type == 'Graduate School') {
                  return 'Graduate';
                } else if (type == 'College') {
                  college = '1';
                } else if (type == 'High School') {
                  highschool = '1';
                }
              }
            }

            if (college == '1') {
              return 'College';
            } else if (highschool == '1') {
              return 'School';
            }
          }
        };

        --TODO;

        if (user['relationship_status'] != STRING_CONSTANTS.UNDEFINED) {
          profileData['Married'] = 'N';

          if (user['relationship_status'] == 'Married') {
            profileData['Married'] = 'Y';
          }
        }

        var edu = getHighestEducation(user['education']);

        if (typeof edu !== "undefined") {
          profileData['Education'] = edu;
        }

        var work = _typeof(user['work']) !== STRING_CONSTANTS.UNDEFINED ? user['work'].length : 0;

        if (work > 0) {
          profileData['Employed'] = 'Y';
        } else {
          profileData['Employed'] = 'N';
        }

        if (typeof user['email'] !== "undefined") {
          profileData['Email'] = user['email'];
        }

        if (typeof user['birthday'] !== "undefined") {
          var mmddyy = user['birthday'].split('/'); //comes in as "08/15/1947"

          profileData['DOB'] = $WZRK_WR.setDate(mmddyy[2] + mmddyy[0] + mmddyy[1]);
        }

        return profileData;
      }
    }]);

    return EventHandler;
  }();

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

      output = output + LZS._keyStr.charAt(enc1) + LZS._keyStr.charAt(enc2) + LZS._keyStr.charAt(enc3) + LZS._keyStr.charAt(enc4);
    }

    return output;
  };

  var _logger$4 = _classPrivateFieldLooseKey("logger");

  var _event = _classPrivateFieldLooseKey("event");

  var CleverTapAPI = /*#__PURE__*/function () {
    function CleverTapAPI(_ref) {
      var logger = _ref.logger;

      _classCallCheck(this, CleverTapAPI);

      Object.defineProperty(this, _logger$4, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _event, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _logger$4)[_logger$4] = logger;
    }

    _createClass(CleverTapAPI, [{
      key: "dropRequestDueToOptOut",
      value: function dropRequestDueToOptOut() {
        if (!$ct.globalCache.gcookie || isString($ct.globalCache.gcookie)) {
          $ct.globalCache.isOptInRequest = false;
          return false;
        }

        return $ct.globalCache.gcookie.slice(-3) === OPTOUT_COOKIE_ENDSWITH;
      }
    }, {
      key: "addARPToRequest",
      value: function addARPToRequest(url, skipResARP) {
        if (skipResARP != null && skipResARP === true) {
          var _arp = {};
          _arp['skipResARP'] = true;
          return addToURL(url, 'arp', compressData(JSON.stringify(_arp)));
        }

        if (StorageManager._isLocalStorageSupported() && StorageManager.read(ARP_COOKIE) != null) {
          return addToURL(url, 'arp', compressData(JSON.stringify(StorageManager.readFromLSorCookie(ARP_COOKIE))));
        }

        return url;
      }
    }, {
      key: "fireRequest",
      value: function (_fireRequest) {
        function fireRequest(_x, _x2, _x3, _x4) {
          return _fireRequest.apply(this, arguments);
        }

        fireRequest.toString = function () {
          return _fireRequest.toString();
        };

        return fireRequest;
      }(function (url, tries, skipARP, sendOULFlag) {
        if (dropRequestDueToOptOut()) {
          _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].debug('req dropped due to optout cookie: ' + $ct.globalCache.gcookie);

          return;
        }

        if (!$ct.globalCache.gcookie && $ct.globalCache.RESP_N < $ct.globalCache.REQ_N - 1 && tries < MAX_TRIES) {
          setTimeout(function () {
            fireRequest(url, tries + 1, skipARP, sendOULFlag);
          }, 50);
          return;
        }

        if (!sendOULFlag) {
          if ($ct.globalCache.gcookie) {
            url = addToURL(url, 'gc', $ct.globalCache.gcookie); //add cookie to url
          }

          url = addARPToRequest(url, skipARP);
        }

        url = addToURL(url, 'r', new Date().getTime()); // add epoch to beat caching of the URL

        if (wizrocket.hasOwnProperty('plugin')) {
          //used to add plugin name in request parameter
          var plugin = wizrocket.plugin;
          url = addToURL(url, 'ct_pl', plugin);
        }

        if (url.indexOf('chrome-extension:') != -1) {
          url = url.replace('chrome-extension:', 'https:');
        }

        var s = doc.createElement('script');
        s.setAttribute('type', 'text/javascript');
        s.setAttribute('src', url);
        s.setAttribute('rel', 'nofollow');
        s.async = true;
        doc.getElementsByTagName('head')[0].appendChild(s);

        _classPrivateFieldLooseBase(this, _logger$4)[_logger$4].debug('req snt -> url: ' + url);
      })
    }]);

    return CleverTapAPI;
  }();

  var _api$1 = _classPrivateFieldLooseKey("api");

  var _session = _classPrivateFieldLooseKey("session");

  var _user = _classPrivateFieldLooseKey("user");

  var _account = _classPrivateFieldLooseKey("account");

  var _logger$5 = _classPrivateFieldLooseKey("logger");

  var _device = _classPrivateFieldLooseKey("device");

  var _event$1 = _classPrivateFieldLooseKey("event");

  var _domain = _classPrivateFieldLooseKey("domain");

  var _broadDomain = _classPrivateFieldLooseKey("broadDomain");

  var _requestTime = _classPrivateFieldLooseKey("requestTime");

  var _seqNo = _classPrivateFieldLooseKey("seqNo");

  var _wiz_counter = _classPrivateFieldLooseKey("wiz_counter");

  var _globalCache = _classPrivateFieldLooseKey("globalCache");

  var _onloadcalled = _classPrivateFieldLooseKey("onloadcalled");

  var _unsubGroups = _classPrivateFieldLooseKey("unsubGroups");

  var _gcookie = _classPrivateFieldLooseKey("gcookie");

  var _scookieObj = _classPrivateFieldLooseKey("scookieObj");

  var _campaignDivMap = _classPrivateFieldLooseKey("campaignDivMap");

  var _blockRequeust = _classPrivateFieldLooseKey("blockRequeust");

  var _clearCookie = _classPrivateFieldLooseKey("clearCookie");

  var _globalChargedId = _classPrivateFieldLooseKey("globalChargedId");

  var _globalEventsMap = _classPrivateFieldLooseKey("globalEventsMap");

  var _globalProfileMap = _classPrivateFieldLooseKey("globalProfileMap");

  var _currentSessionId = _classPrivateFieldLooseKey("currentSessionId");

  var _LRU_CACHE = _classPrivateFieldLooseKey("LRU_CACHE");

  var _LRU_CACHE_SIZE = _classPrivateFieldLooseKey("LRU_CACHE_SIZE");

  var _chromeAgent = _classPrivateFieldLooseKey("chromeAgent");

  var _firefoxAgent = _classPrivateFieldLooseKey("firefoxAgent");

  var _safariAgent = _classPrivateFieldLooseKey("safariAgent");

  var _fcmPublicKey = _classPrivateFieldLooseKey("fcmPublicKey");

  var CleverTap = /*#__PURE__*/function () {
    // Globals Used. To be sorted later
    // #dataPostURL -> account.js
    // #recorderURL -> account.js
    // #emailURL -> account.js
    // #processingBackup -> to event.js
    // #SCOOKIE_NAME -> in session
    function CleverTap() {

      _classCallCheck(this, CleverTap);

      Object.defineProperty(this, _api$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _session, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _user, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _account, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger$5, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _device, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _event$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _domain, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _broadDomain, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _requestTime, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _seqNo, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _wiz_counter, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _globalCache, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _onloadcalled, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _unsubGroups, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _gcookie, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _scookieObj, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _campaignDivMap, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _blockRequeust, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _clearCookie, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _globalChargedId, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _globalEventsMap, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _globalProfileMap, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _currentSessionId, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _LRU_CACHE, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _LRU_CACHE_SIZE, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _chromeAgent, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _firefoxAgent, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _safariAgent, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _fcmPublicKey, {
        writable: true,
        value: void 0
      });
      // this.options = {...options}
      window.clevertap.event = Array.isArray(window.clevertap.event) ? window.clevertap.event : [];
      window.clevertap.profile = Array.isArray(window.clevertap.profile) ? window.clevertap.profile : [];
      window.clevertap.account = Array.isArray(window.clevertap.account) ? window.clevertap.account : [];
      window.clevertap.onUserLogin = Array.isArray(window.clevertap.onUserLogin) ? window.clevertap.onUserLogin : [];
      window.clevertap.notifications = Array.isArray(window.clevertap.notifications) ? window.clevertap.notifications : [];
      window.clevertap.privacy = Array.isArray(window.clevertap.privacy) ? window.clevertap.privacy : []; // Initialize Modules

      _classPrivateFieldLooseBase(this, _logger$5)[_logger$5] = new Logger(logLevels.INFO);
      _classPrivateFieldLooseBase(this, _api$1)[_api$1] = new CleverTapAPI({
        logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
      });
      _classPrivateFieldLooseBase(this, _account)[_account] = new Account({
        logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
      });
      _classPrivateFieldLooseBase(this, _event$1)[_event$1] = new EventHandler({
        api: _classPrivateFieldLooseBase(this, _api$1)[_api$1],
        logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
      }); // Other Properties

      _classPrivateFieldLooseBase(this, _requestTime)[_requestTime] = 0;
      _classPrivateFieldLooseBase(this, _seqNo)[_seqNo] = 0;
      _classPrivateFieldLooseBase(this, _wiz_counter)[_wiz_counter] = 0; // to keep track of number of times we load the body

      _classPrivateFieldLooseBase(this, _globalCache)[_globalCache] = {};
      _classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] = false;
      _classPrivateFieldLooseBase(this, _unsubGroups)[_unsubGroups] = [];
      _classPrivateFieldLooseBase(this, _campaignDivMap)[_campaignDivMap] = {};
      _classPrivateFieldLooseBase(this, _blockRequeust)[_blockRequeust] = false;
      _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] = false;
      _classPrivateFieldLooseBase(this, _LRU_CACHE_SIZE)[_LRU_CACHE_SIZE] = 100;
      _classPrivateFieldLooseBase(this, _fcmPublicKey)[_fcmPublicKey] = null;
      window.$ct = {
        globalCache: _defineProperty({
          gcookie: null,
          RESP_N: 0
        }, "RESP_N", 0)
      };
    }

    _createClass(CleverTap, [{
      key: "init",
      value: function init(id, region) {
        if (id + '' === '') {
          _classPrivateFieldLooseBase(this, _logger$5)[_logger$5].error(INVALID_ACCOUNT);

          return;
        }

        _classPrivateFieldLooseBase(this, _account)[_account].accountID = id;
        _classPrivateFieldLooseBase(this, _session)[_session] = new SessionManager({
          accountID: _classPrivateFieldLooseBase(this, _account)[_account].accountID,
          logger: _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]
        });

        if (region != null) {
          _classPrivateFieldLooseBase(this, _account)[_account].region = region;
        }

        if (window.wizrocket != null && window.clevertap == null) {
          window.clevertap = window.wizrocket;
        } else {
          window.wizrocket = window.clevertap;
        }

        _classPrivateFieldLooseBase(this, _domain)[_domain] = window.location.hostname;
        var currentLocation = window.location.href;
        var url_params = getURLParams(currentLocation.toLowerCase());
        StorageManager.removeCookie('WZRK_P', _classPrivateFieldLooseBase(this, _domain)[_domain]); // delete pcookie

        _classPrivateFieldLooseBase(this, _device)[_device] = new DeviceManager(_classPrivateFieldLooseBase(this, _account)[_account].accountID, _classPrivateFieldLooseBase(this, _logger$5)[_logger$5]);
        _classPrivateFieldLooseBase(this, _currentSessionId)[_currentSessionId] = StorageManager.getMetaProp('cs');

        if (url_params != null && url_params['wzrk_ex'] == '0') {
          return;
        }

        _classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] = true; // Always set at the end
      }
    }]);

    return CleverTap;
  }();

  var main = new CleverTap(window.clevertap);

  return main;

})));
