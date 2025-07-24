import { describe, expect, it, vi } from 'vitest'
import { batchSignal, createSignal, derivedSignal, mergeSignal } from '../signal'

describe('集成测试', () => {
  describe('deriveSignal + batchSignal', () => {
    it('应该在批量处理中只计算一次派生信号', () => {
      const firstName = createSignal('张')
      const lastName = createSignal('三')
      const fullName = derivedSignal(
        firstName,
        lastName,
        (first, last) => `${first}${last}`,
      )
      const mockHook = vi.fn()

      fullName.hook(mockHook)

      batchSignal(() => {
        firstName.dispatch('李')
        firstName.dispatch('王')
        lastName.dispatch('四')
        lastName.dispatch('五')
      })

      // 应该只触发一次，避免中间状态 "李三"
      expect(mockHook).toHaveBeenCalledTimes(1)
      expect(mockHook).toHaveBeenCalledWith('王五', '张三', undefined)
      expect(fullName.value).toBe('王五')
    })
  })

  describe('mergeSignal + deriveSignal', () => {
    it('应该在合并信号触发时重新计算派生信号', () => {
      const signal1 = createSignal(1)
      const signal2 = createSignal(2)
      const signal3 = createSignal(3)

      const merged = mergeSignal(signal1, signal2, signal3)
      const sum = derivedSignal(signal1, signal2, signal3, (a, b, c) => a + b + c)
      const derivedFromMerged = derivedSignal(merged, sum, () => sum.value)

      const mockHook = vi.fn()
      derivedFromMerged.hook(mockHook)

      expect(sum.value).toBe(6)

      // 触发所有信号以触发合并信号
      signal1.dispatch(10)
      signal2.dispatch(20)
      signal3.dispatch(30)

      expect(mockHook).toHaveBeenCalled()
      expect(sum.value).toBe(60)
      expect(derivedFromMerged.value).toBe(60)
    })
  })

  describe('复杂业务场景', () => {
    it('应该支持用户状态管理场景', () => {
      // 模拟用户状态管理
      const userId = createSignal<number | null>(null)
      const userName = createSignal('')
      const userAge = createSignal(0)
      const isLoggedIn = createSignal(false)

      // 派生信号
      const userProfile = derivedSignal(
        userId,
        userName,
        userAge,
        (id, name, age) => ({
          id,
          name,
          age,
          isAdult: age >= 18,
        }),
      )

      const userStatus = derivedSignal(
        isLoggedIn,
        userProfile,
        (loggedIn, profile) =>
          loggedIn
            ? `${profile.name} (${profile.isAdult ? '成人' : '未成年'})`
            : '未登录',
      )

      const statusHook = vi.fn()
      userStatus.hook(statusHook)

      // 登录流程
      batchSignal(() => {
        userId.dispatch(1)
        userName.dispatch('张三')
        userAge.dispatch(25)
        isLoggedIn.dispatch(true)
      })

      expect(userProfile.value).toEqual({
        id: 1,
        name: '张三',
        age: 25,
        isAdult: true,
      })
      expect(userStatus.value).toBe('张三 (成人)')
      expect(statusHook).toHaveBeenCalledTimes(1)
    })

    it('应该支持购物车场景', () => {
      // 模拟购物车状态
      const items = createSignal<
        Array<{ id: number; price: number; quantity: number }>
      >([])
      const discount = createSignal(0)
      const tax = createSignal(0.1)

      // 计算总价
      const subtotal = derivedSignal(items, (items) =>
        items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      )

      const discountAmount = derivedSignal(
        subtotal,
        discount,
        (sub, disc) => sub * disc,
      )

      const taxAmount = derivedSignal(
        subtotal,
        discountAmount,
        tax,
        (sub, disc, taxRate) => (sub - disc) * taxRate,
      )

      const total = derivedSignal(
        subtotal,
        discountAmount,
        taxAmount,
        (sub, disc, tax) => sub - disc + tax,
      )

      const totalHook = vi.fn()
      total.hook(totalHook)

      // 添加商品
      items.dispatch([
        { id: 1, price: 100, quantity: 2 },
        { id: 2, price: 50, quantity: 1 },
      ])

      expect(subtotal.value).toBe(250)
      expect(total.value).toBe(275) // 250 + 25 (tax)

      // 应用折扣
      discount.dispatch(0.1) // 10% 折扣

      expect(discountAmount.value).toBe(25)
      expect(total.value).toBe(247.5) // (250 - 25) * 1.1
    })

    it('应该支持表单验证场景', () => {
      const email = createSignal('')
      const password = createSignal('')
      const confirmPassword = createSignal('')

      const emailValid = derivedSignal(email, (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      )

      const passwordValid = derivedSignal(password, (pwd) => pwd.length >= 6)

      const passwordsMatch = derivedSignal(
        password,
        confirmPassword,
        (pwd, confirm) => pwd === confirm && pwd.length > 0,
      )

      const formValid = derivedSignal(
        emailValid,
        passwordValid,
        passwordsMatch,
        (emailOk, pwdOk, pwdMatch) => emailOk && pwdOk && pwdMatch,
      )

      const validationHook = vi.fn()
      formValid.hook(validationHook)

      // 填写表单
      batchSignal(() => {
        email.dispatch('test@example.com')
        password.dispatch('password123')
        confirmPassword.dispatch('password123')
      })

      expect(emailValid.value).toBe(true)
      expect(passwordValid.value).toBe(true)
      expect(passwordsMatch.value).toBe(true)
      expect(formValid.value).toBe(true)
      expect(validationHook).toHaveBeenCalledWith(true, false, undefined)
    })
  })

  describe('性能和内存管理', () => {
    it('应该处理大量信号的复杂依赖', () => {
      const signals = Array.from({ length: 100 }, (_, i) => createSignal(i))

      const sum = derivedSignal(...signals, (...values) =>
        values.reduce((acc, val) => acc + val, 0),
      )

      const average = derivedSignal(sum, (total) => total / signals.length)

      const mockHook = vi.fn()
      average.hook(mockHook)

      // 批量更新所有信号
      batchSignal(() => {
        signals.forEach((signal, i) => signal.dispatch(i * 2))
      })

      const expectedSum = signals.reduce((acc, _, i) => acc + i * 2, 0)
      expect(sum.value).toBe(expectedSum)
      expect(average.value).toBe(expectedSum / signals.length)
      expect(mockHook).toHaveBeenCalledTimes(1)
    })

    it('应该正确清理内存和事件监听器', () => {
      const source = createSignal(0)
      const derived = derivedSignal(source, (x) => x * 2)
      const mockHook = vi.fn()

      const unsubscribe = derived.hook(mockHook)

      source.dispatch(5)
      expect(mockHook).toHaveBeenCalledTimes(1)

      // 取消订阅
      unsubscribe()

      source.dispatch(10)
      expect(mockHook).toHaveBeenCalledTimes(1) // 不应该再次调用
    })
  })
})
