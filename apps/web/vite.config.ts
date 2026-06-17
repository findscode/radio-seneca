import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@radio-seneca/shared': path.resolve(__dirname, '../../packages/shared/src'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    host: true,
    port: 5175,
    strictPort: true,
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
      '/radio': {
        target: process.env.VITE_AZURACAST_URL || 'https://demo.azuracast.com',
        changeOrigin: true,
        secure: true,
      },
      '/listen': {
        target: process.env.VITE_AZURACAST_URL || 'https://demo.azuracast.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
