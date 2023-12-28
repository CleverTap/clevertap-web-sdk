import { $ct } from '../../util/storage'

class VariableStore {
  #logger
  #request
  #account
  event

  constructor ({ logger, request, account, event }) {
    this.variables = {}
    $ct.variableStore = this
    this.#logger = logger
    this.#account = account
    this.#request = request
    this.event = event
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
    return false
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
    // setTimeout(() => {
    //   const name = 'love'
    //   this.variables[name].update(20)
    //   console.log('syncVariables', this.variables)
    //   if (onFetchComplete) {
    //     onFetchComplete()
    //   }
    // }, 2000)
    this.event.push('wzrk_fetch', {})

    if (onFetchComplete) {
      onFetchComplete()
    }
    if (onFetchFailure) {
      onFetchFailure()
    }
    return null
  }
}

export default VariableStore
