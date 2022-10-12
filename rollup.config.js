import tsc from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'src/index.ts',
    plugins: [tsc()],
    output: [
      {
        file: 'dist/bundle.cjs',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/bundle.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/bundle.min.js',
        format: 'umd',
        name: 'tilebeltWgs84',
        sourcemap: true,
        plugins: [terser()]
      }
    ]
  }
]