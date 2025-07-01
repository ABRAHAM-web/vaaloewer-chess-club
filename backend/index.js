// index.js (callback style)
const express = require('express');

const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

const mysql = require('mysql2');

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'chess_user',
  password: 'chess_club_password',
  database: 'chess_club'
});

// Test connection
db.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Error:', err);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});


// === ROUTES ===

// Register
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  const sqlCheck = 'SELECT * FROM users WHERE username = ?';
  db.query(sqlCheck, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length > 0) return res.status(409).json({ message: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const sqlInsert = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.query(sqlInsert, [username, hashed, role], (err2) => {
      if (err2) return res.status(500).json({ message: 'Insert failed' });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});


// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', user: { username: user.username, role: user.role, id: user.id } });
  });
});


// Get all players
app.get('/admin/players', (req, res) => {
  const sql = 'SELECT id, username, role FROM users ORDER BY username ASC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});


// Add a game
app.post('/admin/games', (req, res) => {
  const { white_player_id, black_player_id, result } = req.body;

  if (!white_player_id || !black_player_id || !result) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const sql = `
    INSERT INTO games (white_player_id, black_player_id, result)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [white_player_id, black_player_id, result], (err, resultData) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(201).json({ message: 'Game recorded successfully' });
  });
});


// Get all games (with player names)
app.get('/admin/games', (req, res) => {
  const sql = `
    SELECT 
      g.id,
      u1.username AS white_player,
      u2.username AS black_player,
      g.result,
      g.date_played
    FROM games g
    JOIN users u1 ON g.white_player_id = u1.id
    JOIN users u2 ON g.black_player_id = u2.id
    ORDER BY g.date_played DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
