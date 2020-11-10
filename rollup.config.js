import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import { eslint } from 'rollup-plugin-eslint'

export default {
  input: 'src/main.js',
  output: {
    name: 'clevertap',
    file: 'clevertap.js',
    format: 'umd'
  },
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
