import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      // The preview page and every dashboard thumbnail are rendered by the
      // FastAPI backend (see backend/app/routers/preview.py), not by the
      // React app. Without this proxy, requests to /p/{slug} just fall
      // through to the SPA's index.html (no matching React route -> blank
      // page), which is also why thumbnails in FileCard.jsx never load.
      '/p': 'http://localhost:8000'
    }
  }
})
