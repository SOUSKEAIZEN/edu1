import { Pool } from 'pg';
import { ENV } from '../env';

const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  max: ENV.NODE_ENV === 'production' ? 50 : 10, // Limit connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();
