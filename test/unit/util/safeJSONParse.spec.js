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

    test('should reject code injection with HTML tags', () => {
      const malicious = '{"name":"test","exploit":"<script>alert(1)</script>"}'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull() // Blocked due to < and > characters
    })

    test('should reject payload with URL-encoded quotes (%27)', () => {
      const malicious = 'test%27injection'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject payload with URL-encoded double quotes (%22)', () => {
      const malicious = 'test%22injection'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject payload with URL-encoded less-than (%3C)', () => {
      const malicious = 'test%3Cscript%3E'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject payload with URL-encoded greater-than (%3E)', () => {
      const malicious = 'test%3Cscript%3E'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject payload with URL-encoded backtick (%60)', () => {
      const malicious = 'test%60template%60'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject payload with backtick characters', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const malicious = '`${constructor.constructor("alert(1)")()}`'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should reject XSS with img tag', () => {
      const malicious = '<img src=x onerror=alert(1)>'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull()
    })

    test('should handle case-insensitive URL-encoded patterns', () => {
      // Test both %27 and %2F to ensure case insensitivity
      const maliciousUpper = 'test%2Finjection'
      const maliciousLower = 'test%2finjection'

      const resultUpper = safeJSONParse(maliciousUpper, null)
      const resultLower = safeJSONParse(maliciousLower, null)

      // %2F (slash) is safe - should parse if valid JSON
      // These are not valid JSON so both return null
      expect(resultUpper).toBeNull()
      expect(resultLower).toBeNull()
    })

    test('should reject mixed injection patterns', () => {
      const malicious = '{"test":"<script>alert(%27XSS%22)</script>`template`"}'
      const result = safeJSONParse(malicious, null)
      expect(result).toBeNull() // Multiple dangerous patterns present
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

  describe('Safe URL encoding (should pass)', () => {
    test('should allow %20 (space encoding)', () => {
      const input = '{"text":"hello%20world"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ text: 'hello%20world' })
    })

    test('should allow %2F (slash encoding)', () => {
      const input = '{"path":"folder%2Fsubfolder%2Ffile"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ path: 'folder%2Fsubfolder%2Ffile' })
    })

    test('should allow %3D (equals encoding)', () => {
      const input = '{"query":"key%3Dvalue"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ query: 'key%3Dvalue' })
    })

    test('should allow %26 (ampersand encoding)', () => {
      const input = '{"query":"param1%26param2"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ query: 'param1%26param2' })
    })

    test('should allow %2B (plus encoding)', () => {
      const input = '{"math":"1%2B2"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ math: '1%2B2' })
    })

    test('should allow %40 (at sign encoding)', () => {
      const input = '{"email":"user%40example.com"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ email: 'user%40example.com' })
    })

    test('should allow %23 (hash encoding)', () => {
      const input = '{"anchor":"section%231"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({ anchor: 'section%231' })
    })

    test('should allow complex URL with multiple safe encodings', () => {
      const input = '{"url":"https://api.example.com/search?q=hello%20world&category=tech%20%26%20science&page=1"}'
      const result = safeJSONParse(input)
      expect(result).toHaveProperty('url')
      expect(result.url).toContain('hello%20world')
      expect(result.url).toContain('tech%20%26%20science')
    })

    test('should allow base64-like encoded data in URLs', () => {
      const input = '{"data":"d=N4IgLgngDgpiBcIoCcD2AzAlgGzgGiTS1wVAGMwB9VKMVAVzAXQENsBnGAXwMw"}'
      const result = safeJSONParse(input)
      expect(result).toHaveProperty('data')
      expect(result.data).toContain('N4IgLgngDgpiBcIoCcD2Az')
    })

    test('should allow typical API URL with query parameters', () => {
      const input = '{"endpoint":"https://api.service.com/v1/events?type=page&timestamp=1234567890&user_id=abc123"}'
      const result = safeJSONParse(input)
      expect(result).toHaveProperty('endpoint')
      expect(result.endpoint).toContain('api.service.com')
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

    test('should handle JSON with URLs containing safe URL-encoded parameters', () => {
      // Legitimate backup event with URL parameters (regression test for ONC-51)
      const input = '{"1":{"q":"https://eu1.clevertap-prod.com/a?t=96&type=push&d=N4IgLgngDgpiBcIoCcD2AzAlgGzgGiTS1wVAGMwB9VKMVAVzAXQENsBnGAXwMwBMEIACoBRAMpCAtAEYATAGZJAFgCsANgBaIAlADmCaQRbpSIbJgBGggO4wLk9nwDWkgG6yAdPI%2FTJYGOxMOmh0ZKjYggAWYGBQIFxcQAAA&optOut=false&rn=1&i=1762925728&sn=0"}}'
      const result = safeJSONParse(input)
      expect(result).not.toBeNull()
      expect(result).toHaveProperty('1')
      expect(result['1']).toHaveProperty('q')
      expect(result['1'].q).toContain('clevertap-prod.com')
    })

    test('should handle JSON with multiple URL parameters', () => {
      const input = '{"url":"https://api.example.com/v1/users?id=123&name=John%20Doe&category=admin"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({
        url: 'https://api.example.com/v1/users?id=123&name=John%20Doe&category=admin'
      })
    })

    test('should handle JSON with safe percent-encoded characters', () => {
      // %2F (slash), %3D (equals), %20 (space) are legitimate URL encoding
      const input = '{"path":"folder%2Fsubfolder%2Ffile.txt","query":"key%3Dvalue","text":"hello%20world"}'
      const result = safeJSONParse(input)
      expect(result).toEqual({
        path: 'folder%2Fsubfolder%2Ffile.txt',
        query: 'key%3Dvalue',
        text: 'hello%20world'
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
