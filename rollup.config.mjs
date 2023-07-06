import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/stl-parser.ts',
  output: {
    file: 'bundle/stl-parser.min.js',
    format: 'umd',
    name: 'STLParserLib',
    sourcemap: true,
	plugins: [
		terser(),
	],
  },
  plugins: [
	resolve({
		browser: true,
	}),
    typescript({
		sourceMap: true,
		inlineSources: true,
		outDir: './bundle',
	}),
  ],
  external: ['fs'],
};