import {
  StorageManager
} from '../util/storage'
export default class User {
  #isPersonalisationActive

  constructor ({
    isPersonalisationActive
  }) {
    this.#isPersonalisationActive = isPersonalisationActive
  }

  getTotalVisits () {
    if (!this.#isPersonalisationActive()) {
      return
    }
    let visitCount = StorageManager.getMetaProp('sc')
    if (visitCount == null) {
      visitCount = 1
    }
    return visitCount
  }

  getLastVisit () {
    if (!this.#isPersonalisationActive()) {
      return
    }
    const prevSession = StorageManager.getMetaProp('ps')
    if (prevSession != null) {
      return new Date(prevSession * 1000)
    }
  }
}
