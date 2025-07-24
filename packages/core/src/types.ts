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
export interface Hook<T> {
  (value: T, oldValue: T, args?: any): void
  deriving?: boolean
}

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
export interface MergeSignalOption {}

/**
 * 响应式信号接口
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
export interface ISignal<T> {
  /**
   * 获取前一个值（旧值）
   * @readonly
   */
  readonly oldValue: T

  /**
   * 获取或设置当前值
   */
  value: T

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
  dispatch(value?: T | ((value: T) => void), args?: any): void

  /**
   * 设置拦截器
   * @param handle - 拦截处理函数
   */
  intercept(handle: (value: T) => T | void): void

  /**
   * 移除所有监听器
   */
  removeAll(): void
}
