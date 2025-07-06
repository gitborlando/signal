import { useEffect } from 'react'

// 类型定义
type TodoItem = { id: number; text: string; completed: boolean }
type User = { id: number; name: string; email: string; avatar?: string }
type Option<T> = T | null | undefined
type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E }
type Status = 'idle' | 'loading' | 'success' | 'error'

function Counter() {
  // 宏语法：自动转换为 createSignal(0)
  let count$ = 0

  useHookSignal$(count$, (newValue, oldValue) => {
    console.log('count$', newValue, oldValue)
  })

  useEffect(() => {
    const unHook = hook$(count$, (newValue, oldValue) => {
      console.log('hook:count$', newValue, oldValue)
    })
  })

  return (
    <div className='card glow-effect'>
      <h3>🔢 宏语法计数器</h3>
      <div className='controls'>
        {/* 宏语法：自动转换为 count$.dispatch(count$.value - 1) */}
        <button onClick={() => (count$ -= 1)}>-</button>
        <span className='display'>计数: {count$}</span>
        <button onClick={() => (count$ += 1)}>+</button>
        <button onClick={() => (count$ = 0)}>重置</button>
      </div>
      <div className='macro-info'>
        <p>
          🪄 <strong>宏语法</strong>:
        </p>
        <code>let count$ = 0</code>
        <br />
        <code>dispatch$(count$ + 1)</code>
      </div>
    </div>
  )
}

function FormValidator() {
  // 宏语法：自动转换为 createSignal('')
  let username$ = ''
  let email$ = ''

  // 宏语法：username$.length 会自动转换为 username$.value.length
  const isUsernameValid = username$.length >= 3
  const isEmailValid = email$.includes('@')

  return (
    <div className='card basic-card'>
      <h3>📝 宏语法表单</h3>
      <div className='controls'>
        <input
          type='text'
          placeholder='用户名'
          value={username$}
          onChange={(e) => dispatch$(username$, e.target.value)}
        />
        <span className={`status ${isUsernameValid ? 'valid' : 'invalid'}`}>
          {isUsernameValid ? '✓' : '✗'}
        </span>
      </div>
      <div className='controls'>
        <input
          type='email'
          placeholder='邮箱'
          value={email$}
          onChange={(e) => dispatch$(email$, e.target.value)}
        />
        <span className={`status ${isEmailValid ? 'valid' : 'invalid'}`}>
          {isEmailValid ? '✓' : '✗'}
        </span>
      </div>
      <div className='macro-info'>
        <p>
          🪄 <strong>宏语法</strong>:
        </p>
        <code>username$.length &gt;= 3</code>
        <br />
        <code>dispatch$(e.target.value)</code>
      </div>
    </div>
  )
}

function TodoList() {
  // 宏语法：自动转换为 createSignal([])
  let todos$: TodoItem[] = []
  let newTodo$ = ''

  const addTodo = () => {
    if (newTodo$.trim()) {
      // 宏语法：自动转换为 todos$.dispatch([...todos$.value, newItem])
      dispatch$(todos$, [
        ...todos$,
        { id: Date.now(), text: newTodo$.trim(), completed: false },
      ])
      dispatch$(newTodo$, '')
    }
  }

  const toggleTodo = (id: number) => {
    dispatch$(
      todos$,
      todos$.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  return (
    <div className='card basic-card'>
      <h3>📋 宏语法 Todo</h3>
      <div className='controls'>
        <input
          type='text'
          placeholder='添加任务'
          value={newTodo$}
          onChange={(e) => dispatch$(newTodo$, e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>添加</button>
      </div>
      <div>
        {todos$.map((todo) => (
          <div
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type='checkbox'
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ flex: 1 }}>{todo.text}</span>
          </div>
        ))}
      </div>
      <div className='display'>
        总计: {todos$.length}, 已完成: {todos$.filter((t) => t.completed).length}
      </div>
      <div className='macro-info'>
        <p>
          🪄 <strong>宏语法</strong>:
        </p>
        <code>todos$.length</code>
        <br />
        <code>dispatch$([...todos$, newItem])</code>
      </div>
    </div>
  )
}

function WatchExample() {
  let count$ = 0
  let message$ = '没有变化'

  // 宏语法：自动转换为 count$.hook(callback)
  // watch$(count$, (newValue, oldValue) => {
  //   dispatch$(message$, `从 ${oldValue} 变为 ${newValue}`)
  // })

  return (
    <div className='card basic-card'>
      <h3>👀 宏语法监听</h3>
      <div className='controls'>
        <button onClick={() => dispatch$(count$, count$ + 1)}>增加计数</button>
        <span className='display'>计数: {count$}</span>
      </div>
      <div className='display'>变化信息: {message$}</div>
      <div className='macro-info'>
        <p>
          🪄 <strong>宏语法</strong>:
        </p>
        <code>watch$(count$, callback)</code>
        <br />
        <code>dispatch$(count$ + 1)</code>
      </div>
    </div>
  )
}

function AssignmentExample() {
  let count$ = 0
  let message$ = ''
  let score$ = 100

  return (
    <div className='card advanced-card'>
      <h3>✏️ 赋值语法示例</h3>
      <div className='controls'>
        {/* 基本赋值：count$ = 5 → count$.dispatch(5) */}
        <button onClick={() => (count$ = count$ + 1)}>基本赋值 +1</button>
        <button onClick={() => (count$ = 0)}>重置为 0</button>
        <span className='display'>计数: {count$}</span>
      </div>

      <div className='controls'>
        {/* 复合赋值：score$ += 10 → score$.dispatch(score$.value + 10) */}
        <button onClick={() => (score$ += 10)}>分数 += 10</button>
        <button onClick={() => (score$ -= 5)}>分数 -= 5</button>
        <button onClick={() => (score$ *= 2)}>分数 *= 2</button>
        <button onClick={() => (score$ /= 2)}>分数 /= 2</button>
        <span className='display'>分数: {score$}</span>
      </div>

      <div className='controls'>
        {/* 字符串赋值 */}
        <button onClick={() => (message$ = '你好世界!')}>设置消息</button>
        <button onClick={() => (message$ += ' 追加内容')}>追加内容</button>
        <button onClick={() => (message$ = '')}>清空消息</button>
        <div className='display'>消息: {message$}</div>
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>赋值语法</strong>:
        </p>
        <code>count$ = value</code> → <code>count$.dispatch(value)</code>
        <br />
        <code>score$ += 10</code> → <code>score$.dispatch(score$.value + 10)</code>
        <br />
        <code>message$ += text</code> →{' '}
        <code>message$.dispatch(message$.value + text)</code>
      </div>
    </div>
  )
}

function ObjectSignalExample() {
  let user$ = { name: '张三', age: 25, email: 'zhangsan@example.com' }
  let settings$ = { theme: 'light', language: 'zh-CN', notifications: true }

  return (
    <div className='card advanced-card'>
      <h3>🎯 对象 Signal 示例</h3>

      <div className='controls'>
        <h4>用户信息</h4>
        <div>姓名: {user$.name}</div>
        <div>年龄: {user$.age}</div>
        <div>邮箱: {user$.email}</div>
        <button onClick={() => (user$ = { ...user$, age: user$.age + 1 })}>
          增加年龄
        </button>
        <button onClick={() => (user$ = { ...user$, name: '李四' })}>
          改名为李四
        </button>
      </div>

      <div className='controls'>
        <h4>设置</h4>
        <div>主题: {settings$.theme}</div>
        <div>语言: {settings$.language}</div>
        <div>通知: {settings$.notifications ? '开启' : '关闭'}</div>
        <button
          onClick={() =>
            (settings$ = {
              ...settings$,
              theme: settings$.theme === 'light' ? 'dark' : 'light',
            })
          }>
          切换主题
        </button>
        <button
          onClick={() =>
            (settings$ = { ...settings$, notifications: !settings$.notifications })
          }>
          切换通知
        </button>
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>对象语法</strong>:
        </p>
        <code>user$.name</code> → <code>user$.value.name</code>
        <br />
        <code>
          user$ = {'{'}...user$, age: 26{'}'}
        </code>{' '}
        →{' '}
        <code>
          user$.dispatch({'{'}...user$.value, age: 26{'}'})
        </code>
      </div>
    </div>
  )
}

function ArraySignalExample() {
  let numbers$ = [1, 2, 3, 4, 5]
  let fruits$ = ['苹果', '香蕉', '橙子']

  const addNumber = () => {
    const newNum = Math.floor(Math.random() * 100)
    numbers$ = [...numbers$, newNum]
  }

  const removeLastNumber = () => {
    numbers$ = numbers$.slice(0, -1)
  }

  const addFruit = () => {
    const newFruits = ['葡萄', '草莓', '芒果', '猕猴桃']
    const randomFruit = newFruits[Math.floor(Math.random() * newFruits.length)]
    fruits$ = [...fruits$, randomFruit]
  }

  return (
    <div className='card advanced-card'>
      <h3>📚 数组 Signal 示例</h3>

      <div className='controls'>
        <h4>数字数组</h4>
        <div>数组: [{numbers$.join(', ')}]</div>
        <div>长度: {numbers$.length}</div>
        <div>总和: {numbers$.reduce((a, b) => a + b, 0)}</div>
        <button onClick={addNumber}>添加随机数</button>
        <button onClick={removeLastNumber}>删除最后一个</button>
        <button onClick={() => (numbers$ = [])}>清空数组</button>
      </div>

      <div className='controls'>
        <h4>水果数组</h4>
        <div>水果: {fruits$.join(', ')}</div>
        <div>数量: {fruits$.length}</div>
        <button onClick={addFruit}>添加随机水果</button>
        <button onClick={() => (fruits$ = fruits$.slice(1))}>删除第一个</button>
        <button onClick={() => (fruits$ = ['苹果', '香蕉', '橙子'])}>重置</button>
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>数组语法</strong>:
        </p>
        <code>numbers$.length</code> → <code>numbers$.value.length</code>
        <br />
        <code>numbers$.join(', ')</code> → <code>numbers$.value.join(', ')</code>
        <br />
        <code>numbers$ = [...numbers$, newItem]</code> →{' '}
        <code>numbers$.dispatch([...numbers$.value, newItem])</code>
      </div>
    </div>
  )
}

function ComputedExample() {
  let firstName$ = '张'
  let lastName$ = '三'
  let age$ = 25

  // 计算属性：自动响应依赖变化
  const fullName = firstName$ + lastName$
  const isAdult = age$ >= 18
  const category = age$ < 18 ? '未成年' : age$ < 60 ? '成年人' : '老年人'

  return (
    <div className='card advanced-card'>
      <h3>🧮 计算属性示例</h3>

      <div className='controls'>
        <input
          type='text'
          placeholder='姓'
          value={firstName$}
          onChange={(e) => (firstName$ = e.target.value)}
        />
        <input
          type='text'
          placeholder='名'
          value={lastName$}
          onChange={(e) => (lastName$ = e.target.value)}
        />
        <input
          type='number'
          placeholder='年龄'
          value={age$}
          onChange={(e) => (age$ = parseInt(e.target.value) || 0)}
        />
      </div>

      <div className='display'>
        <div>全名: {fullName}</div>
        <div>是否成年: {isAdult ? '是' : '否'}</div>
        <div>年龄段: {category}</div>
        <div>姓名长度: {fullName.length}</div>
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>计算属性</strong>:
        </p>
        <code>firstName$ + lastName$</code> {'->'} 自动响应变化
        <br />
        <code>age$ {'>'}= 18</code> {'->'} 布尔计算
        <br />
        <code>fullName.length</code> {'->'} 链式计算
      </div>
    </div>
  )
}

function ConditionalExample() {
  let showDetails$ = false
  let userType$ = 'guest'
  let count$ = 0

  return (
    <div className='card advanced-card'>
      <h3>🔀 条件渲染示例</h3>

      <div className='controls'>
        <button onClick={() => (showDetails$ = !showDetails$)}>
          {showDetails$ ? '隐藏' : '显示'}详情
        </button>
        <button
          onClick={() => (userType$ = userType$ === 'guest' ? 'admin' : 'guest')}>
          切换用户类型 ({userType$})
        </button>
        <button onClick={() => (count$ = count$ + 1)}>增加计数 ({count$})</button>
      </div>

      <div className='display'>
        {/* 条件渲染 */}
        {showDetails$ && (
          <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px 0' }}>
            <h4>详细信息</h4>
            <p>这是详细信息内容</p>
            <p>当前计数: {count$}</p>
          </div>
        )}

        {/* 多条件渲染 */}
        <div>用户权限: {userType$ === 'admin' ? '管理员' : '访客'}</div>

        {/* 复杂条件 */}
        <div>
          状态: {count$ === 0 ? '初始状态' : count$ < 5 ? '进行中' : '已完成'}
        </div>

        {/* 三元运算符 */}
        <div style={{ color: count$ % 2 === 0 ? 'blue' : 'red' }}>
          计数是{count$ % 2 === 0 ? '偶数' : '奇数'}
        </div>
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>条件语法</strong>:
        </p>
        <code>
          {'{'}showDetails$ && &lt;div&gt;...&lt;/div&gt;{'}'}
        </code>
        <br />
        <code>
          {'{'}count$ === 0 ? 'A' : 'B'{'}'}
        </code>
        <br />
        <code>
          {'{'}userType$ === 'admin' ? '管理员' : '访客'{'}'}
        </code>
      </div>
    </div>
  )
}

function OptionTypeExample() {
  let currentUser$: Option<User> = null
  let selectedId$: Option<number> = null
  let errorMessage$: Option<string> = null

  const users: User[] = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: '👨' },
    { id: 2, name: '李四', email: 'lisi@example.com', avatar: '👩' },
    { id: 3, name: '王五', email: 'wangwu@example.com' },
  ]

  const selectUser = (user: User) => {
    currentUser$ = user
    selectedId$ = user.id
    errorMessage$ = null
  }

  const clearSelection = () => {
    currentUser$ = null
    selectedId$ = null
    errorMessage$ = null
  }

  const simulateError = () => {
    errorMessage$ = '模拟的错误信息'
    currentUser$ = null
  }

  return (
    <div className='card complex-card'>
      <h3>🎯 Option 类型示例</h3>

      <div className='controls'>
        <h4>用户列表</h4>
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => selectUser(user)}
            style={{
              margin: '2px',
              background: selectedId$ === user.id ? '#007bff' : '#f8f9fa',
              color: selectedId$ === user.id ? 'white' : 'black',
            }}>
            {user.avatar || '👤'} {user.name}
          </button>
        ))}
      </div>

      <div className='controls'>
        <button onClick={clearSelection}>清除选择</button>
        <button onClick={simulateError}>模拟错误</button>
      </div>

      <div className='display'>
        {/* Option 类型的条件渲染 */}
        <h4>当前用户信息</h4>
        {currentUser$ ? (
          <div
            style={{
              padding: '10px',
              background: '#e8f5e8',
              border: '1px solid #4caf50',
            }}>
            <div>ID: {(currentUser$ as User).id}</div>
            <div>姓名: {(currentUser$ as User).name}</div>
            <div>邮箱: {(currentUser$ as User).email}</div>
            <div>头像: {(currentUser$ as User).avatar || '无头像'}</div>
          </div>
        ) : (
          <div
            style={{
              padding: '10px',
              background: '#f5f5f5',
              border: '1px solid #ccc',
            }}>
            未选择用户
          </div>
        )}

        {/* 错误信息显示 */}
        {errorMessage$ && (
          <div
            style={{
              padding: '10px',
              background: '#ffe8e8',
              border: '1px solid #f44336',
              marginTop: '10px',
            }}>
            ❌ {errorMessage$}
          </div>
        )}

        {/* 选择状态 */}
        <div style={{ marginTop: '10px' }}>选择的 ID: {selectedId$ ?? '无'}</div>
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>Option 类型</strong>:
        </p>
        <code>let user$: Option&lt;User&gt; = null</code>
        <br />
        <code>
          {'{'}currentUser$ ? &lt;div&gt;...&lt;/div&gt; : &lt;div&gt;...&lt;/div&gt;
          {'}'}
        </code>
        <br />
        <code>
          {'{'}errorMessage$ && &lt;div&gt;...&lt;/div&gt;{'}'}
        </code>
        <br />
        <code>selectedId$ ?? 'default'</code>
      </div>
    </div>
  )
}

function AsyncStateExample() {
  let status$ = 'idle' as Status
  let data$: Option<User[]> = null
  let error$: Option<string> = null
  let progress$ = 0

  const fetchUsers = async () => {
    status$ = 'loading'
    error$ = null
    progress$ = 0

    try {
      // 模拟网络请求
      for (let i = 0; i <= 100; i += 20) {
        progress$ = i
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // 模拟随机成功/失败
      if (Math.random() > 0.3) {
        data$ = [
          { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: '👨' },
          { id: 2, name: '李四', email: 'lisi@example.com', avatar: '👩' },
          { id: 3, name: '王五', email: 'wangwu@example.com', avatar: '🧑' },
        ]
        status$ = 'success'
      } else {
        throw new Error('网络请求失败')
      }
    } catch (err) {
      error$ = err instanceof Error ? err.message : '未知错误'
      status$ = 'error'
      data$ = null
    }
  }

  const reset = () => {
    status$ = 'idle'
    data$ = null
    error$ = null
    progress$ = 0
  }

  return (
    <div className='card complex-card'>
      <h3>⚡ 异步状态示例</h3>

      <div className='controls'>
        <button onClick={fetchUsers} disabled={status$ === 'loading'}>
          {status$ === 'loading' ? '加载中...' : '获取用户'}
        </button>
        <button onClick={reset}>重置</button>
      </div>

      <div className='display'>
        {/* 状态指示器 */}
        <div style={{ marginBottom: '10px' }}>
          状态:{' '}
          <span
            style={{
              color:
                status$ === 'success'
                  ? 'green'
                  : status$ === 'error'
                    ? 'red'
                    : status$ === 'loading'
                      ? 'blue'
                      : 'gray',
            }}>
            {status$ === 'idle' && '待机'}
            {status$ === 'loading' && '加载中'}
            {status$ === 'success' && '成功'}
            {status$ === 'error' && '错误'}
          </span>
        </div>

        {/* 进度条 */}
        {status$ === 'loading' && (
          <div style={{ marginBottom: '10px' }}>
            <div>进度: {progress$}%</div>
            <div
              style={{
                width: '100%',
                height: '10px',
                background: '#f0f0f0',
                borderRadius: '5px',
                overflow: 'hidden',
              }}>
              <div
                style={{
                  width: `${progress$}%`,
                  height: '100%',
                  background: '#007bff',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* 数据显示 */}
        {status$ === 'success' && data$ && (
          <div
            style={{
              padding: '10px',
              background: '#e8f5e8',
              border: '1px solid #4caf50',
            }}>
            <h4>用户列表 ({(data$ as User[]).length} 个用户)</h4>
            {(data$ as User[]).map((user: User) => (
              <div
                key={user.id}
                style={{ padding: '5px', borderBottom: '1px solid #ddd' }}>
                {user.avatar} {user.name} - {user.email}
              </div>
            ))}
          </div>
        )}

        {/* 错误显示 */}
        {status$ === 'error' && error$ && (
          <div
            style={{
              padding: '10px',
              background: '#ffe8e8',
              border: '1px solid #f44336',
            }}>
            ❌ 错误: {error$}
          </div>
        )}

        {/* 空状态 */}
        {status$ === 'idle' && (
          <div
            style={{
              padding: '10px',
              background: '#f5f5f5',
              border: '1px solid #ccc',
            }}>
            点击"获取用户"开始加载数据
          </div>
        )}
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>异步状态</strong>:
        </p>
        <code>let status$: Status = 'idle'</code>
        <br />
        <code>let data$: Option&lt;User[]&gt; = null</code>
        <br />
        <code>
          {'{'}status$ === 'loading' && &lt;ProgressBar /&gt;{'}'}
        </code>
        <br />
        <code>
          {'{'}data$ && data$.map(...){'}'}
        </code>
      </div>
    </div>
  )
}

function FormValidationExample() {
  let email$ = ''
  let password$ = ''
  let confirmPassword$ = ''
  let isSubmitting$ = false
  let errors$: Record<string, string> = {}

  // 验证规则
  const validateEmail = (email: string): Option<string> => {
    if (!email) return '邮箱不能为空'
    if (!/\S+@\S+\.\S+/.test(email)) return '邮箱格式不正确'
    return null
  }

  const validatePassword = (password: string): Option<string> => {
    if (!password) return '密码不能为空'
    if (password.length < 6) return '密码至少6个字符'
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return '密码必须包含大小写字母和数字'
    }
    return null
  }

  const validateConfirmPassword = (
    password: string,
    confirm: string,
  ): Option<string> => {
    if (!confirm) return '请确认密码'
    if (password !== confirm) return '两次密码不一致'
    return null
  }

  // 实时验证
  const emailError = validateEmail(email$)
  const passwordError = validatePassword(password$)
  const confirmPasswordError = validateConfirmPassword(password$, confirmPassword$)

  const hasErrors = emailError || passwordError || confirmPasswordError
  const isFormValid = email$ && password$ && confirmPassword$ && !hasErrors

  const handleSubmit = async () => {
    if (!isFormValid) return

    isSubmitting$ = true
    errors$ = {}

    try {
      // 模拟提交
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 模拟服务器验证错误
      if (email$ === 'test@error.com') {
        errors$ = { submit: '该邮箱已被注册' }
      } else {
        alert('注册成功！')
        email$ = ''
        password$ = ''
        confirmPassword$ = ''
      }
    } catch (err) {
      errors$ = { submit: '网络错误，请稍后重试' }
    } finally {
      isSubmitting$ = false
    }
  }

  return (
    <div className='card complex-card'>
      <h3>📝 表单验证示例</h3>

      <div className='controls'>
        <div style={{ marginBottom: '15px' }}>
          <input
            type='email'
            placeholder='邮箱地址'
            value={email$}
            onChange={(e) => (email$ = e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: emailError ? '2px solid #f44336' : '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {emailError && (
            <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>
              {emailError}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input
            type='password'
            placeholder='密码'
            value={password$}
            onChange={(e) => (password$ = e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: passwordError ? '2px solid #f44336' : '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {passwordError && (
            <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>
              {passwordError}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input
            type='password'
            placeholder='确认密码'
            value={confirmPassword$}
            onChange={(e) => (confirmPassword$ = e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: confirmPasswordError ? '2px solid #f44336' : '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {confirmPasswordError && (
            <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>
              {confirmPasswordError}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting$}
          style={{
            width: '100%',
            padding: '10px',
            background: isFormValid && !isSubmitting$ ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isFormValid && !isSubmitting$ ? 'pointer' : 'not-allowed',
          }}>
          {isSubmitting$ ? '提交中...' : '注册'}
        </button>

        {errors$.submit && (
          <div
            style={{
              color: '#f44336',
              marginTop: '10px',
              padding: '8px',
              background: '#ffe8e8',
              borderRadius: '4px',
            }}>
            {errors$.submit}
          </div>
        )}
      </div>

      <div className='display'>
        <h4>表单状态</h4>
        <div>邮箱有效: {emailError ? '❌' : '✅'}</div>
        <div>密码有效: {passwordError ? '❌' : '✅'}</div>
        <div>密码确认: {confirmPasswordError ? '❌' : '✅'}</div>
        <div>表单有效: {isFormValid ? '✅' : '❌'}</div>
        <div>提交状态: {isSubmitting$ ? '提交中...' : '待提交'}</div>
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>表单验证</strong>:
        </p>
        <code>const emailError = validateEmail(email$)</code>
        <br />
        <code>const isFormValid = !hasErrors</code>
        <br />
        <code>
          {'{'}emailError && &lt;div&gt;{'{'}emailError{'}'}&lt;/div&gt;{'}'}
        </code>
        <br />
        <code>
          disabled={'{'}!isFormValid || isSubmitting${'}'}
        </code>
      </div>
    </div>
  )
}

function NestedSignalExample() {
  let appState$ = {
    user: null as Option<User>,
    settings: {
      theme: 'light' as 'light' | 'dark',
      notifications: true,
      language: 'zh-CN' as 'zh-CN' | 'en-US',
    },
    ui: {
      sidebarOpen: false,
      modalOpen: false,
      loading: false,
    },
  }

  const updateUser = (user: User | null) => {
    appState$ = { ...appState$, user }
  }

  const toggleTheme = () => {
    appState$ = {
      ...appState$,
      settings: {
        ...appState$.settings,
        theme: appState$.settings.theme === 'light' ? 'dark' : 'light',
      },
    }
  }

  const toggleSidebar = () => {
    appState$ = {
      ...appState$,
      ui: { ...appState$.ui, sidebarOpen: !appState$.ui.sidebarOpen },
    }
  }

  const simulateLoading = async () => {
    appState$ = { ...appState$, ui: { ...appState$.ui, loading: true } }
    await new Promise((resolve) => setTimeout(resolve, 2000))
    appState$ = { ...appState$, ui: { ...appState$.ui, loading: false } }
  }

  const sampleUsers: User[] = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: '👨' },
    { id: 2, name: '李四', email: 'lisi@example.com', avatar: '👩' },
  ]

  return (
    <div className='card complex-card'>
      <h3>🏗️ 嵌套 Signal 示例</h3>

      <div className='controls'>
        <h4>用户操作</h4>
        {sampleUsers.map((user) => (
          <button key={user.id} onClick={() => updateUser(user)}>
            设置用户: {user.name}
          </button>
        ))}
        <button onClick={() => updateUser(null)}>清除用户</button>
      </div>

      <div className='controls'>
        <h4>设置操作</h4>
        <button onClick={toggleTheme}>切换主题: {appState$.settings.theme}</button>
        <button onClick={toggleSidebar}>
          {appState$.ui.sidebarOpen ? '关闭' : '打开'}侧边栏
        </button>
        <button onClick={simulateLoading} disabled={appState$.ui.loading}>
          {appState$.ui.loading ? '加载中...' : '模拟加载'}
        </button>
      </div>

      <div
        className='display'
        style={{
          background: appState$.settings.theme === 'dark' ? '#333' : '#fff',
          color: appState$.settings.theme === 'dark' ? '#fff' : '#333',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #ccc',
        }}>
        <h4>应用状态预览</h4>

        {/* 用户信息 */}
        <div style={{ marginBottom: '10px' }}>
          <strong>当前用户:</strong>{' '}
          {appState$.user
            ? `${appState$.user.avatar} ${appState$.user.name}`
            : '未登录'}
        </div>

        {/* 设置信息 */}
        <div style={{ marginBottom: '10px' }}>
          <strong>主题:</strong>{' '}
          {appState$.settings.theme === 'light' ? '🌞 明亮' : '🌙 暗黑'}
          <br />
          <strong>通知:</strong>{' '}
          {appState$.settings.notifications ? '🔔 开启' : '🔕 关闭'}
          <br />
          <strong>语言:</strong>{' '}
          {appState$.settings.language === 'zh-CN' ? '🇨🇳 中文' : '🇺🇸 English'}
        </div>

        {/* UI 状态 */}
        <div>
          <strong>侧边栏:</strong> {appState$.ui.sidebarOpen ? '📖 打开' : '📕 关闭'}
          <br />
          <strong>加载状态:</strong> {appState$.ui.loading ? '⏳ 加载中' : '✅ 就绪'}
        </div>

        {/* 侧边栏模拟 */}
        {appState$.ui.sidebarOpen && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px',
              background: appState$.settings.theme === 'dark' ? '#555' : '#f5f5f5',
              borderRadius: '4px',
            }}>
            <h5>侧边栏内容</h5>
            <div>• 菜单项 1</div>
            <div>• 菜单项 2</div>
            <div>• 菜单项 3</div>
          </div>
        )}
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>嵌套状态</strong>:
        </p>
        <code>appState$.user?.name</code>
        <br />
        <code>appState$.settings.theme</code>
        <br />
        <code>
          appState$ = {'{'}...appState$, user{'}'}
        </code>
        <br />
        <code>
          nested: {'{'}...appState$.settings, theme: 'dark'{'}'}
        </code>
      </div>
    </div>
  )
}

function ResultTypeExample() {
  let apiResult$: Result<User[], string> = { success: false, error: '尚未开始' }
  let isLoading$ = false

  const fetchWithResult = async () => {
    isLoading$ = true
    apiResult$ = { success: false, error: '加载中...' }

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 模拟随机成功/失败
      if (Math.random() > 0.4) {
        const users: User[] = [
          { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: '👨' },
          { id: 2, name: '李四', email: 'lisi@example.com', avatar: '👩' },
          { id: 3, name: '王五', email: 'wangwu@example.com', avatar: '🧑' },
          { id: 4, name: '赵六', email: 'zhaoliu@example.com', avatar: '👤' },
        ]
        apiResult$ = { success: true, data: users }
      } else {
        apiResult$ = { success: false, error: '服务器错误：无法获取用户数据' }
      }
    } catch (err) {
      apiResult$ = { success: false, error: '网络异常：请检查网络连接' }
    } finally {
      isLoading$ = false
    }
  }

  const resetResult = () => {
    apiResult$ = { success: false, error: '尚未开始' }
    isLoading$ = false
  }

  return (
    <div className='card complex-card'>
      <h3>🎯 Result 类型示例</h3>

      <div className='controls'>
        <button onClick={fetchWithResult} disabled={isLoading$}>
          {isLoading$ ? '获取中...' : '获取用户数据'}
        </button>
        <button onClick={resetResult}>重置结果</button>
      </div>

      <div className='display'>
        {/* 结果状态指示 */}
        <div style={{ marginBottom: '15px' }}>
          <h4>API 调用结果</h4>
          <div
            style={{
              padding: '10px',
              borderRadius: '4px',
              background: apiResult$.success ? '#e8f5e8' : '#ffe8e8',
              border: `1px solid ${apiResult$.success ? '#4caf50' : '#f44336'}`,
            }}>
            <div>状态: {apiResult$.success ? '✅ 成功' : '❌ 失败'}</div>
            {apiResult$.success ? (
              <div>
                数据条数:{' '}
                {(apiResult$ as { success: true; data: User[] }).data.length}
              </div>
            ) : (
              <div>
                错误信息: {(apiResult$ as { success: false; error: string }).error}
              </div>
            )}
          </div>
        </div>

        {/* 成功时显示数据 */}
        {apiResult$.success && (
          <div>
            <h4>用户列表</h4>
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}>
              {(apiResult$ as { success: true; data: User[] }).data.map(
                (user: User) => (
                  <div
                    key={user.id}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                    <span style={{ fontSize: '20px' }}>{user.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* 失败时显示错误详情 */}
        {!apiResult$.success && apiResult$.error !== '尚未开始' && (
          <div
            style={{
              padding: '10px',
              background: '#ffe8e8',
              border: '1px solid #f44336',
              borderRadius: '4px',
            }}>
            <h4>错误详情</h4>
            <div>❌ {apiResult$.error}</div>
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              提示: 点击"获取用户数据"重试
            </div>
          </div>
        )}
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>Result 类型</strong>:
        </p>
        <code>let result$: Result&lt;T, E&gt; = ...</code>
        <br />
        <code>
          {'{'}result$.success ? result$.data : result$.error{'}'}
        </code>
        <br />
        <code>
          result$ = {'{'}success: true, data: users{'}'}
        </code>
        <br />
        <code>
          result$ = {'{'}success: false, error: 'message'{'}'}
        </code>
      </div>
    </div>
  )
}

function AdvancedStateExample() {
  // 复杂的应用状态
  let appState$ = {
    auth: {
      user: null as Option<User>,
      isLoggedIn: false,
      permissions: [] as string[],
    },
    ui: {
      theme: 'light' as 'light' | 'dark',
      language: 'zh-CN' as 'zh-CN' | 'en-US',
      notifications: {
        enabled: true,
        sound: true,
        desktop: false,
      },
    },
    data: {
      users: [] as User[],
      loading: false,
      error: null as Option<string>,
      lastUpdated: null as Option<Date>,
    },
  }

  // 认证操作
  const login = (user: User) => {
    appState$ = {
      ...appState$,
      auth: {
        user,
        isLoggedIn: true,
        permissions: user.id === 1 ? ['admin', 'user'] : ['user'],
      },
    }
  }

  const logout = () => {
    appState$ = {
      ...appState$,
      auth: {
        user: null,
        isLoggedIn: false,
        permissions: [],
      },
    }
  }

  // UI 设置操作
  const toggleTheme = () => {
    appState$ = {
      ...appState$,
      ui: {
        ...appState$.ui,
        theme: appState$.ui.theme === 'light' ? 'dark' : 'light',
      },
    }
  }

  const updateNotificationSettings = (
    key: 'enabled' | 'sound' | 'desktop',
    value: boolean,
  ) => {
    appState$ = {
      ...appState$,
      ui: {
        ...appState$.ui,
        notifications: {
          ...appState$.ui.notifications,
          [key]: value,
        },
      },
    }
  }

  // 数据操作
  const loadUsers = async () => {
    appState$ = {
      ...appState$,
      data: { ...appState$.data, loading: true, error: null },
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const users: User[] = [
        { id: 1, name: '管理员', email: 'admin@example.com', avatar: '👑' },
        { id: 2, name: '用户A', email: 'userA@example.com', avatar: '👨' },
        { id: 3, name: '用户B', email: 'userB@example.com', avatar: '👩' },
      ]

      appState$ = {
        ...appState$,
        data: {
          users,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        },
      }
    } catch (err) {
      appState$ = {
        ...appState$,
        data: {
          ...appState$.data,
          loading: false,
          error: '加载用户失败',
        },
      }
    }
  }

  const sampleUsers: User[] = [
    { id: 1, name: '管理员', email: 'admin@example.com', avatar: '👑' },
    { id: 2, name: '普通用户', email: 'user@example.com', avatar: '👤' },
  ]

  return (
    <div className='card complex-card'>
      <h3>🚀 高级状态管理示例</h3>

      {/* 认证区域 */}
      <div className='controls'>
        <h4>认证状态</h4>
        {!appState$.auth.isLoggedIn ? (
          <div>
            <span>未登录 - 选择身份登录:</span>
            {sampleUsers.map((user) => (
              <button key={user.id} onClick={() => login(user)}>
                {user.avatar} {user.name}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <span>
              已登录: {appState$.auth.user?.avatar} {appState$.auth.user?.name}
              (权限: {appState$.auth.permissions.join(', ')})
            </span>
            <button onClick={logout}>退出登录</button>
          </div>
        )}
      </div>

      {/* UI 设置区域 */}
      <div className='controls'>
        <h4>UI 设置</h4>
        <button onClick={toggleTheme}>
          主题: {appState$.ui.theme === 'light' ? '🌞 明亮' : '🌙 暗黑'}
        </button>
        <button
          onClick={() =>
            updateNotificationSettings(
              'enabled',
              !appState$.ui.notifications.enabled,
            )
          }>
          通知: {appState$.ui.notifications.enabled ? '🔔 开启' : '🔕 关闭'}
        </button>
        <button
          onClick={() =>
            updateNotificationSettings('sound', !appState$.ui.notifications.sound)
          }>
          声音: {appState$.ui.notifications.sound ? '🔊 开启' : '🔇 关闭'}
        </button>
      </div>

      {/* 数据区域 */}
      <div className='controls'>
        <h4>数据管理</h4>
        <button onClick={loadUsers} disabled={appState$.data.loading}>
          {appState$.data.loading ? '加载中...' : '加载用户'}
        </button>
        {appState$.data.lastUpdated && (
          <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
            最后更新: {appState$.data.lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* 状态预览 */}
      <div
        className='display'
        style={{
          background: appState$.ui.theme === 'dark' ? '#333' : '#fff',
          color: appState$.ui.theme === 'dark' ? '#fff' : '#333',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #ccc',
        }}>
        <h4>应用状态总览</h4>

        {/* 认证状态 */}
        <div style={{ marginBottom: '15px' }}>
          <strong>认证:</strong>
          <div style={{ marginLeft: '10px' }}>
            登录状态: {appState$.auth.isLoggedIn ? '✅ 已登录' : '❌ 未登录'}
            {appState$.auth.user && (
              <div>
                用户: {appState$.auth.user.name} ({appState$.auth.user.email})
              </div>
            )}
            <div>权限: [{appState$.auth.permissions.join(', ')}]</div>
          </div>
        </div>

        {/* UI 状态 */}
        <div style={{ marginBottom: '15px' }}>
          <strong>UI 设置:</strong>
          <div style={{ marginLeft: '10px' }}>
            主题: {appState$.ui.theme}
            <br />
            语言: {appState$.ui.language}
            <br />
            通知设置:
            {appState$.ui.notifications.enabled ? ' 开启' : ' 关闭'}
            {appState$.ui.notifications.sound ? ' | 声音开启' : ' | 声音关闭'}
            {appState$.ui.notifications.desktop ? ' | 桌面开启' : ' | 桌面关闭'}
          </div>
        </div>

        {/* 数据状态 */}
        <div>
          <strong>数据状态:</strong>
          <div style={{ marginLeft: '10px' }}>
            用户数量: {appState$.data.users.length}
            <br />
            加载状态: {appState$.data.loading ? '⏳ 加载中' : '✅ 就绪'}
            <br />
            {appState$.data.error && (
              <div style={{ color: '#f44336' }}>错误: {appState$.data.error}</div>
            )}
            {appState$.data.users.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong>用户列表:</strong>
                {appState$.data.users.map((user) => (
                  <div key={user.id} style={{ marginLeft: '10px' }}>
                    {user.avatar} {user.name} - {user.email}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='macro-info'>
        <p>
          🪄 <strong>高级状态管理</strong>:
        </p>
        <code>
          let appState$ = &#123;auth: &#123;...&#125;, ui: &#123;...&#125;, data:
          &#123;...&#125;&#125;
        </code>
        <br />
        <code>appState$.auth.user?.name</code>
        <br />
        <code>appState$ = &#123;...appState$, auth: &#123;...&#125;&#125;</code>
        <br />
        <code>nested: &#123;...appState$.ui.notifications, enabled: true&#125;</code>
      </div>
    </div>
  )
}

function MacroSyntaxDemo() {
  return (
    <div
      className='card glow-effect float-animation'
      style={{ gridColumn: '1 / -1' }}>
      <h3>🪄 G-Signal 宏语法说明</h3>
      <div className='syntax-comparison'>
        <div className='comparison-section'>
          <h4>💡 宏语法特点</h4>
          <ul className='feature-list'>
            <li>
              <strong>简洁声明</strong>：<code>let count$ = 0</code> 自动创建信号
            </li>
            <li>
              <strong>直接访问</strong>：<code>count$</code> 自动获取{' '}
              <code>.value</code>
            </li>
            <li>
              <strong>智能派发</strong>：<code>dispatch$(value)</code>{' '}
              自动找到对应信号
            </li>
            <li>
              <strong>类型安全</strong>：完整的 TypeScript 支持
            </li>
          </ul>
        </div>

        <div className='comparison-table'>
          <h4>📊 语法对比</h4>
          <table>
            <thead>
              <tr>
                <th>功能</th>
                <th>标准语法</th>
                <th>宏语法</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>创建信号</td>
                <td>
                  <code>const s = useSignal(0)</code>
                </td>
                <td>
                  <code>let s$ = 0</code>
                </td>
              </tr>
              <tr>
                <td>获取值</td>
                <td>
                  <code>useHookSignal(s)</code>
                </td>
                <td>
                  <code>s$</code>
                </td>
              </tr>
              <tr>
                <td>更新值</td>
                <td>
                  <code>s.dispatch(val)</code>
                </td>
                <td>
                  <code>dispatch$(val)</code>
                </td>
              </tr>
              <tr>
                <td>监听变化</td>
                <td>
                  <code>s.hook(callback)</code>
                </td>
                <td>
                  <code>watch$(s$, callback)</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function VitePluginGuide() {
  return (
    <div className='card glow-effect guide-card' style={{ gridColumn: '1 / -1' }}>
      <h3>⚙️ Vite 插件使用指南</h3>
      <div className='plugin-guide'>
        <div className='step'>
          <h4>1. 安装依赖</h4>
          <pre>
            <code>npm install @g-signal/macro</code>
          </pre>
        </div>

        <div className='step'>
          <h4>2. 配置 vite.config.ts</h4>
          <pre>
            <code>{`import { gSignalMacroPlugin } from '@g-signal/vite'

export default defineConfig({
  plugins: [
    gSignalMacroPlugin({
      debug: true,
      extensions: ['.tsx', '.ts'],
    }),
    react(),
  ],
})`}</code>
          </pre>
        </div>

        <div className='step'>
          <h4>3. 编写宏语法代码</h4>
          <pre>
            <code>{`function Counter() {
  let count$ = 0
  
  return (
    <button onClick={() => dispatch$(count$ + 1)}>
      计数: {count$}
    </button>
  )
}`}</code>
          </pre>
        </div>

        <div className='step'>
          <h4>4. 自动转换结果</h4>
          <pre>
            <code>{`function Counter() {
  let count$ = createSignal$(0)
  
  return (
    <button onClick={() => count$.dispatch(count$.value + 1)}>
      计数: {count$.value}
    </button>
  )
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className='container'>
      <h1 className='float-animation'>🪄 G-Signal 宏语法演示</h1>

      <MacroSyntaxDemo />

      <div className='section'>
        <h2>基础宏语法示例</h2>
        <div className='grid'>
          <Counter />
          <FormValidator />
          <TodoList />
          <WatchExample />
        </div>
      </div>

      <div className='section'>
        <h2>进阶 API 示例</h2>
        <div className='grid'>
          <AssignmentExample />
          <ObjectSignalExample />
          <ArraySignalExample />
          <ComputedExample />
          <ConditionalExample />
        </div>
      </div>

      <div className='section'>
        <h2>复杂应用场景</h2>
        <div className='grid'>
          <OptionTypeExample />
          <AsyncStateExample />
          <FormValidationExample />
          <NestedSignalExample />
          <ResultTypeExample />
          <AdvancedStateExample />
        </div>
      </div>

      <VitePluginGuide />
    </div>
  )
}

export default App
