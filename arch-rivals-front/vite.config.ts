import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Canal temps réel (Socket.IO) : même origine que l'API, WebSocket compris.
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})
