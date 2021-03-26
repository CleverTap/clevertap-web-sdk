import { isString, isObject, sanitize } from '../util/datatypes'
import { EVENT_ERROR } from '../util/messages'
import { EV_COOKIE, SYSTEM_EVENTS, unsupportedKeyCharRegex } from '../util/constants'
import { isChargedEventStructureValid, isEventStructureFlat } from '../util/validator'
import { StorageManager, $ct } from '../util/storage'

export default class EventHandler extends Array {
  #logger
  #oldValues
  #request
  #isPersonalisationActive

  constructor ({ logger, request, isPersonalisationActive }, values) {
    super()
    this.#logger = logger
    this.#oldValues = values
    this.#request = request
    this.#isPersonalisationActive = isPersonalisationActive
  }

  push (...eventsArr) {
    this.#processEventArray(eventsArr)
    return 0
  }

  _processOldValues () {
    if (this.#oldValues) {
      this.#processEventArray(this.#oldValues)
    }
    this.#oldValues = null
  }

  #processEventArray (eventsArr) {
    if (Array.isArray(eventsArr)) {
      while (eventsArr.length > 0) {
        let eventName = eventsArr.shift()
        if (!isString(eventName)) {
          this.#logger.error(EVENT_ERROR)
          continue
        }

        if (eventName.length > 1024) {
          eventName = eventName.substring(0, 1024)
          this.#logger.reportError(510, eventName + '... length exceeded 1024 chars. Trimmed.')
        }

        if (SYSTEM_EVENTS.includes(eventName)) {
          this.#logger.reportError(513, eventName + ' is a restricted system event. It cannot be used as an event name.')
          continue
        }

        const data = {}
        data.type = 'event'
        data.evtName = sanitize(eventName, unsupportedKeyCharRegex)

        if (eventsArr.length !== 0) {
          const eventObj = eventsArr.shift()
          if (!isObject(eventObj)) {
            // put it back if it is not an object
            eventsArr.unshift(eventObj)
          } else {
            // check Charged Event vs. other events.
            if (eventName === 'Charged') {
              if (!isChargedEventStructureValid(eventObj, this.#logger)) {
                this.#logger.reportError(511, 'Charged event structure invalid. Not sent.')
                continue
              }
            } else {
              if (!isEventStructureFlat(eventObj)) {
                this.#logger.reportError(512, eventName + ' event structure invalid. Not sent.')
                continue
              }
            }
            data.evtData = eventObj
          }
        }

        this.#request.processEvent(data)
      }
    }
  }

  getDetails (evtName) {
    if (!this.#isPersonalisationActive()) {
      return
    }
    if (typeof $ct.globalEventsMap === 'undefined') {
      $ct.globalEventsMap = StorageManager.readFromLSorCookie(EV_COOKIE)
    }
    if (typeof $ct.globalEventsMap === 'undefined') {
      return
    }
    const evtObj = $ct.globalEventsMap[evtName]
    const respObj = {}
    if (typeof evtObj !== 'undefined') {
      respObj.firstTime = new Date(evtObj[1] * 1000)
      respObj.lastTime = new Date(evtObj[2] * 1000)
      respObj.count = evtObj[0]
      return respObj
    }
  }
}
