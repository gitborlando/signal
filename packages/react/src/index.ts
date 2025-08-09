import { DeriveSignalCallback, HookOption, Signal } from 'g-signal'
import { useRef, useSyncExternalStore } from 'react'

/**
 * 在 React 组件中创建本地信号
 * @template T - 信号值的类型
 * @param init - 初始值
 * @returns 信号实例
 *
 * @example
 * ```typescript
 * function Counter() {
 *   // 创建本地信号，会自动处理组件的重新渲染
 *   const count = useSignal(0)
 *   const countValue = useHookSignal(count)
 *
 *   return (
 *     <div>
 *       <span>{countValue}</span>
 *       <button onClick={() => count.dispatch(countValue + 1)}>+</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useSignal<T extends any>(init?: T, shouldHook?: boolean): Signal<T> {
  const signal = useRef<Signal<T> | null>(null)
  if (!signal.current) {
    signal.current = Signal.create(init)
  }
  if (shouldHook) {
    useHookSignal(signal.current!)
  }
  return signal.current!
}

/**
 * 回调函数类型，接收值和强制更新函数
 * @template T - 信号值的类型
 * @param value - 信号的当前值
 * @param forceUpdate - 强制组件重新渲染的函数
 */
export type UseHookSignalCallback<T> = (
  value: T,
  oldValue: T,
  forceUpdate: () => void,
) => any

/**
 * 订阅信号并获取当前值（基础版本）
 * @template T - 信号值的类型
 * @param signal - 要订阅的信号
 * @returns 信号的当前值
 *
 * @example
 * ```typescript
 * function DisplayCount({ countSignal }: { countSignal: Signal<number> }) {
 *   const count = useHookSignal(countSignal)
 *   return <div>计数: {count}</div>
 * }
 * ```
 */
export function useHookSignal<T>(...args: [Signal<T>]): T
/**
 * 订阅信号并获取当前值（带选项版本）
 * @template T - 信号值的类型
 * @param signal - 要订阅的信号
 * @param option - Hook 选项
 * @returns 信号的当前值
 *
 * @example
 * ```typescript
 * function AutoCounter({ signal }: { signal: Signal<number> }) {
 *   // 立即执行一次
 *   const count = useHookSignal(signal, { immediately: true })
 *   return <div>自动计数: {count}</div>
 * }
 * ```
 */
export function useHookSignal<T>(...args: [Signal<T>, HookOption]): T
/**
 * 订阅信号并自定义处理逻辑（带回调版本）
 * @template T - 信号值的类型
 * @param signal - 要订阅的信号
 * @param callback - 自定义回调函数
 * @returns 信号的当前值
 *
 * @example
 * ```typescript
 * function SmartCounter({ signal }: { signal: Signal<number> }) {
 *   const count = useHookSignal(signal, (value, forceUpdate) => {
 *     // 自定义处理逻辑
 *     if (value > 10) {
 *       console.log('计数超过10了！')
 *     }
 *     // 可以控制是否更新组件
 *     forceUpdate()
 *   })
 *
 *   return <div>智能计数: {count}</div>
 * }
 * ```
 */
export function useHookSignal<T>(...args: [Signal<T>, UseHookSignalCallback<T>]): T
/**
 * 订阅信号并自定义处理逻辑（完整版本）
 * @template T - 信号值的类型
 * @param signal - 要订阅的信号
 * @param option - Hook 选项
 * @param callback - 自定义回调函数
 * @returns 信号的当前值
 *
 * @example
 * ```typescript
 * function AdvancedCounter({ signal }: { signal: Signal<number> }) {
 *   const count = useHookSignal(
 *     signal,
 *     { immediately: true, once: false },
 *     (value, forceUpdate) => {
 *       console.log('计数更新:', value)
 *       // 条件性更新
 *       if (value % 2 === 0) {
 *         forceUpdate()
 *       }
 *     }
 *   )
 *
 *   return <div>高级计数: {count}</div>
 * }
 * ```
 */
export function useHookSignal<T>(
  ...args: [Signal<T>, HookOption, UseHookSignalCallback<T>]
): T
export function useHookSignal<T>(
  ...args:
    | [Signal<T>]
    | [Signal<T>, HookOption]
    | [Signal<T>, UseHookSignalCallback<T>]
    | [Signal<T>, HookOption, UseHookSignalCallback<T>]
) {
  const signal = args[0]
  let option: HookOption = {}
  let callback: UseHookSignalCallback<T> | null = null
  if (args.length === 2) {
    if (typeof args[1] === 'function') {
      callback = args[1] as UseHookSignalCallback<T>
    } else {
      option = args[1] as HookOption
    }
  } else if (args.length === 3) {
    option = args[1] as HookOption
    callback = args[2] as UseHookSignalCallback<T>
  }

  useSyncExternalStore(
    (forceUpdate) => {
      if (!callback) {
        return signal.hook(option, forceUpdate)
      }
      return signal.hook(option as HookOption, (value, oldValue) => {
        callback(value, oldValue, forceUpdate)
      })
    },
    () => signal.value,
  )

  return signal.value
}

/**
 * 派生信号 / Derived signal
 * @param signals - 要派生的信号 / Signals to derive
 * @param callback - 派生回调函数 / Derived callback function
 * @returns 派生后的信号 / Derived signal
 *
 * @example
 * ```typescript
 * const signal1 = useSignal(1)
 * const signal2 = useSignal(2)
 * const derivedSignal = useDerivedSignal(signal1, signal2, (value1, value2) => value1 + value2)
 * ```
 */
export function useDerivedSignal<Signals extends Signal<any>[], Result>(
  ...args: [...Signals, DeriveSignalCallback<Signals, Result>]
): Signal<Result> {
  const signals = args.slice(0, -1) as unknown as Signals
  const callback = args[args.length - 1] as DeriveSignalCallback<Signals, Result>

  const signal = useRef<Signal<Result> | null>(null)
  if (!signal.current) {
    signal.current = Signal.derive(...signals, callback)
  }
  return signal.current!
}

/**
 * 合并多个信号 / Merge multiple signals
 * @param signals - 要合并的信号 / Signals to merge
 * @returns 合并后的信号 / Merged signal
 *
 * @example
 * ```typescript
 * const signal1 = useSignal(1)
 * const signal2 = useSignal(2)
 * const mergedSignal = useMergeSignal(signal1, signal2)
 * ```
 */
export function useMergeSignal<Signals extends Signal<any>[]>(
  ...signals: Signals
): Signal<void> {
  const signal = useRef<Signal<void> | null>(null)
  if (!signal.current) {
    signal.current = Signal.merge(...signals)
  }
  return signal.current!
}
