import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite que el servidor escuche en 0.0.0.0 (todas las interfaces)
    port: 5173, // Puedes cambiar el puerto si lo deseas
  },
})
