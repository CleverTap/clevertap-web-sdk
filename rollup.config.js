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

  if (mode === 'WEB_LEGACY') {
    return [
      {
        ...baseOutput,
        file: './dist/clevertap_legacy.min.js',
        format: 'umd',
        sourcemap: true
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
 * @param {('SERVICE_WORKER' | 'WEB')} mode
 */
const getPlugins = (mode) => {
  return [
    mode === "WEB_LEGACY"
      ? resolve({
          browser: true,
          preferBuiltins: false, // ✅ Prevents Rollup from using Node.js built-ins
          mainFields: ["module", "main"], // ✅ Ensures CommonJS resolution before ESM
          extensions: [".mjs", ".js", ".json", ".ts"],
        })
      : resolve(),
    mode === 'WEB' && commonjs(),
    sourcemaps(),
    eslint({
      fix: true,
      throwOnError: true,
    }),
    replace({
      preventAssignment: true,
      delimiters: ["", ""],
      $$PACKAGE_VERSION$$: version,
      values: {
          'process.env.NODE_ENV': JSON.stringify('production'), // ✅ Replace with actual values
          'process.env.SOME_VAR': JSON.stringify('custom_value'), // ✅ Add more if needed
      },
    }),

    mode === "WEB_LEGACY" &&
      commonjs({
        include: /node_modules/,
        transformMixedEsModules: true, // ✅ Allows Rollup to handle ESM & CJS in node_modules
        requireReturnsDefault: "auto", // ✅ Helps with default imports from CJS
      }),

    babel(
      mode === "WEB_LEGACY"
        ? {
            babelHelpers: "runtime",
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: "chrome 39, safari 10",
                  useBuiltIns: "entry",
                  corejs: 3,
                  modules: false,
                },
              ],
            ],
            // order does not change must be important
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-proposal-private-methods",
              "@babel/plugin-transform-classes",
              ["@babel/plugin-transform-runtime", { useESModules: true }],
              "@babel/plugin-transform-optional-chaining",
            ],
            include: ["node_modules/**", "src/**"],
            exclude: [],
            babelrc: false,
            configFile: false, // Ensure Babel doesn't load any external config
          }
        : { babelHelpers: "bundled" },
    ),
  ];
};

const config = () => {
  const mode = process.env.MODE

  return {
    input: getInput(mode),
    output: getOutput(mode),
    plugins: getPlugins(mode)
  }
}

export default config()
