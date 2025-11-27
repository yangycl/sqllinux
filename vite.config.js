import { defineConfig } from 'vite'

export default defineConfig({
  base: '/你的repository名稱/',  // 改成你的 repo 名稱
  build: {
    outDir: 'dist'
  }
})