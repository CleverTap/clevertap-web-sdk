
/**
 * adds browser to the final iife generated
 * @returns {import('rollup').Plugin}
 */
export default function addBrowserToIife () {
  return {
    name: 'addBrowserToIife',

    renderChunk (code) {
      let modifiedCode = code.replace(/(var\s+clevertap\s*=\s*\(\s*function\s*\(\s*)\)/, '$1browser)')
      modifiedCode = modifiedCode.replace(/\}\(\)\);/, '}(browser));')

      return {
        code: modifiedCode,
        map: { mappings: '' }
      }
    }
  }
}
