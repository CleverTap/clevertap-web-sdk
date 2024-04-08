import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import { version } from './package.json'
import sourcemaps from 'rollup-plugin-sourcemaps'

/**
 * Returns the input file path
 * @param {('SERVICE_WORKER' | 'WEB')} mode
 */
const getInput = (mode) => {
  if (mode === 'SERVICE_WORKER') {
    return 'sw_webpush.js'
  }

  return 'src/main.js'
}

/**
 * returns the output object of the build config
 * @param {('SERVICE_WORKER' | 'WEB')} mode
 */
const getOutput = (mode) => {
  if (mode === 'SERVICE_WORKER') {
    return [
      {
        name: 'sw_webpush',
        file: 'sw_webpush.min.js',
        format: 'umd',
        plugins: [terser()]
      }
    ]
  }

  return [
    {
      name: 'clevertap',
      file: './dist/clevertap.js',
      format: 'umd',
      sourcemap: true
    },
    {
      name: 'clevertap',
      file: './dist/clevertap.min.js',
      format: 'umd', // Universal Module Definition, works as amd, cjs and iife all in one
      plugins: [terser()]
    },
    {
      name: 'clevertap',
      file: './dist/clevertap_cjs.js',
      format: 'cjs', // CommonJS, suitable for Node and other bundlers
      exports: 'auto',
      plugins: [terser()]
    },
    {
      name: 'clevertap',
      file: './dist/clevertap_es.js',
      format: 'es',
      exports: 'auto',
      plugins: [terser()]
    },
    {
      name: 'clevertap',
      file: './dist/clevertap_amd.js', // Asynchronous Module Definition, used with module loaders like RequireJS
      format: 'amd',
      exports: 'auto',
      plugins: [terser()]
    },
    {
      name: 'clevertap',
      file: './dist/clevertap_iife.js', // A self-executing function, suitable for inclusion as a <script> tag.
      format: 'iife',
      exports: 'auto',
      plugins: [terser()]
    }
  ]
}

/**
 * returns the plugins array
 */
const getPlugins = () => {
  return [
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

const config = () => {
  const mode = process.env.MODE

  return {
    input: getInput(mode),
    output: getOutput(mode),
    plugins: getPlugins()
  }
}

export default config()
