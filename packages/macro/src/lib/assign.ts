import * as ts from 'typescript'
import { suffix } from '.'

/**
 * 检查是否是 signal 变量的赋值语句
 */
function isSignalAssignment(node: ts.BinaryExpression): boolean {
  // 检查是否是赋值操作符
  if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
    return false
  }

  // 检查左侧是否是以 suffix 结尾的标识符
  if (ts.isIdentifier(node.left)) {
    return node.left.text.endsWith(suffix)
  }

  // 检查属性访问表达式（如 obj.prop$）
  if (ts.isPropertyAccessExpression(node.left)) {
    return node.left.name.text.endsWith(suffix)
  }

  // 检查元素访问表达式（如 arr[0]$，虽然不常见）
  if (ts.isElementAccessExpression(node.left)) {
    // 这种情况比较复杂，暂时不处理
    return false
  }

  return false
}

/**
 * 检查是否是变量声明中的赋值（这些不需要转换）
 */
function isInVariableDeclaration(node: ts.Node): boolean {
  let current = node.parent
  while (current) {
    if (ts.isVariableDeclaration(current)) {
      return true
    }
    // 如果遇到函数或类声明，停止向上查找
    if (
      ts.isFunctionDeclaration(current) ||
      ts.isArrowFunction(current) ||
      ts.isFunctionExpression(current) ||
      ts.isClassDeclaration(current)
    ) {
      break
    }
    current = current.parent
  }
  return false
}

/**
 * 创建 dispatch 调用表达式
 */
function createDispatchCall(
  target: ts.Expression,
  value: ts.Expression,
): ts.CallExpression {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      target,
      ts.factory.createIdentifier('dispatch'),
    ),
    undefined,
    [value],
  )
}

/**
 * 复合赋值操作符映射表
 * 将复合赋值操作符映射到对应的二元操作符
 */
const COMPOUND_ASSIGN_OPERATORS: Partial<Record<ts.SyntaxKind, ts.BinaryOperator>> =
  {
    [ts.SyntaxKind.PlusEqualsToken]: ts.SyntaxKind.PlusToken,
    [ts.SyntaxKind.MinusEqualsToken]: ts.SyntaxKind.MinusToken,
    [ts.SyntaxKind.AsteriskEqualsToken]: ts.SyntaxKind.AsteriskToken,
    [ts.SyntaxKind.SlashEqualsToken]: ts.SyntaxKind.SlashToken,
    [ts.SyntaxKind.PercentEqualsToken]: ts.SyntaxKind.PercentToken,
    [ts.SyntaxKind.AmpersandEqualsToken]: ts.SyntaxKind.AmpersandToken,
    [ts.SyntaxKind.BarEqualsToken]: ts.SyntaxKind.BarToken,
    [ts.SyntaxKind.CaretEqualsToken]: ts.SyntaxKind.CaretToken,
    [ts.SyntaxKind.LessThanLessThanEqualsToken]: ts.SyntaxKind.LessThanLessThanToken,
    [ts.SyntaxKind.GreaterThanGreaterThanEqualsToken]:
      ts.SyntaxKind.GreaterThanGreaterThanToken,
    [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken]:
      ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken,
    [ts.SyntaxKind.QuestionQuestionEqualsToken]: ts.SyntaxKind.QuestionQuestionToken,
    [ts.SyntaxKind.AmpersandAmpersandEqualsToken]:
      ts.SyntaxKind.AmpersandAmpersandToken,
    [ts.SyntaxKind.BarBarEqualsToken]: ts.SyntaxKind.BarBarToken,
  }

/**
 * 创建复合赋值的 dispatch 调用
 * @param target 目标变量（如 count$）
 * @param operator 二元操作符（如 +, -, *, / 等）
 * @param right 右侧表达式
 * @returns dispatch 调用表达式
 */
function createCompoundAssignDispatch(
  target: ts.Expression,
  operator: ts.BinaryOperator,
  right: ts.Expression,
): ts.CallExpression {
  // 创建 target.value 属性访问
  const targetValue = ts.factory.createPropertyAccessExpression(target, 'value')

  // 创建二元表达式：target.value operator right
  const binaryExpression = ts.factory.createBinaryExpression(
    targetValue,
    operator,
    right,
  )

  // 创建 dispatch 调用
  return createDispatchCall(target, binaryExpression)
}

/**
 * 转换赋值语句为 dispatch 调用
 */
function transformAssignment(node: ts.BinaryExpression): ts.CallExpression {
  return createDispatchCall(node.left, node.right)
}

/**
 * 创建 Signal 赋值转换器
 */
export function createAssignTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const visit = (node: ts.Node): ts.Node => {
        // 检查是否是赋值表达式
        if (ts.isBinaryExpression(node) && isSignalAssignment(node)) {
          // 排除变量声明中的赋值
          if (!isInVariableDeclaration(node)) {
            return transformAssignment(node)
          }
        }

        // 检查表达式语句中的赋值
        if (
          ts.isExpressionStatement(node) &&
          ts.isBinaryExpression(node.expression) &&
          isSignalAssignment(node.expression)
        ) {
          // 排除变量声明中的赋值
          if (!isInVariableDeclaration(node.expression)) {
            const dispatchCall = transformAssignment(node.expression)
            return ts.factory.updateExpressionStatement(node, dispatchCall)
          }
        }

        return ts.visitEachChild(node, visit, context)
      }

      return ts.visitNode(sourceFile, visit) as ts.SourceFile
    }
  }
}

/**
 * 创建增强的赋值转换器，支持复合赋值操作符
 */
export function createEnhancedAssignTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const visit = (node: ts.Node): ts.Node => {
        // 检查是否是赋值表达式
        if (ts.isBinaryExpression(node)) {
          const left = node.left
          const operator = node.operatorToken.kind
          const right = node.right

          // 检查是否是 signal 变量或已转换的 signal 变量
          let signalTarget: ts.Expression | null = null
          let isSignalVar = false

          // 检查直接的 signal 变量：count$
          if (ts.isIdentifier(left) && left.text.endsWith(suffix)) {
            isSignalVar = true
            signalTarget = left
          }
          // 检查属性访问的 signal 变量：obj.count$
          else if (
            ts.isPropertyAccessExpression(left) &&
            left.name.text.endsWith(suffix)
          ) {
            isSignalVar = true
            signalTarget = left
          }
          // 检查已转换的 signal 变量：count$.value 或 obj.count$.value
          else if (
            ts.isPropertyAccessExpression(left) &&
            left.name.text === 'value' &&
            ts.isPropertyAccessExpression(left.expression) &&
            left.expression.name.text.endsWith(suffix)
          ) {
            // obj.count$.value 的情况
            isSignalVar = true
            signalTarget = left.expression // obj.count$
          } else if (
            ts.isPropertyAccessExpression(left) &&
            left.name.text === 'value' &&
            ts.isIdentifier(left.expression) &&
            left.expression.text.endsWith(suffix)
          ) {
            // count$.value 的情况
            isSignalVar = true
            signalTarget = left.expression // count$
          }

          if (isSignalVar && signalTarget && !isInVariableDeclaration(node)) {
            // 简单赋值：abc$ = value → abc$.dispatch(value)
            if (operator === ts.SyntaxKind.EqualsToken) {
              return createDispatchCall(signalTarget, right)
            }

            // 复合赋值：abc$ += value → abc$.dispatch(abc$.value + value)
            const binaryOperator = COMPOUND_ASSIGN_OPERATORS[operator]
            if (binaryOperator) {
              return createCompoundAssignDispatch(
                signalTarget,
                binaryOperator,
                right,
              )
            }
          }
        }

        // 检查表达式语句中的赋值
        if (
          ts.isExpressionStatement(node) &&
          ts.isBinaryExpression(node.expression)
        ) {
          const transformedExpression = visit(node.expression)
          if (transformedExpression !== node.expression) {
            return ts.factory.updateExpressionStatement(
              node,
              transformedExpression as ts.Expression,
            )
          }
        }

        return ts.visitEachChild(node, visit, context)
      }

      return ts.visitNode(sourceFile, visit) as ts.SourceFile
    }
  }
}
