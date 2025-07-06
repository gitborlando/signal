import { transformDollarValue } from '../index'

console.log('=== Signal 赋值转换测试 ===\n')

// 测试 1: 基本赋值转换
console.log('1. 基本赋值转换测试')
const basicAssignCode = `
function Counter() {
  const count$ = 0
  const name$ = 'hello'
  
  count$ = 5
  name$ = 'world'
  
  return <div>{count$}</div>
}
`

console.log('输入代码:')
console.log(basicAssignCode)
console.log('转换结果:')
console.log(transformDollarValue(basicAssignCode))
console.log('\n' + '='.repeat(50) + '\n')

// 测试 2: 复合赋值操作符
console.log('2. 复合赋值操作符测试')
const compoundAssignCode = `
function Calculator() {
  const value$ = 10
  const text$ = 'hello'
  const flag$ = true
  
  // 数学运算
  value$ += 5
  value$ -= 3
  value$ *= 2
  value$ /= 4
  value$ %= 3
  
  // 字符串连接
  text$ += ' world'
  
  // 位运算
  value$ &= 0xFF
  value$ |= 0x01
  value$ ^= 0x02
  value$ <<= 1
  value$ >>= 1
  value$ >>>= 1
  
  // 逻辑运算
  flag$ &&= true
  flag$ ||= false
  text$ ??= 'default'
  
  return <div>{value$}</div>
}
`

console.log('输入代码:')
console.log(compoundAssignCode)
console.log('转换结果:')
console.log(transformDollarValue(compoundAssignCode))
console.log('\n' + '='.repeat(50) + '\n')

// 测试 3: 属性访问赋值
console.log('3. 属性访问赋值测试')
const propertyAssignCode = `
function ObjectExample() {
  const obj = {
    count$: 0,
    nested: {
      value$: 'test'
    }
  }
  
  obj.count$ = 42
  obj.nested.value$ = 'updated'
  obj.count$ += 10
  obj.nested.value$ += ' suffix'
  
  return <div>{obj.count$}</div>
}
`

console.log('输入代码:')
console.log(propertyAssignCode)
console.log('转换结果:')
console.log(transformDollarValue(propertyAssignCode))
console.log('\n' + '='.repeat(50) + '\n')

// 测试 4: React Hook 中的赋值
console.log('4. React Hook 中的赋值测试')
const hookAssignCode = `
function useCounter() {
  const count$ = 0
  const step$ = 1
  
  const increment = () => {
    count$ += step$
  }
  
  const decrement = () => {
    count$ -= step$
  }
  
  const reset = () => {
    count$ = 0
    step$ = 1
  }
  
  return { count$, increment, decrement, reset }
}
`

console.log('输入代码:')
console.log(hookAssignCode)
console.log('转换结果:')
console.log(transformDollarValue(hookAssignCode))
console.log('\n' + '='.repeat(50) + '\n')

// 测试 5: 嵌套函数中的赋值
console.log('5. 嵌套函数中的赋值测试')
const nestedAssignCode = `
function ParentComponent() {
  const parent$ = 'parent'
  
  const handleClick = () => {
    parent$ = 'clicked'
    
    const nested = () => {
      parent$ += ' nested'
    }
    
    nested()
  }
  
  return <div onClick={handleClick}>{parent$}</div>
}
`

console.log('输入代码:')
console.log(nestedAssignCode)
console.log('转换结果:')
console.log(transformDollarValue(nestedAssignCode))
console.log('\n' + '='.repeat(50) + '\n')

// 测试 6: 不应该被转换的情况
console.log('6. 不应该被转换的情况测试')
const noTransformCode = `
function MixedExample() {
  // 变量声明 - 不应该转换赋值部分
  const count$ = 0
  let value$ = 'hello'
  var flag$ = true
  
  // 普通变量 - 不应该转换
  let normalVar = 10
  normalVar = 20
  normalVar += 5
  
  // signal 变量的赋值 - 应该转换
  count$ = 5
  value$ += ' world'
  
  return <div>{count$}</div>
}
`

console.log('输入代码:')
console.log(noTransformCode)
console.log('转换结果:')
console.log(transformDollarValue(noTransformCode))
console.log('\n' + '='.repeat(50) + '\n')

// 测试 7: 复杂表达式赋值
console.log('7. 复杂表达式赋值测试')
const complexAssignCode = `
function ComplexExample() {
  const count$ = 0
  const items$ = []
  const user$ = { name: 'John', age: 25 }
  
  // 复杂右侧表达式
  count$ = Math.max(10, count$ + 5)
  items$ = [...items$, 'new item']
  user$ = { ...user$, age: user$.age + 1 }
  
  // 复杂复合赋值
  count$ += items$.length * 2
  
  return <div>{count$}</div>
}
`

console.log('输入代码:')
console.log(complexAssignCode)
console.log('转换结果:')
console.log(transformDollarValue(complexAssignCode))
console.log('\n' + '='.repeat(50) + '\n')

console.log('测试完成！')
