import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Ports 5173 (WebSong) et 8080 (motionsiteex) sont déjà pris.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5190, strictPort: true },
  preview: { port: 5191 },
})
