import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    return res.status(200).json({
      success: true,
      database: 'connected'
    });
  } catch (error) {
    console.error('Health Check Error:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR'
    });
  }
}
