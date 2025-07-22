// index.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Database connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'chess_user',
  password: 'chess_club_password',
  database: 'chess_club'
});

// Health check
app.get('/', (req, res) => {
  res.send('Chess Club API running');
});

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(500).json({ status: 'fail' });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        avatar: user.avatar,
        is_available: user.is_available
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// User register
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  console.log("Received registration request:", req.body);

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const [existingUser] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email]
    );

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    console.error("❌ Registration failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Standings page
app.get('/players/standings', async (req, res) => {
  try {
    const [players] = await db.query(`
      SELECT 
        u.id, u.username, u.role, u.avatar, u.is_available, u.email,
        COALESCE(SUM(CASE 
          WHEN (g.result = '1-0' AND g.white_player_id = u.id) OR
               (g.result = '0-1' AND g.black_player_id = u.id) THEN 1 ELSE 0 END),0) AS wins,
        COALESCE(SUM(CASE 
          WHEN (g.result = '0-1' AND g.white_player_id = u.id) OR
               (g.result = '1-0' AND g.black_player_id = u.id) THEN 1 ELSE 0 END),0) AS losses,
        COALESCE(SUM(CASE WHEN g.result = '½-½' THEN 1 ELSE 0 END),0) AS draws,
        COUNT(g.id) AS total_games,
        COALESCE(SUM(
          CASE 
            WHEN g.result = '1-0' AND g.white_player_id = u.id THEN 1
            WHEN g.result = '0-1' AND g.black_player_id = u.id THEN 1
            ELSE 0
          END
        ),0) AS points
      FROM users u
      LEFT JOIN games g ON g.white_player_id = u.id OR g.black_player_id = u.id
      GROUP BY u.id
      ORDER BY points DESC
    `);
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load standings', error: err.message });
  }
});

// Player info
app.get('/player/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Player not found" });
    }
  } catch (err) {
    console.error("Error fetching player:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Player games
app.get('/player/:id/games', async (req, res) => {
  try {
    const [games] = await db.query(`
      SELECT 
        g.id, wp.username AS white_player, bp.username AS black_player, g.result, g.date_played
      FROM games g
      JOIN users wp ON g.white_player_id = wp.id
      JOIN users bp ON g.black_player_id = bp.id
      WHERE g.white_player_id = ? OR g.black_player_id = ?
      ORDER BY g.date_played DESC
    `, [req.params.id, req.params.id]);
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: 'Error loading games', error: err.message });
  }
});

// Update player (admin & self-edit)
app.put('/player/:id', async (req, res) => {
  const { email, avatar, is_available, role } = req.body;

  if (!email || typeof is_available === 'undefined') {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await db.query(`
      UPDATE users 
      SET email = ?, avatar = ?, is_available = ?, role = ?
      WHERE id = ?
    `, [email, avatar || null, is_available ? 1 : 0, role, req.params.id]);

    const [updated] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update player', error: err.message });
  }
});

// Admin: get all games
app.get('/admin/games', async (req, res) => {
  try {
    const [games] = await db.query(`
      SELECT 
        g.id, wp.username AS white_player, bp.username AS black_player, g.result, g.date_played
      FROM games g
      JOIN users wp ON g.white_player_id = wp.id
      JOIN users bp ON g.black_player_id = bp.id
      ORDER BY g.date_played DESC
    `);
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load games', error: err.message });
  }
});

// Admin: get players for add-game dropdown
app.get('/admin/players', async (req, res) => {
  try {
    const [players] = await db.query('SELECT id, username FROM users ORDER BY username');
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load players', error: err.message });
  }
});

// Admin: add game
app.post('/admin/games', async (req, res) => {
  const { white_player_id, black_player_id, result } = req.body;
  try {
    await db.query(`
      INSERT INTO games (white_player_id, black_player_id, result, date_played)
      VALUES (?, ?, ?, NOW())
    `, [white_player_id, black_player_id, result]);
    res.json({ message: 'Game added' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add game', error: err.message });
  }
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
console.log("✅ Ek is regtig heel onder in server.js");