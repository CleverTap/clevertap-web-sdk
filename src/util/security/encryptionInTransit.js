import { compressData, decompressFromBase64 } from '../encoder'

const utf8 = new TextEncoder()
const toB64 = (u8) => btoa(String.fromCharCode(...u8))
const fromB64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0))
const rnd = (n) => crypto.getRandomValues(new Uint8Array(n))

/**
 * Encrypts payload for backend transmission using AES-GCM-256.
 *
 * @param {string|Object} payload - The payload to encrypt (string or object to stringify)
 * @param {Object} options - Options object
 * @param {string} options.id - Optional identifier (defaults to 'ZWW-WWW-WWRZ')
 * @returns {Promise<string>} - Base64 compressed encrypted envelope
 */
export function encryptForBackend (payload, { id = 'ZWW-WWW-WWRZ' } = {}) {
  const key = rnd(32) // 256-bit key
  const iv = rnd(12) // 96-bit IV

  const alg = { name: 'AES-GCM', iv, tagLength: 128 }
  const plainBuf = utf8.encode(typeof payload === 'string' ? payload : JSON.stringify(payload))

  return crypto.subtle.importKey('raw', key, alg, false, ['encrypt'])
    .then((keyObj) => crypto.subtle.encrypt(alg, keyObj, plainBuf))
    .then((cipherBuf) => {
      const cipher = new Uint8Array(cipherBuf)
      const envelope = {
        itp: toB64(cipher), // payload
        itk: toB64(key), // key
        itv: toB64(iv), // iv
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
 * @param {string} envelopeB64 - Base64 compressed encrypted envelope
 * @returns {Promise<string>} - Decrypted plaintext
 */
export function decryptFromBackend (envelopeB64) {
  try {
    // Decompress the base64 envelope using LZS decompression
    const envelopeJson = decompressFromBase64(envelopeB64)
    const envelope = JSON.parse(envelopeJson)
    const { itp, itk, itv } = envelope

    if (!itp || !itk || !itv) {
      return Promise.reject(new Error('Decryption failed: Invalid envelope format'))
    }

    const payload = fromB64(itp)
    const key = fromB64(itk)
    const iv = fromB64(itv)

    const alg = { name: 'AES-GCM', iv, tagLength: 128 }

    return crypto.subtle.importKey('raw', key, alg, false, ['decrypt'])
      .then((keyObj) => crypto.subtle.decrypt(alg, keyObj, payload))
      .then((plainBuf) => new TextDecoder().decode(plainBuf))
      .catch((error) => {
        throw new Error(`Decryption failed: ${error.message}`)
      })
  } catch (error) {
    return Promise.reject(new Error(`Decryption failed: ${error.message}`))
  }
}
