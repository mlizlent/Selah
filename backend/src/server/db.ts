import pg from 'pg';

const { Pool } = pg;

let _pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (_pool) return _pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('[db] DATABASE_URL is not set');
  }
  _pool = new Pool({
    connectionString,
    ssl:
      process.env.DATABASE_SSL === 'true' || /sslmode=require/i.test(connectionString || '')
        ? { rejectUnauthorized: false }
        : undefined,
  });
  return _pool;
}

export const pool = {
  query: <T extends pg.QueryResultRow = any>(text: string, params?: any[]) =>
    getPool().query<T>(text, params),
  connect: () => getPool().connect(),
} as unknown as pg.Pool;

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]) {
  return getPool().query<T>(text, params);
}

export async function getClient() {
  return getPool().connect();
}
