(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.clevertap = factory());
}(this, (function () { 'use strict';

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
  var GCOOKIE_NAME = 'WZRK_G';
  var SCOOKIE_PREFIX = 'WZRK_S';
  var META_COOKIE = 'WZRK_META';
  var LCOOKIE_NAME = 'WZRK_L';
  var COOKIE_EXPIRY = 86400 * 365 * 10; // 10 Years in seconds

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

  var errors = {
    INVALID_ACCOUNT: 'Invalid account ID',
    INVALID_EVENT: "Event structure not valid. Unable to process event",
    CLEVERTAP_ERROR_PREFIX: 'CleverTap error:' // Formerly wzrk_error_txt

  };

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
        this.error("".concat(errors.CLEVERTAP_ERROR_PREFIX, " ").concat(code, ": ").concat(description));
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

  var SessionManager = /*#__PURE__*/function () {
    function SessionManager(accountID) {
      _classCallCheck(this, SessionManager);

      Object.defineProperty(this, _SCOOKIE_NAME, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _accountID$1, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _accountID$1)[_accountID$1] = accountID;
      _classPrivateFieldLooseBase(this, _SCOOKIE_NAME)[_SCOOKIE_NAME] = SCOOKIE_PREFIX + '_' + accountID;
    }

    _createClass(SessionManager, [{
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

  var _api = _classPrivateFieldLooseKey("api");

  var _logger$2 = _classPrivateFieldLooseKey("logger");

  var _processingBackup = _classPrivateFieldLooseKey("processingBackup");

  var EventHandler = /*#__PURE__*/function () {
    function EventHandler(_ref, cachedQueue) {
      var api = _ref.api,
          logger = _ref.logger;

      _classCallCheck(this, EventHandler);

      Object.defineProperty(this, _api, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _logger$2, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _processingBackup, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(this, _api)[_api] = api;
      _classPrivateFieldLooseBase(this, _logger$2)[_logger$2] = logger;
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
              console.debug("Processing backup event : " + backupEvent['q']);

              if (typeof backupEvent['q'] != 'undefined') {
                wiz.fireRequest(backupEvent['q']);
              }

              backupEvent['fired'] = true;
            }
          }
        }

        wiz.saveToLSorCookie(STRING_CONSTANTS.LCOOKIE_NAME, backupMap);
        processingBackup = false;
      }
    }]);

    return EventHandler;
  }();

  var _api$1 = _classPrivateFieldLooseKey("api");

  var _session = _classPrivateFieldLooseKey("session");

  var _user = _classPrivateFieldLooseKey("user");

  var _account = _classPrivateFieldLooseKey("account");

  var _logger$3 = _classPrivateFieldLooseKey("logger");

  var _device = _classPrivateFieldLooseKey("device");

  var _event = _classPrivateFieldLooseKey("event");

  var _domain = _classPrivateFieldLooseKey("domain");

  var _broadDomain = _classPrivateFieldLooseKey("broadDomain");

  var _requestTime = _classPrivateFieldLooseKey("requestTime");

  var _seqNo = _classPrivateFieldLooseKey("seqNo");

  var _wiz_counter = _classPrivateFieldLooseKey("wiz_counter");

  var _globalCache = _classPrivateFieldLooseKey("globalCache");

  var _onloadcalled = _classPrivateFieldLooseKey("onloadcalled");

  var _processingBackup$1 = _classPrivateFieldLooseKey("processingBackup");

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
      Object.defineProperty(this, _logger$3, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _device, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _event, {
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
      Object.defineProperty(this, _processingBackup$1, {
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
      // this.event = Array.isArray(clevertap.event) ? clevertap.event : []
      // this.profile = Array.isArray(clevertap.profile) ? clevertap.profile : []
      // this.account = Array.isArray(clevertap.account) ? clevertap.account : []
      // this.onUserLogin = Array.isArray(clevertap.onUserLogin) ? clevertap.onUserLogin : []
      // this.notifications = Array.isArray(clevertap.notifications) ? clevertap.notifications : []
      // this.privacy = Array.isArray(clevertap.privacy) ? clevertap.privacy : []
      // Initialize Modules
      _classPrivateFieldLooseBase(this, _logger$3)[_logger$3] = new Logger(logLevels.INFO);
      _classPrivateFieldLooseBase(this, _account)[_account] = new Account({
        logger: _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]
      });
      _classPrivateFieldLooseBase(this, _event)[_event] = new EventHandler({
        api: _classPrivateFieldLooseBase(this, _api$1)[_api$1],
        logger: _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]
      }); // Other Properties

      _classPrivateFieldLooseBase(this, _requestTime)[_requestTime] = 0;
      _classPrivateFieldLooseBase(this, _seqNo)[_seqNo] = 0;
      _classPrivateFieldLooseBase(this, _wiz_counter)[_wiz_counter] = 0; // to keep track of number of times we load the body

      _classPrivateFieldLooseBase(this, _globalCache)[_globalCache] = {};
      _classPrivateFieldLooseBase(this, _onloadcalled)[_onloadcalled] = false;
      _classPrivateFieldLooseBase(this, _processingBackup$1)[_processingBackup$1] = false;
      _classPrivateFieldLooseBase(this, _unsubGroups)[_unsubGroups] = [];
      _classPrivateFieldLooseBase(this, _campaignDivMap)[_campaignDivMap] = {};
      _classPrivateFieldLooseBase(this, _blockRequeust)[_blockRequeust] = false;
      _classPrivateFieldLooseBase(this, _clearCookie)[_clearCookie] = false;
      _classPrivateFieldLooseBase(this, _LRU_CACHE_SIZE)[_LRU_CACHE_SIZE] = 100;
      _classPrivateFieldLooseBase(this, _fcmPublicKey)[_fcmPublicKey] = null;
      window.$ct = {
        globalCache: {}
      };
    }

    _createClass(CleverTap, [{
      key: "init",
      value: function init(id, region) {
        if (id + '' === '') {
          _classPrivateFieldLooseBase(this, _logger$3)[_logger$3].error(errors.INVALID_ACCOUNT);

          return;
        }

        _classPrivateFieldLooseBase(this, _account)[_account].accountID = id;
        _classPrivateFieldLooseBase(this, _session)[_session] = new SessionManager(_classPrivateFieldLooseBase(this, _account)[_account].accountID);

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

        _classPrivateFieldLooseBase(this, _device)[_device] = new DeviceManager(_classPrivateFieldLooseBase(this, _account)[_account].accountID, _classPrivateFieldLooseBase(this, _logger$3)[_logger$3]);
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
