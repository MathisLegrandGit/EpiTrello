import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  server: {
    host: true, // Expose to all network interfaces (0.0.0.0)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
