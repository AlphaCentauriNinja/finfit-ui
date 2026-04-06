import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/vitest.setup.ts'],
    include: ['tests/**/*.vitest.test.ts', 'tests/**/*.vitest.test.tsx'],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
