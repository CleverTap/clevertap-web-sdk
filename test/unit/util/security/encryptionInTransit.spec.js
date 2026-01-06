import 'regenerator-runtime/runtime'
import encryptionInTransitInstance from '../../../../src/util/security/encryptionInTransit'
import { decompressFromBase64 } from '../../../../src/util/encoder'

// Extract methods from singleton for convenience
const encryptForBackend = encryptionInTransitInstance.encryptForBackend.bind(encryptionInTransitInstance)
const decryptFromBackend = encryptionInTransitInstance.decryptFromBackend.bind(encryptionInTransitInstance)

describe('util/security/encryptionInTransit', () => {
  // Mock crypto.subtle for Node.js testing environment
  const mockCrypto = {
    subtle: {
      importKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn()
    },
    getRandomValues: jest.fn()
  }

  beforeAll(() => {
    global.crypto = mockCrypto
    global.TextEncoder = class {
      encode (input) {
        return new Uint8Array([...input].map(char => char.charCodeAt(0)))
      }
    }
    global.TextDecoder = class {
      decode (input) {
        return String.fromCharCode(...input)
      }
    }
    global.btoa = (str) => Buffer.from(str, 'binary').toString('base64')
    global.atob = (str) => Buffer.from(str, 'base64').toString('binary')
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('encryptForBackend', () => {
    it('should encrypt a string payload successfully', () => {
      const mockKey = new Uint8Array(32).fill(1)
      const mockIv = new Uint8Array(12).fill(2)
      const mockKeyObj = { type: 'secret' }
      const mockCipher = new Uint8Array([3, 4, 5, 6])

      mockCrypto.getRandomValues
        .mockReturnValueOnce(mockKey)
        .mockReturnValueOnce(mockIv)

      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyObj)
      mockCrypto.subtle.encrypt.mockResolvedValue(mockCipher.buffer)

      const payload = 'test payload'
      return encryptForBackend(payload).then((result) => {
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
          'raw',
          mockKey,
          { name: 'AES-GCM', iv: mockIv, tagLength: 128 },
          false,
          ['encrypt']
        )
      })
    })

    it('should encrypt an object payload by stringifying it', () => {
      const mockKey = new Uint8Array(32).fill(1)
      const mockIv = new Uint8Array(12).fill(2)
      const mockKeyObj = { type: 'secret' }
      const mockCipher = new Uint8Array([3, 4, 5, 6])

      mockCrypto.getRandomValues
        .mockReturnValueOnce(mockKey)
        .mockReturnValueOnce(mockIv)

      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyObj)
      mockCrypto.subtle.encrypt.mockResolvedValue(mockCipher.buffer)

      const payload = { event: 'test', data: { value: 123 } }
      return encryptForBackend(payload).then((result) => {
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
      })
    })

    it('should use custom id when provided', () => {
      const mockKey = new Uint8Array(32).fill(1)
      const mockIv = new Uint8Array(12).fill(2)
      const mockKeyObj = { type: 'secret' }
      const mockCipher = new Uint8Array([3, 4, 5, 6])

      mockCrypto.getRandomValues
        .mockReturnValueOnce(mockKey)
        .mockReturnValueOnce(mockIv)

      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyObj)
      mockCrypto.subtle.encrypt.mockResolvedValue(mockCipher.buffer)

      const payload = 'test payload'
      const customId = 'CUSTOM-ID-123'
      return encryptForBackend(payload, { id: customId }).then((result) => {
        expect(result).toBeDefined()
      })
    })

    it('should throw error when encryption fails', () => {
      mockCrypto.getRandomValues
        .mockReturnValueOnce(new Uint8Array(32))
        .mockReturnValueOnce(new Uint8Array(12))

      mockCrypto.subtle.importKey.mockRejectedValue(new Error('Import failed'))

      const payload = 'test payload'
      return expect(encryptForBackend(payload)).rejects.toThrow('Encryption failed: Import failed')
    })
  })

  describe('decryptFromBackend', () => {
    it('should decrypt a valid compressed envelope successfully', () => {
      const mockKeyObj = { type: 'secret' }
      const mockDecryptedData = new Uint8Array([116, 101, 115, 116]) // 'test' in bytes

      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyObj)
      mockCrypto.subtle.decrypt.mockResolvedValue(mockDecryptedData.buffer)

      // Mock decompressFromBase64 to return the envelope JSON
      decompressFromBase64.mockReturnValue(JSON.stringify({
        itp: btoa(String.fromCharCode(3, 4, 5, 6)), // cipher
        itk: btoa(String.fromCharCode(...Array(32).fill(1))), // key
        itv: btoa(String.fromCharCode(...Array(12).fill(2))) // iv
      }))

      return decryptFromBackend('compressed-base64-envelope').then((result) => {
        expect(result).toBe('test')
        expect(decompressFromBase64).toHaveBeenCalledWith('compressed-base64-envelope')
        expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
          'raw',
          expect.any(Uint8Array),
          { name: 'AES-GCM', iv: expect.any(Uint8Array), tagLength: 128 },
          false,
          ['decrypt']
        )
      })
    })

    it('should throw error for invalid envelope format', () => {
      decompressFromBase64.mockReturnValue(JSON.stringify({
        itp: 'data'
        // missing itk and itv
      }))

      return expect(decryptFromBackend('compressed-invalid-envelope')).rejects.toThrow('Decryption failed: Invalid envelope format')
    })

    it('should handle decompression errors', () => {
      decompressFromBase64.mockImplementation(() => {
        throw new Error('Decompression failed')
      })

      return expect(decryptFromBackend('invalid-compressed-data')).rejects.toThrow('Decryption failed: Decompression failed')
    })

    it('should throw error when decryption fails', () => {
      const mockKeyObj = { type: 'secret' }

      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyObj)
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decrypt failed'))

      const envelope = JSON.stringify({
        itp: btoa(String.fromCharCode(3, 4, 5, 6)),
        itk: btoa(String.fromCharCode(...Array(32).fill(1))),
        itv: btoa(String.fromCharCode(...Array(12).fill(2)))
      })

      return expect(decryptFromBackend(envelope)).rejects.toThrow('Decryption failed: Decrypt failed')
    })
  })

  describe('round-trip encryption/decryption', () => {
    it('should successfully encrypt and decrypt the same data', () => {
      // Setup real-like crypto operations for round-trip test
      const mockKey = new Uint8Array(32).fill(1)
      const mockIv = new Uint8Array(12).fill(2)
      const mockKeyObj = { type: 'secret' }

      // Original data
      const originalData = 'Hello, CleverTap!'
      const encodedData = new Uint8Array([...originalData].map(c => c.charCodeAt(0)))
      const mockCipher = new Uint8Array([10, 20, 30, 40, 50])

      // Setup mocks for encryption
      mockCrypto.getRandomValues
        .mockReturnValueOnce(mockKey)
        .mockReturnValueOnce(mockIv)
      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyObj)
      mockCrypto.subtle.encrypt.mockResolvedValue(mockCipher.buffer)

      // Encrypt
      return encryptForBackend(originalData).then((encrypted) => {
        expect(encrypted).toBeDefined()

        // Reset mocks for decryption
        jest.clearAllMocks()
        mockCrypto.subtle.importKey.mockResolvedValue(mockKeyObj)
        mockCrypto.subtle.decrypt.mockResolvedValue(encodedData.buffer)

        // For this test, we need to parse the encrypted envelope to pass valid data to decrypt
        // This is a simplified test that verifies the structure
        const envelope = {
          itp: btoa(String.fromCharCode(...mockCipher)),
          itk: btoa(String.fromCharCode(...mockKey)),
          itv: btoa(String.fromCharCode(...mockIv))
        }

        return decryptFromBackend(JSON.stringify(envelope)).then((decrypted) => {
          expect(decrypted).toBe(originalData)
        })
      })
    })
  })

  describe('encryption uniqueness', () => {
    it('should produce different ciphertexts for identical plaintexts', () => {
      const mockKeyObj = { type: 'secret' }

      // First encryption
      const mockKey1 = new Uint8Array(32).fill(1)
      const mockIv1 = new Uint8Array(12).fill(2)
      const mockCipher1 = new Uint8Array([1, 2, 3, 4])

      mockCrypto.getRandomValues
        .mockReturnValueOnce(mockKey1)
        .mockReturnValueOnce(mockIv1)
      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyObj)
      mockCrypto.subtle.encrypt.mockResolvedValue(mockCipher1.buffer)

      return encryptForBackend('identical payload').then((result1) => {
        // Reset mocks for second encryption
        jest.clearAllMocks()

        // Second encryption with different random values
        const mockKey2 = new Uint8Array(32).fill(5)
        const mockIv2 = new Uint8Array(12).fill(6)
        const mockCipher2 = new Uint8Array([7, 8, 9, 10])

        mockCrypto.getRandomValues
          .mockReturnValueOnce(mockKey2)
          .mockReturnValueOnce(mockIv2)
        mockCrypto.subtle.importKey.mockResolvedValue(mockKeyObj)
        mockCrypto.subtle.encrypt.mockResolvedValue(mockCipher2.buffer)

        return encryptForBackend('identical payload').then((result2) => {
          // Results should be different due to different IVs and keys
          expect(result1).not.toBe(result2)
        })
      })
    })
  })
})
