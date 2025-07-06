import { copyFileSync } from 'node:fs'
import { join } from 'path'
import { defineBuildConfig } from 'unbuild'
import { unbuildConfig } from '../../build.config'

export default defineBuildConfig({
  ...unbuildConfig,
  entries: ['src/lib/index.ts'],
  externals: ['typescript'],
  hooks: {
    'build:done': () => {
      copyFileSync(
        join(__dirname, 'src/macro.d.ts'),
        join(__dirname, 'dist/macro.d.ts'),
      )
    },
  },
})
