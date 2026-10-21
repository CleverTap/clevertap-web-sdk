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

  getTotalVisits () {
    if (!this.#isPersonalisationActive()) {
      return
    }
    let visitCount = this.#instanceManager.storage.getMetaProp('sc')
    if (visitCount == null) {
      visitCount = 1
    }
    return visitCount
  }

  getLastVisit () {
    if (!this.#isPersonalisationActive()) {
      return
    }
    const prevSession = this.#instanceManager.storage.getMetaProp('ps')
    if (prevSession != null) {
      return new Date(prevSession * 1000)
    }
  }
}
