const { default: constants } = require("./src/util/constants");
const { logger } = require("./src/modules/logger");
const { default: CleverTap } = require("./src/clevertap");
const { default: LRUCache } = require("./src/util/lruCache");

function __wizrocket() {
  // var targetDomain = 'wzrkt.com'; -> options.js
  // var wz_pr = "https:"; -> options.js
  // var dataPostURL, recorderURL, emailURL; -> clevertap.js
  // var wiz = this;
  // var serviceWorkerPath = '/clevertap_sw.js'; // the service worker is placed in the doc root
  // var doc = document;
  // var domain = window.location.hostname;
  // var broadDomain;
  // var wc = window.console;
  // var requestTime = 0, seqNo = 0;
  // var wzrk_error = {}; //to trap input errors -> logger.js
  // var wiz_counter = 0; // to keep track of number of times we load the body
  // var globalCache = {};
  // to be used for checking whether the script loaded fine and the wiz.init function was called
  // var onloadcalled = 0;  // 1 = fired
  // var processingBackup = false;
  // var unsubGroups = []
  // var gcookie, scookieObj;
  // var accountId, region;
  // var campaignDivMap = {};
  // var blockRequeust = false, clearCookie = false;
  // var SCOOKIE_NAME, globalChargedId;
  // var globalEventsMap, globalProfileMap, currentSessionId;
  // var storageDelim = "|$|";
  // var staleEvtMaxTime = 20 * 60; //20 mins
  // var COOKIE_EXPIRY = 86400 * 365 * 10; //10 years in seconds. Seconds in an days * days in an year * number of years -> constants.js
  // var LRU_CACHE, LRU_CACHE_SIZE = 100;
  // var chromeAgent;
  // var firefoxAgent;
  // var safariAgent;
  // for VAPID web push
  // function urlBase64ToUint8Array(base64String) -> encodeURI.js
  // var fcmPublicKey = null;
  // var STRING_CONSTANTS -> constants.js

  // path to reference the JS for our dialog
  var wizAlertJSPath = 'https://d2r1yp2w7bby2u.cloudfront.net/js/wzrk_dialog.min.js';

  var FIRST_PING_FREQ_IN_MILLIS = 2 * 60 * 1000; // 2 mins
  var CONTINUOUS_PING_FREQ_IN_MILLIS = 5 * 60 * 1000; // 5 mins

  var TWENTY_MINS = 20 * 60 * 1000;

  var SCOOKIE_EXP_TIME_IN_SECS = 60 * 20;  // 20 mins

  var GROUP_SUBSCRIPTION_REQUEST_ID = "2";

  var EVT_PING = "ping", EVT_PUSH = "push";

  var REQ_N = 0;
  var RESP_N = 0;

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
      console.error('Ensure that web push notifications are fully enabled and integrated before requesting them');
    }
  };

  wiz.setUpWebPushNotifications = function (subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsServiceUrl) {
    if(navigator.userAgent.indexOf('Chrome') !== -1 || navigator.userAgent.indexOf('Firefox') !== -1){
      wiz.setUpChromeFirefoxNotifications(subscriptionCallback, serviceWorkerPath);
    } else if(navigator.userAgent.indexOf('Safari') !== -1){
      wiz.setUpSafariNotifications(subscriptionCallback, apnsWebPushId, apnsServiceUrl);
    }
  };

  /**
   * Sets up a service worker for chrome push notifications and sends the data to LC
   */
  wiz.setUpSafariNotifications= function (subscriptionCallback, apnsWebPushId, apnsServiceUrl) {
    // ensure that proper arguments are passed
    if (typeof apnsWebPushId === "undefined") {
      console.error('Ensure that APNS Web Push ID is supplied');
    }
    if (typeof apnsServiceUrl === "undefined") {
      console.error('Ensure that APNS Web Push service path is supplied');
    }
    if ('safari' in window && 'pushNotification' in window['safari']) {
      window['safari']['pushNotification']['requestPermission'](
          apnsServiceUrl,
          apnsWebPushId, {}, function (subscription) {
            if (subscription['permission'] === 'granted') {
              var subscriptionData = JSON.parse(JSON.stringify(subscription));
              subscriptionData['endpoint'] = subscription['deviceToken'];
              subscriptionData['browser'] = 'Safari';

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
              console.log('Safari Web Push registered. Device Token: ' + subscription['deviceToken']);
            } else if (subscription.permission === 'denied') {
              console.log('Error subscribing to Safari web push');
            }
          });
    }
  }

  /**
   * Sets up a service worker for WebPush(chrome/Firefox) push notifications and sends the data to LC
   */
  wiz.setUpChromeFirefoxNotifications = function (subscriptionCallback, serviceWorkerPath) {


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
          console.log('Service Worker registered. Endpoint: ' + subscription['endpoint']);

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
          console.log('Error subscribing: ' + error);
          //unsubscribe from webpush if error
          serviceWorkerRegistration['pushManager']['getSubscription']()['then'](function (subscription) {
            if (subscription !== null) {
              subscription['unsubscribe']()['then'](function (successful) {
                // You've successfully unsubscribed
                console.log('Unsubscription successful');
              })['catch'](function (e) {
                // Unsubscription failed
                console.log('Error unsubscribing: ' + e)
              })
            }
          })
        });
      })['catch'](function (err) {
        console.log('error registering service worker: ' + err);
      });
    }
  };

  wiz.getCleverTapID = function () {
    return gcookie;
  };

  wiz.init = function () {


    // if (typeof wizrocket['account'][0] == STRING_CONSTANTS.UNDEFINED) {
    //   console.error(wzrk_msg['embed-error']);
    //   return;
    // } else {
    //   accountId = wizrocket['account'][0]['id'];

    //   if (typeof accountId == STRING_CONSTANTS.UNDEFINED || accountId == '') {
    //     console.error(wzrk_msg['embed-error']);
    //     return;
    //   }
    //   SCOOKIE_NAME = STRING_CONSTANTS.SCOOKIE_PREFIX + '_' + accountId;

    // }
    // if (typeof wizrocket['region'] != STRING_CONSTANTS.UNDEFINED) {
    //   region = wizrocket['region'];
    //   targetDomain = region + '.' + targetDomain;
    // }

    // dataPostURL = wz_pr + '//' + targetDomain + '/a?t=96';
    // recorderURL = wz_pr + '//' + targetDomain + '/r?r=1';
    // emailURL = wz_pr + '//' + targetDomain + '/e?r=1';

    // var currLocation = location.href;
    // var url_params = wzrk_util.getURLParams(location.href.toLowerCase());

    // if (typeof url_params['e'] != STRING_CONSTANTS.UNDEFINED && url_params['wzrk_ex'] == '0') {
    //   return;
    // }

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

      // wizrocket['event']['getDetails'] = function (evtName) -> event.js

      // wizrocket['profile']['getAttribute'] = function (propName) -> profile.js
      wizrocket['session'] = {};
      // wizrocket['session']['getTimeElapsed'] = function () -> session.js

      wizrocket['user'] = {};
      // wizrocket['user']['getTotalVisits'] = function () -> user.js

      // wizrocket['session']['getPageCount'] = function () -> session.js

      // wizrocket['user']['getLastVisit'] = function () -> user.js
    }
    onloadcalled = 1;   //always the last line in this function


  };

  // wiz.readFromLSorCookie = function (property) -> Storage.js
  // wiz.saveToLSorCookie -> Storage.js

  // var processEvent = function (data) -> request.js

  // wiz.processEventArray = function (eventArr) -> event.js

  // wiz.addToLocalEventMap = function (evtName) -> request.js

  // wiz.addToLocalProfileMap = function (profileObj, override) -> profile.js

  // wiz.overrideDSyncFlag = function (data) -> CleverTap.js

  // wiz.addARPToRequest = function (url, skipResARP) -> api.js

  // wiz.addFlags = function (data) -> request.js

  // var unregisterTokenForGuid = function (givenGUID) -> request.js

  // var LRU_cache = function (max) -> LRUCache.js

  // wiz.getCampaignObjForLc = function () -> util/clevertap

  // var handleCookieFromCache = function () -> Storage.js

  // var deleteUser = function () -> Storage.js

  // var setInstantDeleteFlagInK = function () -> Storage.js

  // wiz.logout = function () -> session.js


  // wiz.clear = function () -> storage.js


  /*
          We dont set the arp in cache for deregister requests.
          For deregister requests we check for 'skipResARP' flag payload. If present we skip it.

          Whenever we get 'isOUL' flag true in payload we delete the existing ARP instead of updating it.
       */
  wiz.arp = function (jsonMap) {
    // For unregister calls dont set arp in LS
    if(typeof jsonMap["skipResARP"] !== STRING_CONSTANTS.UNDEFINED && jsonMap["skipResARP"]) {
      console.debug("Update ARP Request rejected", jsonMap);
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
        console.error("Unable to parse ARP JSON: " + e);
      }

    }
  };

  // wiz.processProfileArray = function (profileArr) -> event.js

  // wiz.processOUL = function (profileArr) -> userLogin.js

  // wiz.processLoginArray = function (loginArr) -> userLogin.js

  wiz.overloadArrayPush = function () {

    // if (typeof wizrocket['onUserLogin'] === "undefined") -> CleverTap.js

    // wizrocket['onUserLogin'].push = -> userLogin.js

    // if (typeof wizrocket['privacy'] === "undefined") -> privacy.js

    // wizrocket['privacy'].push = function () -> privacy.js

    // wizrocket['event'].push = function () -> event.js
    
    if (typeof wizrocket['notifications'] === STRING_CONSTANTS.UNDEFINED)
      wizrocket['notifications'] = [];

    wizrocket['notifications'].push = function () {
      wiz.setUpWebPush(Array.prototype.slice.call(arguments));
      return 0;
    };


    // wizrocket['profile'].push = function () ->profile.js
    //   //since arguments is not an array, convert it into an array
    //   wiz.processProfileArray(Array.prototype.slice.call(arguments));
    //   return 0;
    // };
    wizrocket['logout'] = wiz.logout;
    wizrocket['clear'] = wiz.clear;
    wiz.processLoginArray(wizrocket['onUserLogin']);  // process old stuff from the login array before we overloaded the push method
    wiz.processPrivacyArray(wizrocket['privacy']);  // process old stuff from the privacy array before we overloaded the push method
    // wiz.processEventArray(wizrocket['event']);      // process old stuff from the event array before we overloaded the push method
    // wiz.processProfileArray(wizrocket['profile']);  // process old stuff from the profile array before we overloaded the push method
    wiz.setUpWebPush(wizrocket['notifications']); // process old stuff from notifications array before overload

    // clean up the notifications array
    while (wizrocket['notifications'].length > 0)
      wizrocket['notifications'].pop();
  };

  var isOptInRequest = false;

  // var dropRequestDueToOptOut = -> applicationCache.js

  // var addUseIPToRequest = function (pageLoadUrl) -> unused

  // wiz.processPrivacyArray = function (privacyArr) -> privacy.js

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
      console.debug("Not fired due to block request - " + blockRequeust + " or clearCookie - " + clearCookie);
    }

  };


  // profile like https://developers.google.com/+/api/latest/people
  // wiz.processGPlusUserObj = function (user) -> profile.js

  // wiz.processFBUserObj = function (user) -> profile.js


  wiz.getEmail = function (reEncoded) {
    wiz.handleEmailSubscription('-1', reEncoded);
  };


  wiz.unSubEmail = function (reEncoded) {
    wiz.handleEmailSubscription("0", reEncoded)
  };

  wiz.unsubEmailGroups = function (reEncoded) {
    unsubGroups = []
    var elements = document.getElementsByClassName(
        "ct-unsub-group-input-item");

    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      if(element.name) {
        var data = {name: element.name, isUnsubscribed: element.checked}
        unsubGroups.push(data)
      }
    }

    wiz.handleEmailSubscription(GROUP_SUBSCRIPTION_REQUEST_ID, reEncoded)
  };

  wiz.setSubscriptionGroups = function(value) {
    unsubGroups = value
  }

  wiz.getSubscriptionGroups = function () {
    return unsubGroups
  }

  wiz.subEmail = function (reEncoded) {
    wiz.handleEmailSubscription("1", reEncoded)
  };

  wiz.handleEmailSubscription = function (subscription, reEncoded) {

    var url_params_as_is = wzrk_util.getURLParams(location.href);  // can't use url_params as it is in lowercase above
    var encodedEmailId = url_params_as_is['e'];
    var encodedProfileProps = url_params_as_is['p'];

    if (typeof encodedEmailId !== STRING_CONSTANTS.UNDEFINED) {
      var data = {};
      data['id'] = accountId;  //accountId
      data['unsubGroups'] = unsubGroups // unsubscribe groups

      var url = emailURL;
      if(reEncoded) {
        url = wiz.addToURL(url, "encoded", reEncoded);
      }
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

  // wiz.reportError -> logger.js

  //to debug put this in the JS console -> sessionStorage['WZRK_D']="";
  wiz.isDebug = function () {
    return ((typeof sessionStorage != STRING_CONSTANTS.UNDEFINED) && sessionStorage['WZRK_D'] == '');
  };

  wiz.isPingContinuous = function () {
    return ((typeof wzrk_d != STRING_CONSTANTS.UNDEFINED) && (wzrk_d['ping'] == 'continuous'));
  };


  // wiz.compressData = -> encodeURIComponent.js


  // wiz.addSystemDataToObject = function (dataObject, ignoreTrim) -> request.js


  // wiz.getSessionCookieObject = function () -> session.js


  // wiz.setSessionCookieObject = function (obj) -> session.js

  // wiz.isValueValid -> equivalent to == null
  // wiz.getGuid = function ()  -> getGUID() device.js
  // wiz.g = function () -> part of Init now
  // wiz.setMetaProp = function (key, value) -> Storage.js
  // wiz.getMetaProp = function (key) -> getMetaProp in Storage.js
  // wiz.getAndClearMetaProp = function (key) -> Storage.js

  // wiz.manageSession = function (session) -> session.js


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
      console.debug("Cookie was " + gcookie + " set to " + global);
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
      console.debug("Resumed requests");
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

  // wiz.processBackupEvents = function () -> event.js

  wiz.removeBackup = function (respNo) {
    var backupMap = wiz.readFromLSorCookie(STRING_CONSTANTS.LCOOKIE_NAME);
    if (typeof backupMap != 'undefined' && backupMap != null && typeof backupMap[respNo] != 'undefined') {
      console.debug("del event: " + respNo + " data->" + backupMap[respNo]['q']);
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
    console.debug("stored in " + STRING_CONSTANTS.LCOOKIE_NAME + " reqNo : " + reqNo + "-> " + data);

  };

  // wiz.createBroadCookie = function (name, value, seconds, domain) -> Storage.js
  // wiz.createCookie = function (name, value, seconds, domain)  -> Storage.js
  // wiz.readCookie = function readCookie(name) -> Storage.js
  // wiz.deleteCookie = function (name, domain) -> removeCookie in Storage.js

  // wiz.addToURL = -> url.js

  var MAX_TRIES = 50;

  // var fireRequest = function (url, tries, skipARP, sendOULFlag) -> applicationCache.js

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
      console.error('Make sure push notifications are fully enabled and integrated');
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
    var apnsWebPushId;
    var apnsWebPushServiceUrl;

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
        apnsWebPushId = notifObj["apnsWebPushId"];
        apnsWebPushServiceUrl = notifObj["apnsWebPushServiceUrl"];
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
      console.error("Make sure you are https or localhost to register for notifications");
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
    }else if(navigator.userAgent.indexOf('Safari') !== -1){
      safariAgent = navigator.userAgent.match(/Safari\/(\d+)/);
      if(typeof safariAgent === STRING_CONSTANTS.UNDEFINED || parseInt(safariAgent[1], 10) < 50)
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
        wiz.setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl);
        return;
      } else if (Notification.permission === 'denied') {
        // we've lost this profile :'(
        return;
      }

      if (skipDialog) {
        wiz.setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl);
        return;
      }
    }

    // make sure the right parameters are passed
    if (!titleText || !bodyText || !okButtonText || !rejectButtonText) {
      console.error('Missing input parameters; please specify title, body, ok button and cancel button text');
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
            wiz.setUpWebPushNotifications(subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsWebPushServiceUrl);
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
        console.error("Unable to persist evrp/arp: " + e);
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

  // wiz.isChargedEventStructureValid = function (chargedObj) -> event.js
  // wiz.isEventStructureFlat = function (eventObj) -> event.js
  // wiz.isProfileValid = function (profileObj) -> event.js
  // wiz.setDate = function (dt) -> datetime.js

  wiz.setEnum = function (enumVal) {
    if (wzrk_util.isString(enumVal) || wzrk_util.isNumber(enumVal)) {
      return "$E_" + enumVal;
    }
    console.error(wzrk_msg['enum-format-error']);
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
  wiz['unsubEmailGroups'] = wiz.unsubEmailGroups;
  wiz['getSubscriptionGroups'] = wiz.getSubscriptionGroups;
  wiz['setSubscriptionGroups'] = wiz.setSubscriptionGroups;
  wiz['subEmail'] = wiz.subEmail;
  wiz['logout'] = wiz.logout;
  wiz['clear'] = wiz.clear;
  wizrocket['getCleverTapID'] = wiz.getCleverTapID;


  // ---------- compression part ----------

  var LZS = {
    // _f: String.fromCharCode,
    // getKeyStr: function () -> endoder.js
    // convertToFormattedHex: function (byte_arr) -> endoder.js
    // convertStringToHex: function (s) -> endoder.js
    // compressToBase64: -> endoder.js
    // compress: function (uncompressed) -> endoder.js
  };

  // LZS._keyStr = LZS.getKeyStr(); Unused? 

  // leading spaces, dot, colon, dollar, single quote, double quote, backslash, trailing spaces
  var unsupportedKeyCharRegex = new RegExp("^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$", "g");

  // leading spaces, single quote, double quote, backslash, trailing spaces
  var unsupportedValueCharRegex = new RegExp("^\\s+|\'|\"|\\\\|\\s+$", "g");

  //used to handle cookies in Opera mini
  var doubleQuoteRegex = new RegExp("\"", "g");
  var singleQuoteRegex = new RegExp("\'", "g");


  // var wzrk_msg = {}; -> messages.js
  // var wzrk_error_txt = "CleverTap error: "; -> messages.js
  var data_not_sent_txt = "";
} // function __wizrocket

$WZRK_WR = new __wizrocket();
$CLTP_WR = $WZRK_WR;
$WZRK_WR.init(); //this should always be the last in the JS file, as it needs all vars/functions to be defined to work.
