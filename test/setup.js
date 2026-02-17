// Polyfill TextEncoder and TextDecoder for Node.js test environment
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

jest.mock('crypto-js', () => {
  return {
    AES: {
      encrypt: jest.fn().mockReturnValue('encrypted'),
      decrypt: jest.fn().mockReturnValue('decrypted')
    }
  }
})
