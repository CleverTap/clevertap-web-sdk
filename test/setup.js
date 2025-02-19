jest.mock('crypto-js', () => {
  return {
    AES: {
      encrypt: jest.fn().mockReturnValue('encrypted'),
      decrypt: jest.fn().mockReturnValue('decrypted')
  }
}
})
