import { encryptForBackend, decryptFromBackend } from './src/util/security/encryptionInTransit.js'
import { decompressFromBase64 } from './src/util/encoder.js'

// Test data
const testPayload = {
  event: "Product Viewed",
  properties: {
    productId: "12345",
    price: 99.99,
    category: "Electronics"
  }
}

console.log('Testing encryption/decryption with payload:', testPayload)

// Test encryption
encryptForBackend(testPayload, { id: 'TEST-ACCOUNT-ID' })
  .then(encrypted => {
    console.log('\n✅ Encryption successful!')
    console.log('Encrypted envelope (compressed):', encrypted)

    // Decompress to inspect the envelope structure
    const envelopeJson = decompressFromBase64(encrypted)
    const envelope = JSON.parse(envelopeJson)
    console.log('\nEnvelope structure:')
    console.log('- Key (itk) length:', envelope.itk.length)
    console.log('- IV (itv) length:', envelope.itv.length)
    console.log('- Ciphertext (itp) length:', envelope.itp.length)
    console.log('- Account ID:', envelope.id)
    console.log('- Encrypted flag:', envelope.encrypted)

    // Test decryption
    return decryptFromBackend(encrypted)
  })
  .then(decrypted => {
    console.log('\n✅ Decryption successful!')
    console.log('Decrypted payload:', decrypted)

    // Verify the decrypted data matches the original
    const decryptedObj = JSON.parse(decrypted)
    const originalStr = JSON.stringify(testPayload)
    const decryptedStr = JSON.stringify(decryptedObj)

    if (originalStr === decryptedStr) {
      console.log('\n✅ Round-trip test PASSED! Original and decrypted data match.')
    } else {
      console.log('\n❌ Round-trip test FAILED! Data mismatch.')
      console.log('Original:', originalStr)
      console.log('Decrypted:', decryptedStr)
    }
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error)
  })

// Also test with a simple string
console.log('\n\nTesting with string payload...')
encryptForBackend('Hello, CleverTap!')
  .then(encrypted => {
    console.log('✅ String encryption successful!')
    return decryptFromBackend(encrypted)
  })
  .then(decrypted => {
    console.log('✅ String decryption successful!')
    console.log('Decrypted string:', decrypted)
  })
  .catch(error => {
    console.error('❌ String test failed:', error)
  })
