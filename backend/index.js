const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const sendEmail = require('./utils/mailer');  // Import the sendEmail function (from mailer.js)

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Set up MySQL connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'chess_user',
  password: 'chess_club_password',
  database: 'chess_club'
});

// Test if the server is working
app.get('/', (req, res) => {
  res.send('✅ Chess Club Backend is running!');
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: true });
  } catch (err) {
    res.status(500).json({ status: 'fail', db: false });
  }
});

// Get player data (including email)
app.get('/player/:id', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        u.id, u.username, u.role, u.avatar, u.email, u.is_available AS available,
        COALESCE(SUM(CASE 
          WHEN (g.result = '1-0' AND g.white_player_id = u.id) OR
               (g.result = '0-1' AND g.black_player_id = u.id)
          THEN 1 ELSE 0 END), 0) AS wins,
        COALESCE(SUM(CASE 
          WHEN (g.result = '0-1' AND g.white_player_id = u.id) OR
               (g.result = '1-0' AND g.black_player_id = u.id)
          THEN 1 ELSE 0 END), 0) AS losses,
        COALESCE(SUM(CASE WHEN g.result = '½-½' THEN 1 ELSE 0 END), 0) AS draws,
        COUNT(g.id) AS total_games,
        COALESCE(SUM(
          CASE 
            WHEN g.result = '1-0' AND g.white_player_id = u.id THEN 1
            WHEN g.result = '0-1' AND g.black_player_id = u.id THEN 1
            ELSE 0
          END
        ),0) AS points
      FROM users u
      LEFT JOIN games g ON u.id = g.white_player_id OR u.id = g.black_player_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [req.params.id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.json(results[0]);  // Return player data, including email
  } catch (err) {
    res.status(500).json({ message: 'Error loading player data', error: err.message });
  }
});


// Get game history for the player
app.get('/player/:id/games', async (req, res) => {
  try {
    const [games] = await db.query(`
      SELECT 
        g.id,
        wp.username AS white_player,
        bp.username AS black_player,
        g.result,
        g.date_played
      FROM games g
      JOIN users wp ON g.white_player_id = wp.id
      JOIN users bp ON g.black_player_id = bp.id
      WHERE g.white_player_id = ? OR g.black_player_id = ?
      ORDER BY g.date_played DESC
    `, [req.params.id, req.params.id]);  // Fetch games for the player by ID

    if (games.length === 0) {
      return res.status(404).json({ message: 'No games found for this player' });
    }

    res.json(games);  // Return the list of games
  } catch (err) {
    console.error('❌ Error fetching games:', err);
    res.status(500).json({ message: 'Error loading games', error: err.message });
  }
});


// User registration
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)', 
      [username, hashed, 'player', email]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering', error: err.message });
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

    res.json({ user: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Get player data
// Get game history for the player
app.get('/player/:id/games', async (req, res) => {
  try {
    const [games] = await db.query(`
      SELECT 
        g.id,
        wp.username AS white_player,
        bp.username AS black_player,
        g.result,
        g.date_played
      FROM games g
      JOIN users wp ON g.white_player_id = wp.id
      JOIN users bp ON g.black_player_id = bp.id
      WHERE g.white_player_id = ? OR g.black_player_id = ?
      ORDER BY g.date_played DESC
    `, [req.params.id, req.params.id]);  // Fetch games for the player by ID

    if (games.length === 0) {
      return res.status(404).json({ message: 'No games found for this player' });
    }

    res.json(games);  // Return the list of games
  } catch (err) {
    console.error('❌ Error fetching games:', err);
    res.status(500).json({ message: 'Error loading games', error: err.message });
  }
});

// Challenge route: Send email notification to the challenged player
app.post('/challenge', async (req, res) => {
  const { challengerId, challengedId } = req.body;  // Get the challenge details (IDs)

  try {
    // Fetch player details for the challenged player (the one being challenged)
    const [challengedPlayer] = await db.query('SELECT email, username FROM users WHERE id = ?', [challengedId]);

    if (challengedPlayer.length > 0) {
      // Prepare the email details
      const email = challengedPlayer[0].email;  // Get the email address of the challenged player
      const subject = 'You Have Received a Challenge!';
      const text = `Hello ${challengedPlayer[0].username},\n\nYou have received a challenge! Please log in to accept or decline.\n\nBest regards,\nChess Club`;

      // Send the email to the challenged player
      sendEmail(email, subject, text);  // This sends the email
    }

    res.status(200).json({ message: 'Challenge sent and email notification triggered!' });
  } catch (err) {
    console.error('❌ Error processing challenge:', err);
    res.status(500).json({ message: 'Error processing challenge' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
