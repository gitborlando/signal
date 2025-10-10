import { describe, expect, it, vi } from 'vitest'
import { Signal } from '..'

describe('Signal 类', () => {
  describe('基础功能', () => {
    it('应该创建带有初始值的信号', () => {
      const signal = Signal.create(42)
      expect(signal.value).toBe(42)
      expect(signal.oldValue).toBe(42)
    })

    it('应该创建不带初始值的信号', () => {
      const signal = Signal.create<number>()
      expect(signal.value).toBeUndefined()
    })

    it('应该更新信号值', () => {
      const signal = Signal.create(10)
      signal.value = 20
      expect(signal.value).toBe(20)
      expect(signal.oldValue).toBe(10)
    })

    it('应该支持复杂类型', () => {
      const signal = Signal.create({ name: '测试', count: 0 })
      expect(signal.value).toEqual({ name: '测试', count: 0 })

      signal.value = { name: '更新', count: 1 }
      expect(signal.value).toEqual({ name: '更新', count: 1 })
    })
  })

  describe('Hook 监听器', () => {
    it('应该添加和触发 hook', () => {
      const signal = Signal.create(0)
      const mockHook = vi.fn()

      signal.hook(mockHook)
      signal.dispatch(1)

      expect(mockHook).toHaveBeenCalledWith(1, 0)
    })

    it('应该支持多个 hook', () => {
      const signal = Signal.create(0)
      const hook1 = vi.fn()
      const hook2 = vi.fn()

      signal.hook(hook1)
      signal.hook(hook2)
      signal.dispatch(5)

      expect(hook1).toHaveBeenCalledWith(5, 0)
      expect(hook2).toHaveBeenCalledWith(5, 0)
    })

    it('应该支持取消监听', () => {
      const signal = Signal.create(0)
      const mockHook = vi.fn()

      const unsubscribe = signal.hook(mockHook)
      signal.dispatch(1)
      expect(mockHook).toHaveBeenCalledTimes(1)

      unsubscribe()
      signal.dispatch(2)
      expect(mockHook).toHaveBeenCalledTimes(1)
    })

    it('应该支持立即执行选项', () => {
      const signal = Signal.create(42)
      const mockHook = vi.fn()

      signal.hook({ immediately: true }, mockHook)

      expect(mockHook).toHaveBeenCalledWith(42, 42)
    })

    it('应该支持只执行一次选项', () => {
      const signal = Signal.create(0)
      const mockHook = vi.fn()

      signal.hook({ once: true }, mockHook)
      signal.dispatch(1)
      signal.dispatch(2)

      expect(mockHook).toHaveBeenCalledTimes(1)
      expect(mockHook).toHaveBeenCalledWith(1, 0)
    })

    it('应该支持立即执行且只执行一次', () => {
      const signal = Signal.create(42)
      const mockHook = vi.fn()

      signal.hook({ immediately: true, once: true }, mockHook)
      signal.dispatch(100)

      expect(mockHook).toHaveBeenCalledTimes(1)
      expect(mockHook).toHaveBeenCalledWith(42, 42)
    })
  })

  describe('Dispatch 方法', () => {
    it('应该使用函数更新值', () => {
      const signal = Signal.create(10)
      const mockFn = vi.fn()

      signal.dispatch(mockFn)

      expect(mockFn).toHaveBeenCalledWith(10)
    })
  })

  describe('清理功能', () => {
    it('应该移除所有 hook', () => {
      const signal = Signal.create(0)
      const hook1 = vi.fn()
      const hook2 = vi.fn()

      signal.hook(hook1)
      signal.hook(hook2)
      signal.removeAll()
      signal.dispatch(1)

      expect(hook1).not.toHaveBeenCalled()
      expect(hook2).not.toHaveBeenCalled()
    })
  })
})
