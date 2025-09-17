import { compressData, decompressFromBase64 } from '../encoder'

const utf8 = new TextEncoder()
const toB64 = (u8) => btoa(String.fromCharCode(...u8))
const fromB64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0))
const rnd = (n) => crypto.getRandomValues(new Uint8Array(n))

let key = null

// function uint8ArrayToBase64 (uint8Array) {
//   // For binary data, we need to handle it differently to avoid corruption
//   let binary = ''
//   const len = uint8Array.byteLength
//   for (let i = 0; i < len; i++) {
//     binary += String.fromCharCode(uint8Array[i])
//   }
//   return btoa(binary)
// }

/**
 * Encrypts payload for backend transmission using AES-GCM-256.
 *
 * @param {string|Object} payload - The payload to encrypt (string or object to stringify)
 * @param {Object} options - Options object
 * @param {string} options.id - Optional identifier (defaults to 'ZWW-WWW-WWRZ')
 * @returns {Promise<string>} - Base64 compressed encrypted envelope
 */
export function encryptForBackend (payload, { id = 'ZWW-WWW-WWRZ' } = {}) {
  // Generate a random 256-bit key (32 bytes) to match backend AES-256
  key = rnd(32)
  // Generate a random 96-bit IV (12 bytes) for GCM
  const iv = rnd(12)

  // Algorithm specification with tag length matching backend (128 bits)
  const alg = { name: 'AES-GCM', iv, tagLength: 128 }

  // Convert payload to bytes
  const plainBuf = utf8.encode(typeof payload === 'string' ? payload : JSON.stringify(payload))

  // Import the raw key as a CryptoKey
  return crypto.subtle.importKey(
    'raw',
    key,
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
        itp: toB64(cipher), // payload - base64 encoded ciphertext (includes auth tag)
        itk: toB64(key), // key - base64 encoded raw AES key
        itv: toB64(iv), // iv - base64 encoded IV
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
    const { itp, itv } = envelope

    if (!itp || !itv) {
      return Promise.reject(new Error('Decryption failed: Invalid envelope format'))
    }

    const ciphertext = fromB64(itp)
    const iv = fromB64(itv)

    // Algorithm specification matching backend (tagLength 128 bits)
    const alg = { name: 'AES-GCM', iv, tagLength: 128 }

    // Import the key and decrypt
    return crypto.subtle.importKey(
      'raw',
      key,
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
