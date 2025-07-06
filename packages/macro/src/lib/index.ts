import * as ts from 'typescript'
import { createEnhancedAssignTransformer } from './assign'
import { createHookTransformer } from './call'
import { createDeclareTransformer } from './declare'
import { createDollarValueTransformer } from './dot-value'

export let suffix = '$'

export type TransformDollarValueOptions = {
  suffix?: '$' | '$$' | '_$' | '_' | '__'
}

export function transformDollarValue(
  code: string,
  options: TransformDollarValueOptions = {},
): string {
  suffix = options.suffix || '$'

  const sourceFile = ts.createSourceFile(
    'input.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
  )

  // 执行转换的正确顺序：
  // 1. 信号声明转换 (let count$ = 0 -> const count$ = useSignal(0))
  // 2. 赋值转换 (count$ = value -> count$.dispatch(value))
  // 3. dispatch 转换 (dispatch$(...) -> signal.dispatch(...))
  // 4. 函数调用转换 (watch$(...) -> signal.hook(...))
  // 5. 属性访问转换 (count$ -> useHookSignal(count$))
  const result = ts.transform(sourceFile, [
    createDeclareTransformer(),
    createEnhancedAssignTransformer(),
    createHookTransformer(),
    createDollarValueTransformer(),
  ])

  const transformedSourceFile = result.transformed[0]
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  const transformedCode = printer.printFile(transformedSourceFile)
  result.dispose()
  return transformedCode
}
