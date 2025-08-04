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



export default router;
