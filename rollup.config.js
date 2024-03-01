import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import { version } from './package.json'
import sourcemaps from 'rollup-plugin-sourcemaps'
import removeHtmlElements from './rollup-plugin-remove-html-elements'

/**
 * Returns the input file path
 * @param {('SERVICE_WORKER' | 'WEB' | 'SHOPIFY')} mode
 */
const getInput = (mode) => {
  if (mode === 'SERVICE_WORKER') {
    return 'sw_webpush.js'
  }

  return 'src/main.js'
}

/**
 * returns the output object of the build config
 * @param {('SERVICE_WORKER' | 'WEB' | 'SHOPIFY')} mode
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
  ]
}

/**
 * returns the plugins array
 * @param {('SERVICE_WORKER' | 'WEB' | 'SHOPIFY')} mode
 */
const getPlugins = (mode) => {
  const plugins = []

  if (mode === 'SHOPIFY') {
    plugins.push(removeHtmlElements())
  }

  return [
    ...plugins,
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

const config = () => {
  const mode = process.env.MODE

  return {
    input: getInput(mode),
    output: getOutput(mode),
    plugins: getPlugins()
  }
}

export default config()
