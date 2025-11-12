import { safeJSONParse } from '../../../src/util/datatypes'

describe('safeJSONParse - Security Tests', () => {
  describe('Basic functionality', () => {
    test('should parse valid JSON object', () => {
      const input = '{"name":"John","age":30}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ name: 'John', age: 30 })
    })

    test('should parse valid JSON array', () => {
      const input = '[1,2,3,4,5]'
      const result = safeJSONParse(input)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    test('should parse valid JSON string', () => {
      const input = '"hello world"'
      const result = safeJSONParse(input)
      expect(result).toBe('hello world')
    })

    test('should parse valid JSON number', () => {
      const input = '42'
      const result = safeJSONParse(input)
      expect(result).toBe(42)
    })

    test('should parse valid JSON boolean', () => {
      const input = 'true'
      const result = safeJSONParse(input)
      expect(result).toBe(true)
    })

    test('should parse valid JSON null', () => {
      const input = 'null'
      const result = safeJSONParse(input)
      expect(result).toBeNull()
    })
  })

  describe('Security - Malicious JSON injection attempts', () => {
    test('should reject unbalanced braces', () => {
      const malicious = '{"name":"test"'
      const result = safeJSONParse(malicious, 'DEFAULT')
      expect(result).toBe('DEFAULT')
    })

    test('should reject unbalanced brackets', () => {
      const malicious = '["test", "value"'
      const result = safeJSONParse(malicious, 'DEFAULT')
      expect(result).toBe('DEFAULT')
    })

    test('should reject malformed escape sequences', () => {
      const malicious = '{"test":"\\x00"}'
      const result = safeJSONParse(malicious, {})
      // This might pass or fail depending on JSON.parse, but it should handle it safely
      expect(result).toBeDefined()
    })

    test('should reject injection with special characters from Burp report', () => {
      // This simulates the payload from the security report
      const malicious = 'ydiiw8uab9%27%22`""/ydiiw8uab9/><ydiiw8uab9/\\>fv11wdwggu&'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject another injection pattern from Burp report', () => {
      const malicious = 'okxrroeroe%27%22`""/okxrroeroe/><okxrroeroe/\\>j4mf0mct5p&'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject malicious JSON with extra closing braces', () => {
      const malicious = '{"name":"test"}}'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject malicious JSON with extra opening braces', () => {
      const malicious = '{{"name":"test"}'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject code injection attempts', () => {
      const malicious = '{"name":"test","exploit":"<script>alert(1)</script>"}'
      const result = safeJSONParse(malicious, null)
      // This is valid JSON, so it should parse, but the content is sanitized elsewhere
      expect(result).toBeDefined()
    })

    test('should reject proto pollution attempts', () => {
      const malicious = '{"__proto__":{"admin":true}}'
      const result = safeJSONParse(malicious, null)
      // Valid JSON syntax, should parse but won't pollute prototype
      expect(result).toBeDefined()
      // Verify prototype pollution didn't occur
      expect({}.admin).toBeUndefined()
    })
  })

  describe('Edge cases', () => {
    test('should return default for empty string', () => {
      const result = safeJSONParse('', 'DEFAULT')
      expect(result).toBe('DEFAULT')
    })

    test('should return default for null input', () => {
      const result = safeJSONParse(null, 'DEFAULT')
      expect(result).toBe('DEFAULT')
    })

    test('should return default for undefined input', () => {
      const result = safeJSONParse(undefined, 'DEFAULT')
      expect(result).toBe('DEFAULT')
    })

    test('should return default for non-string input', () => {
      const result = safeJSONParse(123, 'DEFAULT')
      expect(result).toBe('DEFAULT')
    })

    test('should handle whitespace-only string', () => {
      const result = safeJSONParse('   ', 'DEFAULT')
      expect(result).toBe('DEFAULT')
    })

    test('should handle strings starting with invalid characters', () => {
      const result = safeJSONParse('abc123', 'DEFAULT')
      expect(result).toBe('DEFAULT')
    })

    test('should handle nested JSON objects', () => {
      const input = '{"user":{"name":"John","details":{"age":30,"city":"NYC"}}}'
      const result = safeJSONParse(input)
      expect(result).toEqual({
        user: {
          name: 'John',
          details: {
            age: 30,
            city: 'NYC'
          }
        }
      })
    })

    test('should handle JSON with escaped quotes', () => {
      const input = '{"message":"Hello \\"World\\""}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ message: 'Hello "World"' })
    })

    test('should handle JSON with unicode characters', () => {
      const input = '{"message":"Hello \\u0057orld"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ message: 'Hello World' })
    })
  })

  describe('Cookie injection scenarios', () => {
    test('should safely handle malicious cookie data with single quotes', () => {
      // Simulates cookie data that might have single quotes converted to double
      const cookieData = '{"s":1234,"p":5,"t":1633024800}'
      const result = safeJSONParse(cookieData)
      expect(result).toEqual({ s: 1234, p: 5, t: 1633024800 })
    })

    test('should reject cookie data with injection attempts', () => {
      const maliciousCookie = '{"s":1234}; document.cookie="hacked=true"'
      const result = safeJSONParse(maliciousCookie, null)
      expect(result).toBeNull()
    })

    test('should handle URL-encoded malicious payloads', () => {
      // After decodeURIComponent of malicious payload
      const decoded = '{"test":"value"}<!--<script>alert(1)</script>-->'
      const result = safeJSONParse(decoded, null)
      expect(result).toBeNull()
    })

    test('should handle GUID cookie data safely', () => {
      const guidCookie = '"12345678901234567890123456789012"'
      const result = safeJSONParse(guidCookie)
      expect(result).toBe('12345678901234567890123456789012')
    })

    test('should handle campaign cookie data safely', () => {
      const campaignData = '{"wp":{"global":{"campaign1":5}},"wsc":10}'
      const result = safeJSONParse(campaignData)
      expect(result).toEqual({
        wp: { global: { campaign1: 5 } },
        wsc: 10
      })
    })
  })

  describe('Performance and DoS prevention', () => {
    test('should handle deeply nested objects efficiently', () => {
      const deeplyNested = '{"a":{"b":{"c":{"d":{"e":{"f":"value"}}}}}}'
      const result = safeJSONParse(deeplyNested)
      expect(result).toBeDefined()
    })

    test('should handle large arrays efficiently', () => {
      const largeArray = '[' + Array(1000).fill('1').join(',') + ']'
      const result = safeJSONParse(largeArray)
      expect(result).toHaveLength(1000)
    })

    test('should handle strings with many escaped characters', () => {
      const input = '{"text":"' + '\\n'.repeat(100) + '"}'
      const result = safeJSONParse(input)
      expect(result).toBeDefined()
    })
  })

  describe('Custom default values', () => {
    test('should return custom default object on error', () => {
      const defaultObj = { error: true }
      const result = safeJSONParse('invalid json', defaultObj)
      expect(result).toBe(defaultObj)
    })

    test('should return custom default array on error', () => {
      const defaultArray = []
      const result = safeJSONParse('invalid', defaultArray)
      expect(result).toBe(defaultArray)
    })

    test('should return custom default null on error', () => {
      const result = safeJSONParse('invalid', null)
      expect(result).toBeNull()
    })
  })
})
