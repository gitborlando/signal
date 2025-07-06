import * as ts from 'typescript'
import { suffix } from './index'

const propertyCallApis = new Set(['hook', 'dispatch'])
const functionCallApis = new Set([
  'useHookSignal',
  'useSignal',
  'mergeSignal',
  'batchSignal',
])
const calledPropertyApis = new Set<string>()
const calledFunctionApis = new Set<string>()

const importMap = {
  useHookSignal: '@g-signal/react',
  useSignal: '@g-signal/react',
  mergeSignal: 'g-signal',
  batchSignal: 'g-signal',
}

const getNoSuffixApiName = (apiName: string) => {
  const suffixLength = suffix.length
  return apiName.slice(0, -suffixLength)
}

function shouldTransformCall(node: ts.CallExpression) {
  if (!ts.isIdentifier(node.expression)) return

  const noSuffixApiName = getNoSuffixApiName(node.expression.text)

  if (
    !propertyCallApis.has(noSuffixApiName) &&
    !functionCallApis.has(noSuffixApiName)
  ) {
    return
  }

  const signal = node.arguments[0]
  if (!ts.isIdentifier(signal) || !signal.text.endsWith(suffix)) {
    return
  }

  if (propertyCallApis.has(noSuffixApiName)) {
    calledPropertyApis.add(noSuffixApiName)
  } else {
    calledFunctionApis.add(noSuffixApiName)
  }

  return noSuffixApiName
}

/**
 * 添加 React hook 导入语句
 */
function addImports(sourceFile: ts.SourceFile): ts.SourceFile {
  const neededImports: string[] = [...calledFunctionApis]

  // 如果不需要添加任何导入，直接返回
  if (neededImports.length === 0) {
    return sourceFile
  }

  const statements = [...sourceFile.statements]

  for (const api of neededImports) {
    let existingImportIndex = -1
    for (let i = 0; i < sourceFile.statements.length; i++) {
      const statement = sourceFile.statements[i]
      if (ts.isImportDeclaration(statement)) {
        const moduleSpecifier = statement.moduleSpecifier
        if (
          ts.isStringLiteral(moduleSpecifier) &&
          moduleSpecifier.text === importMap[api as keyof typeof importMap]
        ) {
          existingImportIndex = i
          break
        }
      }
    }

    if (existingImportIndex >= 0) {
      // 更新现有的导入
      const existingImport = sourceFile.statements[
        existingImportIndex
      ] as ts.ImportDeclaration
      const existingImports = existingImport.importClause?.namedBindings

      if (existingImports && ts.isNamedImports(existingImports)) {
        // 添加新的导入到现有导入中
        const newImportSpecifiers = neededImports.map((name) =>
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(name),
          ),
        )

        const updatedImports = ts.factory.createNamedImports([
          ...existingImports.elements,
          ...newImportSpecifiers,
        ])

        const updatedImportClause = ts.factory.updateImportClause(
          existingImport.importClause!,
          false,
          existingImport.importClause!.name,
          updatedImports,
        )

        const updatedImportDeclaration = ts.factory.updateImportDeclaration(
          existingImport,
          existingImport.modifiers,
          updatedImportClause,
          existingImport.moduleSpecifier,
          existingImport.assertClause,
        )

        const newStatements = [...sourceFile.statements]
        newStatements[existingImportIndex] = updatedImportDeclaration

        return ts.factory.updateSourceFile(sourceFile, newStatements)
      }
    }

    // 创建新的导入语句
    const importDeclaration = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(api),
          ),
        ]),
      ),
      ts.factory.createStringLiteral(importMap[api as keyof typeof importMap]),
    )

    statements.unshift(importDeclaration)
  }

  return ts.factory.updateSourceFile(sourceFile, statements)
}

/**
 * 创建 hook$ 函数转换器
 */
export function createHookTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      calledPropertyApis.clear()
      calledFunctionApis.clear()

      const visit = (node: ts.Node): ts.Node => {
        if (!ts.isCallExpression(node)) {
          return ts.visitEachChild(node, visit, context)
        }

        const apiName = shouldTransformCall(node)
        if (!apiName) {
          return ts.visitEachChild(node, visit, context)
        }

        const [signal, ...restArgs] = node.arguments

        if (calledFunctionApis.has(apiName)) {
          return ts.factory.createCallExpression(
            ts.factory.createIdentifier(apiName),
            undefined,
            [signal, ...restArgs],
          )
        }

        return ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            signal,
            ts.factory.createIdentifier(apiName),
          ),
          undefined,
          restArgs,
        )
      }

      // 转换节点
      const transformedSourceFile = ts.visitNode(sourceFile, visit) as ts.SourceFile

      if (calledFunctionApis.size > 0) {
        return addImports(transformedSourceFile)
      }

      return transformedSourceFile
    }
  }
}
