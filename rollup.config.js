import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import json from 'rollup-plugin-json';
import string from 'rollup-plugin-string';
import typescript from 'rollup-plugin-typescript2';

const plugins = [
  builtins({ fs: true }),
  resolve({ main: true, browser: true, jsnext: true}),
  commonjs({
    exclude: ['node_modules/rollup-plugin-node-globals/**'],
  }),
  globals(),
  json(),
  string({
    include: '**/*.glsl'
  }),
  typescript({
    tsconfigOverride: {
      compilerOptions: {
        'target': 'ES2015',
        'strictNullChecks': true,
        'noImplicitAny': true,
        'noImplicitReturns': true,
        'experimentalDecorators': true,
        'noUnusedLocals': true,
        'esModuleInterop': true,
        'allowSyntheticDefaultImports': true,
      }
    }
  }),
];

export default {
  input: 'index.js',
  output: {
    file: 'build/build.js',
    format: 'cjs',
  },
  plugins,
};
