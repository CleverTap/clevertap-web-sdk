const { default: CleverTap } = require("./src/clevertap");

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
  // var wizAlertJSPath = 'https://d2r1yp2w7bby2u.cloudfront.net/js/wzrk_dialog.min.js'; -> notification.js

  // var FIRST_PING_FREQ_IN_MILLIS = 2 * 60 * 1000; // 2 mins
  // var CONTINUOUS_PING_FREQ_IN_MILLIS = 5 * 60 * 1000; // 5 mins

  // var TWENTY_MINS = 20 * 60 * 1000; // unused

  var SCOOKIE_EXP_TIME_IN_SECS = 60 * 20;  // 20 mins

  // var GROUP_SUBSCRIPTION_REQUEST_ID = "2";

  // var EVT_PING = "ping", EVT_PUSH = "push";

  var REQ_N = 0;
  var RESP_N = 0;

  var webPushEnabled; // gets set to true on page request, when chrome notifs have been integrated completely -> $ct

  // wiz.is_onloadcalled = function () -> CleverTap.js

  // use these to add and remove sweet alert dialogs as necessary
  // wiz.addWizAlertJS = function () -> notification.js

  // wiz.removeWizAlertJS = function () -> notification.js


  // wiz.enableWebPush = function (enabled, applicationServerKey) -> notification.js

  // wiz.setUpWebPushNotifications = function (subscriptionCallback, serviceWorkerPath, apnsWebPushId, apnsServiceUrl) -> notification.js

  /**
   * Sets up a service worker for chrome push notifications and sends the data to LC
   */
  // wiz.setUpSafariNotifications= function (subscriptionCallback, apnsWebPushId, apnsServiceUrl) -> notification.js

  /**
   * Sets up a service worker for WebPush(chrome/Firefox) push notifications and sends the data to LC
   */
  // wiz.setUpChromeFirefoxNotifications = function (subscriptionCallback, serviceWorkerPath) -> notification.js

  // wiz.getCleverTapID = function () -> CleverTap.js

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

    // if (domain != referrer_domain) {
    //   var maxLen = 120;
    //   if (referrer_domain != "") {  //referrer exists, sending even when session exists as "x.in.com" and "y.in.com" could be separate accounts, but session created on domain "in.com"
    //     referrer_domain = referrer_domain.length > maxLen ? referrer_domain.substring(0, maxLen) : referrer_domain;
    //     data['referrer'] = referrer_domain;
    //   }


    //   var utm_source = url_params['utm_source'] || url_params['wzrk_source'];
    //   if (typeof utm_source != STRING_CONSTANTS.UNDEFINED) {
    //     utm_source = utm_source.length > maxLen ? utm_source.substring(0, maxLen) : utm_source;
    //     data['us'] = utm_source;                  //utm_source
    //   }

    //   var utm_medium = url_params['utm_medium'] || url_params['wzrk_medium'];
    //   if (typeof utm_medium != STRING_CONSTANTS.UNDEFINED) {
    //     utm_medium = utm_medium.length > maxLen ? utm_medium.substring(0, maxLen) : utm_medium;
    //     data['um'] = utm_medium;                 //utm_medium
    //   }


    //   var utm_campaign = url_params['utm_campaign'] || url_params['wzrk_campaign'];
    //   if (typeof utm_campaign != STRING_CONSTANTS.UNDEFINED) {
    //     utm_campaign = utm_campaign.length > maxLen ? utm_campaign.substring(0, maxLen) : utm_campaign;
    //     data['uc'] = utm_campaign;               //utm_campaign
    //   }

    //   // also independently send wzrk_medium to the backend
    //   if (typeof url_params['wzrk_medium'] != STRING_CONSTANTS.UNDEFINED) {
    //     var wm = url_params['wzrk_medium'];
    //     if (wm.match(/^email$|^social$|^search$/)) {
    //       data['wm'] = wm;                       //wzrk_medium
    //     }

    //   }

    // } -> clevertap.js (init)

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

    // var pingRequest = function () -> CleverTap.js

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
  // wiz.arp = function (jsonMap) -> CleverTap.js

  // wiz.processProfileArray = function (profileArr) -> event.js

  // wiz.processOUL = function (profileArr) -> userLogin.js

  // wiz.processLoginArray = function (loginArr) -> userLogin.js

  wiz.overloadArrayPush = function () {

    // if (typeof wizrocket['onUserLogin'] === "undefined") -> CleverTap.js

    // wizrocket['onUserLogin'].push = -> userLogin.js

    // if (typeof wizrocket['privacy'] === "undefined") -> privacy.js

    // wizrocket['privacy'].push = function () -> privacy.js

    // wizrocket['event'].push = function () -> event.js
    
    // if (typeof wizrocket['notifications'] === STRING_CONSTANTS.UNDEFINED)
    //   wizrocket['notifications'] = [];

    // wizrocket['notifications'].push = function () -> notification.js


    // wizrocket['profile'].push = function () ->profile.js
    //   //since arguments is not an array, convert it into an array
    //   wiz.processProfileArray(Array.prototype.slice.call(arguments));
    //   return 0;
    // };
    // wizrocket['logout'] = wiz.logout;
    // wizrocket['clear'] = wiz.clear;
    // wiz.processLoginArray(wizrocket['onUserLogin']);  // process old stuff from the login array before we overloaded the push method
    // wiz.processPrivacyArray(wizrocket['privacy']);  // process old stuff from the privacy array before we overloaded the push method
    // wiz.processEventArray(wizrocket['event']);      // process old stuff from the event array before we overloaded the push method
    // wiz.processProfileArray(wizrocket['profile']);  // process old stuff from the profile array before we overloaded the push method
    // wiz.setUpWebPush(wizrocket['notifications']); // process old stuff from notifications array before overload

    // clean up the notifications array
    // while (wizrocket['notifications'].length > 0)
    //   wizrocket['notifications'].pop();
  };

  var isOptInRequest = false;

  // var dropRequestDueToOptOut = -> applicationCache.js

  // var addUseIPToRequest = function (pageLoadUrl) -> unused

  // wiz.processPrivacyArray = function (privacyArr) -> privacy.js

  // wiz.saveAndFireRequest = function (url, override, sendOULFlag) ->request.js


  // profile like https://developers.google.com/+/api/latest/people
  // wiz.processGPlusUserObj = function (user) -> profile.js

  // wiz.processFBUserObj = function (user) -> profile.js


  // wiz.getEmail = function (reEncoded) -> CleverTap.js


  // wiz.unSubEmail = function (reEncoded) -> CleverTap.js

  // wiz.unsubEmailGroups = function (reEncoded) -> CleverTap.js

  // wiz.setSubscriptionGroups = function(value) -> CleverTap.js

  // wiz.getSubscriptionGroups = function () -> CleverTap.js

  // wiz.subEmail = function (reEncoded) -> CleverTap.js

  // wiz.handleEmailSubscription = function (subscription, reEncoded) -> util/CleverTap.js

  // wiz.reportError -> logger.js

  //to debug put this in the JS console -> sessionStorage['WZRK_D']="";
  wiz.isDebug = function () {
    return ((typeof sessionStorage != STRING_CONSTANTS.UNDEFINED) && sessionStorage['WZRK_D'] == '');
  };

  // wiz.isPingContinuous = function () -> CleverTap.js


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
  // wiz.s = function (global, session, resume, respNumber, optOutResponse) -> api.js

  // wiz.processBackupEvents = function () -> event.js

  // wiz.removeBackup = function (respNo) -> Storage.js

  // wiz.backUpEvent = function (data, reqNo) -> Storage.js

  // wiz.createBroadCookie = function (name, value, seconds, domain) -> Storage.js
  // wiz.createCookie = function (name, value, seconds, domain)  -> Storage.js
  // wiz.readCookie = function readCookie(name) -> Storage.js
  // wiz.deleteCookie = function (name, domain) -> removeCookie in Storage.js

  // wiz.addToURL = -> url.js

  var MAX_TRIES = 50;

  // var fireRequest = function (url, tries, skipARP, sendOULFlag) -> request.js

  // wiz.fireRequest = function (url, skipARP, sendOULFlag) -> request.js

  // wiz.closeIframe = function (campaignId, divIdIgnored) -> util/CleverTap.js

  // helper variable to handle race condition and check when notifications were called
  var notifApi = {};
  notifApi.notifEnabledFromApi = false;

  /**
   * Function is exposed to customer; called as needed after specific events to set up push notifications
   * @param displayArgs array: [titleText, bodyText, okButtonText, rejectButtonText]
   */
  // wiz.setUpWebPush = function (displayArgs) -> notification.js

  // wiz.setApplicationServerKey = function(applicationServerKey) -> notification.js

  // wiz.handleNotificationRegistration = function (displayArgs) -> notification.js

  // wiz.tr = function (msg) -> notification.js

  //link - actual link, type could be - "ctr" or "view"
  // wiz.getWrappedLink = function (link, targetId, type) -> util/clevertap


  // wiz.getMessageTemplate = function () -> util/clevertap

  // wiz.getMessageHeadTemplate = function () ->util/clevertap

  // wiz.isChargedEventStructureValid = function (chargedObj) -> event.js
  // wiz.isEventStructureFlat = function (eventObj) -> event.js
  // wiz.isProfileValid = function (profileObj) -> event.js
  // wiz.setDate = function (dt) -> datetime.js

  // wiz.setEnum = function (enumVal) -> util/CleverTap.js

  // list of functions that the closure compiler shouldn't rename
  // https://developers.google.com/closure/compiler/docs/api-tutorial3
  // wiz['s'] = wiz.s;
  wiz['is_onloadcalled'] = wiz.is_onloadcalled;
  wiz['setDate'] = wiz.setDate;
  wiz['enableWebPush'] = wiz.enableWebPush; // support for web push notifications
  // wiz['setEnum'] = wiz.setEnum;
  // wiz['tr'] = wiz.tr;
  // wiz['push'] = wiz.push;??
  wiz['closeIframe'] = wiz.closeIframe;
  wiz['getEmail'] = wiz.getEmail;
  wiz['unSubEmail'] = wiz.unSubEmail;
  wiz['unsubEmailGroups'] = wiz.unsubEmailGroups;
  wiz['getSubscriptionGroups'] = wiz.getSubscriptionGroups;
  wiz['setSubscriptionGroups'] = wiz.setSubscriptionGroups;
  // wiz['subEmail'] = wiz.subEmail;
  // wiz['logout'] = wiz.logout;
  // wiz['clear'] = wiz.clear;
  // wizrocket['getCleverTapID'] = wiz.getCleverTapID;


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
