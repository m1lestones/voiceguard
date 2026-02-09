import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(process.cwd(), 'src') },
  },
  server: {
    port: 5173,
    host: true,
    // Use HTTP for local dev; localhost is still a secure context for mic
    // For phone testing later, use HTTPS (deploy or tunnel)
  },
})
