import { AES, enc } from 'crypto-js'
import { KEYS_TO_ENCRYPT, ENCRYPTION_KEY } from '../../util/constants'
import { StorageManager } from '../../util/storage'

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
    StorageManager.save(ENCRYPTION_KEY, value)
  }

  get encryptLocalStorage () {
    return this.#encryptLocalStorage
  }

  shouldEncrypt (key) {
    return this.#encryptLocalStorage && KEYS_TO_ENCRYPT.includes(key)
  }

  shouldDecrypt (key) {
    // TODO: why not use StorageManager.read()?
    // because it will introduce a circular dependency since we are
    // calling this function within read() as well.
    // Possibly will think of a workaround.
    return (JSON.parse(localStorage.getItem(ENCRYPTION_KEY)) ?? false) && KEYS_TO_ENCRYPT.includes(key)
  }

  encrypt (data) {
    return AES.encrypt(data, this.key).toString()
  }

  decrypt (data) {
    return AES.decrypt(data, this.key).toString(enc.Utf8)
  }
}

const encryption = new Encryption()

export default encryption
