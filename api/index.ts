import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { apiRouter } from '../src/server/routes.ts';
import { seedInitialData } from '../src/db/seed.ts';

const app = express();

app.set('trust proxy', true);

// Cross-Origin Resource Sharing (CORS) & Preflight Handler
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-correlation-id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check endpoints
app.get(['/health', '/api/health', '/api/v1/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'AJ ENTERPRISE SOLUTIONS – SILPHOR PLATFORM CONTROL CENTER (VERCEL)',
    timestamp: new Date().toISOString(),
  });
});

// Lazy seeding for database on first serverless invocation
let isSeeded = false;
app.use(async (_req, _res, next) => {
  if (!isSeeded) {
    isSeeded = true;
    try {
      await seedInitialData();
    } catch (e) {
      // Non-fatal if database is not reachable yet
      console.warn('Serverless initialization seed notice:', e);
    }
  }
  next();
});

// Route handlers for all possible path prefixes in Vercel serverless rewrites
app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
