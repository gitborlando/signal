import { describe, expect, it, vi } from 'vitest'
import { createSignal, mergeSignal } from '../signal'

describe('mergeSignal', () => {
  describe('AND 逻辑（默认）', () => {
    it('应该等待所有信号都触发后才触发', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal('')
      const signal3 = createSignal(false)
      const merged = mergeSignal(signal1, signal2, signal3)
      const mockHook = vi.fn()

      merged.hook(mockHook)

      // 单独触发不应该触发合并信号
      signal1.dispatch(1)
      expect(mockHook).not.toHaveBeenCalled()

      signal2.dispatch('test')
      expect(mockHook).not.toHaveBeenCalled()

      // 第三个信号触发后，应该触发合并信号
      signal3.dispatch(true)
      expect(mockHook).toHaveBeenCalledTimes(1)
    })

    it('应该在下一轮触发中重置状态', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal(0)
      const merged = mergeSignal(signal1, signal2)
      const mockHook = vi.fn()

      merged.hook(mockHook)

      // 第一轮
      signal1.dispatch(1)
      signal2.dispatch(1)
      expect(mockHook).toHaveBeenCalledTimes(1)

      // 第二轮 - 需要重新等待所有信号
      signal1.dispatch(2)
      expect(mockHook).toHaveBeenCalledTimes(1)

      signal2.dispatch(2)
      expect(mockHook).toHaveBeenCalledTimes(2)
    })

    it('应该处理重复信号', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal(0)
      // 传入重复的信号应该被去重
      const merged = mergeSignal(signal1, signal2, signal1)
      const mockHook = vi.fn()

      merged.hook(mockHook)

      signal1.dispatch(1)
      expect(mockHook).not.toHaveBeenCalled()

      signal2.dispatch(1)
      expect(mockHook).toHaveBeenCalledTimes(1)
    })
  })

  describe('OR 逻辑（individual: true）', () => {
    it('应该在任一信号触发时立即触发', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal('')
      const signal3 = createSignal(false)
      const merged = mergeSignal(signal1, signal2, signal3, { individual: true })
      const mockHook = vi.fn()

      merged.hook(mockHook)

      signal1.dispatch(1)
      expect(mockHook).toHaveBeenCalledTimes(1)

      signal2.dispatch('test')
      expect(mockHook).toHaveBeenCalledTimes(1) // 不应该再次触发

      signal3.dispatch(true)
      expect(mockHook).toHaveBeenCalledTimes(1) // 仍然不应该再次触发
    })

    it('应该只触发一次直到重置', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal(0)
      const merged = mergeSignal(signal1, signal2, { individual: true })
      const mockHook = vi.fn()

      merged.hook(mockHook)

      signal1.dispatch(1)
      expect(mockHook).toHaveBeenCalledTimes(1)

      // 即使其他信号触发也不应该再次触发
      signal2.dispatch(1)
      signal1.dispatch(2)
      expect(mockHook).toHaveBeenCalledTimes(1)
    })
  })

  describe('缓存机制', () => {
    it('应该缓存相同信号组合的合并信号', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal('')

      const merged1 = mergeSignal(signal1, signal2)
      const merged2 = mergeSignal(signal1, signal2)
      const merged3 = mergeSignal(signal2, signal1) // 顺序不同但应该是同一个

      expect(merged1).toBe(merged2)
      expect(merged1).toBe(merged3)
    })

    it('应该为不同的选项创建不同的合并信号', () => {
      const signal1 = createSignal(0)
      const signal2 = createSignal('')

      const merged1 = mergeSignal(signal1, signal2)
      const merged2 = mergeSignal(signal1, signal2, { individual: true })

      expect(merged1).not.toBe(merged2)
    })
  })

  describe('边界情况', () => {
    it('应该处理单个信号', () => {
      const signal = createSignal(0)
      const merged = mergeSignal(signal)
      const mockHook = vi.fn()

      merged.hook(mockHook)
      signal.dispatch(1)

      expect(mockHook).toHaveBeenCalledTimes(1)
    })

    it('应该处理大量信号', () => {
      const signals = Array.from({ length: 10 }, () => createSignal(0))
      const merged = mergeSignal(...signals)
      const mockHook = vi.fn()

      merged.hook(mockHook)

      // 触发前 9 个信号，不应该触发合并信号
      for (let i = 0; i < 9; i++) {
        signals[i].dispatch(i + 1)
        expect(mockHook).not.toHaveBeenCalled()
      }

      // 触发最后一个信号，应该触发合并信号
      signals[9].dispatch(10)
      expect(mockHook).toHaveBeenCalledTimes(1)
    })
  })
})
