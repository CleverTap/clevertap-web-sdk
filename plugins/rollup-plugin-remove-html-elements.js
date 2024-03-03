// rollup-plugin-remove-html-elements.js

/**
 * Removes HtmlElements from final build
 * @returns {import('rollup').Plugin}
 */
export default function removeHtmlElements () {
  return {
    name: 'removeHtmlElements',

    transform (code) {
      let className
      // Use a simple regex to check if the file extends HTMLElement
      const extendsHtmlElement = /\bclass\s+\w+\s+extends\s+HTMLElement\b/.test(code)

      if (extendsHtmlElement) {
        const match = code.match(/class\s+(\w+)\s+extends\s+HTMLElement/)

        if (match && match[1]) {
          className = match[1]
        } else {
          console.log('Class name not found.')
        }

        return {
          code: `export class ${className} {};`,
          map: { mappings: '' } // To preserve sourcemap
        }
      }

      return {
        code,
        map: { mappings: '' } // To preserve sourcemap
      }
    }
  }
}
