// backend/routes/challenges.js
import express from 'express';
import pool from '../db.js';



const router = express.Router();

// ✅ Send a challenge to another player
router.post('/send', async (req, res) => {
  const { challenger_id, challenged_id } = req.body;
  try {
    if (!challenger_id || !challenged_id) {
      return res.status(400).json({ message: 'Missing challenger or challenged ID' });
    }

    await pool.query(
      `INSERT INTO challenges (challenger_id, challenged_id, status, date_created)
       VALUES (?, ?, 'pending', NOW())`,
      [challenger_id, challenged_id]
    );

    res.status(201).json({ message: 'Challenge sent' });
  } catch (err) {
    console.error('❌ Error sending challenge:', err);
    res.status(500).json({ message: 'Error sending challenge', error: err.message });
  }
});

// ✅ Get pending challenges for a user
router.get('/pending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [challenges] = await pool.query(
      `SELECT c.*, u.username AS challenger_name
       FROM challenges c
       JOIN users u ON c.challenger_id = u.id
       WHERE c.challenged_id = ? AND c.status = 'pending'`,
      [userId]
    );
    res.json(challenges);
  } catch (err) {
    console.error('❌ Error loading pending challenges:', err);
    res.status(500).json({ message: 'Failed to load challenges', error: err.message });
  }
});

// ✅ Accept or Decline a challenge
router.put('/:id/respond', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await pool.query(`UPDATE challenges SET status = ? WHERE id = ?`, [status, id]);
    res.json({ message: `Challenge ${status}` });
  } catch (err) {
    console.error('❌ Failed to update challenge status:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});




export default router;
