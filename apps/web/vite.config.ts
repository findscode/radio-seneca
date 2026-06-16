import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@radio-seneca/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/live': {
        target: process.env.VITE_AZURACAST_URL || 'https://demo.azuracast.com',
        changeOrigin: true,
        secure: true,
      },
      '/api/nowplaying': {
        target: process.env.VITE_AZURACAST_URL || 'https://demo.azuracast.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
