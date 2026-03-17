import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { eslint } from 'rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import { version } from './package.json'
import sourcemaps from 'rollup-plugin-sourcemaps'
import commonjs from '@rollup/plugin-commonjs'

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

  const baseOutput = {
    name: 'clevertap',
    sourcemap: true,
    plugins: [terser()]
  }

  return [
    {
      name: 'clevertap',
      file: 'clevertap.js',
      format: 'umd',
      sourcemap: true
    },
    {
      name: 'clevertap',
      file: 'clevertap.min.js',
      format: 'umd',
      plugins: [terser()]
    },
    {
      ...baseOutput,
      file: './dist/clevertap_cjs.min.js',
      format: 'cjs',
      exports: 'auto'
    },
    {
      ...baseOutput,
      file: './dist/clevertap_es.min.js',
      format: 'es'
    },
    {
      ...baseOutput,
      file: './dist/clevertap_amd.min.js',
      format: 'amd'
    },
    {
      ...baseOutput,
      file: './dist/clevertap_iife.min.js',
      format: 'iife'
    },
    {
      ...baseOutput,
      file: './dist/clevertap_system.min.js',
      format: 'system'
    }
  ]
}

/**
 * returns the plugins array
 * @param {('SERVICE_WORKER' | 'WEB')} mode
 */
const getPlugins = (mode) => {
  return [
    resolve(),
    mode === 'WEB' && commonjs(),
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
    plugins: getPlugins(mode)
  }
}

export default config()
