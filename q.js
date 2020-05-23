//todo - the fetchExperiments call might happen multiple times
//todo - check how many times fetchExperiments is called for brand new user who's not been marked for exp yet.
function __wizrocketx() {
    var targetURL = location.protocol + '//foo.com:8080/e?t=1';

    var i = this;
    var doc = document;
    var win = window;
    var syncTimerId, asyncTimerId;
    var syncFallbackTimerId, asyncFallbackTimerId;

    var deliveredSyncResults=0;
    var deliveredAsyncResults=0;

    var today     = new Date();
    var todayYmd  = (today.getYear() + 1900) + "" + (today.getMonth() + 1) + "" + (today.getDate());


    var XCOOKIE_NAME = "WZRK_X";
    var bGotResults;
    var emptyArr = [];


    var gcookie, xcookie;

    var GCOOKIE_NAME = "WZRK_G";

    i.init = function() {
      console.log("wzrk_x init called");

      //todo : if cookie missing then don't even send teh request
      gcookie  = i.readCookie(GCOOKIE_NAME);
    };


    i.enableTargeting = function() {
      // sync
      syncTimerId = setTimeout(function(){
        syncTimerId=undefined;
        // call didn't come through, let's try the fallback option
        console.log("sync timer timeout");

        xcookie = i.readCookie(XCOOKIE_NAME);

        if(xcookie != null && xcookie.length === 6) {  // if xcookie exists

          syncFallbackTimerId = setTimeout(function() {
            //unable to fetch results from the fallback url during the stipulated time
            syncFallbackTimerId=undefined;
            i.deliverSyncResults(emptyArr);

          }, 500);

         i.fetchExperimentData(i.addToURL(targetURL, "dt", xcookie)); // get the data on the date of the cookie - fallback option

        } else {  // no xcookie
         i.deliverSyncResults(emptyArr);
        }
        i.fetchExperimentData(i.addToURL(targetURL, "dt", todayYmd)); // fallback URL call so that data gets cached and cookie gets set for next time
      }, 1000);


      // async
      asyncTimerId = setTimeout(function(){
        asyncTimerId=undefined;
        // call didn't come through, let's try the fallback option
        console.log("async timer timeout");

        xcookie = i.readCookie(XCOOKIE_NAME);

        if(xcookie != null && xcookie.length === 6) {  // if xcookie exists

          asyncFallbackTimerId = setTimeout(function() {
            //unable to fetch results from the fallback url during the stipulated time
            asyncFallbackTimerId=undefined;
            i.deliverAsyncResults(emptyArr);

          }, 500);

         i.fetchExperimentData(i.addToURL(targetURL, "dt", xcookie)); // get the data on the date of the cookie - fallback option

        } else {  // no xcookie
         i.deliverAsyncResults(emptyArr);
        }
        i.fetchExperimentData(i.addToURL(targetURL, "dt", todayYmd)); // fallback URL call so that data gets cached and cookie gets set for next time
      }, 10000);


      i.fetchExperimentData(targetURL);

    };


    //ensure the wzrk_sync_result method are called one time only for every page reload
    i.deliverSyncResults = function (syncResults) {
      if(deliveredSyncResults == 0 && typeof(wzrk_sync_results) == typeof(Function)) {
        deliveredSyncResults=1;
        console.log("about to deliver sync results");
        win.wzrk_sync_results(syncResults);
      }
    };

    //ensure the wzrk_async_result method are called one time only for every page reload
    i.deliverAsyncResults = function (asyncResults) {
      if(deliveredAsyncResults == 0 && typeof(wzrk_async_results) == typeof(Function)) {
        deliveredAsyncResults=1;
        console.log("about to deliver async results");
        win.wzrk_async_results(asyncResults);
      }
    };


    i.fetchExperimentData = function(url) {
      console.log("firing request to fetch experiments");
      i.fireRequest(url);
    };


    // e.g. {1: "1382812200000|1382898599000|0000-2359-127 * *", 4: "1382812200000|1382898599000|0000-2359-127 * *"}
    i.results = function(resultObj) {

      console.log("got main results: " + resultObj);

      var validExps = i.getValidExperiments(resultObj);

      if(typeof syncTimerId != 'undefined') {
        clearTimeout(syncTimerId);
        console.log("got results before timeout, canceled timer: sync");
        i.deliverSyncResults(validExps);
      }

      if(typeof asyncTimerId != 'undefined') {
        clearTimeout(asyncTimerId);
        console.log("got results before timeout, canceled timer: async");
        i.deliverAsyncResults(validExps);
      }

    }; // i.results

    // e.g. {0:20131104, 1: "1382812200000|1382898599000|0000-2359-127 * *", 4: "1382812200000|1382898599000|0000-2359-127 * *"}
    i.fbResults = function (resultObj) {

      if(typeof resultObj[0] != 'undefined') {
        var dateStr = resultObj[0]; // 0th element contains the request as sent in the request
        var THIRTY_DAYS_IN_SECS = 60 * 60 * 24 * 30;
        i.createCookie(XCOOKIE_NAME, dateStr,THIRTY_DAYS_IN_SECS); //save a cookie with the last known fetch date of fallback results
      }

      var validExps = i.getValidExperiments(resultObj);

      console.log("got the fallback results: " + resultObj);

      if(typeof syncFallbackTimerId != 'undefined') {
        clearTimeout(syncFallbackTimerId);
        console.log("got results before fallback sync timer timeout, canceling it now");
        i.deliverSyncResults(validExps);
      }

      if(typeof asyncTimerId != 'undefined') {
        clearTimeout(asyncTimerId);
        console.log("got results before async timer timeout, canceling it now");
        i.deliverAsyncResults(validExps);
      }

    }; // i.results



    i.addToURL = function (url, k, v) {
        return url + "&" + k + "=" + v;
    };

    i.fireRequest = function (url) {
        if (gcookie != null) {
            url = i.addToURL(url, "g", gcookie);
        }

        //url = i.addToURL(url, "rnd", new Date().getTime()); // add epoch to beat caching of the URL

        var s = doc.createElement('script');
        s.setAttribute("type", "text/javascript");
        s.setAttribute("src", url);
        s.async = true;
        doc.getElementsByTagName("head")[0].appendChild(s);
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

    i.readCookie = function (name) {
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

  i.getValidExperiments = function (expObject) {
    var validExpArray = [];
    var date = new Date();
    for(k in expObject) {
      if(k > 0) {  // don't process 0 key, since it's used to send date
        var v = expObject[k];
        if(i.isExpActive(v, date)) {
          validExpArray.push(k);
        }
      } // k > 0
    }
    console.log("Valid experiments: " + validExpArray);
    return validExpArray;
  };


  // to test use isValid("1282597083|1584597083|0000-0000-127 * *", new Date(1382553000000));
  i.isExpActive = function (cronExp, cDate) {
    var valid = 0;

    var cTime 		= cDate.getTime();	    // epoch
    var cHour 		= cDate.getHours();			// hour (0-23)
    var cMin  		= cDate.getMinutes();		// min (0-59)
    var cHourMin 	= cHour + "" + cMin; 		// 1430
    var cMoy  		= cDate.getMonth();			// month of year (0-11)
    var cDom  		= cDate.getDate(); 			// day of month (1-31)
    var cDay 	 		= cDate.getDay();				// day of the week (0-6) Sunday=0
    var cDayBit 	= Math.pow(2,cDay);

    var expParts 			= cronExp.split("|");
    var expStartEpoch = expParts[0];
    var expEndEpoch		= expParts[1];

    if((cTime >=expStartEpoch) && (cTime < expEndEpoch)) { // within exp time range

      var timeExpArr = expParts[2].split(" "); // e.g. 900-1030-65,1315-1420-65,1610-2030-65 * *
      var dom	= timeExpArr[1];
      var	moy = timeExpArr[2];

      if(dom == cDom || dom == '*') { 	  // specific day of month, or valid for ALL days
        if(moy == cMoy || moy == '*') {		// specific month of year or valid for ALL months
          var dayTimeExpArr = timeExpArr[0].split(","); // e.g. 900-1030-65,1315-1420-65,1610-2030-65

          for(var i=0;i<dayTimeExpArr.length;i++) {
            var timeArr 			= dayTimeExpArr[i].split("-");
            var startTimeSlot = timeArr[0];
            var endTimeSlot 	= timeArr[1];
            var dayBit 				= timeArr[2];

            if((cHourMin >= startTimeSlot || startTimeSlot == 0) && (cHourMin <= endTimeSlot) && (dayBit & cDayBit)) {
              valid=1;
              break;
            } // if
          }
        } // if moy
      }	// if dom

    }
    return valid;
  };

  i.arrayContains = function (arr, key) {
    // see this for best way to check for array -> http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
    if(Object.prototype.toString.call(arr) === '[object Array]') {
      var i = arr.length;
      while (i--) {
         if (arr[i] === key) {
             return true;
         }
      }
    }
    return false;
  };

    // list of functions that the closure compiler shouldn't rename
    // https://developers.google.com/closure/compiler/docs/api-tutorial3
    i['fbResults'] = i.fbResults;
    i['results'] = i.results;
    i['arrayContains'] = i.arrayContains;
    i['enableTargeting'] = i.enableTargeting;


} // function wizrocketx

$WZRK_X = new __wizrocketx();
$WZRK_X.init();

/**
 * @preserve Copyright WizRocket Technologies Pvt. Ltd. (ver.@timestamp@)
 *                _                    _        _    __  __
 *      __      _(_)_____ __ ___   ___| | _____| |_  \ \/ /
 *      \ \ /\ / / |_  / '__/ _ \ / __| |/ / _ \ __|  \  /
 *       \ V  V /| |/ /| | | (_) | (__|   <  __/ |_   /  \
 *        \_/\_/ |_/___|_|  \___/ \___|_|\_\___|\__| /_/\_\
 */
