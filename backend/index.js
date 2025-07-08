const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'chess_user',
  password: 'chess_club_password',
  database: 'chess_club'
});

app.get('/', (req, res) => {
  res.send('✅ Chess Club Backend is running!');
});

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: true });
  } catch (err) {
    res.status(500).json({ status: 'fail', db: false });
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
      [username, hashed, 'player']);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering', error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

app.get('/admin/players', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username FROM users');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching players:', err);
    res.status(500).json({ message: 'Error fetching players' });
  }
});

app.get('/admin/games', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT g.id, 
             g.white_player_id, wp.username AS white_player,
             g.black_player_id, bp.username AS black_player,
             g.result,
             g.date_played
      FROM games g
      JOIN users wp ON g.white_player_id = wp.id
      JOIN users bp ON g.black_player_id = bp.id
      ORDER BY g.date_played DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

app.get('/player/:id', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, username, role, avatar FROM users WHERE id = ?', 
      [req.params.id]);
    if (results.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

app.get('/player/:id/games', async (req, res) => {
  const playerId = req.params.id;
  const sql = `
    SELECT g.id, 
           g.white_player_id,
           g.black_player_id,
           CASE
             WHEN g.white_player_id = ? THEN u2.username
             ELSE u1.username
           END AS opponent,
           g.result,
           g.date_played
    FROM games g
    JOIN users u1 ON g.white_player_id = u1.id
    JOIN users u2 ON g.black_player_id = u2.id
    WHERE g.white_player_id = ? OR g.black_player_id = ?
    ORDER BY g.date_played DESC
  `;

  try {
    const [rows] = await db.query(sql, [playerId, playerId, playerId]);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching games:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

app.get('/players/standings', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        u.id, u.username,
        COALESCE(SUM(
          CASE 
            WHEN g.result = '1-0' AND g.white_player_id = u.id THEN 1
            WHEN g.result = '0-1' AND g.black_player_id = u.id THEN 1
            WHEN g.result = '½-½' THEN 0.5
            ELSE 0
          END
        ),0) AS points,
        COALESCE(SUM(
          CASE 
            WHEN g.result = '1-0' AND g.white_player_id = u.id THEN 1
            WHEN g.result = '0-1' AND g.black_player_id = u.id THEN 1
            ELSE 0
          END
        ),0) AS wins,
        COALESCE(SUM(
          CASE 
            WHEN g.result = '0-1' AND g.white_player_id = u.id THEN 1
            WHEN g.result = '1-0' AND g.black_player_id = u.id THEN 1
            ELSE 0
          END
        ),0) AS losses,
        COALESCE(SUM(
          CASE WHEN g.result = '½-½' THEN 1 ELSE 0 END
        ),0) AS draws,
        COUNT(g.id) AS total_games
      FROM users u
      LEFT JOIN games g ON u.id = g.white_player_id OR u.id = g.black_player_id
      GROUP BY u.id
      ORDER BY points DESC, u.username ASC
    `);
    res.json(results);
  } catch (err) {
    console.error('❌ Error fetching standings:', err);
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

app.post('/admin/games', async (req, res) => {
  const { white_player_id, black_player_id, result } = req.body;

  if (!white_player_id || !black_player_id || !result) {
    return res.status(400).json({ message: 'Missing game data' });
  }

  try {
    const [insertResult] = await db.query(
      `INSERT INTO games (white_player_id, black_player_id, result)
       VALUES (?, ?, ?)`,
      [white_player_id, black_player_id, result]
    );
    console.log('✅ Game added with ID:', insertResult.insertId);
    res.status(201).json({ message: 'Game added', gameId: insertResult.insertId });
  } catch (err) {
    console.error('❌ Error adding game:', err);
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});


app.post('/admin/player/:id/update', async (req, res) => {
  const { role, avatar } = req.body;
  try {
    await db.query('UPDATE users SET role = ?, avatar = ? WHERE id = ?', 
      [role, avatar, req.params.id]);
    res.json({ message: 'Player updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
