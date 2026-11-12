import { StorageManager } from '../util/storage'
export default class User {
  #isPersonalisationActive
  #instanceManager

  constructor ({
    isPersonalisationActive,
    instanceManager
  }) {
    this.#isPersonalisationActive = isPersonalisationActive
    this.#instanceManager = instanceManager
  }

  #storage () {
    return this.#instanceManager ? this.#instanceManager.storage : StorageManager
  }

  getTotalVisits () {
    if (!this.#isPersonalisationActive()) {
      return
    }
    let visitCount = this.#storage().getMetaProp('sc')
    if (visitCount == null) {
      visitCount = 1
    }
    return visitCount
  }

  getLastVisit () {
    if (!this.#isPersonalisationActive()) {
      return
    }
    const prevSession = this.#storage().getMetaProp('ps')
    if (prevSession != null) {
      return new Date(prevSession * 1000)
    }
  }
}
