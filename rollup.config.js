import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace'
import eslint from '@rollup/plugin-eslint';
import { terser } from 'rollup-plugin-terser'
import { version } from './package.json'
import sourcemaps from 'rollup-plugin-sourcemaps'

export default {
  input: {
    clevertapSDK: 'src/main.js',
    clevertapOverlay: 'src/react/index.js'
  },
  output: [
    {
      dir: 'dist',
      sourcemap: true,
      plugins: [terser()]
    },
  ],
  plugins: [
    resolve(),
    sourcemaps(),
    babel({
      babelHelpers: 'bundled',
    }),
    eslint({
      fix: true,
      throwOnError: true,
      exclude: ['src/react/**']
    }),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
      delimiters: ['', ''],
      $$PACKAGE_VERSION$$: version
    }),
  ]
}
