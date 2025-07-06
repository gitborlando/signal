# 📦 G-Signal 组织发包指南

## 🎯 概述

G-Signal 采用 monorepo 架构，包含多个相互依赖的包。本指南详细说明了如何以组织形式发布所有包到 npm。

## 📁 包结构

```
g-signal              # 核心信号系统
@g-signal/
├── react     # React 集成
├── utils     # 通用工具函数
├── macro     # 宏转换工具
└── vite      # Vite 插件
```

## 🔧 发布前准备

### 1. 创建 NPM 组织

#### 方法一：通过网站创建

1. 访问 [npmjs.com](https://www.npmjs.com/)
2. 登录后点击 "Add Organization"
3. 输入组织名称：`g-signal`
4. 选择 **Free** (公共包) 或 **Paid** (支持私有包)

#### 方法二：命令行创建

```bash
npm org create g-signal
```

### 2. 登录 NPM

```bash
npm login
```

### 3. 验证登录状态

```bash
npm whoami
```

## 🚀 发布流程

### 自动化发布（推荐）

#### 1. 预览发布

```bash
npm run publish:dry
```

#### 2. 正式发布

```bash
npm run publish:all
```

#### 3. 查看帮助

```bash
npm run publish:help
```

### 手动发布

#### 发布顺序很重要！必须按以下顺序：

注意：@g-signal/utils 是私有包，不会发布。其工具函数已内联到各个包中。

```bash
cd packages/utils
npm run build
npm publish
```

1. **g-signal** - 核心包

```bash
cd packages/core
npm run build
npm publish
```

2. **@g-signal/react** - React 集成（依赖 g-signal）

```bash
cd packages/react
npm run build
npm publish
```

3. **@g-signal/macro** - 宏包

```bash
cd packages/macro
npm run build
npm publish
```

4. **@g-signal/vite** - Vite 插件（依赖 macro）

```bash
cd packages/vite
npm run build
npm publish
```

## 📋 发布检查清单

### 发布前检查

- [ ] 确认已登录 NPM (`npm whoami`)
- [ ] 确认已创建 g-signal 组织
- [ ] 确认所有测试通过
- [ ] 确认版本号正确
- [ ] 确认 CHANGELOG 已更新

### 发布后检查

- [ ] 确认所有包都已发布成功
- [ ] 在 npmjs.com 上验证包可见性
- [ ] 测试安装：`npm install g-signal`
- [ ] 验证依赖关系正确

## 🔧 配置说明

### 包配置（package.json）

每个包都包含以下发布配置：

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### 工作区配置（.npmrc）

```ini
# 默认 npm 注册表
registry=https://registry.npmjs.org/
@g-signal:registry=https://registry.npmjs.org/

# 默认访问权限
access=public
```

## 🛠️ 故障排除

### 常见问题

#### 1. 权限错误

```bash
# 错误：403 Forbidden
npm ERR! code E403
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/g-signal
```

**解决方案：**

- 确认已登录：`npm whoami`
- 确认是组织成员：访问 npmjs.com 检查
- 确认包名正确：`g-signal` 或 `@g-signal/package-name`

#### 2. 组织不存在

```bash
# 错误：组织不存在
npm ERR! code E404
npm ERR! 404 Not Found - PUT https://registry.npmjs.org/g-signal
```

**解决方案：**

- 创建组织：`npm org create g-signal`
- 或通过网站创建

#### 3. 依赖版本问题

```bash
# 错误：依赖包不存在
npm ERR! Cannot resolve dependency
```

**解决方案：**

- 按正确顺序发布包
- 确认依赖包已成功发布

## 📚 相关文档

- [NPM 组织文档](https://docs.npmjs.com/creating-an-organization)
- [发布 Scoped 包](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
- [Monorepo 发布最佳实践](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

## 🔄 版本管理

### 语义化版本控制

- `MAJOR.MINOR.PATCH`
- **MAJOR**: 破坏性更改
- **MINOR**: 新功能（向后兼容）
- **PATCH**: 问题修复

### 发布新版本

1. 更新版本号：`npm version patch/minor/major`
2. 更新 CHANGELOG
3. 提交更改：`git commit -am "Release v1.0.1"`
4. 创建标签：`git tag v1.0.1`
5. 推送：`git push && git push --tags`
6. 发布：`npm run publish:all`

---

💡 **提示**: 首次发布建议使用 `npm run publish:dry` 预览，确认无误后再执行正式发布。
