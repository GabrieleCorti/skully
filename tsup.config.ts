import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts', bones: 'src/bones/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  // esbuild preserves the 'use client' directive of src/index.ts;
  // scripts/check-directive.mjs fails the build if that ever changes.
  external: ['react'],
  // tsup's CSS plugin uses this loader for every .css file. The library's only stylesheet
  // is src/bones/skully.module.css, so compile it as a CSS Module. esbuild prefixes names
  // with the file name (skully_bone, skully_shimmer…); the output is still dist/bones.css.
  loader: { '.css': 'local-css' },
})
