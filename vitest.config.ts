import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'src/**/*.{test,spec}.{js,ts,tsx}',
      'tests/**/*.{test,spec}.{js,ts,tsx}',
      'packages/*/src/__test__/**/*.{test,spec}.{js,ts,tsx}',
      'packages/*/src/**/*.{test,spec}.{js,ts,tsx}',
    ],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'build/**',
        '**/*.d.ts',
        '**/*.config.*',
        'tests/**',
        'src/**/*.test.*',
        'src/**/*.spec.*',
      ],
    },
  },
})
