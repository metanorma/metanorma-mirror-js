import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  root: './tests/e2e',
  server: {
    port: 0, // random available port
  },
})
