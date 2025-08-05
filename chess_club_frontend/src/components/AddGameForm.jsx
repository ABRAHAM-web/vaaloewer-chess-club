import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddGameForm({ onGameAdded }) {
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    white_player_id: '',
    black_player_id: '',
    result: '1-0',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/players')
      .then(res => {
        console.log('✅ Players loaded:', res.data);
        setPlayers(res.data);
      })
      .catch(err => console.error('⚠️ Error fetching players:', err));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.white_player_id === formData.black_player_id) {
      setMessage('⚠️ Players must be different');
      return;
    }

    try {
      const payload = {
        white_player_id: parseInt(formData.white_player_id),
        black_player_id: parseInt(formData.black_player_id),
        result: formData.result
      };
      await axios.post('http://localhost:3001/games/', payload);
      setMessage('✅ Game added successfully!');
      setFormData({
        white_player_id: '',
        black_player_id: '',
        result: '1-0'
      });

      if (onGameAdded) onGameAdded(); // 🔥 refresh the game list
    } catch (err) {
      console.error('❌ Server error:', err);
      setMessage('❌ Failed to add game');
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
      <h3>Add New Game</h3>
      <form onSubmit={handleSubmit}>
        <select 
          name="white_player_id" 
          value={formData.white_player_id} 
          onChange={handleChange} 
          required
        >
          <option value="">Select White Player</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.username}</option>
          ))}
        </select>
        {' '}vs{' '}
        <select 
          name="black_player_id" 
          value={formData.black_player_id} 
          onChange={handleChange} 
          required
        >
          <option value="">Select Black Player</option>
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
          <option value="1-0">White Wins (1-0)</option>
          <option value="0-1">Black Wins (0-1)</option>
          <option value="½-½">Draw (½-½)</option>
        </select>
        <br /><br />
        <button type="submit">Add Game</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddGameForm;
