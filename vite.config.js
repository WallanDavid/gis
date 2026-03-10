import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwind(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ['leaflet', 'react-leaflet'],
          charts: ['recharts'],
          pdf: ['jspdf', 'jspdf-autotable', 'html2canvas'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
