import { HookOption, Signal, createSignal } from 'g-signal'
import { useEffect, useRef, useState } from 'react'
import { iife } from './utils'

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
export function useSignal<T extends any>(init?: T): Signal<T> {
  const signal = useRef(createSignal(init))
  useHookSignal(signal.current)
  return signal.current
}

/**
 * 回调函数类型，接收值和强制更新函数
 * @template T - 信号值的类型
 * @param value - 信号的当前值
 * @param forceUpdate - 强制组件重新渲染的函数
 */
export type ICallback<T> = (value: T, forceUpdate: () => void) => any

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
export function useHookSignal<T>(...args: [Signal<T>, ICallback<T>]): T
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
export function useHookSignal<T>(...args: [Signal<T>, HookOption, ICallback<T>]): T
export function useHookSignal<T>(
  ...args:
    | [Signal<T>]
    | [Signal<T>, HookOption]
    | [Signal<T>, ICallback<T>]
    | [Signal<T>, HookOption, ICallback<T>]
) {
  const [signal, option, callback] = iife(() => {
    if (args.length === 1) {
      return [args[0], {}, null]
    }
    if (args.length === 2) {
      if (typeof args[1] === 'function') {
        return [args[0], {}, args[1] as ICallback<T>]
      }
      return [args[0], args[1] as HookOption, null]
    }
    return [args[0], args[1] as HookOption, args[2] as ICallback<T>]
  })

  const [_, setState] = useState({})
  const forceUpdate = () => setState({})

  useEffect(() => {
    if (callback) {
      return signal.hook(option as HookOption, (value) => {
        callback(value, forceUpdate)
      })
    }
    return signal.hook(option, forceUpdate)
  }, [])

  return signal.value
}
