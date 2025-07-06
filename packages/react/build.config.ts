import { defineBuildConfig } from 'unbuild'
import { unbuildConfig } from '../../build.config'

export default defineBuildConfig({
  ...unbuildConfig,
  externals: ['react', 'g-signal'],
})
