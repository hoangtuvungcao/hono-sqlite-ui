import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  shims: true,
  minify: false,
  external: ['bun:sqlite', 'better-sqlite3', 'node:sqlite'],
});
