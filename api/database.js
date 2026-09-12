const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5432/habits',
  ssl: process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false
});

// Initialize tables
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        unit TEXT DEFAULT '',
        target_min REAL DEFAULT 1,
        target_ideal REAL DEFAULT 1,
        color TEXT DEFAULT '#6366f1',
        streak INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS habit_logs (
        id SERIAL PRIMARY KEY,
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        value REAL DEFAULT 1,
        completed BOOLEAN DEFAULT TRUE,
        notes TEXT DEFAULT '',
        FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id TEXT PRIMARY KEY,
        habit_id TEXT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
      )
    `);
    
    console.log('PostgreSQL database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
