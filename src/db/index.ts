import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const isDbConfigured = Boolean(
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  (process.env.SQL_HOST && process.env.SQL_DB_NAME)
);

export const createPool = () => {
  if (!global._postgresPool) {
    const connStr = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    const poolConfig = connStr
      ? {
          connectionString: connStr,
          max: 10,
          connectionTimeoutMillis: 3500,
          ssl: connStr.includes('localhost') ? false : { rejectUnauthorized: false },
        }
      : {
          host: process.env.SQL_HOST || '127.0.0.1',
          user: process.env.SQL_USER || 'postgres',
          password: process.env.SQL_PASSWORD || '',
          database: process.env.SQL_DB_NAME || 'aj_control_center',
          max: 10,
          connectionTimeoutMillis: 3500,
        };

    global._postgresPool = new Pool(poolConfig);

    global._postgresPool.on('error', (err) => {
      console.warn('Postgres connection pool client notice:', err?.message || err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
