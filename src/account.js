class Account {
  #accountID
  #region
  #appVersion

  constructor () {
  }

  get accountID () {
    return this.#accountID
  }

  set accountID (accountID) {
    // TODO: add some validation
    if (!this.#accountID) {
      this.#accountID = accountID
    }
  }

  get region () {
    return this.#region
  }

  set region (region) {
    // TODO: add some validation
    return this.#region = region
  }

  get appVersion () {
    return this.#appVersion
  }

  set appVersion (appVersion) {
    // TODO: add some validation
    this.#appVersion = appVersion
  }
}

export const account = new Account()
