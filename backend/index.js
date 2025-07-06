const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
    res.send('✅ Chess Club Backend is running!');
});

// Health check
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok', db: true });
    } catch (err) {
        console.error('❌ DB connection failed:', err);
        res.status(500).json({ status: 'fail', db: false });
    }
});

// GET all players (using your users table)
app.get('/admin/players', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username FROM users');
        res.json(rows);
    } catch (err) {
        console.error('❌ Error fetching players:', err);
        res.status(500).json({ message: 'Error fetching players' });
    }
});

// POST add new game
app.post('/admin/games', async (req, res) => {
    const { white_player_id, black_player_id, result } = req.body;

    if (!white_player_id || !black_player_id || !result) {
        return res.status(400).json({ message: 'Missing game data' });
    }

    // Validate ENUM
    const allowedResults = ['1-0', '0-1', '½-½'];
    if (!allowedResults.includes(result)) {
        return res.status(400).json({ message: 'Invalid result format' });
    }

    try {
        const [resultData] = await db.query(
            `INSERT INTO games (white_player_id, black_player_id, result)
             VALUES (?, ?, ?)`,
            [white_player_id, black_player_id, result]
        );
        console.log('✅ New game added with ID:', resultData.insertId);
        res.json({ message: 'Game added', gameId: resultData.insertId });
    } catch (err) {
        console.error('❌ Error inserting game:', err);
        res.status(500).json({ message: 'Error adding game', error: err.message });
    }
});

// GET all games for admin dashboard
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
        console.error('❌ Error fetching games:', err);
        res.status(500).json({ message: 'Error fetching games', error: err.message });
    }
});

app.get('/players/standings', async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.id, 
        u.username,
        COALESCE(SUM(
          CASE 
            WHEN g.result = '1-0' AND g.white_player_id = u.id THEN 1
            WHEN g.result = '0-1' AND g.black_player_id = u.id THEN 1
            ELSE 0
          END
        ),0) AS points
      FROM users u
      LEFT JOIN games g ON u.id = g.white_player_id OR u.id = g.black_player_id
      GROUP BY u.id
      ORDER BY points DESC, u.username ASC
    `;

    const [results] = await db.query(sql);  // <-- async/await
    res.json(results);
  } catch (err) {
    console.error('❌ Error fetching standings:', err);
    res.status(500).json({ message: 'DB error', error: err });
  }
});

app.post('/register', async (req, res) => {
  console.log('🚀 /register endpoint hit with:', req.body);

  const { username, password } = req.body;

  try {
    console.log('🔍 Running user check query...');
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    console.log('✅ User check results:', results);

    if (results.length > 0) {
      console.log('⚠️ Username already exists');
      return res.status(409).json({ message: 'Username already exists' });
    }

    console.log('🔑 Hashing password...');
    const hashed = await bcrypt.hash(password, 10);

    console.log('📝 Inserting new user...');
    const [insertResult] = await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashed, 'player']
    );

    console.log(`✅ User ${username} registered with ID: ${insertResult.insertId}`);
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('❌ Error in /register:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


app.post('/login', async (req, res) => {
  console.log('🚀 /login endpoint hit with:', req.body);
  const { username, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    console.log('🔍 Login user lookup:', users);

    if (users.length === 0) {
      console.log('⚠️ No user found');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('⚠️ Password does not match');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    console.log(`✅ User ${username} authenticated`);
    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (err) {
    console.error('❌ Error in /login:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


app.get('/player/:id/games', async (req, res) => {
  const playerId = req.params.id;

  try {
    const [results] = await db.query(`
      SELECT g.id, 
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
    `, [playerId, playerId, playerId]);

    res.json(results);
  } catch (err) {
    console.error('❌ Error fetching player games:', err);
    res.status(500).json({ message: 'Error fetching player games', error: err.message });
  }
});



// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
