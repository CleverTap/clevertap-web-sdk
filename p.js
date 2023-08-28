
function __wizrocket() {

    var targetURL = location.protocol + '//wzrk.co/w?t=1';
    //var targetURL = location.protocol + '//wzrt.co:22999/w?t=1'; // for debug on webfaction
    var i = this;
    var doc = document;
    var win = window;

    // to be used for checking whether the script loaded fine and the onready event fired
    var onloadcalled = 0;  // 1 = fired

    var EVT_SCROLL = "sc", EVT_KEYPRESS = "kp", EVT_CLICK = "cl";
    var EVT_PAGE = "pg", EVT_CUSTOM = "kv", EVT_SITE = "st";
    var EVT = "evt";
    var E_ADD = 0, E_DEL = 1;

    // pcookie stores current page url
    var gcookie, scookie, pcookie;

    var GCOOKIE_NAME = "WZRK_G", SCOOKIE_NAME = "WZRK_S", PCOOKIE_NAME = "WZRK_P";
    var keyPressCount = 0;
    var clickCount = 0;


    i.event = function (what, evt, hldr) {
        if (what == E_DEL) {
            if (win.removeEventListener) {
                win.removeEventListener(evt, hldr, false);
            } else if (win.detachEvent) {
                win.detachEvent('on' + evt, hldr);
            }
        } else {
            if (win.addEventListener) {
                win.addEventListener(evt, hldr, false);
            } else if (win.attachEvent) {
                win.attachEvent('on' + evt, hldr);
            }
        }

    };

    i.scroll = function () {

        var scrollTop=function() {
            if(typeof pageYOffset!= 'undefined'){
                //most browsers
                return pageYOffset;
            }
            else{
                var B= document.body; //IE 'quirks'
                var D= document.documentElement; //IE with doctype
                D= (D.clientHeight)? D: B;
                return D.scrollTop;
            }
        }

        var sT = scrollTop();
        var sH = doc.documentElement.scrollHeight;
        var aH = screen.availHeight; // Return the total height of your screen:



        var scrollPercent = sT/(sH-aH)*100;

        if (scrollPercent > 60) {
            i.event(E_DEL, 'scroll', i.scroll);
            var url = targetURL;
            i.fireRequest(i.addToURL(url, EVT, EVT_SCROLL));
        }
    };



    i.click = function () {

      if(clickCount < 3) {       // send only up to 3 click events
        clickCount++;

        setTimeout(function(){
          var url = targetURL;
          i.fireRequest(i.addToURL(url, EVT, EVT_CLICK));
        }, 100); // wait 100ms before firing. Don't want to capture clicks leading to new pages.


      } else {
        i.event(E_DEL, 'mouseup', i.click);
      }

    };

    i.keypress = function () {

        if(keyPressCount < 3) {  // send one only after 4 key presses
          keyPressCount++;
        } else {
          i.event(E_DEL, 'keyup', i.keypress);
          var url = targetURL;
          i.fireRequest(i.addToURL(url, EVT, EVT_KEYPRESS));
        }
    };


    i.is_onloadcalled = function() {
        return (onloadcalled === 1);
    };

    i.pageloaded = function () {
        onloadcalled=1;

        i.g(); // load cookies on pageload
        var currLocation = encodeURIComponent(location.href);
        var firePageLoadRequest = true;

        if(currLocation == pcookie) {  // don't fire if cookie has curr url as value
          firePageLoadRequest = false;
        }

        var FIFTEEN_MINS_IN_SECS = 60 * 15 //seconds in minute * number of mins
        i.createCookie(PCOOKIE_NAME, currLocation, FIFTEEN_MINS_IN_SECS); // self-destruct after 15 mins


        if(firePageLoadRequest)  {

          var deviceWidth = screen.width;
          var deviceHeight = screen.height;
          var pageLoadUrl = targetURL;

          pageLoadUrl = i.addToURL(pageLoadUrl, "dw", deviceWidth);
          pageLoadUrl = i.addToURL(pageLoadUrl, "dh", deviceHeight);
          pageLoadUrl = i.addToURL(pageLoadUrl, EVT, EVT_PAGE);

          if (doc.referrer) {
              var encodedReferrer = encodeURIComponent(doc.referrer);
              pageLoadUrl = i.addToURL(pageLoadUrl, "ref", encodedReferrer);
          }


          var catArray = (typeof _wrc != 'undefined')? _wrc: []; // _wrc is a cat/sub-cat array that is in the parent page

          if(catArray && catArray.length >= 1)  {

              var catKVStr = i.encodeKVPairs(catArray);
              var encodedCatKVStr = encodeURIComponent(catKVStr);  // make it fit to pass in the URL
              pageLoadUrl = i.addToURL(pageLoadUrl, "kv", encodedCatKVStr);
          }

          i.fireRequest(pageLoadUrl);

        } // if(firePageLoadRequest)

        if(firePageLoadRequest) {
          var body = document.body;
          var docElement = document.documentElement;
          //get document height per - http://stackoverflow.com/questions/1145850/get-height-of-entire-document-with-javascript
          var docHeight = Math.max(body.scrollHeight, body.offsetHeight, docElement.clientHeight, docElement.scrollHeight, docElement.offsetHeight);
          var deviceHeight = screen.height;

          // if screen height is 60% of document height then fire scroll event
          // basically if 60% of doc is already visible then user won't need to scroll, hence we'll fire scroll event

          var heightPercent = (deviceHeight/docHeight)*100;

          if(heightPercent >=60) {
            setTimeout(function(){
              var url = targetURL;
              i.fireRequest(i.addToURL(url, EVT, EVT_SCROLL));
            }, 2000); // wait 2 seconds before firing. This is to eliminate noise.

          } else {
            i.event(E_ADD, 'scroll', i.scroll); // if long doc, then add scroll listener
          }
        }

        i.event(E_ADD, 'keyup', i.keypress);
        i.event(E_ADD, 'mouseup', i.click);
    };

    i.sendSiteEvent = function(siteEventName) {
      if(typeof siteEventName != 'undefined') {
        var siteEventURL = i.addToURL(targetURL, EVT, EVT_SITE);
        siteEventName = siteEventName.replace(/\W/g, '-'); // replace all non-alphanumeric chars with dashes
        siteEventURL = i.addToURL(siteEventURL, "st", siteEventName);
        i.fireRequest(siteEventURL);
      }



    }

    i.sendKV = function(kvArr) {  // accept array from embedded script on site
      i.customKV(kvArr);
    }

    // process custom KV stuff
    i.customKV = function(customArray) {

        if(typeof customArray != 'undefined') {

          if(customArray.length >= 1)  {

              var customURL = i.addToURL(targetURL, EVT, EVT_CUSTOM);
              var customKVStr = i.encodeKVPairs(customArray);
              var encodedCustomKVStr = encodeURIComponent(customKVStr);  // make it fit to pass in the URL
              customURL = i.addToURL(customURL, "kv", encodedCustomKVStr);

              i.fireRequest(customURL);
          }
        }
    };

    // encode the KV array. handles 'undefined' array scenario
    // returns the encoded string.
    i.encodeKVPairs = function (kvArray) {
        var kvString = "";

        if(typeof kvArray != 'undefined') {

            var EQUAL = "#=#";
            var DELIM = "#&#";
            var COMMA = "#,#";

            for (var idx = 0; idx < kvArray.length; idx++) {
                var eachRow = kvArray[idx];
                var rowValueStr = "";

                if (eachRow && eachRow.length >= 1) {
                    var rowKey = eachRow[0];
                    rowKey = rowKey.trim();
                    rowKey = rowKey.replace(/\W/g, '-'); // replace all non-alphanumeric chars with dashes
                    rowKey = rowKey.toLowerCase();

                    if(eachRow.length == 1) {     // only one item in array

                      kvString = kvString + rowKey + DELIM;
                    } else {
                      eachRow.shift(); // remove the 1st element which is the key

                      for (var j = 0; j < eachRow.length; j++) {
                          var columnVal = eachRow[j];

                          if (columnVal) {
                              columnVal = columnVal.trim();

                              if(!(rowKey == "name" || rowKey == "uid" || rowKey == "email"))  {  // do not touch name, email or uid
                                columnVal =  columnVal.replace(/\W/g, '-'); // replace all non-alphanumeric chars with dashes
                                columnVal = columnVal.toLowerCase();
                              }

                              rowValueStr = rowValueStr + columnVal;

                              if (j < eachRow.length - 1) {
                                  rowValueStr = rowValueStr + COMMA;
                              }
                          }

                      } // for

                      if (rowValueStr.trim() != "") {    // don't add empty values
                          kvString = kvString + rowKey + EQUAL + rowValueStr;

                          if (idx < kvArray.length - 1) {
                              kvString = kvString + DELIM; // no delimiter for the last one
                          }
                      }

                    }
                }
            } // for idx < array.length

        }

        return kvString;

    };


    i.g = function () {
        gcookie  = i.readCookie(GCOOKIE_NAME);
        scookie  = i.readCookie(SCOOKIE_NAME);
        pcookie  = i.readCookie(PCOOKIE_NAME);
    };

    i.s = function (n, v) {
        var domain = window.location.hostname;
        var cookieExpiry = "";

        if (n == GCOOKIE_NAME) {
            var TEN_YEARS_IN_SECS = 86400 * 365 * 10; //seconds in an days * days in an year * number of years
            cookieExpiry = TEN_YEARS_IN_SECS;
            gcookie = v;

        } else if (n == SCOOKIE_NAME) {
            var TWENTY_MINS_IN_SECS = 60 * 20; //seconds in minute * number of mins
            cookieExpiry = TWENTY_MINS_IN_SECS;
            scookie = v;
        }

        i.createBroadCookie(n, v, cookieExpiry, domain);

    };


    // sets cookie on the base domain. e.g. if domain is baz.foo.bar.com, set cookie on ".bar.com"
    i.createBroadCookie = function (name, value, seconds, domain) {


        //To update an existing "broad domain" cookie, we need to know what domain it was actually set on.
        //since a retrieved cookie never tells which domain it was set on, we need to set another test cookie
        //to find out which "broadest" domain the cookie was set on. Then delete the test cookie, and use that domain
        //for updating the actual cookie.


        if(domain) {
            var domainParts = domain.split(".");
            var broadDomain = "";
            for(var idx = domainParts.length-1; idx >= 0 ; idx--) {
                broadDomain = "." + domainParts[idx] + broadDomain;


                // only needed if the cookie already exists and needs to be updated. See note above.
                if(i.readCookie(name)) {

                    // no guarantee that browser will delete cookie, hence create short lived cookies with random name
                    var testCookieName = "test_" + name + Math.floor((Math.random()*100)+1);
                    i.deleteCookie(testCookieName, broadDomain); // safety purpose
                    i.createCookie(testCookieName, value, 10, broadDomain); // self-destruct after 10 seconds
                    if(!i.readCookie(testCookieName)) {  // if test cookie not set, then the actual cookie wouldn't have been set on this domain either.
                        continue;
                    } else {                                // else if cookie set, then delete the test and the original cookie
                        i.deleteCookie(testCookieName, broadDomain);
                        i.deleteCookie(name, broadDomain);
                    }
                }

                i.deleteCookie(name, broadDomain); //safety purpose
                i.createCookie(name, value, seconds, broadDomain);
                var tempCookie = i.readCookie(name);
                if(tempCookie == value) {
                    //console.log("Was able to retrieve cookie on: " + broadDomain + "->" + name + "=" + tempCookie);
                    break;
                }
            }
        } else {
            i.createCookie(name, value, seconds, domain);
        }
    };

    //read  - cookie get-set: http://www.quirksmode.org/js/cookies.html

    i.createCookie = function (name, value, seconds, domain) {
        var expires    = "";
        var domainStr  = "";
        if (seconds) {
            var date = new Date();
            date.setTime(date.getTime()+(seconds * 1000));

            expires = "; expires=" + date.toGMTString();
        }

        if(domain) {
            domainStr = "; domain=" + domain;
        }

        var cookieStr = name + "=" + value + expires + domainStr + "; path=/";
        document.cookie = cookieStr;
    };

    i.readCookie = function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var idx = 0; idx < ca.length; idx++) {
            var c = ca[idx];
            while (c.charAt(0)==' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) == 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    };

    i.deleteCookie = function (name, domain) {
        var cookieStr =  name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        if(domain) {
            cookieStr = cookieStr + " domain=" + domain + ";";
        }

        document.cookie = cookieStr;
    };


    i.addToURL = function(url, k, v) {
        return url + "&" + k + "=" + v;
    };


    i.fireRequest = function (url) {
        if (gcookie != null) {
            url = i.addToURL(url, "g", gcookie);
        }
        if (scookie != null) {
            url = i.addToURL(url, "s", scookie);
        }

        url = i.addToURL(url, "rnd", new Date().getTime()); // add epoch to beat caching of the URL

        var s = doc.createElement('script');
        s.setAttribute("type", "text/javascript");
        s.setAttribute("src", url);
        s.async = true;
        doc.getElementsByTagName("head")[0].appendChild(s);
    };


    // list of functions that the closure compiler shouldn't rename
    // https://developers.google.com/closure/compiler/docs/api-tutorial3
    i['s'] = i.s;
    i['is_onloadcalled'] = i.is_onloadcalled;
    i['sendKV'] = i.sendKV;
    i['sendSiteEvent'] = i.sendSiteEvent;

} // function __wizrocket

$WZRK_WR = new __wizrocket();

// inspired via - https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js && http://javascript.nwbox.com/ContentLoaded/
// Author: Diego Perini (diego.perini@gmail.com)

(function (fn) {

    var done = false, top = true,
    win = window;
    doc = win.document, root = doc.documentElement,

    add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
    rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
    pre = doc.addEventListener ? '' : 'on',

    init = function(e) {
        if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
        (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
        if (!done && (done = true)) fn.call(win, e.type || e);
    },

    poll = function() {
        try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
        init('poll');
    };

    if (doc.readyState == 'complete') fn.call(win, 'lazy');
    else {
        if (doc.createEventObject && root.doScroll) {
            try { top = !win.frameElement; } catch(e) { }
            if (top) poll();
        }
        doc[add](pre + 'DOMContentLoaded', init, false);
        doc[add](pre + 'readystatechange', init, false);
        win[add](pre + 'load', init, false);
    }


})($WZRK_WR.pageloaded);

/**
 * @preserve Copyright WizRocket Technologies Pvt. Ltd. (ver.@timestamp@)
 *                _                    _        _
 *      __      _(_)_____ __ ___   ___| | _____| |_
 *      \ \ /\ / / |_  / '__/ _ \ / __| |/ / _ \ __|
 *       \ V  V /| |/ /| | | (_) | (__|   <  __/ |_
 *        \_/\_/ |_/___|_|  \___/ \___|_|\_\___|\__|
 */

/* Tested with the following browsers
 Android -
    maxthon works
    firefox works
    opera mini - kv, pg work. scroll, click, kp dont.
    ucbrowser - kv, pg work. scroll, click, kp dont.
    ucbrowser-mini - works
    dolphin - works
    chrome - works
    stock browser - works

 Windows -
    IE10 works
    FF works
    Chrome works

 MacOS -
    FF works
    Chrome works
    Safari works
    Opera works

 iOS-
    Chrome works
    FF works
 */
