import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/main.js',
  output: {
    name: 'clevertap',
    file: 'clevertap.js',
    format: 'umd'
  },
  plugins: [
    resolve(),
    babel({
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false
          }
        ]
      ],
      plugins: [],
      babelrc: false
    })
  ]
}
