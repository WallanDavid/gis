import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/geointel-rj-v5/',
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
        manualChunks(id) {
          if (id.includes('src/data/eleicoesReais.js')) return 'candidatos-rj'
          if (id.includes('node_modules')) {
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'leaflet'
            if (id.includes('recharts')) return 'charts'
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('jspdf-autotable')) return 'pdf'
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-hot-toast')) return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
