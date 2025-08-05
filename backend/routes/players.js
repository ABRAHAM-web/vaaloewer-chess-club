// backend/routes/players.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all players (for admin use in AddGameForm)
router.get('/', async (req, res) => {
  try {
    const [players] = await pool.query(`
      SELECT id, username FROM users WHERE role = 'player'
    `);
    res.json(players);
  } catch (err) {
    console.error('❌ Failed to fetch players:', err);
    res.status(500).json({ message: 'Failed to load players' });
  }
});



// GET player standings
router.get('/standings', async (req, res) => {
  try {
    const [players] = await pool.query(`
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

// GET player info by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
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

// GET games of player by ID
router.get('/:id/games', async (req, res) => {
  try {
    const [games] = await pool.query(`
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

// PUT update player info
// PUT update existing user
// PUT update player info
router.put('/:id', async (req, res) => {
  const { email, avatar, is_available, role } = req.body;

  if (!email || typeof is_available === 'undefined') {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await pool.query(`
      UPDATE users 
      SET email = ?, avatar = ?, is_available = ?, role = ?
      WHERE id = ?
    `, [email, avatar || null, is_available ? 1 : 0, role, req.params.id]);

    const [updated] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    res.json(updated[0]); // ✅ important
  } catch (err) {
    res.status(500).json({ message: 'Failed to update player', error: err.message });
  }
});



export default router;
