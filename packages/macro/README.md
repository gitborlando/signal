# @g-signal/macro

G-Signal 宏转换工具，提供更简洁的信号语法糖。

## 安装

```bash
npm install @g-signal/macro
```

## Vite 插件

### 安装和配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { gSignalMacroPlugin } from '@g-signal/vite'

export default defineConfig({
  plugins: [
    gSignalMacroPlugin({
      debug: true, // 开发模式查看转换过程
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      exclude: [/node_modules/, /\.d\.ts$/],
    }),
    // 其他插件...
  ],
})
```

### 配置选项

```typescript
interface MacroPluginOptions {
  // 需要处理的文件扩展名
  extensions?: string[]

  // 排除的文件模式
  exclude?: RegExp[]

  // 包含的文件模式
  include?: RegExp[]

  // 是否启用调试模式
  debug?: boolean
}
```

## 宏语法

### 信号声明

**宏语法：**

```typescript
let count$ = 0
let message$ = 'Hello'
let todos$ = []
```

**转换为：**

```typescript
let count$ = createSignal$(0)
let message$ = createSignal$('Hello')
let todos$ = createSignal$([])
```

### 信号访问

**宏语法：**

```typescript
const value = count$
console.log(message$)
return <div>{todos$.length}</div>
```

**转换为：**

```typescript
const value = count$.value
console.log(message$.value)
return <div>{todos$.value.length}</div>
```

### 信号更新

**宏语法：**

```typescript
dispatch$(count$ + 1)
dispatch$('New message')
dispatch$([...todos$, newItem])
```

**转换为：**

```typescript
count$.dispatch(count$.value + 1)
message$.dispatch('New message')
todos$.dispatch([...todos$.value, newItem])
```

### 信号监听

**宏语法：**

```typescript
watch$(count$, (newVal, oldVal) => {
  console.log('Count changed:', newVal)
})
```

**转换为：**

```typescript
count$.hook((newVal, oldVal) => {
  console.log('Count changed:', newVal)
})
```

## 完整示例

### 原始宏代码

```typescript
import React from 'react'

function Counter() {
  let count$ = 0

  const increment = () => {
    dispatch$(count$ + 1)
  }

  const decrement = () => {
    dispatch$(count$ - 1)
  }

  // 监听变化
  watch$(count$, (newVal) => {
    console.log('Count:', newVal)
  })

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>Count: {count$}</span>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

### 转换后代码

```typescript
import React from 'react'

function Counter() {
  let count$ = createSignal$(0)
  const countValue = useHookSignal(count$)

  const increment = () => {
    count$.dispatch(countValue + 1)
  }

  const decrement = () => {
    count$.dispatch(countValue - 1)
  }

  // 监听变化
  count$.hook((newVal) => {
    console.log('Count:', newVal)
  })

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>Count: {countValue}</span>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

## 智能跳过

转换器会智能跳过不需要转换的上下文：

- 变量声明名：`let count$ = 0` 中的 `count$`
- 对象属性名：`{ count$: value }` 中的 `count$`
- JSX 属性名：`<div count$={value} />` 中的 `count$`
- 解构赋值：`const { count$ } = obj` 中的 `count$`
- 已经是 `.value` 访问的情况

## 类型支持

插件提供完整的 TypeScript 类型支持：

```typescript
/// <reference types="@g-signal/macro" />

// 全局宏函数类型会自动可用
declare function useHookSignal$<T>(signal: T): T
declare function dispatch$<T>(value: T): void
declare function watch$<T>(
  signal: T,
  callback: (newValue: T, oldValue: T) => void,
): () => void
declare function createSignal$<T>(value?: T): T
```

## 注意事项

1. **执行顺序**: 宏插件应该在其他转换插件之前执行
2. **文件过滤**: 只有包含宏语法的文件才会被处理
3. **错误处理**: 转换失败时会记录错误但不中断构建
4. **热更新**: 开发模式下支持热更新

## 许可证

ISC
