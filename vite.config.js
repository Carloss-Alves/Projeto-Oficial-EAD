import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' garante que o build funcione abrindo o index.html direto no navegador (file://)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
