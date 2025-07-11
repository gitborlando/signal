import { describe, expect, it, vi } from 'vitest'
import { batchSignal, createSignal } from '../signal'

describe('batchSignal', () => {
  describe('延迟执行模式', () => {
    it.only('应该返回一个延迟执行函数', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal('')

      const flush = batchSignal(signal1, signal2)

      expect(typeof flush).toBe('function')
    })

    it('应该在批量模式下延迟 hook 执行', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal('')
      const hook1 = vi.fn()
      const hook2 = vi.fn()

      signal1.hook(hook1)
      signal2.hook(hook2)

      const flush = batchSignal(signal1, signal2)

      // 在批量模式下更新不应该立即触发 hooks
      signal1.dispatch(1)
      signal2.dispatch('test')

      expect(hook1).not.toHaveBeenCalled()
      expect(hook2).not.toHaveBeenCalled()

      // 调用 flush 后应该触发所有 hooks
      flush()

      expect(hook1).toHaveBeenCalledWith(1, 0)
      expect(hook2).toHaveBeenCalledWith('test', '')
    })

    it('应该处理批量模式下的多次更新', () => {
      const signal = createSignal(0)
      const mockHook = vi.fn()

      signal.hook(mockHook)

      const flush = batchSignal(signal)

      // 多次更新
      signal.dispatch(1)
      signal.dispatch(2)
      signal.dispatch(3)

      expect(mockHook).not.toHaveBeenCalled()

      flush()

      // 应该只触发一次，使用最终值
      expect(mockHook).toHaveBeenCalledTimes(1)
      expect(mockHook).toHaveBeenCalledWith(3, 0)
    })
  })

  describe('回调执行模式', () => {
    it('应该在回调中启用批量模式，回调结束后自动刷新', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal('')
      const hook1 = vi.fn()
      const hook2 = vi.fn()

      signal1.hook(hook1)
      signal2.hook(hook2)

      batchSignal(signal1, signal2, () => {
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
      const counter = createSignal(0)
      const doubleCounter = createSignal(0)
      const mockHook = vi.fn()

      counter.hook(mockHook)
      doubleCounter.hook(mockHook)

      batchSignal(counter, doubleCounter, () => {
        counter.dispatch(5)
        doubleCounter.dispatch(counter.value * 2)

        expect(mockHook).not.toHaveBeenCalled()
      })

      expect(mockHook).toHaveBeenCalledTimes(2)
      expect(counter.value).toBe(5)
      expect(doubleCounter.value).toBe(10)
    })
  })

  describe('信号去重', () => {
    it('应该去除重复的信号', () => {
      const signal = createSignal(0)
      const mockHook = vi.fn()

      signal.hook(mockHook)

      // 传入重复的信号
      const flush = batchSignal(signal, signal, signal)

      signal.dispatch(1)
      flush()

      // 即使传入多次相同信号，也应该只更新一次
      expect(mockHook).toHaveBeenCalledTimes(1)
    })
  })

  describe('批量模式状态管理', () => {
    it('应该正确恢复批量模式状态', () => {
      const signal = createSignal(0)
      const mockHook = vi.fn()

      signal.hook(mockHook)

      const flush = batchSignal(signal)

      signal.dispatch(1)
      expect(mockHook).not.toHaveBeenCalled()

      flush()
      expect(mockHook).toHaveBeenCalledTimes(1)

      // 批量模式应该已经关闭，后续更新应该立即触发
      signal.dispatch(2)
      expect(mockHook).toHaveBeenCalledTimes(2)
      expect(mockHook).toHaveBeenLastCalledWith(2, 1)
    })

    it('应该处理嵌套批量操作', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal(0)
      const hook1 = vi.fn()
      const hook2 = vi.fn()

      signal1.hook(hook1)
      signal2.hook(hook2)

      batchSignal(signal1, signal2, () => {
        signal1.dispatch(1)

        // 嵌套批量操作
        const innerFlush = batchSignal(signal2)
        signal2.dispatch(2)
        innerFlush()

        expect(hook1).not.toHaveBeenCalled()
        expect(hook2).not.toHaveBeenCalled()
      })

      expect(hook1).toHaveBeenCalledWith(1, 0)
      expect(hook2).toHaveBeenCalledWith(2, 0)
    })
  })

  describe('额外参数传递', () => {
    it('应该保持额外参数在批量处理中', () => {
      const signal = createSignal(0)
      const mockHook = vi.fn()

      signal.hook(mockHook)

      const flush = batchSignal(signal)

      signal.dispatch(1, { source: 'test' })
      flush()

      expect(mockHook).toHaveBeenCalledWith(1, 0, { source: 'test' })
    })
  })
})
