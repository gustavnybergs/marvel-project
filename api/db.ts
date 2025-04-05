import * as dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? 'Finns' : 'Saknas');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;

// Alternativ wrapper för att använda samma funktion överallt
export async function executeQuery(query: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}
