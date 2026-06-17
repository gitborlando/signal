import { createCache, iife, objectKey } from '@gitborlando/utils'
import type { Hook, HookOption } from './types'

/**
 * 合并信号缓存
 * Merge signal cache
 */
const mergeSignalCache = createCache<string, Signal<any>>()

/**
 * 批处理层级计数
 * Batch processing layer count
 */
let batchingLayerCount = 0

/**
 * 批处理钩子参数映射
 * Batched hook arguments mapping
 */
const batchedHookArgsMap = new Map<Hook<any>, [any, any]>()

/**
 * 批处理中发生变更的信号集合
 * Signals changed during batch processing
 */
const batchedSignals = new Set<Signal<any>>()

/**
 * 响应式信号类
 * Reactive signal class
 *
 * @template T - 信号值的类型 / The type of signal value
 *
 * @example
 * ```typescript
 * // 基础使用 / Basic usage
 * const count = new Signal(0)
 *
 * // 监听变化 / Listen to changes
 * const unHook = count.hook((value, oldValue) => {
 *   console.log(`计数: ${oldValue} → ${value}`)
 * })
 *
 * // 触发更新 / Trigger updates
 * count.dispatch(1)
 * count.dispatch(2)
 *
 * // 取消监听 / unHook
 * unHook()
 * ```
 */
export class Signal<T extends any> {
  /**
   * 新值（当前值）
   * New value (current value)
   */
  #newValue: T

  /**
   * 旧值（前一个值）
   * Old value (previous value)
   */
  #oldValue: T

  /**
   * 批处理开始时的旧值
   * Old value at the start of batch processing
   */
  #batchStartOldValue?: T

  /**
   * 是否已保存批处理开始时的旧值
   * Whether the old value at the start of batch processing has been saved
   */
  #hasBatchStartOldValue = false

  /**
   * 钩子函数数组
   * Array of hook functions
   */
  #hooks: Hook<T>[] = []

  /**
   * 存储hook的内部信息
   * 用于在派发更新时，判断hook是否是派生hook以及hook的选项
   *
   * Store internal information of hooks
   * Used to determine if a hook is a derived hook and its options when dispatching updates
   */
  #hookOptionMap = new Map<Hook<any>, HookOption>()

  /**
   * 获取钩子的内部信息
   * Get internal information of a hook
   *
   * @param hook - 钩子函数 / Hook function
   * @returns 钩子内部信息 / Hook internal information
   */
  #getHookOption(hook: Hook<any>) {
    return this.#hookOptionMap.get(hook)!
  }

  /**
   * 创建一个新的信号实例
   * Create a new signal instance
   *
   * @param value - 初始值 / Initial value
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
   * Get the previous value (old value)
   *
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
   * Get or set the current value
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
    // In batch mode, don't update oldValue
    if (!batchingLayerCount) {
      this.#oldValue = this.#newValue
    } else if (!this.#hasBatchStartOldValue) {
      // 批量操作开始时保存oldValue
      // Save oldValue at the start of batch operation
      this.#batchStartOldValue = this.#newValue
      this.#hasBatchStartOldValue = true
      batchedSignals.add(this)
    }

    this.#newValue = value
  }

  /**
   * 添加 Hook 监听器（简单版本）
   * Add Hook listener (simple version)
   *
   * @param hook - 回调函数 / Callback function
   * @returns 取消监听的函数 / Function to cancel subscription
   *
   * @example
   * ```typescript
   * const unHook = signal.hook((value, oldValue) => {
   *   console.log(`${oldValue} → ${value}`)
   * })
   *
   * // 取消监听 / Cancel subscription
   * unHook()
   * ```
   */
  hook(hook: Hook<T>): () => void
  /**
   * 添加 Hook 监听器（带选项）
   * Add Hook listener (with options)
   *
   * @param option - Hook 选项 / Hook options
   * @param hook - 回调函数 / Callback function
   * @returns 取消监听的函数 / Function to cancel subscription
   *
   * @example
   * ```typescript
   * const unHook = signal.hook({
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

    const hook: Hook<T> = (newValue: T, oldValue: T) => {
      hookFunc(newValue, oldValue)
    }

    let storedHook: Hook<T> | undefined

    switch (true) {
      case option?.immediately && option?.once:
        hook(this.value, this.#oldValue)
        break

      case option?.immediately:
        hook(this.value, this.#oldValue)
        storedHook = hook
        this.#hooks.push(storedHook)
        break

      case option?.once:
        const onceFunc = (newValue: T, oldValue: T) => {
          hook(newValue, oldValue)
          this.#unHook(onceFunc)
        }
        storedHook = onceFunc
        this.#hooks.push(storedHook)
        break

      default:
        storedHook = hook
        this.#hooks.push(storedHook)
        break
    }

    if (storedHook) {
      this.#hookOptionMap.set(storedHook, option)
    }

    this.#reHierarchy()

    return () => {
      if (storedHook) {
        this.#unHook(storedHook)
      }
    }
  }

  /**
   * 派发信号更新
   * Dispatch signal update
   *
   * @param value - 新值或更新函数 / New value or update function
   *
   * @example
   * ```typescript
   * // 直接设置值 / Directly set value
   * signal.dispatch(42)
   *
   * // 使用函数更新 / Update using function
   * signal.dispatch((currentValue) => {
   *   console.log('当前值:', currentValue)
   * })
   *
   * // 带额外参数 / With additional arguments
   * signal.dispatch(42, { source: 'user-input' })
   * ```
   */
  dispatch = (value?: T | ((value: T) => void)) => {
    if (typeof value === 'function') {
      ;(value as Function)(this.value)
    } else if (value !== undefined) {
      this.value = value
    }

    if (batchingLayerCount > 0) {
      const batchOldValue = this.#hasBatchStartOldValue
        ? this.#batchStartOldValue
        : this.#oldValue

      this.#hooks.forEach((hook) => {
        batchedHookArgsMap.set(hook, [this.value, batchOldValue])
      })

      return
    }

    this.#hooks.forEach((hook) => hook(this.value, this.#oldValue))
  }

  /**
   * 移除所有监听器
   * Remove all listeners
   *
   * @example
   * ```typescript
   * const count = new Signal(0)
   * count.hook(() => console.log('hook1'))
   * count.hook(() => console.log('hook2'))
   *
   * count.removeAll()
   * count.dispatch(1) // 不会触发任何hook / Won't trigger any hooks
   * ```
   */
  removeAll() {
    this.#hooks = []
    this.#hookOptionMap.clear()
  }

  /**
   * 移除指定的 Hook
   * Remove specified Hook
   *
   * @private
   * @param targetHook - 要移除的钩子 / Hook to remove
   */
  #unHook(targetHook: Hook<T>) {
    this.#hooks = this.#hooks.filter((hook) => hook !== targetHook)
    this.#hookOptionMap.delete(targetHook)
    batchedHookArgsMap.delete(targetHook)
  }

  /**
   * 清理批处理状态
   * Clear batch processing state
   */
  #clearBatchState() {
    this.#batchStartOldValue = undefined
    this.#hasBatchStartOldValue = false
  }

  /**
   * 重新排列 Hook 执行顺序
   * 根据选项中的 beforeAll、afterAll、before、after 等配置重新排序
   *
   * Rearrange Hook execution order
   * Reorder based on beforeAll, afterAll, before, after configurations in options
   *
   * @private
   */
  #reHierarchy() {
    const beforeAllHooks: Hook<any>[] = []
    const afterAllHooks: Hook<any>[] = []
    const normalHooks: Hook<any>[] = []

    this.#hooks.forEach((hook) => {
      const option = this.#getHookOption(hook)

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
      const optionA = this.#getHookOption(a)
      const optionB = this.#getHookOption(b)

      if (optionA?.after === optionB?.id) return 1
      if (optionA?.before === optionB?.id) return -1
      if (optionB?.after === optionA?.id) return -1
      if (optionB?.before === optionA?.id) return 1

      return 0
    })

    this.#hooks = [...beforeAllHooks, ...sortedNormalHooks, ...afterAllHooks]
  }

  /**
   * 创建一个新的信号实例
   * Create a new signal instance
   *
   * @template T - 信号值的类型 / The type of signal value
   * @param value - 初始值 / Initial value
   * @returns 新的信号实例 / New signal instance
   *
   * @example
   * ```typescript
   * const count = Signal.create(0)
   * const name = Signal.create('张三')
   * const isVisible = Signal.create(true)
   *
   * // 监听变化 / Listen to changes
   * count.hook((value, oldValue) => {
   *   console.log(`计数: ${oldValue} → ${value}`)
   * })
   *
   * // 触发更新 / Trigger update
   * count.dispatch(1)
   * ```
   */
  static create<T extends any>(value?: T): Signal<T> {
    return new Signal<T>(value)
  }

  /**
   * 合并信号（所有信号都触发才触发）
   * 创建一个合并信号，只有当所有输入信号都至少触发一次后才会触发
   *
   * Merge signals (triggers only when all signals have triggered)
   * Create a merged signal that triggers only after all input signals have triggered at least once
   *
   * @param signals - 信号数组 / Array of signals
   * @returns 合并信号 / Merged signal
   *
   * @example
   * ```typescript
   * const signal1 = createSignal(1)
   * const signal2 = createSignal(2)
   * const signal3 = createSignal(3)
   *
   * const merged = Signal.merge(signal1, signal2, signal3)
   *
   * merged.hook(() => {
   *   console.log('所有信号都触发了 / All signals have triggered')
   * })
   *
   * // 需要所有信号都触发一次才会触发merged
   * // All signals need to trigger once for merged to trigger
   * signal1.dispatch(10)
   * signal2.dispatch(20)
   * signal3.dispatch(30) // 这时才会触发merged / Now merged will trigger
   * ```
   */
  static merge(...signals: Signal<any>[]): Signal<void> {
    signals = [...new Set(signals)] as Signal<any>[]

    const signalsKey = signals
      .map((s) => objectKey(s))
      .sort()
      .join('-')

    return mergeSignalCache.getSet(signalsKey, () => {
      const mergedSignal = Signal.create<void>()
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

  /**
   * 批量处理信号更新
   * 在回调函数中的所有信号更新将被批量处理，避免重复计算
   *
   * Batch process signal updates
   * All signal updates within the callback will be batched to avoid redundant calculations
   *
   * @param callback - 批处理回调函数 / Batch processing callback function
   *
   * @example
   * ```typescript
   * const count = createSignal(0)
   *
   * Signal.batch(() => {
   *   count.dispatch(42)
   *   count.dispatch(43)
   *   count.dispatch(44)
   * })
   *
   * console.log(count.value) // 44
   * ```
   */
  static batch(callback: () => void): void {
    batchingLayerCount++

    try {
      callback()
    } finally {
      if (batchingLayerCount > 0) {
        batchingLayerCount--
      }

      if (batchingLayerCount === 0) {
        try {
          batchedHookArgsMap.forEach((args, hook) => hook(args[0], args[1]))
        } finally {
          batchedHookArgsMap.clear()
          batchedSignals.forEach((signal) => signal.#clearBatchState())
          batchedSignals.clear()
        }
      }
    }
  }
}
