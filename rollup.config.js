import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import { version } from './package.json'
import sourcemaps from 'rollup-plugin-sourcemaps'
import removeHtmlElements from './rollup-plugin-remove-html-elements'

export default {
  input: 'src/main.js',
  output: [
    {
      name: 'clevertap',
      file: 'clevertap.js',
      format: 'iife',
      sourcemap: true
    },
    {
      name: 'clevertap',
      file: 'clevertap.min.js',
      format: 'umd',
      plugins: [terser()]
    }
  ],
  plugins: [
    removeHtmlElements(),
    resolve(),
    sourcemaps(),
    eslint({
      fix: true,
      throwOnError: false
    }),
    replace({
      preventAssignment: true,
      delimiters: ['', ''],
      $$PACKAGE_VERSION$$: version
    }),
    babel({
      babelHelpers: 'bundled'
    })
  ]
}
