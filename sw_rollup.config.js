import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import { version } from './package.json'
import sourcemaps from 'rollup-plugin-sourcemaps'

export default {
  input: 'sw_webpush.js',
  output: [
    {
      name: 'sw_webpush',
      file: 'sw_webpush.min.js',
      format: 'umd',
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    sourcemaps(),
    eslint({
      fix: true,
      throwOnError: true
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
