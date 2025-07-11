import { describe, expect, it, vi } from 'vitest'
import { createSignal, deriveSignal } from '../signal'

describe('deriveSignal', () => {
  describe('单信号派生', () => {
    it('应该创建基于单个信号的派生信号', () => {
      const source = createSignal(5)
      const derived = deriveSignal(source, (value) => value * 2)

      expect(derived.value).toBe(10)
    })

    it('应该在源信号变化时更新', () => {
      const source = createSignal(5)
      const derived = deriveSignal(source, (value) => value * 2)
      const mockHook = vi.fn()

      derived.hook(mockHook)
      source.dispatch(10)

      expect(derived.value).toBe(20)
      expect(mockHook).toHaveBeenCalledWith(20, 10, undefined)
    })

    it('应该支持复杂的计算函数', () => {
      const source = createSignal(10)
      const derived = deriveSignal(source, (value) => {
        if (value < 5) return 'small'
        if (value < 10) return 'medium'
        return 'large'
      })

      expect(derived.value).toBe('large')

      source.dispatch(3)
      expect(derived.value).toBe('small')
    })

    it('应该支持不同类型的转换', () => {
      const numberSignal = createSignal(42)
      const stringDerived = deriveSignal(numberSignal, (num) => `值是: ${num}`)

      expect(stringDerived.value).toBe('值是: 42')

      numberSignal.dispatch(100)
      expect(stringDerived.value).toBe('值是: 100')
    })
  })

  describe('多信号派生', () => {
    it('应该创建基于多个信号的派生信号', () => {
      const signal1 = createSignal(3)
      const signal2 = createSignal(4)
      const derived = deriveSignal(signal1, signal2, (a, b) => a + b)

      expect(derived.value).toBe(7)
    })

    it('应该在任一源信号变化时重新计算', () => {
      const signal1 = createSignal(1)
      const signal2 = createSignal(2)
      const signal3 = createSignal(3)
      const derived = deriveSignal(signal1, signal2, signal3, (a, b, c) => a + b + c)

      expect(derived.value).toBe(6)

      signal1.dispatch(10)
      expect(derived.value).toBe(15)

      signal3.dispatch(30)
      expect(derived.value).toBe(42)
    })

    it('应该支持字符串拼接', () => {
      const firstName = createSignal('张')
      const lastName = createSignal('三')
      const fullName = deriveSignal(
        firstName,
        lastName,
        (first, last) => `${first}${last}`,
      )

      expect(fullName.value).toBe('张三')

      firstName.dispatch('李')
      expect(fullName.value).toBe('李三')

      lastName.dispatch('四')
      expect(fullName.value).toBe('李四')
    })

    it('应该支持复杂对象操作', () => {
      const user = createSignal({ name: '测试', age: 25 })
      const settings = createSignal({ theme: 'dark', lang: 'zh' })

      const profile = deriveSignal(user, settings, (u, s) => ({
        displayName: u.name,
        isAdult: u.age >= 18,
        preferences: s,
      }))

      expect(profile.value).toEqual({
        displayName: '测试',
        isAdult: true,
        preferences: { theme: 'dark', lang: 'zh' },
      })
    })
  })

  describe('错误处理', () => {
    it('应该在没有信号时抛出错误', () => {
      expect(() => {
        // @ts-expect-error 故意的错误用法
        deriveSignal((x) => x * 2)
      }).toThrow('derive 函数至少需要一个源信号')
    })

    it('应该在没有计算函数时抛出错误', () => {
      const signal = createSignal(5)
      expect(() => {
        // @ts-expect-error 故意的错误用法
        deriveSignal(signal)
      }).toThrow('derive 函数的最后一个参数必须是计算函数')
    })
  })

  describe('性能和内存', () => {
    it('应该正确处理派生信号的链式依赖', () => {
      const source = createSignal(2)
      const doubled = deriveSignal(source, (x) => x * 2)
      const quadrupled = deriveSignal(doubled, (x) => x * 2)

      expect(quadrupled.value).toBe(8)

      source.dispatch(5)
      expect(doubled.value).toBe(10)
      expect(quadrupled.value).toBe(20)
    })

    it('应该支持多级派生', () => {
      const a = createSignal(1)
      const b = createSignal(2)
      const sum = deriveSignal(a, b, (x, y) => x + y)
      const product = deriveSignal(a, b, (x, y) => x * y)
      const final = deriveSignal(sum, product, (s, p) => s + p)

      expect(final.value).toBe(5) // (1+2) + (1*2) = 3 + 2 = 5

      a.dispatch(3)
      expect(final.value).toBe(11) // (3+2) + (3*2) = 5 + 6 = 11
      expect(sum.value).toBe(5)
      expect(product.value).toBe(6)
      expect(final.value).toBe(11)
    })
  })
})
