export class Session {
  #sessionID = 0
  #previousSessionID = 0
  #sessionCount = 0
  #pageCount = 0
  #isFirstSession

  constructor (options = {}) {

  }
}

export const session = new Session()
