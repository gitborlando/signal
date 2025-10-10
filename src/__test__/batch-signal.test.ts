import { describe, expect, it, vi } from 'vitest'
import { Signal } from '..'

describe('batchSignal', () => {
  describe('批量处理模式', () => {
    it('应该在回调中启用批量模式，回调结束后自动刷新', () => {
      const signal1 = Signal.create(0)
      const signal2 = Signal.create('')
      const hook1 = vi.fn()
      const hook2 = vi.fn()

      signal1.hook(hook1)
      signal2.hook(hook2)

      Signal.batch(() => {
        signal1.dispatch(1)
        signal2.dispatch('test')

        // 在批量模式下，hooks 不应该立即执行
        expect(hook1).not.toHaveBeenCalled()
        expect(hook2).not.toHaveBeenCalled()
      })

      // 回调结束后，应该自动刷新所有 hooks
      expect(hook1).toHaveBeenCalledWith(1, 0)
      expect(hook2).toHaveBeenCalledWith('test', '')
    })

    it('应该支持回调中的复杂操作', () => {
      const counter = Signal.create(0)
      const doubleCounter = Signal.create(0)
      const mockHook = vi.fn()

      counter.hook(mockHook)
      doubleCounter.hook(mockHook)

      Signal.batch(() => {
        counter.dispatch(5)
        doubleCounter.dispatch(counter.value * 2)

        expect(mockHook).not.toHaveBeenCalled()
      })

      expect(mockHook).toHaveBeenCalledTimes(2)
      expect(counter.value).toBe(5)
      expect(doubleCounter.value).toBe(10)
    })

    it('应该处理批量模式下的多次更新', () => {
      const signal = Signal.create(0)
      const mockHook = vi.fn()

      signal.hook(mockHook)

      Signal.batch(() => {
        // 多次更新
        signal.dispatch(1)
        signal.dispatch(2)
        signal.dispatch(3)

        expect(mockHook).not.toHaveBeenCalled()
      })

      // 应该只触发一次，使用最终值
      expect(mockHook).toHaveBeenCalledTimes(1)
      expect(mockHook).toHaveBeenCalledWith(3, 0)
    })
  })

  describe('批量模式状态管理', () => {
    it('应该正确恢复批量模式状态', () => {
      const signal = Signal.create(0)
      const mockHook = vi.fn()

      signal.hook(mockHook)

      Signal.batch(() => {
        signal.dispatch(1)
        expect(mockHook).not.toHaveBeenCalled()
      })

      expect(mockHook).toHaveBeenCalledTimes(1)

      // 批量模式应该已经关闭，后续更新应该立即触发
      signal.dispatch(2)
      expect(mockHook).toHaveBeenCalledTimes(2)
      expect(mockHook).toHaveBeenLastCalledWith(2, 1)
    })

    it('应该处理嵌套批量操作', () => {
      const signal1 = Signal.create(0)
      const signal2 = Signal.create(0)
      const hook1 = vi.fn()
      const hook2 = vi.fn()

      signal1.hook(hook1)
      signal2.hook(hook2)

      Signal.batch(() => {
        signal1.dispatch(1)

        // 嵌套批量操作
        Signal.batch(() => {
          signal2.dispatch(2)
        })

        expect(hook1).not.toHaveBeenCalled()
        expect(hook2).not.toHaveBeenCalled() // 嵌套批量操作会立即执行
      })

      expect(hook1).toHaveBeenCalledWith(1, 0)
      expect(hook2).toHaveBeenCalledWith(2, 0) // 确保只调用了一次
    })
  })

  describe('额外参数传递', () => {
    it('应该保持额外参数在批量处理中', () => {
      const signal = Signal.create(0)
      const mockHook = vi.fn()

      signal.hook(mockHook)

      Signal.batch(() => {
        signal.dispatch(1)
      })

      expect(mockHook).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('多信号批量处理', () => {
    it('应该批量处理多个信号的更新', () => {
      const signal1 = Signal.create(0)
      const signal2 = Signal.create(0)
      const signal3 = Signal.create(0)
      const hook1 = vi.fn()
      const hook2 = vi.fn()
      const hook3 = vi.fn()

      signal1.hook(hook1)
      signal2.hook(hook2)
      signal3.hook(hook3)

      Signal.batch(() => {
        signal1.dispatch(1)
        signal2.dispatch(2)
        signal3.dispatch(3)

        // 在批量模式下，所有hooks都不应该立即执行
        expect(hook1).not.toHaveBeenCalled()
        expect(hook2).not.toHaveBeenCalled()
        expect(hook3).not.toHaveBeenCalled()
      })

      // 回调结束后，所有hooks都应该被触发
      expect(hook1).toHaveBeenCalledWith(1, 0)
      expect(hook2).toHaveBeenCalledWith(2, 0)
      expect(hook3).toHaveBeenCalledWith(3, 0)
    })

    it('应该正确处理同一信号的多次更新', () => {
      const signal = Signal.create(0)
      const mockHook = vi.fn()

      signal.hook(mockHook)

      Signal.batch(() => {
        signal.dispatch(1)
        signal.dispatch(2)
        signal.dispatch(3)
        signal.dispatch(4)
      })

      // 只应该触发一次，使用最终值
      expect(mockHook).toHaveBeenCalledTimes(1)
      expect(mockHook).toHaveBeenCalledWith(4, 0)
    })
  })
})
