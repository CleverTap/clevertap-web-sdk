import { VARIABLES } from '../../util/constants'
import { StorageManager, $ct } from '../../util/storage'
class VariableStore {
  #logger
  #request
  #account
  event

  constructor ({ logger, request, account, event }) {
    this.variables = {}
    this.remoteVariables = {}
    $ct.variableStore = this
    this.#logger = logger
    this.#account = account
    this.#request = request
    this.event = event
    this.valuesFromClient = {}
  }

  registerVariable (varInstance) {
    const { name } = varInstance
    this.variables[name] = varInstance
    console.log('registerVariable', this.variables)
  }

  getVariable (name) {
    return this.variables[name]
  }

  hasVarsRequestCompleted () {
    return true
  }

  async syncVariables (onSyncSuccess, onSyncFailure) {
    // push event
    const payload = {
      type: 'varsPayload',
      vars: {}
    }
    for (var name in this.variables) {
      payload.vars[name] = {
        defaultValue: this.variables[name].defaultValue,
        type: this.variables[name].type
      }
    }
    console.log('syncVariables', payload)

    var meta = {}
    meta = this.#request.addSystemDataToObject(meta, undefined)
    // todo remove handrcoded token value
    meta.tk = '012-b64'
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

  async fetchVariables (onFetchComplete, onFetchFailure) {
    this.event.push('wzrk_fetch', { t: 4 })
    /* Todo: Save the received vars data in local storage
        merge the received vars with the defined vars
    */

    if (onFetchComplete) {
      onFetchComplete()
    }
    if (onFetchFailure) {
      onFetchFailure()
    }
    return null
  }

  mergeVariables (vars) {
    // Merge the list with the
    console.log('msg vars is ', vars)
    StorageManager.saveToLSorCookie(VARIABLES, vars)
    this.remoteVariables = vars

    for (const name in this.variables) {
      if (vars.hasOwnProperty(name)) {
        this.variables[name].update(vars[name])
      }
    }
  }
}

export default VariableStore
