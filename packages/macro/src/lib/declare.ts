import * as ts from 'typescript'
import { suffix } from '.'
import { isNone } from '../utils'

let importAPIName: keyof typeof importMap = 'createSignal'
const importMap = {
  createSignal: 'g-signal',
  useSignal: '@g-signal/react',
} as const

let showAddImportStatement = false

/**
 * 检查变量声明是否应该被转换
 */
function shouldTransformSignalDeclaration(node: ts.VariableDeclaration): boolean {
  if (!ts.isIdentifier(node.name) || !node.name.text.endsWith(suffix)) {
    return false
  }

  if (node.initializer && ts.isCallExpression(node.initializer)) {
    const callee = node.initializer.expression
    if (
      ts.isIdentifier(callee) &&
      ['useSignal', 'createSignal'].includes(callee.text)
    ) {
      return false
    }
  }

  return true
}

function hasImport(sourceFile: ts.SourceFile): boolean {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue
    }

    const moduleSpecifier = statement.moduleSpecifier
    if (
      !(
        ts.isStringLiteral(moduleSpecifier) &&
        moduleSpecifier.text === importMap[importAPIName]
      )
    ) {
      continue
    }

    const importClause = statement.importClause
    if (!importClause || !importClause.namedBindings) {
      continue
    }

    if (!ts.isNamedImports(importClause.namedBindings)) {
      continue
    }

    for (const element of importClause.namedBindings.elements) {
      if (element.name.text === importAPIName) {
        return true
      }
    }
  }

  return false
}

/**
 * 添加 useSignal 导入语句
 */
function addImport(sourceFile: ts.SourceFile): ts.SourceFile {
  // 如果已经有导入，不需要添加
  if (hasImport(sourceFile)) {
    return sourceFile
  }

  let existingImportIndex = -1
  for (let i = 0; i < sourceFile.statements.length; i++) {
    const statement = sourceFile.statements[i]
    if (ts.isImportDeclaration(statement)) {
      const moduleSpecifier = statement.moduleSpecifier
      if (
        ts.isStringLiteral(moduleSpecifier) &&
        moduleSpecifier.text === importMap[importAPIName]
      ) {
        existingImportIndex = i
        break
      }
    }
  }

  if (existingImportIndex >= 0) {
    const existingImport = sourceFile.statements[
      existingImportIndex
    ] as ts.ImportDeclaration
    const existingImports = existingImport.importClause?.namedBindings

    if (existingImports && ts.isNamedImports(existingImports)) {
      const newImportSpecifier = ts.factory.createImportSpecifier(
        false,
        undefined,
        ts.factory.createIdentifier(importAPIName),
      )

      const updatedImports = ts.factory.createNamedImports([
        ...existingImports.elements,
        newImportSpecifier,
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

  const importDeclaration = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier(importAPIName),
        ),
      ]),
    ),
    ts.factory.createStringLiteral(importMap[importAPIName]),
  )

  const statements = [importDeclaration, ...sourceFile.statements]
  return ts.factory.updateSourceFile(sourceFile, statements)
}

/**
 * 检测是否在 React 组件或 Hook 内部
 */
function checkIsInsideReactScope(node: ts.Node): boolean {
  let current = node.parent

  // 向上遍历 AST 树，查找包含的函数
  while (current) {
    if (isReactFunction(current)) {
      return true
    }
    current = current.parent
  }

  return false
}

/**
 * 判断节点是否是 React 函数（组件或 Hook）
 */
function isReactFunction(node: ts.Node): boolean {
  // 检查函数声明
  if (ts.isFunctionDeclaration(node)) {
    return isReactFunctionByName(node.name?.text) || hasReactReturn(node)
  }

  // 检查箭头函数
  if (ts.isArrowFunction(node)) {
    return hasReactReturn(node) || isReactFunctionInVariableDeclaration(node)
  }

  // 检查函数表达式
  if (ts.isFunctionExpression(node)) {
    return isReactFunctionByName(node.name?.text) || hasReactReturn(node)
  }

  return false
}

/**
 * 根据函数名判断是否是 React 函数
 */
function isReactFunctionByName(name?: string): boolean {
  if (!name) return false

  // Hook 检测：以 'use' 开头且第4个字符是大写字母
  if (name.startsWith('use') && name.length > 3) {
    const fourthChar = name.charAt(3)
    return fourthChar === fourthChar.toUpperCase()
  }

  // 组件检测：首字母大写
  return name.charAt(0) === name.charAt(0).toUpperCase()
}

/**
 * 检查函数是否有 React 返回值（JSX）
 */
function hasReactReturn(
  func: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression,
): boolean {
  if (!func.body) return false

  // 箭头函数直接返回 JSX
  if (ts.isArrowFunction(func) && !ts.isBlock(func.body)) {
    return isJsxExpression(func.body)
  }

  // 检查函数体中的 return 语句
  if (ts.isBlock(func.body)) {
    return hasJsxReturn(func.body)
  }

  return false
}

/**
 * 检查代码块中是否有 JSX 返回语句
 */
function hasJsxReturn(block: ts.Block): boolean {
  for (const statement of block.statements) {
    if (ts.isReturnStatement(statement) && statement.expression) {
      if (isJsxExpression(statement.expression)) {
        return true
      }
    }

    // 递归检查嵌套的代码块
    if (ts.isBlock(statement)) {
      if (hasJsxReturn(statement)) {
        return true
      }
    }

    // 检查 if 语句等控制结构
    if (ts.isIfStatement(statement)) {
      if (statement.thenStatement && ts.isBlock(statement.thenStatement)) {
        if (hasJsxReturn(statement.thenStatement)) {
          return true
        }
      }
      if (statement.elseStatement && ts.isBlock(statement.elseStatement)) {
        if (hasJsxReturn(statement.elseStatement)) {
          return true
        }
      }
    }
  }

  return false
}

/**
 * 检查表达式是否是 JSX
 */
function isJsxExpression(expr: ts.Expression): boolean {
  return (
    ts.isJsxElement(expr) ||
    ts.isJsxSelfClosingElement(expr) ||
    ts.isJsxFragment(expr) ||
    // 检查条件表达式中的 JSX
    (ts.isConditionalExpression(expr) &&
      (isJsxExpression(expr.whenTrue) || isJsxExpression(expr.whenFalse))) ||
    // 检查逻辑表达式中的 JSX
    (ts.isBinaryExpression(expr) &&
      (expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        expr.operatorToken.kind === ts.SyntaxKind.BarBarToken) &&
      isJsxExpression(expr.right))
  )
}

/**
 * 检查箭头函数是否在变量声明中，并且变量名符合 React 命名规范
 */
function isReactFunctionInVariableDeclaration(arrowFunc: ts.ArrowFunction): boolean {
  const parent = arrowFunc.parent

  // 检查是否在变量声明中
  if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
    return isReactFunctionByName(parent.name.text)
  }

  // 检查是否在属性赋值中（如对象方法）
  if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) {
    return isReactFunctionByName(parent.name.text)
  }

  return false
}

/**
 * 创建 Signal 声明转换器
 */
export function createDeclareTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      showAddImportStatement = false

      let isInsideReactScope = false

      const visit = (node: ts.Node): ts.Node => {
        if (
          ts.isVariableDeclaration(node) &&
          shouldTransformSignalDeclaration(node)
        ) {
          showAddImportStatement = true

          const isInsideReactScope = checkIsInsideReactScope(node)
          if (isInsideReactScope) {
            importAPIName = 'useSignal'
          }

          const createSignalCall = ts.factory.createCallExpression(
            ts.factory.createIdentifier(importAPIName),
            undefined,
            isNone(node.initializer) ? [] : [node.initializer],
          )

          return ts.factory.updateVariableDeclaration(
            node,
            node.name,
            node.exclamationToken,
            node.type,
            createSignalCall,
          )
        }

        return ts.visitEachChild(node, visit, context)
      }

      const transformedSourceFile = ts.visitNode(sourceFile, visit) as ts.SourceFile

      if (showAddImportStatement) {
        return addImport(transformedSourceFile)
      }

      return transformedSourceFile
    }
  }
}
