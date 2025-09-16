import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: process.env.VITE_DEV_API_PROXY_TARGET
      ? {
          '/api': {
            target: process.env.VITE_DEV_API_PROXY_TARGET,
            changeOrigin: true,
            secure: true,
          },
        }
      : undefined,
  },
});
