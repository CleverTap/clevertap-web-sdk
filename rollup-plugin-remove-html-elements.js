// rollup-plugin-remove-html-elements.js
import { createFilter } from 'rollup-pluginutils';

export default function removeHtmlElements() {

  return {
    name: 'removeHtmlElements',

    transform(code, id) {
      let className;
      // Use a simple regex to check if the file extends HTMLElement
      const extendsHtmlElement = /\bclass\s+\w+\s+extends\s+HTMLElement\b/.test(code);

      if (extendsHtmlElement) {
        const match = code.match(/class\s+(\w+)\s+extends\s+HTMLElement/);

        if (match && match[1]) {
          className = match[1];
          console.log(className); // Output: CTWebPersonalisationBanner
        } else {
          console.log('Class name not found.');
        }
        // If the file extends HTMLElement, return null to exclude it from the final build
        return {
          code: `export class ${className} {};`,
          map: { mappings: '' }, // To preserve sourcemap
        };
      }

      return {
        code,
        map: { mappings: '' }, // To preserve sourcemap
      };
    },
  };
}
