import pg from 'pg';

const { Pool } = pg;

let _pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (_pool) return _pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('[db] DATABASE_URL is not set');
  }
  const max = Math.max(1, Number(process.env.PG_POOL_MAX || 20));
  const idleTimeoutMillis = Math.max(0, Number(process.env.PG_IDLE_TIMEOUT_MS || 30000));
  const connectionTimeoutMillis = Math.max(0, Number(process.env.PG_CONN_TIMEOUT_MS || 5000));
  _pool = new Pool({
    connectionString,
    max,
    idleTimeoutMillis,
    connectionTimeoutMillis,
    allowExitOnIdle: true,
    ssl:
      process.env.DATABASE_SSL === 'true' || /sslmode=require/i.test(connectionString || '')
        ? { rejectUnauthorized: false }
        : undefined,
  });
  _pool.on('error', (err) => {
    console.error('[db] idle client error', err);
  });
  return _pool;
}

export const pool = {
  query: <T extends pg.QueryResultRow = any>(text: string, params?: any[]) =>
    getPool().query<T>(text, params),
  connect: () => getPool().connect(),
  end: () => (_pool ? _pool.end() : Promise.resolve()),
} as unknown as pg.Pool & { end: () => Promise<void> };

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]) {
  return getPool().query<T>(text, params);
}

export async function getClient() {
  return getPool().connect();
}
