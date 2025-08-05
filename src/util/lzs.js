export const LZS = {

  _f: String.fromCharCode,

  compressToBase64: function (input) {
    if (input === null) return ''
    let output = ''
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4
    let i = 0

    input = LZS.compress(input)

    while (i < input.length * 2) {
      if (i % 2 === 0) {
        chr1 = input.charCodeAt(i / 2) >> 8
        chr2 = input.charCodeAt(i / 2) & 255
        if (i / 2 + 1 < input.length) {
          chr3 = input.charCodeAt(i / 2 + 1) >> 8
        } else {
          chr3 = NaN
        }
      } else {
        chr1 = input.charCodeAt((i - 1) / 2) & 255
        if ((i + 1) / 2 < input.length) {
          chr2 = input.charCodeAt((i + 1) / 2) >> 8
          chr3 = input.charCodeAt((i + 1) / 2) & 255
        } else {
          chr2 = chr3 = NaN
        }
      }
      i += 3

      enc1 = chr1 >> 2
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
      enc4 = chr3 & 63

      if (isNaN(chr2)) {
        enc3 = enc4 = 64
      } else if (isNaN(chr3)) {
        enc4 = 64
      }

      output = output +
        LZS._keyStr.charAt(enc1) + LZS._keyStr.charAt(enc2) +
        LZS._keyStr.charAt(enc3) + LZS._keyStr.charAt(enc4)
    }

    return output
  },

  compress (uncompressed) {
    if (uncompressed === null) return ''
    let i, value
    const contextDictionary = {}
    const contextDictionaryToCreate = {}
    let contextC = ''
    let contextWc = ''
    let contextW = ''
    let contextEnlargeIn = 2 // Compensate for the first entry which should not count
    let contextDictSize = 3
    let contextNumBits = 2
    let contextDataString = ''
    let contextDataVal = 0
    let contextDataPosition = 0
    let ii
    const f = LZS._f

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      contextC = uncompressed.charAt(ii)
      if (!Object.prototype.hasOwnProperty.call(contextDictionary, contextC)) {
        contextDictionary[contextC] = contextDictSize++
        contextDictionaryToCreate[contextC] = true
      }

      contextWc = contextW + contextC
      if (Object.prototype.hasOwnProperty.call(contextDictionary, contextWc)) {
        contextW = contextWc
      } else {
        if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
          if (contextW.charCodeAt(0) < 256) {
            for (i = 0; i < contextNumBits; i++) {
              contextDataVal = (contextDataVal << 1)
              if (contextDataPosition === 15) {
                contextDataPosition = 0
                contextDataString += f(contextDataVal)
                contextDataVal = 0
              } else {
                contextDataPosition++
              }
            }
            value = contextW.charCodeAt(0)
            for (i = 0; i < 8; i++) {
              contextDataVal = (contextDataVal << 1) | (value & 1)
              if (contextDataPosition === 15) {
                contextDataPosition = 0
                contextDataString += f(contextDataVal)
                contextDataVal = 0
              } else {
                contextDataPosition++
              }
              value = value >> 1
            }
          } else {
            value = 1
            for (i = 0; i < contextNumBits; i++) {
              contextDataVal = (contextDataVal << 1) | value
              if (contextDataPosition === 15) {
                contextDataPosition = 0
                contextDataString += f(contextDataVal)
                contextDataVal = 0
              } else {
                contextDataPosition++
              }
              value = 0
            }
            value = contextW.charCodeAt(0)
            for (i = 0; i < 16; i++) {
              contextDataVal = (contextDataVal << 1) | (value & 1)
              if (contextDataPosition === 15) {
                contextDataPosition = 0
                contextDataString += f(contextDataVal)
                contextDataVal = 0
              } else {
                contextDataPosition++
              }
              value = value >> 1
            }
          }
          contextEnlargeIn--
          if (contextEnlargeIn === 0) {
            contextEnlargeIn = Math.pow(2, contextNumBits)
            contextNumBits++
          }
          delete contextDictionaryToCreate[contextW]
        } else {
          value = contextDictionary[contextW]
          for (i = 0; i < contextNumBits; i++) {
            contextDataVal = (contextDataVal << 1) | (value & 1)
            if (contextDataPosition === 15) {
              contextDataPosition = 0
              contextDataString += f(contextDataVal)
              contextDataVal = 0
            } else {
              contextDataPosition++
            }
            value = value >> 1
          }
        }
        contextEnlargeIn--
        if (contextEnlargeIn === 0) {
          contextEnlargeIn = Math.pow(2, contextNumBits)
          contextNumBits++
        }
        // Add wc to the dictionary.
        contextDictionary[contextWc] = contextDictSize++
        contextW = String(contextC)
      }
    }

    // Output the code for w.
    if (contextW !== '') {
      if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
        if (contextW.charCodeAt(0) < 256) {
          for (i = 0; i < contextNumBits; i++) {
            contextDataVal = (contextDataVal << 1)
            if (contextDataPosition === 15) {
              contextDataPosition = 0
              contextDataString += f(contextDataVal)
              contextDataVal = 0
            } else {
              contextDataPosition++
            }
          }
          value = contextW.charCodeAt(0)
          for (i = 0; i < 8; i++) {
            contextDataVal = (contextDataVal << 1) | (value & 1)
            if (contextDataPosition === 15) {
              contextDataPosition = 0
              contextDataString += f(contextDataVal)
              contextDataVal = 0
            } else {
              contextDataPosition++
            }
            value = value >> 1
          }
        } else {
          value = 1
          for (i = 0; i < contextNumBits; i++) {
            contextDataVal = (contextDataVal << 1) | value
            if (contextDataPosition === 15) {
              contextDataPosition = 0
              contextDataString += f(contextDataVal)
              contextDataVal = 0
            } else {
              contextDataPosition++
            }
            value = 0
          }
          value = contextW.charCodeAt(0)
          for (i = 0; i < 16; i++) {
            contextDataVal = (contextDataVal << 1) | (value & 1)
            if (contextDataPosition === 15) {
              contextDataPosition = 0
              contextDataString += f(contextDataVal)
              contextDataVal = 0
            } else {
              contextDataPosition++
            }
            value = value >> 1
          }
        }
        contextEnlargeIn--
        if (contextEnlargeIn === 0) {
          contextEnlargeIn = Math.pow(2, contextNumBits)
          contextNumBits++
        }
        delete contextDictionaryToCreate[contextW]
      } else {
        value = contextDictionary[contextW]
        for (i = 0; i < contextNumBits; i++) {
          contextDataVal = (contextDataVal << 1) | (value & 1)
          if (contextDataPosition === 15) {
            contextDataPosition = 0
            contextDataString += f(contextDataVal)
            contextDataVal = 0
          } else {
            contextDataPosition++
          }
          value = value >> 1
        }
      }
      contextEnlargeIn--
      if (contextEnlargeIn === 0) {
        contextEnlargeIn = Math.pow(2, contextNumBits)
        contextNumBits++
      }
    }

    // Mark the end of the stream
    value = 2
    for (i = 0; i < contextNumBits; i++) {
      contextDataVal = (contextDataVal << 1) | (value & 1)
      if (contextDataPosition === 15) {
        contextDataPosition = 0
        contextDataString += f(contextDataVal)
        contextDataVal = 0
      } else {
        contextDataPosition++
      }
      value = value >> 1
    }

    // Flush the last char
    while (true) {
      contextDataVal = (contextDataVal << 1)
      if (contextDataPosition === 15) {
        contextDataString += f(contextDataVal)
        break
      } else {
        contextDataPosition++
      }
    }
    return contextDataString
  },

  decompressFromBase64: function (input) {
    if (input === null) return ''
    let output = ''
    let ol = 0
    let output_
    let chr1, chr2, chr3
    let enc1, enc2, enc3, enc4
    let i = 0
    const f = LZS._f

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')

    while (i < input.length) {
      const a = input.charAt(i++)
      const b = input.charAt(i++)
      const c = input.charAt(i++)
      const d = input.charAt(i++)

      enc1 = LZS._keyStr.indexOf(a)
      enc2 = LZS._keyStr.indexOf(b)
      enc3 = LZS._keyStr.indexOf(c)
      enc4 = LZS._keyStr.indexOf(d)

      chr1 = (enc1 << 2) | (enc2 >> 4)
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
      chr3 = ((enc3 & 3) << 6) | enc4

      if (ol % 2 === 0) {
        output_ = chr1 << 8

        if (enc3 !== 64) {
          output += f(output_ | chr2)
        }
        if (enc4 !== 64) {
          output_ = chr3 << 8
        }
      } else {
        output = output + f(output_ | chr1)

        if (enc3 !== 64) {
          output_ = chr2 << 8
        }
        if (enc4 !== 64) {
          output += f(output_ | chr3)
        }
      }
      ol += 3
    }

    return LZS.decompress(output)
  },

  decompress: function (compressed) {
    if (compressed === null) return ''
    if (compressed === '') return null
    const dictionary = []
    let enlargeIn = 4
    let dictSize = 4
    let numBits = 3
    let entry = ''
    let result = ''
    let i
    let w
    let bits, resb, maxpower, power
    let c
    const f = LZS._f
    const data = { string: compressed, val: compressed.charCodeAt(0), position: 32768, index: 1 }

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i
    }

    bits = 0
    maxpower = Math.pow(2, 2)
    power = 1
    while (power !== maxpower) {
      resb = data.val & data.position
      data.position >>= 1
      if (data.position === 0) {
        data.position = 32768
        data.val = data.string.charCodeAt(data.index++)
      }
      bits |= (resb > 0 ? 1 : 0) * power
      power <<= 1
    }

    switch (bits) {
      case 0:
        bits = 0
        maxpower = Math.pow(2, 8)
        power = 1
        while (power !== maxpower) {
          resb = data.val & data.position
          data.position >>= 1
          if (data.position === 0) {
            data.position = 32768
            data.val = data.string.charCodeAt(data.index++)
          }
          bits |= (resb > 0 ? 1 : 0) * power
          power <<= 1
        }
        c = f(bits)
        break
      case 1:
        bits = 0
        maxpower = Math.pow(2, 16)
        power = 1
        while (power !== maxpower) {
          resb = data.val & data.position
          data.position >>= 1
          if (data.position === 0) {
            data.position = 32768
            data.val = data.string.charCodeAt(data.index++)
          }
          bits |= (resb > 0 ? 1 : 0) * power
          power <<= 1
        }
        c = f(bits)
        break
      case 2:
        return ''
    }
    dictionary[3] = c
    w = result = c
    while (true) {
      if (data.index > data.string.length) {
        return ''
      }

      bits = 0
      maxpower = Math.pow(2, numBits)
      power = 1
      while (power !== maxpower) {
        resb = data.val & data.position
        data.position >>= 1
        if (data.position === 0) {
          data.position = 32768
          data.val = data.string.charCodeAt(data.index++)
        }
        bits |= (resb > 0 ? 1 : 0) * power
        power <<= 1
      }

      switch (c = bits) {
        case 0:
          bits = 0
          maxpower = Math.pow(2, 8)
          power = 1
          while (power !== maxpower) {
            resb = data.val & data.position
            data.position >>= 1
            if (data.position === 0) {
              data.position = 32768
              data.val = data.string.charCodeAt(data.index++)
            }
            bits |= (resb > 0 ? 1 : 0) * power
            power <<= 1
          }

          dictionary[dictSize++] = f(bits)
          c = dictSize - 1
          enlargeIn--
          break
        case 1:
          bits = 0
          maxpower = Math.pow(2, 16)
          power = 1
          while (power !== maxpower) {
            resb = data.val & data.position
            data.position >>= 1
            if (data.position === 0) {
              data.position = 32768
              data.val = data.string.charCodeAt(data.index++)
            }
            bits |= (resb > 0 ? 1 : 0) * power
            power <<= 1
          }
          dictionary[dictSize++] = f(bits)
          c = dictSize - 1
          enlargeIn--
          break
        case 2:
          return result
      }

      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits)
        numBits++
      }

      if (dictionary[c]) {
        entry = dictionary[c]
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0)
        } else {
          return null
        }
      }
      result += entry

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0)
      enlargeIn--

      w = entry

      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits)
        numBits++
      }
    }
  }

}
