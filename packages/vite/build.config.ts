import { defineBuildConfig } from 'unbuild'
import { unbuildConfig } from '../../build.config'

export default defineBuildConfig({
  ...unbuildConfig,
  externals: ['vite', '@g-signal/macro'],
})
