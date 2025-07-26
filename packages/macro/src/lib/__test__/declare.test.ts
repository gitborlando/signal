import * as ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { createDeclareTransformer } from '../declare'

/**
 * 编译代码并获取转换后的结果
 */
function compileCode(code: string): string {
  const sourceFile = ts.createSourceFile(
    'test.tsx', // 改为 .tsx 以支持 JSX
    code,
    ts.ScriptTarget.Latest,
    true,
  )

  const transformer = createDeclareTransformer()
  const result = ts.transform(sourceFile, [transformer])
  const transformedSourceFile = result.transformed[0] as ts.SourceFile

  return ts.createPrinter().printFile(transformedSourceFile)
}

describe('declare transformer', () => {
  it('should transform signal declaration with suffix', () => {
    const code = `
      const countSignal$ = 0
    `
    const result = compileCode(code)
    expect(result).toContain('import { Signal } from "g-signal"')
    expect(result).toContain('const countSignal$ = Signal.create(0)')
  })

  it('should transform signal declaration without initializer', () => {
    const code = `
      let dataSignal$
    `
    const result = compileCode(code)
    expect(result).toContain('import { Signal } from "g-signal"')
    expect(result).toContain('let dataSignal$ = Signal.create()')
  })

  it('should not transform when already using Signal.create', () => {
    const code = `
      const countSignal = Signal.create(0)
    `
    const result = compileCode(code)
    expect(result).toContain('const countSignal = Signal.create(0)')
    expect(result).not.toContain('Signal.create(Signal.create(0))')
  })

  it('should not transform when already using useSignal', () => {
    const code = `
      const countSignal = useSignal(0)
    `
    const result = compileCode(code)
    expect(result).toContain('const countSignal = useSignal(0)')
    expect(result).not.toContain('Signal.create(useSignal(0))')
  })

  it('should not transform variables without signal suffix', () => {
    const code = `
      const count = 0
      const data = "hello"
    `
    const result = compileCode(code)
    expect(result).toContain('const count = 0')
    expect(result).toContain('const data = "hello"')
    expect(result).not.toContain('Signal.create')
  })

  it('should transform multiple signal declarations', () => {
    const code = `
      const countSignal$ = 0
      const nameSignal$ = "test"
      const dataSignal$ = { value: 123 }
    `
    const result = compileCode(code)
    expect(result).toContain('const countSignal$ = Signal.create(0)')
    expect(result).toContain('const nameSignal$ = Signal.create("test")')
    expect(result).toContain('const dataSignal$ = Signal.create({ value: 123 })')
  })

  it('should handle existing import statements', () => {
    const code = `
      import { Signal } from "g-signal"
      const countSignal$ = 0
    `
    const result = compileCode(code)
    expect(result).toContain('import { Signal } from "g-signal"')
    expect(result).toContain('const countSignal$ = Signal.create(0)')
  })

  it('should add import when not present', () => {
    const code = `
      const countSignal$ = 0
    `
    const result = compileCode(code)
    expect(result).toContain('import { Signal } from "g-signal"')
  })

  it('should handle complex expressions as initializers', () => {
    const code = `
      const countSignal$ = 1 + 2 * 3
      const nameSignal$ = "hello" + " " + "world"
    `
    const result = compileCode(code)
    expect(result).toContain('const countSignal$ = Signal.create(1 + 2 * 3)')
    expect(result).toContain(
      'const nameSignal$ = Signal.create("hello" + " " + "world")',
    )
  })

  it('should handle array and object literals', () => {
    const code = `
      const itemsSignal$ = [1, 2, 3]
      const configSignal$ = { enabled: true, count: 0 }
    `
    const result = compileCode(code)
    expect(result).toContain('const itemsSignal$ = Signal.create([1, 2, 3])')
    expect(result).toContain(
      'const configSignal$ = Signal.create({ enabled: true, count: 0 })',
    )
  })

  it('should handle function calls as initializers', () => {
    const code = `
      const dataSignal$ = fetchData()
      const computedSignal$ = calculateValue(1, 2, 3)
    `
    const result = compileCode(code)
    expect(result).toContain('const dataSignal$ = Signal.create(fetchData())')
    expect(result).toContain(
      'const computedSignal$ = Signal.create(calculateValue(1, 2, 3))',
    )
  })

  // React 环境测试用例
  describe('React environment', () => {
    it('should transform signal declaration in React component', () => {
      const code = `
        function Counter() {
          const count$ = 0
          return <div>{count$}</div>
        }
      `
      const result = compileCode(code)
      expect(result).toContain('import { useSignal } from "@g-signal/react"')
      expect(result).toContain('const count$ = useSignal(0)')
    })

    it('should transform signal declaration in React hook', () => {
      const code = `
        function useCounter() {
          const count$ = 0
          const increment$ = () => count$++
          return { count$, increment$ }
        }
      `
      const result = compileCode(code)
      expect(result).toContain('import { useSignal } from "@g-signal/react"')
      expect(result).toContain('const count$ = useSignal(0)')
      expect(result).toContain('const increment$ = useSignal(() => count$++)')
    })

    it('should transform signal declaration in arrow function component', () => {
      const code = `
        const Counter = () => {
          const count$ = 0
          return <div>{count$}</div>
        }
      `
      const result = compileCode(code)
      expect(result).toContain('import { useSignal } from "@g-signal/react"')
      expect(result).toContain('const count$ = useSignal(0)')
    })

    it('should transform signal declaration in custom hook', () => {
      const code = `
        const useCustomHook = () => {
          const data$ = { value: 0 }
          const updateData$ = (newValue) => data$ = newValue
          return { data$, updateData$ }
        }
      `
      const result = compileCode(code)
      expect(result).toContain('import { useSignal } from "@g-signal/react"')
      expect(result).toContain('const data$ = useSignal({ value: 0 })')
      expect(result).toContain(
        'const updateData$ = useSignal((newValue) => data$ = newValue)',
      )
    })

    it('should not transform signal declaration outside React scope', () => {
      const code = `
        const count$ = 0
        function regularFunction() {
          const data$ = "hello"
        }
      `
      const result = compileCode(code)
      expect(result).toContain('import { Signal } from "g-signal"')
      expect(result).toContain('const count$ = Signal.create(0)')
      expect(result).toContain('const data$ = Signal.create("hello")')
    })

    it('should handle mixed React and non-React contexts', () => {
      const code = `
        const globalCount$ = 0
        
        function Counter() {
          const localCount$ = 0
          return <div>{localCount$}</div>
        }
        
        const utility$ = "helper"
      `
      const result = compileCode(code)
      expect(result).toContain('import { Signal } from "g-signal"')
      expect(result).toContain('import { useSignal } from "@g-signal/react"')
      expect(result).toContain('const globalCount$ = Signal.create(0)')
      expect(result).toContain('const localCount$ = useSignal(0)')
      expect(result).toContain('const utility$ = Signal.create("helper")')
    })

    it('should handle React component with multiple signals', () => {
      const code = `
        function UserProfile() {
          const name$ = "John"
          const age$ = 25
          const preferences$ = { theme: "dark" }
          
          return (
            <div>
              <h1>{name$}</h1>
              <p>Age: {age$}</p>
              <p>Theme: {preferences$.theme}</p>
            </div>
          )
        }
      `
      const result = compileCode(code)
      expect(result).toContain('import { useSignal } from "@g-signal/react"')
      expect(result).toContain('const name$ = useSignal("John")')
      expect(result).toContain('const age$ = useSignal(25)')
      expect(result).toContain('const preferences$ = useSignal({ theme: "dark" })')
    })

    it('should handle nested React components', () => {
      const code = `
        function Parent() {
          const parentData$ = "parent"
          
          return (
            <div>
              <Child />
            </div>
          )
        }
        
        function Child() {
          const childData$ = "child"
          return <span>{childData$}</span>
        }
      `
      const result = compileCode(code)
      expect(result).toContain('import { useSignal } from "@g-signal/react"')
      expect(result).toContain('const parentData$ = useSignal("parent")')
      expect(result).toContain('const childData$ = useSignal("child")')
    })

    it('should handle React component with conditional JSX', () => {
      const code = `
        function ConditionalComponent() {
          const isVisible$ = true
          const count$ = 0
          
          return (
            <div>
              {isVisible$ && <span>Count: {count$}</span>}
            </div>
          )
        }
      `
      const result = compileCode(code)
      expect(result).toContain('import { useSignal } from "@g-signal/react"')
      expect(result).toContain('const isVisible$ = useSignal(true)')
      expect(result).toContain('const count$ = useSignal(0)')
    })

    it('should handle React component with event handlers', () => {
      const code = `
        function ButtonComponent() {
          const clickCount$ = 0
          
          const handleClick = () => {
            clickCount$++
          }
          
          return <button onClick={handleClick}>Clicked {clickCount$} times</button>
        }
      `
      const result = compileCode(code)
      expect(result).toContain('import { useSignal } from "@g-signal/react"')
      expect(result).toContain('const clickCount$ = useSignal(0)')
    })
  })
})
