const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// Auth Middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  
  const expectedPassword = process.env.APP_PASSWORD;
  if (!expectedPassword) return next(); // Skip if no password configured (local dev)
  
  const clientPassword = req.headers['x-app-password'];
  if (clientPassword !== expectedPassword) {
    return res.status(401).json({ error: 'No autorizado. Contraseña incorrecta.' });
  }
  
  next();
});

// --- HABITS ENDPOINTS ---

// Get all habits
app.get('/api/habits', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM habits ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new habit
app.post('/api/habits', async (req, res) => {
  const { id, name, unit = '', target_min = 1, target_ideal = 1, color = '#6366f1' } = req.body;
  if (!id || !name || !name.trim()) {
    return res.status(400).json({ error: 'Habit id and name are required' });
  }
  const sql = `
    INSERT INTO habits (id, name, unit, target_min, target_ideal, color) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  try {
    await db.query(sql, [id, name.trim(), unit.trim(), Number(target_min) || 1, Number(target_ideal) || 1, color]);
    res.status(201).json({ message: 'Habit created successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a habit
app.put('/api/habits/:id', async (req, res) => {
  const { id } = req.params;
  const { name, unit = '', target_min = 1, target_ideal = 1, color = '#6366f1' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Habit name is required' });
  }
  const sql = `
    UPDATE habits 
    SET name = $1, unit = $2, target_min = $3, target_ideal = $4, color = $5 
    WHERE id = $6
  `;
  try {
    const result = await db.query(sql, [name.trim(), unit.trim(), Number(target_min) || 1, Number(target_ideal) || 1, color, id]);
    res.json({ message: 'Habit updated successfully', changes: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a habit
app.delete('/api/habits/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // ON DELETE CASCADE on foreign keys will handle habit_logs and milestones
    const result = await db.query('DELETE FROM habits WHERE id = $1', [id]);
    res.json({ message: 'Habit deleted successfully', changes: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get habit logs
app.get('/api/habits/logs', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM habit_logs ORDER BY date ASC');
    // Convert boolean back to 1/0 if frontend expects it, though true/false usually works fine
    res.json(rows.map(row => ({
      ...row,
      completed: row.completed ? 1 : 0
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log a habit value/completion for a day
app.post('/api/habits/logs', async (req, res) => {
  const { habit_id, date, value = 0, completed = true, notes = '' } = req.body;
  
  try {
    // First delete any existing log for this habit and date
    await db.query('DELETE FROM habit_logs WHERE habit_id = $1 AND date = $2', [habit_id, date]);
    
    // If completed is true (or value > 0), insert the new log
    if (completed && Number(value) > 0) {
      const sql = `
        INSERT INTO habit_logs (habit_id, date, value, completed, notes) 
        VALUES ($1, $2, $3, $4, $5)
      `;
      await db.query(sql, [habit_id, date, Number(value), true, notes]);
      res.status(201).json({ message: 'Log added/updated' });
    } else {
      res.status(200).json({ message: 'Log removed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MILESTONES ENDPOINTS (Log de Victorias) ---

// Get all milestones
app.get('/api/milestones', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM milestones ORDER BY date DESC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a milestone
app.post('/api/milestones', async (req, res) => {
  const { id, habit_id = null, title, description = '', date } = req.body;
  if (!id || !title || !title.trim() || !date) {
    return res.status(400).json({ error: 'Milestone id, title, and date are required' });
  }
  const sql = `
    INSERT INTO milestones (id, habit_id, title, description, date) 
    VALUES ($1, $2, $3, $4, $5)
  `;
  try {
    await db.query(sql, [id, habit_id, title.trim(), description.trim(), date]);
    res.status(201).json({ message: 'Milestone created successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a milestone
app.delete('/api/milestones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM milestones WHERE id = $1', [id]);
    res.json({ message: 'Milestone deleted successfully', changes: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app for Vercel Serverless Functions
module.exports = app;
