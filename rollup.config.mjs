import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/stl-parser.ts',
  output: {
    file: 'dist/stl-parser.js',
    format: 'umd',
    name: 'STLParserLib',
    sourcemap: true,
  },
  plugins: [
    typescript(),
  ],
};