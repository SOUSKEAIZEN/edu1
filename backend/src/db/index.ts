import { Pool } from 'pg';
import { ENV } from '../env';
import fs from 'fs';
import path from 'path';

let sslConfig: any = false;

if (ENV.DATABASE_URL.includes('aivencloud') || ENV.DATABASE_URL.includes('sslmode=require')) {
  // If a ca.pem file exists, use it. Otherwise, accept the self-signed cert for development.
  const caPath = path.join(__dirname, '../../ca.pem');
  if (fs.existsSync(caPath)) {
    sslConfig = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(caPath).toString(),
    };
  } else {
    sslConfig = {
      rejectUnauthorized: false,
    };
  }
}

const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  max: ENV.NODE_ENV === 'production' ? 50 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: sslConfig,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();
