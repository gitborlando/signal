import { describe, expect, it, vi } from 'vitest'
import { batchSignal, createSignal } from '../signal'

describe('batchSignal', () => {
  describe('延迟执行模式', () => {
    // it('应该返回一个延迟执行函数', () => {
    //   const signal1 = createSignal(0)
    //   const signal2 = createSignal('')

    //   const flush = batchSignal(signal1, signal2)

    //   expect(typeof flush).toBe('function')
    // })

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

      expect(hook1).toHaveBeenCalledWith(0, 1)
      expect(hook2).toHaveBeenCalledWith('test', '')
    })
  })
})
