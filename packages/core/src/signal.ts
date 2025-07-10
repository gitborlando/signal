import type { Hook, HookOption, INoopFunc, MergeSignalOption } from './types'
import { createCache, getSignalId, iife } from './utils'

/**
 * 响应式信号类
 * @template T - 信号值的类型
 *
 * @example
 * ```typescript
 * // 基础使用
 * const count = createSignal(0)
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
 *
 * // 派生信号
 * const doubled = derive(count, (value) => value * 2)
 * const isEven = derive(count, (value) => value % 2 === 0)
 *
 * // 多信号派生
 * const firstName = createSignal('张')
 * const lastName = createSignal('三')
 * const fullName = derive(firstName, lastName, (first, last) => `${first}${last}`)
 *
 * // 批量处理 + 派生信号
 * batchSignal(firstName, lastName, () => {
 *   firstName.dispatch('李')
 *   lastName.dispatch('四')
 *   // fullName 只会计算一次，避免中间状态
 * })
 * ```
 */
export class Signal<T extends any> {
  #newValue: T
  #oldValue: T
  #intercept?: (value: T) => T | void
  #hooks: Hook<T>[] = []
  #optionCache = createCache<Hook<T>, HookOption>()

  /**
   * 创建信号实例
   * @param value - 初始值
   */
  constructor(value?: T) {
    this.#newValue = value as T
    this.#oldValue = value as T
  }

  /**
   * 获取当前值（新值）
   * @readonly
   */
  get newValue(): T {
    return this.#newValue
  }

  /**
   * 获取前一个值（旧值）
   * @readonly
   */
  get oldValue(): T {
    return this.#oldValue
  }

  /**
   * 获取当前值
   * @readonly
   */
  get value(): T {
    return this.#newValue
  }

  /**
   * 设置新值
   * @param value - 新值
   */
  set value(value: T) {
    this.#oldValue = this.#newValue
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
  hook(option: HookOption, hook: Hook<T>): () => void
  hook(hookOrOption: Hook<T> | HookOption, hookCallback?: Hook<T>) {
    const [hook, option] = iife(() => {
      if (typeof hookOrOption === 'function') {
        return [hookOrOption, {}]
      }
      return [hookCallback!, hookOrOption]
    })

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
        const onceFunc = () => {
          hook(this.value, this.#oldValue)
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

    if (batchedSignalMap.get(this)?.[0]) {
      return batchedSignalMap.set(this, [true, args])
    }

    this.#hooks.forEach((hook) => hook(this.value, this.#oldValue, args))
  }

  intercept(handle: (value: T) => T | void) {
    this.#intercept = handle
  }

  removeAll() {
    this.#hooks = []
    this.#optionCache.clear()
  }

  /**
   * 内部方法：直接触发所有 hooks（用于批量处理）
   * @internal
   */
  _flushHooks(args?: any) {
    this.#hooks.forEach((hook) => hook(this.value, this.#oldValue, args))
  }

  #unHook(hook: Hook<T>) {
    const index = this.#hooks.findIndex((i) => i === hook)
    index !== -1 && this.#hooks.splice(index, 1)
  }

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
 * 创建新的信号实例
 * @template T - 信号值的类型
 * @param value - 初始值
 * @returns 信号实例
 *
 * @example
 * ```typescript
 * // 基础类型
 * const count = createSignal(0)
 * const message = createSignal('Hello')
 * const isLoading = createSignal(false)
 *
 * // 复杂类型
 * const user = createSignal<{ id: number; name: string }>()
 * const items = createSignal<string[]>([])
 *
 * // 可选类型
 * const optional = createSignal<number | null>(null)
 * ```
 */
export function createSignal<T extends any>(value?: T) {
  return new Signal<T>(value)
}

const mergeSignalCache = createCache<string, Signal<any>>()

/**
 * 合并多个信号（函数重载 - 基础版本）
 * @param signals - 要合并的信号数组
 * @returns 合并后的信号
 *
 * @example
 * ```typescript
 * const signal1 = createSignal(0)
 * const signal2 = createSignal('')
 * const signal3 = createSignal(false)
 *
 * // 默认 AND 逻辑：所有信号都触发后才触发
 * const merged = mergeSignal(signal1, signal2, signal3)
 *
 * merged.hook(() => {
 *   console.log('所有信号都已触发')
 * })
 * ```
 */
export function mergeSignal(...args: Signal<any>[]): Signal<void>
/**
 * 合并多个信号（函数重载 - 带选项版本）
 * @param args - 信号数组 + 选项对象
 * @returns 合并后的信号
 *
 * @example
 * ```typescript
 * const signal1 = createSignal(0)
 * const signal2 = createSignal('')
 * const signal3 = createSignal(false)
 *
 * // OR 逻辑：任何信号触发都会触发
 * const merged = mergeSignal(signal1, signal2, signal3, { individual: true })
 *
 * merged.hook(() => {
 *   console.log('有信号触发了')
 * })
 * ```
 */
export function mergeSignal(
  ...args: [...Signal<any>[], MergeSignalOption]
): Signal<void>
export function mergeSignal(
  ...args: Signal<any>[] | [...Signal<any>[], MergeSignalOption]
) {
  const [signals, option] = iife(() => {
    let signals = [] as Signal<any>[]
    let option = {} as MergeSignalOption
    const lastArg = args[args.length - 1]

    if (lastArg instanceof Signal) {
      signals = args as Signal<any>[]
    } else {
      signals = args.slice(0, -1) as Signal<any>[]
      option = lastArg
    }

    return [[...new Set(signals)], option]
  })

  const cacheKey = signals
    .map((s) => getSignalId(s))
    .sort()
    .join('-')

  return mergeSignalCache.getSet(cacheKey, () => {
    const mergedSignal = createSignal<void>()
    const allTriggered = (1 << signals.length) - 1
    let currentState = 0

    if (option.individual === true) {
      signals.forEach((signal) =>
        signal.hook(() => {
          if (currentState === allTriggered) return
          mergedSignal.dispatch()
          currentState = allTriggered
        }),
      )
      return mergedSignal
    }

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

const batchedSignalMap = createCache<Signal<any>, [boolean, any]>()

/**
 * 批量处理信号（函数重载 - 返回延迟函数）
 * @param signals - 要批量处理的信号数组
 * @returns 延迟执行函数
 *
 * @example
 * ```typescript
 * const signal1 = createSignal(0)
 * const signal2 = createSignal('')
 *
 * // 设置批量模式
 * const flush = batchSignal(signal1, signal2)
 *
 * // 批量更新（不会立即触发 hooks）
 * signal1.dispatch(1)
 * signal2.dispatch('hello')
 *
 * // 手动触发
 * flush()
 * ```
 */
export function batchSignal(...args: Signal<any>[]): INoopFunc
/**
 * 批量处理信号（函数重载 - 带回调函数）
 * @param args - 信号数组 + 回调函数
 *
 * @example
 * ```typescript
 * const signal1 = createSignal(0)
 * const signal2 = createSignal('')
 *
 * // 在回调中批量更新
 * batchSignal(signal1, signal2, () => {
 *   console.log('开始批量更新')
 *   signal1.dispatch(1)
 *   signal2.dispatch('hello')
 *   console.log('批量更新完成')
 * })
 * ```
 */
export function batchSignal(...args: [...Signal<any>[], INoopFunc]): void
export function batchSignal(...args: Signal<any>[] | [...Signal<any>[], INoopFunc]) {
  let [signals, callback] = iife(() => {
    const lastArg = args[args.length - 1]
    if (typeof lastArg === 'function') {
      return [args.slice(0, -1) as Signal<any>[], lastArg]
    }
    return [args as Signal<any>[]]
  })

  signals = [...new Set(signals)]

  signals.forEach((signal) => batchedSignalMap.set(signal, [true, undefined]))

  const delayDispatch = () => {
    signals.forEach((signal) => {
      signal.dispatch(batchedSignalMap.get(signal)?.[1])
      batchedSignalMap.set(signal, [false, undefined])
    })
  }

  if (!callback) return delayDispatch

  callback()
  delayDispatch()
}

/**
 * 创建派生信号（函数重载 - 单个信号）
 * @template T - 源信号值类型
 * @template R - 派生信号值类型
 * @param signal - 源信号
 * @param computeFn - 计算函数
 * @returns 派生信号
 *
 * @example
 * ```typescript
 * const count = createSignal(0)
 * const doubled = derive(count, (value) => value * 2)
 * const isEven = derive(count, (value) => value % 2 === 0)
 *
 * doubled.hook((value) => {
 *   console.log('双倍值:', value)
 * })
 *
 * count.dispatch(5) // 输出: 双倍值: 10
 *
 * // 与批量处理结合使用
 * const flush = batchSignal(count)
 * count.dispatch(3) // 不会立即触发 doubled 的计算
 * count.dispatch(7) // 不会立即触发 doubled 的计算
 * flush() // 现在才会计算 doubled，输出: 双倍值: 14
 * ```
 */
export function deriveSignal<T, R>(
  signal: Signal<T>,
  computeFn: (value: T) => R,
): Signal<R>
/**
 * 创建派生信号（函数重载 - 多个信号）
 * @template T - 源信号值类型的联合
 * @template R - 派生信号值类型
 * @param args - 信号数组 + 计算函数
 * @returns 派生信号
 *
 * 注意：多信号 derive 使用 mergeSignal 实现批量处理，
 * 只有当所有依赖信号都触发过后才会重新计算。
 *
 * @example
 * ```typescript
 * const firstName = createSignal('张')
 * const lastName = createSignal('三')
 * const fullName = derive(firstName, lastName, (first, last) => `${first}${last}`)
 *
 * fullName.hook((value) => {
 *   console.log('全名:', value)
 * })
 *
 * // 单独更新
 * firstName.dispatch('李') // 输出: 全名: 李三
 * lastName.dispatch('四')  // 输出: 全名: 李四
 *
 * // 使用 batchSignal 批量更新
 * batchSignal(firstName, lastName, () => {
 *   firstName.dispatch('王')
 *   lastName.dispatch('五')
 * })
 * // 只会输出一次: 全名: 王五
 * ```
 */
export function deriveSignal<T extends Signal<any>[], R>(
  ...args: [
    ...T,
    (...values: { [K in keyof T]: T[K] extends Signal<infer U> ? U : never }) => R,
  ]
): Signal<R>
export function deriveSignal<R>(...args: any[]): Signal<R> {
  const [signals, computeFn] = iife(() => {
    const lastArg = args[args.length - 1]
    if (typeof lastArg === 'function') {
      return [args.slice(0, -1) as Signal<any>[], lastArg]
    }
    throw new Error('derive 函数的最后一个参数必须是计算函数')
  })

  if (signals.length === 0) {
    throw new Error('derive 函数至少需要一个源信号')
  }

  // 计算初始值
  const initialValue =
    signals.length === 1
      ? computeFn(signals[0].value)
      : computeFn(...signals.map((s) => s.value))

  const derivedSignal = createSignal<R>(initialValue)

  if (signals.length === 1) {
    // 单信号情况，直接监听
    signals[0].hook(() => {
      const newValue = computeFn(signals[0].value)
      derivedSignal.dispatch(newValue)
    })
  } else {
    // 多信号情况，使用 mergeSignal 实现批量处理
    const mergedSignal = mergeSignal(...signals)
    mergedSignal.hook(() => {
      const newValue = computeFn(...signals.map((s) => s.value))
      derivedSignal.dispatch(newValue)
    })
  }

  return derivedSignal
}
