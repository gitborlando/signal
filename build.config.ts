import { BuildConfig } from 'unbuild'

export const unbuildConfig: BuildConfig = {
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: false,
    inlineDependencies: true,
  },
  failOnWarn: false,
}
