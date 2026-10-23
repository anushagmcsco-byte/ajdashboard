import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes.ts';
import { seedInitialData } from './src/db/seed.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Auto-seed initial baseline data (sites, roles, products, courses, features)
  try {
    await seedInitialData();
  } catch (err) {
    console.error('Failed seeding initial database data:', err);
  }

  // Health probe
  app.get('/health', (_req, res) => {
    res.json({
      status: 'UP',
      service: 'AJ ENTERPRISE SOLUTIONS – SILPHOR PLATFORM CONTROL CENTER',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API v1
  app.use('/api/v1', apiRouter);

  // Vite Integration in Development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AJ Enterprise Solutions Control Center running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
