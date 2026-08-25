import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Grocery Planner & Price Estimator',
        short_name: 'GroceryPlan',
        description: 'Smart grocery shopping planner with price estimation and trolley checklist',
        theme_color: '#f8f5e8',
        background_color: '#f8f5e8',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
     alias: {
       "@": path.resolve(import.meta.dirname, "./src"),
     },
   },
  server: {
    port: 3321,
    proxy: {
      // Development-only proxy. Production uses VITE_API_BASE_URL at build time.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  },
})
