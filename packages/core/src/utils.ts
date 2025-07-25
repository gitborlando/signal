import { createCache } from '@gitborlando/utils'
import { nanoid } from 'nanoid'
import { Signal } from './signal'

/**
 * 信号ID缓存
 * 为每个信号实例生成并缓存唯一标识符
 *
 * Signal ID cache
 * Generate and cache unique identifiers for each signal instance
 */
const signalIdCache = createCache<Signal<any>, string>()

/**
 * 获取信号的唯一标识符
 * 如果信号还没有ID，会自动生成一个并缓存
 *
 * Get the unique identifier of a signal
 * If the signal doesn't have an ID yet, it will automatically generate one and cache it
 *
 * @param signal - 信号实例 / Signal instance
 * @returns 信号的唯一标识符 / Unique identifier of the signal
 *
 * @example
 * ```typescript
 * const count = createSignal(0)
 * const id = getSignalId(count)
 * console.log(id) // "abc123def456" (nanoid生成的随机字符串)
 *
 * // 多次调用返回相同的ID
 * // Multiple calls return the same ID
 * const sameId = getSignalId(count)
 * console.log(id === sameId) // true
 * ```
 */
export function getSignalId(signal: Signal<any>) {
  return signalIdCache.getSet(signal, () => nanoid())
}

/**
 * 根据对象的值生成唯一键
 * 将对象的所有值按键名排序后序列化为字符串
 *
 * Generate unique key based on object values
 * Serialize all values of an object into a string after sorting by key names
 *
 * @param obj - 要处理的对象 / Object to process
 * @returns 基于对象值生成的唯一键 / Unique key generated based on object values
 *
 * @example
 * ```typescript
 * const obj1 = { name: '张三', age: 25, city: '北京' }
 * const obj2 = { age: 25, city: '北京', name: '张三' } // 顺序不同但值相同
 *
 * const key1 = genObjectKeyByValues(obj1)
 * const key2 = genObjectKeyByValues(obj2)
 *
 * console.log(key1 === key2) // true (相同的值生成相同的键)
 *
 * // 处理复杂对象
 * // Handle complex objects
 * const complexObj = {
 *   user: { name: '李四', info: [1, 2, 3] },
 *   settings: { theme: 'dark' }
 * }
 * const complexKey = genObjectKeyByValues(complexObj)
 * console.log(complexKey) // "{"info":[1,2,3],"name":"李四"}-{"theme":"dark"}"
 * ```
 */
export function genObjectKeyByValues(obj: Record<string, any>) {
  const keys = Object.keys(obj).sort()

  /**
   * 字符串化值
   * 尝试使用JSON.stringify，失败时使用String()
   *
   * Stringify value
   * Try using JSON.stringify, fallback to String() if it fails
   *
   * @param value - 要字符串化的值 / Value to stringify
   * @returns 字符串化后的值 / Stringified value
   */
  const stringFy = (value: any) => {
    let result = ''
    try {
      result = JSON.stringify(value)
    } catch (error) {
      result = String(value)
    }
    return result
  }

  const values = keys.map((key) => stringFy(obj[key]))
  return values.join('-')
}
