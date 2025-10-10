import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const cwd = process.cwd()
const packagesDir = resolve(cwd, 'packages')

if (!existsSync(packagesDir)) {
  mkdirSync(packagesDir)
}

const newPackagesDir = resolve(packagesDir, 'new-package')
mkdirSync(newPackagesDir)
mkdirSync(resolve(newPackagesDir, 'src'))

writeFileSync(
  resolve(newPackagesDir, 'package.json'),
  JSON.stringify(createPackageJson(), null, 2),
)
writeFileSync(resolve(newPackagesDir, 'tsup.config.ts'), createTsupConfigTs())

console.log('创建成功')

function createPackageJson() {
  return {
    name: 'new-package',
    version: '1.0.0',
    description: '',
    keywords: [],
    author: '',
    license: 'ISC',
    packageManager: 'pnpm@10.13.1',
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org',
    },
    type: 'module',
    exports: {
      '.': {
        import: './dist/index.js',
        types: './dist/index.d.ts',
      },
    },
    scripts: {
      dev: 'tsup --watch',
      build: 'tsup',
      clean: 'rm -rf node_modules',
      test: 'vitest',
      'test:ui': 'vitest --ui',
      'test:run': 'vitest run',
    },
    dependencies: {},
    devDependencies: {},
  }
}

function createTsupConfigTs() {
  return `import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: true,
})`
}
