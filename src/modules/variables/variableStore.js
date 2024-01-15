import { VARIABLES } from '../../util/constants'
import { StorageManager, $ct } from '../../util/storage'
class VariableStore {
  #logger
  #account
  #request
  #event

  #variables
  #remoteVariables
  #fetchCallback
  #variablesChangedCallbacks

  constructor ({ logger, request, account, event }) {
    this.#logger = logger
    this.#account = account
    this.#request = request
    this.#event = event

    this.#variables = {}
    this.#remoteVariables = {}
    this.#variablesChangedCallbacks = []

    $ct.variableStore = this
  }

  registerVariable (varInstance) {
    const { name } = varInstance
    this.#variables[name] = varInstance
    console.log('registerVariable', this.#variables)
  }

  getVariable (name) {
    return this.#variables[name]
  }

  hasVarsRequestCompleted () {
    return false
  }

  async syncVariables (onSyncSuccess, onSyncFailure) {
    if (!this.#account.token) {
      throw new Error('Account token is missing')
    }

    // push event
    const payload = {
      type: 'varsPayload',
      vars: {}
    }
    for (var name in this.#variables) {
      payload.vars[name] = {
        defaultValue: this.#variables[name].defaultValue,
        type: this.#variables[name].type
      }
    }
    console.log('syncVariables', payload)

    var meta = {}
    meta = this.#request.addSystemDataToObject(meta, undefined)
    meta.tk = this.#account.token

    meta.type = 'meta'
    const body = JSON.stringify([meta, payload])
    const url = this.#account.dataPostPEURL

    // todo: handle error
    try {
      const r = await this.#request.post(url, body)
      if (onSyncSuccess) onSyncSuccess(r)
      return r
    } catch (e) {
      if (onSyncFailure) onSyncFailure(e)
      throw e
    }
  }

  async fetchVariables (onFetchComplete) {
    this.#event.push('wzrk_fetch', { t: 4 })
    this.#fetchCallback = onFetchComplete
    return null
  }

  mergeVariables (vars) {
    console.log('msg vars is ', vars)
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

  removeVariablesChangedCallback (callback) {
    const index = this.#variablesChangedCallbacks.indexOf(callback)
    if (index !== -1) {
      this.#variablesChangedCallbacks.splice(index, 1)
    }
  }

  #runVariablesChangedCallback () {
    for (var callback of this.#variablesChangedCallbacks) {
      callback()
    }
  }
}

export default VariableStore
