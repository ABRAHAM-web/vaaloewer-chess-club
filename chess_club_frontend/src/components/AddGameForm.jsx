// src/components/AddGameForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddGameForm() {
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    player1: '',
    player2: '',
    result: 'draw',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch list of players from backend
    axios.get('http://localhost:3001/admin/players')
      .then((res) => {
        setPlayers(res.data);
      })
      .catch((err) => {
        console.error('Error fetching players:', err);
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
      const res = await axios.post('http://localhost:3001/admin/add-game', formData);
      setMessage('✅ Game added successfully!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to add game');
    }
  };

  return (
    <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
      <h3>Add New Game</h3>
      <form onSubmit={handleSubmit}>
        <select name="player1" value={formData.player1} onChange={handleChange} required>
          <option value="">Select Player 1</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.username}</option>)}
        </select>
        {' '}vs{' '}
        <select name="player2" value={formData.player2} onChange={handleChange} required>
          <option value="">Select Player 2</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.username}</option>)}
        </select>
        <br /><br />
        <label>Result: </label>
        <select name="result" value={formData.result} onChange={handleChange}>
          <option value="player1">Player 1 Wins</option>
          <option value="player2">Player 2 Wins</option>
          <option value="draw">Draw</option>
        </select>
        <br /><br />
        <button type="submit">Add Game</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddGameForm;
