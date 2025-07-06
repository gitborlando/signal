# G-Signal React 演示

这是一个展示 G-Signal 在 React 应用中使用的完整示例项目。

## 🚀 快速开始

1. 安装依赖：

```bash
pnpm install
```

2. 启动开发服务器：

```bash
pnpm dev
```

3. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📦 功能演示

### 基础功能

- **🔢 基础计数器**: 展示最简单的信号使用
- **🌍 全局状态**: 演示跨组件的状态共享

### 实际应用

- **📝 表单验证**: 实时表单验证，展示复杂的派生状态
- **📋 Todo 列表**: 完整的 CRUD 操作演示

### 高级功能

- **🔗 信号合并**: 演示多个信号的合并逻辑
- **📦 批量处理**: 展示批量更新的性能优化
- **⚡ 性能测试**: 创建大量信号和 hook 的性能测试

## 💡 核心概念

### 1. 创建信号

```typescript
const count = useSignal(0)
```

### 2. 监听信号值

```typescript
const countValue = useHookSignal(count)
```

### 3. 更新信号

```typescript
count.dispatch(newValue)
```

### 4. 全局状态

```typescript
// 在组件外部创建
const globalCounter = createSignal(0)

// 在组件内部使用
const counterValue = useHookSignal(globalCounter)
```

## 🎯 特性亮点

- **🔥 极高性能**: 1000个hook仅需0.08ms
- **🧠 智能合并**: 支持 AND/OR 逻辑的信号合并
- **📦 批量处理**: 避免重复渲染，提升性能
- **🔒 类型安全**: 完整的 TypeScript 支持
- **🎨 现代UI**: 美观的渐变设计和交互效果

## 🛠️ 技术栈

- **React 18**: 最新的 React 版本
- **TypeScript**: 类型安全
- **Vite**: 快速开发和构建
- **G-Signal**: 高性能状态管理

## 📚 学习资源

通过这个示例，您可以学习到：

- 如何在 React 中使用 G-Signal
- 不同类型的状态管理模式
- 性能优化技巧
- 实际应用场景
