/**
 * G-Signal 核心类型定义
 * 包含完整的JSDoc注释以提供最佳的IDE体验
 *
 * G-Signal core type definitions
 * Contains complete JSDoc comments for the best IDE experience
 */

/**
 * Hook 回调函数类型
 * Hook callback function type
 *
 * @template T - 信号值的类型 / The type of signal value
 * @param value - 新值 / New value
 * @param oldValue - 旧值 / Old value
 * @param args - 可选的额外参数 / Optional additional arguments
 *
 * @example
 * ```typescript
 * const hook: Hook<number> = (value, oldValue, args) => {
 *   console.log(`${oldValue} → ${value}`, args)
 * }
 * ```
 */
export interface Hook<T> {
  (value: T, oldValue: T): void
}

/**
 * Hook 选项配置
 * Hook option configuration
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
   * Unique identifier for Hook, used for sorting and management
   *
   * @example 'validation-hook'
   */
  id?: string

  /**
   * 是否立即执行一次（使用当前值）
   * Whether to execute immediately once (using current value)
   *
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
   * Whether to execute only once
   *
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
   * Execute before the specified Hook
   *
   * @example 'other-hook-id'
   */
  before?: string

  /**
   * 在指定 Hook 之后执行
   * Execute after the specified Hook
   *
   * @example 'other-hook-id'
   */
  after?: string

  /**
   * 最先执行（优先级最高）
   * Execute first (highest priority)
   *
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
   * Execute last (lowest priority)
   *
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
