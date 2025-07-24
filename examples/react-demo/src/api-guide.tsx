import { useHookSignal } from '@g-signal/react'
import { createSignal, deriveSignal } from 'g-signal'
import { useState } from 'react'

export function ApiGuide() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', title: '概述', icon: '🌟' },
    { id: 'create-signal', title: 'createSignal', icon: '🎯' },
    { id: 'derive-signal', title: 'deriveSignal', icon: '🔄' },
    { id: 'merge-signal', title: 'mergeSignal', icon: '🔗' },
    { id: 'batch-signal', title: 'batchSignal', icon: '📦' },
    { id: 'hooks', title: 'Hook 系统', icon: '🎣' },
    { id: 'examples', title: '实战示例', icon: '💡' },
  ]

  return (
    <div className='api-guide'>
      <div className='api-header'>
        <div className='header-content'>
          <h1>
            <span className='logo'>🎯</span>
            G-Signal API 使用指南
          </h1>
          <p className='subtitle'>
            现代化的响应式状态管理库，提供类型安全的信号系统
          </p>
        </div>
      </div>

      <div className='guide-container'>
        <nav className='guide-nav'>
          <div className='nav-title'>📖 目录</div>
          {sections.map((section) => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}>
              <span className='nav-icon'>{section.icon}</span>
              <span className='nav-text'>{section.title}</span>
            </button>
          ))}
        </nav>

        <main className='guide-content'>
          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'create-signal' && <CreateSignalSection />}
          {activeSection === 'derive-signal' && <DeriveSignalSection />}
          {activeSection === 'merge-signal' && <MergeSignalSection />}
          {activeSection === 'batch-signal' && <BatchSignalSection />}
          {activeSection === 'hooks' && <HooksSection />}
          {activeSection === 'examples' && <ExamplesSection />}
        </main>
      </div>
    </div>
  )
}

function OverviewSection() {
  return (
    <section className='content-section'>
      <h2>🌟 G-Signal 概述</h2>
      <div className='intro-cards'>
        <div className='intro-card'>
          <div className='card-icon'>🎯</div>
          <h3>类型安全</h3>
          <p>完整的 TypeScript 支持，提供出色的开发体验</p>
        </div>
        <div className='intro-card'>
          <div className='card-icon'>⚡</div>
          <h3>高性能</h3>
          <p>精确的依赖追踪，避免不必要的重新计算</p>
        </div>
        <div className='intro-card'>
          <div className='card-icon'>🔄</div>
          <h3>响应式</h3>
          <p>自动更新派生值，构建响应式应用</p>
        </div>
        <div className='intro-card'>
          <div className='card-icon'>🎣</div>
          <h3>灵活的 Hook 系统</h3>
          <p>丰富的监听选项，支持优先级控制</p>
        </div>
      </div>

      <div className='feature-showcase'>
        <h3>核心特性</h3>
        <div className='feature-list'>
          <div className='feature-item'>
            <span className='feature-icon'>✨</span>
            <div>
              <strong>基础信号</strong>
              <p>createSignal 创建响应式状态</p>
            </div>
          </div>
          <div className='feature-item'>
            <span className='feature-icon'>🔄</span>
            <div>
              <strong>派生信号</strong>
              <p>deriveSignal 创建基于其他信号的计算属性</p>
            </div>
          </div>
          <div className='feature-item'>
            <span className='feature-icon'>🔗</span>
            <div>
              <strong>信号合并</strong>
              <p>mergeSignal 合并多个信号，支持 AND/OR 逻辑</p>
            </div>
          </div>
          <div className='feature-item'>
            <span className='feature-icon'>📦</span>
            <div>
              <strong>批量处理</strong>
              <p>batchSignal 批量更新，避免中间状态</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CreateSignalSection() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  // 创建信号示例
  const countSignal = createSignal(0)
  const nameSignal = createSignal('')

  return (
    <section className='content-section'>
      <h2>🎯 createSignal</h2>
      <p className='section-desc'>创建响应式信号，是 G-Signal 的基础构建块。</p>

      <div className='api-card'>
        <h3>基本用法</h3>
        <div className='code-block'>
          <pre>
            <code>{`// 创建基本信号
const count = createSignal(0)
const name = createSignal('')
const user = createSignal<User | null>(null)

// 获取值
console.log(count.value) // 0

// 更新值
count.value = 10
count.dispatch(20)

// 监听变化
count.hook((newValue, oldValue) => {
  console.log(\`\${oldValue} → \${newValue}\`)
})`}</code>
          </pre>
        </div>
      </div>

      <div className='api-card'>
        <h3>类型定义</h3>
        <div className='code-block'>
          <pre>
            <code>{`interface Signal<T> {
  value: T                    // 当前值
  newValue: T                // 新值
  oldValue: T                // 旧值
  
  dispatch(value: T): void   // 更新值
  hook(callback: Hook<T>): () => void  // 监听变化
  intercept(fn: (value: T) => T | void): void  // 拦截器
  removeAll(): void          // 清除所有监听器
}`}</code>
          </pre>
        </div>
      </div>

      <div className='demo-section'>
        <h3>🎮 实时演示</h3>
        <div className='demo-container'>
          <div className='demo-controls'>
            <button
              onClick={() => {
                countSignal.dispatch(countSignal.value + 1)
                setCount(countSignal.value)
              }}>
              增加计数
            </button>
            <button
              onClick={() => {
                countSignal.dispatch(0)
                setCount(0)
              }}>
              重置
            </button>
            <span className='display'>当前值: {count}</span>
          </div>

          <div className='demo-controls'>
            <input
              type='text'
              placeholder='输入名称'
              value={name}
              onChange={(e) => {
                nameSignal.dispatch(e.target.value)
                setName(e.target.value)
              }}
            />
            <span className='display'>名称: {name}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function DeriveSignalSection() {
  const [firstName, setFirstName] = useState('张')
  const [lastName, setLastName] = useState('三')
  const [age, setAge] = useState(25)

  // 派生信号示例
  const firstNameSignal = createSignal('张')
  const lastNameSignal = createSignal('三')
  const ageSignal = createSignal(25)
  const fullNameSignal = deriveSignal(
    firstNameSignal,
    lastNameSignal,
    (first, last) => `${first}${last}`,
  )

  const isAdultSignal = deriveSignal(ageSignal, (age) => age >= 18)

  useHookSignal(isAdultSignal)

  return (
    <section className='content-section'>
      <h2>🔄 deriveSignal</h2>
      <p className='section-desc'>创建基于其他信号的派生信号，自动响应依赖变化。</p>

      <div className='api-card'>
        <h3>单信号派生</h3>
        <div className='code-block'>
          <pre>
            <code>{`const count = createSignal(0)

// 派生信号：双倍值
const doubled = deriveSignal(count, (value) => value * 2)

// 派生信号：是否为偶数
const isEven = deriveSignal(count, (value) => value % 2 === 0)

console.log(doubled.value) // 0
console.log(isEven.value)  // true

count.dispatch(5)
console.log(doubled.value) // 10
console.log(isEven.value)  // false`}</code>
          </pre>
        </div>
      </div>

      <div className='api-card'>
        <h3>多信号派生</h3>
        <div className='code-block'>
          <pre>
            <code>{`const firstName = createSignal('张')
const lastName = createSignal('三')
const age = createSignal(25)

// 多信号派生：全名
const fullName = deriveSignal(
  firstName,
  lastName,
  (first, last) => \`\${first}\${last}\`
)

// 多信号派生：用户信息
const userInfo = deriveSignal(
  fullName,
  age,
  (name, age) => ({
    name,
    age,
    isAdult: age >= 18
  })
)`}</code>
          </pre>
        </div>
      </div>

      <div className='demo-section'>
        <h3>🎮 实时演示</h3>
        <div className='demo-container'>
          <div className='demo-controls'>
            <input
              type='text'
              placeholder='姓'
              value={firstName}
              onChange={(e) => {
                firstNameSignal.dispatch(e.target.value)
                setFirstName(e.target.value)
              }}
            />
            <input
              type='text'
              placeholder='名'
              value={lastName}
              onChange={(e) => {
                lastNameSignal.dispatch(e.target.value)
                setLastName(e.target.value)
              }}
            />
          </div>

          <div className='demo-controls'>
            <input
              type='number'
              placeholder='年龄'
              value={age}
              onChange={(e) => {
                const newAge = parseInt(e.target.value) || 0
                ageSignal.dispatch(newAge)
                setAge(newAge)
              }}
            />
          </div>

          <div className='demo-result'>
            <div className='result-item'>
              <strong>全名:</strong> {fullNameSignal.value}
            </div>
            <div className='result-item'>
              <strong>是否成年:</strong> {isAdultSignal.value ? '是' : '否'}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MergeSignalSection() {
  return (
    <section className='content-section'>
      <h2>🔗 mergeSignal</h2>
      <p className='section-desc'>合并多个信号，支持 AND 和 OR 逻辑。</p>

      <div className='api-card'>
        <h3>AND 逻辑（默认）</h3>
        <div className='code-block'>
          <pre>
            <code>{`const signal1 = createSignal(0)
const signal2 = createSignal('')
const signal3 = createSignal(false)

// 默认 AND 逻辑：所有信号都触发后才触发
const merged = mergeSignal(signal1, signal2, signal3)

merged.hook(() => {
  console.log('所有信号都已触发')
})

// 只有当所有三个信号都更新后，merged 才会触发
signal1.dispatch(1)    // 不触发
signal2.dispatch('a')  // 不触发
signal3.dispatch(true) // 触发！`}</code>
          </pre>
        </div>
      </div>

      <div className='api-card'>
        <h3>OR 逻辑</h3>
        <div className='code-block'>
          <pre>
            <code>{`const signal1 = createSignal(0)
const signal2 = createSignal('')

// OR 逻辑：任何信号触发都会触发
const merged = mergeSignal(signal1, signal2, { individual: true })

merged.hook(() => {
  console.log('有信号触发了')
})

signal1.dispatch(1)   // 触发！
signal2.dispatch('a') // 触发！`}</code>
          </pre>
        </div>
      </div>

      <div className='use-cases'>
        <h3>📋 使用场景</h3>
        <div className='use-case-list'>
          <div className='use-case-item'>
            <strong>AND 逻辑</strong>
            <p>表单验证：所有字段都验证通过后才能提交</p>
          </div>
          <div className='use-case-item'>
            <strong>OR 逻辑</strong>
            <p>状态监听：任何相关状态变化都需要更新UI</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function BatchSignalSection() {
  return (
    <section className='content-section'>
      <h2>📦 batchSignal</h2>
      <p className='section-desc'>
        批量处理信号更新，避免中间状态和不必要的重新计算。
      </p>

      <div className='api-card'>
        <h3>回调模式</h3>
        <div className='code-block'>
          <pre>
            <code>{`const firstName = createSignal('张')
const lastName = createSignal('三')

const fullName = deriveSignal(
  firstName,
  lastName,
  (first, last) => \`\${first}\${last}\`
)

fullName.hook((value) => {
  console.log('全名:', value)
})

// 批量处理：只触发一次 fullName 的计算
batchSignal(firstName, lastName, () => {
  firstName.dispatch('李')
  lastName.dispatch('四')
})
// 输出: 全名: 李四 （只输出一次）`}</code>
          </pre>
        </div>
      </div>

      <div className='api-card'>
        <h3>延迟执行模式</h3>
        <div className='code-block'>
          <pre>
            <code>{`const signal1 = createSignal(0)
const signal2 = createSignal('')

// 设置批量模式
const flush = batchSignal(signal1, signal2)

// 批量更新（不会立即触发 hooks）
signal1.dispatch(1)
signal2.dispatch('hello')

// 手动触发
flush()`}</code>
          </pre>
        </div>
      </div>

      <div className='benefits'>
        <h3>✨ 优势</h3>
        <div className='benefit-list'>
          <div className='benefit-item'>
            <span className='benefit-icon'>🚀</span>
            <div>
              <strong>性能优化</strong>
              <p>减少不必要的重新计算，提升应用性能</p>
            </div>
          </div>
          <div className='benefit-item'>
            <span className='benefit-icon'>🎯</span>
            <div>
              <strong>避免中间状态</strong>
              <p>确保UI始终反映最终状态，避免闪烁</p>
            </div>
          </div>
          <div className='benefit-item'>
            <span className='benefit-icon'>🔄</span>
            <div>
              <strong>原子性更新</strong>
              <p>多个相关状态的更新作为一个原子操作</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HooksSection() {
  return (
    <section className='content-section'>
      <h2>🎣 Hook 系统</h2>
      <p className='section-desc'>强大的监听系统，支持多种选项和优先级控制。</p>

      <div className='api-card'>
        <h3>基本用法</h3>
        <div className='code-block'>
          <pre>
            <code>{`const signal = createSignal(0)

// 简单监听
const unsubscribe = signal.hook((newValue, oldValue) => {
  console.log(\`\${oldValue} → \${newValue}\`)
})

// 取消监听
unsubscribe()`}</code>
          </pre>
        </div>
      </div>

      <div className='api-card'>
        <h3>Hook 选项</h3>
        <div className='code-block'>
          <pre>
            <code>{`const signal = createSignal(42)

// 立即执行
signal.hook({ immediately: true }, (value) => {
  console.log('当前值:', value) // 立即输出: 当前值: 42
})

// 只执行一次
signal.hook({ once: true }, (value) => {
  console.log('只执行一次:', value)
})

// 优先级控制
signal.hook({ beforeAll: true }, (value) => {
  console.log('最先执行:', value)
})

signal.hook({ afterAll: true }, (value) => {
  console.log('最后执行:', value)
})`}</code>
          </pre>
        </div>
      </div>

      <div className='hook-options'>
        <h3>🎛️ 选项说明</h3>
        <div className='option-list'>
          <div className='option-item'>
            <code>immediately</code>
            <p>立即使用当前值执行一次回调</p>
          </div>
          <div className='option-item'>
            <code>once</code>
            <p>只执行一次后自动取消监听</p>
          </div>
          <div className='option-item'>
            <code>beforeAll</code>
            <p>优先级最高，最先执行</p>
          </div>
          <div className='option-item'>
            <code>afterAll</code>
            <p>优先级最低，最后执行</p>
          </div>
          <div className='option-item'>
            <code>before</code>
            <p>在指定Hook之前执行</p>
          </div>
          <div className='option-item'>
            <code>after</code>
            <p>在指定Hook之后执行</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ExamplesSection() {
  return (
    <section className='content-section'>
      <h2>💡 实战示例</h2>
      <p className='section-desc'>结合实际场景的完整示例。</p>

      <div className='api-card'>
        <h3>🛒 购物车示例</h3>
        <div className='code-block'>
          <pre>
            <code>{`// 购物车状态
const cartItems = createSignal<CartItem[]>([])
const discountRate = createSignal(0)

// 派生状态
const subtotal = deriveSignal(
  cartItems,
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const discount = deriveSignal(
  subtotal,
  discountRate,
  (subtotal, rate) => subtotal * rate
)

const total = deriveSignal(
  subtotal,
  discount,
  (subtotal, discount) => subtotal - discount
)

// 批量更新
const addItem = (item: CartItem) => {
  batchSignal(cartItems, () => {
    cartItems.dispatch([...cartItems.value, item])
  })
}

const applyDiscount = (rate: number) => {
  discountRate.dispatch(rate)
}`}</code>
          </pre>
        </div>
      </div>

      <div className='api-card'>
        <h3>👤 用户管理示例</h3>
        <div className='code-block'>
          <pre>
            <code>{`// 用户状态
const currentUser = createSignal<User | null>(null)
const isLoading = createSignal(false)
const error = createSignal<string | null>(null)

// 派生状态
const isLoggedIn = deriveSignal(
  currentUser,
  (user) => user !== null
)

const userDisplayName = deriveSignal(
  currentUser,
  (user) => user?.name || '未登录'
)

// 复合状态
const appState = deriveSignal(
  isLoading,
  error,
  isLoggedIn,
  (loading, error, loggedIn) => ({
    loading,
    error,
    loggedIn,
    canOperate: !loading && !error && loggedIn
  })
)

// 登录操作
const login = async (credentials: LoginCredentials) => {
  batchSignal(isLoading, error, currentUser, () => {
    isLoading.dispatch(true)
    error.dispatch(null)
    
    // 模拟API调用
    setTimeout(() => {
      batchSignal(isLoading, currentUser, () => {
        isLoading.dispatch(false)
        currentUser.dispatch({ name: '张三', id: 1 })
      })
    }, 1000)
  })
}`}</code>
          </pre>
        </div>
      </div>

      <div className='best-practices'>
        <h3>🎯 最佳实践</h3>
        <div className='practice-list'>
          <div className='practice-item'>
            <strong>1. 合理使用批量处理</strong>
            <p>当多个相关状态需要同时更新时，使用 batchSignal 避免中间状态</p>
          </div>
          <div className='practice-item'>
            <strong>2. 利用派生信号</strong>
            <p>将复杂的计算逻辑封装在派生信号中，保持组件的简洁</p>
          </div>
          <div className='practice-item'>
            <strong>3. 适当的粒度</strong>
            <p>信号不要过于细粒度，也不要过于粗粒度，找到合适的平衡点</p>
          </div>
          <div className='practice-item'>
            <strong>4. Hook 优先级</strong>
            <p>使用 beforeAll 和 afterAll 控制关键操作的执行顺序</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// 样式（嵌入式CSS）
const styles = `
.api-guide {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.api-header {
  background: white;
  border-bottom: 1px solid #e1e8ed;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 1rem;
}

.header-content h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.logo {
  font-size: 3rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 1rem 0 0 0;
}

.guide-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
  padding: 0 1rem;
}

.guide-nav {
  flex: 0 0 280px;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: fit-content;
  sticky: top-2rem;
}

.nav-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ecf0f1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  text-align: left;
}

.nav-item:hover {
  background: #f8f9fa;
  transform: translateX(4px);
}

.nav-item.active {
  background: #3498db;
  color: white;
}

.nav-icon {
  font-size: 1.1rem;
}

.guide-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

.content-section {
  padding: 2rem;
}

.content-section h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-desc {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.intro-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.intro-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.intro-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.intro-card p {
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.feature-showcase {
  margin-top: 2rem;
}

.feature-showcase h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-list {
  display: grid;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feature-item strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 0.25rem;
}

.feature-item p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

.api-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.api-card h3 {
  background: #e9ecef;
  color: #2c3e50;
  padding: 1rem 1.5rem;
  margin: 0;
  font-size: 1.1rem;
}

.code-block {
  padding: 1.5rem;
}

.code-block pre {
  margin: 0;
  font-family: 'Fira Code', Monaco, 'Cascadia Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #2c3e50;
  background: white;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

.demo-section {
  margin-top: 2rem;
}

.demo-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.demo-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.demo-controls:last-child {
  margin-bottom: 0;
}

.demo-controls button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-controls button:hover {
  background: #2980b9;
}

.demo-controls input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  flex: 1;
  max-width: 200px;
}

.display {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  font-family: monospace;
  color: #2c3e50;
}

.demo-result {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  margin-top: 1rem;
}

.result-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f1f1;
}

.result-item:last-child {
  border-bottom: none;
}

.use-cases {
  margin-top: 2rem;
}

.use-cases h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.use-case-list {
  display: grid;
  gap: 1rem;
}

.use-case-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}

.use-case-item strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 0.5rem;
}

.use-case-item p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

.benefits {
  margin-top: 2rem;
}

.benefits h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.benefit-list {
  display: grid;
  gap: 1rem;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
}

.benefit-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.benefit-item strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 0.25rem;
}

.benefit-item p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

.hook-options {
  margin-top: 2rem;
}

.hook-options h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.option-list {
  display: grid;
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.option-item code {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  color: #e74c3c;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 100px;
}

.option-item p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

.best-practices {
  margin-top: 2rem;
}

.best-practices h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.practice-list {
  display: grid;
  gap: 1rem;
}

.practice-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #f39c12;
}

.practice-item strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 0.5rem;
}

.practice-item p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .guide-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .guide-nav {
    flex: none;
    position: sticky;
    top: 1rem;
    z-index: 10;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .intro-cards {
    grid-template-columns: 1fr;
  }
  
  .demo-controls {
    flex-wrap: wrap;
  }
}
`

// 在组件末尾添加样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
}
