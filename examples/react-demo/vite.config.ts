import gSignalMacroPlugin from '@g-signal/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // G-Signal 宏转换插件 - 必须在 React 插件之前
    gSignalMacroPlugin(),
    react(),
  ],
  server: {
    port: 3000,
  },
  build: {
    sourcemap: false, // 禁用生成 .map 文件
    rollupOptions: {
      output: {
        // 禁用生成 .d.ts 文件的相关配置
      },
    },
  },
})
