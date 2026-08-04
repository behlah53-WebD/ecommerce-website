import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'My App',
        short_name: 'MyApp',
        description: 'My React Vite PWA',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo1.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/logo1.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: '/logo1.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Zyra Storefront Desktop',
          },
          {
            src: '/logo1.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Zyra Storefront Mobile',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});