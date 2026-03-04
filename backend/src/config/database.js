// ═══════════════════════════════════════════════════════════════════════════
// Database Configuration & Connection Pool
// ═══════════════════════════════════════════════════════════════════════════

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ Database is ready:', res.rows[0]);
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};

// Wrapper for executing queries
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  pool,
  initializeDatabase
};
