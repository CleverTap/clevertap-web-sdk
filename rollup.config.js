import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import eslint from '@rollup/plugin-eslint'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/main.js',
  output: [
    {
      name: 'clevertap',
      file: 'clevertap.js',
      format: 'umd'
    },
    {
      name: 'clevertap',
      file: 'clevertap.min.js',
      format: 'umd',
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    eslint({
      fix: true,
      throwOnError: true
    }),
    babel({
      babelHelpers: 'bundled'
    })
  ]
}
