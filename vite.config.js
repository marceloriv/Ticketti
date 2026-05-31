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
      '@contexts': path.resolve(process.cwd(), './src/contexts'),
      '@hooks': path.resolve(process.cwd(), './src/hooks'),
      '@utils': path.resolve(process.cwd(), './src/utils'),
      '@assets': path.resolve(process.cwd(), './src/assets'),
      '@styles': path.resolve(process.cwd(), './src/styles'),
    },
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8222',
        changeOrigin: true,
        secure: false,
      },
      '/api/v0': {
        target: 'http://localhost:8222',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8222',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
