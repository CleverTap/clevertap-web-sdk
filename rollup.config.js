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
const getInput = (mode) => (mode === 'SERVICE_WORKER' ? 'sw_webpush.js' : 'src/main.js')

/**
 * returns the output object of the build config
 * @param {('SERVICE_WORKER' | 'WEB')} mode
 */
const getOutput = (mode) => {
  const baseOutput = {
    name: 'clevertap',
    plugins: [terser()]
  }

  if (mode === 'SERVICE_WORKER') {
    return [
      {
        ...baseOutput,
        name: 'sw_webpush',
        file: 'sw_webpush.min.js',
        format: 'umd'
      }
    ]
  }

  const outputs = [
    {
      ...baseOutput,
      file: './dist/clevertap.js',
      format: 'umd',
      sourcemap: true
    },
    {
      ...baseOutput,
      file: './dist/clevertap.min.js',
      format: 'umd',
      exports: 'auto'
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

  return outputs
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
