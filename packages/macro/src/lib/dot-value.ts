import * as ts from 'typescript'

/**
 * 赋值操作符集合
 */
const ASSIGNMENT_OPERATORS = new Set([
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
  ts.SyntaxKind.PercentEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.CaretEqualsToken,
  ts.SyntaxKind.LessThanLessThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
  ts.SyntaxKind.AmpersandAmpersandEqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
])

/**
 * 检查标识符是否应该被转换
 */
function shouldTransformIdentifier(node: ts.Identifier): boolean {
  // 必须以 $ 结尾
  if (!node.text.endsWith('$')) {
    return false
  }

  // 排除宏函数（dispatch$, watch$ 等）
  const macroFunctions = [
    'hook$',
    'dispatch$',
    'mergeSignal$',
    'batchSignal$',
    'useSignal$',
    'useHookSignal$',
  ]
  if (macroFunctions.includes(node.text)) {
    return false
  }

  // 排除宏函数的调用
  if (ts.isCallExpression(node.parent)) {
    const expression = node.parent.expression
    if (ts.isIdentifier(expression) && macroFunctions.includes(expression.text)) {
      return false
    }
  }

  // 不能是变量声明的名称
  const parent = node.parent
  if (ts.isVariableDeclaration(parent) && parent.name === node) {
    return false
  }

  // 不能是对象字面量中的属性名
  if (ts.isPropertyAssignment(parent) && parent.name === node) {
    return false
  }

  // 不能是JSX属性名
  if (ts.isJsxAttribute(parent) && parent.name === node) {
    return false
  }

  // 不能是解构赋值中的变量名
  if (ts.isBindingElement(parent) && parent.name === node) {
    return false
  }

  // 不能是赋值表达式的左侧
  if (ts.isBinaryExpression(parent) && parent.left === node) {
    // 检查是否是赋值操作符
    const operator = parent.operatorToken.kind
    if (ASSIGNMENT_OPERATORS.has(operator)) {
      return false
    }
  }

  // 不能是属性访问表达式的名称部分（如果它本身就是赋值目标或dispatch调用目标）
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
    // 检查这个属性访问是否是赋值表达式的左侧
    const grandParent = parent.parent
    if (ts.isBinaryExpression(grandParent) && grandParent.left === parent) {
      const operator = grandParent.operatorToken.kind
      if (ASSIGNMENT_OPERATORS.has(operator)) {
        return false
      }
    }

    // 检查这个属性访问是否是 dispatch 调用的目标
    // 例如：在 obj.count$.dispatch(42) 中，不转换 count$
    if (
      ts.isPropertyAccessExpression(grandParent) &&
      grandParent.expression === parent
    ) {
      if (
        ts.isIdentifier(grandParent.name) &&
        grandParent.name.text === 'dispatch'
      ) {
        return false
      }
    }
  }

  return true
}

/**
 * 创建 $ 值转换器
 */
export function createDollarValueTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const visit = (node: ts.Node): ts.Node => {
        if (ts.isIdentifier(node) && shouldTransformIdentifier(node)) {
          return ts.factory.createPropertyAccessExpression(node, 'value')
        }
        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(sourceFile, visit) as ts.SourceFile
    }
  }
}
