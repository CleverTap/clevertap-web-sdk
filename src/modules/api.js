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

export default class CleverTapAPI {
  #logger

  constructor ({ logger }) {
    this.#logger = logger
  }
}
