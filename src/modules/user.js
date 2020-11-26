import {
  StorageManager
} from '../util/storage'
export default class User {
  #isPersonalizationActive

  constructor ({
    isPersonalizationActive
  }) {
    this.#isPersonalizationActive = isPersonalizationActive
  }

  getTotalVisits () {
    if (!this.#isPersonalizationActive()) {
      return
    }
    let visitCount = StorageManager.getMetaProp('sc')
    if (visitCount == null) {
      visitCount = 1
    }
    return visitCount
  }

  getLastVisit () {
    if (!this.#isPersonalizationActive()) {
      return
    }
    const prevSession = StorageManager.getMetaProp('ps')
    if (prevSession != null) {
      return new Date(prevSession * 1000)
    }
  }
}
