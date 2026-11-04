import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: isSsrBuild ? {} : { output: { manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'], motion: ['framer-motion'], supa: ['@supabase/supabase-js'] } } },
  },
}))
