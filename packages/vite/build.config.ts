import { defineBuildConfig } from 'unbuild'
import { unbuildConfig } from '../../tsup.config'

export default defineBuildConfig({
  ...unbuildConfig,
  externals: ['vite', '@g-signal/macro'],
})
