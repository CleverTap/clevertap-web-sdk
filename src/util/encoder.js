/* eslint-disable */
export const urlBase64ToUint8Array = (base64String) => {
  let padding = '='.repeat((4 - base64String.length % 4) % 4)
  let base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

  let rawData = window.atob(base64)
  let processedData = []
  for (let i=0; i<rawData.length; i++) {
    processedData.push(rawData.charCodeAt(i))
  }
  return new Uint8Array(processedData)
}

export const compressData = (dataObject) => {
  // console.debug('dobj:' + dataObject);
  return compressToBase64(dataObject)
}

export const compress = (uncompressed) => {
  if (uncompressed == null) return ''
  let i, value,
      context_dictionary = {},
      context_dictionaryToCreate = {},
      context_c = '',
      context_wc = '',
      context_w = '',
      context_enlargeIn = 2, // Compensate for the first entry which should not count
      context_dictSize = 3,
      context_numBits = 2,
      context_data_string = '',
      context_data_val = 0,
      context_data_position = 0,
      ii,
      f = String.fromCharCode

  for (ii = 0; ii < uncompressed.length; ii += 1) {
    context_c = uncompressed.charAt(ii)
    if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
      context_dictionary[context_c] = context_dictSize++
      context_dictionaryToCreate[context_c] = true
    }

    context_wc = context_w + context_c
    if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
      context_w = context_wc
    } else {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1)
            if (context_data_position == 15) {
              context_data_position = 0
              context_data_string += f(context_data_val)
              context_data_val = 0
            } else {
              context_data_position++
            }
          }
          value = context_w.charCodeAt(0)
          for (i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1)
            if (context_data_position == 15) {
              context_data_position = 0
              context_data_string += f(context_data_val)
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = value >> 1
          }
        } else {
          value = 1
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value
            if (context_data_position == 15) {
              context_data_position = 0
              context_data_string += f(context_data_val)
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = 0
          }
          value = context_w.charCodeAt(0)
          for (i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1)
            if (context_data_position == 15) {
              context_data_position = 0
              context_data_string += f(context_data_val)
              context_data_val = 0
            } else {
              context_data_position++
            }
            value = value >> 1
          }
        }
        context_enlargeIn--
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits)
          context_numBits++
        }
        delete context_dictionaryToCreate[context_w]
      } else {
        value = context_dictionary[context_w];
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1)
          if (context_data_position == 15) {
            context_data_position = 0;
            context_data_string += f(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
          value = value >> 1
        }


      }
      context_enlargeIn--
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits)
        context_numBits++
      }
      // Add wc to the dictionary.
      context_dictionary[context_wc] = context_dictSize++
      context_w = String(context_c)
    }
  }

  // Output the code for w.
  if (context_w !== '') {
    if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
      if (context_w.charCodeAt(0) < 256) {
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1)
          if (context_data_position == 15) {
            context_data_position = 0
            context_data_string += f(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
        }
        value = context_w.charCodeAt(0)
        for (i = 0; i < 8; i++) {
          context_data_val = (context_data_val << 1) | (value & 1)
          if (context_data_position == 15) {
            context_data_position = 0
            context_data_string += f(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
          value = value >> 1
        }
      } else {
        value = 1
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | value
          if (context_data_position == 15) {
            context_data_position = 0
            context_data_string += f(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
          value = 0
        }
        value = context_w.charCodeAt(0);
        for (i = 0; i < 16; i++) {
          context_data_val = (context_data_val << 1) | (value & 1)
          if (context_data_position == 15) {
            context_data_position = 0
            context_data_string += f(context_data_val)
            context_data_val = 0
          } else {
            context_data_position++
          }
          value = value >> 1
        }
      }
      context_enlargeIn--
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits)
        context_numBits++
      }
      delete context_dictionaryToCreate[context_w]
    } else {
      value = context_dictionary[context_w]
      for (i = 0; i < context_numBits; i++) {
        context_data_val = (context_data_val << 1) | (value & 1)
        if (context_data_position == 15) {
          context_data_position = 0
          context_data_string += f(context_data_val)
          context_data_val = 0
        } else {
          context_data_position++
        }
        value = value >> 1
      }


    }
    context_enlargeIn--
    if (context_enlargeIn == 0) {
      context_enlargeIn = Math.pow(2, context_numBits)
      context_numBits++
    }
  }

  // Mark the end of the stream
  value = 2
  for (i = 0; i < context_numBits; i++) {
    context_data_val = (context_data_val << 1) | (value & 1)
    if (context_data_position == 15) {
      context_data_position = 0
      context_data_string += f(context_data_val)
      context_data_val = 0
    } else {
      context_data_position++
    }
    value = value >> 1
  }

  // Flush the last char
  while (true) {
    context_data_val = (context_data_val << 1)
    if (context_data_position == 15) {
      context_data_string += f(context_data_val)
      break
    } else context_data_position++
  }
  return context_data_string
}

export const getKeyStr = () => {
  let key = ''
  let i = 0

  for (i = 0; i <= 25; i++) {
    key = key + String.fromCharCode(i + 65)
  }

  for (i = 0; i <= 25; i++) {
    key = key + String.fromCharCode(i + 97)
  }

  for (i = 0; i < 10; i++) {
    key = key + i
  }

  return key + '+/='
}

const _keyStr = getKeyStr()

export const convertToFormattedHex = (byte_arr) => {
  let hex_str = '',
      i,
      len,
      tmp_hex

  if (!Array.isArray(byte_arr)) {
    return false
  }

  len = byte_arr.length

  for (i = 0; i < len; ++i) {
    if (byte_arr[i] < 0) {
      byte_arr[i] = byte_arr[i] + 256
    }
    if (byte_arr[i] === undefined) {
      byte_arr[i] = 0
    }
    tmp_hex = byte_arr[i].toString(16)

    if (tmp_hex.length == 1) tmp_hex = '0' + tmp_hex // Add leading zero.

    //        beautification - needed if you're printing this in the console, else keep commented
    //        if ((i + 1) % 16 === 0) {
    //          tmp_hex += "\n";
    //        } else {
    //          tmp_hex += " ";
    //        }

    hex_str += tmp_hex
  }

  return hex_str.trim()
}

export const convertStringToHex = (s) => {
  let byte_arr = []
  for (let i = 0; i < s.length; i++) {
    let value = s.charCodeAt(i)
    byte_arr.push(value & 255)
    byte_arr.push((value >> 8) & 255)
  }
  return convertToFormattedHex(byte_arr)
}

export const compressToBase64 = (input) => {
  if (input == null) return ''
  var output = ''
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4
  var i = 0

  input = compress(input)

  while (i < input.length * 2) {

    if (i % 2 == 0) {
      chr1 = input.charCodeAt(i / 2) >> 8
      chr2 = input.charCodeAt(i / 2) & 255
      if (i / 2 + 1 < input.length)
        chr3 = input.charCodeAt(i / 2 + 1) >> 8
      else
        chr3 = NaN
    } else {
      chr1 = input.charCodeAt((i - 1) / 2) & 255
      if ((i + 1) / 2 < input.length) {
        chr2 = input.charCodeAt((i + 1) / 2) >> 8
        chr3 = input.charCodeAt((i + 1) / 2) & 255
      } else
        chr2 = chr3 = NaN
    }
    i += 3

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63

    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }

    output = output +
      _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
      _keyStr.charAt(enc3) + _keyStr.charAt(enc4)

  }

  return output
}
