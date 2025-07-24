import { createCache, iife } from '@gitborlando/utils'
import type { Hook, HookOption } from './types'
import { getSignalId } from './utils'

/**
 * 响应式信号类
 * @template T - 信号值的类型
 *
 * @example
 * ```typescript
 * // 基础使用
 * const count = new Signal(0)
 *
 * // 监听变化
 * const unsubscribe = count.hook((value, oldValue) => {
 *   console.log(`计数: ${oldValue} → ${value}`)
 * })
 *
 * // 触发更新
 * count.dispatch(1)
 * count.dispatch(2)
 *
 * // 取消监听
 * unsubscribe()
 * ```
 */
export class Signal<T extends any> {
  #newValue: T
  #oldValue: T
  #hooks: Hook<T>[] = []
  #optionCache = new Map<Hook<T>, HookOption>()
  #intercept?: (value: T) => T | void
  #batchStartOldValue?: T // 批量操作开始时的oldValue

  /**
   * 创建一个新的信号实例
   * @param value - 初始值
   *
   * @example
   * ```typescript
   * const count = new Signal(0)
   * const name = new Signal('张三')
   * const isVisible = new Signal(true)
   * ```
   */
  constructor(value?: T) {
    this.#newValue = value as T
    this.#oldValue = value as T
  }

  /**
   * 获取前一个值（旧值）
   * @readonly
   *
   * @example
   * ```typescript
   * const count = new Signal(0)
   * count.dispatch(1)
   * console.log(count.oldValue) // 0
   * console.log(count.value)    // 1
   * ```
   */
  get oldValue(): T {
    return this.#oldValue
  }

  /**
   * 获取或设置当前值
   *
   * @example
   * ```typescript
   * const count = new Signal(0)
   * console.log(count.value) // 0
   *
   * count.value = 42
   * console.log(count.value) // 42
   * ```
   */
  get value(): T {
    return this.#newValue
  }

  set value(value: T) {
    // 在批量模式下，不更新oldValue
    if (!batchingLayerCount) {
      this.#oldValue = this.#newValue
    } else if (this.#batchStartOldValue === undefined) {
      // 批量操作开始时保存oldValue
      this.#batchStartOldValue = this.#newValue
    }

    const interceptRes = this.#intercept?.(value)
    this.#newValue = interceptRes ?? value
  }

  /**
   * 添加 Hook 监听器（简单版本）
   * @param hook - 回调函数
   * @returns 取消监听的函数
   *
   * @example
   * ```typescript
   * const unsubscribe = signal.hook((value, oldValue) => {
   *   console.log(`${oldValue} → ${value}`)
   * })
   *
   * // 取消监听
   * unsubscribe()
   * ```
   */
  hook(hook: Hook<T>): () => void
  /**
   * 添加 Hook 监听器（带选项）
   * @param option - Hook 选项
   * @param hook - 回调函数
   * @returns 取消监听的函数
   *
   * @example
   * ```typescript
   * const unsubscribe = signal.hook({
   *   immediately: true,
   *   once: true
   * }, (value) => {
   *   console.log('立即执行且只执行一次:', value)
   * })
   * ```
   */
  hook(option: HookOption, hookCallback: Hook<T>): () => void
  hook(hookOrOption: Hook<T> | HookOption, hookCallback?: Hook<T>) {
    const [hookFunc, option] = iife(() => {
      let option = {} as HookOption
      let hookFunc = hookOrOption as Hook<T>
      if (typeof hookOrOption === 'function') {
        hookFunc = hookOrOption
      } else {
        option = hookOrOption
        hookFunc = hookCallback!
      }
      return [hookFunc, option] as const
    })

    const hook: Hook<T> = (newValue: T, oldValue: T, args?: any) => {
      hookFunc(newValue, oldValue, args)
    }
    hook.deriving = isDeriving

    this.#optionCache.set(hook, option)

    switch (true) {
      case option?.immediately && option?.once:
        hook(this.value, this.#oldValue)
        break

      case option?.immediately:
        hook(this.value, this.#oldValue)
        this.#hooks.push(hook)
        break

      case option?.once:
        const onceFunc = (newValue: T, oldValue: T, args?: any) => {
          hook(newValue, oldValue, args)
          this.#unHook(onceFunc)
        }
        this.#optionCache.set(onceFunc, option)
        this.#hooks.push(onceFunc)
        break

      default:
        this.#hooks.push(hook)
        break
    }

    this.#reHierarchy()

    return () => this.#unHook(hook)
  }

  /**
   * 派发信号更新
   * @param value - 新值或更新函数
   * @param args - 额外参数
   *
   * @example
   * ```typescript
   * // 直接设置值
   * signal.dispatch(42)
   *
   * // 使用函数更新
   * signal.dispatch((currentValue) => {
   *   console.log('当前值:', currentValue)
   * })
   *
   * // 带额外参数
   * signal.dispatch(42, { source: 'user-input' })
   * ```
   */
  dispatch = (value?: T | ((value: T) => void), args?: any) => {
    if (typeof value === 'function') {
      ;(value as Function)(this.value)
    } else if (value !== undefined) {
      this.value = value
    }

    if (batchingLayerCount > 0) {
      const batchOldValue =
        this.#batchStartOldValue !== undefined
          ? this.#batchStartOldValue
          : this.#oldValue

      this.#hooks.forEach((hook) => {
        if (hook.deriving) {
          hook(this.value, batchOldValue, args)
        } else {
          batchedHookArgsMap.set(hook, [this.value, batchOldValue, args])
        }
      })

      return
    }

    this.#hooks.forEach((hook) => hook(this.value, this.#oldValue, args))
  }

  /**
   * 设置拦截器
   * @param handle - 拦截处理函数
   *
   * @example
   * ```typescript
   * const count = new Signal(0)
   *
   * // 拦截负值
   * count.intercept((value) => {
   *   return value < 0 ? 0 : value
   * })
   *
   * count.dispatch(-5)
   * console.log(count.value) // 0
   * ```
   */
  intercept(handle: (value: T) => T | void) {
    this.#intercept = handle
  }

  /**
   * 移除所有监听器
   *
   * @example
   * ```typescript
   * const count = new Signal(0)
   * count.hook(() => console.log('hook1'))
   * count.hook(() => console.log('hook2'))
   *
   * count.removeAll()
   * count.dispatch(1) // 不会触发任何hook
   * ```
   */
  removeAll() {
    this.#hooks = []
    this.#optionCache.clear()
  }

  /**
   * 移除指定的 Hook
   * @private
   */
  #unHook(targetHook: Hook<T>) {
    this.#hooks = this.#hooks.filter((hook) => hook !== targetHook)
    this.#optionCache.delete(targetHook)
  }

  /**
   * 重新排列 Hook 执行顺序
   * @private
   */
  #reHierarchy() {
    const beforeAllHooks: Hook<T>[] = []
    const afterAllHooks: Hook<T>[] = []
    const normalHooks: Hook<T>[] = []

    this.#hooks.forEach((hook) => {
      const option = this.#optionCache.get(hook)

      switch (true) {
        case option?.beforeAll:
          beforeAllHooks.push(hook)
          break
        case option?.afterAll:
          afterAllHooks.push(hook)
          break
        default:
          normalHooks.push(hook)
          break
      }
    })

    const sortedNormalHooks = normalHooks.sort((a, b) => {
      const optionA = this.#optionCache.get(a)
      const optionB = this.#optionCache.get(b)

      if (optionA?.after === optionB?.id) return 1
      if (optionA?.before === optionB?.id) return -1
      if (optionB?.after === optionA?.id) return -1
      if (optionB?.before === optionA?.id) return 1

      return 0
    })

    this.#hooks = [...beforeAllHooks, ...sortedNormalHooks, ...afterAllHooks]
  }
}

/**
 * 创建一个新的信号实例
 * @template T - 信号值的类型
 * @param value - 初始值
 * @returns 新的信号实例
 *
 * @example
 * ```typescript
 * const count = createSignal(0)
 * const name = createSignal('张三')
 * const isVisible = createSignal(true)
 *
 * // 监听变化
 * count.hook((value, oldValue) => {
 *   console.log(`计数: ${oldValue} → ${value}`)
 * })
 *
 * // 触发更新
 * count.dispatch(1)
 * ```
 */
export function createSignal<T extends any>(value?: T): Signal<T> {
  return new Signal<T>(value)
}

let isDeriving = false

/**
 * 创建派生信号（多个源信号）
 * @template Signals - 源信号数组的类型
 * @template Result - 派生信号值的类型
 * @param args - 源信号数组和计算函数
 * @returns 派生信号
 *
 * @example
 * ```typescript
 * const firstName = createSignal('张')
 * const lastName = createSignal('三')
 * const fullName = deriveSignal(firstName, lastName, (first, last) => `${first}${last}`)
 *
 * firstName.dispatch('李')
 * lastName.dispatch('四')
 * console.log(fullName.value) // '李四'
 * ```
 */
export function derivedSignal<Signals extends readonly Signal<any>[], Result>(
  ...args: [
    ...Signals,
    (
      ...values: {
        [K in keyof Signals]: Signals[K] extends Signal<infer V> ? V : never
      }
    ) => Result,
  ]
): Signal<Result> {
  if (args.length < 2) {
    throw new Error('derive 函数需要至少两个参数')
  }
  if (args.slice(0, -1).some((s) => !(s instanceof Signal))) {
    throw new Error('derive 函数的倒数前N个参数必须是信号')
  }
  if (typeof args[args.length - 1] !== 'function') {
    throw new Error('derive 函数的最后一个参数必须是计算函数')
  }

  isDeriving = true

  const computeFn = args[args.length - 1] as Function
  const signals = args.slice(0, -1) as unknown as Signals

  const initialValue = computeFn(...signals.map((s) => s.value))
  const derivedSignal = createSignal<Result>(initialValue)

  const derivedHook = () => {
    const newValue = computeFn(...signals.map((s) => s.value))
    derivedSignal.dispatch(newValue)
  }
  signals.forEach((s) => s.hook(derivedHook))

  isDeriving = false

  return derivedSignal
}

const mergeSignalCache = createCache<string, Signal<any>>()

/**
 * 合并信号（所有信号都触发才触发）
 * @param signals - 信号数组
 * @returns 合并信号
 *
 * @example
 * ```typescript
 * const signal1 = createSignal(1)
 * const signal2 = createSignal(2)
 * const signal3 = createSignal(3)
 *
 * const merged = mergeSignal(signal1, signal2, signal3)
 *
 * merged.hook(() => {
 *   console.log('所有信号都触发了')
 * })
 *
 * // 需要所有信号都触发一次才会触发merged
 * signal1.dispatch(10)
 * signal2.dispatch(20)
 * signal3.dispatch(30) // 这时才会触发merged
 * ```
 */
export function mergeSignal(...signals: Signal<any>[]): Signal<void> {
  signals = [...new Set(signals)] as Signal<any>[]

  const signalsKey = signals
    .map((s) => getSignalId(s))
    .sort()
    .join('-')

  return mergeSignalCache.getSet(signalsKey, () => {
    const mergedSignal = createSignal<void>()
    const allTriggered = (1 << signals.length) - 1
    let currentState = 0

    signals.forEach((signal, index) => {
      const bitMask = 1 << index
      signal.hook(() => {
        currentState |= bitMask

        if (currentState === allTriggered) {
          mergedSignal.dispatch()
          currentState = 0
        }
      })
    })

    return mergedSignal
  })
}

// 批处理相关变量
let batchingLayerCount = 0
const batchedHookArgsMap = new Map<Hook<any>, [any, any, any]>()

/**
 * 批量处理信号更新
 * @param callback - 批处理回调函数
 *
 * @example
 * ```typescript
 * const count = createSignal(0)
 * const name = createSignal('张三')
 *
 * const derived = deriveSignal(count, name, (c, n) => `${n}: ${c}`)
 *
 * derived.hook((value) => {
 *   console.log('派生值:', value)
 * })
 *
 * // 批量更新：derived只会计算一次
 * batchSignal(() => {
 *   count.dispatch(42)
 *   name.dispatch('李四')
 * })
 * // 输出: 派生值: 李四: 42
 * ```
 */
export function batchSignal(callback: () => void): void {
  batchingLayerCount++

  callback()

  const delayDispatch = () => {
    batchedHookArgsMap.forEach((args, hook) => hook(...args))
    batchedHookArgsMap.clear()
  }

  if (batchingLayerCount > 0) {
    batchingLayerCount--
  }
  if (batchingLayerCount === 0) {
    delayDispatch()
  }
}
