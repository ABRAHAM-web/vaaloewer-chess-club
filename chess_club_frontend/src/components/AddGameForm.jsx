// src/components/AddGameForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddGameForm() {
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    player1: '',
    player2: '',
    result: '½-½',
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
        setMessage('⚠️ Failed to load players');
      });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.player1 === formData.player2) {
      setMessage('⚠️ Players must be different');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3001/admin/games', {
        white_player_id: Number(formData.player1),
        black_player_id: Number(formData.player2),
        result: formData.result,
      });

      console.log('✅ Game saved:', res.data);
      setMessage('✅ Game added successfully!');
    } catch (err) {
      if (err.response) {
        console.error('❌ Server responded with error:', err.response.data);
        setMessage(`❌ ${err.response.data.message} - ${err.response.data.error || ''}`);
      } else {
        console.error('❌ Request failed:', err.message);
        setMessage('❌ Failed to connect to server');
      }
    }
  };

  return (
    <div style={{
      background: '#f0f0f0',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <h3>Add New Game</h3>
      <form onSubmit={handleSubmit}>
        <label>Player 1 (White):</label>
        <select
          name="player1"
          value={formData.player1}
          onChange={handleChange}
          required
        >
          <option value="">Select Player 1</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.username}</option>
          ))}
        </select>

        {' '}vs{' '}

        <label>Player 2 (Black):</label>
        <select
          name="player2"
          value={formData.player2}
          onChange={handleChange}
          required
        >
          <option value="">Select Player 2</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.username}</option>
          ))}
        </select>

        <br /><br />

        <label>Result: </label>
        <select
          name="result"
          value={formData.result}
          onChange={handleChange}
        >
          <option value="1-0">Player 1 Wins</option>
          <option value="0-1">Player 2 Wins</option>
          <option value="½-½">Draw</option>
        </select>

        <br /><br />

        <button type="submit">Add Game</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AddGameForm;
