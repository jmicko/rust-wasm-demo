import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    fs: {
      allow: ['..'], // Allow one level up
    },
  },
  plugins: [react()],
})
