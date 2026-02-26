import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: '../',  // Load .env from Sarthi root directory
  optimizeDeps: {
    exclude: ['lipsync-en', 'talkinghead']  // Exclude from Vite's dep optimizer
  }
})
