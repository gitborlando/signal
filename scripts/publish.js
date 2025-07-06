#!/usr/bin/env node

/**
 * G-Signal 组织发包脚本
 *
 * 使用方法：
 * node scripts/publish.js --dry-run  # 预览发布
 * node scripts/publish.js           # 实际发布
 * node scripts/publish.js --help    # 查看帮助
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const PACKAGE_ORDER = [
  'core', // 核心包 (g-signal)，依赖 utils
  'react', // React 集成，依赖 core 和 utils
  'macro', // 宏包，依赖 utils
  'vite', // Vite 插件，依赖 macro
]

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[34m', // 蓝色
    success: '\x1b[32m', // 绿色
    warning: '\x1b[33m', // 黄色
    error: '\x1b[31m', // 红色
    reset: '\x1b[0m', // 重置
  }

  console.log(`${colors[type]}[${type.toUpperCase()}]${colors.reset} ${message}`)
}

function execCommand(command, options = {}) {
  try {
    log(`执行命令: ${command}`, 'info')
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      ...options,
    })
    return result
  } catch (error) {
    log(`命令执行失败: ${error.message}`, 'error')
    throw error
  }
}

function checkNpmAuth() {
  try {
    execCommand('npm whoami', { stdio: 'ignore' })
    log('NPM 认证状态正常', 'success')
  } catch (error) {
    log('请先登录 NPM: npm login', 'error')
    process.exit(1)
  }
}

function buildPackage(packageName) {
  const packagePath = join('packages', packageName)

  if (!existsSync(packagePath)) {
    log(`包目录不存在: ${packagePath}`, 'error')
    return false
  }

  log(`构建包: ${packageName}`, 'info')

  try {
    execCommand(`cd ${packagePath} && npm run build`)
    log(`构建成功: ${packageName}`, 'success')
    return true
  } catch (error) {
    log(`构建失败: ${packageName}`, 'error')
    return false
  }
}

function publishPackage(packageName, dryRun = false) {
  const packagePath = join('packages', packageName)
  const dryRunFlag = dryRun ? '--dry-run' : ''

  log(`${dryRun ? '预览' : '发布'}包: ${packageName}`, 'info')

  try {
    execCommand(`cd ${packagePath} && npm publish ${dryRunFlag}`)
    log(`${dryRun ? '预览' : '发布'}成功: ${packageName}`, 'success')
    return true
  } catch (error) {
    log(`${dryRun ? '预览' : '发布'}失败: ${packageName}`, 'error')
    return false
  }
}

function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const help = args.includes('--help')

  if (help) {
    console.log(`
G-Signal 组织发包脚本

使用方法：
  node scripts/publish.js [选项]

选项：
  --dry-run   预览发布，不实际发布
  --help      显示帮助信息

发布顺序：
  ${PACKAGE_ORDER.map((pkg) => `- ${pkg}`).join('\n  ')}

注意事项：
  1. 请确保已登录 NPM: npm login
  2. 请确保已创建 g-signal 组织
  3. 请确保所有包都已构建
`)
    return
  }

  log('开始 G-Signal 组织发包流程', 'info')

  if (!dryRun) {
    checkNpmAuth()
  }

  // 按顺序构建和发布
  let successCount = 0
  let failureCount = 0

  for (const packageName of PACKAGE_ORDER) {
    log(`\n处理包: ${packageName}`, 'info')

    // 构建包
    if (!buildPackage(packageName)) {
      failureCount++
      continue
    }

    // 发布包
    if (publishPackage(packageName, dryRun)) {
      successCount++
    } else {
      failureCount++
    }
  }

  log(`\n发布完成统计:`, 'info')
  log(`成功: ${successCount}`, 'success')
  log(`失败: ${failureCount}`, failureCount > 0 ? 'error' : 'info')

  if (failureCount > 0) {
    process.exit(1)
  }
}

main()
