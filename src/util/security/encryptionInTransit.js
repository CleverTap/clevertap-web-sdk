import { compressData } from '../encoder'
import { StorageManager } from '../storage'
import { ENCRYPTION_KEY_NAME } from '../constants'

/**
 * EncryptionInTransit class for handling AES-GCM-256 encryption/decryption.
 * Implemented as a singleton pattern.
 */
class EncryptionInTransit {
  constructor () {
    this.encryptionKey = StorageManager.read(ENCRYPTION_KEY_NAME) ?? null
    this.utf8 = new TextEncoder()
  }

  /**
   * Converts Uint8Array to Base64 string
   * @private
   */
  toB64 (u8) {
    return btoa(String.fromCharCode(...u8))
  }

  /**
   * Converts Base64 string to Uint8Array
   * @private
   */
  fromB64 (b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  }

  /**
   * Generates random bytes
   * @private
   */
  rnd (n) {
    return crypto.getRandomValues(new Uint8Array(n))
  }

  /**
   * Generates a new symmetric key for encryption
   * @returns {Uint8Array} - 256-bit (32 bytes) symmetric key
   */
  generateSymmetricKey () {
    // Generate a random 256-bit key (32 bytes) to match backend AES-256
    this.encryptionKey = this.rnd(32)
    StorageManager.write(ENCRYPTION_KEY_NAME, this.encryptionKey)
    return this.encryptionKey
  }

  /**
   * Encrypts payload for backend transmission using AES-GCM-256.
   *
   * @param {string|Object} payload - The payload to encrypt (string or object to stringify)
   * @param {Object} options - Options object
   * @param {string} options.id - Optional identifier (defaults to 'ZWW-WWW-WWRZ')
   * @returns {Promise<string>} - Base64 compressed encrypted envelope
   */
  encryptForBackend (payload, { id = 'ZWW-WWW-WWRZ' } = {}) {
    // Generate a new symmetric key for this encryption
    if (!this.encryptionKey) {
      this.generateSymmetricKey()
    }

    // Generate a random 96-bit IV (12 bytes) for GCM
    const iv = this.rnd(12)

    // Algorithm specification with tag length matching backend (128 bits)
    const alg = { name: 'AES-GCM', iv, tagLength: 128 }

    // Convert payload to bytes
    const plainBuf = this.utf8.encode(typeof payload === 'string' ? payload : JSON.stringify(payload))

    // Import the raw key as a CryptoKey
    return crypto.subtle.importKey(
      'raw',
      this.encryptionKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
      .then((cryptoKey) => {
        // Encrypt the data
        return crypto.subtle.encrypt(alg, cryptoKey, plainBuf)
      })
      .then((cipherBuf) => {
        const cipher = new Uint8Array(cipherBuf)

        const envelope = {
          itp: this.toB64(cipher), // payload - base64 encoded ciphertext (includes auth tag)
          itk: this.toB64(this.encryptionKey), // key - base64 encoded raw AES key
          itv: this.toB64(iv), // iv - base64 encoded IV
          id,
          encrypted: true
        }

        return compressData(JSON.stringify(envelope))
      })
      .catch((error) => {
        throw new Error(`Encryption failed: ${error.message}`)
      })
  }

  /**
   * Decrypts response from backend using AES-GCM-256.
   * This is a stub implementation for Phase 2.
   *
   * @param {string} envelope - encrypted envelope
   * @returns {Promise<string>} - Decrypted plaintext
   */
  async decryptFromBackend (envelope) {
    try {
      // Decompress the base64 envelope using LZS decompression
      const parsedEnvelope = JSON.parse(envelope)
      const { itp, itv } = parsedEnvelope

      if (!itp || !itv) {
        return Promise.reject(new Error('Decryption failed: Invalid envelope format'))
      }

      const ciphertext = this.fromB64(itp)
      const iv = this.fromB64(itv)

      // Algorithm specification matching backend (tagLength 128 bits)
      const alg = { name: 'AES-GCM', iv, tagLength: 128 }

      // Import the key and decrypt
      return crypto.subtle.importKey(
        'raw',
        this.encryptionKey,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      )
        .then((cryptoKey) => crypto.subtle.decrypt(alg, cryptoKey, ciphertext))
        .then((plainBuf) => new TextDecoder().decode(plainBuf))
        .catch((error) => {
          throw new Error(`Decryption failed: ${error.message}`)
        })
    } catch (error) {
      return Promise.reject(new Error(`Decryption failed: ${error.message}`))
    }
  }
}

// Create and export singleton instance
const encryptionInTransitInstance = new EncryptionInTransit()
window.encryptionInTransitInstance = encryptionInTransitInstance

// Export the singleton instance
export default encryptionInTransitInstance
