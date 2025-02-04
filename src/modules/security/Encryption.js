import { AES, enc } from 'crypto-js'
import { KEYS_TO_ENCRYPT } from '../../util/constants'
// import { StorageManager } from '../../util/storage'

class Encryption {
  #key
  #logger
  #encryptLocalStorage = false

  set logger (classInstance) {
    this.#logger = classInstance
  }

  get logger () {
    return this.#logger
  }

  set key (value) {
    this.#key = value
  }

  get key () {
    return this.#key
  }

  set encryptLocalStorage (value) {
    this.#encryptLocalStorage = value
  }

  get encryptLocalStorage () {
    return this.#encryptLocalStorage
  }

  shouldEncrypt (key) {
    return this.#encryptLocalStorage && KEYS_TO_ENCRYPT.includes(key)
  }

  // For backwards compatibility, we should decrypt even if encrypt is false.
  // This means someone switched it on and then off.
  shouldDecrypt (key) {
    return KEYS_TO_ENCRYPT.includes(key)
  }

  encrypt (data) {
    return AES.encrypt(data, this.key).toString()
  }

  decrypt (data) {
    const decryptedData = AES.decrypt(data, this.key).toString(enc.Utf8)
    if (decryptedData === '') {
      return data
    } else {
      return decryptedData
    }
  }
}

const encryption = new Encryption()

export default encryption
