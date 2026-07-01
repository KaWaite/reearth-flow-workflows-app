import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_URL ?? '/',
  plugins: [react()],
  server: {
    proxy: {
      '/flow-api': {
        target: 'https://api.flow.reearth.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/flow-api/, ''),
      },
    },
  },
})
