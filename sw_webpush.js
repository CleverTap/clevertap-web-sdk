/* eslint-disable handle-callback-err */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/**
 * Author: Jashan Shewakramani
 * Last updated: 27 June 2016
 * Description: Service worker for handling chrome push notifications
 *
 * NOTES:
 * -> "self" refers to the global ServiceWorker Object
 * -> This script is registered to the browser from a.js
 * -> We're only handling notification clicks; "delivered" is handled by NB
 * -> Use Google's closure compiler on http://closure-compiler.appspot.com/ for minifying
 */

importScripts('https://d2r1yp2w7bby2u.cloudfront.net/js/localforage.min.js')
// var CACHE_VERSION = 3;
// var CURRENT_CACHES = {
//     prefetch: 'prefetch-cache-v' + CACHE_VERSION
// };

if (typeof globalRedirectPath === 'undefined') {
  // set up some variables we need gobally
  var globalNotificationData
  // global redirect path for backward compatibility
  var globalRedirectPath // when showing thr url; we need to log to LC before opening up the deep link
}

self.addEventListener('install', function (event) {
  // force this service worker to become the active service worker; removes any previous implementations or migrations
  self.skipWaiting()
  console.log('CT Service worker installed')
})

self.addEventListener('activate', function (event) {
  console.log('CT Service worker activated')
})

self.addEventListener('push', function (event) {
  console.log('Push event: ', event)
  // get all the notification data
  var notificationData = JSON.parse(event.data.text())
  var title = notificationData.title
  var notificationOptions = notificationData.notificationOptions
  var data = notificationOptions.data
  var key
  if (typeof data !== 'undefined') {
    data.wzrk_id += `_${new Date().getTime()}`
    key = data.wzrk_id
  }
  if (typeof key === 'undefined') {
    key = title
  }
  localforage.setItem(key, event.data.text()).then(function (value) {
    // console.log("persisted");
  }).catch(function (err) {
    // This code runs if there were any errors
    console.log('Error in persisting')
  })

  // two global variables for backward compatibility
  globalRedirectPath = notificationData.redirectPath
  globalNotificationData = notificationData

  var raiseNotificationViewedPath = notificationData.raiseNotificationViewedPath
  if (typeof raiseNotificationViewedPath !== 'undefined') {
    // raise notification viewed event
    fetch(raiseNotificationViewedPath, { mode: 'no-cors' }) // ignore the response
  }
  event.waitUntil(self.registration.showNotification(title, notificationOptions))
})

function onClick (event, redirectPath, notificationData) {
  var finalDeepLink = redirectPath
  var silentRequest = true // are opening up a new window or sending a quiet get request from here?
  if (event.action === 'action1') {
    // button 1 was clicked
    if (typeof notificationData.notificationOptions.actions[0].deepLink !== 'undefined') {
      finalDeepLink += '&r=' + encodeURIComponent(notificationData.notificationOptions.actions[0].deepLink)
      silentRequest = false
    }
    finalDeepLink += '&b=' + encodeURIComponent('button1')
  } else if (event.action === 'action2') {
    // the second button was clicked
    if (typeof notificationData.notificationOptions.actions[1].deepLink !== 'undefined') {
      finalDeepLink += '&r=' + encodeURIComponent(notificationData.notificationOptions.actions[1].deepLink)
      silentRequest = false
    }
    finalDeepLink += '&b=' + encodeURIComponent('button2')
  } else {
    // general click
    if (typeof notificationData.deepLink !== 'undefined') {
      finalDeepLink += '&r=' + encodeURIComponent(notificationData.deepLink)
      silentRequest = false
    }

    finalDeepLink += '&b=' + encodeURIComponent('button0')
  }

  if (silentRequest) {
    fireSilentRequest(finalDeepLink)
  } else {
    clients.openWindow(finalDeepLink)
  }
  event.notification.close()
}

self.addEventListener('notificationclick', function (event) {
  var notification = event.notification
  var data = notification.data
  var key
  if (typeof data !== 'undefined' && data !== null) {
    key = data.wzrk_id
  }
  if (typeof key === 'undefined') {
    key = notification.title
  }
  var promise = localforage.getItem(key).then(function (value) {
    var notificationData = JSON.parse(value)
    var redirectPath = notificationData.redirectPath
    onClick(event, redirectPath, notificationData)
  }).catch(function (err) {
    // This code runs if there were any errors
    // onClick below for backward compatibility
    onClick(event, globalRedirectPath, globalNotificationData)
    console.log(err)
  })
  event.waitUntil(promise)
})

var fireSilentRequest = function (url) {
  // add the silent parameter to the deeplink so that LC knows not to raise an error
  url += '&s=true'

  // use the fetch API to make a silent request (we don't care about the response here)
  fetch(url, { mode: 'no-cors' })
}
