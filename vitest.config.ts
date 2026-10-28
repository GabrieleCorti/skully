import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
    // Process CSS Modules so `styles.bone` etc. (src/bones/skully.module.css) are real class names in tests
    // (by default Vitest stubs them to `{}`). 'non-scoped' keeps them stable and unhashed.
    // `?raw` must match too, or Vitest replaces the raw source (read by the stylesheet contract
    // test, src/bones/skully.module.test.ts) with an empty class-name proxy.
    css: {
      include: /\.module\.css(\?raw)?$/,
      modules: { classNameStrategy: 'non-scoped' },
    },
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.{ts,tsx}'],
    },
  },
})
