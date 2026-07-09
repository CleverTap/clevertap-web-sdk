import { isString, isObject, sanitize } from '../util/datatypes'
import { EVENT_ERROR } from '../util/messages'
import { ACCOUNT_ID, EV_COOKIE, SYSTEM_EVENTS, unsupportedKeyCharRegex } from '../util/constants'
import { isChargedEventStructureValid, isObjStructureValid } from '../util/validator'

export default class EventHandler extends Array {
  #logger
  #oldValues
  #request
  #isPersonalisationActive
  #instanceManager

  constructor ({ logger, request, isPersonalisationActive, instanceManager }, values) {
    super()
    this.#logger = logger
    this.#oldValues = values
    this.#request = request
    this.#isPersonalisationActive = isPersonalisationActive
    this.#instanceManager = instanceManager
  }

  push (...eventsArr) {
    if (this.#instanceManager.storage.readFromLSorCookie(ACCOUNT_ID)) {
      this.#processEventArray(eventsArr)
      return 0
    } else {
      this.#logger.error('Account ID is not set')
    }
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
        var eventName = eventsArr.shift()
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
              data.evtData = eventObj
            } else {
              const validationResult = isObjStructureValid(eventObj, this.#logger, 3)
              // Validation errors are already logged via logger.reportError in validator
              // Use cleaned object if provided (even if validation failed)
              // This removes null/empty values that were logged
              if (validationResult.processedObj) {
                data.evtData = validationResult.processedObj
              } else {
                data.evtData = eventObj
              }
            }
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
    if (typeof this.#instanceManager.state.globalEventsMap === 'undefined') {
      this.#instanceManager.state.globalEventsMap = this.#instanceManager.storage.readFromLSorCookie(EV_COOKIE)
    }
    if (typeof this.#instanceManager.state.globalEventsMap === 'undefined') {
      return
    }
    const evtObj = this.#instanceManager.state.globalEventsMap[evtName]
    const respObj = {}
    if (typeof evtObj !== 'undefined') {
      respObj.firstTime = new Date(evtObj[1] * 1000)
      respObj.lastTime = new Date(evtObj[2] * 1000)
      respObj.count = evtObj[0]
      return respObj
    }
  }
}
