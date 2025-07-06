/**
 * G-Signal 核心类型定义
 * 包含完整的JSDoc注释以提供最佳的IDE体验
 */

/**
 * 无操作函数类型
 */
export type INoopFunc = () => void

/**
 * Hook 回调函数类型
 * @template T - 信号值的类型
 * @param value - 新值
 * @param oldValue - 旧值
 * @param args - 可选的额外参数
 *
 * @example
 * ```typescript
 * const hook: Hook<number> = (value, oldValue, args) => {
 *   console.log(`${oldValue} → ${value}`, args)
 * }
 * ```
 */
export type Hook<T> = (value: T, oldValue: T, args?: any) => void

/**
 * Hook 选项配置
 *
 * @example
 * ```typescript
 * const option: HookOption = {
 *   id: 'my-hook',
 *   immediately: true,
 *   once: false,
 *   beforeAll: true
 * }
 * ```
 */
export interface HookOption {
  /**
   * Hook 的唯一标识符，用于排序和管理
   * @example 'validation-hook'
   */
  id?: string

  /**
   * 是否立即执行一次（使用当前值）
   * @default false
   * @example
   * ```typescript
   * signal.hook({ immediately: true }, (value) => {
   *   console.log('当前值:', value)
   * })
   * ```
   */
  immediately?: boolean

  /**
   * 是否只执行一次
   * @default false
   * @example
   * ```typescript
   * signal.hook({ once: true }, (value) => {
   *   console.log('只执行一次:', value)
   * })
   * ```
   */
  once?: boolean

  /**
   * 在指定 Hook 之前执行
   * @example 'other-hook-id'
   */
  before?: string

  /**
   * 在指定 Hook 之后执行
   * @example 'other-hook-id'
   */
  after?: string

  /**
   * 最先执行（优先级最高）
   * @default false
   * @example
   * ```typescript
   * signal.hook({ beforeAll: true }, (value) => {
   *   console.log('最先执行:', value)
   * })
   * ```
   */
  beforeAll?: boolean

  /**
   * 最后执行（优先级最低）
   * @default false
   * @example
   * ```typescript
   * signal.hook({ afterAll: true }, (value) => {
   *   console.log('最后执行:', value)
   * })
   * ```
   */
  afterAll?: boolean
}

/**
 * 信号合并选项
 *
 * @example
 * ```typescript
 * const option: MergeSignalOption = {
 *   individual: true  // OR 逻辑
 * }
 * ```
 */
export interface MergeSignalOption {
  /**
   * 是否使用个别模式（OR 逻辑）
   * - false（默认）：AND 逻辑，所有信号都触发后才触发合并信号
   * - true：OR 逻辑，任何信号触发都会触发合并信号
   * @default false
   * @example
   * ```typescript
   * // AND 逻辑：所有信号都触发才触发
   * const merged1 = mergeSignal(signal1, signal2, signal3)
   *
   * // OR 逻辑：任何信号触发都触发
   * const merged2 = mergeSignal(signal1, signal2, signal3, { individual: true })
   * ```
   */
  individual?: boolean
}
