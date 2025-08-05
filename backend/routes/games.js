// backend/routes/games.js
import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all games (admin view)
router.get('/', async (req, res) => {
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
    res.status(500).json({ message: 'Failed to load games ek se', error: err.message });
  }
});

// POST a new game (admin adds game)
router.post('/', async (req, res) => {
  const { white_player_id, black_player_id, result } = req.body;

  if (!white_player_id || !black_player_id || !result) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await db.query(`
      INSERT INTO games (white_player_id, black_player_id, result, date_played)
      VALUES (?, ?, ?, NOW())
    `, [white_player_id, black_player_id, result]);

    res.status(201).json({ message: 'Game added successfully' });
  } catch (err) {
    console.error('❌ Failed to insert game:', err);
    res.status(500).json({ message: 'Failed to add game', error: err.message });
  }
});




export default router;
