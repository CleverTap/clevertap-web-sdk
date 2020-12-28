module.exports = {
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/plugin-proposal-private-methods', { loose: true }]
      ]
    }
  },
  ignorePatterns: ['/clevertap.js', '/clevertap.min.js'],
  rules: {
    'no-prototype-builtins': 'off',
    'no-useless-escape': 'off', // should probably remove this?,
    'eqeqeq': [2, 'smart']
  },
  parser: '@babel/eslint-parser'
}
