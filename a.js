function __wizrocket() {


  var targetDomain = 'wzrkt.com';
  // var targetDomain = 'localhost:3838'; //ALWAYS comment this line before deploying

  var wz_pr = "https:";

  var dataPostURL, recorderURL, emailURL;
  var wiz = this;
  // var serviceWorkerPath = '/clevertap_sw.js'; // the service worker is placed in the doc root
  var doc = document;
  var domain = window.location.hostname;
  var broadDomain;
  var wc = window.console;
  var requestTime = 0, seqNo = 0;
  var wzrk_error = {}; //to trap input errors
  var wiz_counter = 0; // to keep track of number of times we load the body
  var globalCache = {};
  // to be used for checking whether the script loaded fine and the wiz.init function was called
  var onloadcalled = 0;  // 1 = fired
  var processingBackup = false;

  var gcookie, scookieObj;
  var accountId, region;
  var campaignDivMap = {};
  var blockRequeust = false, clearCookie = false;
  var SCOOKIE_NAME, globalChargedId;
  var globalEventsMap, globalProfileMap, currentSessionId;
  var storageDelim = "|$|";
  var staleEvtMaxTime = 20 * 60; //20 mins
  var COOKIE_EXPIRY = 86400 * 365 * 10; //10 years in seconds. Seconds in an days * days in an year * number of years
  var LRU_CACHE, LRU_CACHE_SIZE = 100;
  var chromeAgent;
  var firefoxAgent;

  // for VAPID web push
  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')
    ;
    var rawData = window.atob(base64);
    var processedData = []
    for (var i=0; i<rawData.length; i++) {
      processedData.push(rawData.charCodeAt(i))
    }
    return new Uint8Array(processedData);
  }

  var fcmPublicKey = null;


  var STRING_CONSTANTS = {
    CLEAR: 'clear',
    CHARGED_ID: 'Charged ID',
    CHARGEDID_COOKIE_NAME: 'WZRK_CHARGED_ID',
    GCOOKIE_NAME: 'WZRK_G',
    KCOOKIE_NAME: 'WZRK_K',
    CAMP_COOKIE_NAME: 'WZRK_CAMP',
    SCOOKIE_PREFIX: 'WZRK_S',
    EV_COOKIE: 'WZRK_EV',
    META_COOKIE: 'WZRK_META',
    PR_COOKIE: 'WZRK_PR',
    ARP_COOKIE: 'WZRK_ARP',
    LCOOKIE_NAME: 'WZRK_L',
    NOTIF_COOKIE_NAME: 'WZRK_N',
    GLOBAL: 'global',
    TOTAL_COUNT: 'tc',
    DISPLAY: 'display',
    UNDEFINED: 'undefined',
    WEBPUSH_LS_KEY: 'WZRK_WPR',
    OPTOUT_KEY: 'optOut',
    CT_OPTOUT_KEY: 'ct_optout',
    OPTOUT_COOKIE_ENDSWITH: ':OO',
    USEIP_KEY: 'useIP',
    LRU_CACHE: 'WZRK_X',
    IS_OUL: "isOUL"
  };

  // path to reference the JS for our dialog
  var wizAlertJSPath = 'https://d2r1yp2w7bby2u.cloudfront.net/js/wzrk_dialog.min.js';

  var FIRST_PING_FREQ_IN_MILLIS = 2 * 60 * 1000; // 2 mins
  var CONTINUOUS_PING_FREQ_IN_MILLIS = 5 * 60 * 1000; // 5 mins

  var TWENTY_MINS = 20 * 60 * 1000;

  var SCOOKIE_EXP_TIME_IN_SECS = 60 * 20;  // 20 mins


  var EVT_PING = "ping", EVT_PUSH = "push";

  var wizrocket = window['wizrocket'];

  var REQ_N = 0;
  var RESP_N = 0;

  if (typeof clevertap != STRING_CONSTANTS.UNDEFINED) {
    wizrocket = clevertap;
    window['wizrocket'] = clevertap;
  } else {
    window['clevertap'] = wizrocket;
  }

  var webPushEnabled; // gets set to true on page request, when chrome notifs have been integrated completely

  wiz.is_onloadcalled = function () {
    return (onloadcalled === 1);
  };

  // use these to add and remove sweet alert dialogs as necessary
  wiz.addWizAlertJS = function () {
    var scriptTag = doc.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('id', 'wzrk-alert-js');
    scriptTag.setAttribute('src', wizAlertJSPath);

    // add the script tag to the end of the body
    document.getElementsByTagName('body')[0].appendChild(scriptTag);

    return scriptTag;
  };

  wiz.removeWizAlertJS = function () {
    var scriptTag = doc.getElementById('wzrk-alert-js');
    scriptTag.parentNode.removeChild(scriptTag);
  };


  wiz.enableWebPush = function (enabled, applicationServerKey) {
    webPushEnabled = enabled;
    if(applicationServerKey != null) {
      wiz.setApplicationServerKey(applicationServerKey);
    }
    if (webPushEnabled && notifApi.notifEnabledFromApi) {
      wiz.handleNotificationRegistration(notifApi.displayArgs);
    } else if (!webPushEnabled && notifApi.notifEnabledFromApi) {
      wc.e('Ensure that web push notifications are fully enabled and integrated before requesting them');
    }
  };

  /**
   * Sets up a service worker for WebPush(chrome/Firefox) push notifications and sends the data to LC
   */
  wiz.setUpWebPushNotifications = function (subscriptionCallback, serviceWorkerPath) {


    if ('serviceWorker' in navigator) {
      navigator["serviceWorker"]['register'](serviceWorkerPath)['then'](function () {
        return navigator['serviceWorker']['ready'];
      })['then'](function (serviceWorkerRegistration) {

        var subscribeObj = { "userVisibleOnly": true }

        if(fcmPublicKey != null) {
          subscribeObj["applicationServerKey"] = urlBase64ToUint8Array(fcmPublicKey)
        }

        serviceWorkerRegistration['pushManager']['subscribe'](subscribeObj)
          ['then'](function (subscription) {
          wc.l('Service Worker registered. Endpoint: ' + subscription['endpoint']);

          // convert the subscription keys to strings; this sets it up nicely for pushing to LC
          var subscriptionData = JSON.parse(JSON.stringify(subscription));

          // remove the common chrome/firefox endpoint at the beginning of the token
          if(navigator.userAgent.indexOf('Chrome') !== -1){
            subscriptionData['endpoint'] = subscriptionData['endpoint'].split('/').pop();
            subscriptionData['browser'] = 'Chrome';
          }else if(navigator.userAgent.indexOf('Firefox') !== -1){
            subscriptionData['endpoint'] = subscriptionData['endpoint'].split('/').pop();
            subscriptionData['browser'] = 'Firefox';
          }

          var sessionObj = wiz.getSessionCookieObject();
          // var shouldSendToken = typeof sessionObj['p'] === STRING_CONSTANTS.UNDEFINED || sessionObj['p'] === 1
          //     || sessionObj['p'] === 2 || sessionObj['p'] === 3 || sessionObj['p'] === 4 || sessionObj['p'] === 5;
          var shouldSendToken = true;
          if (shouldSendToken) {
            var payload = subscriptionData;
            payload = wiz.addSystemDataToObject(payload, true);
            payload = JSON.stringify(payload);
            var pageLoadUrl = dataPostURL;
            pageLoadUrl = wiz.addToURL(pageLoadUrl, "type", "data");
            pageLoadUrl = wiz.addToURL(pageLoadUrl, "d", wiz.compressData(payload));
            wiz.fireRequest(pageLoadUrl);
            //set in localstorage
            if (wzrk_util.isLocalStorageSupported()) {
              localStorage.setItem(STRING_CONSTANTS.WEBPUSH_LS_KEY, 'ok');
            }
          }

          if (typeof subscriptionCallback !== "undefined" && typeof subscriptionCallback === "function") {
            subscriptionCallback();
          }
        })['catch'](function (error) {
          wc.l('Error subscribing: ' + error);
          //unsubscribe from webpush if error
          serviceWorkerRegistration['pushManager']['getSubscription']()['then'](function (subscription) {
            if (subscription !== null) {
              subscription['unsubscribe']()['then'](function (successful) {
                // You've successfully unsubscribed
                wc.l('Unsubscription successful');
              })['catch'](function (e) {
                // Unsubscription failed
                wc.l('Error unsubscribing: ' + e)
              })
            }
          })
        });
      })['catch'](function (err) {
        wc.l('error registering service worker: ' + err);
      });
    }
  };

  wiz.getCleverTapID = function () {
    return gcookie;
  };

  wiz.init = function () {


    wc = {
      e: function (msg) {
        if (window.console) {
          var ts = new Date().getTime();
          console.error(ts + " " + msg);
        }
      },
      d: function (msg) {
        if (window.console && wiz.isDebug()) {
          var ts = new Date().getTime();
          console.debug(ts + " " + msg);
        }
      },
      l: function (msg) {
        if (window.console) {
          var ts = new Date().getTime();
          console.log(ts + " " + msg);
        }
      }
    };

    //delete pcookie
    wiz.deleteCookie("WZRK_P", window.location.hostname);
    wiz.g(); // load cookies on pageload; this HAS to be the first thing in this method


    if (typeof wizrocket['account'][0] == STRING_CONSTANTS.UNDEFINED) {
      wc.e(wzrk_msg['embed-error']);
      return;
    } else {
      accountId = wizrocket['account'][0]['id'];

      if (typeof accountId == STRING_CONSTANTS.UNDEFINED || accountId == '') {
        wc.e(wzrk_msg['embed-error']);
        return;
      }
      SCOOKIE_NAME = STRING_CONSTANTS.SCOOKIE_PREFIX + '_' + accountId;

    }
    if (typeof wizrocket['region'] != STRING_CONSTANTS.UNDEFINED) {
      region = wizrocket['region'];
      targetDomain = region + '.' + targetDomain;
    }

    dataPostURL = wz_pr + '//' + targetDomain + '/a?t=95';
    recorderURL = wz_pr + '//' + targetDomain + '/r?r=1';
    emailURL = wz_pr + '//' + targetDomain + '/e?r=1';

    var currLocation = location.href;
    var url_params = wzrk_util.getURLParams(location.href.toLowerCase());

    if (typeof url_params['e'] != STRING_CONSTANTS.UNDEFINED && url_params['wzrk_ex'] == '0') {
      return;
    }

    wiz.processBackupEvents();
    wiz.overloadArrayPush();

    // -- update page count
    var obj = wiz.getSessionCookieObject();
    var pgCount = (typeof obj['p'] == STRING_CONSTANTS.UNDEFINED) ? 0 : obj['p'];
    obj['p'] = ++pgCount;
    wiz.setSessionCookieObject(obj);
    // -- update page count


    var data = {};

    //var curr_domain = doc.location.hostname;
    var referrer_domain = wzrk_util.getDomain(doc.referrer);

    if (domain != referrer_domain) {
      var maxLen = 120;
      if (referrer_domain != "") {  //referrer exists, sending even when session exists as "x.in.com" and "y.in.com" could be separate accounts, but session created on domain "in.com"
        referrer_domain = referrer_domain.length > maxLen ? referrer_domain.substring(0, maxLen) : referrer_domain;
        data['referrer'] = referrer_domain;
      }


      var utm_source = url_params['utm_source'] || url_params['wzrk_source'];
      if (typeof utm_source != STRING_CONSTANTS.UNDEFINED) {
        utm_source = utm_source.length > maxLen ? utm_source.substring(0, maxLen) : utm_source;
        data['us'] = utm_source;                  //utm_source
      }

      var utm_medium = url_params['utm_medium'] || url_params['wzrk_medium'];
      if (typeof utm_medium != STRING_CONSTANTS.UNDEFINED) {
        utm_medium = utm_medium.length > maxLen ? utm_medium.substring(0, maxLen) : utm_medium;
        data['um'] = utm_medium;                 //utm_medium
      }


      var utm_campaign = url_params['utm_campaign'] || url_params['wzrk_campaign'];
      if (typeof utm_campaign != STRING_CONSTANTS.UNDEFINED) {
        utm_campaign = utm_campaign.length > maxLen ? utm_campaign.substring(0, maxLen) : utm_campaign;
        data['uc'] = utm_campaign;               //utm_campaign
      }

      // also independently send wzrk_medium to the backend
      if (typeof url_params['wzrk_medium'] != STRING_CONSTANTS.UNDEFINED) {
        var wm = url_params['wzrk_medium'];
        if (wm.match(/^email$|^social$|^search$/)) {
          data['wm'] = wm;                       //wzrk_medium
        }

      }

    }

    data = wiz.addSystemDataToObject(data, undefined);
    data['cpg'] = currLocation;

    data[STRING_CONSTANTS.CAMP_COOKIE_NAME] = wiz.getCampaignObjForLc();
    var pageLoadUrl = dataPostURL;
    wiz.addFlags(data);
    //send dsync flag when page = 1
    if (data['pg'] != STRING_CONSTANTS.UNDEFINED && data['pg'] == 1) {
      wiz.overrideDSyncFlag(data);
    }
    pageLoadUrl = wiz.addToURL(pageLoadUrl, "type", "page");
    pageLoadUrl = wiz.addToURL(pageLoadUrl, "d", wiz.compressData(JSON.stringify(data)));
    wiz.saveAndFireRequest(pageLoadUrl, false);


    // -- ping request logic

    var pingRequest = function () {
      var pageLoadUrl = dataPostURL;
      var data = {};
      data = wiz.addSystemDataToObject(data, undefined);

      pageLoadUrl = wiz.addToURL(pageLoadUrl, "type", EVT_PING);
      pageLoadUrl = wiz.addToURL(pageLoadUrl, "d", wiz.compressData(JSON.stringify(data)));
      wiz.saveAndFireRequest(pageLoadUrl, false);
    };

    setTimeout(function () {
      if (pgCount <= 3) {  // send ping for up to 3 pages
        pingRequest();
      }

      if (wiz.isPingContinuous()) {
        setInterval(function () {
          pingRequest();
        }, CONTINUOUS_PING_FREQ_IN_MILLIS);
      }
    }, FIRST_PING_FREQ_IN_MILLIS);

    // -- ping request logic


    if (typeof wizrocket['session'] == STRING_CONSTANTS.UNDEFINED) {

      wizrocket['event']['getDetails'] = function (evtName) {
        if (!wzrk_util.isPersonalizationActive()) {
          return;
        }
        if (typeof globalEventsMap == STRING_CONSTANTS.UNDEFINED) {
          globalEventsMap = wiz.readFromLSorCookie(STRING_CONSTANTS.EV_COOKIE);
        }
        if (typeof globalEventsMap == STRING_CONSTANTS.UNDEFINED) {
          return;
        }
        var evtObj = globalEventsMap[evtName];
        var respObj = {};

        if (typeof evtObj != STRING_CONSTANTS.UNDEFINED) {
          respObj['firstTime'] = new Date(evtObj[1] * 1000);
          respObj['lastTime'] = new Date(evtObj[2] * 1000);
          respObj['count'] = evtObj[0];
          return respObj;
        }


      };

      wizrocket['profile']['getAttribute'] = function (propName) {
        if (!wzrk_util.isPersonalizationActive()) {
          return;
        }
        if (typeof globalProfileMap == STRING_CONSTANTS.UNDEFINED) {
          globalProfileMap = wiz.readFromLSorCookie(STRING_CONSTANTS.PR_COOKIE);
        }
        if (typeof globalProfileMap != STRING_CONSTANTS.UNDEFINED) {
          return globalProfileMap[propName];
        }
      };
      wizrocket['session'] = {};
      wizrocket['session']['getTimeElapsed'] = function () {
        if (!wzrk_util.isPersonalizationActive()) {
          return;
        }
        if (typeof scookieObj != STRING_CONSTANTS.UNDEFINED) {
          scookieObj = wiz.getSessionCookieObject();
        }
        var sessionStart = scookieObj['s'];
        if (typeof sessionStart != STRING_CONSTANTS.UNDEFINED) {
          var ts = wzrk_util.getNow();
          return Math.floor(ts - sessionStart);
        }
      };

      wizrocket['user'] = {};
      wizrocket['user']['getTotalVisits'] = function () {
        if (!wzrk_util.isPersonalizationActive()) {
          return;
        }
        var visitCount = wiz.getMetaProp('sc');
        if (typeof visitCount == STRING_CONSTANTS.UNDEFINED) {
          visitCount = 1;
        }
        return visitCount;
      };

      wizrocket['session']['getPageCount'] = function () {
        if (!wzrk_util.isPersonalizationActive()) {
          return;
        }

        if (typeof scookieObj != STRING_CONSTANTS.UNDEFINED) {
          scookieObj = wiz.getSessionCookieObject();
        }
        return scookieObj['p'];
      };

      wizrocket['user']['getLastVisit'] = function () {
        if (!wzrk_util.isPersonalizationActive()) {
          return;
        }
        var prevSession = wiz.getMetaProp('ps');
        if (typeof prevSession != STRING_CONSTANTS.UNDEFINED) {
          return new Date(prevSession * 1000);
        }
      };
    }
    onloadcalled = 1;   //always the last line in this function


  };


  wiz.readFromLSorCookie = function (property) {
    var data;
    if (globalCache.hasOwnProperty(property)) {
      return globalCache[property];
    }
    if (wzrk_util.isLocalStorageSupported()) {
      data = localStorage[property];
    } else {
      data = wiz.readCookie(property);
    }
    if (typeof data != STRING_CONSTANTS.UNDEFINED && data !== null && data.trim() != '') {
      var value = JSON.parse(decodeURIComponent(data));
      globalCache[property] = value;
      return value;
    }
  };

  wiz.saveToLSorCookie = function (property, val) {
    if (typeof val == STRING_CONSTANTS.UNDEFINED || val == null) {
      return;
    }
    try {
      if (wzrk_util.isLocalStorageSupported()) {
        localStorage[property] = encodeURIComponent(JSON.stringify(val));
      } else {
        if (property === STRING_CONSTANTS.GCOOKIE_NAME) {
          wiz.createCookie(property, encodeURIComponent(val), 0, domain);
        } else {
          wiz.createCookie(property, encodeURIComponent(JSON.stringify(val)), 0, domain);
        }
      }
      globalCache[property] = val;
    } catch (e) {
    }
  };

  var processEvent = function (data) {

    wiz.addToLocalEventMap(data['evtName']);
    data = wiz.addSystemDataToObject(data, undefined);
    wiz.addFlags(data);
    data[STRING_CONSTANTS.CAMP_COOKIE_NAME] = wiz.getCampaignObjForLc();
    var compressedData = wiz.compressData(JSON.stringify(data));

    var pageLoadUrl = dataPostURL;
    pageLoadUrl = wiz.addToURL(pageLoadUrl, "type", EVT_PUSH);
    pageLoadUrl = wiz.addToURL(pageLoadUrl, "d", compressedData);


    wiz.saveAndFireRequest(pageLoadUrl, false);
  };

  wiz.processEventArray = function (eventArr) {

    if (wzrk_util.isArray(eventArr)) {

      /** looping since the events could be fired in quick succession, and we could end up
       with multiple pushes without getting a chance to process
       */
      while (eventArr.length > 0) {

        var eventName = eventArr.shift(); // take out name of the event

        if (!wzrk_util.isString(eventName)) {
          wc.e(wzrk_msg['event-error']);
          return;
        }

        if (eventName.length > 1024) {
          eventName = eventName.substring(0, 1024);
          wiz.reportError(510, eventName + "... length exceeded 1024 chars. Trimmed.");
        }

        if (eventName == "Stayed" || eventName == "UTM Visited" || eventName == "App Launched" ||
          eventName == "Notification Sent" || eventName == "Notification Viewed" || eventName == "Notification Clicked") {
          wiz.reportError(513, eventName + " is a restricted system event. It cannot be used as an event name.");
          continue;
        }
        var data = {};
        data['type'] = "event";
        data['evtName'] = wzrk_util.sanitize(eventName, unsupportedKeyCharRegex);

        if (eventArr.length != 0) {
          var eventObj = eventArr.shift();

          if (!wzrk_util.isObject(eventObj)) {
            eventArr.unshift(eventObj);    // put it back if it is not an object
          } else {
            //check Charged Event vs. other events.
            if (eventName == "Charged") {
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
  };

  wiz.addToLocalEventMap = function (evtName) {
    if (wzrk_util.isLocalStorageSupported()) {
      if (typeof globalEventsMap == STRING_CONSTANTS.UNDEFINED) {
        globalEventsMap = wiz.readFromLSorCookie(STRING_CONSTANTS.EV_COOKIE);
        if (typeof globalEventsMap == STRING_CONSTANTS.UNDEFINED) {
          globalEventsMap = {};
        }
      }
      var nowTs = wzrk_util.getNow();
      var evtDetail = globalEventsMap[evtName];
      if (typeof evtDetail != STRING_CONSTANTS.UNDEFINED) {
        evtDetail[2] = nowTs;
        evtDetail[0]++;
      } else {
        evtDetail = [];
        evtDetail.push(1);
        evtDetail.push(nowTs);
        evtDetail.push(nowTs);
      }
      globalEventsMap[evtName] = evtDetail;
      wiz.saveToLSorCookie(STRING_CONSTANTS.EV_COOKIE, globalEventsMap);
    }
  };

  wiz.addToLocalProfileMap = function (profileObj, override) {
    if (wzrk_util.isLocalStorageSupported()) {
      if (typeof globalProfileMap == STRING_CONSTANTS.UNDEFINED) {
        globalProfileMap = wiz.readFromLSorCookie(STRING_CONSTANTS.PR_COOKIE);
        if (typeof globalProfileMap == STRING_CONSTANTS.UNDEFINED) {
          globalProfileMap = {};
        }
      }

      //Move props from custom bucket to outside.
      if (typeof profileObj['_custom'] != STRING_CONSTANTS.UNDEFINED) {
        var keys = profileObj['_custom'];
        for (var key in keys) {
          if (keys.hasOwnProperty(key)) {
            profileObj[key] = keys[key];
          }
        }
        delete profileObj['_custom'];
      }

      for (var prop in profileObj) {
        if (profileObj.hasOwnProperty(prop)) {
          if (globalProfileMap.hasOwnProperty(prop) && !override) {
            continue;
          }
          globalProfileMap[prop] = profileObj[prop];
        }
      }
      if (typeof globalProfileMap['_custom'] != STRING_CONSTANTS.UNDEFINED) {
        delete globalProfileMap['_custom'];
      }
      wiz.saveToLSorCookie(STRING_CONSTANTS.PR_COOKIE, globalProfileMap);
    }
  };

  wiz.overrideDSyncFlag = function (data) {
    if (wzrk_util.isPersonalizationActive()) {
      data['dsync'] = true;
    }
  };

  wiz.addARPToRequest = function (url, skipResARP) {
    if(typeof skipResARP !== STRING_CONSTANTS.UNDEFINED && skipResARP === true) {
      var _arp = {};
      _arp["skipResARP"] = true;
      return wiz.addToURL(url, 'arp', wiz.compressData(JSON.stringify(_arp)));
    }
    if (wzrk_util.isLocalStorageSupported() && typeof localStorage[STRING_CONSTANTS.ARP_COOKIE] != STRING_CONSTANTS.UNDEFINED) {
      return wiz.addToURL(url, 'arp', wiz.compressData(JSON.stringify(wiz.readFromLSorCookie(STRING_CONSTANTS.ARP_COOKIE))));
    }
    return url;
  };

  wiz.addFlags = function (data) {

    //check if cookie should be cleared.
    clearCookie = wiz.getAndClearMetaProp(STRING_CONSTANTS.CLEAR);
    if (clearCookie !== undefined && clearCookie) {
      data['rc'] = true;
      wc.d("reset cookie sent in request and cleared from meta for future requests.");
    }
    if (wzrk_util.isPersonalizationActive()) {
      var lastSyncTime = wiz.getMetaProp('lsTime');
      var expirySeconds = wiz.getMetaProp('exTs');

      //dsync not found in local storage - get data from server
      if (typeof lastSyncTime == STRING_CONSTANTS.UNDEFINED || typeof expirySeconds == STRING_CONSTANTS.UNDEFINED) {
        data['dsync'] = true;
        return;
      }
      var now = wzrk_util.getNow();
      //last sync time has expired - get fresh data from server
      if (lastSyncTime + expirySeconds < now) {
        data['dsync'] = true;
      }
    }


  };

  var unregisterTokenForGuid = function (givenGUID) {
    var data = {};
    data["type"] = "data";
    if (wiz.isValueValid(givenGUID)) {
      data["g"] = givenGUID;
    }
    data["action"] = "unregister";
    data["id"] = accountId;

    var obj = wiz.getSessionCookieObject();

    data["s"] = obj["s"]; //Session cookie
    var compressedData = wiz.compressData(JSON.stringify(data));

    var pageLoadUrl = dataPostURL;
    pageLoadUrl = wiz.addToURL(pageLoadUrl, "type", "data");
    pageLoadUrl = wiz.addToURL(pageLoadUrl, "d", compressedData);

    wiz.fireRequest(pageLoadUrl, true);
  };

  var LRU_cache = function (max) {
    this.max = max;
    var keyOrder;
    var LRU_CACHE = wiz.readFromLSorCookie(STRING_CONSTANTS.LRU_CACHE);
    if (LRU_CACHE) {
      var lru_cache = {};
      keyOrder = [];
      LRU_CACHE = LRU_CACHE.cache;
      for (var entry in LRU_CACHE) {
        if(LRU_CACHE.hasOwnProperty(entry)) {
          lru_cache[LRU_CACHE[entry][0]] = LRU_CACHE[entry][1];
          keyOrder.push(LRU_CACHE[entry][0]);
        }

      }
      this.cache = lru_cache;
    } else {
      this.cache = {};
      keyOrder = [];
    }

    this.get = function (key) {
      var item = this.cache[key];
      if (item) {
        var temp_val = item;
        this.cache = deleteFromObject(key, this.cache);
        this.cache[key] = item;
        keyOrder.push(key);
      }
      this.saveCacheToLS(this.cache);
      return item;
    };

    this.set = function (key, value) {
      var item = this.cache[key];
      var all_keys = keyOrder;
      if (item != null) {
        this.cache = deleteFromObject(key, this.cache);
      } else if (all_keys.length === this.max) {
        this.cache = deleteFromObject(
          all_keys[0],
          this.cache
        );
      }
      this.cache[key] = value;
      if (keyOrder[keyOrder.length - 1] !== key) {
        keyOrder.push(key);
      }
      this.saveCacheToLS(this.cache);
    };

    this.saveCacheToLS = function (cache) {
      var obj_to_array = [];
      var all_keys = keyOrder;
      for (var index in all_keys) {
        if(all_keys.hasOwnProperty(index)) {
          var temp = [];
          temp.push(all_keys[index]);
          temp.push(cache[all_keys[index]]);
          obj_to_array.push(temp);
        }
      }
      wiz.saveToLSorCookie(STRING_CONSTANTS.LRU_CACHE, {
        cache: obj_to_array
      });
    };

    this.getKEY = function (givenVal) {
      if (givenVal == null) return null;
      var all_keys = keyOrder;
      for (var index in all_keys) {
        if(all_keys.hasOwnProperty(index)) {
          if (
            this.cache[all_keys[index]] != null &&
            this.cache[all_keys[index]] === givenVal
          ) {
            return all_keys[index];
          }
        }
      }
      return null;
    };

    this.getSecondLastKEY = function () {
      var keysArr = keyOrder;
      if (keysArr != null && keysArr.length > 1) {
        return keysArr[keysArr.length - 2];
      } else {
        return -1;
      }
    };

    this.getLastKey = function () {
      if (keyOrder.length) {
        return keyOrder[keyOrder.length - 1];
      }
    };


    var deleteFromObject = function (key, obj) {
      var all_keys = JSON.parse(JSON.stringify(keyOrder));
      var new_cache = {};
      var indexToDelete;
      for (var index in all_keys) {
        if(all_keys.hasOwnProperty(index)) {
          if (all_keys[index] !== key) {
            new_cache[all_keys[index]] = obj[all_keys[index]];
          } else {
            indexToDelete = index;
          }
        }
      }
      all_keys.splice(indexToDelete, 1);
      keyOrder = JSON.parse(JSON.stringify(all_keys));
      return new_cache;
    };
  };

  wiz.getCampaignObjForLc = function () {
    var campObj = {};
    if (wzrk_util.isLocalStorageSupported()) {
      campObj = wzrk_util.getCampaignObject();

      var resultObj = [];
      var globalObj = campObj['global'];
      var today = wzrk_util.getToday();
      var dailyObj = campObj[today];

      if (typeof globalObj != STRING_CONSTANTS.UNDEFINED) {
        var campaignIdArray = Object.keys(globalObj);
        for (var index in campaignIdArray) {
          if (campaignIdArray.hasOwnProperty(index)) {
            var dailyC = 0;
            var totalC = 0;
            var campaignId = campaignIdArray[index];
            if (campaignId == 'tc') {
              continue;
            }
            if (typeof dailyObj != STRING_CONSTANTS.UNDEFINED && typeof dailyObj[campaignId] != STRING_CONSTANTS.UNDEFINED) {
              dailyC = dailyObj[campaignId];
            }
            if (typeof globalObj != STRING_CONSTANTS.UNDEFINED && typeof globalObj[campaignId] != STRING_CONSTANTS.UNDEFINED) {
              totalC = globalObj[campaignId];
            }
            var element = [campaignId, dailyC, totalC];
            resultObj.push(element);
          }
        }
      }
      var todayC = 0;
      if (typeof dailyObj != STRING_CONSTANTS.UNDEFINED && typeof dailyObj['tc'] != STRING_CONSTANTS.UNDEFINED) {
        todayC = dailyObj['tc'];
      }
      resultObj = {"wmp": todayC, 'tlc': resultObj};
      return resultObj;
    }
  };

  var handleCookieFromCache = function () {
    blockRequeust = false;
    wc.d("Block request is false");
    if (wzrk_util.isLocalStorageSupported()) {
      delete localStorage[STRING_CONSTANTS.PR_COOKIE];
      delete localStorage[STRING_CONSTANTS.EV_COOKIE];
      delete localStorage[STRING_CONSTANTS.META_COOKIE];
      delete localStorage[STRING_CONSTANTS.ARP_COOKIE];
      delete localStorage[STRING_CONSTANTS.CAMP_COOKIE_NAME];
      delete localStorage[STRING_CONSTANTS.CHARGEDID_COOKIE_NAME];
    }
    wiz.deleteCookie(STRING_CONSTANTS.CAMP_COOKIE_NAME, domain);
    wiz.deleteCookie(SCOOKIE_NAME, broadDomain);
    wiz.deleteCookie(STRING_CONSTANTS.ARP_COOKIE, broadDomain);
    scookieObj = '';
  };

  var deleteUser = function () {
    blockRequeust = true;
    wc.d("Block request is true");
    globalCache = {};
    if (wzrk_util.isLocalStorageSupported()) {
      delete localStorage[STRING_CONSTANTS.GCOOKIE_NAME];
      delete localStorage[STRING_CONSTANTS.KCOOKIE_NAME];
      delete localStorage[STRING_CONSTANTS.PR_COOKIE];
      delete localStorage[STRING_CONSTANTS.EV_COOKIE];
      delete localStorage[STRING_CONSTANTS.META_COOKIE];
      delete localStorage[STRING_CONSTANTS.ARP_COOKIE];
      delete localStorage[STRING_CONSTANTS.CAMP_COOKIE_NAME];
      delete localStorage[STRING_CONSTANTS.CHARGEDID_COOKIE_NAME];
    }
    wiz.deleteCookie(STRING_CONSTANTS.GCOOKIE_NAME, broadDomain);
    wiz.deleteCookie(STRING_CONSTANTS.CAMP_COOKIE_NAME, domain);
    wiz.deleteCookie(STRING_CONSTANTS.KCOOKIE_NAME, domain);
    wiz.deleteCookie(SCOOKIE_NAME, broadDomain);
    wiz.deleteCookie(STRING_CONSTANTS.ARP_COOKIE, broadDomain);
    gcookie = null;
    scookieObj = '';

  };

  var setInstantDeleteFlagInK = function () {
    var k = wiz.readFromLSorCookie(STRING_CONSTANTS.KCOOKIE_NAME);
    if (typeof k == STRING_CONSTANTS.UNDEFINED) {
      k = {};
    }
    k['flag'] = true;
    wiz.saveToLSorCookie(STRING_CONSTANTS.KCOOKIE_NAME, k);
  };

  wiz.logout = function () {
    wc.d("logout called");
    setInstantDeleteFlagInK();
  };


  wiz.clear = function () {
    wc.d("clear called. Reset flag has been set.");
    deleteUser();
    wiz.setMetaProp(STRING_CONSTANTS.CLEAR, true);
  };


  /*
        We dont set the arp in cache for deregister requests.
        For deregister requests we check for 'skipResARP' flag payload. If present we skip it.

        Whenever we get 'isOUL' flag true in payload we delete the existing ARP instead of updating it.
     */
  wiz.arp = function (jsonMap) {
    // For unregister calls dont set arp in LS
    if(typeof jsonMap["skipResARP"] !== STRING_CONSTANTS.UNDEFINED && jsonMap["skipResARP"]) {
      wc.d("Update ARP Request rejected", jsonMap);
      return null;
    }

    var isOULARP = (typeof jsonMap[STRING_CONSTANTS.IS_OUL] !== STRING_CONSTANTS.UNDEFINED
      && jsonMap[STRING_CONSTANTS.IS_OUL] === true) ? true : false;

    if (wzrk_util.isLocalStorageSupported()) {
      try {
        var arpFromStorage = wiz.readFromLSorCookie(STRING_CONSTANTS.ARP_COOKIE);
        if (typeof arpFromStorage == STRING_CONSTANTS.UNDEFINED || isOULARP) {
          arpFromStorage = {};
        }

        for (var key in jsonMap) {
          if (jsonMap.hasOwnProperty(key)) {
            if (jsonMap[key] == -1) {
              delete arpFromStorage[key];
            } else {
              arpFromStorage[key] = jsonMap[key];
            }
          }
        }
        wiz.saveToLSorCookie(STRING_CONSTANTS.ARP_COOKIE, arpFromStorage);


      } catch (e) {
        wc.e("Unable to parse ARP JSON: " + e);
      }

    }
  };

  wiz.processProfileArray = function (profileArr) {
    if (wzrk_util.isArray(profileArr) && profileArr.length > 0) {

      for (var index in profileArr) {
        if(profileArr.hasOwnProperty(index)) {
          var outerObj = profileArr[index];
          var data = {};
          var profileObj;
          if (typeof outerObj['Site'] != STRING_CONSTANTS.UNDEFINED) {       //organic data from the site
            profileObj = outerObj['Site'];
            if (wzrk_util.isObjectEmpty(profileObj) || !wiz.isProfileValid(profileObj)) {
              return;
            }

          } else if (typeof outerObj['Facebook'] != STRING_CONSTANTS.UNDEFINED) {   //fb connect data
            var FbProfileObj = outerObj['Facebook'];
            //make sure that the object contains any data at all

            if (!wzrk_util.isObjectEmpty(FbProfileObj) && (!FbProfileObj['error'])) {
              profileObj = wiz.processFBUserObj(FbProfileObj);
            }

          } else if (typeof outerObj['Google Plus'] != STRING_CONSTANTS.UNDEFINED) {
            var GPlusProfileObj = outerObj['Google Plus'];
            if (!wzrk_util.isObjectEmpty(GPlusProfileObj) && (!GPlusProfileObj['error'])) {
              profileObj = wiz.processGPlusUserObj(GPlusProfileObj);
            }
          }
          if (typeof profileObj != STRING_CONSTANTS.UNDEFINED && (!wzrk_util.isObjectEmpty(profileObj))) {   // profile got set from above
            data['type'] = "profile";
            if (typeof profileObj['tz'] === STRING_CONSTANTS.UNDEFINED) {
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
  };

  /*
        anonymousUser   => Only GUID present.
        foundInCache    => Identity used in On User Login is present in LRU_CACHE. So use the guid associated with it.

        Clear the cache in case on On User Login and Block all the request till we get resume requests flag in the response.
        When user is found in Cache or the user is anonymous then dont block any requests. Just clear cache (handleCookieFromCache)


        On every On User Login we deregister the token for older User.
        If new user is found in Cache then we call deregister function now
        Else we call it once we get guid for new user in 'wiz.s' function.
     */
  wiz.processOUL = function (profileArr) {
    var sendOULFlag = true;
    var addToK = function (ids) {
      var k = wiz.readFromLSorCookie(STRING_CONSTANTS.KCOOKIE_NAME);
      var g = wiz.readFromLSorCookie(STRING_CONSTANTS.GCOOKIE_NAME);
      var kId, flag;
      var nowDate = new Date();
      if (typeof k == STRING_CONSTANTS.UNDEFINED) {
        k = {};
        kId = ids;
      } else {/*check if already exists*/
        kId = k['id'];
        var anonymousUser = false;
        var foundInCache = false;
        if (kId == null) {
          kId = ids[0];
          anonymousUser = true;
        }

        if (LRU_CACHE == null && wzrk_util.isLocalStorageSupported()) {
          LRU_CACHE = new LRU_cache(LRU_CACHE_SIZE);
        }

        if (anonymousUser) {
          if (wiz.isValueValid(g)) {
            LRU_CACHE.set(kId, g);
            blockRequeust = false;
          }
        } else {
          for (var idx in ids) {
            if(ids.hasOwnProperty(idx)) {
              var id = ids[idx];
              if (LRU_CACHE.cache[id]) {
                kId = id;
                foundInCache = true;
                break;
              }
            }
          }
        }

        if (foundInCache) {
          if (kId !== LRU_CACHE.getLastKey()) {
            // Same User
            handleCookieFromCache();
          } else {
            sendOULFlag = false;
          }
          var g_from_cache = LRU_CACHE.get(kId);
          LRU_CACHE.set(kId, g_from_cache);
          wiz.saveToLSorCookie(STRING_CONSTANTS.GCOOKIE_NAME, g_from_cache);
          gcookie = g_from_cache;

          var lastK = LRU_CACHE.getSecondLastKEY();
          if(lastK !== -1) {
            var lastGUID = LRU_CACHE.cache[lastK];
            unregisterTokenForGuid(lastGUID);
          }
        } else {
          if (!anonymousUser) {
            wiz.clear();
          } else {
            if (wiz.isValueValid(g)) {
              gcookie = g;
              wiz.saveToLSorCookie(STRING_CONSTANTS.GCOOKIE_NAME, g);
              sendOULFlag = false;
            }
          }
          kId = ids[0];
        }
      }
      k['id'] = kId;
      wiz.saveToLSorCookie(STRING_CONSTANTS.KCOOKIE_NAME, k);
    };

    if (wzrk_util.isArray(profileArr) && profileArr.length > 0) {

      for (var index in profileArr) {
        if(profileArr.hasOwnProperty(index)) {
          var outerObj = profileArr[index];
          var data = {};
          var profileObj;
          if (typeof outerObj['Site'] != STRING_CONSTANTS.UNDEFINED) {       //organic data from the site
            profileObj = outerObj['Site'];
            if (wzrk_util.isObjectEmpty(profileObj) || !wiz.isProfileValid(profileObj)) {
              return;
            }

          } else if (typeof outerObj['Facebook'] != STRING_CONSTANTS.UNDEFINED) {   //fb connect data
            var FbProfileObj = outerObj['Facebook'];
            //make sure that the object contains any data at all

            if (!wzrk_util.isObjectEmpty(FbProfileObj) && (!FbProfileObj['error'])) {
              profileObj = wiz.processFBUserObj(FbProfileObj);
            }

          } else if (typeof outerObj['Google Plus'] != STRING_CONSTANTS.UNDEFINED) {
            var GPlusProfileObj = outerObj['Google Plus'];
            if (!wzrk_util.isObjectEmpty(GPlusProfileObj) && (!GPlusProfileObj['error'])) {
              profileObj = wiz.processGPlusUserObj(GPlusProfileObj);
            }
          }
          if (typeof profileObj != STRING_CONSTANTS.UNDEFINED && (!wzrk_util.isObjectEmpty(profileObj))) {   // profile got set from above
            data['type'] = "profile";
            if (typeof profileObj['tz'] === STRING_CONSTANTS.UNDEFINED) {
              //try to auto capture user timezone if not present
              profileObj['tz'] = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
            }

            data['profile'] = profileObj;
            var ids = [];
            if (wzrk_util.isLocalStorageSupported()) {
              if (typeof profileObj['Identity'] != STRING_CONSTANTS.UNDEFINED) {
                ids.push(profileObj['Identity']);
              }
              if (typeof profileObj['Email'] != STRING_CONSTANTS.UNDEFINED) {
                ids.push(profileObj['Email']);
              }
              if (typeof profileObj['GPID'] != STRING_CONSTANTS.UNDEFINED) {
                ids.push("GP:" + profileObj['GPID']);
              }
              if (typeof profileObj['FBID'] != STRING_CONSTANTS.UNDEFINED) {
                ids.push("FB:" + profileObj['FBID']);
              }
              if (ids.length > 0) {
                addToK(ids);
              }
            }
            wiz.addToLocalProfileMap(profileObj, true);
            data = wiz.addSystemDataToObject(data, undefined);

            wiz.addFlags(data);
            // Adding 'isOUL' flag in true for OUL cases which.
            // This flag tells LC to create a new arp object.
            // Also we will receive the same flag in response arp which tells to delete existing arp object.
            if(sendOULFlag) {
              data[STRING_CONSTANTS.IS_OUL] = true;
            }

            var compressedData = wiz.compressData(JSON.stringify(data));

            var pageLoadUrl = dataPostURL;
            pageLoadUrl = wiz.addToURL(pageLoadUrl, "type", EVT_PUSH);
            pageLoadUrl = wiz.addToURL(pageLoadUrl, "d", compressedData);

            // Whenever sendOULFlag is true then dont send arp and gcookie (guid in memory in the request)
            // Also when this flag is set we will get another flag from LC in arp which tells us to delete arp
            // stored in the cache and replace it with the response arp.
            wiz.saveAndFireRequest(pageLoadUrl, blockRequeust, sendOULFlag);

          }
        }
      }
    }
  };

  wiz.processLoginArray = function (loginArr) {
    if (wzrk_util.isArray(loginArr) && loginArr.length > 0) {
      var profileObj = loginArr.pop();
      var processProfile = typeof profileObj != STRING_CONSTANTS.UNDEFINED && wzrk_util.isObject(profileObj) &&
        ((typeof profileObj['Site'] != STRING_CONSTANTS.UNDEFINED && Object.keys(profileObj["Site"]).length > 0) ||
          (typeof profileObj['Facebook'] != STRING_CONSTANTS.UNDEFINED && Object.keys(profileObj["Facebook"]).length > 0) ||
          (typeof profileObj['Google Plus'] != "undefined" && Object.keys(profileObj["Google Plus"]).length > 0));
      if (processProfile) {
        setInstantDeleteFlagInK();
        wiz.processOUL([profileObj]);
      } else {
        //console.error
        wc.e("Profile object is in incorrect format");
      }
    }
  };

  wiz.overloadArrayPush = function () {

    if (typeof wizrocket['onUserLogin'] === "undefined") {
      wizrocket['onUserLogin'] = [];
    }

    wizrocket['onUserLogin'].push = function () {
      //since arguments is not an array, convert it into an array
      wiz.processLoginArray(Array.prototype.slice.call(arguments));
      return 0;
    };

    if (typeof wizrocket['privacy'] === "undefined") {
      wizrocket['privacy'] = [];
    }

    wizrocket['privacy'].push = function () {
      //since arguments is not an array, convert it into an array
      wiz.processPrivacyArray(Array.prototype.slice.call(arguments));
      return 0;
    };

    wizrocket['event'].push = function () {
      //since arguments is not an array, convert it into an array
      wiz.processEventArray(Array.prototype.slice.call(arguments));
      return 0;
    };

    if (typeof wizrocket['notifications'] === STRING_CONSTANTS.UNDEFINED)
      wizrocket['notifications'] = [];

    wizrocket['notifications'].push = function () {
      wiz.setUpWebPush(Array.prototype.slice.call(arguments));
      return 0;
    };


    wizrocket['profile'].push = function () {
      //since arguments is not an array, convert it into an array
      wiz.processProfileArray(Array.prototype.slice.call(arguments));
      return 0;
    };
    wizrocket['logout'] = wiz.logout;
    wizrocket['clear'] = wiz.clear;
    wiz.processLoginArray(wizrocket['onUserLogin']);  // process old stuff from the login array before we overloaded the push method
    wiz.processPrivacyArray(wizrocket['privacy']);  // process old stuff from the privacy array before we overloaded the push method
    wiz.processEventArray(wizrocket['event']);      // process old stuff from the event array before we overloaded the push method
    wiz.processProfileArray(wizrocket['profile']);  // process old stuff from the profile array before we overloaded the push method
    wiz.setUpWebPush(wizrocket['notifications']); // process old stuff from notifications array before overload

    // clean up the notifications array
    while (wizrocket['notifications'].length > 0)
      wizrocket['notifications'].pop();
  };

  var isOptInRequest = false;

  var dropRequestDueToOptOut = function () {
    if (isOptInRequest || !wiz.isValueValid(gcookie) || !wzrk_util.isString(gcookie)) {
      isOptInRequest = false;
      return false;
    }
    return gcookie.slice(-3) === STRING_CONSTANTS.OPTOUT_COOKIE_ENDSWITH;
  };

  var addUseIPToRequest = function (pageLoadUrl) {
    var useIP = wiz.getMetaProp(STRING_CONSTANTS.USEIP_KEY);
    if (typeof useIP !== 'boolean') {
      useIP = false;
    }
    return wiz.addToURL(pageLoadUrl, STRING_CONSTANTS.USEIP_KEY, useIP ? 'true' : 'false');
  };

  wiz.processPrivacyArray = function (privacyArr) {
    if (wzrk_util.isArray(privacyArr) && privacyArr.length > 0) {
      var privacyObj = privacyArr[0];
      var data = {};
      var profileObj = {};
      if (privacyObj.hasOwnProperty(STRING_CONSTANTS.OPTOUT_KEY)) {
        var optOut = privacyObj[STRING_CONSTANTS.OPTOUT_KEY];
        if (typeof optOut === 'boolean') {
          profileObj[STRING_CONSTANTS.CT_OPTOUT_KEY] = optOut;
          //should be true when user wants to opt in
          isOptInRequest = !optOut;
        }
      }
      if (privacyObj.hasOwnProperty(STRING_CONSTANTS.USEIP_KEY)) {
        var useIP = privacyObj[STRING_CONSTANTS.USEIP_KEY];
        if (typeof useIP === 'boolean') {
          wiz.setMetaProp(STRING_CONSTANTS.USEIP_KEY, useIP);
        }
      }
      if (!wzrk_util.isObjectEmpty(profileObj)) {
        data['type'] = "profile";
        data['profile'] = profileObj;
        data = wiz.addSystemDataToObject(data, undefined);
        var compressedData = wiz.compressData(JSON.stringify(data));
        var pageLoadUrl = dataPostURL;
        pageLoadUrl = wiz.addToURL(pageLoadUrl, "type", EVT_PUSH);
        pageLoadUrl = wiz.addToURL(pageLoadUrl, "d", compressedData);
        pageLoadUrl = wiz.addToURL(pageLoadUrl, STRING_CONSTANTS.OPTOUT_KEY, optOut ? 'true' : 'false');
        wiz.saveAndFireRequest(pageLoadUrl, blockRequeust);
      }
    }
  };

  wiz.saveAndFireRequest = function (url, override, sendOULFlag) {

    var now = wzrk_util.getNow();
    url = wiz.addToURL(url, "rn", ++REQ_N);
    var data = url + '&i=' + now + "&sn=" + seqNo;
    wiz.backUpEvent(data, REQ_N);


    if (!blockRequeust || override || (clearCookie !== undefined && clearCookie)) {
      if (now == requestTime) {
        seqNo++;
      } else {
        requestTime = now;
        seqNo = 0;
      }

      wiz.fireRequest(data, false, sendOULFlag);

    } else {
      wc.d("Not fired due to block request - " + blockRequeust + " or clearCookie - " + clearCookie);
    }

  };


// profile like https://developers.google.com/+/api/latest/people
  wiz.processGPlusUserObj = function (user) {

    var profileData = {};
    if (typeof user['displayName'] != STRING_CONSTANTS.UNDEFINED) {
      profileData['Name'] = user['displayName'];
    }
    if (typeof user['id'] != STRING_CONSTANTS.UNDEFINED) {
      profileData['GPID'] = user['id'] + "";
    }

    if (typeof user['gender'] != STRING_CONSTANTS.UNDEFINED) {
      if (user['gender'] == "male") {
        profileData['Gender'] = "M";
      } else if (user['gender'] == "female") {
        profileData['Gender'] = "F";
      } else if (user['gender'] == "other") {
        profileData['Gender'] = "O";
      }
    }

    if (typeof user['image'] != STRING_CONSTANTS.UNDEFINED) {
      if (user['image']['isDefault'] == false) {
        profileData['Photo'] = user['image'].url.split('?sz')[0];
      }
    }

    if (typeof user['emails'] != "undefined") {
      for (var emailIdx = 0; emailIdx < user['emails'].length; emailIdx++) {
        var emailObj = user['emails'][emailIdx];
        if (emailObj.type == 'account') {
          profileData['Email'] = emailObj.value;
        }
      }
    }


    if (typeof user['organizations'] != "undefined") {
      profileData['Employed'] = 'N';
      for (var i = 0; i < user['organizations'].length; i++) {
        var orgObj = user['organizations'][i];
        if (orgObj.type == 'work') {
          profileData['Employed'] = 'Y';
        }
      }
    }


    if (typeof user['birthday'] != STRING_CONSTANTS.UNDEFINED) {
      var yyyymmdd = user['birthday'].split('-'); //comes in as "1976-07-27"
      profileData['DOB'] = $WZRK_WR.setDate(yyyymmdd[0] + yyyymmdd[1] + yyyymmdd[2]);
    }


    if (typeof user['relationshipStatus'] != STRING_CONSTANTS.UNDEFINED) {
      profileData['Married'] = 'N';
      if (user['relationshipStatus'] == 'married') {
        profileData['Married'] = 'Y';
      }
    }
    wc.d("gplus usr profile " + JSON.stringify(profileData));

    return profileData;
  };

  wiz.processFBUserObj = function (user) {
    var profileData = {};
    profileData['Name'] = user['name'];
    if (typeof user['id'] != STRING_CONSTANTS.UNDEFINED) {
      profileData['FBID'] = user['id'] + "";
    }
    // Feb 2014 - FB announced over 58 gender options, hence we specifically look for male or female. Rest we don't care.
    if (user['gender'] == "male") {
      profileData['Gender'] = "M";
    } else if (user['gender'] == "female") {
      profileData['Gender'] = "F";
    } else {
      profileData['Gender'] = "O";
    }

    var getHighestEducation = function (eduArr) {
      if (typeof eduArr != "undefined") {
        var college = "";
        var highschool = "";

        for (var i = 0; i < eduArr.length; i++) {
          var edu = eduArr[i];
          if (typeof edu.type != "undefined") {
            var type = edu.type;
            if (type == "Graduate School") {
              return "Graduate";
            } else if (type == "College") {
              college = "1";
            } else if (type == "High School") {
              highschool = "1";
            }
          }
        }

        if (college == "1") {
          return "College";
        } else if (highschool == "1") {
          return "School";
        }
      }

    };

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

    var work = (typeof user['work'] !== STRING_CONSTANTS.UNDEFINED) ? user['work'].length : 0;
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
  };


  wiz.getEmail = function () {
    wiz.handleEmailSubscription('-1');
  };


  wiz.unSubEmail = function () {
    wiz.handleEmailSubscription("0")
  };

  wiz.subEmail = function () {
    wiz.handleEmailSubscription("1")
  };

  wiz.handleEmailSubscription = function (subscription) {

    var url_params_as_is = wzrk_util.getURLParams(location.href);  // can't use url_params as it is in lowercase above
    var encodedEmailId = url_params_as_is['e'];
    var encodedProfileProps = url_params_as_is['p'];

    if (typeof encodedEmailId !== STRING_CONSTANTS.UNDEFINED) {
      var data = {};
      data['id'] = accountId;  //accountId

      var url = emailURL;
      url = wiz.addToURL(url, "e", encodedEmailId);
      url = wiz.addToURL(url, "d", wiz.compressData(JSON.stringify(data)));
      if(encodedProfileProps){
        url =  wiz.addToURL(url, "p", encodedProfileProps);
      }

      if (subscription != '-1') {
        url = wiz.addToURL(url, "sub", subscription);
      }

      wiz.fireRequest(url);
    }
  };


  wiz.reportError = function (code, desc) {
    wzrk_error['c'] = code;
    wzrk_error['d'] = desc;
    wc.e(wzrk_error_txt + code + ": " + desc);
  };


  //to debug put this in the JS console -> sessionStorage['WZRK_D']="";
  wiz.isDebug = function () {
    return ((typeof sessionStorage != STRING_CONSTANTS.UNDEFINED) && sessionStorage['WZRK_D'] == '');
  };

  wiz.isPingContinuous = function () {
    return ((typeof wzrk_d != STRING_CONSTANTS.UNDEFINED) && (wzrk_d['ping'] == 'continuous'));
  };


  wiz.compressData = function (dataObject) {
    wc.d('dobj:' + dataObject);
    return LZS.compressToBase64(dataObject);
  };


  wiz.addSystemDataToObject = function (dataObject, ignoreTrim) {
    // ignore trim for chrome notifications; undefined everywhere else
    if (typeof ignoreTrim === STRING_CONSTANTS.UNDEFINED) {
      dataObject = wzrk_util.removeUnsupportedChars(dataObject);
    }
    if (!wzrk_util.isObjectEmpty(wzrk_error)) {
      dataObject['wzrk_error'] = wzrk_error;
      wzrk_error = {};
    }

    dataObject['id'] = accountId;

    //Global cookie
    if (wiz.isValueValid(gcookie)) {
      dataObject['g'] = gcookie;
    }

    var obj = wiz.getSessionCookieObject();

    dataObject['s'] = obj['s'];                                                      //Session cookie
    dataObject['pg'] = (typeof obj['p'] == STRING_CONSTANTS.UNDEFINED) ? 1 : obj['p'];                //Page count

    return dataObject;
  };


  wiz.getSessionCookieObject = function () {
    var scookieStr = wiz.readCookie(SCOOKIE_NAME);
    var obj = {};

    if (scookieStr != null) {
      // converting back single quotes to double for JSON parsing - http://www.iandevlin.com/blog/2012/04/html5/cookies-json-localstorage-and-opera
      scookieStr = scookieStr.replace(singleQuoteRegex, "\"");

      obj = JSON.parse(scookieStr);
      if (!wzrk_util.isObject(obj)) {
        obj = {};
      } else {
        if (typeof obj['t'] != STRING_CONSTANTS.UNDEFINED) {   // check time elapsed since last request
          var lasttime = obj['t'];
          var now = wzrk_util.getNow();
          if ((now - lasttime) > (SCOOKIE_EXP_TIME_IN_SECS + 60)) // adding 60 seconds to compensate for in-journey requests

          //ideally the cookie should've died after SCOOKIE_EXP_TIME_IN_SECS but it's still around as we can read
          //hence we shouldn't use it.

            obj = {};

        }
      }
    }
    scookieObj = obj;
    return obj;
  };


  wiz.setSessionCookieObject = function (obj) {

    var objStr = JSON.stringify(obj);

    wiz.createBroadCookie(SCOOKIE_NAME, objStr, SCOOKIE_EXP_TIME_IN_SECS, domain);

  };

  wiz.isValueValid = function (value) {
    if (value == null || value == STRING_CONSTANTS.UNDEFINED) {
      return false;
    }
    return true;
  };

  wiz.getGuid = function () {
    var guid = null;
    if (wiz.isValueValid(gcookie)) {
      return gcookie;
    }
    if (wzrk_util.isLocalStorageSupported()) {
      var value = localStorage[STRING_CONSTANTS.GCOOKIE_NAME];
      if (wiz.isValueValid(value)) {
        try {
          guid = JSON.parse(decodeURIComponent(value));
        } catch (e) {
          wc.d("Cannot parse Gcookie from localstorage - must be encoded " + value);
          //assumming guids are of size 32. supporting both formats.
          // guid can have encodedURIComponent or be without it.
          // 1.56e4078ed15749928c042479ec2b4d47 - breaks on JSON.parse(decodeURIComponent())
          // 2.%2256e4078ed15749928c042479ec2b4d47%22
          if (value.length == 32) {
            guid = value;
            wiz.saveToLSorCookie(STRING_CONSTANTS.GCOOKIE_NAME, value);
          } else {
            wc.e("Illegal guid " + value);
          }
        }

        // Persist to cookie storage if not present there.
        if (wiz.isValueValid(guid)) {
          wiz.createBroadCookie(STRING_CONSTANTS.GCOOKIE_NAME, guid, COOKIE_EXPIRY, domain);
        }
      }
    }
    if (!wiz.isValueValid(guid)) {
      guid = wiz.readCookie(STRING_CONSTANTS.GCOOKIE_NAME);
      if (wiz.isValueValid(guid) && (guid.indexOf('%') === 0 ||
        guid.indexOf('\'') === 0 || guid.indexOf('"') === 0)) {
        guid = null;
      }
      if (wiz.isValueValid(guid)) {
        wiz.saveToLSorCookie(STRING_CONSTANTS.GCOOKIE_NAME, guid);
      }
    }

    return guid;

  };

  wiz.g = function () {

    gcookie = wiz.getGuid();


    if (wzrk_util.isLocalStorageSupported()) {
      currentSessionId = wiz.getMetaProp('cs');
    }
  };

  wiz.setMetaProp = function (key, value) {
    if (wzrk_util.isLocalStorageSupported()) {
      var wzrkMetaObj = wiz.readFromLSorCookie(STRING_CONSTANTS.META_COOKIE);
      if (typeof wzrkMetaObj == STRING_CONSTANTS.UNDEFINED) {
        wzrkMetaObj = {};
      }
      if (value === undefined) {
        delete wzrkMetaObj[key];
      } else {
        wzrkMetaObj[key] = value;
      }
      wiz.saveToLSorCookie(STRING_CONSTANTS.META_COOKIE, wzrkMetaObj);
    }
  };


  wiz.getMetaProp = function (key) {
    if (wzrk_util.isLocalStorageSupported()) {
      var wzrkMetaObj = wiz.readFromLSorCookie(STRING_CONSTANTS.META_COOKIE);
      if (typeof wzrkMetaObj != STRING_CONSTANTS.UNDEFINED) {
        return wzrkMetaObj[key];
      }
    }
  };
  wiz.getAndClearMetaProp = function (key) {
    var value = wiz.getMetaProp(key);
    wiz.setMetaProp(key, undefined);
    return value;
  };

  wiz.manageSession = function (session) {
    //first time. check if current session id in localstorage is same
    //if not same then prev = current and current = this new session
    if (typeof currentSessionId === STRING_CONSTANTS.UNDEFINED || currentSessionId !== session) {
      var currentSessionInLS = wiz.getMetaProp('cs');
      //if sessionId in meta is undefined - set current to both
      if (typeof currentSessionInLS === STRING_CONSTANTS.UNDEFINED) {
        wiz.setMetaProp('ps', session);
        wiz.setMetaProp('cs', session);
        wiz.setMetaProp('sc', 1);
      }
      //not same as session in local storage. new session
      else if (currentSessionInLS !== session) {
        wiz.setMetaProp('ps', currentSessionInLS);
        wiz.setMetaProp('cs', session);
        var sessionCount = wiz.getMetaProp('sc');
        if (typeof sessionCount === STRING_CONSTANTS.UNDEFINED) {
          sessionCount = 0;
        }
        wiz.setMetaProp('sc', sessionCount + 1);
      }
      currentSessionId = session;
    }
  };


  // call back function used to store global and session ids for the user
  //resume - this is used to signal that we can resume sending events to server
  // was waiting for the server to reset the cookie. everything was getting written to cookie
  wiz.s = function (global, session, resume, respNumber, optOutResponse) {

    if (typeof respNumber === "undefined") {
      respNumber = 0;
    }

    wiz.removeBackup(respNumber);

    if (respNumber > REQ_N) {
      //request for some other user so ignore
      return;
    }

    if (!wiz.isValueValid(gcookie) || resume || typeof optOutResponse === 'boolean') {
      if (!wiz.isValueValid(gcookie)) {
        //clear useIP meta prop
        wiz.getAndClearMetaProp(STRING_CONSTANTS.USEIP_KEY);
      }
      wc.d("Cookie was " + gcookie + " set to " + global);
      gcookie = global;
      // global cookie

      if (global) {
        if (wzrk_util.isLocalStorageSupported()) {
          if (LRU_CACHE == null) {
            LRU_CACHE = new LRU_cache(LRU_CACHE_SIZE);
          }

          var kId_from_LS = wiz.readFromLSorCookie(
            STRING_CONSTANTS.KCOOKIE_NAME
          );
          if (kId_from_LS != null && kId_from_LS["id"] && resume) {
            var guidFromLRUCache = LRU_CACHE.cache[kId_from_LS["id"]];
            if (!guidFromLRUCache) {
              LRU_CACHE.set(kId_from_LS["id"], global);
            }
          }
          wiz.saveToLSorCookie(
            STRING_CONSTANTS.GCOOKIE_NAME,
            global
          );

          var lastK = LRU_CACHE.getSecondLastKEY();
          if(lastK !== -1) {
            var lastGUID = LRU_CACHE.cache[lastK];
            unregisterTokenForGuid(lastGUID);
          }
        }
      }

      wiz.createBroadCookie(STRING_CONSTANTS.GCOOKIE_NAME, global, COOKIE_EXPIRY, domain);
      wiz.saveToLSorCookie(STRING_CONSTANTS.GCOOKIE_NAME, global);
    }

    if (resume) {
      blockRequeust = false;
      wc.d("Resumed requests");
    }
    if (wzrk_util.isLocalStorageSupported()) {
      wiz.manageSession(session);
    }

    // session cookie
    var obj = wiz.getSessionCookieObject();

    // for the race-condition where two responses come back with different session ids. don't write the older session id.
    if (typeof obj["s"] == "undefined" || obj["s"] <= session) {
      obj["s"] = session;
      obj["t"] = wzrk_util.getNow();  // time of last response from server
      wiz.setSessionCookieObject(obj);
    }


    if (resume && !processingBackup) {
      wiz.processBackupEvents();
    }

    RESP_N = respNumber;

  };

  wiz.processBackupEvents = function () {

    var backupMap = wiz.readFromLSorCookie(STRING_CONSTANTS.LCOOKIE_NAME);
    if (typeof backupMap == 'undefined' || backupMap == null) {
      return;
    }
    processingBackup = true;
    for (var idx in backupMap) {
      if (backupMap.hasOwnProperty(idx)) {
        var backupEvent = backupMap[idx];
        if (typeof backupEvent['fired'] == 'undefined') {
          wc.d("Processing backup event : " + backupEvent['q']);
          if (typeof backupEvent['q'] != 'undefined') {
            wiz.fireRequest(backupEvent['q']);
          }
          backupEvent['fired'] = true;
        }
      }
    }
    wiz.saveToLSorCookie(STRING_CONSTANTS.LCOOKIE_NAME, backupMap);
    processingBackup = false;

  };

  wiz.removeBackup = function (respNo) {
    var backupMap = wiz.readFromLSorCookie(STRING_CONSTANTS.LCOOKIE_NAME);
    if (typeof backupMap != 'undefined' && backupMap != null && typeof backupMap[respNo] != 'undefined') {
      wc.d("del event: " + respNo + " data->" + backupMap[respNo]['q']);
      delete backupMap[respNo];
      wiz.saveToLSorCookie(STRING_CONSTANTS.LCOOKIE_NAME, backupMap);
    }
  };

  wiz.backUpEvent = function (data, reqNo) {
    var backupArr = wiz.readFromLSorCookie(STRING_CONSTANTS.LCOOKIE_NAME);
    if (typeof backupArr == 'undefined') {
      backupArr = {};
    }
    backupArr[reqNo] = {'q': data};
    wiz.saveToLSorCookie(STRING_CONSTANTS.LCOOKIE_NAME, backupArr);
    wc.d("stored in " + STRING_CONSTANTS.LCOOKIE_NAME + " reqNo : " + reqNo + "-> " + data);

  };

  // sets cookie on the base domain. e.g. if domain is baz.foo.bar.com, set cookie on ".bar.com"
  wiz.createBroadCookie = function (name, value, seconds, domain) {


    //To update an existing "broad domain" cookie, we need to know what domain it was actually set on.
    //since a retrieved cookie never tells which domain it was set on, we need to set another test cookie
    //to find out which "broadest" domain the cookie was set on. Then delete the test cookie, and use that domain
    //for updating the actual cookie.


    if (domain) {
      if (typeof broadDomain == STRING_CONSTANTS.UNDEFINED) {  // if we don't know the broadDomain yet, then find out
        var domainParts = domain.split(".");
        var testBroadDomain = "";
        for (var idx = domainParts.length - 1; idx >= 0; idx--) {
          testBroadDomain = "." + domainParts[idx] + testBroadDomain;

          // only needed if the cookie already exists and needs to be updated. See note above.
          if (wiz.readCookie(name)) {

            // no guarantee that browser will delete cookie, hence create short lived cookies
            var testCookieName = "test_" + name + idx;
            wiz.createCookie(testCookieName, value, 10, testBroadDomain); // self-destruct after 10 seconds
            if (!wiz.readCookie(testCookieName)) {  // if test cookie not set, then the actual cookie wouldn't have been set on this domain either.
              continue;
            } else {                                // else if cookie set, then delete the test and the original cookie
              wiz.deleteCookie(testCookieName, testBroadDomain);
            }
          }

          wiz.createCookie(name, value, seconds, testBroadDomain);
          var tempCookie = wiz.readCookie(name);
          if (tempCookie == value) {
            broadDomain = testBroadDomain;
            //wc.d("Was able to retrieve cookie on: " + testBroadDomain + "->" + name + "=" + tempCookie);
            break;
          }
        }
      } else {
        wiz.createCookie(name, value, seconds, broadDomain);
      }
    } else {
      wiz.createCookie(name, value, seconds, domain);
    }
  };

  //read  - cookie get-set: http://www.quirksmode.org/js/cookies.html

  wiz.createCookie = function (name, value, seconds, domain) {
    var expires = "";
    var domainStr = "";
    if (seconds) {
      var date = new Date();
      date.setTime(date.getTime() + (seconds * 1000));

      expires = "; expires=" + date.toGMTString();
    }

    if (domain) {
      domainStr = "; domain=" + domain;
    }

    value = encodeURIComponent(value);

    document.cookie = name + "=" + value + expires + domainStr + "; path=/";
  };

  wiz.readCookie = function readCookie(name) {
    var nameEQ = name + "=";
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
  };

  wiz.deleteCookie = function (name, domain) {
    var cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    if (domain) {
      cookieStr = cookieStr + " domain=" + domain + "; path=/";
    }

    document.cookie = cookieStr;
  };


  wiz.addToURL = function (url, k, v) {
    return url + "&" + k + "=" + encodeURIComponent(v);
  };

  var MAX_TRIES = 50;

  var fireRequest = function (url, tries, skipARP, sendOULFlag) {
    if (dropRequestDueToOptOut()) {
      wc.d("req dropped due to optout cookie: " + gcookie);
      return;
    }
    if (
      !wiz.isValueValid(gcookie) &&
      RESP_N < REQ_N - 1 &&
      tries < MAX_TRIES
    ) {
      setTimeout(function () {
        fireRequest(url, tries + 1, skipARP, sendOULFlag);
      }, 50);
      return;
    }

    if(!sendOULFlag) {
      if (wiz.isValueValid(gcookie)) {
        //add cookie to url
        url = wiz.addToURL(url, "gc", gcookie);
      }
      url = wiz.addARPToRequest(url, skipARP);
    }
    // url = addUseIPToRequest(url);
    url = wiz.addToURL(url, "r", new Date().getTime()); // add epoch to beat caching of the URL
    if (wizrocket.hasOwnProperty("plugin")) {
      //used to add plugin name in request parameter
      var plugin = wizrocket["plugin"];
      url = wiz.addToURL(url, "ct_pl", plugin);
    }
    if (url.indexOf("chrome-extension:") != -1) {
      url = url.replace("chrome-extension:", "https:");
    }
    var s = doc.createElement("script");
    s.setAttribute("type", "text/javascript");
    s.setAttribute("src", url);
    s.setAttribute("rel", "nofollow");
    s.async = true;

    doc.getElementsByTagName("head")[0].appendChild(s);
    wc.d("req snt -> url: " + url);
  };

  wiz.fireRequest = function (url, skipARP, sendOULFlag) {
    fireRequest(url, 1, skipARP, sendOULFlag);
  };

  wiz.closeIframe = function (campaignId, divIdIgnored) {
    if (typeof campaignId != STRING_CONSTANTS.UNDEFINED && campaignId != '-1') {
      if (wzrk_util.isLocalStorageSupported()) {
        var campaignObj = wzrk_util.getCampaignObject();

        var sessionCampaignObj = campaignObj[currentSessionId];
        if (typeof sessionCampaignObj == STRING_CONSTANTS.UNDEFINED) {
          sessionCampaignObj = {};
          campaignObj[currentSessionId] = sessionCampaignObj;
        }
        sessionCampaignObj[campaignId] = 'dnd';
        wzrk_util.saveCampaignObject(campaignObj);
      }
    }
    if (typeof campaignDivMap != STRING_CONSTANTS.UNDEFINED) {
      var divId = campaignDivMap[campaignId];
      if (typeof divId != STRING_CONSTANTS.UNDEFINED) {
        document.getElementById(divId).style.display = "none";
        if (divId == 'intentPreview') {
          if (document.getElementById('intentOpacityDiv') != null) {
            document.getElementById('intentOpacityDiv').style.display = "none";
          }
        }
      }
    }


  };

  // helper variable to handle race condition and check when notifications were called
  var notifApi = {};
  notifApi.notifEnabledFromApi = false;

  /**
   * Function is exposed to customer; called as needed after specific events to set up push notifications
   * @param displayArgs array: [titleText, bodyText, okButtonText, rejectButtonText]
   */
  wiz.setUpWebPush = function (displayArgs) {
    if (webPushEnabled && displayArgs.length > 0) {
      wiz.handleNotificationRegistration(displayArgs);
    } else if (typeof webPushEnabled === STRING_CONSTANTS.UNDEFINED && displayArgs.length > 0) {
      notifApi.notifEnabledFromApi = true;
      notifApi.displayArgs = displayArgs.slice();
    } else if (webPushEnabled === false && displayArgs.length > 0) {
      wc.e('Make sure push notifications are fully enabled and integrated');
    }

  };

  wiz.setApplicationServerKey = function(applicationServerKey) {
    fcmPublicKey = applicationServerKey;
  }

  wiz.handleNotificationRegistration = function (displayArgs) {

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

    if (displayArgs.length === 1) {
      if (wzrk_util.isObject(displayArgs[0])) {
        var notifObj = displayArgs[0];
        titleText = notifObj["titleText"];
        bodyText = notifObj["bodyText"];
        okButtonText = notifObj["okButtonText"];
        rejectButtonText = notifObj["rejectButtonText"];
        okButtonColor = notifObj["okButtonColor"];
        skipDialog = notifObj["skipDialog"];
        askAgainTimeInSeconds = notifObj["askAgainTimeInSeconds"];
        okCallback = notifObj["okCallback"];
        rejectCallback = notifObj["rejectCallback"];
        subscriptionCallback = notifObj["subscriptionCallback"];
        hidePoweredByCT = notifObj["hidePoweredByCT"];
        serviceWorkerPath = notifObj["serviceWorkerPath"];
        httpsPopupPath = notifObj["httpsPopupPath"];
        httpsIframePath = notifObj["httpsIframePath"];
      }
    } else {
      titleText = displayArgs[0];
      bodyText = displayArgs[1];
      okButtonText = displayArgs[2];
      rejectButtonText = displayArgs[3];
      okButtonColor = displayArgs[4];
      skipDialog = displayArgs[5];
      askAgainTimeInSeconds = displayArgs[6]
    }

    if (typeof skipDialog === "undefined") {
      skipDialog = false;
    }

    if (typeof hidePoweredByCT === "undefined") {
      hidePoweredByCT = false;
    }

    if (typeof serviceWorkerPath === "undefined") {
      serviceWorkerPath = '/clevertap_sw.js';
    }

    // ensure that the browser supports notifications
    if (typeof navigator["serviceWorker"] === "undefined") {
      return;
    }

    // var isHTTP = location.protocol === 'http:' && typeof httpsPopupPath !== "undefined" &&
    //     typeof httpsIframePath !== "undefined";

    var isHTTP = typeof httpsPopupPath !== "undefined" && typeof httpsIframePath !== "undefined";

    // make sure the site is on https for chrome notifications
    if (location.protocol !== 'https:' && document.location.hostname !== 'localhost' && !isHTTP) {
      wc.e("Make sure you are https or localhost to register for notifications");
      return;
    }

    // right now, we only support Chrome V50 & higher & Firefox
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      chromeAgent = navigator.userAgent.match(/Chrome\/(\d+)/);
      if (typeof chromeAgent === STRING_CONSTANTS.UNDEFINED || parseInt(chromeAgent[1], 10) < 50)
        return;
    }else if(navigator.userAgent.indexOf('Firefox') !== -1){
      firefoxAgent = navigator.userAgent.match(/Firefox\/(\d+)/);
      if(typeof firefoxAgent === STRING_CONSTANTS.UNDEFINED || parseInt(firefoxAgent[1], 10) < 50)
        return;
    } else {
      return;
    }

    // we check for the cookie in setUpChromeNotifications(); the tokens may have changed

    if (!isHTTP) {
      if (typeof Notification === STRING_CONSTANTS.UNDEFINED) {
        return;
      }
      // handle migrations from other services -> chrome notifications may have already been asked for before
      if (Notification.permission === 'granted') {
        // skip the dialog and register
        wiz.setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath);
        return;
      } else if (Notification.permission === 'denied') {
        // we've lost this profile :'(
        return;
      }

      if (skipDialog) {
        wiz.setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath);
        return;
      }
    }

    // make sure the right parameters are passed
    if (!titleText || !bodyText || !okButtonText || !rejectButtonText) {
      wc.e('Missing input parameters; please specify title, body, ok button and cancel button text');
      return;
    }

    // make sure okButtonColor is formatted properly
    if (typeof okButtonColor === STRING_CONSTANTS.UNDEFINED || !okButtonColor.match(/^#[a-f\d]{6}$/i)) {
      okButtonColor = "#f28046"; // default color for positive button
    }

    // make sure the user isn't asked for notifications more than askAgainTimeInSeconds
    var now = new Date().getTime() / 1000;
    if (typeof (wiz.getMetaProp('notif_last_time')) === STRING_CONSTANTS.UNDEFINED) {
      wiz.setMetaProp('notif_last_time', now);
    } else {
      if (typeof askAgainTimeInSeconds === "undefined") {
        // 7 days by default
        askAgainTimeInSeconds = 7 * 24 * 60 * 60;
      }

      if (now - wiz.getMetaProp('notif_last_time') < askAgainTimeInSeconds) {
        return;
      } else {
        // continue asking
        wiz.setMetaProp('notif_last_time', now);
      }
    }

    if (isHTTP) {
      //add the https iframe
      var httpsIframe = document.createElement('iframe');
      httpsIframe.setAttribute('style', 'display:none;');
      httpsIframe.setAttribute('src', httpsIframePath);
      document.body.appendChild(httpsIframe);
      window.addEventListener("message", function (event) {
        if (typeof event['data'] !== "undefined") {
          try {
            var obj = JSON.parse(event['data']);
          } catch (e) {
            //not a call from our iframe
            return;
          }
          if (typeof obj['state'] !== "undefined") {
            if (obj['from'] === "ct" && obj['state'] === "not") {
              wiz.addWizAlertJS().onload = function () {
                // create our wizrocket popup
                wzrkPermissionPopup['wizAlert']({
                  'title': titleText,
                  'body': bodyText,
                  'confirmButtonText': okButtonText,
                  'confirmButtonColor': okButtonColor,
                  'rejectButtonText': rejectButtonText,
                  'hidePoweredByCT': hidePoweredByCT
                }, function (enabled) { // callback function
                  if (enabled) {
                    // the user accepted on the dialog box
                    if (typeof okCallback !== "undefined" && typeof okCallback === "function") {
                      okCallback();
                    }
                    //redirect to popup.html
                    window.open(httpsPopupPath);
                  } else {
                    if (typeof rejectCallback !== "undefined" && typeof rejectCallback === "function") {
                      rejectCallback();
                    }
                  }
                  wiz.removeWizAlertJS();
                });
              }
            }
          }
        }
        // console.log(event.origin);
      }, false);
    } else {
      wiz.addWizAlertJS().onload = function () {
        // create our wizrocket popup
        wzrkPermissionPopup['wizAlert']({
          'title': titleText,
          'body': bodyText,
          'confirmButtonText': okButtonText,
          'confirmButtonColor': okButtonColor,
          'rejectButtonText': rejectButtonText,
          'hidePoweredByCT': hidePoweredByCT
        }, function (enabled) { // callback function
          if (enabled) {
            // the user accepted on the dialog box
            if (typeof okCallback !== "undefined" && typeof okCallback === "function") {
              okCallback();
            }
            wiz.setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath);
          } else {
            if (typeof rejectCallback !== "undefined" && typeof rejectCallback === "function") {
              rejectCallback();
            }
          }
          wiz.removeWizAlertJS();
        });
      }
    }
  };

  wiz.tr = function (msg) {

    var doCampHouseKeeping = function (targetingMsgJson) {

      var campaignId = targetingMsgJson['wzrk_id'].split('_')[0];
      var today = wzrk_util.getToday();

      if (wzrk_util.isLocalStorageSupported()) {
        delete sessionStorage[STRING_CONSTANTS.CAMP_COOKIE_NAME];
        var campObj = wzrk_util.getCampaignObject();

        //global session limit. default is 1
        if (typeof targetingMsgJson[STRING_CONSTANTS.DISPLAY]['wmc'] == STRING_CONSTANTS.UNDEFINED) {
          targetingMsgJson[STRING_CONSTANTS.DISPLAY]['wmc'] = 1;
        }
        var excludeFromFreqCaps = -1, campaignSessionLimit = -1, campaignDailyLimit = -1,
          campaignTotalLimit = -1,
          totalDailyLimit = -1, totalSessionLimit = -1;
        if (typeof targetingMsgJson[STRING_CONSTANTS.DISPLAY]['efc'] != STRING_CONSTANTS.UNDEFINED) {
          excludeFromFreqCaps = parseInt(targetingMsgJson[STRING_CONSTANTS.DISPLAY]['efc'], 10);
        }
        if (typeof targetingMsgJson[STRING_CONSTANTS.DISPLAY]['mdc'] != STRING_CONSTANTS.UNDEFINED) {
          campaignSessionLimit = parseInt(targetingMsgJson[STRING_CONSTANTS.DISPLAY]['mdc'], 10);
        }
        if (typeof targetingMsgJson[STRING_CONSTANTS.DISPLAY]['tdc'] != STRING_CONSTANTS.UNDEFINED) {
          campaignDailyLimit = parseInt(targetingMsgJson[STRING_CONSTANTS.DISPLAY]['tdc'], 10);
        }
        if (typeof targetingMsgJson[STRING_CONSTANTS.DISPLAY]['tlc'] != STRING_CONSTANTS.UNDEFINED) {
          campaignTotalLimit = parseInt(targetingMsgJson[STRING_CONSTANTS.DISPLAY]['tlc'], 10);
        }
        if (typeof targetingMsgJson[STRING_CONSTANTS.DISPLAY]['wmp'] != STRING_CONSTANTS.UNDEFINED) {
          totalDailyLimit = parseInt(targetingMsgJson[STRING_CONSTANTS.DISPLAY]['wmp'], 10);
        }
        if (typeof targetingMsgJson[STRING_CONSTANTS.DISPLAY]['wmc'] != STRING_CONSTANTS.UNDEFINED) {
          totalSessionLimit = parseInt(targetingMsgJson[STRING_CONSTANTS.DISPLAY]['wmc'], 10);
        }


        function incrCount(obj, campaignId, excludeFromFreqCaps) {
          var currentCount = 0, totalCount = 0;
          if (typeof obj[campaignId] != STRING_CONSTANTS.UNDEFINED) {
            currentCount = obj[campaignId];
          }
          currentCount++;
          if (typeof obj['tc'] != STRING_CONSTANTS.UNDEFINED) {
            totalCount = obj['tc'];
          }
          //if exclude from caps then dont add to total counts
          if (excludeFromFreqCaps < 0) {
            totalCount++;
          }

          obj['tc'] = totalCount;
          obj[campaignId] = currentCount;
        }


        //session level capping
        var sessionObj = campObj[currentSessionId];
        if (typeof sessionObj != STRING_CONSTANTS.UNDEFINED) {
          var campaignSessionCount = sessionObj[campaignId];
          var totalSessionCount = sessionObj['tc'];
          //dnd
          if (campaignSessionCount == 'dnd') {
            return false;
          }

          //session
          if (totalSessionLimit > 0 && totalSessionCount >= totalSessionLimit && excludeFromFreqCaps < 0) {
            return false;
          }
          //campaign session
          if (campaignSessionLimit > 0 && campaignSessionCount >= campaignSessionLimit) {
            return false;
          }
        } else {
          sessionObj = {};
          campObj[currentSessionId] = sessionObj;
        }

        //daily level capping
        var dailyObj = campObj[today];
        if (typeof dailyObj != STRING_CONSTANTS.UNDEFINED) {
          var campaignDailyCount = dailyObj[campaignId];
          var totalDailyCount = dailyObj['tc'];
          //daily
          if (totalDailyLimit > 0 && totalDailyCount >= totalDailyLimit && excludeFromFreqCaps < 0) {
            return false;
          }
          //campaign daily
          if (campaignDailyLimit > 0 && campaignDailyCount >= campaignDailyLimit) {
            return false;
          }
        } else {
          dailyObj = {};
          campObj[today] = dailyObj;
        }

        var globalObj = campObj[STRING_CONSTANTS.GLOBAL];
        if (typeof globalObj != STRING_CONSTANTS.UNDEFINED) {
          var campaignTotalCount = globalObj[campaignId];
          //campaign total
          if (campaignTotalLimit > 0 && campaignTotalCount >= campaignTotalLimit) {
            return false;
          }
        } else {
          globalObj = {};
          campObj[STRING_CONSTANTS.GLOBAL] = globalObj;
        }


      }
      //delay
      if (typeof targetingMsgJson[STRING_CONSTANTS.DISPLAY]['delay'] != STRING_CONSTANTS.UNDEFINED && targetingMsgJson[STRING_CONSTANTS.DISPLAY]['delay'] > 0) {
        var delay = targetingMsgJson[STRING_CONSTANTS.DISPLAY]['delay'];
        targetingMsgJson[STRING_CONSTANTS.DISPLAY]['delay'] = 0;
        setTimeout(wiz.tr, delay * 1000, msg);
        return false;
      }

      incrCount(sessionObj, campaignId, excludeFromFreqCaps);
      incrCount(dailyObj, campaignId, excludeFromFreqCaps);
      incrCount(globalObj, campaignId, excludeFromFreqCaps);

      //get ride of stale sessions and day entries
      var newCampObj = {};
      newCampObj[currentSessionId] = sessionObj;
      newCampObj[today] = dailyObj;
      newCampObj[STRING_CONSTANTS.GLOBAL] = globalObj;
      wzrk_util.saveCampaignObject(newCampObj);


    };

    var getCookieParams = function () {
      if (!wiz.isValueValid(gcookie)) {
        gcookie = wiz.getGuid();
      }
      if (scookieObj == null) {
        scookieObj = wiz.getSessionCookieObject();
      }
      return '&t=wc&d=' + encodeURIComponent(LZS.compressToBase64(gcookie + '|' + scookieObj['p'] + '|' + scookieObj['s']));
    };

    var setupClickEvent = function (onClick, targetingMsgJson, contentDiv, divId, isLegacy) {
      if (onClick != '' && typeof onClick != STRING_CONSTANTS.UNDEFINED) {
        var ctaElement;
        if (isLegacy) {
          ctaElement = contentDiv;
        } else {
          var jsCTAElements = contentDiv.getElementsByClassName('jsCT_CTA');
          if (typeof jsCTAElements != STRING_CONSTANTS.UNDEFINED && jsCTAElements.length == 1) {
            ctaElement = jsCTAElements[0];
          }
        }
        var jsFunc = targetingMsgJson['display']['jsFunc'];
        var isPreview = targetingMsgJson['display']['preview'];
        if (typeof isPreview == STRING_CONSTANTS.UNDEFINED) {
          onClick += getCookieParams();
        }

        if (typeof ctaElement != STRING_CONSTANTS.UNDEFINED) {
          ctaElement.onclick =
            function () {
              //invoke js function call
              if (typeof jsFunc != STRING_CONSTANTS.UNDEFINED) {
                //track notification clicked event
                if (typeof isPreview == STRING_CONSTANTS.UNDEFINED) {
                  wiz.fireRequest(onClick);
                }
                invokeExternalJs(jsFunc, targetingMsgJson);
                //close iframe. using -1 for no campaignId
                wiz.closeIframe('-1', divId);
                return;
              }
              //pass on the gcookie|page|scookieId for capturing the click event
              if (targetingMsgJson['display']['window'] == '1') {
                window.open(onClick, '_blank');
              } else {
                window.location = onClick;
              }
            }
        }
      }
    };

    var invokeExternalJs = function (jsFunc, targetingMsgJson) {
      var func = window.parent[jsFunc];
      if (typeof func == "function") {
        if (typeof targetingMsgJson['display']['kv'] !== STRING_CONSTANTS.UNDEFINED) {
          func(targetingMsgJson['display']['kv']);
        } else {
          func();
        }
      }
    };

    var setupClickUrl = function (onClick, targetingMsgJson, contentDiv, divId, isLegacy) {
      incrementImpression(targetingMsgJson);
      setupClickEvent(onClick, targetingMsgJson, contentDiv, divId, isLegacy);
    };

    var incrementImpression = function (targetingMsgJson) {
      var data = {};
      data['type'] = "event";
      data['evtName'] = "Notification Viewed";
      data['evtData'] = {"wzrk_id": targetingMsgJson['wzrk_id']};
      processEvent(data);
    };

    var renderFooterNotification = function (targetingMsgJson) {
      var campaignId = targetingMsgJson['wzrk_id'].split('_')[0];
      var displayObj = targetingMsgJson['display'];

      if (displayObj['layout'] == 1) {
        return showExitIntent(undefined, targetingMsgJson);
      }
      if (doCampHouseKeeping(targetingMsgJson) == false) {
        return;
      }

      var divId = 'wizParDiv' + displayObj['layout'];

      if (document.getElementById(divId) != null) {
        return;
      }
      campaignDivMap[campaignId] = divId;
      var isBanner = displayObj['layout'] == 2;
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
        var widthPerct = 'width:30%;';
        //for small devices  - mobile phones
        if ((/mobile/i.test(navigator.userAgent) || (/mini/i.test(navigator.userAgent))) && /iPad/i.test(navigator.userAgent) == false) {
          width = viewWidth * 85 / 100 + 20;
          right = viewWidth * 5 / 100;
          bottomPosition = viewHeight * 5 / 100;
          widthPerct = 'width:80%;';
          //medium devices - tablets
        } else if ('ontouchstart' in window || (/tablet/i.test(navigator.userAgent))) {
          width = viewWidth * 50 / 100 + 20;
          right = viewWidth * 5 / 100;
          bottomPosition = viewHeight * 5 / 100;
          widthPerct = 'width:50%;';
        }

        //legacy footer notif
        if (typeof displayObj['proto'] == STRING_CONSTANTS.UNDEFINED) {
          legacy = true;
          msgDiv.setAttribute('style', 'display:block;overflow:hidden; bottom:' + bottomPosition + 'px !important;width:' + width + 'px !important;right:' + right + 'px !important;position:fixed;z-index:2147483647;');
        } else {
          msgDiv.setAttribute('style', widthPerct + displayObj['iFrameStyle']);
        }
      } else {
        msgDiv.setAttribute('style', displayObj['iFrameStyle']);
      }
      document.body.appendChild(msgDiv);
      var iframe = document.createElement('iframe');

      var borderRadius = displayObj['br'] == false ? "0" : "8";

      iframe['frameborder'] = '0px';
      iframe['marginheight'] = '0px';
      iframe['marginwidth'] = '0px';
      iframe['scrolling'] = 'no';
      iframe['id'] = 'wiz-iframe';
      var onClick = targetingMsgJson['display']['onClick'];
      var pointerCss = '';
      if (onClick != '' && typeof onClick != STRING_CONSTANTS.UNDEFINED) {
        pointerCss = 'cursor:pointer;';
      }

      var html;
      //direct html
      if (targetingMsgJson['msgContent']['type'] === 1) {
        html = targetingMsgJson['msgContent']['html'];
        html = html.replace('##campaignId##', campaignId);
      } else {
        var css = '' +
          '<style type="text/css">' +
          'body{margin:0;padding:0;}' +
          '#contentDiv.wzrk{overflow:hidden;padding:0;text-align:center;' + pointerCss + '}' +
          '#contentDiv.wzrk td{padding:15px 10px;}' +
          '.wzrkPPtitle{font-weight: bold;font-size: 16px;font-family:arial;padding-bottom:10px;word-break: break-word;}' +
          '.wzrkPPdscr{font-size: 14px;font-family:arial;line-height:16px;word-break: break-word;display:inline-block;}' +
          '.PL15{padding-left:15px;}' +
          '.wzrkPPwarp{margin:20px 20px 0 5px;padding:0px;border-radius: ' + borderRadius + 'px;box-shadow: 1px 1px 5px #888888;}' +
          'a.wzrkClose{cursor:pointer;position: absolute;top: 11px;right: 11px;z-index: 2147483647;font-size:19px;font-family:arial;font-weight:bold;text-decoration: none;width: 25px;/*height: 25px;*/text-align: center; -webkit-appearance: none; line-height: 25px;' +
          'background: #353535;border: #fff 2px solid;border-radius: 100%;box-shadow: #777 2px 2px 2px;color:#fff;}' +
          'a:hover.wzrkClose{background-color:#d1914a !important;color:#fff !important; -webkit-appearance: none;}' +
          'td{vertical-align:top;}' +
          'td.imgTd{border-top-left-radius:8px;border-bottom-left-radius:8px;}' +
          '</style>';

        var bgColor, textColor, btnBg, leftTd, btColor;
        if (targetingMsgJson['display']['theme'] == 'dark') {
          bgColor = "#2d2d2e";
          textColor = "#eaeaea";
          btnBg = '#353535';
          leftTd = '#353535';
          btColor = '#ffffff';
        } else {
          bgColor = "#ffffff";
          textColor = "#000000";
          leftTd = '#f4f4f4';
          btnBg = '#a5a6a6';
          btColor = '#ffffff';
        }
        var titleText = targetingMsgJson['msgContent']['title'];
        var descriptionText = targetingMsgJson['msgContent']['description'];
        var imageTd = "";
        if (typeof targetingMsgJson['msgContent']['imageUrl'] != STRING_CONSTANTS.UNDEFINED && targetingMsgJson['msgContent']['imageUrl'] != '') {
          imageTd = "<td class='imgTd' style='background-color:" + leftTd + "'><img src='" + targetingMsgJson['msgContent']['imageUrl'] + "' height='60' width='60'></td>";
        }
        var onClickStr = "parent.$WZRK_WR.closeIframe(" + campaignId + ",'" + divId + "');";
        var title = "<div class='wzrkPPwarp' style='color:" + textColor + ";background-color:" + bgColor + ";'>" +
          "<a href='javascript:void(0);' onclick=" + onClickStr + " class='wzrkClose' style='background-color:" + btnBg + ";color:" + btColor + "'>&times;</a>" +
          "<div id='contentDiv' class='wzrk'>" +
          "<table cellpadding='0' cellspacing='0' border='0'>" +
          //"<tr><td colspan='2'></td></tr>"+
          "<tr>" + imageTd + "<td style='vertical-align:top;'>" +
          "<div class='wzrkPPtitle' style='color:" + textColor + "'>" + titleText + "</div>";
        var body = "<div class='wzrkPPdscr' style='color:" + textColor + "'>" + descriptionText + "<div></td></tr></table></div>";
        html = css + title + body;
      }


      iframe.setAttribute('style', 'z-index: 2147483647; display:block; width: 100% !important; border:0px !important; border-color:none !important;');
      msgDiv.appendChild(iframe);
      var ifrm = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
      var doc = ifrm.document;

      doc.open();
      doc.write(html);
      doc.close();

      function adjustIFrameHeight() {
        //adjust iframe and body height of html inside correctly
        contentHeight = document.getElementById("wiz-iframe").contentDocument.getElementById('contentDiv').scrollHeight;
        if (displayObj['custom-editor'] !== true && !isBanner) {
          contentHeight += 25;
        }
        document.getElementById("wiz-iframe").contentDocument.body.style.margin = "0px";
        document.getElementById("wiz-iframe").style.height = contentHeight + "px";
      }

      var ua = navigator.userAgent.toLowerCase();
      if (ua.indexOf('safari') !== -1) {
        if (ua.indexOf('chrome') > -1) {
          iframe.onload = function () {
            adjustIFrameHeight();
            var contentDiv = document.getElementById("wiz-iframe").contentDocument.getElementById('contentDiv');
            setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, legacy);
          };
        } else {
          var inDoc = iframe.contentDocument || iframe.contentWindow;
          if (inDoc.document) inDoc = inDoc.document;
          // safari iphone 7+ needs this.
          adjustIFrameHeight();
          var _timer = setInterval(function () {
            if (inDoc.readyState === 'complete') {
              clearInterval(_timer);
              //adjust iframe and body height of html inside correctly
              adjustIFrameHeight();
              var contentDiv = document.getElementById("wiz-iframe").contentDocument.getElementById('contentDiv');
              setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, legacy);
            }
          }, 10);
        }
      } else {
        iframe.onload = function () {
          //adjust iframe and body height of html inside correctly
          adjustIFrameHeight();
          var contentDiv = document.getElementById("wiz-iframe").contentDocument.getElementById('contentDiv');
          setupClickUrl(onClick, targetingMsgJson, contentDiv, divId, legacy);
        };
      }
    };

    var _callBackCalled = false;

    var showFooterNotification = function (targetingMsgJson) {


      var onClick = targetingMsgJson['display']['onClick'];
      if (wizrocket.hasOwnProperty("notificationCallback") &&
        typeof wizrocket["notificationCallback"] !== "undefined" &&
        typeof wizrocket["notificationCallback"] === "function") {
        var notificationCallback = wizrocket["notificationCallback"];
        if (!_callBackCalled) {
          var inaObj = {};
          inaObj["msgContent"] = targetingMsgJson["msgContent"];
          inaObj["msgId"] = targetingMsgJson["wzrk_id"];
          if (typeof targetingMsgJson['display']['kv'] !== STRING_CONSTANTS.UNDEFINED) {
            inaObj["kv"] = targetingMsgJson['display']['kv'];
          }
          wizrocket["raiseNotificationClicked"] = function () {
            if (onClick != '' && typeof onClick != STRING_CONSTANTS.UNDEFINED) {
              var jsFunc = targetingMsgJson['display']['jsFunc'];
              onClick += getCookieParams();

              //invoke js function call
              if (typeof jsFunc != STRING_CONSTANTS.UNDEFINED) {
                //track notification clicked event
                wiz.fireRequest(onClick);
                invokeExternalJs(jsFunc, targetingMsgJson);
                return;
              }
              //pass on the gcookie|page|scookieId for capturing the click event
              if (targetingMsgJson['display']['window'] == '1') {
                window.open(onClick, '_blank');
              } else {
                window.location = onClick;
              }
            }
          };
          wizrocket["raiseNotificationViewed"] = function () {
            incrementImpression(targetingMsgJson);
          };
          notificationCallback(inaObj);
          _callBackCalled = true;
        }
      } else {
        renderFooterNotification(targetingMsgJson);

      }
    };
    var exitintentObj;
    var showExitIntent = function (event, targetObj) {
      var targetingMsgJson;
      if (typeof event != STRING_CONSTANTS.UNDEFINED && event['clientY'] > 0) {
        return;
      }
      if (typeof targetObj == STRING_CONSTANTS.UNDEFINED) {
        targetingMsgJson = exitintentObj;
      } else {
        targetingMsgJson = targetObj;
      }

      if (document.getElementById("intentPreview") != null) {
        return;
      }
      //dont show exit intent on tablet/mobile - only on desktop
      if (typeof targetingMsgJson['display']['layout'] == STRING_CONSTANTS.UNDEFINED &&
        ((/mobile/i.test(navigator.userAgent)) || (/mini/i.test(navigator.userAgent)) || (/iPad/i.test(navigator.userAgent)) ||
          ('ontouchstart' in window) || (/tablet/i.test(navigator.userAgent)))) {
        return;
      }

      var campaignId = targetingMsgJson['wzrk_id'].split('_')[0];
      if (doCampHouseKeeping(targetingMsgJson) == false) {
        return;
      }

      campaignDivMap[campaignId] = 'intentPreview';
      var legacy = false;
      var opacityDiv = document.createElement('div');
      opacityDiv.id = 'intentOpacityDiv';
      opacityDiv.setAttribute('style', 'position: fixed;top: 0;bottom: 0;left: 0;width: 100%;height: 100%;z-index: 2147483646;background: rgba(0,0,0,0.7);');
      document.body.appendChild(opacityDiv);

      var msgDiv = document.createElement('div');
      msgDiv.id = 'intentPreview';

      if (typeof targetingMsgJson['display']['proto'] == STRING_CONSTANTS.UNDEFINED) {
        legacy = true;
        msgDiv.setAttribute('style', 'display:block;overflow:hidden;top:55% !important;left:50% !important;position:fixed;z-index:2147483647;width:600px !important;height:600px !important;margin:-300px 0 0 -300px !important;');
      } else {
        msgDiv.setAttribute('style', targetingMsgJson['display']['iFrameStyle']);
      }
      document.body.appendChild(msgDiv);
      var iframe = document.createElement('iframe');
      var borderRadius = targetingMsgJson['display']['br'] == false ? "0" : "8";
      iframe.frameborder = '0px';
      iframe.marginheight = '0px';
      iframe.marginwidth = '0px';
      iframe.scrolling = 'no';
      iframe.id = 'wiz-iframe-intent';
      var onClick = targetingMsgJson['display']['onClick'];
      var pointerCss = '';
      if (onClick != '' && typeof onClick != STRING_CONSTANTS.UNDEFINED) {
        pointerCss = 'cursor:pointer;';
      }
      var html;
      //direct html
      if (targetingMsgJson['msgContent']['type'] == 1) {
        html = targetingMsgJson['msgContent']['html'];
        html = html.replace('##campaignId##', campaignId);
      } else {
        var css = '' +
          '<style type="text/css">' +
          'body{margin:0;padding:0;}' +
          '#contentDiv.wzrk{overflow:hidden;padding:0 0 20px 0;text-align:center;' + pointerCss + '}' +
          '#contentDiv.wzrk td{padding:15px 10px;}' +
          '.wzrkPPtitle{font-weight: bold;font-size: 24px;font-family:arial;word-break: break-word;padding-top:20px;}' +
          '.wzrkPPdscr{font-size: 14px;font-family:arial;line-height:16px;word-break: break-word;display:inline-block;padding:20px 20px 0 20px;line-height:20px;}' +
          '.PL15{padding-left:15px;}' +
          '.wzrkPPwarp{margin:20px 20px 0 5px;padding:0px;border-radius: ' + borderRadius + 'px;box-shadow: 1px 1px 5px #888888;}' +
          'a.wzrkClose{cursor:pointer;position: absolute;top: 11px;right: 11px;z-index: 2147483647;font-size:19px;font-family:arial;font-weight:bold;text-decoration: none;width: 25px;/*height: 25px;*/text-align: center; -webkit-appearance: none; line-height: 25px;' +
          'background: #353535;border: #fff 2px solid;border-radius: 100%;box-shadow: #777 2px 2px 2px;color:#fff;}' +
          'a:hover.wzrkClose{background-color:#d1914a !important;color:#fff !important; -webkit-appearance: none;}' +
          '#contentDiv .button{padding-top:20px;}' +
          '#contentDiv .button a{font-size: 14px;font-weight:bold;font-family:arial;text-align:center;display:inline-block;text-decoration:none;padding:0 30px;height:40px;line-height:40px;background:#ea693b;color:#fff;border-radius:4px;-webkit-border-radius:4px;-moz-border-radius:4px;}' +
          '</style>';

        var bgColor, textColor, btnBg, btColor;
        if (targetingMsgJson['display']['theme'] == 'dark') {
          bgColor = "#2d2d2e";
          textColor = "#eaeaea";
          btnBg = '#353535';
          btColor = '#ffffff';
        } else {
          bgColor = "#ffffff";
          textColor = "#000000";
          btnBg = '#a5a6a6';
          btColor = '#ffffff';
        }
        var titleText = targetingMsgJson['msgContent']['title'];
        var descriptionText = targetingMsgJson['msgContent']['description'];
        var ctaText = "";
        if (typeof targetingMsgJson['msgContent']['ctaText'] != STRING_CONSTANTS.UNDEFINED && targetingMsgJson['msgContent']['ctaText'] != '') {
          ctaText = "<div class='button'><a href='#'>" + targetingMsgJson['msgContent']['ctaText'] + "</a></div>";
        }

        var imageTd = "";
        if (typeof targetingMsgJson['msgContent']['imageUrl'] != STRING_CONSTANTS.UNDEFINED && targetingMsgJson['msgContent']['imageUrl'] != '') {
          imageTd = "<div style='padding-top:20px;'><img src='" + targetingMsgJson['msgContent']['imageUrl'] + "' width='500' alt=" + titleText + " /></div>";
        }
        var onClickStr = "parent.$WZRK_WR.closeIframe(" + campaignId + ",'intentPreview');";
        var title = "<div class='wzrkPPwarp' style='color:" + textColor + ";background-color:" + bgColor + ";'>" +
          "<a href='javascript:void(0);' onclick=" + onClickStr + " class='wzrkClose' style='background-color:" + btnBg + ";color:" + btColor + "'>&times;</a>" +
          "<div id='contentDiv' class='wzrk'>" +
          "<div class='wzrkPPtitle' style='color:" + textColor + "'>" + titleText + "</div>";
        var body = "<div class='wzrkPPdscr' style='color:" + textColor + "'>" + descriptionText + "</div>" + imageTd + ctaText +
          "</div></div>";
        html = css + title + body;
      }
      iframe.setAttribute('style', 'z-index: 2147483647; display:block; height: 100% !important; width: 100% !important;min-height:80px !important;border:0px !important; border-color:none !important;');
      msgDiv.appendChild(iframe);
      var ifrm = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
      var doc = ifrm.document;

      doc.open();
      doc.write(html);
      doc.close();

      var contentDiv = document.getElementById("wiz-iframe-intent").contentDocument.getElementById('contentDiv');
      setupClickUrl(onClick, targetingMsgJson, contentDiv, 'intentPreview', legacy);


    };


    if (!document.body) {
      if (wiz_counter < 6) {
        wiz_counter++;
        setTimeout(wiz.tr, 1000, msg);
      }
      return;
    }
    if (typeof msg['inapp_notifs'] != STRING_CONSTANTS.UNDEFINED) {
      for (var index = 0; index < msg['inapp_notifs'].length; index++) {
        var target_notif = msg['inapp_notifs'][index];
        if (typeof target_notif['display']['wtarget_type'] == STRING_CONSTANTS.UNDEFINED || target_notif['display']['wtarget_type'] == 0) {
          showFooterNotification(target_notif);
        } else if (target_notif['display']['wtarget_type'] == 1) { 	// if display['wtarget_type']==1 then exit intent
          exitintentObj = target_notif;
          window.document.body.onmouseleave = showExitIntent;
        }

      }
    }

    var mergeEventMap = function (newEvtMap) {
      if (typeof globalEventsMap == STRING_CONSTANTS.UNDEFINED) {
        globalEventsMap = wiz.readFromLSorCookie(STRING_CONSTANTS.EV_COOKIE);
        if (typeof globalEventsMap == STRING_CONSTANTS.UNDEFINED) {
          globalEventsMap = newEvtMap;
          return;
        }
      }
      for (var key in newEvtMap) {
        if (newEvtMap.hasOwnProperty(key)) {
          var oldEvtObj = globalEventsMap[key];
          var newEvtObj = newEvtMap[key];
          if (typeof globalEventsMap[key] != STRING_CONSTANTS.UNDEFINED) {
            if (typeof newEvtObj[0] != STRING_CONSTANTS.UNDEFINED && newEvtObj[0] > oldEvtObj[0]) {
              globalEventsMap[key] = newEvtObj;
            }
          } else {
            globalEventsMap[key] = newEvtObj;
          }
        }
      }
    };


    if (wzrk_util.isLocalStorageSupported()) {
      try {
        if (typeof msg['evpr'] != STRING_CONSTANTS.UNDEFINED) {
          var eventsMap = msg['evpr']['events'];
          var profileMap = msg['evpr']['profile'];
          var syncExpiry = msg['evpr']['expires_in'];
          var now = wzrk_util.getNow();
          wiz.setMetaProp('lsTime', now);
          wiz.setMetaProp('exTs', syncExpiry);
          mergeEventMap(eventsMap);
          wiz.saveToLSorCookie(STRING_CONSTANTS.EV_COOKIE, globalEventsMap);
          if (typeof globalProfileMap == STRING_CONSTANTS.UNDEFINED) {
            wiz.addToLocalProfileMap(profileMap, true);
          } else {
            wiz.addToLocalProfileMap(profileMap, false);
          }
        }
        if (typeof msg['arp'] != STRING_CONSTANTS.UNDEFINED) {
          wiz.arp(msg['arp']);
        }
        if (typeof msg['inapp_stale'] != STRING_CONSTANTS.UNDEFINED) {
          var campObj = wzrk_util.getCampaignObject();
          var globalObj = campObj['global'];
          if (typeof globalObj != STRING_CONSTANTS.UNDEFINED) {
            for (var idx in msg['inapp_stale']) {
              if (msg['inapp_stale'].hasOwnProperty(idx)) {
                delete globalObj[msg['inapp_stale'][idx]];
              }
            }
          }
          wzrk_util.saveCampaignObject(campObj);

        }
      } catch (e) {
        wc.e("Unable to persist evrp/arp: " + e);
      }
    }
  };

  //link - actual link, type could be - "ctr" or "view"
  wiz.getWrappedLink = function (link, targetId, type) {

    var data = {};
    data['sendTo'] = link;
    data['targetId'] = targetId;
    data['epoch'] = wzrk_util.getNow();

    if (type != null) {
      data['type'] = type;
    } else {
      data['type'] = 'view';
    }

    data = wiz.addSystemDataToObject(data, undefined);
    return wiz.addToURL(recorderURL, "d", wiz.compressData(JSON.stringify(data)));

  };


  wiz.getMessageTemplate = function () {
    var body = "";
    body = body + '<div class="notice-message">';
    body = body + '  <a href="[RECORDER_HREF]" class="box">';
    body = body + '    <div class="avatar"><span class="fa [ICON] fa-4x fa-fw"></span></div>';
    body = body + '    <div class="info">';
    body = body + '      <div class="title">[TITLE]</div>';
    body = body + '      <div class="clearfix"></div>';
    body = body + '      <div class="text">[TEXT]</div>';
    body = body + '    </div>';
    body = body + '    <div class="clearfix"></div>';
    body = body + '  </a>';
    body = body + '</div>';
    body = body + '<div class="clearfix"></div>';
    return body;
  };

  wiz.getMessageHeadTemplate = function () {
    var head = '<head>';
    head = head + '<base target="_parent" />';
    head = head + '<link rel="stylesheet" href="http://static.clevertap.com/fa/font-awesome.css">';
    head = head + '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    head = head + '<style>';
    head = head + '[STYLE]';
    head = head + '</style>';
    head = head + "</head>";
    return head;

  };


  wiz.isChargedEventStructureValid = function (chargedObj) {
    if (wzrk_util.isObject(chargedObj)) {
      for (var key in chargedObj) {
        if (chargedObj.hasOwnProperty(key)) {


          if (key == "Items") {
            if (!wzrk_util.isArray(chargedObj[key])) {
              return false;
            }

            if (chargedObj[key].length > 16) {
              wiz.reportError(522, "Charged Items exceed 16 limit. Actual count: " + chargedObj[key].length + ". Additional items will be dropped.");
            }

            for (var itemKey in chargedObj[key]) {
              if (chargedObj[key].hasOwnProperty(itemKey)) {    // since default array implementation could be overridden - e.g. Teabox site
                if (!wzrk_util.isObject(chargedObj[key][itemKey]) || !wiz.isEventStructureFlat(chargedObj[key][itemKey])) {
                  return false;
                }
              }
            }
          } else { //Items
            if (wzrk_util.isObject(chargedObj[key]) || wzrk_util.isArray(chargedObj[key])) {
              return false;
            } else if (wzrk_util.isDateObject(chargedObj[key])) {
              chargedObj[key] = wzrk_util.convertToWZRKDate(chargedObj[key]);
            }

          } // if key == Items
        }
      } //for..
      //save charged Id
      if (wzrk_util.isString(chargedObj[STRING_CONSTANTS.CHARGED_ID]) || wzrk_util.isNumber(chargedObj[STRING_CONSTANTS.CHARGED_ID])) {
        //casting chargeedId to string
        var chargedId = chargedObj[STRING_CONSTANTS.CHARGED_ID] + "";
        if (typeof globalChargedId == STRING_CONSTANTS.UNDEFINED) {
          globalChargedId = wiz.readFromLSorCookie(STRING_CONSTANTS.CHARGEDID_COOKIE_NAME);
        }
        if (typeof globalChargedId != STRING_CONSTANTS.UNDEFINED && globalChargedId.trim() === chargedId.trim()) {
          //drop event- duplicate charged id
          wc.e("Duplicate Charged Id - Dropped" + chargedObj);
          return false;
        }
        globalChargedId = chargedId;
        wiz.saveToLSorCookie(STRING_CONSTANTS.CHARGEDID_COOKIE_NAME, chargedId);
      }
      return true;
    } // if object (chargedObject)
    return false;
  };


  //events can't have any nested structure or arrays
  wiz.isEventStructureFlat = function (eventObj) {
    if (wzrk_util.isObject(eventObj)) {
      for (var key in eventObj) {
        if (eventObj.hasOwnProperty(key)) {
          if (wzrk_util.isObject(eventObj[key]) || wzrk_util.isArray(eventObj[key])) {
            return false;
          } else if (wzrk_util.isDateObject(eventObj[key])) {
            eventObj[key] = wzrk_util.convertToWZRKDate(eventObj[key]);
          }
        }
      }
      return true;
    }
    return false;

  };

  wiz.isProfileValid = function (profileObj) {

    if (wzrk_util.isObject(profileObj)) {
      for (var profileKey in profileObj) {
        if (profileObj.hasOwnProperty(profileKey)) {
          var valid = true;
          var profileVal = profileObj[profileKey];

          if (typeof profileVal == STRING_CONSTANTS.UNDEFINED) {
            delete profileObj[profileKey];
            continue;
          }
          if (profileKey == 'Gender' && !profileVal.match(/^M$|^F$/)) {
            valid = false;
            wc.e(wzrk_msg['gender-error']);
          }

          if (profileKey == 'Employed' && !profileVal.match(/^Y$|^N$/)) {
            valid = false;
            wc.e(wzrk_msg['employed-error']);
          }

          if (profileKey == 'Married' && !profileVal.match(/^Y$|^N$/)) {
            valid = false;
            wc.e(wzrk_msg['married-error']);
          }

          if (profileKey == 'Education' && !profileVal.match(/^School$|^College$|^Graduate$/)) {
            valid = false;
            wc.e(wzrk_msg['education-error']);
          }

          if (profileKey == 'Age' && typeof profileVal != STRING_CONSTANTS.UNDEFINED) {
            if (wzrk_util.isConvertibleToNumber(profileVal)) {
              profileObj['Age'] = +profileVal;
            } else {
              valid = false;
              wc.e(wzrk_msg['age-error']);
            }
          }

          // dob will come in like this - $dt_19470815 or dateObject
          if (profileKey == 'DOB') {
            if (((!(/^\$D_/).test(profileVal) || (profileVal + "").length != 11)) && !wzrk_util.isDateObject(profileVal)) {
              valid = false;
              wc.e(wzrk_msg['dob-error']);
            }

            if (wzrk_util.isDateObject(profileVal)) {
              profileObj[profileKey] = wzrk_util.convertToWZRKDate(profileVal);
            }
          } else if (wzrk_util.isDateObject(profileVal)) {
            profileObj[profileKey] = wzrk_util.convertToWZRKDate(profileVal);
          }

          if (profileKey == 'Phone' && !wzrk_util.isObjectEmpty(profileVal)) {
            if (profileVal.length > 8 && (profileVal.charAt(0) == '+')) { // valid phone number
              profileVal = profileVal.substring(1, profileVal.length);
              if (wzrk_util.isConvertibleToNumber(profileVal)) {
                profileObj['Phone'] = +profileVal;
              } else {
                valid = false;
                wc.e(wzrk_msg['phone-format-error'] + ". Removed.");
              }
            } else {
              valid = false;
              wc.e(wzrk_msg['phone-format-error'] + ". Removed.");
            }
          }


          if (!valid) {
            delete profileObj[profileKey];
          }
        }
      }

    }

    return valid;
  }; //isProfileValid

  wiz.setDate = function (dt) {
    return wzrk_util.setDate(dt);
  };

  wiz.setEnum = function (enumVal) {
    if (wzrk_util.isString(enumVal) || wzrk_util.isNumber(enumVal)) {
      return "$E_" + enumVal;
    }
    wc.e(wzrk_msg['enum-format-error']);
  };

  // list of functions that the closure compiler shouldn't rename
  // https://developers.google.com/closure/compiler/docs/api-tutorial3
  wiz['s'] = wiz.s;
  wiz['is_onloadcalled'] = wiz.is_onloadcalled;
  wiz['setDate'] = wiz.setDate;
  wiz['enableWebPush'] = wiz.enableWebPush; // support for web push notifications
  wiz['setEnum'] = wiz.setEnum;
  wiz['tr'] = wiz.tr;
  wiz['push'] = wiz.push;
  wiz['closeIframe'] = wiz.closeIframe;
  wiz['getEmail'] = wiz.getEmail;
  wiz['unSubEmail'] = wiz.unSubEmail;
  wiz['subEmail'] = wiz.subEmail;
  wiz['logout'] = wiz.logout;
  wiz['clear'] = wiz.clear;
  wizrocket['getCleverTapID'] = wiz.getCleverTapID;


// ---------- compression part ----------

  var LZS = {

    _f: String.fromCharCode,

    getKeyStr: function () {
      var key = "";
      var i = 0;

      for (i = 0; i <= 25; i++) {
        key = key + String.fromCharCode(i + 65);
      }

      for (i = 0; i <= 25; i++) {
        key = key + String.fromCharCode(i + 97);
      }

      for (var i = 0; i < 10; i++) {
        key = key + i;
      }

      return key + "+/=";
    },

    convertToFormattedHex: function (byte_arr) {
      var hex_str = "",
        i,
        len,
        tmp_hex;

      if (!wzrk_util.isArray(byte_arr)) {
        return false;
      }

      len = byte_arr.length;

      for (i = 0; i < len; ++i) {
        if (byte_arr[i] < 0) {
          byte_arr[i] = byte_arr[i] + 256;
        }
        if (byte_arr[i] === undefined) {
          byte_arr[i] = 0;
        }
        tmp_hex = byte_arr[i].toString(16);

        // Add leading zero.
        if (tmp_hex.length == 1) tmp_hex = "0" + tmp_hex;

        //        beautification - needed if you're printing this in the console, else keep commented
        //        if ((i + 1) % 16 === 0) {
        //          tmp_hex += "\n";
        //        } else {
        //          tmp_hex += " ";
        //        }

        hex_str += tmp_hex;
      }

      return hex_str.trim();
    },

    convertStringToHex: function (s) {

      var byte_arr = [];
      for (var i = 0; i < s.length; i++) {
        var value = s.charCodeAt(i);
        byte_arr.push(value & 255);
        byte_arr.push((value >> 8) & 255);
      }
      return LZS.convertToFormattedHex(byte_arr);

    },

    compressToBase64: function (input) {
      if (input == null) return "";
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;

      input = LZS.compress(input);

      while (i < input.length * 2) {

        if (i % 2 == 0) {
          chr1 = input.charCodeAt(i / 2) >> 8;
          chr2 = input.charCodeAt(i / 2) & 255;
          if (i / 2 + 1 < input.length)
            chr3 = input.charCodeAt(i / 2 + 1) >> 8;
          else
            chr3 = NaN;
        } else {
          chr1 = input.charCodeAt((i - 1) / 2) & 255;
          if ((i + 1) / 2 < input.length) {
            chr2 = input.charCodeAt((i + 1) / 2) >> 8;
            chr3 = input.charCodeAt((i + 1) / 2) & 255;
          } else
            chr2 = chr3 = NaN;
        }
        i += 3;

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
          LZS._keyStr.charAt(enc1) + LZS._keyStr.charAt(enc2) +
          LZS._keyStr.charAt(enc3) + LZS._keyStr.charAt(enc4);

      }

      return output;
    },


    compress: function (uncompressed) {
      if (uncompressed == null) return "";
      var i, value,
        context_dictionary = {},
        context_dictionaryToCreate = {},
        context_c = "",
        context_wc = "",
        context_w = "",
        context_enlargeIn = 2, // Compensate for the first entry which should not count
        context_dictSize = 3,
        context_numBits = 2,
        context_data_string = "",
        context_data_val = 0,
        context_data_position = 0,
        ii,
        f = LZS._f;

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
                context_data_val = (context_data_val << 1);
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
                context_data_val = (context_data_val << 1) | (value & 1);
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
                context_data_val = (context_data_val << 1) | value;
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
                context_data_val = (context_data_val << 1) | (value & 1);
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
              context_data_val = (context_data_val << 1) | (value & 1);
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
          // Add wc to the dictionary.
          context_dictionary[context_wc] = context_dictSize++;
          context_w = String(context_c);
        }
      }

      // Output the code for w.
      if (context_w !== "") {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1);
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
              context_data_val = (context_data_val << 1) | (value & 1);
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
              context_data_val = (context_data_val << 1) | value;
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
              context_data_val = (context_data_val << 1) | (value & 1);
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
            context_data_val = (context_data_val << 1) | (value & 1);
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
      }

      // Mark the end of the stream
      value = 2;
      for (i = 0; i < context_numBits; i++) {
        context_data_val = (context_data_val << 1) | (value & 1);
        if (context_data_position == 15) {
          context_data_position = 0;
          context_data_string += f(context_data_val);
          context_data_val = 0;
        } else {
          context_data_position++;
        }
        value = value >> 1;
      }

      // Flush the last char
      while (true) {
        context_data_val = (context_data_val << 1);
        if (context_data_position == 15) {
          context_data_string += f(context_data_val);
          break;
        } else context_data_position++;
      }
      return context_data_string;
    }

  };

  LZS._keyStr = LZS.getKeyStr();

  var wzrk_util = {
    //expecting  yyyymmdd format either as a number or a string
    setDate: function (dt) {
      if (wzrk_util.isDateValid(dt)) {
        return "$D_" + dt;
      }
      wc.e(wzrk_msg['date-format-error']);
    },

    isDateObject: function (input) {
      return typeof (input) === "object" && (input instanceof Date);
    },

    convertToWZRKDate: function (dateObj) {
      return ("$D_" + Math.round(dateObj.getTime() / 1000));
    },

    isDateValid: function (date) {
      var matches = /^(\d{4})(\d{2})(\d{2})$/.exec(date);
      if (matches == null) return false;
      var d = matches[3];
      var m = matches[2] - 1;
      var y = matches[1];
      var composedDate = new Date(y, m, d);
      return composedDate.getDate() == d &&
        composedDate.getMonth() == m &&
        composedDate.getFullYear() == y;
    },

    isArray: function (input) {
      return typeof (input) === "object" && (input instanceof Array);
    },

    isObject: function (input) {
      return Object.prototype.toString.call(input) == "[object Object]";
    },

    isObjectEmpty: function (obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
          return false;
      }
      return true;
    },

    isString: function (input) {
      return (typeof input == 'string' || input instanceof String);
    },


    // if yes, the convert using +number.
    isConvertibleToNumber: function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },

    //from here - http://stackoverflow.com/a/1421988/2456615
    isNumber: function (n) {
      return /^-?[\d.]+(?:e-?\d+)?$/.test(n) && typeof n == 'number';
    },

    arrayContains: function (arr, obj) {
      function contains(arr, obj) {
        var i = arr.length;
        while (i--) {
          if (arr[i] === obj) {
            return true;
          }
        }
        return false;
      }
    },

    getURLParams: function (url) {
      var urlParams = {};
      var idx = url.indexOf('?');

      if (idx > 1) {

        var uri = url.substring(idx + 1);


        var match,
          pl = /\+/g,  // Regex for replacing addition symbol with a space
          search = /([^&=]+)=?([^&]*)/g,
          decode = function (s) {
            var replacement = s.replace(pl, " ");
            try {
              replacement = decodeURIComponent(replacement);
            } catch (e) {
              //eat
            }
            return replacement;
          };


        while (match = search.exec(uri)) {
          urlParams[decode(match[1])] = decode(match[2]);
        }

      }
      return urlParams;
    },

    getDomain: function (url) {
      if (url == "") return "";
      var a = document.createElement('a');
      a.href = url;
      return a.hostname;
    },


    //keys can't be greater than 1024 chars, values can't be greater than 1024 chars
    removeUnsupportedChars: function (o) {
      if (typeof o == "object") {
        for (var key in o) {
          if (o.hasOwnProperty(key)) {
            var sanitizedVal = wzrk_util.removeUnsupportedChars(o[key]);
            var sanitizedKey = wzrk_util.isString(key) ? wzrk_util.sanitize(key, unsupportedKeyCharRegex) : key;

            if (wzrk_util.isString(key)) {
              sanitizedKey = wzrk_util.sanitize(key, unsupportedKeyCharRegex);
              if (sanitizedKey.length > 1024) {
                sanitizedKey = sanitizedKey.substring(0, 1024);
                $WZRK_WR.reportError(520, sanitizedKey + "... length exceeded 1024 chars. Trimmed.");
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

        if (wzrk_util.isString(o)) {
          val = wzrk_util.sanitize(o, unsupportedValueCharRegex);
          if (val.length > 1024) {
            val = val.substring(0, 1024);
            $WZRK_WR.reportError(521, val + "... length exceeded 1024 chars. Trimmed.");
          }
        } else {
          val = o;
        }
        return val;
      }
      return o;
    },

    sanitize: function (input, regex) {
      return input.replace(regex, '');
    },

    isLocalStorageSupported: function () {
      try {
        window.localStorage.setItem('wzrk_debug', '12345678');
        window.localStorage.removeItem('wzrk_debug');
        return 'localStorage' in window && window['localStorage'] !== null;
      } catch (e) {
        return false;
      }
    },

    getCampaignObject: function () {
      var campObj = {};
      if (wzrk_util.isLocalStorageSupported()) {
        campObj = localStorage[STRING_CONSTANTS.CAMP_COOKIE_NAME];
        if (typeof campObj != STRING_CONSTANTS.UNDEFINED) {
          campObj = JSON.parse(decodeURIComponent(campObj).replace(singleQuoteRegex, "\""));
        } else {
          campObj = {};
        }
      }
      return campObj;
    },

    saveCampaignObject: function (campaignObj) {
      if (wzrk_util.isLocalStorageSupported()) {
        var campObj = JSON.stringify(campaignObj);
        localStorage[STRING_CONSTANTS.CAMP_COOKIE_NAME] = encodeURIComponent(campObj);
      }
    },


    isPersonalizationActive: function () {
      return (wzrk_util.isLocalStorageSupported() && wizrocket['enablePersonalization'])
    },

    getToday: function () {
      var t = new Date();
      return t.getFullYear() + "" + t.getMonth() + "" + t.getDay();
    },
    getNow: function () {
      return Math.floor(((new Date()).getTime()) / 1000);
    }

  };

// leading spaces, dot, colon, dollar, single quote, double quote, backslash, trailing spaces
  var unsupportedKeyCharRegex = new RegExp("^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$", "g");

// leading spaces, single quote, double quote, backslash, trailing spaces
  var unsupportedValueCharRegex = new RegExp("^\\s+|\'|\"|\\\\|\\s+$", "g");

//used to handle cookies in Opera mini
  var doubleQuoteRegex = new RegExp("\"", "g");
  var singleQuoteRegex = new RegExp("\'", "g");


  var wzrk_msg = {};
  var wzrk_error_txt = "CleverTap error: ";
  var data_not_sent_txt = "This property has been ignored.";
  wzrk_msg['embed-error'] = wzrk_error_txt + "Incorrect embed script.";
  wzrk_msg['event-error'] = wzrk_error_txt + "Event structure not valid. " + data_not_sent_txt;
  wzrk_msg['gender-error'] = wzrk_error_txt + "Gender value should be either M or F. " + data_not_sent_txt;
  wzrk_msg['employed-error'] = wzrk_error_txt + "Employed value should be either Y or N. " + data_not_sent_txt;
  wzrk_msg['married-error'] = wzrk_error_txt + "Married value should be either Y or N. " + data_not_sent_txt;
  wzrk_msg['education-error'] = wzrk_error_txt + "Education value should be either School, College or Graduate. " + data_not_sent_txt;
  wzrk_msg['age-error'] = wzrk_error_txt + "Age value should be a number. " + data_not_sent_txt;
  wzrk_msg['dob-error'] = wzrk_error_txt + "DOB value should be a Date Object";
  wzrk_msg['obj-arr-error'] = wzrk_error_txt + "Expecting Object array in profile";
  wzrk_msg['date-format-error'] = wzrk_error_txt + "setDate(number). number should be formatted as yyyymmdd";
  wzrk_msg['enum-format-error'] = wzrk_error_txt + "setEnum(value). value should be a string or a number";
  wzrk_msg['phone-format-error'] = wzrk_error_txt + "Phone number should be formatted as +[country code][number]";

} // function __wizrocket

$WZRK_WR = new __wizrocket();
$CLTP_WR = $WZRK_WR;
$WZRK_WR.init(); //this should always be the last in the JS file, as it needs all vars/functions to be defined to work.


/**
 * @preserve Copyright WizRocket, Inc. (ver.@timestamp@)
 *        ____ _                    _____
 *       / ___| | _____   _____ _ _|_   _|_ _ _ __
 *      | |   | |/ _ \ \ / / _ \ '__|| |/ _` | '_ \
 *      | |___| |  __/\ V /  __/ |   | | (_| | |_) |
 *       \____|_|\___| \_/ \___|_|   |_|\__,_| .__/
 *                                           |_|
 *
 */