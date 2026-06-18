import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts'],
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  external: ['react'],
})
