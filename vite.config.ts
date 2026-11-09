import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function enterpriseApiPlugin(): Plugin {
  return {
    name: 'enterprise-api-server',
    async configureServer(server) {
      const { app } = await import('./server/server.js');
      server.middlewares.use(app);
    },
    async configurePreviewServer(server) {
      const { app } = await import('./server/server.js');
      server.middlewares.use(app);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), enterpriseApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
  },
});
