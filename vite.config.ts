import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const apkMimePlugin = (): Plugin => ({
  name: 'apk-mime-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && req.url.includes('.apk')) {
        const isFestivo = req.url.includes('festivo');
        const filename = isFestivo ? 'festivo.apk' : 'swieta-ai.apk';
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && req.url.includes('.apk')) {
        const isFestivo = req.url.includes('festivo');
        const filename = isFestivo ? 'festivo.apk' : 'swieta-ai.apk';
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apkMimePlugin()],
  server: {
    host: true, // Listen on all network addresses (0.0.0.0) so phone can access via local IP
    port: 5173,
  },
});
