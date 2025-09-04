import { VARIABLES, WZRK_FETCH } from '../../util/constants'
import { StorageManager, $ct } from '../../util/storage'
import { flattenObjectToDotNotation } from '../../util/helpers'

class VariableStore {
  #logger
  #account
  #request
  #event

  #variables
  #remoteVariables
  #fetchCallback
  #variablesChangedCallbacks
  #oneTimeVariablesChangedCallbacks
  #hasVarsRequestCompleted = false

  constructor ({ logger, request, account, event }) {
    this.#logger = logger
    this.#account = account
    this.#request = request
    this.#event = event

    this.#variables = {}
    this.#remoteVariables = {}
    this.#variablesChangedCallbacks = []
    this.#oneTimeVariablesChangedCallbacks = []

    $ct.variableStore = this
  }

  /**
   * Registers a variable instance in the store.
   * @param {Object} varInstance - The variable instance to be registered.
   */
  registerVariable (varInstance) {
    const { name } = varInstance
    this.#variables[name] = varInstance
    this.#logger.debug('registerVariable', this.#variables)
  }

  /**
   * Retrieves a variable by its name.
   * @param {string} name - The name of the variable to retrieve.
   * @returns {Object} - The variable instance.
   */
  getVariable (name) {
    return this.#variables[name]
  }

  hasVarsRequestCompleted () {
    return this.#hasVarsRequestCompleted
  }

  /**
   * Synchronizes variables with the server.
   * @param {Function} onSyncSuccess - Callback function on successful synchronization.
   * @param {Function} onSyncFailure - Callback function on synchronization failure.
   * @throws Will throw an error if the account token is missing.
   * @returns {Promise} - The result of the synchronization request.
   */
  syncVariables (onSyncSuccess, onSyncFailure) {
    if (!this.#account.token) {
      const m = 'Account token is missing.'
      this.#logger.error(m)
      return Promise.reject(new Error(m))
    }

    const payload = {
      type: 'varsPayload',
      vars: {}
    }

    for (const name in this.#variables) {
      if (typeof this.#variables[name].defaultValue === 'object') {
        const flattenedPayload = flattenObjectToDotNotation({
          [this.#variables[name]?.name]: this.#variables[name].defaultValue
        })
        for (const key in flattenedPayload) {
          payload.vars[key] = {
            defaultValue: flattenedPayload[key].defaultValue,
            type: flattenedPayload[key].type
          }
        }
      } else if (this.#variables[name].type === 'file') {
        payload.vars[name] = {
          type: this.#variables[name].type
        }
      } else {
        payload.vars[name] = {
          defaultValue: this.#variables[name].defaultValue,
          type: this.#variables[name].type
        }
      }
    }

    // Check if payload.vars is empty
    if (Object.keys(payload.vars).length === 0) {
      const m = 'No variables are defined.'
      this.#logger.error(m)
      return Promise.reject(new Error(m))
    }

    let meta = {}
    meta = this.#request.addSystemDataToObject(meta, undefined)
    meta.tk = this.#account.token

    meta.type = 'meta'
    const body = JSON.stringify([meta, payload])
    const url = this.#account.dataPostPEURL

    return this.#request.post(url, body)
      .then((r) => {
        if (onSyncSuccess && typeof onSyncSuccess === 'function') {
          onSyncSuccess(r)
        }
        return r
      })
      .catch((e) => {
        if (onSyncFailure && typeof onSyncFailure === 'function') {
          onSyncFailure(e)
        }
        if (e.status === 400) {
          this.#logger.error('Invalid sync payload or clear the existing draft')
        } else if (e.status === 401) {
          this.#logger.error('This is not a test profile')
        } else {
          this.#logger.error('Sync variable failed')
        }
        throw e
      })
  }

  /**
   * Fetches variables from the server.
   * @param {Function} onFetchCallback - Callback function on fetch completion.
   */
  fetchVariables (onFetchCallback) {
    this.#event.push(WZRK_FETCH, { t: 4 })
    if (onFetchCallback && typeof onFetchCallback === 'function') {
      this.#fetchCallback = onFetchCallback
    }
  }

  mergeVariables (vars) {
    this.#logger.debug('msg vars is ', vars)
    this.#hasVarsRequestCompleted = true

    StorageManager.saveToLSorCookie(VARIABLES, vars)
    this.#remoteVariables = vars

    for (const name in this.#variables) {
      if (vars.hasOwnProperty(name)) {
        this.#variables[name].update(vars[name])
      }
    }

    if (this.#fetchCallback) {
      this.#fetchCallback()
    }

    this.#runVariablesChangedCallback()
  }

  addVariablesChangedCallback (callback) {
    if (callback && typeof callback === 'function') {
      this.#variablesChangedCallbacks.push(callback)

      if (this.hasVarsRequestCompleted()) {
        callback()
      }
    } else {
      this.#logger.error('callback is not a function')
    }
  }

  addOneTimeVariablesChangedCallback (callback) {
    if (callback && typeof callback === 'function') {
      if (this.hasVarsRequestCompleted()) {
        callback()
      } else {
        this.#oneTimeVariablesChangedCallbacks.push(callback)
      }
    }
  }

  removeVariablesChangedCallback (callback) {
    const index = this.#variablesChangedCallbacks.indexOf(callback)
    if (index !== -1) {
      this.#variablesChangedCallbacks.splice(index, 1)
    }
  }

  removeOneTimeVariablesChangedCallback (callback) {
    const index = this.#oneTimeVariablesChangedCallbacks.indexOf(callback)
    if (index !== -1) {
      this.#oneTimeVariablesChangedCallbacks.splice(index, 1)
    }
  }

  #runVariablesChangedCallback () {
    for (var callback of this.#variablesChangedCallbacks) {
      callback()
    }
    for (var callBack of this.#oneTimeVariablesChangedCallbacks) {
      callBack()
    }
    this.#oneTimeVariablesChangedCallbacks.length = 0
  }
}

export default VariableStore
