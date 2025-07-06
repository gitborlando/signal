import { transformDollarValue } from '@g-signal/macro'
import type { Plugin } from 'vite'

/**
 * G-Signal 宏转换插件配置
 */
export interface MacroPluginOptions {
  framework?: 'react' | 'vue' // 框架类型
  /**
   * 排除的文件模式
   * @default [/node_modules/, /\.d\.ts$/]
   */
  exclude?: RegExp[]

  /**
   * 包含的文件模式
   * @default undefined (处理所有匹配扩展名的文件)
   */
  include?: RegExp[]

  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean
}

/**
 * 默认配置
 */
const defaultOptions: Required<MacroPluginOptions> = {
  exclude: [/node_modules/, /\.d\.ts$/],
  include: [],
  debug: false, // 是否启用调试模式
  framework: 'react',
}

/**
 * 检查文件是否应该被处理
 */
function shouldTransform(
  id: string,
  options: Required<MacroPluginOptions>,
): boolean {
  const isTsxOrJsx = id.endsWith('.tsx') || id.endsWith('.jsx')
  if (!isTsxOrJsx) {
    return false
  }

  // 检查排除模式
  const isExcluded = options.exclude.some((pattern) => pattern.test(id))
  if (isExcluded) {
    return false
  }

  // 检查包含模式
  if (options.include.length > 0) {
    const isIncluded = options.include.some((pattern) => pattern.test(id))
    if (!isIncluded) {
      return false
    }
  }

  return true
}

/**
 * G-Signal 宏转换 Vite 插件
 */
export function gSignalMacroPlugin(options: MacroPluginOptions = {}): Plugin {
  const resolvedOptions = { ...defaultOptions, ...options }

  return {
    name: 'vite-plugin-g-signal-macro',
    enforce: 'pre', // 在其他转换之前执行

    transform(code: string, id: string) {
      // 检查是否应该处理此文件
      if (!shouldTransform(id, resolvedOptions)) {
        return null
      }

      try {
        // 应用宏转换
        const transformedCode = transformDollarValue(code)

        // 如果代码没有变化，返回null
        if (transformedCode === code) {
          return null
        }

        // 调试模式输出
        if (resolvedOptions.debug) {
          console.log(`[g-signal-macro] 转换文件: ${id}`)
          console.log('原始代码:')
          console.log(code)
          console.log('转换后代码:')
          console.log(transformedCode)
          console.log('---')
        }

        return {
          code: transformedCode,
          map: null, // 暂不提供source map
        }
      } catch (error) {
        // 转换失败时记录错误但不中断构建
        console.error(`[g-signal-macro] 转换失败 ${id}:`, error)
        return null
      }
    },

    // 在开发模式下处理热更新
    handleHotUpdate() {
      // 如果文件包含宏语法，强制重新加载
      // if (shouldTransform(ctx.file, resolvedOptions) && hasMacroSyntax(ctx.read())) {
      //   ctx.server.reloadModule(ctx.modules[0])
      // }
    },
  }
}

// 导出默认插件实例
export default gSignalMacroPlugin
