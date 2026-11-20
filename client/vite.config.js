import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The dev server proxies /api to Express so the auth cookie is same-origin (no CORS needed).
const target = process.env.VITE_API_TARGET || 'http://localhost:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    postcss: {},
  },
  server: { port: 5173, proxy: { '/api': { target, changeOrigin: true } } },
});
