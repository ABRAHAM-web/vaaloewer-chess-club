import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddGameForm({ onGameAdded }) {
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    player1: '',
    player2: '',
    result: '1-0'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/admin/players')
      .then((res) => {
        console.log('✅ Players loaded:', res.data);
        setPlayers(res.data);
      })
      .catch((err) => {
        console.error('⚠️ Error fetching players:', err);
        setMessage('⚠️ Could not load players');
      });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.player1 === formData.player2) {
      setMessage('⚠️ Players must be different');
      return;
    }

    try {
      await axios.post('http://localhost:3001/admin/games', {
        white_player_id: formData.player1,
        black_player_id: formData.player2,
        result: formData.result
      });
      setMessage('✅ Game added successfully!');
      setFormData({ player1: '', player2: '', result: '1-0' });

      // 🚀 Tell parent to refresh
      if (onGameAdded) onGameAdded();

    } catch (err) {
      console.error('❌ Server error:', err);
      setMessage('❌ Failed to add game');
    }
  };

  return (
    <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
      <h3>Add New Game</h3>
      <form onSubmit={handleSubmit}>
        <select name="player1" value={formData.player1} onChange={handleChange} required>
          <option value="">Select Player 1 (white)</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.username}</option>)}
        </select>
        {' '}vs{' '}
        <select name="player2" value={formData.player2} onChange={handleChange} required>
          <option value="">Select Player 2 (black)</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.username}</option>)}
        </select>
        <br /><br />
        <label>Result: </label>
        <select name="result" value={formData.result} onChange={handleChange}>
          <option value="1-0">1-0 (white wins)</option>
          <option value="0-1">0-1 (black wins)</option>
          <option value="½-½">½-½ (draw)</option>
        </select>
        <br /><br />
        <button type="submit">Add Game</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddGameForm;
