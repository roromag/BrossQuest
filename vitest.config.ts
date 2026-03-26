import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Config séparée de vite.config.ts pour éviter l'interférence vite-plugin-pwa avec vitest
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
