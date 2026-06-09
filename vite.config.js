/* global process */
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      '@components': path.resolve(process.cwd(), './src/components'),
      '@pages': path.resolve(process.cwd(), './src/pages'),
      '@routes': path.resolve(process.cwd(), './src/routes'),
      '@services': path.resolve(process.cwd(), './src/services'),
      '@api': path.resolve(process.cwd(), './src/api'),
      '@contexts': path.resolve(process.cwd(), './src/contexts'),
      '@hooks': path.resolve(process.cwd(), './src/hooks'),
      '@utils': path.resolve(process.cwd(), './src/utils'),
      '@assets': path.resolve(process.cwd(), './src/assets'),
      '@styles': path.resolve(process.cwd(), './src/styles'),
    },
  },
  server: {
    proxy: {
      // Todas las rutas /api pasan por el BFF para validar JWT, roles y errores antes de llegar al API Gateway.
      '/api/v1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending request to the target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received response from the target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/v0': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },

      // Login/autenticación también vive en el BFF.
      '/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
