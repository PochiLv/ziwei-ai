import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          charts: ['echarts', 'echarts-for-react', 'recharts'],
          markdown: ['react-markdown', 'remark-gfm'],
          astro: ['iztro', 'date-fns'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/codingplan/openai': {
        target: 'https://coding.dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/codingplan\/openai/, '/v1'),
      },
      '/api/codingplan/anthropic': {
        target: 'https://coding.dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/codingplan\/anthropic/, '/apps/anthropic'),
      },
    },
  },
})
